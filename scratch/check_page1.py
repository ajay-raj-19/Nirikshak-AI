import json

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

ls18 = [m for m in arr if '18' in str(m.get('term', '')) and m.get('house') != 'Rajya Sabha']
sorted_by_name = sorted(ls18, key=lambda m: m.get('name', '').lower())

print("First 12 MPs by Name (Default page 1):")
for m in sorted_by_name[:12]:
    print(f"  {m['name']} | Const: {m.get('constituency')}, {m.get('state')} | Party: {m.get('party')} | Actual: Rs {m.get('actualCr')} CR")
