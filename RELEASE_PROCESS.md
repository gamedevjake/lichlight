# Publishing Lichlight to GitHub Pages

This is the manual publish path. It is a review document until Jake completes the cutover below. Merging the pull request does not switch Pages to Actions, and it does not run this workflow.

The workflow is `.github/workflows/pages-publish.yml`. It runs only from **Run workflow** (`workflow_dispatch`). It has no `push` and no `pull_request` trigger. A run from `main` validates the ref, then stops on the `github-pages` environment until Jake approves. Only then does it upload an artifact and deploy.

Do not use `release.sh` to publish the site. That script still commits, tags, and pushes `main`. While Pages `build_type` is `legacy`, a push to `main` is what publishes. After the cutover, a push publishes nothing.

`version.json` stays `{"version":"0.7.18"}`. This document does not change it. `const VERSION` in `index.html` is the same string. The title reads `v0.7.18`. The live game at that version string is the Stage 10 commit, not the old `v0.7.18` tag.

## What is live today (audited 2026-11-06)

Read-only. Nothing in this audit was changed.

| Item | Value |
| --- | --- |
| Pages `build_type` | `legacy` |
| Source | branch `main`, path `/` |
| URL | https://gamedevjake.github.io/lichlight/ |
| CNAME | none |
| HTTPS | enforced |
| Repo visibility | public |
| Latest Pages build | commit `19318e31423238c2680423e25ce8f816a91c2450`, status `built` |
| `version.json` on that commit and on the live URL | `{"version":"0.7.18"}` |
| Annotated tag `v0.7.18` | tag object `a9b39d75238875f9820da8e9957cedb9a9769cd3`, commit `25253a5586470e466f99f2122c4579ac69a666b1` |

`v0.7.18` is older than the live game. It is not a legal first deploy. The workflow rejects it because that commit is below the save-compatibility floor.

## How to publish

Do this only after the cutover. The two `ref` values are different:

- **Workflow branch** (`--ref` / "Use workflow from") must be `main`. That is `GITHUB_REF`. The environment branch rule and the script both require it.
- **Site commit** (the workflow input named `ref`) is the tag or the full 40-character SHA whose tree becomes the site.

### GitHub UI

1. Open the repo **Actions** tab.
2. Choose **Publish GitHub Pages**.
3. Click **Run workflow**.
4. Set **Use workflow from** to branch `main`.
5. Set **ref** to a release tag or a full 40-character SHA. The first cutover value is `19318e31423238c2680423e25ce8f816a91c2450`.
6. Click **Run workflow**.
7. Open the run. The validate job must finish green. Read its summary: selected SHA, `version.json`, and tag.
8. Approve the `github-pages` deployment (see the approval gate). The deploy job does not upload or deploy until that approval.

### GitHub CLI

```sh
gh workflow run pages-publish.yml --ref main \
  -f ref=19318e31423238c2680423e25ce8f816a91c2450
```

`--ref main` chooses the workflow file. `-f ref=` is the site commit. Watch the run:

```sh
gh run list --workflow=pages-publish.yml --limit 5
gh run watch
```

A short SHA such as `19318e3` is rejected. A branch name such as `main` in the input is rejected. Put the full SHA in `-f ref`.

## Approval gate

The deploy job sets `environment: github-pages`. GitHub will not start that job until the environment rules pass.

Today the environment has a branch rule and no required reviewer. Jake adds himself as the required reviewer before the first dispatch (settings below). One approval is enough. `prevent_self_review` stays **off**. Jake is the only reviewer; if self-review is prevented, the person who starts the run cannot approve it and the deploy cannot proceed.

There is no wait timer.

`concurrency.group` is `pages` and `cancel-in-progress` is `false`. A second dispatch waits. It does not cancel the run that is already deploying.

### Approve in the UI

Open the run. It shows **Review pending deployments** / **Waiting for review**. Click **Review deployments**, select `github-pages`, and approve. Rejecting the review deploys nothing. The site stays on the previous build.

### Approve with the CLI

The caller has to be the required reviewer (`gamedevjake`, user id `2687229`). Environment id `25223236544` was the `github-pages` environment at audit time; confirm it if the environment is ever recreated.

```sh
RUN_ID=$(gh run list --workflow=pages-publish.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh api "repos/gamedevjake/lichlight/actions/runs/${RUN_ID}/pending_deployments"
gh api -X POST "repos/gamedevjake/lichlight/actions/runs/${RUN_ID}/pending_deployments" \
  --input - <<'JSON'
{
  "environment_ids": [25223236544],
  "state": "approved",
  "comment": "Approve Lichlight Pages publish"
}
JSON
```

Check the validate summary before approving. Approval does not let you swap the SHA. The SHA is the one validation already accepted.

