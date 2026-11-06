#!/usr/bin/env bash
# Validate a manual Pages publish ref.
#
# Accepts a full 40-character commit SHA or an existing tag name.
# Rejects branch names, short SHAs, and anything that is not already on origin/main.
# The commit must also be the save-compatibility floor in .github/release-floor.txt
# or a descendant of it. The floor file is read from the workflow checkout
# (the branch the run was dispatched from), not from the commit being published.
#
# Usage: validate-pages-ref.sh [ref]
# In Actions, the ref is taken from the workflow_dispatch input INPUT_REF.
set -euo pipefail

fail() {
  echo "$*" >&2
  exit 1
}

summary_line() {
  printf '%s\n' "$1"
  if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
    printf '%s\n' "$1" >> "${GITHUB_STEP_SUMMARY}"
  fi
}

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

if [[ "${GITHUB_ACTIONS:-}" == "true" && "${GITHUB_REF:-}" != "refs/heads/main" ]]; then
  fail "reject: workflow must be dispatched from main (GITHUB_REF=${GITHUB_REF:-unset})"
fi

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

if [[ $# -gt 0 ]]; then
  REF="$1"
else
  REF="${INPUT_REF:-}"
fi
REF=$(trim "$REF")
if [[ -z "$REF" ]]; then
  fail "reject: empty ref"
fi

if ! git rev-parse --verify --quiet origin/main >/dev/null; then
  fail "reject: origin/main is not available"
fi
MAIN=$(git rev-parse --verify origin/main)

FLOOR_FILE="$ROOT/.github/release-floor.txt"
if [[ ! -f "$FLOOR_FILE" ]]; then
  fail "reject: missing .github/release-floor.txt"
fi
FLOOR=""
while IFS= read -r raw || [[ -n "$raw" ]]; do
  line=$(trim "$raw")
  [[ -z "$line" || "$line" == \#* ]] && continue
  if [[ -n "$FLOOR" ]]; then
    fail "reject: release floor file has more than one SHA"
  fi
  FLOOR="$line"
done < "$FLOOR_FILE"
if [[ ! "$FLOOR" =~ ^[0-9a-f]{40}$ ]]; then
  fail "reject: release floor is not a full lowercase SHA"
fi
if [[ "$(git cat-file -t "$FLOOR" 2>/dev/null || true)" != "commit" ]]; then
  fail "reject: release floor does not resolve to a commit"
fi

TAG_NAME=""
if [[ "$REF" =~ ^[0-9a-fA-F]{40}$ ]]; then
  SHA=$(printf '%s' "$REF" | tr '[:upper:]' '[:lower:]')
  if ! git cat-file -e "$SHA" 2>/dev/null; then
    fail "reject: SHA does not resolve to an object"
  fi
  kind=$(git cat-file -t "$SHA")
  if [[ "$kind" != "commit" ]]; then
    fail "reject: full SHA is a ${kind}, not a commit"
  fi
elif [[ "$REF" =~ ^[0-9a-fA-F]{1,39}$ ]]; then
  fail "reject: short SHA"
elif [[ ! "$REF" =~ ^[A-Za-z0-9._-]{1,128}$ ]]; then
  fail "reject: not a full SHA or existing tag"
elif git show-ref --verify --quiet "refs/heads/${REF}"; then
  fail "reject: branch name"
elif ! git show-ref --verify --quiet "refs/tags/${REF}"; then
  fail "reject: not an existing tag"
else
  SHA=$(git rev-parse --verify "refs/tags/${REF}^{commit}")
  TAG_NAME="$REF"
fi

if ! git merge-base --is-ancestor "$SHA" "$MAIN"; then
  fail "reject: not reachable from origin/main"
fi
if ! git merge-base --is-ancestor "$FLOOR" "$SHA"; then
  fail "reject: below save-compatibility floor ${FLOOR}"
fi
if ! git cat-file -e "${SHA}:version.json" 2>/dev/null; then
  fail "reject: version.json missing at ${SHA}"
fi
if ! git cat-file -e "${SHA}:index.html" 2>/dev/null; then
  fail "reject: index.html missing at ${SHA}"
fi

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git show "${SHA}:version.json" > "$tmp/version.json"
git show "${SHA}:index.html" > "$tmp/index.html"
VERSION=$(python3 - "$tmp/version.json" "$tmp/index.html" <<'PY'
import json
import re
import sys
from html.parser import HTMLParser

version_path, html_path = sys.argv[1], sys.argv[2]
raw = open(version_path, encoding="utf-8").read()
try:
    data = json.loads(raw)
except json.JSONDecodeError as exc:
    sys.exit("reject: version.json does not parse: %s" % exc)
if not isinstance(data, dict) or not isinstance(data.get("version"), str):
    sys.exit("reject: version.json must be an object with a string version")
version = data["version"]
if not re.fullmatch(r"\d+\.\d+\.\d+(\.\d+)?", version):
    sys.exit("reject: version.json version is not MAJOR.MINOR.PATCH")
html = open(html_path, encoding="utf-8").read()
if not html.strip() or "\x00" in html:
    sys.exit("reject: index.html is empty or not text")

class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.saw_html = False

    def handle_starttag(self, tag, attrs):
        if tag == "html":
            self.saw_html = True

parser = Collector()
try:
    parser.feed(html)
    parser.close()
except Exception as exc:
    sys.exit("reject: index.html does not parse: %s" % exc)
if not parser.saw_html:
    sys.exit("reject: index.html does not parse as an html document")
print(version)
PY
)

if [[ -n "$TAG_NAME" ]]; then
  TAG_DISPLAY="$TAG_NAME"
else
  TAG_DISPLAY=$(git tag --points-at "$SHA" | LC_ALL=C sort | tr '\n' ',' | sed 's/,$//')
  if [[ -z "$TAG_DISPLAY" ]]; then
    TAG_DISPLAY="(none)"
  fi
fi
TAG_OUTPUT="$TAG_DISPLAY"
if [[ "$TAG_OUTPUT" == "(none)" ]]; then
  TAG_OUTPUT=""
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    printf 'sha=%s\n' "$SHA"
    printf 'version=%s\n' "$VERSION"
    printf 'tag=%s\n' "$TAG_OUTPUT"
  } >> "${GITHUB_OUTPUT}"
fi

summary_line "## Pages publish candidate"
summary_line ""
summary_line "- SHA: \`$SHA\`"
summary_line "- Tag: \`$TAG_DISPLAY\`"
summary_line "- Save-compatibility floor: \`$FLOOR\`"
summary_line "- Ancestor of origin/main (\`$MAIN\`): yes"
summary_line ""
summary_line "### version.json"
summary_line ""
summary_line '```json'
while IFS= read -r json_line || [[ -n "$json_line" ]]; do
  summary_line "$json_line"
done < "$tmp/version.json"
summary_line '```'
summary_line ""
summary_line "result: pass"
summary_line "sha: $SHA"
summary_line "version: $VERSION"
summary_line "tag: $TAG_DISPLAY"
summary_line "floor: $FLOOR"
