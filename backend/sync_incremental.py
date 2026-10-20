"""sync_incremental.py

Incremental Synchronization Pipeline.
Fetches active 18th Lok Sabha and Rajya Sabha data.
Uses MD5 hashing to detect deltas and only inserts/updates new or changed records.
Multi-threaded per-state execution with atomic state flushes and safe amount coalescing.
"""

import os
import json
import time
import hashlib
import requests
from requests.adapters import HTTPAdapter
import psycopg2
import psycopg2.extras
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime
from tqdm import tqdm
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib3

from backend.database import get_connection

# ---------------------------------------------------------------------------
# Constants & Config
# ---------------------------------------------------------------------------
BASE_URL = "https://mplads.mospi.gov.in/rest/PreLoginDashboardData"
HEADERS = {
    "Content-Type": "application/json; charset=UTF-8",
    "Origin": "https://mplads.mospi.gov.in",
    "Referer": "https://mplads.mospi.gov.in/digigov/dashboard.html",
    "X-Requested-With": "XMLHttpRequest",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)
adapter = HTTPAdapter(pool_connections=25, pool_maxsize=25, max_retries=3)
SESSION.mount("https://", adapter)
SESSION.mount("http://", adapter)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def parse_date(date_str: Optional[str]) -> Optional[str]:
    if not date_str or str(date_str).strip() == "":
        return None
    for fmt in ("%d-%b-%Y", "%b %d, %Y %I:%M:%S %p", "%Y-%m-%d"):
        try:
            return datetime.strptime(str(date_str).strip(), fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def gen_hash(*args) -> str:
    """Generate MD5 hash from a list of arguments."""
    hash_str = "_".join(str(a) for a in args)
    return hashlib.md5(hash_str.encode()).hexdigest()

# ---------------------------------------------------------------------------
# Resilient API Wrappers
# ---------------------------------------------------------------------------
@retry(wait=wait_exponential(multiplier=1, min=2, max=10), stop=stop_after_attempt(5), 
       retry=retry_if_exception_type((requests.exceptions.RequestException, json.JSONDecodeError)))
def resilient_post(url: str, payload: dict) -> dict:
    resp = SESSION.post(url, json=payload, timeout=30, verify=False)
    resp.raise_for_status()
    raw = resp.json()
    if isinstance(raw, str):
        return json.loads(raw)
    return raw

def fetch_states() -> List[dict]:
    return resilient_post(f"{BASE_URL}/getStateData", {})

def fetch_constituencies(state_id: int) -> List[dict]:
    return resilient_post(f"{BASE_URL}/getConstituencyData", {"id": str(state_id)})

def fetch_mp_names(state_combo: str) -> List[dict]:
    return resilient_post(f"{BASE_URL}/getMpNamesData", {"state_combo": state_combo})

def fetch_tile_report(combo: str, key: str) -> list:
    raw = resilient_post(f"{BASE_URL}/getTilesReportData", {"combo": combo, "key": key})
    if isinstance(raw, dict):
        for v in raw.values():
            if isinstance(v, str):
                try:
                    return json.loads(v)
                except (json.JSONDecodeError, TypeError):
                    pass
        return [raw]
    return raw if isinstance(raw, list) else []

# ---------------------------------------------------------------------------
# Database Operations
# ---------------------------------------------------------------------------
def flush_batch(cur, conn, mps_to_insert, new_works, updated_works, new_allocs, updated_allocs, new_exps, updated_exps):
    """Safely flush and commit collected records to PostgreSQL with COALESCE."""
    # 0. Ensure all parent MP records exist to satisfy foreign key constraints
    if mps_to_insert:
        psycopg2.extras.execute_values(cur, """
            INSERT INTO mps (mp_id, mp_name, constituency_id, house_type, tenure)
            VALUES %s
            ON CONFLICT (mp_id, house_type, tenure) DO UPDATE SET
                mp_name = COALESCE(EXCLUDED.mp_name, mps.mp_name),
                constituency_id = COALESCE(EXCLUDED.constituency_id, mps.constituency_id)
        """, mps_to_insert, page_size=500)

    # 1. Insert New Works
    if new_works:
        psycopg2.extras.execute_values(cur, """
            INSERT INTO works (
                work_id, activity_name, work_description, work_category, mp_id, house_type, tenure,
                constituency_id, state_id, ida_name, letter_no, recommended_amount, sanction_amount, actual_amount,
                recommendation_date, sanction_date, actual_end_date, work_stage, work_status, average_rating, flag, record_hash
            ) VALUES %s 
            ON CONFLICT (work_id) DO UPDATE SET
                activity_name = COALESCE(EXCLUDED.activity_name, works.activity_name),
                work_description = COALESCE(EXCLUDED.work_description, works.work_description),
                work_category = COALESCE(EXCLUDED.work_category, works.work_category),
                mp_id = COALESCE(EXCLUDED.mp_id, works.mp_id),
                house_type = COALESCE(EXCLUDED.house_type, works.house_type),
                tenure = COALESCE(EXCLUDED.tenure, works.tenure),
                constituency_id = COALESCE(EXCLUDED.constituency_id, works.constituency_id),
                state_id = COALESCE(EXCLUDED.state_id, works.state_id),
                ida_name = COALESCE(EXCLUDED.ida_name, works.ida_name),
                letter_no = COALESCE(EXCLUDED.letter_no, works.letter_no),
                recommended_amount = COALESCE(EXCLUDED.recommended_amount, works.recommended_amount),
                sanction_amount = COALESCE(EXCLUDED.sanction_amount, works.sanction_amount, EXCLUDED.actual_amount, EXCLUDED.recommended_amount),
                actual_amount = COALESCE(EXCLUDED.actual_amount, works.actual_amount),
                recommendation_date = COALESCE(EXCLUDED.recommendation_date, works.recommendation_date),
                sanction_date = COALESCE(EXCLUDED.sanction_date, works.sanction_date),
                actual_end_date = COALESCE(EXCLUDED.actual_end_date, works.actual_end_date),
                work_stage = COALESCE(EXCLUDED.work_stage, works.work_stage),
                work_status = COALESCE(EXCLUDED.work_status, works.work_status),
                average_rating = COALESCE(EXCLUDED.average_rating, works.average_rating),
                flag = COALESCE(EXCLUDED.flag, works.flag),
                record_hash = EXCLUDED.record_hash,
                updated_at = CURRENT_TIMESTAMP
        """, new_works, page_size=500)

    # 2. Update Existing Works
    if updated_works:
        psycopg2.extras.execute_values(cur, """
            UPDATE works SET 
                activity_name = COALESCE(e.activity_name, works.activity_name),
                work_description = COALESCE(e.work_description, works.work_description),
                work_category = COALESCE(e.work_category, works.work_category),
                mp_id = COALESCE(e.mp_id, works.mp_id),
                house_type = COALESCE(e.house_type, works.house_type),
                tenure = COALESCE(e.tenure, works.tenure),
                constituency_id = COALESCE(e.constituency_id, works.constituency_id),
                state_id = COALESCE(e.state_id, works.state_id),
                ida_name = COALESCE(e.ida_name, works.ida_name),
                letter_no = COALESCE(e.letter_no, works.letter_no),
                recommended_amount = COALESCE(e.recommended_amount, works.recommended_amount),
                sanction_amount = COALESCE(e.sanction_amount, works.sanction_amount, e.actual_amount, e.recommended_amount),
                actual_amount = COALESCE(e.actual_amount, works.actual_amount),
                recommendation_date = COALESCE(CAST(e.recommendation_date AS DATE), works.recommendation_date),
                sanction_date = COALESCE(CAST(e.sanction_date AS DATE), works.sanction_date),
                actual_end_date = COALESCE(CAST(e.actual_end_date AS DATE), works.actual_end_date),
                work_stage = COALESCE(e.work_stage, works.work_stage),
                work_status = COALESCE(e.work_status, works.work_status),
                average_rating = COALESCE(e.average_rating, works.average_rating),
                flag = COALESCE(e.flag, works.flag),
                record_hash = e.record_hash,
                updated_at = CURRENT_TIMESTAMP
            FROM (VALUES %s) AS e(
                activity_name, work_description, work_category, mp_id, house_type, tenure, constituency_id, state_id,
                ida_name, letter_no, recommended_amount, sanction_amount, actual_amount, recommendation_date, sanction_date,
                actual_end_date, work_stage, work_status, average_rating, flag, record_hash, work_id
            ) WHERE works.work_id = e.work_id
        """, updated_works, page_size=500, template="(%s, %s, %s, %s::int, %s::int, %s, %s::int, %s::int, %s, %s, %s::numeric, %s::numeric, %s::numeric, %s::date, %s::date, %s::date, %s, %s, %s::real, %s::int, %s, %s::int)")

    # 3. Allocations
    if new_allocs:
        psycopg2.extras.execute_values(cur, """
            INSERT INTO mp_allocations (mp_id, house_type, tenure, allocated_amount, house_name, record_hash)
            VALUES %s ON CONFLICT DO NOTHING
        """, new_allocs, page_size=500)

    if updated_allocs:
        psycopg2.extras.execute_values(cur, """
            UPDATE mp_allocations SET 
                allocated_amount = e.allocated_amount,
                house_name = e.house_name,
                record_hash = e.record_hash,
                updated_at = CURRENT_TIMESTAMP
            FROM (VALUES %s) AS e(mp_id, house_type, tenure, allocated_amount, house_name, record_hash)
            WHERE mp_allocations.mp_id = CAST(e.mp_id AS INTEGER) 
              AND mp_allocations.house_type = CAST(e.house_type AS INTEGER) 
              AND mp_allocations.tenure = e.tenure
        """, updated_allocs, page_size=500)

    # 4. Vendors & Expenditures
    unique_vendors = {rec[1] for rec in new_exps} | {rec[9] for rec in updated_exps}
    if unique_vendors:
        psycopg2.extras.execute_values(cur, "INSERT INTO vendors (vendor_id, vendor_name) VALUES %s ON CONFLICT (vendor_id) DO NOTHING", [(v, f"Vendor {v}") for v in unique_vendors], page_size=500)

    if new_exps:
        psycopg2.extras.execute_values(cur, """
            INSERT INTO expenditures (
                work_id, vendor_id, fund_disbursed_amount, expenditure_date, ia_name, mp_id, house_type, tenure, constituency, work_status, record_hash
            ) VALUES %s
        """, new_exps, page_size=500)

    if updated_exps:
        psycopg2.extras.execute_values(cur, """
            UPDATE expenditures SET 
                fund_disbursed_amount = e.fund_disbursed_amount,
                ia_name = e.ia_name,
                mp_id = e.mp_id,
                house_type = e.house_type,
                tenure = e.tenure,
                constituency = e.constituency,
                work_status = e.work_status,
                record_hash = e.record_hash,
                updated_at = CURRENT_TIMESTAMP,
                expenditure_date = CAST(e.exp_date AS DATE)
            FROM (VALUES %s) AS e(
                fund_disbursed_amount, ia_name, mp_id, house_type, tenure, constituency, work_status, record_hash, work_id, vendor_id, exp_date
            ) 
            WHERE expenditures.work_id = e.work_id 
              AND expenditures.vendor_id = e.vendor_id 
              AND expenditures.expenditure_date = e.exp_date
        """, updated_exps, page_size=500, template="(%s::numeric, %s, %s::int, %s::int, %s, %s, %s, %s, %s::int, %s::int, %s::date)")

    conn.commit()


def process_single_mp(mp_item: dict, state_id: int, constituencies: list, house_type: int, tenure_id: int, tenure_label: str, mp_const_map: dict, works_hashes: dict, alloc_hashes: dict, exp_hashes: dict):
    """Worker task that queries reports for one MP and categorizes new/updated items."""
    mp_id = mp_item["ID"]
    const_id = mp_const_map.get(mp_id) or (constituencies[0]["ID"] if constituencies else 0)
    combo = f"{state_id},{const_id},{mp_id},{house_type},{tenure_id}"
    
    mp_new_allocs, mp_updated_allocs = [], []
    mp_new_works, mp_updated_works = [], []
    mp_new_exps, mp_updated_exps = [], []
    
    alloc_inspected = alloc_skipped = alloc_new = alloc_updated = 0
    works_inspected = works_skipped = works_new = works_updated = 0
    exp_inspected = exp_skipped = exp_new = exp_updated = 0

    # 1. MP Allocations
    try:
        alloc_data = fetch_tile_report(combo, "Allocated Limit for Hon'ble MPs")
        if alloc_data:
            alloc = alloc_data[0]
            alloc_amt = alloc.get("ALLOCATED_AMT", 0)
            alloc_hash = gen_hash(mp_id, alloc_amt)
            alloc_inspected += 1
            key = f"{mp_id}_{house_type}_{tenure_label}"
            record = (mp_id, house_type, tenure_label, alloc_amt, "Lok Sabha" if house_type == 2 else "Rajya Sabha", alloc_hash)
            if key not in alloc_hashes:
                mp_new_allocs.append(record)
                alloc_new += 1
            elif alloc_hashes[key] != alloc_hash:
                mp_updated_allocs.append(record)
                alloc_updated += 1
            else:
                alloc_skipped += 1
    except Exception:
        pass

    # 2. Works
    tile_configs = [
        ("Works Recommended", "Recommended"),
        ("Works Sanctioned", "Sanctioned"),
        ("Works Completed", "Completed"),
    ]
    works_seen_this_mp = {}
    for tile_key, status_label in tile_configs:
        try:
            items = fetch_tile_report(combo, tile_key)
            for item in items:
                work_id = str(item.get("WORK_RECOMMENDATION_DTL_ID") or item.get("WORK_ID"))
                if not work_id or work_id == "None": continue
                rec_amt = item.get("RECOMMENDED_AMOUNT")
                act_amt = item.get("ACTUAL_AMOUNT")
                sanc_amt = item.get("SANCTION_AMOUNT") or act_amt or rec_amt
                end_date = parse_date(item.get("ACTUAL_END_DATE"))
                w_hash = gen_hash(work_id, sanc_amt, act_amt, status_label, end_date)
                if work_id not in works_seen_this_mp or status_label == "Completed" or (status_label == "Sanctioned" and works_seen_this_mp[work_id][1] == "Recommended"):
                    works_seen_this_mp[work_id] = (item, status_label, w_hash, sanc_amt, act_amt, rec_amt)
        except Exception:
            pass

    for work_id, (item, status_label, w_hash, sanc_amt, act_amt, rec_amt) in works_seen_this_mp.items():
        works_inspected += 1
        record = (
            work_id, item.get("ACTIVITY_NAME"), item.get("WORK_DESCRIPTION"), item.get("WORK_CATEGORY"),
            mp_id, house_type, tenure_label, const_id, state_id, item.get("IDA_NAME"), item.get("LETTER_NO"),
            rec_amt, sanc_amt, act_amt,
            parse_date(item.get("RECOMMENDATION_DATE")), parse_date(item.get("SANCTION_DATE")), parse_date(item.get("ACTUAL_END_DATE")),
            item.get("WORK_STAGE"), status_label, item.get("AVERAGE_RATING"), item.get("FLAG"), w_hash
        )
        if work_id not in works_hashes:
            mp_new_works.append(record)
            works_new += 1
        elif works_hashes[work_id] != w_hash:
            mp_updated_works.append((
                item.get("ACTIVITY_NAME"), item.get("WORK_DESCRIPTION"), item.get("WORK_CATEGORY"),
                mp_id, house_type, tenure_label, const_id, state_id, item.get("IDA_NAME"), item.get("LETTER_NO"),
                rec_amt, sanc_amt, act_amt,
                parse_date(item.get("RECOMMENDATION_DATE")), parse_date(item.get("SANCTION_DATE")), parse_date(item.get("ACTUAL_END_DATE")),
                item.get("WORK_STAGE"), status_label, item.get("AVERAGE_RATING"), item.get("FLAG"), w_hash, work_id
            ))
            works_updated += 1
        else:
            works_skipped += 1

    # 3. Expenditures
    try:
        exp_items = fetch_tile_report(combo, "Expenditure on Completed and On-going Works as on Date")
        for item in exp_items:
            str_id = str(item.get("WORK_RECOMMENDATION_DTL_ID") or item.get("WORK_ID", ""))
            work_id = str_id.split("-")[-1] if "-" in str_id else str_id.split("/")[-1]
            vendor_id = str(item.get("VENDOR_ID"))
            exp_date = parse_date(item.get("EXPENDITURE_DATE"))
            if not work_id or not vendor_id: continue
            disbursed = item.get("FUND_DISBURSED_AMT")
            w_status = item.get("WORK_STATUS")
            e_hash = gen_hash(work_id, vendor_id, disbursed, w_status)
            key = f"{work_id}_{vendor_id}_{exp_date}"
            exp_inspected += 1
            record = (
                work_id, vendor_id, disbursed, exp_date, item.get("IA_NAME"),
                mp_id, house_type, tenure_label, item.get("CONSTITUENCY", ""), w_status, e_hash
            )
            if key not in exp_hashes:
                mp_new_exps.append(record)
                exp_new += 1
            elif exp_hashes[key] != e_hash:
                mp_updated_exps.append((
                    disbursed, item.get("IA_NAME"), mp_id, house_type, tenure_label, 
                    item.get("CONSTITUENCY", ""), w_status, e_hash, work_id, vendor_id, exp_date
                ))
                exp_updated += 1
            else:
                exp_skipped += 1
    except Exception:
        pass

    stats = {
        "allocations": {"inspected": alloc_inspected, "skipped": alloc_skipped, "new": alloc_new, "updated": alloc_updated},
        "works": {"inspected": works_inspected, "skipped": works_skipped, "new": works_new, "updated": works_updated},
        "expenditures": {"inspected": exp_inspected, "skipped": exp_skipped, "new": exp_new, "updated": exp_updated},
    }
    return (mp_new_allocs, mp_updated_allocs, mp_new_works, mp_updated_works, mp_new_exps, mp_updated_exps, stats)

# ---------------------------------------------------------------------------
# Main Sync Logic
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("NIRIKSHAK AI - FAST INCREMENTAL DELTA SYNC")
    print("=" * 60)
    start_time = time.time()
    
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    conn = get_connection()
    cur = conn.cursor()

    # Preload Hashes and MP Constituency Map
    print("Preloading hashes into memory...")
    cur.execute("SELECT work_id, record_hash FROM works")
    works_hashes = {str(row[0]): row[1] for row in cur.fetchall()}
    
    cur.execute("SELECT mp_id, house_type, tenure, record_hash FROM mp_allocations")
    alloc_hashes = {f"{row[0]}_{row[1]}_{row[2]}": row[3] for row in cur.fetchall()}
    
    cur.execute("SELECT work_id, vendor_id, expenditure_date, record_hash FROM expenditures")
    exp_hashes = {f"{row[0]}_{row[1]}_{row[2]}": row[3] for row in cur.fetchall()}

    cur.execute("SELECT mp_id, constituency_id FROM mps WHERE constituency_id IS NOT NULL")
    mp_const_map = {row[0]: row[1] for row in cur.fetchall()}

    stats = {
        "works": {"inspected": 0, "skipped": 0, "new": 0, "updated": 0},
        "expenditures": {"inspected": 0, "skipped": 0, "new": 0, "updated": 0},
        "allocations": {"inspected": 0, "skipped": 0, "new": 0, "updated": 0},
    }

    print("Fetching master list of states...")
    states = fetch_states()
    
    # Target Active MPs Only: 18th LS (HOUSE=2, TENURE=7) and RS (HOUSE=1, TENURE=7)
    target_configs = [
        {"name": "18th Lok Sabha", "house_type": 2, "tenure_id": 7, "tenure_label": "18th Lok Sabha"},
        {"name": "Rajya Sabha", "house_type": 1, "tenure_id": 7, "tenure_label": "Rajya Sabha"}
    ]

    for config in target_configs:
        house_type = config["house_type"]
        tenure_id = config["tenure_id"]
        tenure_label = config["tenure_label"]
        
        for state_item in tqdm(states, desc=f"[{config['name']}] States"):
            state_id = state_item["STATE_ID"]
            
            # Constituencies (Fetch or simulate for RS)
            if house_type == 2:
                constituencies = fetch_constituencies(state_id)
            else:
                constituencies = [{"ID": -state_id, "CAPTION": f"{state_item['STATE_NAME']} (Rajya Sabha Nodal District)"}]
                
            combo_mp_names = f"{state_id},{house_type},{tenure_id}"
            mp_list = fetch_mp_names(combo_mp_names)
            if not mp_list:
                continue

            state_mps_to_insert = []
            for mp_item in mp_list:
                mp_id = mp_item["ID"]
                mp_name = mp_item.get("CAPTION", f"MP {mp_id}")
                cid = mp_const_map.get(mp_id) or (constituencies[0]["ID"] if constituencies else None)
                state_mps_to_insert.append((mp_id, mp_name, cid, house_type, tenure_label))

            state_new_works, state_updated_works = [], []
            state_new_allocs, state_updated_allocs = [], []
            state_new_exps, state_updated_exps = [], []

            # Concurrently fetch MPs within this state
            max_workers = min(8, max(1, len(mp_list)))
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = [
                    executor.submit(
                        process_single_mp, mp_item, state_id, constituencies, 
                        house_type, tenure_id, tenure_label, mp_const_map, 
                        works_hashes, alloc_hashes, exp_hashes
                    )
                    for mp_item in mp_list
                ]
                for fut in as_completed(futures):
                    try:
                        n_al, u_al, n_w, u_w, n_ex, u_ex, mp_stat = fut.result()
                        state_new_allocs.extend(n_al)
                        state_updated_allocs.extend(u_al)
                        state_new_works.extend(n_w)
                        state_updated_works.extend(u_w)
                        state_new_exps.extend(n_ex)
                        state_updated_exps.extend(u_ex)

                        for cat in ("works", "expenditures", "allocations"):
                            for k in ("inspected", "skipped", "new", "updated"):
                                stats[cat][k] += mp_stat[cat][k]
                    except Exception:
                        pass

            # Update local hash cache for newly flushed records
            for rec in state_new_works:
                works_hashes[str(rec[0])] = rec[-1]
            for rec in state_updated_works:
                works_hashes[str(rec[-1])] = rec[-2]
            for rec in state_new_allocs:
                alloc_hashes[f"{rec[0]}_{rec[1]}_{rec[2]}"] = rec[-1]
            for rec in state_updated_allocs:
                alloc_hashes[f"{rec[0]}_{rec[1]}_{rec[2]}"] = rec[-1]

            # Atomic flush to PostgreSQL per state
            flush_batch(cur, conn, state_mps_to_insert, state_new_works, state_updated_works, state_new_allocs, state_updated_allocs, state_new_exps, state_updated_exps)

    cur.close()
    conn.close()
    
    elapsed = int(time.time() - start_time)

    print("\n" + "=" * 60)
    print("INCREMENTAL SYNC SUMMARY")
    print("=" * 60)
    print(f"Time Elapsed: {elapsed} seconds")
    for category, stat in stats.items():
        print(f"\n{category.upper()}:")
        print(f"  Inspected: {stat['inspected']}")
        print(f"  Skipped (Unchanged): {stat['skipped']}")
        print(f"  New Inserted: {stat['new']}")
        print(f"  Existing Updated: {stat['updated']}")

if __name__ == "__main__":
    main()
