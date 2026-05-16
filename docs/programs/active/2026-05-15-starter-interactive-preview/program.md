---
program_id: "starter-interactive-preview"
title: "Starter Interactive Preview"
status: "active"
created_at: "2026-05-15"
completed_at: null
summary: "Bring a Starter-specific interactive idea-to-codebase preview back to `/starter` while preserving checkout, product split boundaries, and the T3 Code public visual system."
post_build_recap: null
read_when:
  - "Planning or implementing the `/starter` interactive preview."
  - "Changing old codebase-demo pieces that feed public Starter preview or protected Starter draft seeding."
  - "Checking why the old homepage stack should not return."
---

# Starter Interactive Preview

This Program is the living initiative document for restoring a Starter-specific interactive preview on the public Starter offer page.

Maintain this Program in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

The Starter page should do more than describe the offer. A visitor starting from an idea should be able to feel the first few steps: answer product facts, pick design direction, set pricing, and see how those inputs become part of the repo/codebase promise after checkout. That interactive preview used to exist in the old homepage system, but the current public product split moved `/` into a Man Meets AI brand page and `/starter` into the Starter offer page.

This Program brings the useful preview behavior back in the right place. It must not resurrect the old homepage wholesale. The finished page should keep the current `/starter` checkout CTA, route shell, and T3 Code public visual system while adding a compact Starter-only preview near the hero. Success is visible when `/starter` shows the preview on desktop and mobile, every checkout entry still uses `offerId="starter"`, and the old homepage/demo compatibility code still works if it remains referenced.

## Program Inputs

- `docs/programs/active/2026-05-15-starter-interactive-preview/research-pass-starter-preview.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/normalized-pass-starter-preview-target.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/converged-decision-packet.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/dependency-graph.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/plan-split-recommendation.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/cross-repo-review.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/planning-brief-1.md`
- `docs/programs/active/2026-05-15-starter-interactive-preview/current-planning-brief.txt`
- `apps/web/src/content/docs/configure-the-homepage.mdx`
- `docs/programs/completed/2026-05-14-t3-code-source-design-system-port/program.md`
- `docs/programs/active/2026-05-12-public-product-split-starter-workers/program.md`
- `docs/release-workflow.md`

## Current State

The repository is on local `main` at the same commit as `origin/main`, but the worktree contains unrelated runner/package changes. This Program should avoid those files and child ExecPlans should distinguish unrelated validation blockers from preview work.

The current `/starter` route lives at `apps/web/src/app/(marketing)/starter/page.tsx`. It uses shared public route surface components, renders a hero, renders two offer panels, includes a `CheckoutButton offerId="starter"` with `testId="starter-checkout-cta"`, and links existing-codebase visitors to `/workers`. It does not currently show the interactive idea-to-codebase preview.

The old interactive preview lives under `apps/web/src/app/_components/home-page/sections/codebase-demo/`. Its full wrapper includes old homepage-specific pieces that should not return, but its smaller pieces still carry useful behavior: local draft storage, draft state, Foundation fields, Design preset controls, Pricing controls, locked Codebase section previews, sidebar progress, and save-before-checkout behavior.

The protected Starter workspace still reads the old local draft storage through `apps/web/src/lib/codebase-flow/use-codebase-local-draft-seeder.ts`. That makes the existing storage contract part of the product handoff.

## Progress

- [x] 2026-05-15: Researched the current `/starter` route, old codebase-demo implementation, public route visual system, checkout boundary, and local draft seeding path.
- [x] 2026-05-15: Decided this should be a Program because it spans public route design, old compatibility extraction, checkout-adjacent behavior, local draft handoff, tests, and browser proof.
- [x] 2026-05-15: Created this active Program packet with research, normalization, decision, dependency, split, review, and first planning brief artifacts.
- [x] 2026-05-15: Wrote the first child ExecPlan from `planning-brief-1.md`.
- [x] 2026-05-15: Implemented the Starter preview slice, including shared old-demo progress extraction, a scoped `/starter` client preview, focused tests, and browser proof.
- [x] 2026-05-15: Recorded unrelated public-docs WIP blockers for app format check and root lint.

## Decision Log

Decision: Put the interactive preview on `/starter`.
Rationale: `/starter` is the public Starter offer page. `/` is now the Man Meets AI brand and routing page, so restoring the preview to `/` would violate the current public IA.
Date: 2026-05-15.

Decision: Do not import the old full homepage demo wrapper into `/starter`.
Rationale: `CodebaseDemoSectionBlock` includes the old full-screen dark hero and existing-codebase branch. It would bring back the old homepage wholesale instead of a Starter-specific preview.
Date: 2026-05-15.