## What validation allows

The script is `.github/scripts/validate-pages-ref.sh`. It reads the floor from the workflow checkout (the `main` that was dispatched), then looks at the selected commit with `git show` and `git merge-base`. It does not check out an untrusted ref before those checks.

A ref is accepted only when all of these are true:

- It is a full 40-character commit SHA, or the exact name of an existing tag. Branch names, short SHAs, and other text are rejected. A 40-character SHA that is a tag object rather than a commit is rejected.
- That commit is an ancestor of `origin/main` (it is already on `main`, or it is `main`).
- That commit is the floor in `.github/release-floor.txt`, or a descendant of the floor.
- That commit contains `version.json` and `index.html`.
- `version.json` parses as an object with a string `version` of the form `MAJOR.MINOR.PATCH` (an optional fourth numeric field is allowed, matching the in-game check).
- `index.html` parses as an HTML document with an `<html>` root.

On success the job summary prints the SHA, the tag (or `(none)`), the floor, and the raw `version.json`.

In Actions the script also requires `GITHUB_REF` to be `refs/heads/main`. A dispatch whose workflow branch is anything else fails before deploy. The current environment policy also lists a `gh-pages` branch rule; no `gh-pages` branch exists. The script does not treat that rule as permission to publish.

## Versioning

- `version.json` is the file the live page fetches (`version.json?t=...`, cache bypassed). The game compares it with `const VERSION` in `index.html` (`semverGt`). The update banner appears only when the published `version.json` is strictly newer.
- Both are `0.7.18` on the Stage 10 commit that is live. Leave them there. Do not bump them in a publish-only change. With them equal, the banner stays hidden, which is what players should see after this cutover.
- A release tag is `vX.Y.Z`, the same string as `version.json`, created by the existing release habit in `RELEASING.md`. This pipeline does not create tags.
- The tag `v0.7.18` does **not** point at the live Stage 10 commit. It points at `25253a5586470e466f99f2122c4579ac69a666b1`. Publishing that tag would ship an older game under the same version string. Validation rejects it because of the floor. Do not retarget the tag in order to publish.
- After cutover, tagging and pushing still do not deploy. Dispatch the new tag, or the new full SHA, and approve.

## Save-compatibility floor

The floor file is `.github/release-floor.txt`:

```text
19318e31423238c2680423e25ce8f816a91c2450
```

That is the Stage 10 commit currently served by legacy Pages. Stage 10 load path includes `migrateGearWard` on gear. Saves already live in the browser and are not wiped by a deploy. The keys include `cryptdelve` (the active run), `cryptdelve-p-<id>` (other characters), `cryptdelve-profiles`, `cryptdelve-settings`, `lichlight-gl-look`, and `cryptdelve-a2hs`.

An older build does not contain that Stage 10 load path. Publishing one can open a Stage 10 save with older item code. The workflow refuses those commits. `a492023a5a442bce8404837648567626b58a51e1` (Stage 9, also tagged `combat-redesign-pre-stage10` and `balance-pre-early-se-loot`) is on `main` and still rejected. So is `v0.7.18`.

Changing the floor means editing `.github/release-floor.txt` in a reviewed pull request. That is the only way to publish an older tree. Do not lower it as a shortcut for the first deploy or for a rollback.

## Rollback

Saves stay in the browser across deploys. There is no service worker.

**The published game is wrong, and Actions itself is fine.** Dispatch the last good tag or full SHA that is on `main` and at or above the floor, then approve. For the first cutover, that SHA is `19318e31423238c2680423e25ce8f816a91c2450` again. There is no older legal Actions deploy. Do not dispatch `v0.7.18`, `a492023`, or `combat-redesign-pre-stage10`. Those fail the floor. Shipping them anyway would be the save-compatibility break the floor exists to prevent.

**The cutover deploy fails, or Actions is publishing a broken site and legacy is the way back.** Switch Pages back to the legacy builder from `main` `/`:

```sh
gh api -X PUT repos/gamedevjake/lichlight/pages \
  -f build_type=legacy \
  -f 'source[branch]=main' \
  -f 'source[path]=/'
gh api repos/gamedevjake/lichlight/pages --jq '{build_type,source,html_url,status}'
```

Legacy then builds `main` on its own. Right after this pull request merges, `main` is the Stage 10 game plus the workflow, the floor file, and this document. That is the same game as the live Stage 10 commit. It is not a return to `v0.7.18`. If a later bad game commit is already on `main`, legacy publishes that commit too. Restoring an older game while `build_type` is `legacy` means a revert commit on `main`, which is a separate reviewed change, and it still has to respect the save floor if players have Stage 10 saves.

## What the artifact contains

`.github/scripts/stage-pages-artifact.sh` exports the selected commit with `git archive` and uploads that directory.

