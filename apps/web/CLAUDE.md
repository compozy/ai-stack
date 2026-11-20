# @acme/web

TanStack Start app (React 19, Vite, Nitro). File routes in `src/routes` (`routeTree.gen.ts` is
written by the router plugin), server functions next to the route that uses them. Port 3000,
Storybook on 6006.

## Ownership

| Path                       | Owns                                                                        |
| -------------------------- | --------------------------------------------------------------------------- |
| `src/routes/__root.tsx`    | Document shell, providers, global styles                                    |
| `src/routes/*.tsx`         | Pages: loader, guard and server functions; they pass data to views as props |
| `src/routes/api/auth/$.ts` | Better Auth handler (`/api/auth/*`)                                         |
| `src/lib/auth.ts`          | Server auth instance (`getAuth`); `auth-client.ts` is the browser client    |
| `src/lib/session.ts`       | `getSession` (route guards) and `requireUser` (data access)                 |
| `src/lib/db.ts`            | `getDb`, the lazy database singleton                                        |
| `src/components/*`         | Views: props in, callbacks out, no data layer                               |

## Rules

- Every server function that reads or writes data calls `requireUser()` first and scopes its
  queries to that user. `beforeLoad` guards only redirect; they do not protect data.
- Server-only code (`getAuth`, `getDb`, env reads) stays behind `createServerFn` or
  `createServerOnlyFn`; a route component never imports `@acme/db` directly.
- Validate server function input with zod (`.validator`) before it reaches a query.
- Views live in `src/components` with a story each; routes compose them and own loading, empty
  and error states.

## Tests

`vitest.config.ts` runs `tests/**/*.test.ts` and the Storybook project (`*.stories.tsx` in
Chromium, light and dark, with a11y checks). Add to the suite that owns the invariant.
