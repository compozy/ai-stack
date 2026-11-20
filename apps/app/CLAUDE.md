# @acme/app

React 19 SPA on Vite with TanStack Router (code routes in `src/router.tsx`) and TanStack Query.
Port 3002, Storybook on 6007. It talks to `@acme/api` only.

## Ownership

| Path                     | Owns                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `src/router.tsx`         | Route tree, guards and loaders                                       |
| `src/routes/*.tsx`       | Pages: fetch through Query and pass data to views as props           |
| `src/lib/api.ts`         | Typed `openapi-fetch` client and `result()`, which throws `ApiError` |
| `src/lib/query.ts`       | The `QueryClient` and its defaults                                   |
| `src/lib/auth-client.ts` | Better Auth browser client                                           |
| `src/lib/config.ts`      | `VITE_*` config, validated with zod                                  |
| `src/generated/api.d.ts` | Generated from the API contract (`bun run codegen`); never edit      |
| `src/components/*`       | Views: props in, callbacks out, no data layer                        |

## Rules

- Data comes only from the API through `api` + `result()` inside a Query hook; never `fetch` by
  hand and never import `@acme/db`.
- Branch on `ApiError.code`, the stable code the API sends, not on messages.
- Guards in the router redirect for UX; the API enforces access.
- Views live in `src/components` with a story each; pages own loading, empty and error states.

## Tests

`vitest.config.ts` runs `tests/**/*.test.ts` and the Storybook project (`*.stories.tsx` in
Chromium, light and dark, with a11y checks). Add to the suite that owns the invariant.
