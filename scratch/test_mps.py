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
print(f"Total MPs in dataset: {len(data)}")

# Filter 18th Lok Sabha MPs
ls18 = [x for x in data if '18' in str(x.get('term', '')) and x.get('house') != 'Rajya Sabha']
print(f"18th Lok Sabha MPs count: {len(ls18)}")

# Let's inspect the 4 MPs from the user's screenshot:
names = ['TARIQ ANWAR', 'VIJAYLAKSHMI DEVI', 'RAJESH VERMA', 'Pradeep Kumar Singh']
for n in names:
    matches = [x for x in data if n.lower() in x['name'].lower()]
    for m in matches:
        ratio = (m.get('reconciledDisbursedCr') or m.get('disbursedCr') or 0) / (m.get('sanctionedCr') or 1) * 100
        print(f"Name: {m['name']} | Term: {m.get('term')} | State: {m.get('state')} | Const: {m.get('constituency')} | Party: {m.get('party')} | Sanc: {m.get('sanctionedCr')} | Disb: {m.get('disbursedCr')} | Actual: {m.get('actualCr')} | Ratio: {ratio:.1f}%")
