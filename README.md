# Ship by Sunday

Why its awesome

- Error pipeline to Telegram so you can paste it right to your bot
- Stripe
- SEO Best practices so u show up
- Clerk, Sign in with google
- Convex
- Shadcn, TailwindV4
- Bring your own AI integration (chatgpt)

`Ship by Sunday` is the app behind a guided weekend sprint for builders who want to go from rough idea to shipped v1. This repo now doubles as the configurable starter base, with the public marketing site, Stripe checkout flow, protected workspace shell, optional course runtime, and the code-defined seams that let those surfaces be turned on or off without rewriting the purchase-to-access contract.

## What Lives Here

- Public marketing and pricing pages in `app/`
- Protected product routes at `/mission`, `/lesson/[lessonKey]`, `/artifacts`, and `/settings`, with `/mission` acting as the canonical protected entry and starter-mode home
- Feature-first runtime code in `features/`, with the curriculum and lesson model centered under `features/course/lesson/`
- Purchase-to-access handoff across Clerk, Stripe, and Convex product-access state
- Starter configuration and module flags in `config/product.ts`

## Quick Start

1. Install dependencies:

```bash
bun install
```

2. Copy the tracked env template:

```bash
cp .env.local.example .env.local
```

Set `APP_BASE_URL` to the canonical host you want Stripe to use for checkout success and cancel redirects. The same value is also used for SEO metadata, canonical URLs, `robots.txt`, and `sitemap.xml`. For local development, keep it on `http://localhost:3000`.

If you want Google Search Console HTML-tag verification through Next metadata, set `GOOGLE_SITE_VERIFICATION` to the token value from Search Console.

3. Connect the repo to your hosted Convex dev deployment:

```bash
bun run dev:convex
```

