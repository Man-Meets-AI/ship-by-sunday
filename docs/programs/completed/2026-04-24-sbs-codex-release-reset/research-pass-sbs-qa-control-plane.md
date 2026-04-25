# Ship By Sunday QA Control Plane Research

This research pass preserves the Ship by Sunday QA control-plane inventory gathered from `/Users/parkerrex/Developer/ship-by-sunday` on 2026-04-24. It is research-only and does not delete or edit QA files.

## Source Track

The source track inspected `qa/`, `.codex`, `.agents`, root scripts, GitHub workflows, docs references, app tests, and release/intake script dependencies to map what would break if the current QA control plane were gutted.

## Current Inventory

The current QA control plane is broad and actively wired:

- `qa/` contains 29 `.mjs` scripts, 13 committed run reports, 25 journey rows, 60 coverage rows, and 163 test-inventory rows.
- `.codex` contains 6 QA role agents plus `.codex/config.toml`.
- `.agents` contains `qa-team` plus shared release and ExecPlan skills.
- Root `package.json` contains `qa:*`, `release:*`, and `engineering:intake:*` command surfaces.
- `.github/workflows/ci.yml`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/sandbox-e2e-nightly.yml` reference QA proof or QA environment behavior.
- `.github/workflows/convex-production-deploy.yml` is adjacent to the release path but does not directly reference `qa/` according to the source track.

Docs references are spread through `AGENTS.md`, `apps/web/AGENTS.md`, `qa/README.md`, `docs/release-workflow.md`, `docs/internal/observability.md`, `apps/web/content/docs/commands.mdx`, `apps/web/content/docs/deploy-to-vercel.mdx`, `README.md`, `CHANGELOG.md`, active/completed ExecPlans, and generated starter templates in `packages/blueprint-compiler`.

The source track also reported a tracked `QA-Browser` account reference file under `.agents` with real-looking QA credentials. If accurate, retirement should include credential review and rotation, not only deletion.

## Retirement Map

The canonical QA source of truth includes:

- `qa/AGENTS.md`
- `qa/README.md`
- `qa/glossary.md`
- `qa/current-baseline.md`
- `qa/journeys.csv`
- `qa/coverage.csv`
- `qa/test-inventory.csv`
- `qa/personas*.json`
- `qa/templates/*`
- `qa/runs/*`
- `qa/reviews/README.md`

`qa/scripts/validate.mjs` requires the core QA files. `qa/scripts/ship.mjs` reads journeys and templates. Root scripts and CI use the validator/inventory. Docs and AGENTS instructions point here. Deleting this set first would break CI, remove release evidence, delete test inventory mappings, and remove the canonical journey/coverage map agents currently use.

QA execution scripts include:

- `qa/scripts/validate.mjs`
- `qa/scripts/generate-test-inventory.mjs`
- `qa/scripts/run-pack.mjs`
- `qa/scripts/personas.mjs`
- `qa/scripts/ship.mjs`
- `qa/scripts/team.mjs`
- `qa/scripts/wait-for-host.mjs`
- `qa/scripts/wait-for-vercel-production-deployment.mjs`
- `qa/scripts/sync-hosted-convex-dev.mjs`
- `qa/scripts/lib/csv.mjs`
- `qa/scripts/lib/personas.mjs`
- `qa/scripts/lib/qa-env.mjs`
- `qa/scripts/lib/clerk-target.mjs`
- `qa/scripts/lib/billing-integration-step-planner.mjs`
- `qa/scripts/lib/convex-dev-sync.mjs`

These support root `qa:*` scripts, CI `qa_control_plane`, dev/prod proof workflows, app Playwright auth state, and Stripe/Convex QA setup. Removing them first would break `check:fast`, CI inventory checks, staged/prod proof, persona preparation, and `default_ship` / `billing_integration` packs.

Release control-plane scripts currently live under `qa/scripts` too:

- `qa/scripts/detect-release-scope.mjs`
- `qa/scripts/release-triage.mjs`
- `qa/scripts/release-snapshot.mjs`
- `qa/scripts/reconcile-post-snapshot-release.mjs`
- `qa/scripts/lib/release-*`
- `qa/scripts/lib/vercel-deployments.mjs`
- current untracked `qa/scripts/export-release-intake.mjs`
- current untracked `qa/scripts/export-engineering-intake-snapshot.mjs`
- current untracked `qa/scripts/lib/engineering-intake-contract.mjs`
- current untracked `qa/scripts/lib/release-intake-export.mjs`
- current untracked `qa/scripts/lib/release-triage-source.mjs`
- fixtures under `qa/fixtures/engineering-intake`

These feed root `release:*` and `engineering:intake:*`, `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, `docs/release-workflow.md`, and observability/runtime-intake export code. Removing them without replacement would remove release candidate truth, GitHub/Vercel metadata checks, billing/Convex sensitivity classification, snapshot fallback, and downstream engineering-intake contracts.

`.codex` QA agents and `.agents/skills/qa-team` are active execution tooling:

- `.codex/config.toml`
- `.codex/agents/qa-lead.toml`
- `.codex/agents/journey-mapper.toml`
- `.codex/agents/coverage-analyst.toml`
- `.codex/agents/gap-reviewer.toml`
- `.codex/agents/browser-runner.toml`
- `.codex/agents/release-summarizer.toml`
- `.agents/skills/qa-team/SKILL.md`

These point back to `qa/` and existing `qa:*` commands. Deleting them before replacement would remove the repo-native behavior for QA-team style requests.

Relevant workflows include:

- `.github/workflows/ci.yml`
- `.github/workflows/dev-staging-proof.yml`
- `.github/workflows/production-release-proof.yml`
- `.github/workflows/sandbox-e2e-nightly.yml`

The research track reported that `sandbox-e2e-nightly.yml` is the clearest retire or quarantine candidate because it is documented as failing and non-release-critical. Dev/prod proof workflows remain release-critical until a replacement exists.

## Package Scripts

Root package scripts include `qa:inventory:sync`, `qa:inventory:check`, `qa:validate`, `qa:personas:*`, `qa:ship`, `qa:team`, `qa:run-pack`, `release:triage`, `release:snapshot`, and `engineering:intake:*`.

App scripts include tagged Playwright lanes for `@default_ship` and `@billing_integration`.

The source track's conclusion was that scripts are a public API and should be removed late, after workflows, docs, tests, and agents no longer call them.

## App And Test Dependencies

Examples reported by the source track:

- `apps/web/tests/e2e/auth-state.ts` reads `qa/personas.local.json`.
- e2e specs are tagged `@default_ship` and `@billing_integration`.
- unit tests import QA libs for release scope, release triage, release snapshot, CSV parsing, Vercel deployments, Convex sync, and run-pack planning.

Deleting `qa/` first would create test-suite import failures and Playwright auth/bootstrap failures.

## Bottom Line

The research track's bottom line was that `qa/` cannot be deleted wholesale from the current checkout. The folder mixes removable QA bookkeeping with release-critical scripts and contracts. A safe future packet must separate:

- QA journey and inventory retirement
- browser pack retirement
- release/intake contract relocation
- Vercel/Convex/billing proof preservation
- docs and agent-skill cleanup

