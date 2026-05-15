# Ship by Sunday Design Documentation

Use this template for each shipped design task, UI workflow, or meaningful surface update. The goal is to make every implementation understandable, reviewable, and reusable.

## Required frontmatter

```md
---
doc_id:
title:
owner:
team:
surface_type:
status: draft / active / paused / retired
created:
last_reviewed:
review_cadence:
related_plan:
related_files: []
tags: []
---
```

## 1. Summary

What changed, for whom, and why it matters.

## 2. Problem and goal

- **Problem:** {{what was weak, unclear, or missing before}}
- **Goal:** {{what the new design is supposed to achieve}}
- **Audience / user:** {{who this serves}}
- **Surface type:** {{landing page | marketing page | app | dashboard | prototype | demo}}

## 3. Final outcome

Describe the result in user-facing terms.

- {{outcome 1}}
- {{outcome 2}}
- {{outcome 3}}

## 4. Design direction

- **Visual thesis:** {{final visual thesis}}
- **Content plan:** {{final narrative or operational structure}}
- **Interaction thesis:** {{motions or interaction ideas that shipped}}

## 5. Scope of work

### Routes / screens / components changed

- {{route or file 1}}
- {{route or file 2}}
- {{route or file 3}}

### Out of scope

- {{out-of-scope item 1}}
- {{out-of-scope item 2}}

## 6. Design-system decisions

### Tokens added or changed

- {{token change 1}}
- {{token change 2}}
- {{token change 3}}

### Typography decisions

- {{typography decision 1}}
- {{typography decision 2}}

### Layout and composition decisions

- {{layout decision 1}}
- {{layout decision 2}}
- {{layout decision 3}}

### Component reuse vs new work

- **Reused:** {{existing components or patterns reused}}
- **New:** {{new components, variants, or abstractions added}}
- **Why:** {{why new work was needed}}

## 7. Imagery and content decisions

- **Imagery source:** {{uploaded | generated | existing library | none}}
- **Why this imagery works:** {{summary}}
- **Copy strategy:** {{how copy was structured and why}}
- **What was removed:** {{filler copy, extra chrome, weak sections, etc.}}

## 8. Motion and interaction

List the meaningful motion or interaction work that shipped.

1. {{motion or interaction 1}}
2. {{motion or interaction 2}}
3. {{motion or interaction 3}}

## 9. Responsive behavior

- **Desktop checks:** {{what was verified}}
- **Mobile checks:** {{what was verified}}
- **Layout safety notes:** {{sticky headers, overlays, text-safe areas, tap targets, etc.}}

## 10. Verification

- **Manual review:** {{what was checked manually}}
- **Automated checks:** {{lint, tests, typecheck, build, Playwright, screenshot compare, etc.}}
- **Reference comparison:** {{Figma, screenshot, existing product patterns, none}}
- **Checklist status:** {{which sections of CHECKLIST.md were most relevant and whether they passed}}
- **Codebase-first status:** {{what codebase, funnel, or homepage invariants were preserved}}

## 11. Tradeoffs and deviations

Document intentional compromises.

- {{tradeoff 1}}
- {{tradeoff 2}}
- {{tradeoff 3}}

## 12. Known issues

- {{issue 1}}
- {{issue 2}}

## 13. Follow-ups

- {{follow-up 1}}
- {{follow-up 2}}
- {{follow-up 3}}

## 14. Screenshots and references

- **Before:** {{path or link}}
- **After:** {{path or link}}
- **Plan used:** {{path to task plan}}
- **Additional references:** {{links, notes, design files}}

## 15. Maintenance

- **Update owner:** {{who refreshes this doc}}
- **How stable knowledge is refreshed:** {{process}}
- **How often examples are re-baselined:** {{cadence}}
- **Sunset criteria:** {{when this doc should be retired or replaced}}

## 16. Source guidance

This work was guided by:

