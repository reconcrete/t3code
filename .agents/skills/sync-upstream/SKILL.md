---
name: sync-upstream
description: Sync this personal T3 Code fork with official T3 Code releases. Rebases the custom branch (local patches) onto the newest stable upstream release, resolves conflicts, verifies, pushes, and builds the macOS desktop app. Use when asked to sync, update, or rebase the fork, or on a scheduled sync run.
---

# Sync the fork with official T3 Code releases

## Branch model

- `upstream` = `https://github.com/pingdotgg/t3code` (official). `origin` = the personal fork.
- `custom` = the newest **stable release tag** (`vX.Y.Z`, no `-nightly`/`-preview`) plus the
  personal patches. The desktop app is built from `custom`.
- The personal patches are `git log --oneline <base-tag>..custom`. `FORK.md` at the repo
  root describes each one: what it must keep doing, where it hooks into upstream code,
  and how to check it. Read it before rebasing.
- Why releases and not `main`: the custom app uses the same data folder (`~/.t3`) as the
  official app. `main` carries database migrations that no release has yet; once they run,
  official builds refuse that database. Release tags keep the database interchangeable.

Work in `~/Projects/t3code`. If `vp` is missing from PATH, run `. "$HOME/.config/vite-plus/env"`.

## Steps

1. **Preflight.** `git status --porcelain` must be empty and the current branch must be
   `custom`. If not, stop and report; never stash or discard someone's work.
   `git config rerere.enabled` must be `true` so repeated conflicts resolve themselves.

2. **Find the bases.**

   ```sh
   git fetch upstream --tags --prune && git fetch origin --prune
   NEW=$(git tag -l 'v*' --sort=-v:refname | grep -Ev -- '-(nightly|preview)' | head -1)
   OLD=$(git describe --tags --abbrev=0 --exclude '*-nightly*' --exclude '*-preview*' custom)
   ```

   If `NEW` equals `OLD`, report "already on the latest release ($NEW)" and stop.
   Also fast-forward the mirror: `git push origin "refs/remotes/upstream/main:refs/heads/main"`.

3. **Back up, then rebase.**

   ```sh
   git tag -f "pre-sync/$(date +%Y-%m-%d)" custom
   git rebase --onto "$NEW" "$OLD" custom
   ```

   On a conflict, read both sides and the patch's `FORK.md` entry before editing.
   Upstream wins on its own intent (renames, refactors, new behavior). Re-apply the
   behavior the entry describes on top of the new code instead of restoring the old code.
   For `apps/web/src/routeTree.gen.ts`, take the base's side (`git checkout --ours <file>`;
   mid-rebase, "ours" is the new base and "theirs" is our patch), and after the rebase run
   `vp run --filter @t3tools/web build`. The TanStack Router plugin regenerates it with
   our routes included. Commit that result as a fixup of the patch that added the route.
   - `git diff --name-only --diff-filter=U` lists conflicted files.
   - `git show REBASE_HEAD` shows the patch being replayed.
   - After resolving: `git add <files> && GIT_EDITOR=true git rebase --continue`.
   - If upstream already shipped an equivalent of a patch, `git rebase --skip` it and say so.
   - If a conflict cannot be resolved with confidence, `git rebase --abort`, leave
     `custom` untouched, and report which patch and files conflict.

4. **Install and verify.**

   ```sh
   vp i && git checkout -- pnpm-lock.yaml 2>/dev/null || true
   CHANGED=$(git diff --name-only "$NEW" custom -- 'apps/*' 'packages/*')
   ```
   - Typecheck each package the patches touch, e.g. `vp run --filter @t3tools/web typecheck`.
   - `vp lint $CHANGED` and `vp fmt --check $CHANGED`.
   - Run the test files among `$CHANGED` and the `*.test.ts` beside changed files with
     `vp test run <files>` from the owning package.
     Fix failures inside the patch they belong to: `git commit --fixup <patch-sha>`, then
     `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash "$NEW"`. Do not run repo-wide checks.
   - Run each entry's "Check" step from `FORK.md`.
   - Keep `FORK.md` accurate. Every `feat` patch needs an entry, so write any that are
     missing from the commit. Update entries whose hook points moved during resolution,
     and remove entries for dropped patches. Fold the edit into the patch it describes
     (or into the skill commit if it spans several).

5. **Push.**

   ```sh
   git push --force-with-lease origin custom
   git push -f origin "pre-sync/$(date +%Y-%m-%d)"
   ```

6. **Build.**

   ```sh
   RUSTUP_TOOLCHAIN=1.95.0 T3CODE_DESKTOP_VERSION="${NEW#v}" vp run dist:desktop:dmg
   ```

   `T3CODE_DESKTOP_VERSION` matters: package.json on a release tag still holds the previous
   version, and official builds stamp the tag's version at build time.
   The build compiles a Rust helper; the default `stable` toolchain here is too old, so a
   pinned toolchain is used for this command only. If cargo reports a newer `rustc`
   requirement, `rustup toolchain install <version> --profile minimal` and use that version.
   Never change the user's default toolchain.
   The unsigned DMG lands in `release/`. Report its path. Do not install it or quit the
   running T3 Code app yourself: this agent is probably running inside it.

7. **Report.** Old and new release, notable upstream changes between them
   (`git log --oneline "$OLD..$NEW" | grep -E '^\w+ (feat|fix)'`), each personal patch and
   whether it replayed cleanly, was hand-resolved, or was dropped, any upstream change
   that overlaps a fork feature (it may be worth dropping ours), check results, and the
   DMG path. Rollback point: `git reset --hard pre-sync/<date>`.
   Install steps for the user: quit T3 Code, open the DMG, drag the app into
   Applications and replace the existing one, then open it.

## Safety

- Never start a dev server against `~/.t3/userdata`; this checkout is not a worktree, so
  always pass `--home-dir "$PWD/.t3"` to `vp run dev`.
- Never build `custom` from `upstream/main` or a nightly tag (see Branch model).
- Never push to `upstream`. Never kill processes by name pattern.
