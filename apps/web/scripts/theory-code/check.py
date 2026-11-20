"""Runs every theory code step (from dump.ts) and reports any that fail. Usage: python3 check.py [codesteps.json] [slug ...]"""
import json, os, re, subprocess, sys, tempfile

path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/codesteps.json"
only = set(sys.argv[2:])
OTHER_LANGUAGE = re.compile(r"^# (bash|text|json|yaml|sql|shell|console|r|toml)\b")
failed = 0
steps = [s for s in json.load(open(path)) if not only or s["slug"] in only]
with tempfile.TemporaryDirectory() as work:
    for s in steps:
        if OTHER_LANGUAGE.match(s["code"]):
            continue
        code = "import matplotlib\nmatplotlib.use('Agg')\n" + s["code"]
        p = subprocess.run([sys.executable, "-W", "ignore", "-c", code], capture_output=True, text=True, timeout=300, cwd=work)
        if p.returncode:
            failed += 1
            print(f"FAIL {s['slug']} step {s['n']} ({s['goal']}): {p.stderr.strip().splitlines()[-1]}")
print(f"{len(steps) - failed}/{len(steps)} code steps ran")
sys.exit(1 if failed else 0)
