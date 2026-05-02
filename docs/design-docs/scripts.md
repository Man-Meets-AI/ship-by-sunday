# Scripts

All commands run from the repository root.

## Everyday development

- `bun install` installs the workspace.
- `bun run dev` starts the full local workflow: web, hosted Convex dev sync, and Stripe forwarding.
- `bun run dev:core` runs the lighter web plus hosted Convex dev sync path without Stripe forwarding.
- `bun run dev:web` is a compatibility alias to the same full-stack startup as `bun run dev`.
- `bun run dev:convex` syncs the hosted Convex dev deployment and refreshes `apps/web/.env.local`.
- `bun run dev:stripe` starts the local Stripe listener against the pinned Stripe CLI project.
- `bun run dev:full` is the compatibility alias for the same full buyer-flow stack as `bun run dev`.
- `bun run --cwd apps/web dev:web:only` is the explicit escape hatch for a plain web-only Next.js dev server.

## Build and quality gates

- `bun run format`
- `bun run format:check`
- `bun run lint`
- `bun run lint:fix`
- `bun run markdown:lint -- --paths <repo-path-or-dir>`
- `bun run public-readiness:lint`
- `bun run docs:generated:check`
- `bun run plans:lint -- --plan <docs/exec-plans/active/...>`
- `bun run programs:lint`
- `bun run typecheck`
- `bun run build`

The normal root validation surface on this branch still follows the current Ship by Sunday harness:

- `bun run test:unit`
- `bun run test:contracts`
- `bun run test:integration`
- `bun run build`

Use the narrowest relevant command first, then broaden to the full set when the slice is stable.

For frontmatter-driven docs and plans:

- `bun run markdown:lint` validates the repo-owned markdown families that currently have checked-in metadata contracts: the canonical frontmatter-backed docs spine files under `docs/`, ExecPlans under `docs/exec-plans/`, docs MDX pages under `apps/web/content/docs/`, and blog post MDX files under `apps/web/content/blog/`.
- `bun run plans:lint` applies the stricter ExecPlan body and frontmatter contract from `docs/exec-plans/PLANS.md`.
- `bun run programs:lint` validates Program docs, checked-in Program packet folders, versioned planning briefs, current-brief pointers, and Program prompt contracts.
- `markdown:lint` and `plans:lint` accept path-scoped arguments so docs-only work can be proved without widening into unrelated files.
- `public-readiness:lint` scans the active current-truth docs path for stale `/start` guidance, old `features/` paths, absolute `/Users/...` links, concrete private hosts, internal deployment IDs, and retired product vocabulary. It intentionally excludes historical archives, generated mirrors, source instruction packs, and completed plans.
- Provider/config changes that create future external setup work must update the active setup docs or generated customer docs in the same change, then run `markdown:lint` on the touched docs plus the relevant focused code check.
- `docs:generated:check` verifies that `docs/generated/openai-blueprint/` mirrors `docs/openai/` and `docs/generated/ship-by-sunday-blueprint/` mirrors `docs/ship-by-sunday/`.

## Blueprint compiler

- `bun run --cwd packages/blueprint-compiler lint`
- `bun run --cwd packages/blueprint-compiler format:check`
- `bun run --cwd packages/blueprint-compiler typecheck`
- `bun run --cwd packages/blueprint-compiler test`

## Operations helpers

- `bun run stripe:create-product`
- `bun run stripe:listen:dev`
- `bun run stripe:webhook:sync`
- `bun run stripe:dev:doctor`
- `bun run auth:dev:doctor`
- `bun run clerk:test-user:check`
- `bun run clerk:test-user:create`
- `bun run clerk:test-user:check:entitled`
- `bun run clerk:test-user:create:entitled`
- `bun run clerk:test-user:prepare:entitled`
- `bun run video:*` commands operate the optional lesson-video pipeline.

## Release proof

- `bun run release:manifest:check`
- `bun run release:evidence:build`
- `bun run release:billing:doctor -- --env=preview --dry-run`
- `bun run release:billing:doctor -- --env=production --dry-run`
- `bun run release:convex:sync-hosted-dev`
- `bun run release:personas:prepare -- --proof=default_ship`
- `bun run release:personas:prepare -- --proof=billing_integration`
- `bun run release:proof -- --proof=default_ship`
- `bun run release:proof -- --proof=billing_integration`
- `bun run release:proof -- --proof=default_ship --dry-run`
- `bun run release:proof -- --proof=billing_integration --dry-run`

Release proof commands use `tmp/release-personas.local.json` by default, or the file named by `RELEASE_PERSONAS_LOCAL_FILE`.
