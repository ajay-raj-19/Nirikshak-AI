import json

with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    text = f.read()

prefix = 'export const ALL_MPS_DATA = '
start = text.find(prefix) + len(prefix)
depth = 0
end = start
for i in range(start, len(text)):
    if text[i] == '[':
        depth += 1
    elif text[i] == ']':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

data = json.loads(text[start:end])
ls18 = [x for x in data if '18' in str(x.get('term', '')) and x.get('house') != 'Rajya Sabha']

from collections import Counter
party_counts = Counter(x.get('party') for x in ls18)
print("Party distribution in 18th Lok Sabha currently in mpPerformanceData.js:")
for p, c in party_counts.most_common():
    print(f"  {p}: {c}")

# Check any DMK outside Tamil Nadu
dmk_outside = [x for x in ls18 if x.get('party') == 'DMK' and x.get('state') != 'Tamil Nadu']
print(f"\nDMK outside Tamil Nadu: {len(dmk_outside)}")
for x in dmk_outside:
    print(f"  {x['name']} | {x.get('state')} | {x.get('constituency')}")

# Check any TDP outside Andhra
tdp_outside = [x for x in ls18 if x.get('party') == 'TDP' and x.get('state') != 'Andhra Pradesh']
print(f"\nTDP outside Andhra: {len(tdp_outside)}")
for x in tdp_outside:
    print(f"  {x['name']} | {x.get('state')} | {x.get('constituency')}")
