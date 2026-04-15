# Ship by Sunday

Ship by Sunday is an agent-ready, blueprint-first SaaS starter for turning one product idea into durable design, marketing, build, and prompt handoff packs. The repo includes the public marketing site, protected blueprint workspace, Stripe checkout flow, Clerk auth, Convex backend, blueprint compiler, intake CLI, and a thin CI/smoke harness that proves the shipping path directly.

## Design system

The canonical visual source of truth is [`DESIGN.md`](DESIGN.md).

Use it before changing any user-facing UI. It documents the shared neutral app tokens, the Ship by Sunday brand accents, typography, component defaults, layout principles, and current design-system gaps.

## What lives here

- `apps/web/`: the main Next.js product, docs, protected workspace, checkout, and optional Codex runtime.
- `packages/blueprint-compiler/`: the generator behind the customer-facing Ship by Sunday Blueprint, including the downloaded repo’s generated root `DESIGN.md`, machine-readable design snapshot, and starter-runtime design config.
- `packages/ship-by-sunday-cli/`: local blueprint-intake and snapshot-generation CLI.
- `docs/`: the canonical contributor and agent-facing docs spine, plus ExecPlans, prompts, references, and generated analyses.

The protected journey is blueprint-first:

`Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download`

The `/review` contract exposes one download artifact, the `Ship by Sunday Blueprint`, not separate design, marketing, or build downloads.

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

3. Connect the repo to your hosted Convex dev deployment:

```bash
bun run dev:convex
```

4. Start the normal local workflow:

```bash
bun run dev
```

`bun run dev` now means the full local buyer-flow environment: web, hosted Convex dev sync, and Stripe forwarding.

If you want the older lighter web-plus-Convex flow without Stripe, use:

```bash
bun run dev:core
```

If you only need one subsystem:

```bash
bun run dev:web
bun run dev:convex
bun run dev:stripe
bun run dev:full
```

This repo does not support Convex local mode as a first-class workflow.

## Common commands

```bash
bun run format
bun run lint
bun run typecheck
bun run test
bun run test:contracts
bun run build
bun run test:e2e
```

For the full command map, use [docs/design-docs/scripts.md](./docs/design-docs/scripts.md).

## Workflow model

- `.github/workflows/pr.yml` is the always-on PR workflow.
- `.github/workflows/deployment-smoke.yml` verifies the deployed URL on `deployment_status`.
- `.github/workflows/convex-production-deploy.yml` is the only surviving backend deploy workflow, and only because the production Convex deploy still needs explicit coordination outside Vercel.

## Operations

- Docs index: [docs/index.md](./docs/index.md)
- Observability runbook: [docs/references/observability.md](./docs/references/observability.md)
- Release workflow runbook: [docs/release-workflow.md](./docs/release-workflow.md)
- App-local QA guide: [Local QA](./apps/web/content/docs/local-qa.mdx)
- Homepage contract: [apps/web/content/docs/configure-the-homepage.mdx](./apps/web/content/docs/configure-the-homepage.mdx)
- Public docs index: [apps/web/content/docs/index.mdx](./apps/web/content/docs/index.mdx)

Relevant deeper reference docs:

- [docs/design-docs/index.md](./docs/design-docs/index.md)
- [docs/design-docs/workspace-layout.md](./docs/design-docs/workspace-layout.md)
- [docs/design-docs/architecture.md](./docs/design-docs/architecture.md)
- [docs/design-docs/product-contract.md](./docs/design-docs/product-contract.md)
- [docs/design-docs/integrations.md](./docs/design-docs/integrations.md)
- [docs/design-docs/testing-and-release.md](./docs/design-docs/testing-and-release.md)
- [docs/design-docs/encyclopedia.md](./docs/design-docs/encyclopedia.md)

## CLI

The repo includes a local Ship by Sunday intake CLI that writes one draft under `.ship-by-sunday/` and generates the same Ship by Sunday Blueprint shape as the protected `/review` flow.

Common entrypoints:

```bash
bun run sbs --help
bun run sbs resume
bun run sbs next --json
bun run sbs review --json
./bin/sbs --version
./bin/sbs completion zsh
```

The install story is intentionally simple: clone the repo, run `bun install`, and launch the CLI from the repository root.

## Docs

- Contributor guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
- Root agent instructions: [AGENTS.md](./AGENTS.md)

If you are new to the repo, start with `README.md`, then `AGENTS.md`, then `docs/index.md`, then `DESIGN.md`, then `docs/release-workflow.md` or `apps/web/content/docs/local-qa.mdx` depending on whether you are shipping or debugging app-local tests.
