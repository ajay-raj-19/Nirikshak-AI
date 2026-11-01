import json
import re

# Load MoSPI 18th Lok Sabha MPs
with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

mps18 = d.get('18th_lok_sabha', [])
print(f"Total MoSPI 18th LS MPs: {len(mps18)}")

# Verify key MPs mentioned by user:
# 1. TARIQ ANWAR (Katihar, Bihar) -> INC
# 2. VIJAYLAKSHMI DEVI (Siwan, Bihar) -> JD(U)
# 3. RAJESH VERMA (Khagaria, Bihar) -> LJP(RV)
# 4. Pradeep Kumar Singh (Araria, Bihar) -> BJP
test_cases = ['TARIQ ANWAR', 'VIJAYLAKSHMI DEVI', 'RAJESH VERMA', 'Pradeep Kumar Singh', 'Chirag Paswan', 'Misha Bharti', 'Kanimozhi', 'Praveen Khandelwal']

for tc in test_cases:
    found = [m for m in mps18 if tc.lower() in m['mp_name'].lower()]
    for f in found:
        print(f"Found in MoSPI: {f['mp_name']} | Const: {f['const_name']} | State: {f['state_name']}")

