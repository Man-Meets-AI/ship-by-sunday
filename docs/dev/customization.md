# Customization Guide

These are the intended extension points for the app. If you are changing one of these areas, update the code here first instead of scattering one-off overrides across the repo.

| Area                             | Primary files                                                                                          | What to change                                                                           | Minimum verification                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Curriculum and lesson order      | `lib/course/manifest.ts`, `lib/course/lessons/*.ts`                                                    | Add or remove lessons, change lesson copy, adjust stage order, attach resources          | Focused lesson tests plus `pnpm run typecheck`              |
| Marketing page and offer surface | `app/page.tsx`, `app/faq-accordion.tsx`, `public/`                                                     | Headline, proof, FAQ, screenshots, pricing-page sections                                 | Manual local browse plus `pnpm run typecheck`               |
| Student workspace UI             | `components/`, `app/mission/page.tsx`, `app/lesson/[lessonId]/page.tsx`                                | Shell layout, lesson chrome, workbench visuals, mission framing                          | Focused tests for the changed surface                       |
| Purchase and access flow         | `app/api/stripe/*`, `app/checkout/*`, `convex/course/`, `docs/delivery-onboarding/stack-decision.md` | Checkout creation, webhook handling, entitlement rules, success/access-required behavior | `pnpm run check`                                            |
| Theme and brand styling          | `app/globals.css`, `public/`, route-local CSS classes                                                  | Colors, spacing, typography, imagery, visual tokens                                      | Manual visual QA                                            |
| Optional build helpers           | `.env.local.example`, `scripts/`, `app/api/codex/*`                                                    | Starter-template CTA, Codex-assisted build flow, local helper scripts                    | Manual local flow plus targeted tests when behavior changes |

## Guardrails

- Keep `lib/course/manifest.ts` as the course-contract source of truth.
- Keep `convex/course/` as the source of truth for entitlements, access gating, progress, and artifacts unless you are intentionally refactoring that boundary.
- Keep the live purchase-to-access contract aligned with [../delivery-onboarding/stack-decision.md](../delivery-onboarding/stack-decision.md).
- If a change is purely launch-ops or founder-workflow related, put the doc or note in `docs/internal/` instead of here.
