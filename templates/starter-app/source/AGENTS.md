# Agent Instructions

Next.js App Router, Convex, Clerk, Stripe, Tailwind, shadcn/ui. Before changing code, read `ARCHITECTURE.md` and `CONVENTIONS.md` — they define layer ownership, request flows, and rules for adding features without eroding structure.

## Commands

```bash
bun run dev              # Next.js + Convex
bun run dev:web          # Next.js only
bun run dev:convex       # Convex only
bun run lint             # ESLint
bun run typecheck        # TypeScript
bun run test             # All tests
bunx vitest run path/to/file.test.ts   # Single test file
bun run build            # Production build
```

Billing development: `stripe listen --forward-to http://localhost:3000/api/stripe/webhook` in a separate terminal.

## Do

- Put domain logic in Convex; keep components thin
- Put authorization in Convex helpers, not duplicated in components
- Add new product models in Convex before building UI
- Reuse `PageShell`, `AppHeader`, `SectionHeader` before inventing new page structures
- Add env vars to `.env.local.example` and `src/lib/env/client.ts` or `server.ts`
- Add or update tests for code you change; run `bun run test` before committing

## Don't

- Use provider payloads (Clerk, Stripe) as primary application state
- Duplicate authorization in components when Convex helpers own it
- Add product-specific auth rules to Clerk metadata or UI-only checks
- Put Stripe, Resend, PostHog server capture, or Sentry server capture in client components
- Add heavy dependencies without explicit approval

## Project structure

- `src/app/(marketing)`, `(auth)`, `(app)`, `api/` — Route groups
- `convex/` — Tables, queries, mutations, actions, auth helpers
- `src/components/app/`, `layout/`, `providers/`, `ui/`
- `src/lib/` — Analytics, auth, billing, env, email

Reference implementation: Notes feature in `src/app/(app)/notes/`, `convex/notes.ts`, `convex/auth.ts`.

## Boundaries

- **Always:** Read ARCHITECTURE.md and CONVENTIONS.md before significant changes; run lint, typecheck, test before committing
- **Ask first:** Database schema changes, new dependencies, modifying CI or deployment config
- **Never:** Commit secrets or API keys; edit `node_modules/` or `.env.local`; remove failing tests to make suite pass
