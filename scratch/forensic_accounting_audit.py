import pyarrow.parquet as pq
import pandas as pd
import json
import re

print("=== NIRIKSHAK AI FORENSIC ACCOUNTING AUDIT ===")

# 1. Load Parquet Data
mps = pq.read_table('AiData/mps.parquet').to_pandas()
works = pq.read_table('AiData/works.parquet').to_pandas()
exps = pq.read_table('AiData/expenditures.parquet').to_pandas()
alloc = pq.read_table('AiData/mp_allocations.parquet').to_pandas()

with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const CURRENT_18TH_MPS_DATA = (\[.*?\]);\n\nexport const RAJYA_SABHA_MPS_DATA', text, re.DOTALL)
current_mps = json.loads(match.group(1))

w18 = works[works['tenure'] == '18th Lok Sabha'].copy()
e18 = exps[exps['tenure'] == '18th Lok Sabha'].copy()

subset_cols = ['work_id', 'vendor_id', 'fund_disbursed_amount', 'expenditure_date', 'ia_name', 'constituency', 'work_status']

# Precompute e18 by work_id
e18_by_work = {}
for wid, grp in e18.groupby('work_id'):
    e18_by_work[wid] = grp

print(f"Total Sitting Members of 18th Lok Sabha: {len(current_mps)}")
print(f"Total 18th Lok Sabha Works: {len(w18):,}")
print(f"Total 18th Lok Sabha Recorded Disbursement Vouchers: {len(e18):,}")

results = []
for m in current_mps:
    mid = m['mpId']
    if not mid:
        continue
    m_w18 = w18[w18['mp_id'] == mid]
    w_ids = set(m_w18['work_id'])
    
    # Strictly match by work_id belonging to 18th Lok Sabha
    m_e_list = [e18_by_work[wid] for wid in w_ids if wid in e18_by_work]
    m_e = pd.concat(m_e_list, ignore_index=True) if m_e_list else pd.DataFrame(columns=e18.columns)
    
    rec_count = len(m_w18)
    done_count = len(m_w18[m_w18['work_status'] == 'Completed'])
    sanc_val = m_w18['sanction_amount'].fillna(0).astype(float).sum()
    act_val = m_w18[m_w18['work_status'] == 'Completed']['actual_amount'].fillna(0).astype(float).sum()
    
    disb_raw_val = m_e['fund_disbursed_amount'].sum() if len(m_e) > 0 else 0.0
    
    dup_mask = m_e.duplicated(subset=subset_cols, keep='first') if len(m_e) > 0 else pd.Series(dtype=bool)
    dup_count = int(dup_mask.sum())
    dup_val = m_e[dup_mask]['fund_disbursed_amount'].sum() if dup_count > 0 else 0.0
    disb_reconciled_val = disb_raw_val - dup_val
    
    sanc_cr = round(sanc_val / 1e7, 2)
    act_cr = round(act_val / 1e7, 2)
    disb_raw_cr = round(disb_raw_val / 1e7, 2)
    disb_rec_cr = round(disb_reconciled_val / 1e7, 2)
    dup_cr = round(dup_val / 1e7, 2)
    
    disb_ratio = round((disb_raw_cr / sanc_cr) * 100, 1) if sanc_cr > 0 else None
    disb_rec_ratio = round((disb_rec_cr / sanc_cr) * 100, 1) if sanc_cr > 0 else None
    
    reconcil_needed = (disb_ratio is not None and disb_ratio > 100) or (dup_count > 0)
    
    results.append({
        'name': m['name'],
        'mpId': mid,
        'constituency': m['constituency'],
        'state': m['state'],
        'party': m['party'],
        'works': rec_count,
        'completed': done_count,
        'sanc_cr': sanc_cr,
        'act_cr': act_cr,
        'disb_raw_cr': disb_raw_cr,
        'disb_rec_cr': disb_rec_cr,
        'dup_count': dup_count,
        'dup_cr': dup_cr,
        'disb_ratio': disb_ratio,
        'disb_rec_ratio': disb_rec_ratio,
        'reconcil_needed': reconcil_needed
    })

df_res = pd.DataFrame(results)

print("\n--- NATIONAL AGGREGATES ACROSS 540 CURRENT 18TH MPS ---")
print(f"Total Sanctioned Works Value:        Rs. {df_res['sanc_cr'].sum():,.2f} Cr")
print(f"Total Actual Certified Expenditure:  Rs. {df_res['act_cr'].sum():,.2f} Cr")
print(f"Total Raw Recorded Disbursements:    Rs. {df_res['disb_raw_cr'].sum():,.2f} Cr")
print(f"Total Reconciled Disbursements:      Rs. {df_res['disb_rec_cr'].sum():,.2f} Cr")
print(f"Confirmed Ingestion Duplicates:      {df_res['dup_count'].sum():,} vouchers (Rs. {df_res['dup_cr'].sum():,.2f} Cr)")
print(f"MPs Flagged for Reconciliation:      {df_res['reconcil_needed'].sum()} of 540")
print(f"MPs with Duplicates:                 {(df_res['dup_count'] > 0).sum()} of 540")
print(f"MPs with Raw Ratio > 100%:           {(df_res['disb_ratio'] > 100).sum()} of 540")
print(f"MPs with Reconciled Ratio > 100%:    {(df_res['disb_rec_ratio'] > 100).sum()} of 540")

print("\n=== 25 SAMPLE AFFECTED MPS REQUIRING RECONCILIATION ===")
sample_aff = df_res[df_res['reconcil_needed']].sort_values(by=['disb_ratio', 'dup_count'], ascending=False).head(25)

header = f"{'MP Name':<26} | {'Constituency':<16} | {'State':<12} | {'Sanc(Cr)':<8} | {'DisbRaw':<8} | {'Ratio':<7} | {'Act(Cr)':<7} | {'Dups':<5} | {'Dup(Cr)':<7} | {'DisbRec':<8} | {'RecRatio':<8}"
print(header)
print("-" * len(header))

for idx, r in sample_aff.iterrows():
    name = r['name'][:25]
    c = str(r['constituency'])[:15]
    s = str(r['state'])[:11]
    print(f"{name:<26} | {c:<16} | {s:<12} | {r['sanc_cr']:<8.2f} | {r['disb_raw_cr']:<8.2f} | {str(r['disb_ratio'])+'%':<7} | {r['act_cr']:<7.2f} | {r['dup_count']:<5} | {r['dup_cr']:<7.2f} | {r['disb_rec_cr']:<8.2f} | {str(r['disb_rec_ratio'])+'%':<8}")
