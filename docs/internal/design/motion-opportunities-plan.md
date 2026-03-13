# Motion Opportunities Plan

Last updated: 2026-03-12

## Goal

Use the practical motion patterns in `docs/internal/design/motion-practical-examples.md` to improve the launch-critical buyer and student journey without turning the product into a motion project.

## Status

- Phase 1 shipped on 2026-03-11 across the checkout CTA, checkout-success, access-required, and FAQ surfaces.
- Phase 2 partially shipped on 2026-03-12 for lesson completion feedback and bottom-rail unlock continuity.
- Next recommended implementation pass: finish the rest of Phase 2, focused on shell orientation/state transitions and mission-map unlock continuity.

## Implementation stance

- Stay CSS-first. Do not add a motion library for this pass.
- Favor `transform` and `opacity` over layout-heavy animation.
- Reserve space for loading and validation states so labels and layouts do not jump.
- Respect `prefers-reduced-motion`.
- Gate hover-heavy behavior behind `@media (hover: hover) and (pointer: fine)`.
- Prioritize money-step trust, onboarding clarity, and student progress feedback over decorative reveals.

## Top 10 opportunities

| Priority | Area                                                      | Files                                                                                       | Motion pattern from the library                                                       | Why it matters                                                                                                                                                            | Complexity  |
| -------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1        | Primary checkout CTA                                      | `components/checkout-button.tsx`, `app/page.tsx`, `components/access-required-page.tsx`     | Button press feedback, loading button width reservation, inline validation fade/slide | This is the money step. The current label swap to `Redirecting...` and abrupt error insert make checkout feel less trustworthy than it should.                            | Low         |
| 2        | Post-purchase access handoff                              | `components/checkout-success-view.tsx`                                                      | Async state staging, useful status copy, completion moment before redirect            | This is the highest-anxiety screen after payment. A quiet progress heartbeat and a brief `Access ready` confirmation would reduce purchase doubt.                         | Medium      |
| 3        | Access fallback and entitlement-check state               | `components/access-required-page.tsx`                                                       | Empty-state continuity, async result crossfade, softer notice intensity               | When webhook handoff lags, this page needs to feel like a real system state, not a broken one.                                                                            | Medium      |
| 4        | FAQ objection handling accordion                          | `app/faq-accordion.tsx`                                                                     | Accordion height animation, inner-content fade, quicker close, icon rotation          | This sits near the bottom of the funnel. Smoother expansion improves scanability and makes objection handling feel more premium.                                          | Low         |
| 5        | Landing-page four-block mechanism cards                   | `app/page.tsx`                                                                              | Card hover states, parent-driven child reveal, hover gating for fine pointers         | The `4-block path` section explains the core mechanism. Better motion would make the model easier to parse and feel less static.                                          | Low-medium  |
| 6        | Lesson autosave and completion feedback                   | `components/lesson-page.tsx`, `components/lesson-shells.tsx`                                | Quiet autosave feedback, submit progress state, batch-action completion moment        | Students need proof that their work is safe and that completion actually registered before the next route loads.                                                          | Medium      |
| 7        | Persistent shell orientation and layout changes           | `components/product-shell.tsx`, `components/lesson-shells.tsx`, `components/skill-rail.tsx` | Tab/selection transitions, active indicator motion, content-region crossfade          | Split/focus changes, coach visibility, nav state, and skill-rail selection currently snap. Small orientation-preserving motion would make the shell feel more deliberate. | Medium-high |
| 8        | Mission-map progress and unlock feedback                  | `components/mission-page.tsx`                                                               | Progress-bar easing, list/layout motion, new-unlock highlight                         | After a lesson completes, the mission map should make the newly active challenge obvious instead of feeling like a hard refresh.                                          | Medium      |
| 9        | Workbench section state, chooser, and validation feedback | `components/lesson-workbench.tsx`                                                           | Inline validation fade, card-swap continuity, gentle locked/ready state changes       | The workbench is where confusion is most expensive. Better transitions would make progression clearer and less punishing.                                                 | Medium      |
| 10       | Artifacts loading, empty state, and saved-work reveal     | `components/artifacts-page.tsx`                                                             | Skeleton-to-content crossfade, empty-state continuity, light stagger on first items   | This page is proof that the system saved the student’s work. Better continuity makes saved outputs feel more reliable and valuable.                                       | Low         |

## Recommended rollout

### Phase 1: Revenue and trust

Shipped on 2026-03-11 because these sit closest to conversion or post-purchase confidence.

1. Primary checkout CTA
2. Post-purchase access handoff
3. Access fallback and entitlement-check state
4. FAQ objection handling accordion

### Phase 2: Student confidence in the product shell

Ship these next because they reduce confusion once someone has bought.

Status on 2026-03-12:

- Shipped: lesson completion celebration with CTA success morph, centered completion banner, reduced-motion-safe delay before auto-advance, and bottom skill-rail completion/unlock cue.
- Still open: quieter autosave feedback, shell orientation transitions, and mission-map unlock feedback after returning from a completed lesson.

1. Lesson autosave and completion feedback
2. Persistent shell orientation and layout changes
3. Mission-map progress and unlock feedback

### Phase 2 implementation note: lesson completion celebration

The lesson-completion moment now follows this sequence:

1. Student clicks `Complete lesson`
2. Mutation enters a local `submitting` phase
3. On success, the footer CTA morphs to `Lesson cleared`
4. A centered banner confirms the artifact lock-in and next unlock
5. The bottom skill rail plays a completion sweep on the cleared lesson and a short ping on the next unlocked lesson
6. The route auto-advances after `900ms`, or `250ms` under `prefers-reduced-motion`

This should remain the default completion pattern for lesson flows unless a future block-level or mission-level celebration intentionally overrides it.

### Phase 3: Learning-flow polish

Ship these after the trust-critical motion is in place.

1. Workbench section state, chooser, and validation feedback
2. Artifacts loading, empty state, and saved-work reveal
3. Landing-page four-block mechanism cards

## Suggested implementation notes

### 1. Add shared motion tokens

Put reusable timing and easing utilities in `app/globals.css` so the launch surfaces do not invent a different feel in each file.

- `--motion-fast`: `120ms`
- `--motion-base`: `180ms`
- `--motion-slow`: `260ms`
- `--ease-standard`: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- `--ease-exit`: `cubic-bezier(0.4, 0, 1, 1)`

### 2. Keep the implementation primitive

For this pass, favor:

- opacity + translate for enter/exit
- scale `0.98` to `1` for button press/release
- fixed-width wrappers for loading buttons and status labels
- progress-width transitions only where the underlying state is already real

### 3. Add reduction rules up front

Every new motion pattern should degrade to:

- no stagger for reduced motion
- no hover-only transforms on touch or coarse pointers
- no repeated pulsing when the state is stable

## Explicitly not in scope

- Cinematic route transitions
- Decorative scroll reveals on every landing-page section
- New animation dependencies
- Parallax or motion that competes with readability