- `docs/openai/design-pack/AGENTS.md`
- `docs/openai/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/AGENTS.md`
- `docs/ship-by-sunday/design-pack/CHECKLIST.md`
- `docs/ship-by-sunday/design-pack/PLANS.md`
- the task-specific plan derived from `docs/ship-by-sunday/design-pack/PLANS.md`

If helpful, also record the external official references used for the work:

- {{official reference 1}}
- {{official reference 2}}
- {{official reference 3}}

## Shipped Note: Worker Seal Team 6 Public Landing Page

- **Date:** 2026-05-14
- **Surface:** `/worker-seal-team-6` public landing page, public navigation, and the `/` routing section.
- **Change:** Added the fourth Program landing page for the $2500 hands-on service. The page uses the existing founder proof image as a full-bleed first-screen visual, names Worker Seal Team 6 as the hero product signal, explains when to use the service, shows what happens in the hour, and now routes the primary action to a booking section that renders a Cal.com embed and hosted fallback when configured.
- **Design direction:** Keep the service page premium and codebase-first: one calm hero composition, no hero cards, no fake booking embed, no app-owned checkout, and cards only after the first viewport for use-case, process, booking, and product-lane routing.
- **Out of scope:** No Stripe checkout, no Clerk gate, no Resend email, and no Sentry setup.
- **Verification:** Public route metadata tests, app lint, and app typecheck/build should pass. Desktop and mobile browser proof should verify the hero image, navigation, CTAs, and responsive text fit before the ExecPlan closes.

## Shipped Note: Worker Seal Team 6 Cal.com Booking Foundation

- **Date:** 2026-05-14
- **Surface:** `/worker-seal-team-6` booking section and `POST /api/cal/worker-seal-team-6/webhook`.
- **Change:** Added a route-local Cal.com booking component that loads the hosted embed only when `NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK` is set, keeps the hosted Cal.com fallback link visible, and preserves direct scheduling when the link is unset. Added the verified Cal.com webhook route and Convex mirror boundary for booking lifecycle state.
- **Design direction:** Keep the booking module below the first viewport so the hero remains a service landing page, not a scheduling dashboard. The embed gets stable height and a restrained frame; support and hosted fallbacks stay visible because third-party embeds can fail.
- **Out of scope:** No Resend prep/ops email, no Sentry setup, no app-owned Worker Seal Team 6 checkout, no Clerk or workspace onboarding, and no refund closeout UX.
- **Verification:** Focused unit, route integration, and integration-ui tests cover signature verification, mapping, failure modes, and configured/unconfigured booking states. Browser proof should verify desktop and mobile spacing with the unconfigured fallback and, when a Cal Link is available, the configured embed state.

## Shipped Note: Codebase Intake Section Draft Assist

- **Date:** 2026-05-01
- **Surface:** `/codebase` app workspace
- **Change:** Foundation, Problem, Outcome, Pricing, and Setup now expose a compact `Draft with AI` action at the section header. The action uses the existing Codex connection flow to turn rough notes in the current intake into editable first-draft field values.
- **Design direction:** Keep the workspace operational and sparse. The assistant is a quiet outline action beside each draftable section, not a separate card or promotional panel.
- **Out of scope:** Design and Generated Preview remain excluded because Design has curated visual controls and Generated Preview is compiler-owned.
- **Verification:** Focused unit, integration, integration-ui, format, lint, and typecheck/build checks were run for the touched codebase/Codex slice.

## Shipped Note: Real Codebase Demo On The Public Homepage

