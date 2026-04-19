---
name: release-triage
description: Use when the user wants one deterministic answer about whether the current dev release candidate is actually ready to promote toward main.
---

# Release Triage

Run the repository-owned release triage surface before trusting a `dev -> main` release.

## Purpose

This skill is the release control-plane entrypoint. It tells the operator which exact `origin/dev` commit is being treated as the candidate, whether the current `dev -> main` release PR matches that commit, whether the staging proof checks are green on that same SHA, whether the staged preview deployment is known, and whether snapshot fallback is required.

## Command

From the repository root, run:

```bash
bun run release:triage
```

The command prints structured JSON. Treat these fields as the release contract:

- `candidate.sha` is the exact `origin/dev` release candidate commit.
- `releasePath.state` is the release-path verdict.
- `proof.deployment` describes the exact Vercel preview deployment and alias state when that metadata is available.
- `proof.githubEnvironmentName`, `proof.billingGitHubEnvironmentName`, and `proof.qaEnvFile` describe which environment surfaces are supposed to supply proof.
- `readiness.ready` is only `true` when the release path is clean, the required staging checks are green on the candidate SHA, and the matching preview deployment metadata is resolved.

## Operator notes

- If `releasePath.state` is `blocked_metadata`, stop and fix the missing GitHub or Vercel source of truth before shipping.
- If `releasePath.state` is `blocked_unrelated_dev_scope`, stop and reconcile the release PR so it matches `origin/dev`.
- If `releasePath.state` is `snapshot_required`, do not improvise. Switch to the documented release-snapshot fallback once that surface is implemented.
- If `readiness.ready` is `false`, use `readiness.blockers` as the exact repair list.
