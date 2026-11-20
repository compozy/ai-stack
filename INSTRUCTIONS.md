# Starting a project from ai-stack

Agent-facing procedure. Follow it top to bottom when the user asks for a new project. It is
template-only: `scripts/create.ts` does not copy it into the project.

## 1. Pick the shape

| Shape | Apps | Pick it when |
| `start` | `apps/web`: TanStack Start, server functions | Dashboards, internal tools, MVPs: one app, one Vercel deploy, no public API |
| `api` | `apps/api`: Hono + OpenAPI; `apps/app`: Vite SPA | A product with its own API: other clients (mobile, MCP, integrations), heavy jobs, deploy off Vercel |

Both shapes share `packages/db` (Drizzle + Postgres), `packages/ui` (shadcn base-nova), Better
Auth, the root tooling and `bun run verify`. When the request does not say, ask which shape; if
it is clearly an internal tool, use `start` and say so.

## 2. Create it

From the directory that should contain the project, with a clone of this repository at
`<template>` (`git clone https://github.com/compozy/ai-stack.git`):

```bash
bun <template>/scripts/create.ts <name> --shape start|api
```

`<name>` is kebab-case; it becomes the folder, the `@<name>/*` scope, the database and the title.
The script copies the template, drops the other shape, writes `.env.local` (fresh
`BETTER_AUTH_SECRET`, a free Postgres port), carries over the vendored skills in
`.agents/skills` with `skills-lock.json` (the `start` shape removes `hono` with
`npx skills remove`), updates every skill to its latest version (`npx skills update`), runs
`bun install`, formats and makes the first commit. Flags: `--dir <path>`, `--no-skills` (copy no
vendored skill and no lock), `--frozen-skills` (skip the update and keep the template's
versions), `--no-install`. A failed update is a warning, not a failure: the project keeps the
template's copies and `bun run skills:update` retries it.

## 3. Prove it runs

```bash
cd <name>
bun run db:up && bun run db:migrate
bun run verify
bun dev
```

Open the app (start: <http://localhost:3000>, api: <http://localhost:3002>), create an account and
see the home page greet you. Stop here and report if any step fails; do not patch around it.

## 4. Add what the project needs

- Optional modules are in `recipes/*.md` (only the ones that fit the shape are copied). Apply
  each one by following its steps, then run `bun run verify`. Each recipe lists the skills it
  needs that the project does not vendor yet (`inngest`, `sentry-cli`); install them with
  `npx skills add pedronauck/skills --skill <name> -a claude-code -a codex -y` and commit the
  folder with the lock. `bun run skills:update` brings every vendored skill to its latest
  version.
- Replace the neutral tokens in `packages/ui/src/styles/theme.css` with the brand (keep AA
  contrast: the Storybook a11y tests check it). `packages/ui` already holds the shadcn and
  ReUI components; more come from `bunx shadcn add <name>` or `bunx shadcn add @reui/<name>` in
  `packages/ui`.
- Replace the example route (`/` greeting) with the first real feature. Keep the auth wiring.
- Write the project's purpose and domain rules into `CLAUDE.md` (keep it short; it is read on
  every turn).

## 5. Outward-facing steps (ask first)

Creating the GitHub repository, linking Vercel, setting production env vars and buying domains
are outward-facing: confirm with the user before each one.

## Maintaining the template

- The template must always pass its own gate: `bun run verify` here, and the `Template` workflow,
  which scaffolds both shapes and runs `verify` inside each. Storybook runs web on 6006 and app
  on 6007.
- Refresh the template's skills before a release with `bun run skills:update` and commit the
  changed folders with the lock, so `--frozen-skills` projects and offline scaffolds are recent.
- Bump pins in one place per package and keep the workspace on a single version of each.
- Skills are vendored in `.agents/skills` and pinned in `skills-lock.json`; manage them only with
  the skills CLI (`npx skills add|update|remove`, `-a claude-code -a codex -y`) and never edit a
  vendored file by hand. Skills one shape has no use for are listed in
  `SHAPES.<shape>.removeSkills` in `scripts/create.ts`, which removes them with the CLI.
  `create.ts` copies vendored files byte for byte so the hashes keep matching.
- Skills in the template, by source:

  - [`pedronauck/skills`](https://github.com/pedronauck/skills) (34): `react`, `tanstack`, `tailwindcss`, `shadcn`, `zod`, `vitest`, `typescript-advanced`, `drizzle-safe-migrations`, `hono` (api shape only), `storybook-stories`, `app-renderer-systems`, `xstate-store`, `ui-craft`, `tech-logos`, `vercel-react-best-practices`, `vercel-composition-patterns`, `testing-boss`, `no-workarounds`, `deslop`, `systematic-debugging`, `context7`, `git-rebase`, `deps-update`, `agent-exploration`, `to-prompt`, `spec-peer-review`, `qa-execution`, `qa-report`, `ddd-master`, `writing-agents-md`, `writing-skills`, `architectural-analysis`, `refactoring-analysis`, `mermaid-diagrams`
  - [`mattpocock/skills`](https://github.com/mattpocock/skills) (8): `grill-me`, `grilling`, `handoff`, `codebase-design`, `domain-modeling`, `grill-with-docs`, `improve-codebase-architecture`, `wayfinder`
  - [`jakubkrehel/skills`](https://github.com/jakubkrehel/skills) (5): `better-accessibility`, `better-colors`, `better-layout`, `better-typography`, `better-ui`
  - [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable): `impeccable`
  - [`vercel/turborepo`](https://github.com/vercel/turborepo): `turborepo`
  - [`millionco/react-doctor`](https://github.com/millionco/react-doctor): `react-doctor`
  - [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills): `performance-optimization`
  - [`exa-labs/agent-skills`](https://github.com/exa-labs/agent-skills): `exa-search`

- Files that must not reach projects are listed in `TEMPLATE_ONLY` in `scripts/create.ts`.
- Shape-specific text in copied files sits between `<shape:start>` / `</shape:start>` (or `api`)
  marker lines, in any comment syntax; create.ts keeps the chosen shape and removes the markers.
- New recipes: one `recipes/<name>.md` with `shapes`, `skills`, `env` and `services` frontmatter,
  ported from a project where the code already runs, and checked by applying it to a freshly
  created project and running `verify`.
