# Ship by Sunday

`Ship by Sunday` is the app behind a guided weekend sprint for builders who want to go from rough idea to shipped v1. This repo contains the public marketing site, Stripe checkout flow, protected student workspace, and the code-defined curriculum that powers the product.

## What Lives Here

- Public marketing and pricing pages in `app/`
- Protected product routes at `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and the recovery surface at `/access-required`
- Feature-first runtime code in `features/`, with the curriculum and lesson model centered under `features/course/lesson/`
- Purchase-to-access handoff across Clerk, Stripe, and Convex product-access state

## Quick Start

1. Install dependencies:

```bash
pnpm install
```

2. Copy the tracked env template:

```bash
cp .env.local.example .env.local
```

Set `APP_BASE_URL` to the canonical host you want Stripe to use for checkout success and cancel redirects. For local development, keep it on `http://localhost:3000`.

3. Start the full local stack:

```bash
pnpm run dev
```

If you only need one side of the app:

```bash
pnpm run dev:web
pnpm run dev:convex
```

## Codex Integration

The optional in-app Codex account and generation routes require a runtime that can spawn the `codex` binary and persist per-user app-server state.

- Local development: enabled by default
- Vercel: disabled by default unless you explicitly set `CODEX_APP_SERVER_ENABLED=true` on a compatible runtime

## Common Commands

```bash
pnpm run typecheck
pnpm run lint
pnpm run test:unit
pnpm run test:contracts
pnpm run test:integration
pnpm run test:browser-smoke
pnpm run build
pnpm run check
```

The full testing runbook lives in [docs/dev/testing.md](docs/dev/testing.md).

For local Stripe checkout testing, use:

```bash
pnpm run stripe:listen:local
pnpm run stripe:local:doctor
pnpm run stripe:local:verify
```

The purchase-to-access behavior contract lives in [docs/delivery-onboarding/stack-decision.md](docs/delivery-onboarding/stack-decision.md).

## Intentionally Customizable

- Curriculum shape and lesson order: `features/course/lesson/model/manifest.ts` and `features/course/lesson/model/lessons/*.ts`
- Landing-page copy, offer framing, and media: `features/marketing/components/home-page.tsx`, `features/marketing/components/faq-accordion.tsx`, and `public/`
- Student workspace UI and shell behavior: `features/course/` plus the protected route group in `app/(app)/`
- Theme tokens and visual language: `app/globals.css`
- Purchase, product-access, and access flow: `app/api/stripe/*`, `features/checkout/`, `features/product-access/`, `convex/access.ts`, and `convex/course/`
- Optional starter-template and Codex-assisted build helpers: `.env.local.example`, `scripts/`, `app/api/codex/*`, and `features/codex/`

More detail: [docs/dev/customization.md](docs/dev/customization.md)

## Docs

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Docs hub: [docs/README.md](docs/README.md)
- Architecture: [docs/dev/architecture.md](docs/dev/architecture.md)
- Internal launch operations: [docs/internal/README.md](docs/internal/README.md)

If you are new to the repo, start with `README.md`, then `CONTRIBUTING.md`, then `docs/README.md`. The public builder docs live at `/docs` and are backed by `content/docs`, while `docs/internal/` stays focused on launch ops and internal workstreams.
