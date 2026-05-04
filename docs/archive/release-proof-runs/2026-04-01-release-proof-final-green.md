# QA Run Report

Date: 2026-04-01
Environment: dev.man-meets-ai.com and prod-www.man-meets-ai.com
Pack: release_proof
Slug: april-1-release-final-green
Prepared personas: signed_out, member_without_access, member_with_access
Scenario IDs: release_scope, default_ship, billing_integration, release_gate

## Scope Tested

Final April 1 release shepherding evidence for the shipped `main` head:

- forced `Dev Staging Proof` run `23865552478` on `dev` commit `2b5eccf85141ad90ef2b8af4b85bda4804491189`
- green `CI` run `23867770620` on `main` commit `92da71a5218440030828d2b36bfab76a41993b79`
- green `Convex Production Deploy` run `23867770585` on `main` commit `92da71a5218440030828d2b36bfab76a41993b79`
- green `Production Release Proof` run `23867770574` on `main` commit `92da71a5218440030828d2b36bfab76a41993b79`

## Passed

- `dev` staging proof passed `release_scope`, `default_ship`, forced `billing_integration`, and `release_gate` on the final `dev` candidate before promotion.
- `main` CI, Convex production deploy, and production release proof all passed on the final shipped production commit.
- Production proof used the hosted `default_ship` path successfully after the Playwright bootstrap fixes for `QA_ENV_FILE`, auth-session stability, and production Convex CLI targeting.

## Findings

- `medium` — The staging alias `dev.man-meets-ai.com` drifted to an older preview deployment during release shepherding and had to be manually repointed before the final forced `dev` proof could verify the correct frontend commit.
- `low` — `Production Release Proof` surfaced one flaky annotation in the final green run because the review page had two links matching `Download Codebase`. The workflow still passed because the pack did not treat that flaky assertion as a release gate.

## Blocked

- None on the final green runs.

## Notes

- Earlier April 1 proof runs failed for real reasons and were superseded by the final green evidence above.
- This report supersedes the older March production baselines for current release-state questions.