- **Date:** 2026-05-02
- **Surface:** `/` public homepage and `/codebase` workspace.
- **Change:** The first-screen `productPreview` section now previews the real Codebase intake. All 7 canonical sections render in canonical order. Foundation, Design, and Pricing are interactive. Problem, Outcome, Setup, and Generated preview are visible-but-locked rows. The "Generate my codebase" CTA persists the demo draft to a versioned `localStorage` envelope (`sbs:home-codebase-draft:v1`) before starting Stripe checkout. After checkout, a workspace-mounted seeder hydrates those fields into Convex on the first authenticated `/codebase` load when the buyer has no saved facts, then clears the local draft.
- **Design direction:** Keep the demo honest by showing the full canonical section sequence even though only three sections are interactive on the public route. Reuse field labels and helpers from `@shipbysunday/codebase-presentation` and design presets from `@shipbysunday/codebase-compiler` so the demo cannot drift from the real workspace.
- **Out of scope:** No homepage interactivity for Problem, Outcome, Setup, or Generated preview. No pre-auth Convex draft session. No free-form `theme_preset` editing on the public route. No Convex schema changes.
- **Verification:** Focused unit and integration-ui packs for homepage content, render model, structured data, draft storage, demo behavior, primary CTA, checkout button, and post-checkout seeder. Repo-level `bun run --cwd apps/web lint`, `format:check`, `bun typecheck`, `bun lint`, `bun run format`, and `bun run --cwd apps/web build`. Manual browser proof at desktop and mobile viewports at `/?marketing=1`.

## Shipped Note: Starter Repository Invite Flow Removal

- **Date:** 2026-05-04
- **Surface:** `/settings`, workspace home setup cards, and mission extras.
- **Change:** Removed the private starter repository invite card, GitHub username form, pending invite status, and manual repository provisioning affordances from customer-visible app surfaces.
- **Design direction:** Keep Settings operational and sparse. The remaining Settings surface focuses on Codex connection and account management, matching the current Codebase-first product contract.
- **Out of scope:** The compiler's internal generated Codebase repo-generation machinery remains intact even where implementation names still contain "starter."

## Shipped Note: Figma Leverage Hero On The Public Homepage

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** Removed the old first-screen Codebase explainer copy ("Spec your product, then generate the codebase.", the paying-buyer Codebase paragraph, and the checkout unlock note) and replaced that space with the Figma-sourced "Install leverage" hero and two-option starting-point selector.
- **Design direction:** Match the Figma selection's black editorial composition, Instrument Serif display headline, Inter subline, and grey/white selector while keeping the real Codebase demo and checkout persistence below it.
- **Out of scope:** No new checkout target, no change to the 7-section Codebase demo contract, and no external provider setup.
- **Verification:** Focused homepage content/render-model tests and integration-ui coverage should assert the new hero copy and preserved canonical demo sections, with desktop and mobile browser proof against the Figma screenshot before release.

## Shipped Note: Project Typography Contract

- **Date:** 2026-05-03
- **Surface:** Global app, public homepage, docs shell, blog, and workspace H1 surfaces.
- **Change:** Centralized font loading through the app font module. Inter now owns UI text at a 14px default, Berkeley Mono owns code and numeric UI at a 12px code default, Instrument Serif owns H1 headings with `-0.04em` spacing, and Bebas Neue is constrained to the `SHIP BY SUNDAY` wordmark/logo role.
- **Design direction:** Preserve the restrained operating-system feel while making the typography roles explicit and repeatable across marketing, docs, and app surfaces.
- **Out of scope:** No generated customer starter font contract changes beyond the active app presentation layer.
- **Verification:** Run focused app checks, broad repo gates, and desktop/mobile browser proof for the global typography pass before release.

## Shipped Note: Tutorial Video Library Thumbnails

- **Date:** 2026-05-06
- **Surface:** `/tutorials`.
- **Change:** Reworked the protected Tutorial Videos index from a text-only lesson list into a thumbnail-first video library. The page now shows block jump cards, per-block video counts, Build subgroups, compact video rows, duration metadata, and first-party thumbnail images.
- **Design direction:** Keep the surface operational and quiet: no marketing hero, no decorative grid, no iframe thumbnails. Thumbnails are small visual anchors inside reusable rows, and the long Build block is split into scan-friendly work phases.
- **Out of scope:** No lesson watch-page change, no route entitlement change, and no new customer setup. Bunny thumbnail delivery is handled through the app's validated thumbnail proxy.
- **Verification:** Focused tutorial library, route, video helper, pipeline, and thumbnail proxy tests should pass; desktop and mobile browser proof should confirm all 29 thumbnails load without layout overlap.

