import pandas as pd
import json
import re

print("Loading works, constituencies, and mps...")
works = pd.read_parquet('AiData/works.parquet')
consts_df = pd.read_parquet('AiData/constituencies.parquet')

# Clean district from ida_name
def clean_ida_district(ida_str):
    if not ida_str or not isinstance(ida_str, str):
        return ""
    m = re.match(r'^([^(]+)', ida_str)
    raw = m.group(1).strip() if m else ida_str.strip()
    # Normalize common suffixes/prefixes
    raw = re.sub(r'(?i)\b(district|collector|dm|collectorate|magistrate|planning office|dda|ida)\b', '', raw).strip()
    return raw

# Map of (mp_id, house_type, tenure) -> list of IDA districts
mp_idas = {}
for (m_id, h_type, tenure), group in works.groupby(['mp_id', 'house_type', 'tenure']):
    top_idas = group['ida_name'].value_counts()
    districts = [clean_ida_district(ida) for ida in top_idas.index if clean_ida_district(ida)]
    mp_idas[(m_id, h_type, tenure)] = districts

# Map of mp_id -> list of IDA districts (fallback)
mp_id_only_idas = {}
for m_id, group in works.groupby('mp_id'):
    top_idas = group['ida_name'].value_counts()
    districts = [clean_ida_district(ida) for ida in top_idas.index if clean_ida_district(ida)]
    mp_id_only_idas[m_id] = districts

# Load indiaConstituencies.js
with open('frontend/src/data/indiaConstituencies.js', 'r', encoding='utf-8') as f:
    consts_content = f.read()
m_consts = re.search(r'export const INDIA_STATES_AND_UT = (\[[\s\S]*?\]);', consts_content)
states_data = json.loads(m_consts.group(1))

# Build state -> list of constituency names
state_constituencies = {}
for s in states_data:
    s_name = s['state']
    c_names = [c['name'] for c in s['constituencies'] if 'Rajya Sabha' not in c['name']]
    state_constituencies[s_name.lower()] = c_names

print(f"Loaded {len(state_constituencies)} states with constituencies.")

# Load mpPerformanceData.js
with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    mps_content = f.read()
m_mps = re.search(r'export const ALL_MPS_DATA = (\[[\s\S]*?\]);', mps_content)
mps_data = json.loads(m_mps.group(1))
print(f"Loaded {len(mps_data)} MPs from mpPerformanceData.js.")

# Matching function
def find_best_constituency(state_name, candidate_districts, available_constituencies):
    if not candidate_districts or not available_constituencies:
        return None
    for cand in candidate_districts:
        cand_clean = re.sub(r'[^a-zA-Z0-9]', '', cand).lower()
        if not cand_clean or len(cand_clean) < 3:
            continue
        # 1. Exact match
        for const in available_constituencies:
            const_clean = re.sub(r'[^a-zA-Z0-9]', '', const).lower()
            if cand_clean == const_clean:
                return const
        # 2. Substring match
        for const in available_constituencies:
            const_clean = re.sub(r'[^a-zA-Z0-9]', '', const).lower()
            if cand_clean in const_clean or const_clean in cand_clean:
                return const
    return None

matched = 0
rs_count = 0
unmatched_ls = []

for mp in mps_data:
    if mp.get('house') == 'Rajya Sabha':
        rs_count += 1
        continue
    
    # Parse ID
    id_match = re.match(r'MP-(\d+)-(\d+)', mp['id'])
    cand_districts = []
    if id_match:
        num_id = int(id_match.group(1))
        h_type = int(id_match.group(2))
        tenure = 17 if '17' in str(mp.get('term', '')) else 18
        cand_districts = mp_idas.get((num_id, h_type, tenure)) or mp_id_only_idas.get(num_id, [])
    
    state_key = (mp.get('state') or '').lower()
    avail = state_constituencies.get(state_key, [])
    
    best_c = find_best_constituency(state_key, cand_districts, avail)
    if best_c:
        matched += 1
    else:
        unmatched_ls.append((mp['name'], mp.get('state'), cand_districts[:2]))

print(f"Rajya Sabha MPs: {rs_count}")
print(f"Lok Sabha MPs matched to accurate constituency via IDA: {matched}")
print(f"Lok Sabha MPs needing direct mapping: {len(unmatched_ls)}")
if unmatched_ls:
    print("\nFirst 20 needing direct mapping:")
    for item in unmatched_ls[:20]:
        print(" ", item)
