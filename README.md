# Ship by Sunday

`Ship by Sunday` is the app behind a guided weekend sprint for builders who want to go from rough idea to shipped v1. This repo contains the public marketing site, Stripe checkout flow, protected student workspace, and the code-defined curriculum that powers the product.

## What Lives Here

- Public marketing and pricing pages in `app/`
- Protected product routes at `/mission`, `/lesson/[lessonKey]`, `/artifacts`, `/settings`, and the recovery surface at `/access-required`
- Feature-first runtime code in `features/`, with the curriculum and lesson model centered under `features/course/lesson/`
- Purchase-to-access handoff across Clerk, Stripe, and Convex product-access state

## Quick Start

1. Install dependencies:

```bash
bun install
```

2. Copy the tracked env template:

```bash
cp .env.local.example .env.local
```

Set `APP_BASE_URL` to the canonical host you want Stripe to use for checkout success and cancel redirects. For local development, keep it on `http://localhost:3000`.

3. Start the full local stack:

```bash
bun run dev
```

If you only need one side of the app:

```bash
bun run dev:web
bun run dev:convex
```

## Codex Integration

The optional in-app Codex account and generation routes require a runtime that can spawn the `codex` binary and persist per-user app-server state.

- Local development: enabled by default
- Vercel: disabled by default unless you explicitly set `CODEX_APP_SERVER_ENABLED=true` on a compatible runtime

## Common Commands

```bash
bun run typecheck
bun run lint
bun run test:unit
bun run test:contracts
bun run test:integration
bun run test:browser-smoke
bun run build
bun run check
```

The full testing runbook lives in [docs/dev/testing.md](docs/dev/testing.md).

For local Stripe checkout testing, use:

```bash
bun run stripe:listen:local
bun run stripe:local:doctor
bun run stripe:local:verify
```

The purchase-to-access behavior contract lives in [docs/delivery-onboarding/stack-decision.md](docs/delivery-onboarding/stack-decision.md).

## Intentionally Customizable

- Curriculum shape, stable lesson identity, canonical labels, and route mapping: `features/course/lesson/model/curriculum.ts`
- Lesson copy, workbench fields, and lesson-specific page behavior: `features/course/lesson/model/lessons/*.ts` and `features/course/lesson/content/build.ts`
- Landing-page copy, offer framing, and media: `features/marketing/components/home-page.tsx`, `features/marketing/components/faq-accordion.tsx`, and `public/`
- Student workspace UI and shell behavior: `features/course/` plus the protected route group in `app/(app)/`
- Theme tokens and visual language: `app/globals.css`
- Purchase, product-access, and access flow: `app/api/stripe/checkout`, `features/checkout/`, `features/product-access/`, `convex/access.ts`, `convex/http.ts`, and `convex/course/`
- Optional starter-template and Codex-assisted build helpers: `.env.local.example`, `scripts/`, `app/api/codex/*`, and `features/codex/`

More detail: [docs/dev/customization.md](docs/dev/customization.md)

## Curriculum Kernel

The course runtime now uses one typed curriculum kernel in [features/course/lesson/model/curriculum.ts](/Users/parkerrex/Projects/manmeetsai-workspace/features/course/lesson/model/curriculum.ts).

- `lessonKey` is the stable internal identity used for routing, navigation, and persisted progress.
- `displayLabel` is the canonical student-facing label shown across mission, lesson, and rail surfaces.
- `routeSegment` is the stable URL slug for `/lesson/[lessonKey]`.
- `videoAssetId` is the lesson-owned link to published lesson media.

Lesson modules still own lesson-specific content and workbench definitions, but they no longer act as the source of truth for sequence, rail numbering, or route identity.

## Docs

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Docs hub: [docs/README.md](docs/README.md)
- Architecture: [docs/dev/architecture.md](docs/dev/architecture.md)
- Internal launch operations: [docs/internal/README.md](docs/internal/README.md)

If you are new to the repo, start with `README.md`, then `CONTRIBUTING.md`, then `docs/README.md`. The public builder docs live at `/docs` and are backed by `content/docs`, while `docs/internal/` stays focused on launch ops and internal workstreams.