## Shipped Note: Homepage Starting-Point Branches

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** The first-screen starting-point selector now controls the below-fold homepage branch. `I have an idea for a product` keeps the real Codebase demo and the existing homepage story through the section before founder social proof. `I have a codebase already` swaps that branch for the Figma-sourced codebase audit path with Shippie imagery and audit checklist copy.
- **Design direction:** Preserve the black editorial Figma composition while making the selector a real information-architecture control instead of a cosmetic pressed state.
- **Out of scope:** No checkout behavior change, no social-proof/pricing/footer branch split, and no external provider setup.
- **Verification:** Focused homepage content, render-model, and integration-ui tests should cover both branches; desktop and mobile browser proof should confirm the Figma-derived branch remains readable.

## Shipped Note: Homepage Shared Starting-Point Continuation

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** The first-screen starting-point selector keeps its branch-specific opening content, but both `I have an idea for a product` and `I have a codebase already` now continue through the same downstream homepage sections: `Ship codebases that convert`, `How Workers Work`, worker-layer explanation, founder proof, Programs, FAQ, PLANS.md, pricing, and footer.
- **Design direction:** Preserve the selector as a real starting-context choice without hiding the core worker-layer story from the codebase-audit path.
- **Out of scope:** No checkout behavior change, no new branch-specific pricing, and no external provider setup.
- **Verification:** Focused integration-ui coverage should toggle to the codebase branch and confirm the shared section headings remain visible without the retired Exec Loops section.

## Shipped Note: Exec Loops Homepage Section Removal

- **Date:** 2026-05-04
- **Surface:** `/` public homepage.
- **Change:** Removed the standalone `Exec Loops: OpenAI's Weapon of choice` section, its `#system` anchor, supporting copy, and section control-plane entries from the public homepage contract.
- **Design direction:** Keep the homepage story moving from the hero directly into the worker explanation without an intermediate editorial section.
- **Out of scope:** No checkout behavior change, no pricing or structured-data change, and no external provider setup.
- **Verification:** Focused homepage content, render-model, contract, and integration-ui coverage should assert the removed copy and retired anchor are no longer present.

## Shipped Note: Commercial Doctor Pass Homepage Refresh

- **Date:** 2026-05-05
- **Surface:** `/` public homepage.
- **Change:** Reframed the homepage around "Agent doctor for web apps" and refreshed the existing-codebase branch to describe the private local doctor pass, Top 9 findings, approved sync preview, first-loop approval, proof or blocked proof, and next recommendation. The branch no longer claims automatic GitHub connection, PR creation, CI reruns, raw-source sharing, or Codex app-server execution as the default existing-codebase path.
- **Design direction:** Keep the Figma-derived two-option leverage hero and existing layout, but align the commercial copy with shipped proof: generated-codebase checkout for idea buyers, protected `/workspace/setup` doctor-pass onboarding for existing-codebase buyers, and managed GitHub as explicit concierge consent only.
- **Out of scope:** No checkout behavior change, no new entitlement, no GitHub App setup, no provider token storage, no branch push or pull request automation, and no external setup requirement.
- **Verification:** Focused homepage content, render-model, primary CTA, and product-preview integration-ui tests should assert the new language and preserved checkout intent.

## Shipped Note: Workspace Execution Surfaces Privacy Panel

- **Date:** 2026-05-05
- **Surface:** `/workspace/privacy`.
- **Change:** Added an execution-surfaces panel that summarizes `local_runner`, `codex_cloud_handoff`, `managed_github`, `generated_repo`, and `codex_app_server` as separate consent, storage, command, provider, PR, proof, sync, and failure boundaries.
- **Design direction:** Keep the page operational and sparse, using the existing neutral workspace panel treatment. The panel explains authority boundaries without adding setup buttons, GitHub actions, source viewers, or hosted-execution controls.
- **Out of scope:** No GitHub App setup, no provider token storage, no branch push, no pull request creation, no CI rerun, no raw-source sharing, no Codex app-server expansion, and no new external setup requirement.
- **Verification:** Focused privacy read-model and integration-ui coverage should assert all five surfaces render and forbidden execution claims remain absent.

