#!/usr/bin/env bash
# Local dry run of the Pages ref checks and the artifact file set.
# Does not upload, deploy, or contact GitHub.
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"
VALIDATE="$ROOT/.github/scripts/validate-pages-ref.sh"
STAGE="$ROOT/.github/scripts/stage-pages-artifact.sh"

pass=0
fail=0

prefix_lines() {
  local prefix="$1"
  local text="$2"
  local line
  while IFS= read -r line || [[ -n "$line" ]]; do
    printf '%s%s\n' "$prefix" "$line"
  done <<< "$text"
}

expect_pass() {
  local name="$1" ref="$2"
  local out err code
  set +e
  out=$("$VALIDATE" "$ref" 2>"$ROOT/.git/pages-validate-err")
  code=$?
  set -e
  err=$(cat "$ROOT/.git/pages-validate-err")
  if [[ "$code" -eq 0 && "$out" == *"result: pass"* && "$out" == *"version: 0.7.18"* ]]; then
    echo "PASS  $name"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (expected pass, exit $code)"
    prefix_lines "      " "$err"
    fail=$((fail + 1))
  fi
}

expect_reject() {
  local name="$1" ref="$2" needle="$3"
  local out err code
  set +e
  out=$("$VALIDATE" "$ref" 2>"$ROOT/.git/pages-validate-err")
  code=$?
  set -e
  err=$(cat "$ROOT/.git/pages-validate-err")
  if [[ "$code" -ne 0 && "$err" == *"$needle"* && "$out" != *"result: pass"* ]]; then
    echo "PASS  $name"
    echo "      $err"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (expected reject containing: $needle, exit $code)"
    prefix_lines "      " "$err"
    prefix_lines "      out: " "$out"
    fail=$((fail + 1))
  fi
}

FLOOR=19318e31423238c2680423e25ce8f816a91c2450
BELOW=a492023a5a442bce8404837648567626b58a51e1
TAG_OBJECT=a9b39d75238875f9820da8e9957cedb9a9769cd3

expect_pass "full SHA 19318e3 (live floor, equal to floor)" "$FLOOR"
expect_pass "full SHA 19318e3 uppercase" "19318E31423238C2680423E25CE8F816A91C2450"
expect_reject "full SHA a492023 (on main, below floor)" "$BELOW" "reject: below save-compatibility floor"
expect_reject "short SHA 19318e3" "19318e3" "reject: short SHA"
expect_reject "short SHA a492023" "a492023" "reject: short SHA"
expect_reject "branch name main" "main" "reject: branch name"
expect_reject "tag v0.7.18 (older commit 25253a5)" "v0.7.18" "reject: below save-compatibility floor"
expect_reject "tag object SHA a9b39d7 is not a commit" "$TAG_OBJECT" "reject: full SHA is a tag, not a commit"
expect_reject "missing tag" "v9.9.9-not-a-release" "reject: not an existing tag"
expect_reject "empty ref" "" "reject: empty ref"

NONMAIN=$(git commit-tree "$(git rev-parse 'origin/main^{tree}')" -p origin/main -m "pages pipeline test commit not on main")
expect_reject "non-main commit $NONMAIN" "$NONMAIN" "reject: not reachable from origin/main"

stage_dir=$(mktemp -d)
PUBLISH_SHA="$FLOOR" "$STAGE" "$stage_dir" >/dev/null
git ls-tree -r --name-only "$FLOOR" | LC_ALL=C sort > "$stage_dir.expected"
(cd "$stage_dir" && find . \( -type f -o -type l \) -print | sed 's|^\./||' | LC_ALL=C sort) > "$stage_dir.actual"
if diff -u "$stage_dir.expected" "$stage_dir.actual" >/tmp/pages-stage-diff.txt; then
  echo "PASS  artifact file list matches 19318e3 (includes tests, docs, .nojekyll; no .github)"
  pass=$((pass + 1))
else
  echo "FAIL  artifact file list differs from 19318e3"
  cat /tmp/pages-stage-diff.txt
  fail=$((fail + 1))
fi

byte_bad=0
while IFS= read -r path; do
  if ! cmp -s <(git show "$FLOOR:$path") "$stage_dir/$path"; then
    echo "DIFF  $path"
    byte_bad=1
  fi
done < "$stage_dir.expected"
if [[ "$byte_bad" -eq 0 ]]; then
  echo "PASS  artifact bytes match git for every file at 19318e3"
  pass=$((pass + 1))
else
  echo "FAIL  artifact bytes differ"
  fail=$((fail + 1))
fi
if [[ -f "$stage_dir/.nojekyll" && ! -d "$stage_dir/.github" && -f "$stage_dir/tests/v0718.html" && -f "$stage_dir/index.html" ]]; then
  echo "PASS  .nojekyll and tests kept, .github absent"
  pass=$((pass + 1))
else
  echo "FAIL  expected marker files missing from staged artifact"
  fail=$((fail + 1))
fi

# A commit without .nojekyll must gain an empty marker and nothing else.
base_tree=$(git rev-parse "$FLOOR^{tree}")
stripped=$(git ls-tree "$base_tree" | awk -F'\t' '$2 != ".nojekyll"' | git mktree)
stripped_commit=$(git commit-tree "$stripped" -m "pages pipeline test commit without nojekyll")
missing_dir=$(mktemp -d)
PUBLISH_SHA="$stripped_commit" "$STAGE" "$missing_dir"
if [[ -f "$missing_dir/.nojekyll" && ! -s "$missing_dir/.nojekyll" ]]; then
  echo "PASS  missing .nojekyll is added as an empty file"
  pass=$((pass + 1))
else
  echo "FAIL  missing .nojekyll was not repaired"
  fail=$((fail + 1))
fi

rm -rf "$stage_dir" "$missing_dir" "$stage_dir.expected" "$stage_dir.actual" "$ROOT/.git/pages-validate-err"
echo
echo "$pass passed, $fail failed"
[[ "$fail" -eq 0 ]]