Legacy Pages is already serving that git tree byte for byte:

- `.nojekyll` is present and empty. The live URL returns `200` with an empty body. `README.html` is `404`, so Jekyll is not turning Markdown into HTML. There are no underscore-prefixed paths in the tree. The only dotfile is `.nojekyll`.
- Sampled live bytes matched git SHA-256 for `version.json`, `index.html`, `manifest.webmanifest`, `icon-32.png`, `icon-512.png`, `README.md`, `CHANGELOG.md`, `tests/v0718.html`, `release.sh`, `assets/sfx/sfx.json`, and `assets/music/boss/boss_01_phase1.m4a`.

Because those paths are served today, the artifact keeps them. That includes `tests/`, `notes/`, the stage reports, the changelogs, `README.md`, `RELEASING.md`, and `release.sh`. Removing them would 404 URLs the legacy site answers. Asset paths inside the game stay the repository paths (`assets/`, the root icons, `manifest.webmanifest`, `version.json`).

Excluded:

- `.git`, which is not in the tree.
- `.github`, removed before upload. `actions/upload-pages-artifact` also excludes `.git` and `.github` itself. Workflow files are not part of the live site today (the path 404s) and must not become part of it.

`.nojekyll` handling:

- `upload-pages-artifact` v5 defaults `include-hidden-files` to false, which drops dotfiles, including `.nojekyll`. The workflow sets `include-hidden-files: true`.
- The stage script leaves `.nojekyll` in place when the commit has it. The floor commit has it, so the first artifact is the commit tree with `.github` absent (it is already absent on that commit).
- If a later commit deletes `.nojekyll`, the stage script writes an empty one. Actions does not run Jekyll either way. The file keeps the published set aligned with the legacy marker.

`actions/configure-pages` is called with `enablement: false` (also the action default). It GETs the existing Pages site. In that action, `createPagesSite` with `build_type: workflow` runs only when no site exists and `enablement` is true. This repository already has a site, so the step does not change `build_type`.

## Required GitHub settings

Set these before the first dispatch. This pull request does not change them.

### Environment `github-pages` (id `25223236544`)

Queried with `GET /repos/gamedevjake/lichlight/environments/github-pages` and `GET .../deployment-branch-policies` on 2026-11-06:

- `can_admins_bypass`: `true`
- `protection_rules`: one rule, type `branch_policy`, id `69969309`
- `deployment_branch_policy`: `protected_branches` false, `custom_branch_policies` true
- Branch policies:
  - id `64215210`, name `gh-pages`, type `branch`
  - id `64215212`, name `main`, type `branch`
- No tag policies
- No required reviewers
- No wait timer
- No `gh-pages` branch on the remote (`git ls-remote` returned only `main`)

The deployment rule matches the workflow run's `GITHUB_REF`, not the site SHA in the input. A `workflow_dispatch` started from branch `main` already matches the `main` branch policy. That is necessary and not sufficient: add the reviewer as well.

Do not switch the environment to "Protected branches only". If `main` has no branch protection, that mode allows every branch.

Leave the `main` branch policy in place. Do not add a tag policy. The site tag is an input; the run itself must be from branch `main`. The unused `gh-pages` branch policy can stay. This workflow still refuses a `GITHUB_REF` other than `refs/heads/main`.

### Required reviewers are available

The repository is public. GitHub's deployment-environment docs say environments and deployment protection rules are available in public repositories for all current plans, and that required reviewers on Free, Pro, and Team are available for public repositories. This repo already has an environment protection rule (`branch_policy`), so it is not on a legacy plan that lacks environments.

This audit could not read the account billing plan. `GET /user` with the read-only integration token returned 403. The public-repo rule plus the existing protection rule is enough: adding `gamedevjake` as a required reviewer is supported.

### (a) Add Jake and confirm the branch rule

UI (preferred; it does not rewrite the branch name list):

1. **Settings → Environments → github-pages**.
2. Enable **Required reviewers** and add `gamedevjake`.
3. Leave **Prevent self-review** off.
4. Turn **Allow administrators to bypass configured protection rules** off if the approval must be mandatory. It is on today, so an admin can skip the review. Leave it on only if that bypass is intentional.
5. Under **Deployment branches and tags**, keep **Selected branches and tags**. Confirm a branch rule named `main` is listed. Do not add a tag rule.

API equivalent for the reviewer. Branch name rules are a separate resource. Sending `custom_branch_policies: true` keeps the mode that those rules use. After the call, list the policies again and confirm `main` (id `64215212`) is still there.

