---
title: Commercial Doctor Pass Refresh
status: complete
created_at: 2026-05-05
completed_at: 2026-05-05
summary: Refresh the public offer language so generated-codebase delivery and existing-codebase doctor-pass support match shipped proof.
post_build_recap: Public homepage copy now leads with the agent doctor promise, preserves generated and existing-codebase checkout intent, and removes unsupported automatic GitHub or raw-source claims.
program_id: customer-agentic-operating-system
planning_brief: docs/programs/active/2026-05-02-customer-agentic-operating-system/planning-brief-2.md
read_when:
  - Resuming the commercial doctor-pass copy refresh.
  - Checking homepage claims against shipped existing-codebase proof.
  - Validating the final Program update for this slice.
---

# Commercial Doctor Pass Refresh

This is a living execution plan. It captures the slice that refreshes Ship by Sunday's commercial doctor-pass story after the generated-repo operating pack and the existing-codebase Crawl, Walk, Work, broken-app, and managed GitHub consent slices.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now proves two buyer paths: a generated worker-ready codebase for buyers starting from an idea, and a protected existing-codebase doctor-pass path that pairs a local runner, runs a sync-safe diagnosis, shows Top 9 findings, approves a bounded first workflow, and records managed GitHub consent without executing off-machine work. The public homepage still uses older worker-layer and PR-queue copy that can imply broad GitHub execution or automatic PR delivery. After this slice, a visitor should see the same intent split but read a truthful offer: start from an idea, or bring an existing app for a private local doctor pass with proof and explicit consent boundaries.

The observable result is copy-only unless implementation discovers that the runtime CTA targets are wrong. The existing homepage buttons should keep routing `I have an idea` to generated-codebase checkout intent and `I have a codebase already` to existing-codebase doctor checkout intent. No new checkout entitlement, provider integration, GitHub execution, PR creation, or source upload should appear in this slice.

## Progress

