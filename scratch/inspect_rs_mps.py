import json

with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

rs = d.get('rajya_sabha', [])
print(f"Total RS MPs in official_mospi_mappings: {len(rs)}")

from collections import defaultdict
by_state = defaultdict(list)
for m in rs:
    by_state[m['state_name']].append(m['mp_name'])

for st, names in sorted(by_state.items()):
    print(f"=== {st} ({len(names)}) ===")
    for n in names:
        print(f"  {n}")
