#!/usr/bin/env bash
# Build the directory uploaded by actions/upload-pages-artifact.
#
# File set (audited 2026-11-06 against the legacy Pages site):
# The live site is build_type legacy, source main `/`, with an empty .nojekyll.
# Jekyll is not running. Markdown is served raw (README.html is 404). There are
# no underscore-prefixed paths. SHA-256 of the live bytes matched git for
# version.json, index.html, manifest.webmanifest, icons, README.md, CHANGELOG.md,
# tests/v0718.html, release.sh, assets/sfx/sfx.json, and a multi-megabyte m4a.
# tests/, notes/, reports, and release.sh are therefore part of what is served
# today and stay in the artifact. Dropping them would change public URLs.
#
# Exclusions:
# - .git is not part of the tree git archive emits.
# - .github is removed here. upload-pages-artifact also excludes .git and .github
#   even when include-hidden-files is true. The workflow must set
#   include-hidden-files true, because the action's default drops dotfiles and
#   would omit .nojekyll, which the legacy site serves.
# - If the selected commit has no .nojekyll, an empty one is added so the
#   published file set still carries the marker the legacy builder honors.
#   The floor commit already has it, so the first deploy adds nothing.
set -euo pipefail

fail() {
  echo "$*" >&2
  exit 1
}

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

SHA="${PUBLISH_SHA:-}"
DEST="${1:-${PAGES_STAGE_DIR:-_site}}"

if [[ ! "$SHA" =~ ^[0-9a-f]{40}$ ]]; then
  fail "stage: PUBLISH_SHA must be a full lowercase 40-character commit SHA"
fi
case "$DEST" in
  _site|/tmp/*|/var/tmp/*) ;;
  *) fail "stage: refusing to write outside _site or a temp directory" ;;
esac
if [[ "$(git cat-file -t "$SHA" 2>/dev/null || true)" != "commit" ]]; then
  fail "stage: $SHA is not a commit"
fi

rm -rf "$DEST"
mkdir -p "$DEST"
git archive "$SHA" | tar -x -C "$DEST"
rm -rf "$DEST/.git" "$DEST/.github"
if [[ ! -e "$DEST/.nojekyll" ]]; then
  : > "$DEST/.nojekyll"
  echo "stage: $SHA had no .nojekyll; wrote an empty one into the artifact"
fi
echo "stage: $DEST from $SHA"
