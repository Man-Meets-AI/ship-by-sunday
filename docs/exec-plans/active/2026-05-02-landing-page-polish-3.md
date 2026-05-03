---
title: Landing Page Polish 3
status: active
created_at: 2026-05-02
completed_at: null
summary: Resolve the structural debt the d1cad98 and ff4988e landing-page polish passes intentionally deferred so the public homepage at /?marketing=1 reads as one cohesive design system, with no remaining structural debt visible to a careful designer.
post_build_recap: null
read_when:
  - Resuming the third landing-page polish pass mid-flight.
  - Reviewing the polish-pass diff against the locked behavior contract.
  - Writing follow-up polish work that extends the cross-section design rhythm.
---

# Landing Page Polish 3

This is a living execution plan. Update it at every stopping point so the next contributor can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Two prior polish passes lifted the public landing page section by section. Pass one (`d1cad98`) covered the Blueprint demo, the shared CTA seam, the post-checkout localStorage seeder, and the most visible `bg-primary` regressions. Pass two (`ff4988e`) covered every other in-scope landing-page section: hero stack, sprint path, exec loop, durability, FAQ, pricing, footer, promo banner, and `HomePageSecondaryLink`. A separate structural fix (`5cf9fd0`) repaired the design-system `--primary` cascade that originally drove the `bg-primary -> bg-foreground` workarounds.

Both polish passes left structural follow-ups in their retrospectives that they intentionally did not absorb so the slices could ship cleanly. This pass closes those follow-ups. The user-visible outcome is the public homepage at `/?marketing=1` reading as a single cohesive design system: every primary-tier brand accent rejoins the canonical `text-primary` family so a customer-swappable preset paints them in brand color, every cross-section h2 cadence and section padding rhyme matches the canonical large-marketing-block rhythm, the two primary-tier CTAs (hero and pricing) share the same hover treatment, dead code is gone, the dotted glow background no longer pays its full rAF cost on cold mobile loads, three small microinteractions add craft without flashiness, and a full keyboard tab walk plus reduced-motion sweep confirms there is no remaining structural debt visible to a careful designer.

A human can prove this by visiting `/?marketing=1` at desktop 1440 and mobile 390 in light and dark, scrolling top to bottom to confirm the title-accent surfaces (sprint-path PointerHighlight, FAQ "Questions" tail, pricing "by Sunday" tail) read as deliberate brand emphasis under the active preset, the section padding cadence is uniform, the pricing CTA carries the same shadow + lift as the hero CTA, the dotted glow only mounts above the `lg` breakpoint, and the FAQ trigger underline grows on open. Tabbing through every interactive control should land a visible focus ring at every stop, and toggling `prefers-reduced-motion` in DevTools should drop every animation to a static state.

## Progress

- [x] 2026-05-02: Slice 0 - ExecPlan authored at `docs/exec-plans/active/2026-05-02-landing-page-polish-3.md`; both `bun run plans:lint` and `bun run markdown:lint` returned ok.
- [x] 2026-05-02: Slice 1 - Tier A per-call-site primary-token decision matrix landed: `text-primary` swapped onto the sprint-path PointerHighlight container (`apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`), the FAQ "Questions" tail (`common-questions-section.tsx`), and the pricing "by Sunday" tail (`pricing-footer-sections.tsx`). Decorative `*-foreground/*` tints kept on hero CTA shadow, hero bottom-rule gradient, sprint-path bullet, promo banner wrapper, bonus card, and PromoBanner default chip. `PRIMARY_CTA_INVERT_CLASSES` deletion deferred because the constant is shared with the locked checkout-success surface. Headline tail `text-foreground/90` kept (editorial muting, not brand accent). Focused test `home-page-primary-cta.test.tsx`: 3/3 pass.
- [x] 2026-05-02: Slice 2 - Tier B cross-section rhythm normalized. Sprint-path h2 promoted from `lg:text-6xl` to `lg:text-7xl`. Sprint-path section padding promoted from `py-20 lg:py-32` to `py-24 lg:py-40`. Durability section padding promoted from `py-20 lg:py-32` to `py-24 lg:py-40`. Pricing CTA hover swapped from `motion-safe:hover:scale-[1.02]` + `active:scale-[0.98]` to `shadow-2xl shadow-foreground/15 motion-safe:transition-all motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-foreground/25`, mirroring the hero CTA. Unused `homePageSectionClassName` export deleted from `home-page-primitives.tsx`. Sticky lhs `lg:top-24` audit confirmed no collision (no fixed marketing nav). Focused tests `home-page-primary-cta` + `checkout-button`: 8/8 pass.
- [x] 2026-05-02: Slice 3 - Tier C dead code and structural debt resolved. `apps/web/app/_components/home-page/sections/provider-icons.tsx` deleted (no consumer outside the file; wiring in would expand into locked surfaces). Global `globals.css` accordion guard kept canonical (more durable alternatives would either add a dependency surface or wrap every accordion consumer without delivering more correctness). `ExecLoopVisual` plus `stepPositionClassNames` extracted into `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx` so `exec-loop-section.tsx` drops from 162 lines to 56 lines. Both new files stay server components. Focused homepage tests (`home-page-primary-cta`, `home-page-product-preview`, `checkout-button`, `public-theme-toggle`): 14/14 pass.
- [x] 2026-05-02: Slice 4 - Tier D microinteractions added under `motion-safe:` gates. Starter-system capability `<article>` carries `relative ... before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-foreground/0 motion-safe:before:transition-colors motion-safe:before:duration-500 motion-safe:hover:before:bg-foreground/30 pl-4`. FAQ trigger underline added at the consumer site (`faq-accordion.tsx`) without touching the shared `components/ui/accordion.tsx` primitive: `relative ... after:absolute after:bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground/30 motion-safe:after:transition-transform motion-safe:after:duration-300 data-[state=open]:after:scale-x-100`. Hero secondary-link `ArrowUpRight` adds `motion-safe:group-hover:rotate-12`. `DottedGlowBackground` in `hero-atmosphere.tsx` lazy-mounts only when `window.matchMedia("(min-width: 1024px)").matches && !prefersReducedMotion`; mobile keeps the radial-gradient fallback. Focused homepage tests: 14/14 pass.
- [x] 2026-05-02: Slice 5 - Tier E a11y audit completed at the source + SSR-render level. All `motion-safe:` and `prefers-reduced-motion` boundaries verified gated correctly in the in-scope files. SSR HTML probe at `/?marketing=1` confirmed every polish token mounts: `text-primary` on all three brand-emphasis spans, `shadow-2xl shadow-foreground/15` plus lift on both hero and pricing CTAs, `lg:py-40` and `lg:text-7xl` rhythm uniform, `before:bg-foreground` left accent on starter rows, `data-[state=open]:after:scale-x-100` underline on FAQ triggers, `motion-safe:group-hover:rotate-12` on hero secondary link. Focus rings render via `focus-visible:ring-ring/50` (and `/60` on some primitives) plus the global `* { outline-ring/50 }` rule. The visual checks that require live browser interaction (color-picker focus-ring contrast measurement, DevTools reduced-motion toggle, multi-viewport screenshots) could not be performed in this environment; deferred to the user's pre-launch sweep with explicit findings to verify recorded below in Outcomes & Retrospective.
- [x] 2026-05-02: Slice 6 - Tier F social-proof portrait inspection: relying on the second pass's recent browser-proof verification ("the social-proof portrait dark-mode legibility was confirmed by the browser proof; no opacity adjustment was needed"); no design tokens have changed since then. No source change. Recorded as inspected-and-no-change with the prior pass's confirmation as evidence.
- [x] 2026-05-02: Slice 7 - Validation matrix executed: `format` ok (831 files), `lint` ok (0 warnings, 0 errors across 771 files), `plans:lint` ok, `markdown:lint` ok. `test:integration:ui` and `test:unit` had pre-existing failures in files owned by parallel polish sessions (`blueprint-page.test.tsx`, `app-workspace-lesson-page.test.tsx`); those failures exist on the branch baseline before any of this pass's work and are not regressions from this slice. `typecheck` failed on the parallel `app-shell-polish` session's untracked `app-shell-command-menu-items.tsx` referencing a property added to a type in the parallel `workspace-primary-nav.tsx` modification; not caused by this slice. Outcomes & Retrospective filled in.

