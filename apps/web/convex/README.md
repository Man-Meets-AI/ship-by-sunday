# Convex Backend Notes

This folder owns the app data and product-state backend for `Ship by Sunday`.

## Current responsibilities

- product access grants
- Stripe webhook ingestion
- lesson state and autosave
- mission progress
- artifact listing
- upload URL generation

## Development workflow

Connect the repo to your hosted Convex dev deployment with:

```bash
bun run dev:convex
```

That command runs `convex dev`, keeps the backend synced, and writes `NEXT_PUBLIC_CONVEX_URL` plus `CONVEX_DEPLOYMENT` into `.env.local`.

Run the full app with:

```bash
bun run dev
```

If auth starts acting wrong, or after you change Clerk env values, run the doctor directly:

```bash
bun run auth:dev:doctor
```

If it fails, update `apps/web/.env.local` so `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_FRONTEND_API_URL` all come from the same Clerk instance, then push that exact issuer into the active hosted Convex dev deployment:

```bash
cd apps/web
bunx convex env set CLERK_FRONTEND_API_URL "$CLERK_FRONTEND_API_URL"
bunx convex env set CLERK_SECRET_KEY "$CLERK_SECRET_KEY"
```

Paid checkout fulfillment also uses `CLERK_SECRET_KEY` inside Convex to resolve or create the Clerk account for the Stripe checkout email. `bun run stripe:listen:dev` syncs this with the Stripe webhook secrets for local billing QA.

This repo does not support Convex's local backend mode as a first-class workflow. Development means local Next.js plus a hosted Convex dev deployment.

Deployment workflow: [docs/release-workflow.md](../../../docs/release-workflow.md)

## Production workflow

Production Convex deploys now come from GitHub Actions, not from a maintainer's local shell habit.

- `.github/workflows/convex-production-deploy.yml` runs automatically on pushes to `main`
- the same workflow supports `workflow_dispatch`, and manual runs default to `dry_run: true`
- automatic push deploys stay paused until the GitHub repository variable `CONVEX_PRODUCTION_DEPLOY_ENABLED` is set to `true`
- the workflow runs `bun install --frozen-lockfile` at the repo root and `bunx convex deploy` from `apps/web`
- GitHub repository secret `CONVEX_DEPLOY_KEY` must contain a production-scoped deploy key from the Convex dashboard for the current production deployment.

Use local `bunx convex deploy --dry-run -y` for validation while preparing release automation, land the workflow on `main`, run the GitHub-hosted dry-run there, and only then set `CONVEX_PRODUCTION_DEPLOY_ENABLED=true` so later `main` merges deploy automatically.

## Key files

- `schema.ts`: database schema and indexes
- `access.ts`: product-access grants and access-read functions
- `http.ts`: Convex HTTP routes, including the Stripe webhook
- `course.ts`: lesson progress, mission, and lesson-state logic
- `uploads.ts`: upload URL generation for lesson media fields
- `auth.config.ts`: Convex auth provider configuration

## Safeguards

- Treat product access and lesson progress as production state.
- Prefer adding tests around pure domain helpers in `src/lib/course/lesson/model/` before refactoring Convex behavior.
- If a change affects auth, purchase, or access gating, run `bun run check` before closing it.
