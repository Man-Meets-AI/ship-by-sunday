# Ship By Sunday QA Control Plane Normalized

## Facts

- `qa/` is not one disposable surface; it mixes QA bookkeeping, browser pack orchestration, release triage, release snapshot, Vercel/Convex helpers, billing proof, and engineering-intake contracts.
- The source research reported `qa/` contains 29 `.mjs` scripts, 13 committed run reports, 25 journey rows, 60 coverage rows, and 163 test-inventory rows.
- `.codex/agents/*` and `.agents/skills/qa-team/SKILL.md` point back to `qa/` and `qa:*` commands.
- Root `package.json` contains `qa:*`, `release:*`, and `engineering:intake:*` command surfaces tied to `qa/scripts`.
- `.github/workflows/ci.yml`, `dev-staging-proof.yml`, `production-release-proof.yml`, and `sandbox-e2e-nightly.yml` reference QA proof or QA environment behavior.
- App and test code imports QA helpers, including persona auth state, release scope, release triage, release snapshot, CSV parsing, Vercel deployments, Convex sync, and run-pack planning.
- The source research reported a real-looking QA credential reference under `.agents`; that claim should be verified before any credential handling.

## Recommendation

Demote and retire the QA control plane in layers. Separate disposable QA journey/inventory/run-pack surfaces from release-critical Vercel, Convex, billing, and intake contracts before deleting `qa/` files.

## Risks

- Wholesale `qa/` deletion would break CI, release proof, root scripts, tests, and app export paths.
- Release/intake infrastructure could be accidentally deleted as "QA" even though it is release-critical.
- Credentials or account references may need rotation if QA account files contain sensitive values.
- Removing `.codex` QA agents and `.agents/skills/qa-team` before replacement would leave repo-native QA requests without a working path.

## Code Seams

- `qa/README.md`
- `qa/AGENTS.md`
- `qa/journeys.csv`
- `qa/coverage.csv`
- `qa/test-inventory.csv`
- `qa/personas*.json`
- `qa/scripts/**`
- `.codex/config.toml`
- `.codex/agents/*.toml`
- `.agents/skills/qa-team/SKILL.md`
- `.agents/skills/shared/release-triage/SKILL.md`
- `.agents/skills/shared/release-snapshot/SKILL.md`
- `package.json`
- `.github/workflows/ci.yml`
- `.github/workflows/dev-staging-proof.yml`
- `.github/workflows/production-release-proof.yml`
- `.github/workflows/sandbox-e2e-nightly.yml`
- `apps/web/tests/e2e/auth-state.ts`

## Proposed Slices

1. Split release-critical helpers out of `qa/scripts` or define their replacement location.
2. Retire QA journey, coverage, run-pack, and test-inventory control-plane files after replacement proof exists.
3. Remove or rewrite `.codex` QA agents and `.agents` QA skills after the new CI/release model is active.
4. Clean root scripts, workflows, and docs once no runtime or test import depends on `qa/`.

