# Scripts

All commands run from the repository root.

## Everyday development

- `bun install` installs the workspace.
- `bun run dev` starts the full local workflow: web, hosted Convex dev sync, and Stripe forwarding.
- `bun run dev:core` runs web plus hosted Convex dev sync without Stripe.
- `bun run dev:web` runs the Next.js app only.
- `bun run dev:convex` syncs the hosted Convex dev deployment and refreshes `apps/web/.env.local`.
- `bun run dev:stripe` starts the local Stripe listener against the pinned Stripe CLI project.
- `bun run dev:full` is the compatibility alias for the same full buyer-flow stack as `bun run dev`.

## Build and quality gates

- `bun run format`
- `bun run format:check`
- `bun run lint`
- `bun run lint:fix`
- `bun run typecheck`
- `bun run build`

The normal root validation surface is intentionally small:

- `bun run test`
- `bun run test:contracts`
- `bun run test:e2e`

Use the narrowest relevant command first, then broaden to the full set when the slice is stable.

## CLI and generator

- `bun run sbs` launches the local Ship by Sunday intake CLI.
- `bun run sbs:check` validates the CLI plus blueprint-compiler slice end-to-end.
- `./bin/sbs --help` and `./bin/sbs --version` are safe reference commands.

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

## What is gone

The repository no longer uses root `qa:*` commands, scenario packs, inventory-sync checks, release-scope routing, or authenticated sandbox Playwright lanes as part of the normal shipping path.
