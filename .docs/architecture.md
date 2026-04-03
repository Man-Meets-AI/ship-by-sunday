# Architecture

Ship by Sunday is a blueprint-first SaaS starter. The public product is not a course player or a collection of separate downloads. The main contract is one guided protected workspace that ends in one generated starter snapshot.

## Main system slices

- `apps/web`: the main Next.js 16 app. It owns public marketing pages, the protected blueprint workspace, docs pages, checkout success and access routes, and optional Codex runtime surfaces.
- Convex: the backend source of truth for product access, blueprint state, course runtime data, observability events, and webhook-backed workflows.
- Stripe: checkout, webhook, and entitlement handoff into Convex-backed access state.
- Clerk: identity, auth state, and protected-route gating.
- `packages/blueprint-compiler`: turns canonical blueprint facts into the customer-safe starter snapshot and generated docs.
- `packages/ship-by-sunday-cli`: local blueprint-intake and snapshot-generation path that mirrors the protected `/review` contract.
- `qa/`: release-proof operating system for packs, personas, run reports, and evidence.

## Product surface model

- Public surface: marketing pages, pricing, docs, SEO, and onboarding explanation.
- Protected surface: `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and `/settings`.
- Compatibility redirects still exist for older routes such as `/mission`, `/lesson/[lessonKey]`, and `/artifacts`, but those are no longer canonical product surfaces.

## Design and homepage boundaries

User-facing design truth lives in `DESIGN.md`.

Homepage behavior is intentionally split:

- `apps/web/config/product.ts` owns the homepage control plane.
- `apps/web/features/marketing/content/home.ts` owns copy and assets.
- `apps/web/features/marketing/lib/home-page-render-model.ts` owns section behavior and CTA decisions.
- `apps/web/features/marketing/lib/home-page-structured-data.ts` keeps schema aligned with visible sections.

## Delivery contract

The protected journey ends at `/review`. That route exposes one download artifact, `Starter Snapshot`, which expands into one repo folder with generated docs, starter-safe operator surfaces, and configured app code.

Do not model Ship by Sunday as separate design, marketing, or build downloads unless the live product changes first.
