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
- **Blueprint-first status:** {{what blueprint, funnel, or homepage invariants were preserved}}

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

## Shipped Note: Blueprint Intake Section Draft Assist

- **Date:** 2026-05-01
- **Surface:** `/blueprint` app workspace
- **Change:** Foundation, Problem, Outcome, Pricing, and Setup now expose a compact `Draft with AI` action at the section header. The action uses the existing Codex connection flow to turn rough notes in the current intake into editable first-draft field values.
- **Design direction:** Keep the workspace operational and sparse. The assistant is a quiet outline action beside each draftable section, not a separate card or promotional panel.
- **Out of scope:** Design and Generated Preview remain excluded because Design has curated visual controls and Generated Preview is compiler-owned.
- **Verification:** Focused unit, integration, integration-ui, format, lint, and typecheck/build checks were run for the touched blueprint/Codex slice.

## Shipped Note: Real Blueprint Demo On The Public Homepage

- **Date:** 2026-05-02
- **Surface:** `/` public homepage and `/blueprint` workspace.
- **Change:** The first-screen `productPreview` section now previews the real Blueprint intake. All 7 canonical sections render in canonical order. Foundation, Design, and Pricing are interactive. Problem, Outcome, Setup, and Generated preview are visible-but-locked rows. The "Generate my codebase" CTA persists the demo draft to a versioned `localStorage` envelope (`sbs:home-blueprint-draft:v1`) before starting Stripe checkout. After checkout, a workspace-mounted seeder hydrates those fields into Convex on the first authenticated `/blueprint` load when the buyer has no saved facts, then clears the local draft.
- **Design direction:** Keep the demo honest by showing the full canonical section sequence even though only three sections are interactive on the public route. Reuse field labels and helpers from `@shipbysunday/blueprint-presentation` and design presets from `@shipbysunday/blueprint-compiler` so the demo cannot drift from the real workspace.
- **Out of scope:** No homepage interactivity for Problem, Outcome, Setup, or Generated preview. No pre-auth Convex draft session. No free-form `theme_preset` editing on the public route. No Convex schema changes.
- **Verification:** Focused unit and integration-ui packs for homepage content, render model, structured data, draft storage, demo behavior, primary CTA, checkout button, and post-checkout seeder. Repo-level `bun run --cwd apps/web lint`, `format:check`, `bun typecheck`, `bun lint`, `bun run format`, and `bun run --cwd apps/web build`. Manual browser proof at desktop and mobile viewports at `/?marketing=1`.

## Shipped Note: Figma Leverage Hero On The Public Homepage

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** Removed the old first-screen Blueprint explainer copy ("Spec your product, then generate the codebase.", the paying-buyer Blueprint paragraph, and the checkout unlock note) and replaced that space with the Figma-sourced "Install leverage" hero and two-option starting-point selector.
- **Design direction:** Match the Figma selection's black editorial composition, Instrument Serif display headline, Inter subline, and grey/white selector while keeping the real Blueprint demo and checkout persistence below it.
- **Out of scope:** No new checkout target, no change to the 7-section Blueprint demo contract, and no external provider setup.
- **Verification:** Focused homepage content/render-model tests and integration-ui coverage should assert the new hero copy and preserved canonical demo sections, with desktop and mobile browser proof against the Figma screenshot before release.

## Shipped Note: Project Typography Contract

- **Date:** 2026-05-03
- **Surface:** Global app, public homepage, docs shell, blog, and workspace H1 surfaces.
- **Change:** Centralized font loading through the app font module. Inter now owns UI text at a 14px default, Berkeley Mono owns code and numeric UI at a 12px code default, Instrument Serif owns H1 headings with `-0.04em` spacing, and Bebas Neue is constrained to the `SHIP BY SUNDAY` wordmark/logo role.
- **Design direction:** Preserve the restrained operating-system feel while making the typography roles explicit and repeatable across marketing, docs, and app surfaces.
- **Out of scope:** No generated customer starter font contract changes beyond the active app presentation layer.
- **Verification:** Run focused app checks, broad repo gates, and desktop/mobile browser proof for the global typography pass before release.

## Shipped Note: Homepage Starting-Point Branches

- **Date:** 2026-05-03
- **Surface:** `/` public homepage.
- **Change:** The first-screen starting-point selector now controls the below-fold homepage branch. `I have an idea for a product` keeps the real Blueprint demo and the existing homepage story through the section before founder social proof. `I have a codebase already` swaps that branch for the Figma-sourced codebase audit path with Shippie imagery and audit checklist copy.
- **Design direction:** Preserve the black editorial Figma composition while making the selector a real information-architecture control instead of a cosmetic pressed state.
- **Out of scope:** No checkout behavior change, no social-proof/pricing/footer branch split, and no external provider setup.
- **Verification:** Focused homepage content, render-model, and integration-ui tests should cover both branches; desktop and mobile browser proof should confirm the Figma-derived branch remains readable and preserves the `#system` anchor.
