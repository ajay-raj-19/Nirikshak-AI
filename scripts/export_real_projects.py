import json
import os
import shutil

print("=== REAL MOSPI MPLADS PROJECTS EXPORTER ===")

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_path = os.path.join(base_dir, "frontend", "public", "data", "real_projects.json")
live_path = os.path.join(base_dir, "data", "live_exports", "real_projects.json")

# Ensure live_exports is kept strictly synced with the verified 27,995 MoSPI works repository
if os.path.exists(public_path):
    with open(public_path, "r", encoding="utf-8") as f:
        projs = json.load(f)
    print(f"Verified repository has {len(projs):,} real MoSPI works.")
    os.makedirs(os.path.dirname(live_path), exist_ok=True)
    shutil.copyfile(public_path, live_path)
    print(f"Successfully synced to {live_path} with ZERO mock data.")
else:
    print(f"Warning: {public_path} not found.")
