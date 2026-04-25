# Converged Decision Packet

## Converged Decisions

CI and release proof should move toward GitHub-native required checks and protected release tags. Evidence basis: Codex CI, Codex release/CD, Codex PR policy, and SBS workflow/tag migration tracks all point at the same operating model. Codex uses always-visible checks, internal job gating, protected release tags, version validation, and release artifact gathering. SBS currently has branch-driven proof and required contexts that do not match its release-gate jobs.

Codex should be copied as an operating shape, not as a literal Rust/Bazel/npm implementation. Evidence basis: Codex CI, Codex release/CD, Codex test strategy, and SBS workflow/tag migration tracks all identify Codex-specific mechanisms that do not transfer directly. SBS is a hosted Vercel, Convex, Stripe, Clerk, Bun, Next.js, and Playwright product, so the transferable parts are release identity, check visibility, artifact/evidence gathering, narrow permissions, and source-level tests.

SBS release identity should become tag-centered, but release readiness must include hosted product proof. Evidence basis: Codex release/CD and SBS workflow/tag migration tracks agree that protected semver tags are the right release identity, while SBS workflow/tag migration and SBS QA tracks show that Vercel production, Convex production, billing, entitlement, and release-intake proof remain non-negotiable.

The helper CLI should be retired as a separate migration, not defended as Codex-like infrastructure. Evidence basis: the SBS CLI deletion track found the web app and generated starter are not coupled to the helper CLI, while the Codex PR/branch and Codex release tracks show Codex's CLI is the product itself. The CLI is only release-critical in SBS because root scripts, CI, branch-protection docs, and public docs made it so.

The QA control plane should be demoted and decomposed, not deleted wholesale. Evidence basis: the SBS QA control-plane, SBS test migration, SBS workflow/tag migration, and Program taxonomy tracks all separate disposable QA journey/run-pack/inventory surfaces from release-critical helpers under `qa/scripts`. The same folder currently contains Vercel, Convex, billing, release triage, release snapshot, and engineering-intake behavior.

Most source-level tests should survive the reset. Evidence basis: Codex test strategy and SBS test migration tracks both favor source-level unit and integration proof over broad QA harnesses. SBS test migration found most app and package tests worth preserving, while browser harness files, stale route/autosave tests, generated auth failure artifacts, and CLI tests need separate treatment.

Browser and live hosted proof should become smaller and release-scoped. Evidence basis: Codex test strategy keeps live OpenAI and real runtime tests opt-in or ignored by default, while SBS test migration and SBS workflow/tag migration show that SBS still needs hosted auth, checkout, entitlement, Vercel, Convex, and billing proof. The convergence is not "no browser proof"; it is "no broad QA harness as ordinary PR truth."

SBS should keep its Program and ExecPlan planning system. Evidence basis: docs/GitHub automation and Program taxonomy tracks both show that `docs/programs`, `docs/exec-plans`, and `docs/prompts` are active SBS contracts, while Codex has no replacement for them. The old `docs/codex` archive can be classified or retired separately.

GitHub automation should be added selectively after the core release model is clear. Evidence basis: Codex PR/branch policy and docs/GitHub automation tracks both identify useful Codex surfaces, including `.github/codex` label prompts, issue labeler/deduplicator workflows, richer issue templates, and minimal CODEOWNERS. These are not blockers for release correctness but can reduce manual triage once branch and release policy are settled.

## Tensions Or Open Questions

The branch model is not yet settled. Codex uses topic branches into `main`, but SBS currently uses feature branches into `dev`, then `dev -> main`, with Vercel and Convex production tracking `main`. The Program must still choose between moving to `main`-centered releases, preserving `dev` for staging, or using a hosted-product hybrid.

The tag workflow must still choose deploy versus attest. SBS can either deploy the exact tagged SHA to Vercel and Convex, or tag a SHA after `main` has already deployed and then attest that deployment. The second option is simpler but risks release identity drift if the hosted SHA does not exactly match the tag.

The version source of truth is unresolved. Codex validates tags against `codex-rs/Cargo.toml`. SBS currently has repeated private package versions and no release-grade single source. The Program must choose whether root `package.json`, a dedicated release manifest, or another artifact owns version truth.

The future home for release-critical helpers is unresolved. The QA track proves that `qa/scripts` contains release/intake logic that cannot be deleted blindly. The Program still needs to decide whether those helpers move under `.github/scripts`, `scripts/release`, `apps/web/features/observability/export`, a package, or another repo-owned boundary.

The helper CLI capability boundary is unresolved. The CLI itself should be retired, but the Program still needs to decide whether draft normalization, reduced fact derivation, import/export, or local generation from facts should move to `packages/blueprint-compiler` or be intentionally dropped.

The final browser proof shape is unresolved. The direction is smaller and release-scoped, but SBS still needs replacement proof for robots/sitemap, signed-out `/blueprint`, entitled `/blueprint -> /review -> /settings`, checkout success handoff, and metadata/noindex behavior.

Credentials and QA account references need verification. The QA track reported a real-looking QA credential reference, but this packet does not confirm it. Any deletion or migration touching that area must first inspect the actual file and handle rotation if needed.

GitHub automation scope is unresolved. Codex Action label prompts, issue templates, deduplication, and CODEOWNERS are useful, but SBS-specific labels, ownership, and issue surfaces still need deliberate design.

## Strongest Repo Facts

SBS currently has a new Program packet at `docs/programs/active/2026-04-24-sbs-codex-release-reset/`, and no child ExecPlan should be written until the Program packet has convergence, dependency graph, plan split, cross-repo review, and a planning brief.

SBS current release flow is branch-driven. `docs/release-workflow.md` documents feature branches into `dev`, `dev -> main`, then post-merge tagging and GitHub Release publication.

SBS release workflows are branch-push oriented: `.github/workflows/dev-staging-proof.yml`, `.github/workflows/production-release-proof.yml`, and `.github/workflows/convex-production-deploy.yml`.

SBS protected check reality does not currently match release-gate reality. The source research reported branch protection requiring `static`, `integration`, `browser-smoke`, and `cli`, while release-gate jobs are not the protected PR surface.

SBS has no reported protected release tag ruleset yet, while Codex protects release tags and validates tag/version consistency.

SBS `qa/` is both QA control plane and release infrastructure. The future Program cannot treat `qa/` deletion as a simple folder removal.

SBS helper CLI is not an upstream dependency of generated starter output. The CLI depends on blueprint compiler APIs; generated starter and web review download do not appear to depend on the CLI.

SBS tests are mostly source-level and worth preserving. The current Program direction is a test strategy reset, not a test-suite purge.

SBS planning truth lives in `docs/programs`, `docs/exec-plans`, and `docs/prompts`. `docs/codex` is historical, not the live planning lane.

## Recommended Direction

Overall architecture recommendation: build a Codex-shaped SBS release system around GitHub-native checks, protected semver release tags, release evidence artifacts, narrow permissions, source-level tests, and release-scoped hosted proof. Keep Vercel, Convex, Stripe, Clerk, and entitlement verification as SBS-specific release requirements. Retire the helper CLI and demote the QA control plane only after their release-critical and test-critical seams are relocated or replaced.

Sequencing recommendation: first make the current proof surface truthful by inventorying live required checks and release workflow dependencies. Then define release identity and tag/version policy. Then relocate release-critical helpers out of disposable QA surfaces. Then retire the helper CLI and QA harness surfaces in bounded slices. Then consolidate tests and docs/GitHub automation after the release path is stable. This is a sequencing recommendation for the future dependency graph, not a child ExecPlan selection.
