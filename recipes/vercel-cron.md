---
name: vercel-cron
description: Scheduled jobs on Vercel Cron behind a CRON_SECRET bearer, with optional Vercel Workflow
shapes: [start]
env: [CRON_SECRET]
---

# Vercel Cron

Use this for periodic work in a start app deployed on Vercel: Vercel calls a server route on a
schedule with `Authorization: Bearer <CRON_SECRET>`. Each job is a plain server route, so it also
runs by hand with `curl`. For long multi-step jobs, add the Workflow section at the end.

## 1. Environment

Add to BOTH `.env.example` (empty) and `.env.local` (`openssl rand -base64 32`), and set it in the
Vercel project env:

```bash
# Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`. Generate with: openssl rand -base64 32
CRON_SECRET=
```

## 2. Code

Create `apps/web/src/lib/cron.ts`:

```ts
import { createHash, timingSafeEqual } from "node:crypto";

/** Null when the request carries the cron bearer; otherwise the response to return. */
export function rejectUnlessCron(request: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  const header = request.headers.get("authorization") ?? "";
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b) ? null : new Response("Unauthorized", { status: 401 });
}
```

Create one route per job. Example `apps/web/src/routes/api/cron/sessions.ts` (purges expired
Better Auth sessions):

```ts
import { createFileRoute } from "@tanstack/react-router";

import { rejectUnlessCron } from "@/lib/cron";
import { getDb } from "@/lib/db";

async function purgeExpiredSessions(request: Request) {
  const rejected = rejectUnlessCron(request);
  if (rejected) return rejected;
  const result = await getDb().$client`delete from session where expires_at < now()`;
  return Response.json({ deleted: result.count });
}

export const Route = createFileRoute("/api/cron/sessions")({
  server: {
    handlers: {
      GET: ({ request }) => purgeExpiredSessions(request),
      POST: ({ request }) => purgeExpiredSessions(request),
    },
  },
});
```

Create `apps/web/vercel.json` (Vercel crons run in UTC; production deployments only):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [{ "path": "/api/cron/sessions", "schedule": "0 4 * * *" }]
}
```

Raise the function budget for cron routes in `apps/web/vite.config.ts` by replacing `nitro()`:

```ts
      // Vercel functions default to a short maxDuration; cron jobs get up to 300 s.
      nitro({ vercel: { functionRules: { "/api/cron/**": { maxDuration: 300 } } } }),
```

## 3. CLAUDE.md

Add under Rules:

```md
- Scheduled jobs are server routes under `src/routes/api/cron/*`, listed in `apps/web/vercel.json`.
  Each calls `rejectUnlessCron(request)` first and must be safe to run twice.
```

## Done when

`bun run format && bun run verify` passes, and with `bun run db:up`, `bun run db:migrate` and
`bun dev` running: `curl -i localhost:3000/api/cron/sessions` returns 401 and
`curl -s -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/sessions` returns
`{"deleted":0}` (export `CRON_SECRET` from `.env.local` first).

## Optional: Vercel Workflow

Use it when a job outgrows one function call: durable steps, retries and `sleep` across
deployments. `bun add --exact workflow@5.2.3` in `apps/web`, then put the plugin FIRST in the
`plugins` array of `apps/web/vite.config.ts` (it transforms `"use workflow"`/`"use step"` files
and generates the `/.well-known/workflow/v1/*` routes):

```ts
import { workflow } from "workflow/vite";
// ...
    plugins: [
      workflow({ dirs: ["src/workflows"] }),
      // ...the existing plugins
    ],
```

Locally runs persist in `apps/web/.workflow-data/`; add `.workflow-data/` to the root `.gitignore`
(otherwise `format:check` fails on its JSON). Commit the `apps/web/.gitignore` the plugin writes.

Create `apps/web/src/workflows/session-report.ts`. Step bodies may import server code; keep
payloads to ids, counts and flags (they are persisted):

```ts
import { sleep } from "workflow";

import { getDb } from "@/lib/db";

export async function runSessionReport() {
  "use workflow";
  const before = await countSessions();
  await sleep("10s");
  return { before, after: await countSessions() };
}

async function countSessions() {
  "use step";
  const [row] = await getDb().$client<
    { count: number }[]
  >`select count(*)::int as count from session`;
  return row?.count ?? 0;
}
```

Start it from a cron route such as `src/routes/api/cron/session-report.ts`, after
`rejectUnlessCron`, importing lazily so the route module stays light:

```ts
const { start } = await import("workflow/api");
const { runSessionReport } = await import("@/workflows/session-report");
return Response.json({ runId: (await start(runSessionReport)).runId });
```

Runs show in Vercel Observability; locally `bunx workflow inspect runs` (from `apps/web`) lists them with
status `C` once the sleep ends. In-process tests
use `@workflow/vitest@5.0.6` (`waitForSleep`, `getRun(id).wakeUp(...)`) in a separate
`vitest.workflow.config.ts`.
