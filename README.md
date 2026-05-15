# Ship by Sunday

Ship by Sunday is an agent-ready, codebase-first SaaS starter for turning one product idea into durable design, marketing, build, and prompt handoff packs. The repo includes the public marketing site, protected codebase workspace, Stripe checkout flow, Clerk auth, Convex backend, codebase compiler, and the docs/runbook surfaces that support that contract.

## Design system

The canonical visual source of truth is [`DESIGN.md`](DESIGN.md).

Use it before changing any user-facing UI. It documents the shared neutral app tokens, the Ship by Sunday brand accents, typography, component defaults, layout principles, and current design-system gaps.

## What lives here

- `apps/web/`: the main Next.js product, docs, protected workspace, checkout, and optional Codex runtime.
- `packages/codebase-compiler/`: the generator behind the customer-facing Ship by Sunday Codebase, including the downloaded repo’s generated root `DESIGN.md`, machine-readable design snapshot, and starter-runtime design config.
- `scripts/release/`: release proof orchestration, release personas, release evidence, and release workflow helpers.
- `release.json`: the manifest-backed release identity contract for protected `vMAJOR.MINOR.PATCH` tags.
- `docs/`: the canonical contributor and agent-facing docs spine, plus ExecPlans, prompts, references, and generated analyses.

The protected paid-app journey is codebase-first:

`/home -> /generate-codebase -> /generate-codebase/review`

The `/generate-codebase/review` contract exposes one download artifact, the `Ship by Sunday Codebase`, not separate design, marketing, or build downloads.

## Quick start

1. Install dependencies:

```bash
bun install
```

2. Copy the tracked env template:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Set `APP_BASE_URL` to the canonical host you want Stripe to use for checkout success and cancel redirects. For local development, keep it on `http://localhost:3000`.

If you enable PostHog error tracking and source-map upload, set `NEXT_PUBLIC_POSTHOG_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, and `POSTHOG_API_KEY` in `apps/web/.env.local` and in the Vercel project. `POSTHOG_API_KEY` should be a project-scoped PostHog personal API key with only the `Source map upload` scope. Use a separate OAuth login or separate `MCP Server` key for PostHog MCP.

3. Connect the repo to your hosted Convex dev deployment:

```bash
bun run dev:convex
```

4. Start the normal local workflow:

```bash
bun run dev
```

`bun run dev` now means the full local buyer-flow environment: web, hosted Convex dev sync, and Stripe forwarding.

If you want the lighter web-plus-Convex flow without Stripe forwarding, use:

```bash
bun run dev:core
```

`bun run dev:web` is a compatibility alias to the same full-stack startup as `bun run dev`, so older muscle memory still lands on the normal local workflow.

If you need to run one subsystem on purpose:

```bash
bun run dev:convex
bun run dev:stripe
bun run dev:full
bun run --cwd apps/web dev:web:only
```

This repo does not support Convex local mode as a first-class workflow.

## Common commands

```bash
bun run format
bun run typecheck
bun run lint
bun run format:check
bun run test:unit
bun run test:contracts
bun run test:integration
bun run build
bun run posthog:proof
bun run markdown:lint -- --paths <repo-path-or-dir>
bun run public-readiness:lint
bun run plans:lint -- --plan docs/exec-plans/active/<plan-file>.md
bun run check
```

Run `bun run posthog:proof` after a production build when PostHog is enabled. The command checks required PostHog env presence and injected source-map chunk IDs without printing secret values; operators should still confirm the uploaded symbol set in PostHog.

Release operators also use:

```bash
bun run release:manifest:check
bun run release:notes:build
bun run release:evidence:build
bun run release:proof -- --proof=default_ship --dry-run
```

For the full command map, use [docs/design-docs/scripts.md](./docs/design-docs/scripts.md).

## Operations

- Docs index: [docs/index.md](./docs/index.md)
- Observability runbook: [docs/internal/observability.md](./docs/internal/observability.md)
- Linear runbook: [docs/internal/linear.md](./docs/internal/linear.md)
- Release workflow runbook: [docs/release-workflow.md](./docs/release-workflow.md)
- Release manifest: [release.json](./release.json)
- Homepage contract: [apps/web/src/content/docs/configure-the-homepage.mdx](./apps/web/src/content/docs/configure-the-homepage.mdx)
- Public docs index: [apps/web/src/content/docs/index.mdx](./apps/web/src/content/docs/index.mdx)

Relevant deeper reference docs:

- [docs/design-docs/index.md](./docs/design-docs/index.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/RELIABILITY.md](./docs/RELIABILITY.md)
- [docs/SECURITY.md](./docs/SECURITY.md)
- [docs/FRONTEND.md](./docs/FRONTEND.md)
- [docs/DESIGN.md](./docs/DESIGN.md)
- [docs/PRODUCT_SENSE.md](./docs/PRODUCT_SENSE.md)
- [docs/QUALITY_SCORE.md](./docs/QUALITY_SCORE.md)

## Asking Codex To Ship

If you want Codex to take a change all the way through GitHub and production, say it directly.

Good prompts:

- `$land this`
- `ship this to prod`
- `take this to prod`
- `land this end to end`
- `shepherd this through dev and main`

`$land` is the clearest phrasing because it tells Codex to use the repo's shipping skill and stay on the work until the relevant commit reaches `main` and the release proof surface is green.

For this repo, that means:

- feature branch from `main`
- pull request into `main`
- release manifest and tag evidence stay consistent with the merged `main` commit
- and post-merge hosted proof verifies the exact production deployment from `main`

If you want a lighter touch, say so explicitly. For example:

- `open the PR but do not merge`
- `prepare the PR and stop`
- `ship this, but ask before the final merge`

## Docs

- Contributor guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
- Root agent instructions: [AGENTS.md](./AGENTS.md)

If you are new to the repo, start with `README.md`, then `AGENTS.md`, then `docs/index.md`, then `DESIGN.md`, then `docs/release-workflow.md` or `apps/web/src/content/docs/local-qa.mdx` depending on whether you are shipping or debugging app-local tests.