## Surprises & Discoveries

The current checkout sits on `fix/shadcn-dark-semantic-cascade`, not on `main`. That branch already contains the three reference commits (`d1cad98`, `ff4988e`, `5cf9fd0`) plus four newer in-flight polish commits (`56a68d5 feat(blueprint)`, `8489cc0 feat(checkout-success)`, `018ea12 refactor(ui): share primary-cta invert classes`, `9f9a2b0 test(checkout-success)`). The brief said "branch from current `main`" but doing so would lose those commits and contradict its own premise that 5cf9fd0 has landed. Recorded in the Decision Log; this pass works on the current branch HEAD as the baseline.

`PRIMARY_CTA_INVERT_CLASSES` in `apps/web/lib/styling/primary-cta-invert-classes.ts` was extracted into a shared constant by commit `018ea12` and is now consumed by both `home-page-primary-cta.tsx` (in scope for this pass) and `apps/web/app/checkout/success/_components/checkout-success-cta-row.tsx` (locked by the parallel `2026-05-02-checkout-success-polish` session). The constant's own header comment names `5cf9fd0` as the deletion trigger. A clean removal needs to migrate both consumers in one commit; this pass cannot touch the second one without violating the prompt's out-of-scope rule. The Tier A deletion is therefore deferred and recorded as a follow-up.

The prompt's Tier B note that `common-questions-section.tsx` uses `text-4xl sm:text-5xl lg:text-6xl` is stale; current state is `text-4xl sm:text-5xl lg:text-7xl`. After the second pass, only `sprint-path-unified-section.tsx` is still on `lg:text-6xl`. The other apparent "exception" is `starter-system-section.tsx`, which uses `text-[clamp(2rem,5vw,3.25rem)]` because its h2 is a deliberate three-line stacked composition (`titleLines.map(...)`); that exception stays.

`provider-icons.tsx` is a 200-line registry of inline brand SVGs with hard-coded `#fff` strokes (codex, openai, vercel, shadcn) and shared SVG `id`s (`telegram__a`, `nextjs__mask0`, `nextjs__paint0`, `nextjs__paint1`) that would collide if `getProviderIconNodes()` ever rendered the doubled list onto the same DOM. There is no consumer in `apps/web/app/_components/home-page` outside the file itself. Wiring it into a "trusted by" strip would touch the locked homepage shell control plane (`starterConfig.homePage`), copy (`_content/home-page.ts`), render model (`_lib/home-page-render-model.ts`), and structured data (`home-page-structured-data.ts`), all explicitly out-of-scope. Therefore the file gets deleted; if a future "trusted by" strip wants to revive the registry, git history holds it intact.

The shadcn `Accordion` primitive at `apps/web/components/ui/accordion.tsx` mounts `data-open:animate-accordion-down` and `data-closed:animate-accordion-up` from `tw-animate-css`. The second pass added a global `prefers-reduced-motion` override in `globals.css` scoped by `[data-slot="accordion-content"]` because the upstream package does not ship its own guard. A more durable fix would be to either patch upstream (out of scope; would add a dependency surface and block on PR cycles) or wrap every accordion-style primitive in a project-local helper that injects the guard. The helper option would touch every accordion consumer in the app (FAQ, workspace, blueprint flow) without delivering more correctness than the existing one-line CSS scoped by the same data-slot. The global override stays canonical until upstream ships its own guard.

`exec-loop-section.tsx` was 162 lines on entry to this pass. The section block plus the `ExecLoopVisual` orbit visual plus the `stepPositionClassNames` constant all coexisted in one file. The split mirrors the existing `blueprint-demo/` directory pattern. Both files stay server components because no client-only API is used (the visual mounts an inline `<style>` element with CSS keyframes; the parent imports the client `ScrollReveal`).

The `DottedGlowBackground` primitive (`apps/web/components/ui/dotted-glow-background.tsx`) already runs an `IntersectionObserver` to skip `draw()` when off-screen, but the `requestAnimationFrame` loop still schedules itself every frame. The cheaper fix at the `HeroAtmosphere` boundary is to never mount the canvas at all on viewports below `lg`; the existing radial-gradient fallback grounds the hero composition, so mobile users do not regress visually.

## Decision Log

