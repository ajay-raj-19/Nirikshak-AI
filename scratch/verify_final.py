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
print(f"18th LS MPs: {len(ls18)}")
tot_act = sum(m.get('actualCr', 0) for m in ls18)
print(f"Total Actual Cr: Rs {tot_act:.2f} CR")

for name in ['tariq anwar', 'vijaylakshmi', 'rajesh verma', 'pradeep kumar singh']:
    m = next(x for x in ls18 if name in x['name'].lower())
    print(f"  {m['name']} | Const: {m.get('constituency')} | Party: {m.get('party')} | Actual: Rs {m.get('actualCr')} CR | Sanc: Rs {m.get('sanctionedCr')} CR | Disb: Rs {m.get('disbursedCr')} CR")

