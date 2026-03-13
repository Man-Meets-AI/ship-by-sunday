# Contributing

Start with [README.md](README.md) for setup, then use [docs/README.md](docs/README.md) for the current docs map.

## Local Setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.local.example` to `.env.local`.
3. Run `pnpm run dev` for the full stack, or `pnpm run dev:web` and `pnpm run dev:convex` separately.

If you are changing checkout or access behavior, read [docs/delivery-onboarding/stack-decision.md](docs/delivery-onboarding/stack-decision.md) before touching the flow.

## Where To Change What

- Marketing copy and landing-page sections: `app/page.tsx` and `public/`
- Shared student UI and lesson shells: `components/`
- Curriculum, lesson sequence, and lesson copy: `lib/course/manifest.ts` and `lib/course/lessons/*.ts`
- Purchase, success, cancel, and webhook behavior: `app/api/stripe/*`, `app/checkout/*`, and `convex/course/`
- Theme, spacing, and global UI tokens: `app/globals.css`
- Runtime architecture and deeper developer notes: `docs/dev/`

The short customization map lives in [docs/dev/customization.md](docs/dev/customization.md).

## Validation Expectations

- Docs-only changes: verify links and paths you touched.
- UI or lesson-content changes: run `pnpm run typecheck` and the focused tests for the affected area.
- Shared shell, auth, checkout, entitlement, or route-protection changes: run `pnpm run check`.

For the local QA accounts, browser-testing flow, and Stripe sandbox handoff path, use [docs/dev/testing.md](docs/dev/testing.md).

## Community Standards

By participating, follow the expectations in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Public Vs Internal Docs

- Keep contributor-facing product and engineering docs in `README.md`, `CONTRIBUTING.md`, `docs/dev/`, or `docs/delivery-onboarding/`.
- Keep launch operations, founder workflow, role prompts, workstream planning, and internal research in `docs/internal/`.

If you are not actively working on launch operations, you can ignore `docs/internal/`.
