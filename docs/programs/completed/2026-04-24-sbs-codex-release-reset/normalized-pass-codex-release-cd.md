# Codex Release And CD Normalized

## Facts

- Codex release automation is tag-driven. `/Users/parkerrex/Developer/codex/.github/workflows/rust-release.yml:8-16` triggers on `rust-v*.*.*` tag pushes.
- Codex validates release tags against a semver-like pattern and compares the tag version to `codex-rs/Cargo.toml`, around `.github/workflows/rust-release.yml:30-45` and `codex-rs/Cargo.toml:103`.
- Codex uses explicit stable and prerelease channel policy. GitHub Releases mark prereleases when the version contains `-`; npm and WinGet have narrower publish rules.
- Codex release jobs gather artifacts before publishing a GitHub Release, with aggregation around `.github/workflows/rust-release.yml:392-543`.
- Codex isolates signing and publish permissions into release jobs and platform-specific signing actions.
- Codex npm publish treats already-published versions as idempotent success.
- Codex does not encode a first-class automated rollback workflow; practical rollback is old tag/assets plus installer pinning.

## Recommendation

Adopt Codex's release invariants for SBS: a protected semver release tag, version-source validation, explicit stable/prerelease policy, artifact/evidence gathering before publication, narrow release permissions, and idempotent publish behavior.

## Risks

- Codex's binary, npm, DotSlash, WinGet, and signing implementation is not portable to SBS unless SBS decides to publish packages or installers.
- A tag workflow that does not deploy or attest the exact hosted SHA would create release identity drift.
- Lack of a first-class rollback story would remain a weakness if SBS copies Codex's release model without adapting it for Vercel and Convex.

## Code Seams

- `.github/workflows/production-release-proof.yml`
- `.github/workflows/convex-production-deploy.yml`
- `docs/release-workflow.md`
- `package.json`
- `apps/web/package.json`
- `packages/blueprint-compiler/package.json`
- GitHub Releases and protected tag rulesets
- Vercel production deployment identity
- Convex production deployment identity
- `/Users/parkerrex/Developer/codex/.github/workflows/rust-release.yml`

## Proposed Slices

1. Define the SBS release tag pattern and version source of truth.
2. Add tag validation and release evidence gathering around the tagged SHA.
3. Adapt hosted Vercel, Convex, Stripe, and Clerk proof to release tags.
4. Publish GitHub Releases from verified release evidence rather than from manual post-merge steps.

