import os
import re

patterns = [
    ("hash_modulo", re.compile(r'\bhash\s*\(.*?\)\s*%', re.IGNORECASE)),
    ("random_lib", re.compile(r'\brandom\.(choice|randint|random|randrange|uniform|sample)\b')),
    ("math_random", re.compile(r'\bMath\.random\s*\(')),
    ("faker_mock", re.compile(r'\b(faker|mock|dummy|synthetic)\b', re.IGNORECASE)),
    ("hardcoded_ratio", re.compile(r'\b(sample_data|mock_data|dummy_data)\b', re.IGNORECASE))
]

matches = []

for root, dirs, files in os.walk('.'):
    if any(ign in root for ign in ['node_modules', '.git', 'dist', '.venv', '__pycache__']):
        continue
    for f in files:
        if f.endswith(('.py', '.js', '.jsx', '.ts', '.tsx')):
            p = os.path.join(root, f)
            try:
                with open(p, 'r', encoding='utf-8', errors='ignore') as fl:
                    lines = fl.readlines()
                for i, line in enumerate(lines):
                    for tag, pat in patterns:
                        if pat.search(line):
                            matches.append((tag, p, i + 1, line.strip()))
            except Exception as e:
                pass

with open('scratch/randomness_audit_results.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total occurrences found: {len(matches)}\n")
    for tag, p, ln, text in matches:
        out.write(f"[{tag}] {p}:{ln} -> {text}\n")

print(f"Audit written to scratch/randomness_audit_results.txt with {len(matches)} matches.")

