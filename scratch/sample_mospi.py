import json

with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

mps18 = d.get('18th_lok_sabha', [])
print(f"Total 18th Lok Sabha in official_mospi_mappings.json: {len(mps18)}")

# Show 20 samples with state and constituency
for x in mps18[:20]:
    print(f"{x['state_name']} | {x['const_name']} | {x['mp_name']}")

