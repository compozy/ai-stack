# @acme/api

Hono API on Bun with an OpenAPI contract. `src/app.ts` composes HTTP (auth handler, modules, error
mapping, `/openapi.json`); `src/server.ts` starts the listener on port 3001; `scripts/codegen.ts`
writes `openapi.json` and the SPA's typed client.

## Ownership

| Path                     | Owns                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `src/platform/env.ts`    | Env parsing; the only place that reads `process.env`                        |
| `src/platform/auth.ts`   | Better Auth instance with the Drizzle adapter                               |
| `src/platform/http.ts`   | `requireSession`, `responses`, `jsonContent`, `errorSchema`                 |
| `src/platform/errors.ts` | `DomainError(code, status)`, mapped to JSON by `app.onError`                |
| `src/modules/<area>/*`   | One feature each: `routes.ts`, plus `queries.ts` when it reads the database |

## Rules

- Every route is a `createRoute` in its module's `routes.ts`, with zod schemas named via
  `.openapi("Name")`; run `bun run codegen` from the root after changing one (`verify` fails on a
  stale contract).
- Protected routes use `requireSession(auth)` and read the user from `c.var.user`; queries are
  scoped to that user.
- Expected failures throw `DomainError(code, status)` and never return ad hoc JSON; the code is a
  stable snake_case string the SPA can branch on.
- Queries live in the module (`queries.ts`) and return the response shape; routes stay thin.
- A new module is mounted in `src/app.ts` under `/v1`.

## Tests

`tests/app.test.ts` covers the HTTP surface and the contract through `app.request`. Database
behavior goes in a `*.it.test.ts` suite with `createTestDatabase` from `@acme/db/testing`.
