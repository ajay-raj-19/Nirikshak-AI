import requests
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://mplads.mospi.gov.in/rest/PreLoginDashboardData"
HEADERS = {"Content-Type": "application/json; charset=UTF-8"}

s = requests.Session()
s.headers.update(HEADERS)

print("1. Fetching all states and constituencies...")
states = s.post(f"{BASE_URL}/getStateData", json={}).json()
all_constituencies = []
for st in states:
    sid = st["STATE_ID"]
    sname = st["STATE_NAME"]
    cs = s.post(f"{BASE_URL}/getConstituencyData", json={"id": str(sid)}).json()
    for c in cs:
        all_constituencies.append({
            "state_id": sid,
            "state_name": sname,
            "const_id": c["ID"],
            "const_name": c["CAPTION"]
        })

print(f"Fetched {len(all_constituencies)} constituencies.")

def fetch_mp_for_const(c, tenure_id, house_type=2):
    combo = f"{c['state_id']},{c['const_id']},0,{house_type},{tenure_id}"
    try:
        r = s.post(f"{BASE_URL}/getTilesReportData", json={
            "combo": combo,
            "key": "Allocated Limit for Hon'ble MPs"
        }, timeout=10)
        raw = r.json()
        if isinstance(raw, str):
            data = json.loads(raw)
        elif isinstance(raw, dict):
            data = []
            for v in raw.values():
                if isinstance(v, str):
                    try:
                        data = json.loads(v)
                        break
                    except:
                        pass
        else:
            data = raw
            
        if isinstance(data, list) and len(data) > 0:
            for row in data:
                if "MP_NAME" in row:
                    return {
                        "state_name": c["state_name"],
                        "const_name": c["const_name"],
                        "mp_name": row["MP_NAME"],
                        "tenure": row.get("TENURE"),
                        "allocated_amt": row.get("ALLOCATED_AMT")
                    }
    except Exception as e:
        return None
    return None

results_18 = []
results_17 = []

print("2. Fetching 18th Lok Sabha MPs in parallel (543 constituencies)...")
t0 = time.time()
with ThreadPoolExecutor(max_workers=25) as executor:
    future_to_const = {executor.submit(fetch_mp_for_const, c, 7): c for c in all_constituencies}
    for future in as_completed(future_to_const):
        res = future.result()
        if res:
            results_18.append(res)
print(f"Completed 18th Lok Sabha in {time.time()-t0:.2f}s, obtained {len(results_18)} MPs.")

print("3. Fetching 17th Lok Sabha MPs in parallel (543 constituencies)...")
t0 = time.time()
with ThreadPoolExecutor(max_workers=25) as executor:
    future_to_const = {executor.submit(fetch_mp_for_const, c, 5): c for c in all_constituencies}
    for future in as_completed(future_to_const):
        res = future.result()
        if res:
            results_17.append(res)
print(f"Completed 17th Lok Sabha in {time.time()-t0:.2f}s, obtained {len(results_17)} MPs.")

# Also fetch Rajya Sabha MPs
print("4. Fetching Rajya Sabha MPs...")
rs_mps = []
for st in states:
    sid = st["STATE_ID"]
    sname = st["STATE_NAME"]
    try:
        mps = s.post(f"{BASE_URL}/getMpNamesData", json={"state_combo": f"{sid},1,7"}).json()
        if isinstance(mps, list):
            for m in mps:
                rs_mps.append({
                    "state_name": sname,
                    "const_name": f"{sname} (Rajya Sabha Nodal District)",
                    "mp_name": m["CAPTION"],
                    "tenure": "Rajya Sabha"
                })
    except:
        pass
print(f"Fetched {len(rs_mps)} Rajya Sabha MPs.")

output = {
    "18th_lok_sabha": results_18,
    "17th_lok_sabha": results_17,
    "rajya_sabha": rs_mps
}

with open("scratch/official_mospi_mappings.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)

print("Saved official mappings to scratch/official_mospi_mappings.json!")
