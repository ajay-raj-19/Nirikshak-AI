import json
import re

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

ls17 = [m for m in arr if '17' in str(m.get('term', '')) and m.get('house') != 'Rajya Sabha']
rs = [m for m in arr if m.get('house') == 'Rajya Sabha']

print(f"Loaded {len(ls17)} 17th LS MPs and {len(rs)} Rajya Sabha MPs.")

