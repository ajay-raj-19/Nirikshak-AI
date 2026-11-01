import pyarrow.parquet as pq
import pandas as pd
import json
import re

mps = pq.read_table('AiData/mps.parquet').to_pandas()
works = pq.read_table('AiData/works.parquet').to_pandas()
exps = pq.read_table('AiData/expenditures.parquet').to_pandas()
alloc = pq.read_table('AiData/mp_allocations.parquet').to_pandas()

with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'export const CURRENT_18TH_MPS_DATA = (\[.*?\]);', text, re.DOTALL)
current_mps = json.loads(match.group(1))

w_18 = works[works['tenure'] == '18th Lok Sabha'].copy()
w_17 = works[works['tenure'] == '17'].copy()
exp_by_work = exps.groupby('work_id')['fund_disbursed_amount'].sum().to_dict()

zero_mps = []
polluted_samples = []
pure_samples = []

for m in current_mps:
    mid = m['mpId']
    m_w18 = w_18[w_18['mp_id'] == mid]
    m_w17 = w_17[w_17['mp_id'] == mid]
    
    rec_18 = len(m_w18)
    rec_17 = len(m_w17)
    
    sanc_18 = m_w18['sanction_amount'].fillna(0).astype(float).sum() / 1e7
    sanc_17 = m_w17['sanction_amount'].fillna(0).astype(float).sum() / 1e7
    
    spent_18 = sum(exp_by_work.get(wid, 0.0) for wid in m_w18['work_id']) / 1e7
    spent_17 = sum(exp_by_work.get(wid, 0.0) for wid in m_w17['work_id']) / 1e7
    
    min_date_18 = str(m_w18['recommendation_date'].min()) if rec_18 > 0 else 'N/A'
    max_date_18 = str(m_w18['recommendation_date'].max()) if rec_18 > 0 else 'N/A'
    min_date_17 = str(m_w17['recommendation_date'].min()) if rec_17 > 0 else 'N/A'
    max_date_17 = str(m_w17['recommendation_date'].max()) if rec_17 > 0 else 'N/A'
    
    entry = {
        'name': m['name'],
        'mpId': mid,
        'constituency': m['constituency'],
        'state': m['state'],
        'party': m['party'],
        'frontend_alloc': m['allocatedCr'],
        'frontend_spent': m['spentCr'],
        'frontend_rec': m['worksRecommended'],
        'frontend_done': m['worksCompleted'],
        'rec_18': rec_18,
        'sanc_18': round(sanc_18, 2),
        'spent_18': round(spent_18, 2),
        'dates_18': f'{min_date_18} to {max_date_18}',
        'rec_17': rec_17,
        'sanc_17': round(sanc_17, 2),
        'spent_17': round(spent_17, 2),
        'dates_17': f'{min_date_17} to {max_date_17}'
    }
    
    if rec_18 == 0:
        zero_mps.append(entry)
    elif rec_17 > 0 and m['worksRecommended'] > rec_18:
        polluted_samples.append(entry)
    elif rec_17 == 0 and rec_18 > 0:
        pure_samples.append(entry)

print('=== ZERO 18TH LS WORKS MPS ===')
for z in zero_mps:
    print(f"Name: {z['name']}, MP ID: {z['mpId']}, Constituency: {z['constituency']} ({z['state']})")
    print(f"   Frontend Rec: {z['frontend_rec']}, 17th Works: {z['rec_17']}")

print('\n=== SAMPLE POLLUTED MPS (17TH INADVERTENTLY INCLUDED) ===')
for p in polluted_samples[:12]:
    print(f"{p['name']} (MP ID: {p['mpId']}) - {p['constituency']}, {p['state']} ({p['party']}):")
    print(f"   Frontend Displayed:  {p['frontend_rec']} works | Rs.{p['frontend_spent']} Cr spent | Rs.{p['frontend_alloc']} Cr allocated")
    print(f"   Pure 18th LS:        {p['rec_18']} works | Rs.{p['spent_18']} Cr spent | Rs.{p['sanc_18']} Cr sanctioned | Rec Dates: {p['dates_18']}")
    print(f"   Leaked 17th LS:      {p['rec_17']} works | Rs.{p['spent_17']} Cr spent | Rs.{p['sanc_17']} Cr sanctioned | Rec Dates: {p['dates_17']}")
    print()

print('\n=== SAMPLE PURE MPS (NEWLY ELECTED 2024) ===')
for pu in pure_samples[:5]:
    print(f"{pu['name']} (MP ID: {pu['mpId']}) - {pu['constituency']}, {pu['state']} ({pu['party']}):")
    print(f"   Frontend Displayed:  {pu['frontend_rec']} works | Rs.{pu['frontend_spent']} Cr spent | Rs.{pu['frontend_alloc']} Cr allocated")
    print(f"   Pure 18th LS:        {pu['rec_18']} works | Rs.{pu['spent_18']} Cr spent | Rs.{pu['sanc_18']} Cr sanctioned | Rec Dates: {pu['dates_18']}")
    print(f"   Leaked 17th LS:      0 works (Clean)")
    print()
