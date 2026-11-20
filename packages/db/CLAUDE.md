# @acme/db

Drizzle ORM on postgres.js. Exports: `.` (`createDb`, `Database`), `./schema` (tables) and
`./testing` (integration harness).

## Ownership

| Path                 | Owns                                                               |
| -------------------- | ------------------------------------------------------------------ |
| `src/schema/*.ts`    | Tables, one file per area, re-exported from `src/schema/index.ts`  |
| `src/schema/auth.ts` | Better Auth tables; change them only together with the auth config |
| `src/client.ts`      | `createDb(url, options)`                                           |
| `src/testing.ts`     | `createTestDatabase`: one disposable, migrated database per suite  |
| `drizzle/*`          | Generated migrations and snapshots; never edit by hand             |

## Rules

- A schema change ships with its migration: edit `src/schema`, run `bun run db:generate`, review
  the SQL, run `bun run db:migrate`, commit both. Follow `drizzle-safe-migrations` for anything
  that touches existing rows (renames, drops, `not null` on a filled column, backfills).
- Never edit or delete a committed migration; fix forward with a new one.
- Keep queries in the app that owns them; this package holds schema and plumbing only.

## Tests

`tests/migrations.it.test.ts` proves the committed migrations apply to an empty database. It and
every other `*.it.test.ts` run only with `TEST_DATABASE_URL`, which names a server, never a real
database: each suite clones its own `it_*` database and drops it.
