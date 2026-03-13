# Ship by Sunday

`Ship by Sunday` is the app behind a guided weekend sprint for builders who want to go from rough idea to shipped v1. This repo contains the public marketing site, Stripe checkout flow, protected student workspace, and the code-defined curriculum that powers the product.

## What Lives Here

- Public marketing and pricing pages in `app/`
- Protected student routes at `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and `/access-required`
- Course structure, lesson contracts, and lesson copy in `lib/course/`
- Purchase-to-access handoff across Clerk, Stripe, and Convex

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Copy the tracked env template:

```bash
cp .env.local.example .env.local
```

3. Start the full local stack:

```bash
pnpm run dev
```

If you only need one side of the app:

```bash
pnpm run dev:web
pnpm run dev:convex
```

## Common Commands

```bash
pnpm run typecheck
pnpm run lint
pnpm run test:unit
pnpm run test:smoke
pnpm run build
pnpm run check
```

For local Stripe checkout testing, use:

```bash
pnpm run stripe:listen:local
pnpm run stripe:local:doctor
pnpm run stripe:local:verify
```

The purchase-to-access behavior contract lives in [docs/delivery-onboarding/stack-decision.md](docs/delivery-onboarding/stack-decision.md).

## Intentionally Customizable

- Curriculum shape and lesson order: `lib/course/manifest.ts` and `lib/course/lessons/*.ts`
- Landing-page copy, offer framing, and media: `app/page.tsx`, `app/faq-accordion.tsx`, and `public/`
- Student workspace UI and shell behavior: `components/` and `app/mission/page.tsx`
- Theme tokens and visual language: `app/globals.css`
- Purchase, entitlement, and access flow: `app/api/stripe/*`, `app/checkout/*`, and `convex/course.ts`
- Optional starter-template and Codex-assisted build helpers: `.env.local.example`, `scripts/`, and `app/api/codex/*`

More detail: [docs/dev/customization.md](docs/dev/customization.md)

## Docs

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Docs hub: [docs/README.md](docs/README.md)
- Architecture: [docs/dev/architecture.md](docs/dev/architecture.md)
- Internal launch operations: [docs/internal/README.md](docs/internal/README.md)

If you are new to the repo, start with `README.md`, then `CONTRIBUTING.md`, then `docs/README.md`. The internal launch tracker and workstream docs were moved under `docs/internal/` so the public repo surface stays focused on the product and contributor workflow.