```sh
gh api -X PUT repos/gamedevjake/lichlight/environments/github-pages \
  --input - <<'JSON'
{
  "prevent_self_review": false,
  "reviewers": [
    { "type": "User", "id": 2687229 }
  ],
  "deployment_branch_policy": {
    "protected_branches": false,
    "custom_branch_policies": true
  }
}
JSON

gh api repos/gamedevjake/lichlight/environments/github-pages/deployment-branch-policies
```

`can_admins_bypass` is visible on the environment GET and is not a field of this PUT body. Change that toggle in the UI.

## Cutover

Do the steps in order. Stop if a check does not match.

### (b) Merge the pull request

Merging while `build_type` is still `legacy` and the source is `main` `/` makes the legacy builder publish the merge commit. The game files match `19318e31423238c2680423e25ce8f816a91c2450`. The new public paths are this document, `.github/release-floor.txt`, and the workflow files (legacy serves the tree; `.nojekyll` does not hide `.github`). That legacy rebuild is an effect of merging, before Actions is switched on. The game players load does not change.

### (c) Switch Pages to GitHub Actions

```sh
gh api -X PUT repos/gamedevjake/lichlight/pages -f build_type=workflow
gh api repos/gamedevjake/lichlight/pages --jq '{build_type,source,html_url,status}'
```

Expect `build_type` `workflow`. The current site stays up until a workflow deploy replaces it. Do not dispatch until step (a) is saved.

### (d) Dispatch the live commit and approve

```sh
gh workflow run pages-publish.yml --ref main \
  -f ref=19318e31423238c2680423e25ce8f816a91c2450
```

Confirm the summary SHA is `19318e31423238c2680423e25ce8f816a91c2450`, `version.json` is still `0.7.18`, and the tag is `(none)` (nothing points at that commit). Then approve.

### (e) Smoke test

Run this against https://gamedevjake.github.io/lichlight/ after the deploy is green. A hard refresh is enough. There is no service worker.

- **Page load.** The title screen appears. The corner reads `v0.7.18`.
- **Asset 404 scan.** DevTools → Network, disable cache, reload, filter status 404. `version.json`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `icon-180.png`, and the `assets/` requests the page makes should be 200. Confirm with:

  ```sh
  curl -sI https://gamedevjake.github.io/lichlight/version.json
  curl -sI https://gamedevjake.github.io/lichlight/manifest.webmanifest
  curl -sI https://gamedevjake.github.io/lichlight/.nojekyll
  curl -sI https://gamedevjake.github.io/lichlight/icon-192.png
  ```

- **Desktop controls.** Click-walk, click an enemy, open the bag (`I` or `B`), open the map (`M`), pause (`Esc`).
- **Mobile / touch.** A phone in landscape, or a narrow viewport with touch emulation. Drag the stick, hold **ATTACK**, tap **ROLL**, open the bag, and use **USE** next to an interactable.
- **Satchel.** Continue a character that has a bag expansion, or note a character that does not. Open the bag and confirm the slot count. Equipped gear stays put.
- **Existing save, then a new game.** Continue first. Gear should still be equipped and the run should still be on its floor. Stage 10 saves are what the floor is protecting. For a new game, add a second character if the title offers profiles, so `cryptdelve` is not thrown away. If there is only one character, copy `localStorage.getItem('cryptdelve')` out of DevTools before **New Game**. **New Game** discards the active run.
- **Version and update banner.** `version.json` body is `{"version":"0.7.18"}`. The title string is `v0.7.18`. The "newer version" modal must not appear, because the published file is not newer than `VERSION`. If the modal appears, stop and roll back.
- **Manifest and Add to Home Screen.** DevTools → Application → Manifest. `start_url` and `scope` are `./`. Icons load. On iPhone, Share → Add to Home Screen and launch the icon. On Android, the install path or Add to Home screen. The game should open, and one tap should unlock sound if iOS starts muted.
- **Console.** No new errors on load, on a short walk, or while the bag is open. Ignore messages injected by browser extensions.

### (f) If that deploy fails

Use the legacy switch in [Rollback](#rollback). Then re-check `build_type` is `legacy`, source branch `main`, path `/`. The site rebuilds from `main`. Do not dispatch `v0.7.18` to "undo" a failed Actions run.

## Local checks

These do not deploy:

```sh
.github/scripts/test-pages-publish.sh
actionlint .github/workflows/pages-publish.yml
yamllint -d '{extends: default, rules: {line-length: {max: 120}, truthy: {check-keys: false}}}' .github/workflows/pages-publish.yml
shellcheck .github/scripts/*.sh
```

`on:` is a workflow key, so yamllint's truthy key check is disabled. The pinned `uses:` lines are longer than 80 characters.

`test-pages-publish.sh` expects `origin/main` to contain the floor commit. It rejects `a492023…` for the floor, rejects short SHAs and the branch name `main`, rejects a commit that is not on `main`, and checks the staged tree of `19318e3…` file by file.
