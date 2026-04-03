# Scripts

All commands run from the repository root.

## Everyday development

- `bun install` installs the workspace.
- `bun run dev` starts the main local workflow.
- `bun run dev:web` runs the Next.js app only.
- `bun run dev:convex` syncs the hosted Convex dev deployment and refreshes `apps/web/.env.local`.
- `bun run dev:stripe` starts the local Stripe listener against the pinned Stripe CLI project.
- `bun run dev:full` runs web, hosted Convex dev, and Stripe together for buyer-flow QA.

## Build and quality gates

- `bun run build` builds the web app.
- `bun run typecheck` runs the web typecheck.
- `bun run lint` runs the web lint pass.
- `bun run lint:fix` runs lint autofixes where supported.
- `bun run format` formats the web app.
- `bun run format:check` checks formatting without rewriting files.
- `bun run check:fast` runs the local fast gate: lint, format check, and QA validation.
- `bun run precommit` is the local fast gate used before commit.
- `bun run prepush` runs unit, contract, integration, and build checks before push.
- `bun run check` runs the broad repo gate, including the CLI/compiler slice.

## Tests

- `bun run test:unit`
- `bun run test:contracts`
- `bun run test:integration`
- `bun run test:integration:node`
- `bun run test:integration:ui`
- `bun run test:coverage:critical`
- `bun run test:browser-smoke`
- `bun run test:e2e:sandbox`
- `bun run test:e2e:sandbox:billing-integration`
- `bun run test:e2e:sandbox:default-ship`
- `bun run test:e2e:local-auth`
- `bun run test:e2e:local-auth:default-ship`

Use the narrowest relevant test surface first. Browser packs and billing checks belong only when the changed flow actually needs them.

## CLI and generator

- `bun run sbs` launches the local Ship by Sunday intake CLI.
- `bun run sbs:check` validates the CLI plus blueprint-compiler slice end-to-end.
- `./bin/sbs --help` and `./bin/sbs --version` are safe reference commands.

## QA control plane

- `bun run qa:validate`
- `bun run qa:inventory:sync`
- `bun run qa:personas:prepare`
- `bun run qa:ship`
- `bun run qa:team`
- `bun run qa:run-pack`

See `.docs/testing-and-release.md` and `qa/README.md` for when each QA path should run.

## Operations helpers

- `bun run hooks:install` installs the committed git hooks.
- `bun run stripe:dev:doctor` checks the local Stripe CLI profile.
- `bun run stripe:dev:verify` proves the local Stripe-to-Convex handoff.
- `bun run auth:dev:doctor` checks the auth development setup.
- `bun run clerk:test-user:prepare:entitled` prepares the fast local entitled test account.
- `bun run video:*` commands operate the optional lesson-video pipeline.
