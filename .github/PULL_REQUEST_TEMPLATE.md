## What & why

Describe what changes for the people using the product and why, and link the issue (`Fixes #123`)
or write `No issue: <reason>`.

## How you verified it

Name the commands you ran and what they showed (`bun run verify`, the page in the running app...).
If you added no tests, say why. For UI changes, include screenshots of the real page at desktop and
mobile width, light and dark, hosted in the R2 evidence bucket through the `pr-delivery` skill.

## Impact

Say whether this changes a public URL or API route, the database schema or a migration, an
environment variable, or a theme token. Name which and whether docs need an update. "No impact" is
a fine answer; just say it.

---

- [ ] `bun run verify` passes locally with zero errors and zero warnings; this PR is delivered only after its required CI checks are green
- [ ] New or changed behavior is covered by tests, or I explained above why not
- [ ] If an agent wrote or co-wrote this, I named it above and verified the result myself
