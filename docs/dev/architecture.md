# Developer Architecture

## Runtime surfaces

- `app/`: route entrypoints and route-local UI
- `components/`: shared UI shells and view components
- `lib/course/`: course domain contracts, helpers, and registry logic
- `content/lessons/`: lesson-content modules and generated lesson barrel
- `convex/`: entitlements, mission state, lesson state, and uploads

## Purchase to access flow

1. The landing page CTA starts checkout for signed-in users.
2. Signed-out users are redirected through Clerk first.
3. `POST /api/stripe/checkout` creates the Stripe Checkout Session.
4. `POST /api/stripe/webhook` verifies the signature and grants access in Convex.
5. `/checkout/success` polls access and redirects to `/mission`.

## Product state flow

- `lib/course/manifest.ts` defines the course contract.
- `lib/course/registry.ts` derives runtime helpers from that contract.
- `content/lessons/index.ts` joins the course contract with lesson-content modules.
- `convex/course.ts` stores progress and entitlement state.

## Generated content

- `scripts/build-lesson-content-from-blueprint.mjs` generates lesson modules and the generated lesson barrel.
- Generated outputs must be reproducible from tracked source inputs.
- Do not hand-edit machine-owned outputs without updating the generator or the source inputs.
