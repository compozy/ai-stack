# ai-stack

A TypeScript project template for building web apps with coding agents. It is a runnable Bun +
Turborepo monorepo, not a generator: the template passes its own checks, and
`scripts/create.ts` copies it into a new project with one of two shapes.

## What you get

- **Two shapes.** `start`: one TanStack Start app (`apps/web`) with server functions.
  `api`: a Hono API with an OpenAPI contract (`apps/api`) plus a Vite SPA (`apps/app`) that
  calls it through a generated, typed client.
- **Frontend.** React 19 with the React Compiler, TanStack Router and Query, Tailwind CSS 4.
- **UI library.** `packages/ui`: shadcn Base Nova components on Base UI plus ReUI components,
  installed from their public registries (both MIT, `packages/ui/LICENSES/`), lucide icons and a
  neutral theme to replace with your brand.
- **Data and auth.** `packages/db`: Drizzle + Postgres (docker compose locally) with migrations
  and an integration-test harness. Better Auth (email + password) on the Drizzle adapter.
  Validation with Zod 4.
- **Storybook.** Stories run as Vitest browser tests in Chromium (Playwright), in light and dark,
  with accessibility checks (`docs/design/storybook.md`).
- **Tooling.** oxlint and oxfmt, React Doctor, Vitest, commitlint + husky + lint-staged, and
  GitHub Actions CI. `bun run verify` runs format, lint, doctor, codegen check, typecheck, tests
  and build.
- **Agent setup.** `CLAUDE.md` (with `AGENTS.md` linked to it) holds the stack, commands, rules
  and a skill dispatch table that coding agents follow in every generated project. Agent skills
  for the stack are vendored in `.agents/skills` with a `skills-lock.json` (see
  [Agent skills](#agent-skills)).

## Quick start

Requires Bun 1.4.4+, Node 24+, Git and Docker (for Postgres).

```bash
git clone https://github.com/compozy/ai-stack.git
bun ai-stack/scripts/create.ts my-project --shape start   # TanStack Start app
bun ai-stack/scripts/create.ts my-project --shape api     # Hono API + Vite SPA

cd my-project
bun run db:up && bun run db:migrate
bun run verify
bun dev
```

`create.ts` copies the template without the other shape, renames the `@acme/*` scope to your
project name, writes `.env.local` (fresh `BETTER_AUTH_SECRET`, a free Postgres port), runs
`bun install` and makes the first commit. The skills come with the copy; the `start` shape
removes `hono` through the skills CLI. Flags: `--dir <path>`, `--no-skills` (leave out every
vendored skill and the lock), `--no-install`.

The `start` app runs on <http://localhost:3000>; in the `api` shape the API runs on port 3001 and
the SPA on <http://localhost:3002>.

## Agent skills

Skills are committed in `.agents/skills` (Claude Code reads them through `.claude/skills`
symlinks that `bun install` creates) and managed with the
[`skills`](https://github.com/vercel-labs/skills) CLI; `skills-lock.json` records the source and
hash of each one. Every generated project starts with the same set.

- [`pedronauck/skills`](https://github.com/pedronauck/skills) (31): `react`, `tanstack`, `tailwindcss`, `shadcn`, `zod`, `vitest`, `typescript-advanced`, `drizzle-safe-migrations`, `hono` (api shape only), `storybook-stories`, `app-renderer-systems`, `ui-craft`, `vercel-react-best-practices`, `vercel-composition-patterns`, `testing-boss`, `no-workarounds`, `deslop`, `systematic-debugging`, `context7`, `git-rebase`, `agent-exploration`, `to-prompt`, `spec-peer-review`, `qa-execution`, `qa-report`, `ddd-master`, `writing-agents-md`, `writing-skills`, `architectural-analysis`, `refactoring-analysis`, `mermaid-diagrams`
- [`mattpocock/skills`](https://github.com/mattpocock/skills) (8): `grill-me`, `grilling`, `handoff`, `codebase-design`, `domain-modeling`, `grill-with-docs`, `improve-codebase-architecture`, `wayfinder`
- [`jakubkrehel/skills`](https://github.com/jakubkrehel/skills) (5): `better-accessibility`, `better-colors`, `better-layout`, `better-typography`, `better-ui`
- [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable): `impeccable`
- [`vercel/turborepo`](https://github.com/vercel/turborepo): `turborepo`
- [`millionco/react-doctor`](https://github.com/millionco/react-doctor): `react-doctor`
- [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills): `performance-optimization`

```bash
npx skills add <owner/repo> --skill <name> -a claude-code -a codex -y   # add
npx skills update -p -y                                                 # update all
npx skills experimental_install                                         # restore from the lock
```

Commit the skill folder and the lock together, and never hand-edit a vendored skill: the next
update overwrites it.

## Recipes

Optional modules live in [`recipes/`](recipes): [Inngest](recipes/inngest.md) (background jobs),
[Resend](recipes/resend.md) (email), [Sentry](recipes/sentry.md) (error reporting) and
[Vercel Cron](recipes/vercel-cron.md). Each one lists the shapes it fits, the skills, env vars
and services it needs, and the steps an agent follows to apply it; only the recipes that fit
the chosen shape are copied.

## Docs

- [INSTRUCTIONS.md](INSTRUCTIONS.md): the procedure an agent follows to pick a shape, create,
  prove and extend a project.
- [CLAUDE.md](CLAUDE.md): the stack, commands and rules every generated project starts with.
- [docs/design/](docs/design): Storybook conventions.

## Working on the template

`bun install`, `bun run db:up`, `bun run db:migrate`, then `bun run verify`. Both shapes live side
by side here (web on 3000, api on 3001, app on 3002). The `Template` workflow scaffolds each
shape and runs `verify` inside it.

## License

[MIT](LICENSE). The shadcn and ReUI components keep their own MIT notices in `packages/ui/LICENSES/`.
The vendored skills in `.agents/skills` keep the license of their source repository (listed in
[Agent skills](#agent-skills)).
