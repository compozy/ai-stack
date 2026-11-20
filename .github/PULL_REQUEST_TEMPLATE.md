<!--
Title format: <type>: <description> — type is one of feat | fix | refactor | perf | docs | test | build | ci.
No scope. The title becomes the squash commit, and CI checks it with commitlint.
  Good: fix: keep the dialog open after a failed submit
  Bad:  feat(web): new page · update stuff · fix #123
-->

## What & why

<!-- What changes for the people using the product, and why. Link the issue if there is one:
     Fixes #123 -->

## How you verified it

<!-- Commands you ran and what they showed (`bun run verify`, the page in the running app...).
     If you added no tests, say why. -->

## Screenshots

<!-- Required for UI changes: desktop and mobile width, light and dark.
     Attach with `gh pr create --attach './shot.png#Alt text'` or drag the files here.
     Delete this section when nothing visible changed. -->

## Impact

<!-- Does this change a public URL or API route, the database schema or a migration, an
     environment variable, or a theme token? Name which and whether docs need an update.
     "No impact" is a fine answer — just say it. -->

---

- [ ] `bun run verify` passes locally with zero errors and zero warnings; this PR is delivered only after its required CI checks are green
- [ ] New or changed behavior is covered by tests, or I explained above why not
- [ ] If an agent wrote or co-wrote this, I named it above and verified the result myself
