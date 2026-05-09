# X Account Checker

A batch tool for checking whether X (Twitter) accounts are active, suspended, or not found.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/x-checker run dev` — run the frontend (port 24068)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, shadcn/ui, TanStack Query
- API: Express 5
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/x-checker/src/pages/home.tsx` — main checker UI
- `artifacts/api-server/src/routes/accounts.ts` — account check logic (calls X's guest token API)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas

## Architecture decisions

- Uses X's public guest token API (`api.twitter.com/1.1/guest/activate.json`) + GraphQL `UserByScreenName` to check account status without requiring user auth or a paid API plan
- One guest token is obtained per batch (cached for 10 minutes), then all accounts are checked in parallel via the GraphQL endpoint
- `__typename: "User"` = active, `__typename: "UserUnavailable"` = suspended, no result = not found
- Backend proxies all X API calls to avoid CORS and keep tokens server-side
- `@` prefix is stripped automatically on the backend so users can paste usernames with or without it
- Up to 100 usernames can be checked in one request, all checked in parallel
- `TWITTER_BEARER_TOKEN` env var is read but not required — the public bearer token is hardcoded as a fallback (X's own apps use it)

## Product

Users paste a list of X/Twitter usernames (one per line, comma-separated, or space-separated), hit "Check Status", and see a table of results with color-coded status indicators: green (active), red (suspended), gray (not found), yellow (unknown). Profile avatars and display names are shown for active accounts. Results can be copied to clipboard.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- X's guest token API may rate-limit or return unknown status for some accounts — this is expected behavior
- After OpenAPI spec changes, always re-run `pnpm --filter @workspace/api-spec run codegen` before writing routes or frontend code
- `lib/api-zod/src/index.ts` only re-exports non-conflicting type files from `./generated/types` to avoid ambiguous export errors with the Zod schemas in `./generated/api`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
