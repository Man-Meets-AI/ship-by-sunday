# Developer Architecture

## Runtime surfaces

- `app/`: route entrypoints and route-local UI
- `components/`: shared UI shells and view components
- `lib/course/`: course domain contracts, resources, manual lesson definitions, registry logic, and prompt-template builders
- `convex/`: entitlements, mission state, lesson state, and uploads

## Lesson workbench

- `components/lesson-workbench.tsx` is the public workbench facade.
- `components/lesson-workbench/renderer.tsx` handles runtime derivation plus typed mode dispatch.
- `components/lesson-workbench/modes/` owns mode-specific layout and behavior.
- `components/lesson-workbench/fields/` owns field-kind controls and pure parsing helpers.
- `components/lesson-workbench/shared/` owns shell-level primitives that are reused across modes, including the single thin-label workbench header treatment.
- See `docs/dev/lesson-workbench.md` for the working rules and file-boundary guardrails.
- `components/lesson-shells.tsx` owns the coach dock and shared dock resource rendering.

## Purchase to access flow

1. The landing page CTA starts checkout for signed-in users.
2. Signed-out users are redirected through Clerk first.
3. `POST /api/stripe/checkout` creates the Stripe Checkout Session.
4. `POST /api/stripe/webhook` verifies the signature and grants access in Convex.
5. `/checkout/success` polls access and redirects to `/mission`.

## Product state flow

- `lib/course/manifest.ts` assembles the course contract.
- `lib/course/lessons/*.ts` own the manual lesson definitions and student-facing content.
- `lib/course/research-prompt.ts` owns prompt templates, prompt-context helpers, and pasteback parsing for prompt-driven lesson imports such as lesson `1.4`.
- `lib/course/registry.ts` derives runtime helpers from that contract.
- `app/lesson/[lessonId]/page.tsx` validates the lesson ID server-side, then the lesson page resolves the static lesson definition locally from `lib/course`.
- `convex/course.ts` stores dynamic course state only: entitlements, access gating, lesson progress, uploads, pinned artifact previews, and hydrated draft field values.
- `convex/course.ts` should route lesson-state reads and writes through one internal viewer-state lifecycle so mission status, lesson access, artifacts, and draft/complete mutations all share the same compatibility rules.
