# Acme

Bun + Turborepo monorepo. `CLAUDE.md` is canonical; `AGENTS.md` is a symlink made by
`scripts/postinstall.sh`.

## Stack

<!-- <shape:start> -->

- `apps/web`: TanStack Start (React 19, file routes in `src/routes`, server functions), Nitro
  build (Vercel preset is picked up on deploy). Port 3000.

<!-- </shape:start> -->
<!-- <shape:api> -->

- `apps/api`: Hono + `@hono/zod-openapi` on Bun. `src/platform/*` holds env, auth, HTTP and
  errors; `src/modules/<area>/*` holds one feature each. Port 3001, contract at `/openapi.json`.
- `apps/app`: React 19 SPA on Vite, TanStack Router (code routes in `src/router.tsx`) and Query.
  Calls the API only through `openapi-fetch` (`src/lib/api.ts`). Port 3002.

<!-- </shape:api> -->

- `packages/db`: Drizzle + postgres.js. Schema in `src/schema`, migrations in `drizzle/`,
  integration harness in `src/testing.ts`.
- `packages/ui`: the UI library, shadcn Base Nova components on Base UI (`components/<name>`) and
  ReUI components (`components/reui/<name>`), installed from their public registries and kept as
  is (`packages/ui/README.md`). Theme tokens in `src/styles/theme.css`; icons from
  `@acme/ui/lib/icons` (lucide-react). Add components with `bunx shadcn add <name>` or
  `bunx shadcn add @reui/<name>` from `packages/ui`.
- Auth: Better Auth (email + password) with the Drizzle adapter. Validation: zod 4.
- React Compiler is on: never write `memo`, `useMemo` or `useCallback`.
- React Doctor: `doctor.config.mjs` in each package holds its exceptions, each with its reason;
  `.oxlintrc.json` runs its main rules at edit time; CI comments on PRs and sets a commit status.
  `packages/ui` ignores the vendored components and hooks (lint skips them too).

## Commands

| Command                              | What                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `bun run db:up`                      | Start Postgres (docker compose, port from `.env.local`)                             |
| `bun run db:generate` / `db:migrate` | Create / apply a migration after a schema change                                    |
| `bun dev`                            | Every app in watch mode                                                             |
| `bun run storybook`                  | Storybook of the UI and app views                                                   |
| `bun run doctor`                     | React Doctor scan of every React package; a warning fails it                        |
| `bun run verify`                     | Format, lint, doctor, codegen check, typecheck, test, build. The definition of done |

<!-- <shape:api> -->

`bun run codegen` regenerates `apps/api/openapi.json` and `apps/app/src/generated/api.d.ts` from
the API routes; `verify` fails when they are stale.

<!-- </shape:api> -->

Integration tests (`*.it.test.ts`) run only when `TEST_DATABASE_URL` is set; locally use the
`DATABASE_URL` from `.env.local` (each suite creates and drops its own database). CI sets it.

## Rules

- Run `bun run verify` before calling work done. Fix the code, never weaken a test.
- Env lives in the root `.env.local` (template: `.env.example`). Add every new key to both.

<!-- <shape:start> -->

- Every data server function calls `requireUser()` first. Route guards are UX, not access control.

<!-- </shape:start> -->
<!-- <shape:api> -->

- Every API route is declared with `createRoute` so it reaches the contract; run `bun run codegen`
  after changing one. Protected routes use `requireSession(auth)`.
- The SPA never imports `@acme/db`; persistence goes through the API.

<!-- </shape:api> -->

- Shared code moves to `packages/*` only when a second app needs it.
- Add dependencies with an exact version (`bunfig.toml` pins); keep one version per package
  across the workspace.
- Commits follow Conventional Commits without scope (`feat: ...`), enforced by commitlint.
- Code and docs in English.

## Storybook

- Views take props and callbacks; routes own data and auth. Stories never import the data layer,
  and production code never imports stories, fixtures or Storybook tooling (lint enforces it).
- Stories (`*.stories.tsx`, `docs/design/storybook.md`) run in Chromium in light and dark with
  a11y checks as part of `test`; a `play` assertion names its invariant and owner.

## Skill Dispatch

Activate the matching skill before writing code. Skills live in `.agents/skills` (Claude Code
reads the `.claude/skills` symlinks); origins are in `skills-lock.json`.

| Task                                             | Activate first                                                                   |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| React components, hooks, state                   | `react`, `vercel-react-best-practices`, `vercel-composition-patterns`            |
| Routes, loaders, Query, server functions, forms  | `tanstack`                                                                       |
| Feature modules (adapters, Query hooks, exports) | `app-renderer-systems`                                                           |
| Any visible UI: screen, component, UI review     | `impeccable`, `ui-craft` (+ `better-*` for the dimension)                        |
| Tailwind classes, `@theme`, tokens               | `tailwindcss`                                                                    |
| Components in `packages/ui` (shadcn, ReUI)       | `shadcn`                                                                         |
| Stories and Storybook tests                      | `storybook-stories`                                                              |
| Schemas, validation, advanced types              | `zod`, `typescript-advanced`                                                     |
| Schema change, migration, backfill               | `drizzle-safe-migrations`                                                        |
| Writing tests                                    | `testing-boss`, `vitest`                                                         |
| React Doctor scan, triage or rule tuning         | `react-doctor`                                                                   |
| Slow page, bundle, query or Core Web Vitals      | `performance-optimization`                                                       |
| Turborepo tasks, caching, new package            | `turborepo`                                                                      |
| Bug or unexpected behavior                       | `systematic-debugging`, `no-workarounds`                                         |
| Domain terms, glossary, ADRs, bounded contexts   | `domain-modeling`, `ddd-master`                                                  |
| Module boundaries and interfaces                 | `codebase-design`, `improve-codebase-architecture`                               |
| Codebase audit or refactoring plan               | `architectural-analysis`, `refactoring-analysis`                                 |
| Unfamiliar code, before changing it              | `agent-exploration`                                                              |
| Planning or stress-testing a decision            | `grilling`, `grill-me`, `grill-with-docs`; `spec-peer-review` for a written spec |
| Work bigger than one session                     | `wayfinder`                                                                      |
| QA plans and dogfooding through the UI           | `qa-report`, `qa-execution`                                                      |
| Handing work to another agent                    | `handoff`, `to-prompt`                                                           |
| Library or API docs                              | `context7`                                                                       |
| Diagrams                                         | `mermaid-diagrams`                                                               |
| Rebasing or cleaning history                     | `git-rebase`                                                                     |
| Claiming a task complete                         | `deslop`                                                                         |
| Editing CLAUDE.md or a skill                     | `writing-agents-md` / `writing-skills`                                           |

<!-- <shape:api> -->

API routes, middleware and the OpenAPI contract in `apps/api`: `hono`.

<!-- </shape:api> -->

## Skills and recipes

- Skills are vendored: `.agents/skills` is committed and `skills-lock.json` records each one's
  source and hash. Every skill comes from a public repository through the
  [`skills`](https://github.com/vercel-labs/skills) CLI.
- Add one: `npx skills add <owner/repo> --skill <name> -a claude-code -a codex -y` (repeat
  `--skill` for several from the same source). Update: `npx skills update -p -y`. Remove:
  `npx skills remove <name> -y`. Restore from the lock: `npx skills experimental_install`.
  Commit the skill folder and the lock together.
- Never hand-edit a vendored skill: the next update overwrites it and the hash stops matching.
  Put project rules here or in a skill of the project's own.
- Optional modules (jobs, email, error reporting, cron) live in `recipes/*.md`. Apply one by
  following its steps, then run `bun run verify`.