Need a Convex account first? Create one here: [https://convex.dev/referral/PARKER6190](https://convex.dev/referral/PARKER6190)

This writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` into `.env.local` for your per-developer hosted Convex dev deployment.

4. Start the normal local dev workflow:

```bash
bun run dev
```

For the full buyer-flow local environment, including Stripe webhook forwarding:

```bash
bun run dev:full
```

If you only need one side of the app:

```bash
bun run dev:web
bun run dev:convex
bun run dev:stripe
```

- `bun run dev:web` runs the Next.js app locally
- `bun run dev:convex` keeps your hosted Convex dev deployment synced and refreshes `.env.local` when you switch deployments
- `bun run dev:stripe` waits for hosted Convex dev values in `.env.local`, then starts the Stripe listener
- `bun run dev:full` runs `web + hosted Convex dev + Stripe listener` together for checkout QA

This repo does not support Convex's local backend mode as a first-class development workflow.

## Codex Integration

The optional in-app Codex account and generation routes require a runtime that can spawn the `codex` binary and persist per-user app-server state.

- Local development: enabled by default
- Vercel: disabled by default unless you explicitly set `CODEX_APP_SERVER_ENABLED=true` on a compatible runtime

## Starter Mode and Module Flags

The starter’s current control plane lives in `starterConfig` inside `config/product.ts`.

The `starterConfig.modules` flags currently control:

- `docs`
- `course`
- `starterRepo`
- `codex`
- `observability`

Current behavior:

- when `course` is `false`, `/mission` renders the neutral protected starter home from `features/workspace-home/` instead of the guided mission flow
- when `course` is `false`, `/lesson/[lessonKey]` and `/artifacts` stay on deliberate disabled states
- when `docs` is `false`, docs links hide and `/docs` renders a disabled-state surface instead of the docs shell
- when `starterRepo` is `false`, starter-repo access cards disappear from the protected app

These are code-level starter defaults, not a full in-app admin surface yet.

The public homepage now has its own starter-controlled shell:

- `starterConfig.homePage.sections` controls the fixed top-level homepage sections: `hero`, `sprintPath`, `whatsInside`, `socialProof`, `faq`, `pricing`, and `footer`
- `starterConfig.homePage.heroPrimaryCta` and `starterConfig.homePage.pricingPrimaryCta` control whether those surfaces route through checkout or a normal link target
- `features/marketing/lib/home-page-render-model.ts` is the single place that translates starter config plus homepage content into the render contract used by `features/marketing/components/home-page.tsx`

## Common Commands

```bash
bun run typecheck
bun run lint
bun run test:unit
bun run test:contracts
bun run test:integration
bun run test:coverage:critical
bun run test:browser-smoke
bun run build
bun run check
```

The full testing runbook lives in [docs/dev/testing.md](docs/dev/testing.md).

For Stripe checkout testing from your local machine against hosted Convex dev, use:

```bash
bun run dev:full
bun run stripe:listen:dev
bun run stripe:dev:doctor
bun run stripe:dev:verify
```

The purchase-to-access behavior contract lives in [docs/delivery-onboarding/stack-decision.md](docs/delivery-onboarding/stack-decision.md).

## Telegram Observability

The app now ships a self-hosted error pipeline:

- Next.js server and client failures are normalized in `features/observability/`
- unexpected API route failures are tagged with `x-request-id`
- events are ingested into Convex through `/observability/events`
- Convex deduplicates repeated incidents and sends alerts to Telegram

Required env values:

```bash
CLERK_WEBHOOK_SIGNING_SECRET=
OBSERVABILITY_INGEST_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

`OBSERVABILITY_INGEST_TOKEN` is not a vendor-issued key. It is just a strong random shared secret that must match in both the Next.js runtime and the Convex runtime. Generate one with:

```bash
openssl rand -hex 32
```

`CLERK_WEBHOOK_SIGNING_SECRET` comes from the Clerk webhook endpoint configuration for `/api/observability/clerk`.

`TELEGRAM_BOT_TOKEN` comes from BotFather. `TELEGRAM_CHAT_ID` is the chat or group id the bot should post into. A simple way to fetch it is to message the bot once, then inspect:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates"
```

Use `ENABLE_OBSERVABILITY_TEST_TRIGGER=1` only in automated browser-testing environments; it enables the protected-shell fault injection used by the Playwright auth harness.

## Public SEO Surface

- Root metadata defaults live in `app/layout.tsx` and resolve absolute canonical hosts through `platform/next/metadata-base.ts`.
- Public crawl directives are generated from `app/robots.ts` and `app/sitemap.ts`, with docs-backed `lastModified` hints from `content/docs`.
- Social preview images are generated from `app/opengraph-image.tsx` and `app/twitter-image.tsx`.
- Docs metadata defaults and per-page canonical/OG/Twitter fields are built through `features/docs/lib/docs-metadata.ts`.
- Homepage structured data is injected from `app/page.tsx` via `features/marketing/lib/home-page-structured-data.ts`; `Organization` always stays, while `Product` and `FAQPage` now follow the visible pricing and FAQ sections from the derived homepage render model.
- Protected app routes and auth or recovery flows are intentionally marked `noindex` in `app/(workspace)/layout.tsx` and the individual utility route entrypoints.
- Rendered SEO regressions are smoke-checked in `tests/browser-smoke/app-smoke.spec.ts`.

## Intentionally Customizable

- Starter contract, module flags, workspace labels, and starter-mode defaults: `config/product.ts` and `features/starter/lib/starter-selectors.ts`
- Curriculum shape, stable lesson identity, canonical labels, and route mapping: `features/course/lesson/model/curriculum.ts`
- Lesson copy, workbench fields, and lesson-specific page behavior: `features/course/lesson/model/lessons/*.ts` and `features/course/lesson/content/build.ts`
- Landing-page copy, offer framing, media, section defaults, and CTA targets: `config/product.ts`, `features/marketing/content/home.ts`, `features/marketing/lib/home-page-render-model.ts`, `features/marketing/components/home-page.tsx`, `features/marketing/components/faq-accordion.tsx`, and `public/`
- Protected workspace UI and shell behavior: `features/course/`, `features/workspace-home/`, and the protected route group in `app/(workspace)/`
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
