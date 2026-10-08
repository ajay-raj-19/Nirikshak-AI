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
    # Usually: "DistrictName(Description...)" or "DistrictName"
    m = re.match(r'^([^(]+)', ida_str)
    if m:
        return m.group(1).strip()
    return ida_str.strip()

# Build map of MP to top IDA district
mp_top_district = {}
for m_id, group in works.groupby('mp_id'):
    top_ida = group['ida_name'].value_counts().index[0]
    dist = extract_district(top_ida)
    mp_top_district[m_id] = dist

print(f"Mapped {len(mp_top_district)} MPs to their work district.")

# Sample check for Uttar Pradesh MPs
up_works = works[works['state_id'] == 33]
up_mps = mps[mps['state_id'] == 33] if 'state_id' in mps.columns else mps[mps['mp_id'].isin(up_works['mp_id'].unique())]

print("\nSample UP MPs and their extracted district from IDA:")
for _, row in up_mps.head(25).iterrows():
    m_id = row['mp_id']
    m_name = row['mp_name']
    dist = mp_top_district.get(m_id, "No district")
    print(f"  {m_name} -> {dist}")
