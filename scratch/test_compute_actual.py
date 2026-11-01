import pyarrow.parquet as pq
import json

# Load works
works = pq.read_table('AiData/works.parquet').to_pandas()
comp = works[works['work_status'].str.contains('complete', case=False, na=False)]

# Group by (mp_id, tenure)
# Note: tenure in works can be '18th Lok Sabha' or '17' or other
actual_by_mp_tenure = {}
for (mid, ten), grp in comp.groupby(['mp_id', 'tenure']):
    actual_by_mp_tenure[(int(mid), str(ten))] = round(float(grp['actual_amount'].sum()) / 1e7, 2)

actual_by_mp_all = {}
for mid, grp in comp.groupby('mp_id'):
    actual_by_mp_all[int(mid)] = round(float(grp['actual_amount'].sum()) / 1e7, 2)

print(f"Computed actualCr for {len(actual_by_mp_tenure)} (mp_id, tenure) pairs, and {len(actual_by_mp_all)} mp_ids.")

# Load mpPerformanceData.js
with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const ALL_MPS_DATA = '
start = text.find(prefix) + len(prefix)
depth = 0
for i in range(start, len(text)):
    if text[i] == '[': depth += 1
    elif text[i] == ']':
        depth -= 1
        if depth == 0:
            arr = json.loads(text[start:i+1])
            break

matched_actual = 0
for m in arr:
    mid = None
    if 'id' in m and m['id'].startswith('MP-'):
        parts = m['id'].split('-')
        if len(parts) >= 2 and parts[1].isdigit():
            mid = int(parts[1])
    
    ten = '18th Lok Sabha' if '18' in str(m.get('term', '')) else ('17' if '17' in str(m.get('term', '')) else None)
    act = actual_by_mp_tenure.get((mid, ten)) or actual_by_mp_all.get(mid)
    if act is not None and act > 0:
        matched_actual += 1

print(f"Matched actualCr for {matched_actual} out of {len(arr)} MPs in mpPerformanceData.js!")
