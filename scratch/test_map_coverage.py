import json
import re

with open('scratch/official_mospi_mappings.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

mps18 = d.get('18th_lok_sabha', [])
print(f"Loaded {len(mps18)} MPs from official_mospi_mappings.json")

# Let's inspect unique states
states = set(x['state_name'] for x in mps18)
print(f"Total states: {len(states)}")