- [x] 2026-05-05 EDT: Read root `AGENTS.md`, `docs/programs/PROGRAMS.md`, `docs/exec-plans/PLANS.md`, the active Program, `planning-brief-2.md`, `apps/web/AGENTS.md`, `docs/release-workflow.md`, `apps/web/content/docs/configure-the-homepage.mdx`, root `DESIGN.md`, and the design-pack `AGENTS.md`.
- [x] 2026-05-05 EDT: Inspected the homepage control plane and content in `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, and the existing homepage tests.
- [x] 2026-05-05 EDT: Refreshed the homepage promise, hero body, existing-codebase branch, FAQ, and pricing include copy to match generated-codebase delivery, private local doctor-pass support, proof, and managed GitHub consent only.
- [x] 2026-05-05 EDT: Updated focused homepage content, render-model, primary CTA, and product-preview tests for the changed copy and preserved checkout intent.
- [x] 2026-05-05 EDT: Updated the Program and design documentation with the commercial refresh and chose `observability-debuggability` as the next recommended slice.
- [x] 2026-05-05 EDT: Focused homepage unit and integration-ui tests passed; root format, lint, typecheck, plan lint, Program lint, markdown lint, `git diff --check`, and desktop/mobile screenshot proof passed after the plan move.

## Surprises & Discoveries

The homepage's existing-codebase branch already routes checkout intent to `buyerStartingPoint: "existing_codebase"` through `checkoutCtaId: "codebase_demo_existing"`, but the branch copy still said "Connect your GitHub" and "PRs start happening." That no longer matched the shipped managed GitHub consent boundary, which records consent only and does not execute GitHub actions. The refresh removed those claims and now says local mode does not push branches, open PRs, rerun CI, or share raw source.

## Decision Log

Decision: Keep this slice copy-only and preserve checkout routing.
Rationale: The Program asks this slice to decide whether commercial copy needs to change after proof landed. The runtime route and metadata path already preserve buyer intent; the stale part is the promise language around local privacy, proof, and GitHub.
Date: 2026-05-05

Decision: Describe managed GitHub as concierge consent, not automatic execution.
Rationale: The shipped Run-phase slice stores request and audit state only. Public copy must not imply broad repo access, branch pushes, PR creation, CI-affecting commands, or raw-source sharing.
Date: 2026-05-05

## Outcomes & Retrospective

The public offer copy now matches shipped proof without changing fulfillment behavior. The hero leads with "Agent doctor for web apps"; the existing-codebase branch promises a private local doctor pass, Top 9 findings, sync preview approval, first-loop approval, proof or blocked proof, and managed GitHub consent only; and pricing/FAQ copy no longer sells the old worker-layer/course framing. The next Program slice is implementation-shaped again: `observability-debuggability` should become the next child ExecPlan before runtime or provider work begins.

## Context and Orientation

The public homepage is configured from `apps/web/config/product.ts` and `apps/web/app/_content/home-page.ts`. `starterConfig.homePage.heroPrimaryCta` and `pricingPrimaryCta` target generated-codebase checkout intent. The existing-codebase branch CTA is rendered in `apps/web/app/_components/home-page/sections/codebase-demo/codebase-demo-codebase-branch.tsx` and passes checkout intent directly to `HomePagePrimaryCta`.

Checkout intent is already part of the paid fulfillment contract. Generated-codebase buyers route to `/codebase`, existing-codebase doctor buyers route to `/workspace/setup`, and missing or legacy intent routes to `/workspace/choose`. This slice should not change that runtime behavior unless tests prove it is inconsistent with the Program.

Existing-codebase proof now lives across the protected `/workspace/*` surfaces and `packages/local-runner`. The local runner path keeps raw source, long logs, secrets, and Codex transcripts local by default, then syncs approved structured findings and proof status. Managed GitHub currently appears as a consent request and audit boundary on `/workspace/privacy`; it does not call GitHub APIs.

### In Scope

Refresh public homepage and offer copy so normal buyers understand Ship by Sunday as the agent doctor for web apps. The copy should explain the two starting points, the private local doctor pass, Top 9 findings, first recommended loop, proof or blocked proof, and managed GitHub as explicit concierge consent only. Update focused tests that assert the changed copy and preserve checkout intent. Update the active Program and design documentation because the public commercial story changes.

### Out Of Scope

Do not add mature-repo adoption automation, new checkout entitlements, new Stripe prices, GitHub App setup, GitHub API calls, token storage, branch pushes, pull requests, CI reruns, raw-source upload, provider setup, package/update-channel mechanics, or generated-repo compiler changes. Do not redesign the homepage layout or add new UI components unless the existing copy shape cannot carry the truthful claim.

## Plan of Work

First, change the durable copy constants in `apps/web/config/product.ts` and `apps/web/app/_content/home-page.ts`. The hero should speak in buyer language and avoid internal-only phrasing. The existing-codebase branch should remove automatic GitHub and PR claims, replace app-server language with local-runner privacy language, and make the next action the protected setup entry for a sync-safe doctor pass. Pricing and FAQ copy should state the flagship offer as diagnosis, first loop, proof, and next recommendation without promising unmanaged mature-repo transformation.

Second, update homepage tests under `apps/web/tests/unit/` and `apps/web/tests/integration-ui/` so they prove the new copy and preserve buyer-intent routing. Keep the test surface narrow because this is a copy and offer-framing refresh, not a behavior change.

Third, update `docs/ship-by-sunday/design-pack/documentation.md` with a shipped note and update the Program progress, slice ledger, next slice, and risks. The Program should choose the next implementation slice after this commercial refresh.

Finally, move this plan from `active/` to `completed/`, fill the retrospective and front matter, then run validation from focused tests to broad gates.

## Milestones

The first milestone is public copy alignment. At the end, the homepage should no longer tell existing-codebase buyers to connect GitHub or expect PRs to start automatically. The branch should instead promise local setup, a private doctor pass, approved structured findings, and explicit consent for concierge GitHub.

The second milestone is proof. Focused unit and integration-ui tests should pass and should verify both the changed language and unchanged checkout intent metadata.

The third milestone is Program closeout. The active Program should record this commercial refresh, move this plan into completed child ExecPlans, and name a next slice that is implementation-shaped rather than copy-shaped.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Edit:

    apps/web/config/product.ts
    apps/web/app/_content/home-page.ts
    apps/web/tests/unit/home-page-content.test.ts
    apps/web/tests/unit/home-page-render-model.test.ts
    apps/web/tests/integration-ui/home-page-product-preview.test.tsx
    docs/ship-by-sunday/design-pack/documentation.md
    docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md
    docs/exec-plans/active/2026-05-05-commercial-doctor-pass-refresh.md

Run the focused homepage tests before broader gates. The expected observation is a passing Vitest summary with the homepage content, render model, and product preview suites green. If these tests fail because copy assertions are stale, update the assertions to the new commercial contract. If they fail because the checkout intent changed, repair the runtime code or revert that behavior change inside this slice.

## Validation and Acceptance

Acceptance requires the public copy to make no unsupported claims about automatic managed GitHub execution, branch pushes, pull requests, CI-affecting commands, raw-source upload, or mature-repo transformation. The existing-codebase branch must still start checkout with existing-codebase doctor intent, and the generated-codebase hero and pricing CTAs must keep generated-codebase intent.

The Program must be current at completion: progress entry, slice ledger, next slice, and any risk/watchpoint changes. This ExecPlan must be complete in `docs/exec-plans/completed/`.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/home-page-content.test.ts tests/unit/home-page-render-model.test.ts tests/unit/home-page-primary-cta.test.tsx
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/home-page-primary-cta.test.tsx
    bun run format
    bun lint
    bun typecheck
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-05-commercial-doctor-pass-refresh.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-05-commercial-doctor-pass-refresh.md docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md docs/ship-by-sunday/design-pack/documentation.md
    git diff --check

## Idempotence and Recovery

This is a copy and documentation slice. If a test or lint command fails, rerun after fixing only the touched copy, assertions, or planning docs. Do not change checkout routing, Stripe, Convex schemas, local-runner behavior, managed GitHub provider setup, or generated compiler output to make a copy test pass. If broad gates fail in unrelated dirty worktree files, record the exact unrelated failure in this plan and final summary instead of reverting user work.

## Artifacts and Notes

The key proof artifacts are the focused homepage test transcripts, the root validation commands, the final Program diff, and the temporary desktop/mobile screenshot pass against a local Next server. The screenshots covered the default idea branch and the selected existing-codebase branch at 1440px desktop and 390px mobile, then the generated `.screenshots` artifacts were removed from the worktree. The most important manual read-through is the existing-codebase branch in `home-page.ts`: it now says local execution and approved structured sync, not app-server harness or automatic GitHub PR work.

## Interfaces and Dependencies

This slice depends on the homepage control plane in `apps/web/config/product.ts`, public content in `apps/web/app/_content/home-page.ts`, checkout intent normalization under `apps/web/platform/billing/checkout/`, protected workspace routes under `apps/web/app/(workspace)/workspace/`, and the Program packet under `docs/programs/active/2026-05-02-customer-agentic-operating-system/`.
