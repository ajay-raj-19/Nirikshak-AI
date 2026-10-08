import json
import re

with open('frontend/src/data/mpPerformanceData.js', 'r', encoding='utf-8') as f:
    text = f.read()

data = json.loads(re.search(r'export const CURRENT_18TH_MPS_DATA = (\[.*?\]);', text, re.DOTALL).group(1))

target_names = [
    'Raja A', 'Sajda Ahmed', 'D M Kathir Anand', 'C N Annadurai',
    'Anto Antony', 'Manickam Tagore B', 'T R Baalu', 'S P Singh Baghel',
    'Vijay Baghel', 'Abhishek Banerjee'
]

print("=== VERIFYING TARGET 10 RETURNING MPS IN MPPERFORMANCEDATA.JS ===")
for tn in target_names:
    matched = [m for m in data if tn.lower() == m['name'].lower()]
    if matched:
        m = matched[0]
        print(f"{m['name']} (ID {m['mpId']}) - {m['constituency']}, {m['state']} ({m['party']}):")
        print(f"   18th LS Works: {m['worksRecommended']} | Done: {m['worksCompleted']} | Comp Rate: {m['completionRate']}%")
        print(f"   Sanctioned: Rs.{m['sanctionedCr']} Cr | Spent: Rs.{m['spentCr']} Cr | Util: {m['utilizationPct']}%")
        if m.get('previousTenure'):
            pt = m['previousTenure']
            print(f"   [Isolated {pt['term']}]: {pt['worksRecommended']} works | Rs.{pt['spentCr']} Cr spent | Rs.{pt['sanctionedCr']} Cr sanctioned")
        print()
    else:
        print(f"FAILED TO FIND {tn}!")

print("\n=== VERIFYING 4 ZERO-WORK MPS ===")
zero_mps = [m for m in data if m['worksRecommended'] == 0]
for z in zero_mps:
    print(f"{z['name']} (ID {z['mpId']}) - {z['constituency']}, {z['state']}:")
    print(f"   Works: {z['worksRecommended']}, Sanctioned: Rs.{z['sanctionedCr']}, Spent: Rs.{z['spentCr']}")
    print(f"   Notice: {z.get('noDataNotice')}")
    print()
