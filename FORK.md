# Personal fork features

This fork is upstream T3 Code plus the features below, kept as commits on `custom` on top
of the latest stable release tag. `.agents/skills/sync-upstream` replays them onto new
releases. Each entry gives what a conflict resolution has to keep working. It does not
describe the code; read the commit for that.

Rules for features:

- One feature is one commit. Fix a feature with `git commit --fixup <sha>` and autosquash,
  so each entry here maps to a single patch.
- Keep the footprint in upstream files small. Put the logic in new files and hook it in
  with a few lines, because new files never conflict.
- Keep the data folder interchangeable with official builds. Store fork state client-side
  (localStorage or new optional fields in UI state). Add no server migrations, settings
  schema fields, or contract values that official builds would reject.
- Adding a feature means adding an entry here in the same commit.

## Environment filter

Commit: `feat(web): filter sidebar threads by environment`

- The sidebar filter menu lists environments above projects. Picking one narrows the thread
  list, sidebar search, and settled history to that environment.
- Environment and project scopes **intersect** (`resolveSidebarScopedProjectKeys` in
  `Sidebar.logic.ts`). Either one unset means that axis is unscoped.
- Persisted as `sidebarEnvironmentScopeIds` in `uiStateStore.ts`, an optional field, so
  official builds ignore it.
- Conflicts land in `Sidebar.tsx`, which upstream changes often. Re-attach the environment
  scope to wherever upstream now computes the scoped project set. Do not restore the old
  sidebar code.
- Check: `Sidebar.logic.test.ts` and `uiStateStore.test.ts`, then pick an environment and
  confirm that threads, search, and settled history all narrow.

## Sidebar views ("spaces")

Commit: `feat(web): sidebar views`

- A view is a named set of projects from any environment, keyed as
  `${environmentId}:${projectId}`. Views are created and edited in
  Settings > General > Views (`/settings/views`).
- A picker to the left of the project filter applies one view. It intersects with the
  environment and project filters, and selecting no view means all threads.
- Stored in localStorage (`t3code:sidebar:views` and `t3code:sidebar:active-view`), with
  nothing on the server.
- Most of the code is in new files (`sidebarViews.ts`, `SidebarViewPicker.tsx`,
  `SidebarViewsSettings.tsx`, `_chat.settings.views.tsx`). Conflicts land in the hooks:
  `Sidebar.tsx`, `SidebarThreadHeader.tsx`, the settings nav/search/scope files, and
  `routeTree.gen.ts`. Don't hand-merge `routeTree.gen.ts`: take upstream's version and
  regenerate it.
- Check: `Sidebar.logic.test.ts`, then create a view and confirm the picker filters the
  list and that the settings search finds "Views".

## Sidebar view shortcuts

Commit: `feat(web): shortcuts for sidebar views` (depends on Sidebar views)

- `sidebarView.jump.1`–`9` default to `mod+alt+1`–`9` and can be rebound in
  Settings > Keybindings. The Nth shortcut opens the Nth view in picker order, and pressing
  the active view's shortcut again returns to all threads.
- The commands are in `STATIC_KEYBINDING_COMMANDS` (contracts) and `DEFAULT_KEYBINDINGS`
  (shared). If upstream later takes `mod+alt+<digit>` for something of its own, upstream
  keeps it and these defaults move.
- Compatibility: a `keybindings.json` that rebinds these commands may fail to load in
  official builds. Defaults alone are fine.
- Check: `keybindings.test.ts`.