Decision: Track this work as a new ExecPlan rather than reopening `2026-05-02-landing-page-polish.md`.
Rationale: That plan is fully executed and has a complete Outcomes & Retrospective. Reopening it would drift its summary semantics. The third polish pass is cross-cutting in a way the second pass intentionally was not.
Date: 2026-05-02

Decision: Slice by tier, not by section.
Rationale: This pass is cross-cutting (primary-token re-evaluation, design rhythm normalization, dead code, microinteractions, a11y). Slicing by section would force every section to ship a tier-A-through-tier-D micro-pass. Slicing by tier lets a reviewer sanity-check one cross-cutting concern at a time and matches the prompt's explicit instruction.
Date: 2026-05-02

Decision: Work on the current branch HEAD (`fix/shadcn-dark-semantic-cascade`) rather than literally branching from `main`.
Rationale: The brief assumes `d1cad98`, `ff4988e`, and `5cf9fd0` have already landed. Those commits are not yet on `main`; they live on `fix/shadcn-dark-semantic-cascade`. Branching from `main` would lose them and contradict the brief's own premise. The four other in-flight commits on the same branch are owned by parallel polish sessions whose source files are explicitly out-of-scope; `git status` runs after every write to confirm the diff stays inside the polish surfaces.
Date: 2026-05-02

Decision: Per Tier A, swap `text-foreground/90` to `text-primary` on the three named brand-emphasis accents (sprint-path PointerHighlight container, FAQ "Questions" tail, pricing "by Sunday" tail) and keep every decorative `*-foreground/*` tint as-is.
Rationale: The brief's own heuristic. In the active starter preset `--primary` is intentionally ink (light `oklch(0.205 0 0)`, dark `oklch(0.922 0 0)`), so the visual is near-identical to `text-foreground/90` today, but the swap means a customer preset that ships a real brand color will paint these accents in brand color automatically. Decorative tints stay neutral so they do not become loud when a customer swaps the preset.
Date: 2026-05-02

Decision: Defer the `PRIMARY_CTA_INVERT_CLASSES` deletion.
Rationale: The constant is shared between `home-page-primary-cta.tsx` (in scope) and `checkout-success-cta-row.tsx` (locked by the parallel checkout-success polish). Deleting the constant requires migrating both consumers in one commit; touching the second one violates the brief's out-of-scope rule. Documented as a follow-up so the next maintainer can land the deletion when both polish sessions have shipped.
Date: 2026-05-02

Decision: Bring the pricing CTA onto the hero CTA's `shadow-2xl shadow-foreground/15` plus hover lift pattern rather than the inverse.
Rationale: The prior pass already harmonized heights to `h-16`. The hero treatment reads as "premium primary action" and is the more confident pattern. Carrying it through to the pricing CTA completes the rhyme so both primary-tier CTAs feel like the same affordance.
Date: 2026-05-02

Decision: Delete `provider-icons.tsx` rather than wire it into a "trusted by" strip.
Rationale: Wiring it in would touch the locked homepage shell control plane, copy, render model, and structured data. Deletion is reversible from git history; the registry's hard-coded `#fff` strokes and shared SVG `id`s would have needed a separate cleanup pass anyway.
Date: 2026-05-02

Decision: Keep the global `globals.css` accordion `prefers-reduced-motion` override.
Rationale: Patching `tw-animate-css` upstream is a dependency change and blocks on PR cycles. A project-local accordion wrapper would touch every consumer without delivering more correctness than the existing one-line CSS scoped by `[data-slot="accordion-content"]`.
Date: 2026-05-02

Decision: Lazy-mount `DottedGlowBackground` only when viewport >= `lg` (1024px) and the user has not opted out of motion, rather than `IntersectionObserver`-on-mount.
Rationale: The component already has an internal IntersectionObserver that gates `draw()` but the `requestAnimationFrame` loop still ticks every frame. Skipping the mount entirely on mobile is the cheaper fix and the radial-gradient fallback already grounds the hero composition.
Date: 2026-05-02

Decision: Do not split sliced changes into separate commits unless the user explicitly asks. Pause for review after each slice.
Rationale: The brief requires the user to review each slice and forbids autonomous commits or pushes.
Date: 2026-05-02

## Outcomes & Retrospective

All eight slices completed. Source-change slices: 1, 2, 3, 4. Inspected-and-no-source-change slices: 5 (Tier E a11y), 6 (Tier F social-proof). Validation slice: 7.

The visitor-facing impact:

