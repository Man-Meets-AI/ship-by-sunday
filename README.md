# Ship by Sunday

Ship by Sunday is an agent-ready, blueprint-first SaaS starter for turning one product idea into durable design, marketing, build, and prompt handoff packs. The repo includes the public marketing site, protected blueprint workspace, Stripe checkout flow, Clerk auth, Convex backend, blueprint compiler, intake CLI, and QA operating system that support that contract.

## Design system

The canonical visual source of truth is [`DESIGN.md`](DESIGN.md).

Use it before changing any user-facing UI. It documents the shared neutral app tokens, the Ship by Sunday brand accents, typography, component defaults, layout principles, and current design-system gaps.

## What lives here

- `apps/web/`: the main Next.js product, docs, protected workspace, checkout, and optional Codex runtime.
- `packages/blueprint-compiler/`: the generator behind the customer-facing Ship by Sunday Blueprint.
- `packages/ship-by-sunday-cli/`: local blueprint-intake and snapshot-generation CLI.
- `qa/`: QA control plane, scenario packs, personas, and run evidence.
- `docs/`: long-form runbooks, ExecPlans, prompts, and historical product context.
- `.docs/`: short hidden reference docs for agents and operators.

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

For the full buyer-flow local environment, including Stripe forwarding:

```bash
bun run dev:full
```

If you only need one subsystem:

```bash
bun run dev:web
bun run dev:convex
bun run dev:stripe
```

This repo does not support Convex local mode as a first-class workflow.

## Common commands

```bash
bun run typecheck
bun run lint
bun run format:check
bun run test:unit
bun run test:contracts
bun run test:integration
bun run test:coverage:critical
bun run test:browser-smoke
bun run build
bun run check
```

For the full command map, use [`.docs/scripts.md`](./.docs/scripts.md).

## Operations

- Release workflow runbook: [docs/release-workflow.md](./docs/release-workflow.md)
- QA control plane: [qa/README.md](./qa/README.md)
- Homepage contract: [apps/web/content/docs/configure-the-homepage.mdx](./apps/web/content/docs/configure-the-homepage.mdx)
- Public docs index: [apps/web/content/docs/index.mdx](./apps/web/content/docs/index.mdx)

Relevant hidden reference docs:

- [`.docs/workspace-layout.md`](./.docs/workspace-layout.md)
- [`.docs/architecture.md`](./.docs/architecture.md)
- [`.docs/product-contract.md`](./.docs/product-contract.md)
- [`.docs/integrations.md`](./.docs/integrations.md)
- [`.docs/testing-and-release.md`](./.docs/testing-and-release.md)
- [`.docs/encyclopedia.md`](./.docs/encyclopedia.md)

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

If you are new to the repo, start with `README.md`, then `AGENTS.md`, then `DESIGN.md`, then `qa/README.md` or `docs/release-workflow.md` depending on whether you are building or operating.
