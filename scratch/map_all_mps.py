import pandas as pd
import json
import re

works = pd.read_parquet('AiData/works.parquet')
mps = pd.read_parquet('AiData/mps.parquet')
consts = pd.read_parquet('AiData/constituencies.parquet')

# Clean IDA name to extract district
def extract_district(ida_str):
    if not ida_str or not isinstance(ida_str, str):
        return ""
    m = re.match(r'^([^(]+)', ida_str)
    if m:
        return m.group(1).strip()
    return ida_str.strip()

# Build map of (mp_id, house_type, tenure) -> top IDA district
mp_top_district = {}
for (m_id, h_type, tenure), group in works.groupby(['mp_id', 'house_type', 'tenure']):
    top_ida = group['ida_name'].value_counts().index[0]
    dist = extract_district(top_ida)
    mp_top_district[(m_id, h_type, tenure)] = dist

# Also fallback mp_id only
mp_id_district = {}
for m_id, group in works.groupby('mp_id'):
    top_ida = group['ida_name'].value_counts().index[0]
    mp_id_district[m_id] = extract_district(top_ida)

print(f"Total combinations mapped: {len(mp_top_district)}, Unique mp_ids: {len(mp_id_district)}")

# Let's inspect how many MPs in mpPerformanceData.js can be matched
with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'export const ALL_MPS_DATA = (\[[\s\S]*?\]);', content)
mps_data = json.loads(m.group(1))

matched_count = 0
unmatched = []

for mp in mps_data:
    # mp['id'] format: MP-{numeric_id}-{house_type}
    id_match = re.match(r'MP-(\d+)-(\d+)', mp['id'])
    if id_match:
        num_id = int(id_match.group(1))
        h_type = int(id_match.group(2))
        tenure = 17 if '17' in str(mp.get('term', '')) else 18
        
        dist = mp_top_district.get((num_id, h_type, tenure)) or mp_id_district.get(num_id)
        if dist:
            matched_count += 1
        else:
            unmatched.append((mp['name'], mp.get('house', ''), mp.get('state', '')))

print(f"Matched {matched_count} / {len(mps_data)} MPs to exact district from IDA!")
print(f"Unmatched count: {len(unmatched)}")
if unmatched:
    print("Sample unmatched:", unmatched[:10])
