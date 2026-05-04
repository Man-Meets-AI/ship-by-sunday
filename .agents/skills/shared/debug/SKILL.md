---
name: debug
description: Investigate stuck Ship By Sunday work by tracing Linear issues into app logs, release proof, runtime-intake exports, Vercel, Convex, and GitHub evidence.
---

# Debug

Use this skill when Ship By Sunday work stalls, fails unexpectedly, loses proof
context, or needs to be correlated back to a Linear issue.

Start from the Linear issue identifier, resolve the repo or runtime evidence,
trace the narrow execution path, then classify the failing stage. Keep the
Linear issue identifier beside every evidence snippet so concurrent runs do not
get mixed.

## Goals

- Find why a Ship By Sunday issue is stuck, retrying, or failing.
- Correlate Linear issue identity to repo evidence, PRs, release proof, and
  runtime-intake records quickly.
- Read the right docs, logs, and ledgers in the right order to isolate root
  cause.

## Evidence Sources

- Repo instructions and docs:
  - `AGENTS.md`
  - `docs/index.md`
  - `docs/ARCHITECTURE.md`
  - `docs/RELIABILITY.md`
  - `docs/SECURITY.md`
  - `docs/release-workflow.md`
  - `docs/internal/observability.md`
- Planning evidence:
  - `docs/programs/active/`
  - `docs/programs/completed/`
  - `docs/exec-plans/active/`
  - `docs/exec-plans/completed/`
- App and runtime evidence:
  - `apps/web/.next/`
  - `apps/web/test-results/`
  - `apps/web/playwright-report/`
  - `tmp/`
  - `codex-scripts/`
- Runtime-intake and observability:
  - `bun run engineering:intake:runtime -- --output tmp/runtime-intake.v1.json`
  - `apps/web/lib/observability/`
  - `apps/web/scripts/export-runtime-intake.mjs`
  - `scripts/release/lib/engineering-intake-contract.mjs`
- Release proof:
  - `release.json`
  - `scripts/release/`
  - `tmp/release-evidence.v1.json`
  - `docs/archive/release-proof-runs/`
- GitHub and deployment:
  - `.github/workflows/`
  - PR links attached to the Linear issue
  - Vercel deployment links attached to the PR or release evidence
- Convex:
  - `apps/web/convex/`
  - `apps/web/convex/_generated/ai/guidelines.md` before changing Convex code
  - hosted Convex dev only; do not switch this repo to Convex local mode.

Check generated or tool output paths before trusting them. Many proof artifacts
are local snapshots and may be stale.

## Correlation Keys

- Linear issue identifier: human ticket key, for example `MMAI-267`
- Linear issue id: stable internal UUID when available
- GitHub PR URL or number
- Commit SHA
- Release version or tag from `release.json`
- Runtime-intake record id or incident id
- Vercel deployment URL
- Convex deployment URL or deployment name
- Local proof slug or artifact path

## Quick Triage

1. Confirm the Linear issue and current state.
2. Search the repo and local artifacts by Linear identifier, issue title,
   related PR number, branch name, or distinctive error text.
3. Identify the owning surface: web app, codebase compiler, generated output,
   docs pack, release proof, or release workflow.
4. Read the nearest `AGENTS.md` and relevant docs before judging the failure.
5. Trace the smallest production path that should prove the issue.
6. Classify the failure: scope ambiguity, missing ExecPlan, app bug, release
   proof failure, browser proof failure, Vercel/deployment failure, hosted
   Convex failure, billing/Stripe failure, or external connector failure.

## Commands

```bash
# 1) Narrow by Linear issue key.
rg -n "MMAI-267" AGENTS.md docs apps packages scripts .github tmp codex-scripts

# 2) Narrow by issue title, branch, PR, or error text.
rg -n "<distinctive-title-or-error>" AGENTS.md docs apps packages scripts .github tmp codex-scripts

# 3) Inspect current repo state before trusting local files.
git status --short --branch
git log --oneline --decorate -20

# 4) Find active planning surfaces.
find docs/programs/active docs/exec-plans/active -maxdepth 3 -type f -print

# 5) Export current runtime intake when observability or incidents are involved.
bun run engineering:intake:runtime -- --output tmp/runtime-intake.v1.json

# 6) Run focused release proof dry-runs when release orchestration is involved.
bun run release:proof -- --proof=default_ship --dry-run
bun run release:proof -- --proof=billing_integration --dry-run

# 7) Focus on common failure signals.
rg -n "failed|error|timeout|blocked|missing|unavailable|denied|unauthorized" apps docs scripts tmp codex-scripts
```

## Investigation Flow

1. Locate the ticket slice:
   - Search by Linear identifier first.
   - If no records match, search by issue title, PR branch, source doc path, or
     proof artifact path.
2. Establish authority:
   - If the issue maps to an active Program or ExecPlan, read that file first.
   - If the issue maps to release, auth, checkout, entitlement, browser proof,
     or ship-readiness work, read `docs/release-workflow.md`.
   - If the issue maps to Convex, read
     `apps/web/convex/_generated/ai/guidelines.md`.
3. Establish timeline:
   - Pair Linear status changes, PR timestamps, commit SHAs, CI checks, release
     proof runs, and local proof artifacts.
4. Classify the problem:
   - Scope ambiguity: Linear issue lacks acceptance criteria or source links.
   - Planning gap: implementation needs an ExecPlan but none exists.
   - App failure: focused unit/integration/build/browser proof fails.
   - Release proof failure: `scripts/release/` or release evidence fails.
   - Deployment failure: Vercel/GitHub checks fail or point at the wrong commit.
   - Data/backend failure: hosted Convex or Stripe path is unavailable or wrong.
   - Connector failure: Linear/GitHub/Vercel/Stripe tool access is unavailable.
5. Validate scope:
   - Check whether failures are isolated to one issue or repeat across several
     Ship By Sunday tasks.
6. Capture evidence:
   - Save key lines with timestamps, Linear identifier, PR URL, commit SHA, and
     proof command.
   - Record the probable root cause and exact failing stage.

## Notes

- Prefer `rg` over `grep` for speed on local logs, docs, and artifacts.
- Do not delete runtime or proof artifacts as part of diagnosis.
- Do not mutate Linear while debugging unless the user asked for status cleanup.
- Do not claim repo-wide proof when only a focused slice passed.
- If required correlation fields are missing from new artifacts, fix the
  logging, proof, or handoff contract instead of relying on ad hoc notes.
