# Integrations

## Convex

- Hosted Convex dev is the only supported development workflow.
- Do not use Convex local mode in this repo.
- Before changing Convex code, read `apps/web/convex/_generated/ai/guidelines.md`.
- `bun run dev:convex` is the normal path for syncing the hosted dev deployment into `apps/web/.env.local`.

## Clerk

- Clerk owns authentication and the protected-route identity layer.
- QA persona preparation depends on the currently loaded Clerk environment matching the target environment.
- When hosted QA fails on a publishable-key mismatch, treat that as env parity drift before treating it as an app bug.

## Stripe

- Stripe owns checkout and webhook-backed entitlement handoff.
- The local Stripe workflow depends on the pinned CLI project `ship-by-sunday`.
- Local forwarding must target the Convex `.convex.site` webhook origin, not the browser `.convex.cloud` origin.
- Billing proof is required only when the changed release touches checkout, Stripe, entitlement, webhook, or access handoff behavior.

## Codex

- The optional in-app Codex routes require a runtime that can spawn the `codex` binary and persist app-server state.
- Local development keeps Codex enabled by default.
- Vercel keeps Codex disabled by default unless `CODEX_APP_SERVER_ENABLED=true` is explicitly enabled on a compatible runtime.

## Vercel and production deploys

- Vercel owns the production web deploy from `main`.
- GitHub Actions owns the Convex production deploy from `main`.
- Production is healthy only when the web deploy, Convex deploy, and release candidate all agree on the same `main` commit.

## Observability

- The repo includes a Telegram-backed observability pipeline for production incidents.
- Required observability secrets and operational details belong in runtime env and the existing runbooks, not in root `AGENTS.md`.