## Shipped Note: Workspace Workflow Packet Contract Panel

- **Date:** 2026-05-05
- **Surface:** `/workspace/loops`.
- **Change:** Added a workflow-packet contract panel that explains the shared loop contract: evidence and probes, customer bottleneck context, explicit execution surface, optional Codex interpretation, scoped write authority, proof delivery, structured sync, and revocation/stop behavior.
- **Design direction:** Keep loops as a catalog and decision-support surface, not a runnable queue. The contract panel should clarify how approved findings become scoped packets without adding run buttons, hosted execution, provider setup, PR controls, or source-sharing UI.
- **Out of scope:** No new workflow id, no executor change, no package install, no provider setup, no branch push, no pull request creation, no CI rerun, no raw-source or raw-log sharing, and no external setup requirement.
- **Verification:** Focused loops read-model and integration-ui coverage should assert the contract rows render and forbidden execution claims remain absent.

## Shipped Note: Mature Repo Adoption Workflow

- **Date:** 2026-05-05
- **Surface:** `/workspace/findings/[findingId]`, `/workspace/loops`, local runner workflow output.
- **Change:** Added `mature-repo-adoption` as a local-runner workflow lane. Approved findings can now show a mature adoption packet command, and the runner writes sync-safe `.sbs` adoption audit, adoption Program draft, first ExecPlan draft, proof, and sync-preview artifacts.
- **Design direction:** Keep mature adoption as a reviewable artifact overlay, not a generated-starter rewrite. UI copy should make the workflow feel conservative: preserve repo conventions, name blocked proof, and require later packets for any source, provider, PR, CI, or package changes.
- **Out of scope:** No root docs mutation, no runtime source edit, no package install, no migration, no provider setup, no branch push, no pull request creation, no CI rerun, no raw-source or raw-log sharing, and no external setup requirement.
- **Verification:** Focused finding, loops, Convex workflow, CLI, and local-runner workflow tests should prove the mature adoption lane writes only `.sbs` artifacts and preserves forbidden execution boundaries.

## Shipped Note: Figma Programs Section On The Public Homepage

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** Added the Figma-sourced `PROGRAMS.md` explainer section above Common Questions. The section introduces Programs as the initiative-level pipeline that turns a messy initiative into research passes, a normalize pass, converged decisions, a dependency graph, an ExecPlan split recommendation, a planning brief, the ExecPlan loop, and validated shipping slices.
- **Design direction:** Match the supplied black editorial Figma frame with Instrument Serif display type, compact Inter annotations, document-grid art, and a right-side pipeline diagram while adapting the layout for mobile readability.
- **Out of scope:** No checkout behavior change, no new external setup, and no structured-data expansion because the section is explanatory marketing content rather than FAQ or product-offer schema.
- **Verification:** Figma context and screenshot were fetched from node `5:220`; focused homepage unit and integration-ui tests, lint, format check, and typecheck/build should pass before release.

## Shipped Note: Figma PLANS.md Section On The Public Homepage

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** Added the Figma-sourced `PLANS.md` explainer section above pricing. The section introduces PLANS.md as the persistent execution artifact that turns vague requests into scoped, testable, loopable software work. The section supports both light and dark app themes.
- **Design direction:** Match the supplied black editorial Figma frame with the left title lockup, central instruction-document illustration, right-side callouts, lower differentiator list, and loop diagram while adapting the section into a readable stacked mobile layout. The loop diagram uses a character-to-write handoff line, a primary execution loop, and a muted return path instead of generic circular arrows.
- **Out of scope:** No checkout behavior change, no new external setup, and no structured-data expansion because the section is explanatory marketing content rather than FAQ or product-offer schema.
- **Verification:** Figma context and screenshot were fetched from node `5:138`; focused homepage unit and integration-ui tests, lint, format check, typecheck, and desktop/mobile browser proof should pass before release.
