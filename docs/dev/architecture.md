# Developer Architecture

## Runtime surfaces

- `app/`: route entrypoints and route-local UI
- `components/`: shared UI shells and view components
- `lib/course/`: course domain contracts, resources, manual lesson definitions, and registry logic
- `convex/`: entitlements, mission state, lesson state, and uploads

## Purchase to access flow

1. The landing page CTA starts checkout for signed-in users.
2. Signed-out users are redirected through Clerk first.
3. `POST /api/stripe/checkout` creates the Stripe Checkout Session.
4. `POST /api/stripe/webhook` verifies the signature and grants access in Convex.
5. `/checkout/success` polls access and redirects to `/mission`.

## Product state flow

- `lib/course/manifest.ts` assembles the course contract.
- `lib/course/lessons/*.ts` own the manual lesson definitions and student-facing content.
- `lib/course/registry.ts` derives runtime helpers from that contract.
- `app/lesson/[lessonId]/page.tsx` validates the lesson ID server-side, then the lesson page resolves the static lesson definition locally from `lib/course`.
- `convex/course.ts` stores dynamic course state only: entitlements, access gating, lesson progress, uploads, pinned artifact previews, and hydrated draft field values.