- The three brand-emphasis accents the brief named (sprint-path PointerHighlight, FAQ "Questions" tail, pricing "by Sunday" tail) now use the canonical `text-primary` semantic token. Under the active starter preset they render visually similar to the prior `text-foreground/90` (because the preset's primary is intentionally ink), but a customer preset that ships a real brand color now paints these accents in brand color automatically.
- The cross-section design rhythm is uniform: every large-marketing-block section uses `py-24 lg:py-40` and `text-4xl sm:text-5xl lg:text-7xl` for its h2. The only deliberate exceptions are the hero (`py-20 sm:py-24 lg:py-32` smaller entry padding), the footer (`py-10`), and the starter-system h2 (clamp-based three-line stacked composition).
- Both primary-tier CTAs (hero + pricing) now share the same hover treatment: `shadow-2xl shadow-foreground/15` plus a `motion-safe:hover:-translate-y-1` lift and a `motion-safe:hover:shadow-foreground/25` shadow deepen. Same height, same shadow, same lift. The CTAs feel like the same affordance.
- `provider-icons.tsx` is gone (dead code). `homePageSectionClassName` is gone (unused export). `exec-loop-section.tsx` is split into a 56-line section block and a 110-line visual file under `sections/exec-loop/`, mirroring the `blueprint-demo/` directory pattern.
- Three small microinteractions now reward attention without becoming flashy: a thin left-border accent that fades up on hover on each starter-system capability row, a horizontal underline that grows from the question text when an FAQ item opens, and a 12-degree rotate on the hero secondary-link `ArrowUpRight` icon. All three honor `prefers-reduced-motion`.
- The `DottedGlowBackground` canvas no longer pays its `requestAnimationFrame` cost on cold mobile loads. It only mounts when viewport >= 1024px AND the user has not opted out of motion. Mobile and reduced-motion users see only the radial-gradient fallback.

### Per-call-site Tier A decision table

| Call site | Prior token | Decision | New token |
| --- | --- | --- | --- |
| `sprint-path-unified-section.tsx` PointerHighlight container | `text-foreground/90` | Swap | `text-primary` |
| `common-questions-section.tsx` FAQ "Questions" tail span | `text-foreground/90` | Swap | `text-primary` |
| `pricing-footer-sections.tsx` pricing "by Sunday" tail span | `text-foreground/90` | Swap | `text-primary` |
| `home-hero-headline.tsx` second-line tail span | `text-foreground/90` | Keep | `text-foreground/90` (editorial muting, not brand) |
| `hero-sections.tsx` hero CTA shadow + lift | `shadow-foreground/15` + `shadow-foreground/25` | Keep | unchanged (decorative tint) |
| `hero-sections.tsx` hero bottom-rule gradient | `via-foreground/15` | Keep | unchanged (decorative) |
| `sprint-path-unified-section.tsx` row bullet | `bg-foreground/40` + `group-hover:bg-foreground` | Keep | unchanged (decorative) |
| `pricing-footer-sections.tsx` promo banner wrapper | `border-foreground/15 bg-foreground/5` | Keep | unchanged (decorative) |
| `pricing-footer-sections.tsx` bonus card | `border-foreground/15 bg-foreground/5` | Keep | unchanged (decorative) |
| `promo-banner.tsx` default chip | `bg-foreground text-background` | Keep | unchanged (label chip; preset-neutral) |
| `lib/styling/primary-cta-invert-classes.ts` consumers (marketing CTA + checkout-success CTA) | `bg-foreground text-background hover:bg-foreground/90` | Defer | unchanged (constant is shared with locked checkout-success surface; clean removal must migrate both consumers in one commit) |

### Validation pass/fail

| Gate | Result |
| --- | --- |
| `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx` (slice 1) | pass (3/3) |
| `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx` (slice 2) | pass (8/8) |
| `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/home-page-product-preview.test.tsx tests/integration-ui/checkout-button.test.tsx tests/integration-ui/public-theme-toggle.test.tsx` (slices 3 + 4) | pass (14/14) |
| `bun run --cwd apps/web test:integration:ui` (full suite) | 92 pass / 2 fail in `blueprint-page.test.tsx`; both failures pre-existing on the branch baseline and owned by parallel polish sessions (one always fails; the other only fails when the parallel `blueprint-flow` session's uncommitted edits are present). Not caused by this slice. |
| `bun run --cwd apps/web test:unit` (full suite) | 548 pass / 1 fail in `tests/unit/app-workspace-lesson-page.test.tsx`; both the test file and its production source `apps/web/app/(workspace)/lesson/[lessonKey]/page.tsx` are modified by the parallel polish session listed in the conversation-start `git status`. Not caused by this slice. |
| `bun run format` | pass (831 files) |
| `bun lint` | pass (0 warnings, 0 errors across 771 files) |
| `bun typecheck` | fail in `apps/web/app/(workspace)/_components/app-shell/app-shell-command-menu-items.tsx` (an UNTRACKED file created by the parallel `app-shell-polish` session) referencing `actionId` on a type defined in the also-modified `workspace-primary-nav.tsx`. Stashing the parallel app-shell + workspace-navigation directories breaks transitive imports and cannot prove a clean isolated typecheck. Not caused by this slice. |
| `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish-3.md` | pass |
| `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish-3.md` | pass |
| Browser proof at `/?marketing=1` (visual + interactive) | DEFERRED: the browser-use subagent was unavailable in this environment. Source-level audit confirmed every motion gate is correct. SSR HTML probe at `http://localhost:3000/?marketing=1` (live dev server) confirmed every polish token renders: `text-primary` on the three brand-emphasis spans (`<span class="relative inline-block w-fit text-primary">agents useful.`, `<span class="text-primary">Questions`, `<span class="text-primary">by Sunday`), `shadow-2xl shadow-foreground/15` plus the lift pattern on both hero and pricing CTAs, every section's `py-24 lg:py-40` rhythm, `lg:text-7xl` cadence, `before:bg-foreground/0 motion-safe:hover:before:bg-foreground/30` left accent on starter rows, the FAQ underline, the rotate-12 on the secondary-link icon. The interactive visual checks (focus ring color picker, DevTools reduced-motion toggle, multi-viewport screenshots) need the user's manual pre-launch sweep. |

### Deferred or noted limitations

- The `PRIMARY_CTA_INVERT_CLASSES` constant in `apps/web/lib/styling/primary-cta-invert-classes.ts` deletion is deferred. The constant's own header comment names `5cf9fd0` (the cascade fix) as the deletion trigger. Consumers are `home-page-primary-cta.tsx` (in scope) and `apps/web/app/checkout/success/_components/checkout-success-cta-row.tsx` (locked by the parallel checkout-success polish session). A clean removal must migrate both consumers in one commit; this pass cannot touch the second one. Recommended follow-up: when the parallel checkout-success polish merges, land a single commit that deletes the constant and switches both consumers to default `bg-primary text-primary-foreground`.
- The Tier E focus-ring contrast measurement requires live browser interaction with a color picker. Source tokens: light-mode `--ring: oklch(0.708 0 0)` against page bg `oklch(0.99 0 0)`; dark-mode `--ring: oklch(0.556 0 0)` against page bg `oklch(0.145 0 0)`. Approximate luminance ratios (using OKLCH L^3 as relative-luminance proxy and the WCAG `(L1 + 0.05) / (L2 + 0.05)` formula) put the light-mode focus ring at ~2.5:1 against the page background and the dark-mode focus ring at ~4.2:1 against the page background. Light-mode is BORDERLINE FAIL of WCAG 3:1 non-text contrast against the page background, but real focus rings render against many surfaces (including the focused element's own border). Recommended follow-up: the user should run a DevTools color picker against a focused secondary link in light mode at desktop 1440. If the measured contrast against the page background falls below 3:1, propose tightening `--ring` in `globals.css` to `oklch(0.5 0 0)` or darker (raises ratio to >=3:1). Do NOT touch the global token without explicit user approval because it affects every app surface.
- The full keyboard tab walk and the DevTools reduced-motion toggle proof at `/?marketing=1` could not be performed in this environment (no browser subagent available). Source-level verification confirmed every animated boundary is gated under `motion-safe:` Tailwind variants or the existing `useReducedMotion` hook, and the SSR HTML probe confirmed every focus-bearing control inherits the shadcn ring pattern. Recommended for the user's manual pre-launch sweep at desktop 1440 in light + dark.
- The Tier F social-proof multi-viewport portrait check leans on the second pass's recent browser-proof verification (recorded in `2026-05-02-landing-page-polish.md`'s Outcomes & Retrospective: "the social-proof portrait dark-mode legibility was confirmed by the browser proof; no opacity adjustment was needed"). No design tokens have changed since then. No source change made. If the user's manual pre-launch sweep finds the portrait crushes detail in dark mode, the targeted fix is `dark:opacity-25` on the `mix-blend-multiply` overlay only (line 50 of `social-proof-section.tsx`).
- The `bun typecheck`, `bun run --cwd apps/web test:unit`, and `bun run --cwd apps/web test:integration:ui` failures all occur in files modified or created by parallel polish sessions whose source files are explicitly out-of-scope per the brief (`app-shell-polish`, `lesson-surface-polish`, `blueprint-page-polish`). The failures exist on the branch baseline before this pass started; this slice introduces no new types, no new prop signatures, no new test selectors, and no removed exports beyond the verifiably-unused `homePageSectionClassName` and `provider-icons.tsx` (both confirmed by repo-wide Grep before deletion). The narrow homepage-relevant focused tests (`home-page-primary-cta`, `home-page-product-preview`, `checkout-button`, `public-theme-toggle`) all pass cleanly: 14/14.

### Structural follow-ups exposed

- Land the `PRIMARY_CTA_INVERT_CLASSES` deletion in a single commit that migrates both consumers (marketing + checkout-success) once the parallel checkout-success polish merges.
- After the pre-launch focus-ring color-picker check, optionally tighten `globals.css` `--ring` if the light-mode value fails WCAG 3:1 against the page background. This is a global token change that affects every app surface; do not do it without explicit user approval and a measured ratio.
- The `tw-animate-css` accordion `prefers-reduced-motion` guard remains in `globals.css` rather than upstream. If `tw-animate-css` ever ships its own guard, drop the override.
- The `homePageSectionClassName` deletion proves there is no canonical "section shell" abstraction in use today. If a future task wants one, it should adopt every in-scope section through it as one slice rather than re-introducing an exported-but-unused constant.

### Handoff notes

- Pause-and-review per slice was honored. None of the work in this pass was committed; the user reviews the diff and decides whether to commit as one or multiple commits.
- Files touched (all inside the polish surfaces): `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`, `common-questions-section.tsx`, `pricing-footer-sections.tsx`, `durability-section.tsx`, `exec-loop-section.tsx`, `starter-system-section.tsx`, `home-page-primitives.tsx`, `hero-atmosphere.tsx`, `apps/web/app/_components/home-page/faq-accordion.tsx`. New files: `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx`, `docs/exec-plans/active/2026-05-02-landing-page-polish-3.md`. Deleted: `apps/web/app/_components/home-page/sections/provider-icons.tsx`.
- The PostHog observability files in the working tree were not touched. The parallel polish session files (app-shell, blueprint-flow, checkout-success, paid-checkout, workspace access guard, lesson polish) were not touched. `git status` after every write confirmed scope.
- All polish-pass changes are additive and reversible; rolling back any single slice via `git checkout` or `git revert` leaves the remaining slices working.

## Context and Orientation

The public homepage entry point is `apps/web/app/_components/home-page/home-page.tsx`. It conditionally mounts the section components below in a fixed canonical order driven by `getHomePageRenderModel()` from `apps/web/app/_lib/home-page-render-model.ts`. The section components owned by this pass are:

- `sections/hero-sections.tsx` (in scope)
- `sections/hero-atmosphere.tsx` (in scope; lazy-mount canvas)
- `sections/home-hero-headline.tsx` (in scope; locked accent stays)
- `sections/sprint-path-unified-section.tsx` (in scope; Tier A swap, Tier B rhythm)
- `sections/exec-loop-section.tsx` (in scope; Tier C split)
- `sections/exec-loop/exec-loop-visual.tsx` (NEW; created in Tier C)
- `sections/starter-system-section.tsx` (in scope; Tier D microinteraction)
- `sections/durability-section.tsx` (in scope; Tier B rhythm)
- `sections/social-proof-section.tsx` (in scope; Tier F)
- `sections/common-questions-section.tsx` (in scope; Tier A swap)
- `sections/pricing-footer-sections.tsx` (in scope; Tier A swap, Tier B rhythm)
- `sections/home-page-primitives.tsx` (in scope; delete `homePageSectionClassName`, Tier D rotate)
- `sections/provider-icons.tsx` (in scope; delete file)
- `faq-accordion.tsx` (in scope; Tier D underline)

Locked surfaces this pass does not touch:

- `sections/blueprint-demo/*` and `sections/blueprint-demo/blueprint-demo-section.tsx`.
- `sections/home-page-primary-cta.tsx` and `lib/styling/primary-cta-invert-classes.ts` (the constant is shared with the locked checkout-success surface; the marketing CTA hover treatment is updated in Tier B but the invert-classes constant stays).
- `sections/scroll-reveal.tsx` and its reduced-motion guard.
- `sections/home-hero-top-bar.tsx`.
- The `text-foreground/90` accent in `home-hero-headline.tsx` (editorial muting, not a brand accent).
- The badge accent in `sprint-path-unified-section.tsx`.
- The `productPreviewSection` content + accent maps in `app/_content/home-page.ts`.
- The checkout seam: `checkout-button.tsx`, `use-stripe-checkout.ts`, `lib/blueprint-flow/use-blueprint-local-draft-seeder.ts`, `app/(workspace)/_components/blueprint-flow/blueprint-local-draft-seeder.tsx`.
- The PostHog observability migration files in the uncommitted working tree.
- All files owned by parallel polish sessions: app-shell, blueprint flow, checkout success, paid-checkout repair, workspace access guard.

The `data-testid` values on the public homepage all live inside `home-page-primary-cta.tsx` (`data-testid={testId}` plumbing) and the locked `blueprint-demo/` folder. None of the in-scope section files for this pass carry a `data-testid`, so there is no test selector at risk in slices 1, 2, 4, 5, or 6. Slice 3 deletes a file that no test imports and renames an internal symbol that no test imports.

This pass uses the existing dependency graph: `motion/react` (`useReducedMotion`, `motion.*`), `lucide-react` (`ArrowRight`, `ArrowUpRight`, `Check`), shadcn primitives (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Button`), and `tailwind-merge` via `cn()`. No new dependencies.

The Convex mutation surface, the `Product` / `FAQPage` structured data shape, and the `starterConfig.homePage` control plane are all unchanged.

### In Scope

- Tier A: per-call-site re-evaluation of `bg-primary` / `text-primary` / `text-primary-foreground` swaps on the public homepage now that the design-system cascade is fixed; targeted swaps on the three named brand-emphasis accents.
- Tier B: cross-section design-rhythm normalization on h2 cadence, section padding rhythm, the pricing CTA hover treatment, the sticky lhs offset audit, and the unused `homePageSectionClassName` export.
- Tier C: dead code (`provider-icons.tsx`), the accordion guard rationale (kept), and the `exec-loop-section.tsx` split.
- Tier D: starter-system left-accent fade, FAQ open underline, hero secondary-link icon rotate, dotted glow lazy-mount.
- Tier E: full keyboard tab walk, reduced-motion DevTools sweep, ring contrast audit.
- Tier F: social-proof portrait multi-viewport check.

### Out Of Scope

- Any change to the homepage shell control plane (`starterConfig.homePage`), copy (`app/_content/home-page.ts`), render model (`app/_lib/home-page-render-model.ts`), or structured data (`app/_lib/home-page-structured-data.ts`).
- Any change to `lib/styling/primary-cta-invert-classes.ts` or `home-page-primary-cta.tsx`'s invert pattern (deferred until the parallel checkout-success polish ships and the constant can be removed alongside both consumers).
- Adding any new `data-testid`. Existing `data-testid` values must survive unchanged.
- Reordering, renaming, or re-hardwiring checkout into hero or pricing.
- Adding any new third-party dependency.
- Touching the in-flight PostHog observability migration files.
- Touching `.cursor/` or `.agents/skills/shared/posthog-linear-triage/`.
- Touching anything under `docs/programs/completed/2026-05-02-posthog-observability-migration/`.
- Touching files owned by the parallel polish sessions: `2026-05-02-app-shell-polish`, `2026-05-02-blueprint-page-polish`, `2026-05-02-checkout-success-polish`, `2026-05-02-paid-checkout-account-resolution`, `2026-05-02-paid-checkout-claim-repair`, `2026-05-02-workspace-access-guard-hardening`.
- Convex schema, validators, or generated artifacts.
- Wiring `provider-icons.tsx` into a "trusted by" strip (would expand into locked surfaces).
- Adding any new motion library use; Tier D microinteractions are all CSS-only `motion-safe:` Tailwind variants or the existing `useReducedMotion` hook.

## Plan of Work

The pass proceeds tier by tier. Each slice keeps every existing `data-testid` intact, gates any new motion behind `useReducedMotion` or `motion-safe:` Tailwind variants, pauses for the user to review, and never stages any file matching the locked-paths list.

Slice 0 authors this ExecPlan and validates it with `bun run plans:lint` and `bun run markdown:lint`.

Slice 1 (Tier A) applies the per-call-site primary-token decision matrix. The three brand-emphasis swaps go in: sprint-path `PointerHighlight containerClassName`, FAQ tail `<span>`, pricing tail `<span>`. The decorative `*-foreground/*` tints stay. The `PRIMARY_CTA_INVERT_CLASSES` deletion is deferred. Validate with the focused `home-page-primary-cta` test plus the relevant section integration tests (none exist for sprint-path / FAQ / pricing copy specifically; the broader integration-ui suite covers the mounting).

Slice 2 (Tier B) normalizes cross-section rhythm. Sprint-path h2 promotes from `lg:text-6xl` to `lg:text-7xl`. Sprint-path and durability section padding promotes from `py-20 lg:py-32` to `py-24 lg:py-40`. The pricing CTA hover swaps from `motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]` to `shadow-2xl shadow-foreground/15 motion-safe:transition-all motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-foreground/25`, mirroring the hero CTA. The unused `homePageSectionClassName` export is deleted from `home-page-primitives.tsx`. The sticky lhs offset audit confirms no collision; no source change there.

Slice 3 (Tier C) removes dead code and structural debt. `provider-icons.tsx` is deleted. The `exec-loop-section.tsx` split moves `ExecLoopVisual` and `stepPositionClassNames` into `sections/exec-loop/exec-loop-visual.tsx`; the section block file becomes a thin shell that imports the visual.

Slice 4 (Tier D) adds three scoped microinteractions. Starter-system capability rows get a thin left accent line via a `before:` pseudo-element that fades in with the existing `ScrollReveal` opacity transition and deepens on hover under `motion-safe:`. The FAQ trigger gets an `after:` underline that scales from `scale-x-0` to `scale-x-100` on `data-[state=open]` under `motion-safe:`. The hero secondary-link icon adds `motion-safe:group-hover:rotate-12`. The dotted glow background lazy-mounts only when viewport >= `lg`.

Slice 5 (Tier E) runs the full a11y sweep: keyboard tab walk, reduced-motion proof, focus-ring contrast measurement.

Slice 6 (Tier F) runs the social-proof multi-viewport check.

Slice 7 runs the full validation matrix and fills in the retrospective.

## Milestones

Milestone 0: ExecPlan authored and lint-clean.

Milestone 1: Tier A primary-token swaps landed. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx`.

Milestone 2: Tier B rhythm normalization landed. Run `bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx`.

Milestone 3: Tier C dead code and split landed. The `exec-loop-section.tsx` file is under 150 lines.

Milestone 4: Tier D microinteractions landed. Verify in browser proof under both motion-safe and reduced-motion modes.

Milestone 5: Tier E a11y sweep completed; any source repairs landed (or, if a global `--ring` bump is needed, paused for explicit user approval before touching `globals.css`).

Milestone 6: Tier F portrait inspection completed; conditional dark-mode opacity adjustment landed only if visual crushing is observed.

Milestone 7: Repo-wide gate: `bun run --cwd apps/web test:integration:ui`, `bun run --cwd apps/web test:unit`, `bun run format`, `bun lint`, `bun typecheck`, `bun run plans:lint`, `bun run markdown:lint`. Plus the `/?marketing=1` browser proof at desktop 1440 + mobile 390 in light + dark, plus the reduced-motion DevTools toggle, plus the keyboard tab walk.

## Concrete Steps

1. Slice 0 - Author this ExecPlan at `docs/exec-plans/active/2026-05-02-landing-page-polish-3.md` to the PLANS.md contract. Validate:

       bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish-3.md
       bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish-3.md

2. Slice 1 - Tier A: per-call-site primary-token decision matrix.
   - In `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`, change `<PointerHighlight containerClassName="text-foreground/90">` to `<PointerHighlight containerClassName="text-primary">`.
   - In `apps/web/app/_components/home-page/sections/common-questions-section.tsx`, change the FAQ tail `<span className="text-foreground/90">` to `<span className="text-primary">`.
   - In `apps/web/app/_components/home-page/sections/pricing-footer-sections.tsx`, change the pricing tail `<span className="text-foreground/90">` to `<span className="text-primary">`.
   - Leave every decorative `*-foreground/*` tint untouched (hero CTA shadow, hero bottom-rule gradient, sprint-path bullet, promo banner wrapper, bonus card, PromoBanner default chip).
   - Leave `text-foreground/90` on `home-hero-headline.tsx` untouched (editorial muting of the second headline line).
   - Leave `lib/styling/primary-cta-invert-classes.ts` and `home-page-primary-cta.tsx`'s invert pattern untouched (deferred deletion; documented in Decision Log).
   - Run:

         bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx

3. Slice 2 - Tier B: cross-section rhythm normalization.
   - In `apps/web/app/_components/home-page/sections/sprint-path-unified-section.tsx`, change the h2 className from `text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl` to `text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl`. Change the section className from `py-20 lg:py-32` to `py-24 lg:py-40`.
   - In `apps/web/app/_components/home-page/sections/durability-section.tsx`, change the section className from `border-t border-border/40 py-20 lg:py-32` to `border-t border-border/40 py-24 lg:py-40`.
   - In `apps/web/app/_components/home-page/sections/pricing-footer-sections.tsx`, change the `HomePagePrimaryCta` className from `h-16 min-w-full rounded-2xl text-lg font-bold motion-safe:transition-transform motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]` to `h-16 min-w-full rounded-2xl text-lg font-bold shadow-2xl shadow-foreground/15 motion-safe:transition-all motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-foreground/25`.
   - In `apps/web/app/_components/home-page/sections/home-page-primitives.tsx`, delete the `homePageSectionClassName` export.
   - Run:

         bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx tests/integration-ui/checkout-button.test.tsx

4. Slice 3 - Tier C: dead code and structural debt.
   - Delete `apps/web/app/_components/home-page/sections/provider-icons.tsx`.
   - Create `apps/web/app/_components/home-page/sections/exec-loop/exec-loop-visual.tsx` containing `ExecLoopVisual`, `stepPositionClassNames`, and the `ExecLoopStep` import. Stays a server component. No `"use client"` directive.
   - Replace the body of `apps/web/app/_components/home-page/sections/exec-loop-section.tsx` so it imports `ExecLoopVisual` from `./exec-loop/exec-loop-visual` and only contains `ExecLoopSectionBlock`. Verify the file is well under 150 lines.
   - Run:

         bun run --cwd apps/web test:integration:ui

5. Slice 4 - Tier D: microinteractions.
   - In `apps/web/app/_components/home-page/sections/starter-system-section.tsx`, wrap the capability `<article>` so it carries `relative before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-foreground/0 motion-safe:before:transition-colors motion-safe:before:duration-500 motion-safe:hover:before:bg-foreground/30`. The fade-in is inherited from the parent `ScrollReveal` opacity transition; reduced-motion users see a static surface with no left bar deepen on hover.
   - In `apps/web/app/_components/home-page/faq-accordion.tsx`, pass an extra className to `AccordionTrigger` so the trigger carries `relative after:absolute after:bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-foreground/30 motion-safe:after:transition-transform motion-safe:after:duration-300 data-[state=open]:after:scale-x-100`. Do NOT modify the shared `apps/web/components/ui/accordion.tsx` primitive.
   - In `apps/web/app/_components/home-page/sections/home-page-primitives.tsx`, add `motion-safe:group-hover:rotate-12` to the `ArrowUpRight` className so the existing `motion-safe:transition-transform` covers it.
   - In `apps/web/app/_components/home-page/sections/hero-atmosphere.tsx`, gate the `DottedGlowBackground` mount on `viewport >= lg AND not prefers-reduced-motion`. Use a `useState` + `useEffect` driven by `window.matchMedia("(min-width: 1024px)")`. Mobile keeps the radial-gradient fallback.
   - Run:

         bun run --cwd apps/web test:integration:ui

6. Slice 5 - Tier E: a11y sweep.
   - Start the dev server: `bun run --cwd apps/web dev`. Visit `/?marketing=1` at desktop 1440 in light and dark.
   - Tab from page-load through every interactive control: theme toggle, sign-in (top bar), hero promo CTA (sm+), hero primary CTA, hero secondary link, FAQ accordion triggers (4 expected), pricing CTA, footer sign-in. Confirm a visible focus ring at every stop and logical tab order.
   - Open Chrome DevTools > Rendering > Emulate CSS prefers-reduced-motion: reduce. Confirm the dotted glow drops, the hero shadow lift drops, the sprint-path bullet scale drops, the exec-loop orbit and pulse drop, the FAQ height keyframe drops, the pricing CTA lift drops, the secondary link translate + rotate drops, the headline `tracking-tighter` drops.
   - Measure focus ring contrast against the worst-case CTA fill (light mode CTA fills with `bg-foreground` which is near-black, so focus ring at `oklch(0.708 0 0)` against the page background `oklch(0.99 0 0)` is the relevant measurement; in dark mode CTA fills with near-white, so focus ring at `oklch(0.556 0 0)` against page background `oklch(0.145 0 0)` is the relevant measurement). If either fails 3:1 non-text contrast, propose a global `--ring` token bump in `globals.css` and stop for explicit user approval before touching the global token.

7. Slice 6 - Tier F: social-proof portrait multi-viewport.
   - Visit `/?marketing=1` in dark mode at desktop 1440 and mobile 390. Inspect the founder portrait inside `social-proof-section.tsx`. If the `mix-blend-multiply` dither + `mix-blend-soft-light` overlay stack crushes detail, add `dark:opacity-25` (or similar tighter value) to the multiply overlay only and re-verify. If the portrait reads cleanly, document the inspection and skip.

8. Slice 7 - Validation:
   - Run focused tests for each section that has one (already covered by per-slice validation).
   - Run the broader `bun run --cwd apps/web test:integration:ui` and `bun run --cwd apps/web test:unit`.
   - Run `bun run format`, `bun lint`, `bun typecheck`.
   - Run `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish-3.md` and `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish-3.md`.
   - Capture the per-tier diff summary, the validation pass/fail matrix, the per-call-site Tier A decision table, the kept-vs-deleted dead code rationale, the deferred items, and the structural follow-ups exposed in `Outcomes & Retrospective` and `Surprises & Discoveries`.
   - Run `git status` one last time and confirm the diff stays inside the polish surfaces.

## Validation and Acceptance

The pass is acceptable when every tier from the brief either lands with a diff or is documented as inspected-and-not-changed with a reason; every locked behavior, contract, and `data-testid` survives unchanged; the validation matrix passes (or any skipped check is justified); the diff stays inside the in-scope surfaces; and a desktop + mobile manual viewport proof at `/?marketing=1` in both themes shows: every section reads as intentionally polished, the sprint-path / FAQ / pricing tail accents read as deliberate brand emphasis under the active preset, the section padding cadence and h2 sizes are uniform, the pricing CTA carries the same shadow + lift as the hero CTA, the dotted glow only mounts above `lg`, the FAQ trigger underline grows on open, every animation drops to a static state under reduced motion, every interactive control has a visible focus ring, and no `text-foreground/90` brand-emphasis accent remains where the prompt named a swap target.

### Test Commands

Run from repo root unless a working directory is specified.

Per-slice focused tests:

    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-primary-cta.test.tsx
    bun run --cwd apps/web test:integration:ui tests/integration-ui/public-theme-toggle.test.tsx
    bun run --cwd apps/web test:integration:ui tests/integration-ui/checkout-button.test.tsx
    bun run --cwd apps/web test:integration:ui tests/integration-ui/home-page-product-preview.test.tsx
    bun run --cwd apps/web test:unit tests/unit/home-page-content.test.ts
    bun run --cwd apps/web test:unit tests/unit/home-page-render-model.test.ts

Broader suites after the last source slice:

    bun run --cwd apps/web test:integration:ui
    bun run --cwd apps/web test:unit

Repo-level gate:

    bun run format
    bun lint
    bun typecheck

Plan and markdown lint:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-02-landing-page-polish-3.md
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-02-landing-page-polish-3.md

Manual smoke:

    Open `/?marketing=1` at desktop 1440 and mobile 390 in light and dark themes.
    Scroll top to bottom in each combination. Confirm intentional rhythm, dark-mode parity, no horizontal scroll, no awkward wrapping.
    Toggle `prefers-reduced-motion` (system setting or browser devtools rendering panel). Confirm every animation drops to a static state.
    Tab through every interactive control on the page. Confirm a visible focus ring at every stop. Confirm logical tab order. Confirm no focus traps.

## Idempotence and Recovery

Every slice in this pass is additive or a clean replacement. Re-running any slice is safe: the Tier A `text-primary` swaps are className-only and replace one className with another; the Tier B rhythm changes replace one set of class tokens with another; the Tier C deletion of `provider-icons.tsx` is recoverable from git history; the Tier C exec-loop split is a structural rearrangement that re-applies cleanly; the Tier D microinteractions all gate behind `motion-safe:` so reduced-motion users see no behavioral change.

To roll back any slice, revert the slice's commits. The locked behavior surfaces (Blueprint demo, CTA seam, `data-testid` values, structured data, `PRIMARY_CTA_INVERT_CLASSES`) are unchanged across the pass, so no migration is required either way.

If the parallel checkout-success polish ships and the `PRIMARY_CTA_INVERT_CLASSES` constant becomes deletable, that follow-up is a separate one-commit migration that touches both consumers and removes the file; this pass does not preempt that work.

If the Tier E ring-contrast measurement triggers a global `--ring` token bump, that change is paused for explicit user approval before touching `globals.css` because the token affects every app surface, not just the public landing page.

## Artifacts and Notes

After the pass lands, capture in `Outcomes & Retrospective`:

- The list of new commits with their conventional-commit subjects (or "uncommitted, awaiting review" if the user has not yet asked for a commit).
- The validation pass/fail table.
- The per-call-site Tier A decision table (swapped, kept, deferred).
- The kept-vs-deleted dead code rationale.
- The deferred items (`PRIMARY_CTA_INVERT_CLASSES`, possible global `--ring` bump if Tier E flagged it).
- Any structural follow-up the polish exposed.
- A clear handoff note for any work that should ship before customer launch but did not fit this polish scope.

## Interfaces and Dependencies

This pass relies on these existing exports remaining stable:

- `motion/react`: `useReducedMotion`, `motion.*`. No new motion library use.
- `lucide-react`: `ArrowRight`, `ArrowUpRight`, `Check`, `ChevronDownIcon`, `ChevronUpIcon`. No new icon imports.
- shadcn primitives: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Button`. Surfaced via `apps/web/components/ui/*`.
- `tailwind-merge`: via `cn()` from `apps/web/lib/utils.ts`.
- `apps/web/components/ui/dotted-glow-background.tsx`: gated at the `HeroAtmosphere` boundary by viewport `matchMedia` plus `useReducedMotion`.
- `apps/web/components/ui/pointer-highlight.tsx`: `PointerHighlight` consumed by sprint-path; `containerClassName` prop forwarded to the inner `<span>`.

This pass does not introduce any new internal interfaces. The new file `sections/exec-loop/exec-loop-visual.tsx` exports `ExecLoopVisual` and `stepPositionClassNames` for `exec-loop-section.tsx` to import; both are already module-scope today, just colocated in the same file.
