#!/bin/sh
# Throwaway. Re-runs the zoom blur harness and leaves tools/audit/out/.
set -eu
cd "$(dirname "$0")/../.."
mkdir -p tools/audit/out /tmp/zoom-chrome
timeout 30 google-chrome --headless --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --hide-scrollbars --user-data-dir=/tmp/zoom-chrome --force-device-scale-factor=1 \
  --window-size=420,900 --virtual-time-budget=6000 \
  --screenshot=tools/audit/out/zoom-edge-sheet.png --dump-dom \
  "file://$PWD/tools/audit/measure-zoom-blur.html" > /tmp/zoom-audit-dom.html || true
python3 - << 'PY'
from pathlib import Path
import re, json
html = Path("/tmp/zoom-audit-dom.html").read_text(errors="replace")
m = re.search(r'<pre id="json">(.*)</pre>', html, re.S)
if not m:
    raise SystemExit("no metrics in dom.html")
text = m.group(1).replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&")
Path("tools/audit/out/metrics.json").write_text(json.dumps(json.loads(text), indent=2) + "\n")
print("wrote tools/audit/out/metrics.json")
PY