Decision: Reuse or extract the old demo internals that carry behavior.
Rationale: Draft storage, interactive Foundation/Design/Pricing cards, progress, locked previews, and save-before-checkout behavior are real product behavior and should not be duplicated.
Date: 2026-05-15.

Decision: Match the current T3 Code public route visual system.
Rationale: The completed T3 Code Program supersedes old visual doctrine. The preview should use compact public route surfaces, DM Sans, zinc tokens, blue accents, and quiet panels.
Date: 2026-05-15.

Decision: Keep checkout explicit and Starter-only.
Rationale: Public checkout entry surfaces are revenue and access-critical. The preview CTA should explicitly use `offerId="starter"` and the existing hero CTA should remain unchanged.
Date: 2026-05-15.

## Slice Ledger

Active child ExecPlans:

None currently.

Planned child ExecPlans:

None currently.

Completed child ExecPlans:

- `docs/exec-plans/completed/2026-05-15-add-starter-interactive-preview.md`: added the `/starter` preview, reused codebase-demo internals through a shared progress helper, preserved checkout and old demo compatibility, added tests, and captured browser proof.

## Next Slice

No next implementation slice is planned before PR review. The remaining work is review, merge, and follow-up only if review or CI identifies a real Starter preview issue.

## Risks and Watchpoints

Do not reintroduce the old homepage section stack. The preview should not include the old full-screen leverage hero, the existing-codebase branch, Doctor Pass audit copy, social proof, Program/PLANS homepage material, FAQ, or pricing footer.

Do not silently widen into checkout internals. The first slice should not change Stripe offer IDs, checkout session params, checkout success routes, webhooks, entitlement grants, or provider setup.

Do not break draft seeding. The protected Starter seeder depends on the existing local storage schema.

Do not mark the route page itself as a Client Component. The interactive preview needs client state, but the public route shell can remain server-rendered.

Do not touch unrelated dirty runner/package worktree changes. If broad validation fails because of those files, record that separately.

## Outcomes & Retrospective

The implementation state now matches the Program goal: `/starter` shows a clean Starter-specific interactive preview below the hero while keeping the current checkout and public route contracts intact. The preview reuses old homepage demo internals for draft state, cards, and progress, but avoids the old full-screen leverage hero and existing-codebase branch. The current residual risk is local-only validation noise from unrelated public-docs retirement WIP in the same checkout.

## Validation and Acceptance

Program-level acceptance requires `/starter` to render the interactive preview below or near the hero, preserve the existing hero checkout CTA, and make every preview checkout CTA use `offerId="starter"`. The preview must be Starter-specific: idea, product facts, design/pricing preview, and repo/codebase promise. It must not render the old existing-codebase branch or revive the old homepage section stack.

The implementation keeps existing homepage/demo code working if it is still referenced and preserves the protected local draft seeding contract. Desktop and mobile browser proof passed after fixing 390px overflow. Focused public route and preview tests, old homepage demo compatibility, plan lint, markdown lint, Program lint, root typecheck, and `git diff --check` passed. `bun run --cwd apps/web format:check` and `bun lint` are blocked by unrelated public-docs retirement WIP in `apps/web/tests/unit/public-metadata-routes.test.ts` and `apps/web/src/app/_content/public-content-inventory.ts`.

## Artifacts and Notes

Important current files:

- `apps/web/src/app/(marketing)/starter/page.tsx`
- `apps/web/src/components/layout/public-route-surface.tsx`
- `apps/web/src/app/_components/home-page/sections/codebase-demo/`
- `apps/web/src/lib/codebase-flow/use-codebase-local-draft-seeder.ts`
- `apps/web/tests/unit/public-marketing-surfaces.test.tsx`
- `apps/web/tests/integration-ui/home-page-product-preview.test.tsx`

Useful validation commands for the child slice:

    bun run --cwd apps/web test:unit -- tests/unit/public-marketing-surfaces.test.tsx tests/unit/public-metadata-routes.test.ts tests/unit/proxy-protected-routes.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-product-preview.test.tsx
    bun run --cwd apps/web format:check
    bun lint
    bun typecheck
    git diff --check

## Interfaces and Dependencies

The Program depends on Next.js App Router Server and Client Component boundaries. The route page should stay server-rendered while the interactive preview owns browser state.

It depends on the app-owned checkout button and billing offer model. The preview should call checkout through existing `CheckoutButton` behavior and pass `starter` as the offer.

It depends on the old codebase-demo local draft storage schema because protected Starter seeding reads that browser storage after checkout.

It depends on the T3 Code public route surface and shared UI primitives for visual consistency.

It depends on the public product split that keeps Starter and Workers as separate public offer pages with separate protected product routes.
