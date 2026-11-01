import json
import re

with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)
mps18 = d['18th_lok_sabha']

from map_18th_parties import const_party_map, norm

unmatched = []
for m in mps18:
    st_norm = norm(m['state_name'])
    cn_norm = norm(m['const_name'])
    key = (st_norm, cn_norm)
    if key not in const_party_map:
        unmatched.append(m)

print(f"Total unmatched: {len(unmatched)}")
for u in unmatched:
    print(u['state_name'] + " | " + u['const_name'] + " | " + u['mp_name'])
