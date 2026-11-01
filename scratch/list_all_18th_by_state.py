import json

with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

mps18 = d.get('18th_lok_sabha', [])
from collections import defaultdict
by_state = defaultdict(list)
for x in mps18:
    by_state[x['state_name']].append(x)

for st in sorted(by_state.keys()):
    print(f"=== {st} ({len(by_state[st])}) ===")
    for m in by_state[st]:
        print(f"  {m['const_name']}: {m['mp_name']}")
