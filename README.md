# Ship by Sunday

Why its awesome

- Error pipeline to Telegram so you can paste it right to your bot
- Stripe
- SEO Best practices so u show up
- Clerk, Sign in with google
- Convex
- Shadcn, TailwindV4
- Bring your own AI integration (chatgpt)

`Ship by Sunday` is now positioned as an Agent-Ready Packs system for builders who want to turn one product idea into durable design, marketing, build, and prompt handoff packs. This repo doubles as the configurable starter base, with the public marketing site, Stripe checkout flow, protected workspace shell, optional course runtime, and the code-defined seams that let those surfaces be turned on or off without rewriting the purchase-to-access contract.

## What Lives Here

- Public marketing and pricing pages in `apps/web/app/`
- Protected product routes at `/start`, `/product`, `/design`, `/marketing`, `/build-plan`, `/review`, and `/settings`, with `/product`, `/design`, `/marketing`, and `/build-plan` acting as stable stage-entry routes that redirect into canonical nested packet pages such as `/product/foundation` and `/build-plan/validation`, while the old `/mission`, `/lesson/[lessonKey]`, and `/artifacts` routes remain compatibility redirects
- Feature-first runtime code in `apps/web/features/`, with the curriculum and lesson model centered under `apps/web/features/course/lesson/`
- Purchase-to-access handoff across Clerk, Stripe, and Convex product-access state
- Starter configuration and module flags in `apps/web/config/product.ts`

## Review Download Contract

The protected workspace ends at `/review`, and that route now exposes exactly one download artifact: `Starter Snapshot`.

That download:

- unpacks into a single repo folder named from the product slug
- includes the generated Design, Marketing, Build, facts, and prompt materials under repo-root `docs/`
- includes generalized starter-safe operator surfaces such as `.agents/`, `qa/`, workflow examples, and `apps/web/.env.production.example`
- does not expose separate Design, Marketing, or Build zip downloads anymore

## Quick Start

1. Install dependencies:

```bash
bun install
```

2. Copy the tracked env template:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Set `APP_BASE_URL` to the canonical host you want Stripe to use for checkout success and cancel redirects. The same value is also used for SEO metadata, canonical URLs, `robots.txt`, and `sitemap.xml`. For local development, keep it on `http://localhost:3000`.

If you want Google Search Console HTML-tag verification through Next metadata, set `GOOGLE_SITE_VERIFICATION` to the token value from Search Console.

3. Connect the repo to your hosted Convex dev deployment:

```bash
bun run dev:convex
```

Need a Convex account first? Create one here: [https://convex.dev/referral/PARKER6190](https://convex.dev/referral/PARKER6190)

This writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` into `apps/web/.env.local` for your per-developer hosted Convex dev deployment.

For observability and other Convex HTTP actions, the app can also use `NEXT_PUBLIC_CONVEX_SITE_URL` when the deployment exposes browser traffic on `.convex.cloud` and HTTP actions on `.convex.site`.

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
- `bun run dev:convex` keeps your hosted Convex dev deployment synced and refreshes `apps/web/.env.local` when you switch deployments
- `bun run dev:stripe` waits for hosted Convex dev values in `apps/web/.env.local`, checks the pinned Stripe CLI project `ship-by-sunday`, warns with the exact `stripe login --project-name ship-by-sunday` repair command if the CLI context drifted, then starts the listener with the app `STRIPE_SECRET_KEY`
- `bun run dev:full` runs `web + hosted Convex dev + Stripe listener` together for checkout QA

This repo does not support Convex's local backend mode as a first-class development workflow.

## Production Release Workflow

Production now ships through a two-branch workflow:

- feature work lands in feature branches and merges into `dev`
- `dev` is the shared integration branch
- release pull requests promote `dev` into `main`
- Vercel production deploys come from `main`
- Convex production deploys come from `.github/workflows/convex-production-deploy.yml` on `main`
- hotfixes branch from `main`, merge back into `main`, and then merge or cherry-pick back into `dev`

The operator runbook lives in [docs/release-workflow.md](docs/release-workflow.md).

## How This Team Works

This repository now treats QA as one shared operating system, not a scattered set of test files or one-off browser rituals.

- The source of truth lives in [qa/README.md](qa/README.md), [qa/journeys.csv](qa/journeys.csv), [qa/coverage.csv](qa/coverage.csv), and the committed reports under [qa/runs/](qa/runs/).
- The team runs `dev` first and `prod` second. Local `dev` is where auth, routing, and webhook bugs get isolated fast. Production evidence is collected only after the local path is understood.
- `default_ship` is the release-critical pack. `billing_integration` is a separate billing handoff pack so ordinary releases do not need to re-run Stripe every time.
- Production billing proof in this repo uses a restricted live `100% off` promotion code instead of a real card charge. That verifies the real webhook-to-access handoff without treating production as a card-testing surface.

The current human-readable role split lives in [qa/AGENTS.md](qa/AGENTS.md):

- `Scenario Mapper` maps diffs to scenario IDs and affected packs
- `Test Auditor` keeps the inventory and coverage map honest
- `Browser Runner` executes the actual journey checks
- `Gap Reviewer` finds missing or stale release proof
- `Release Summarizer` writes the final run report

Today those roles are documented operating responsibilities. In the future, we want to turn more of them into first-class sub-agents so different jobs can be delegated cleanly without forking the QA model or creating separate dev/prod test suites.

## Codex Integration

The optional in-app Codex account and generation routes require a runtime that can spawn the `codex` binary and persist per-user app-server state.

- Local development: enabled by default
- Vercel: disabled by default unless you explicitly set `CODEX_APP_SERVER_ENABLED=true` on a compatible runtime

## Starter Mode and Module Flags

The starter’s current control plane lives in `starterConfig` inside `apps/web/config/product.ts`.

The `starterConfig.modules` flags currently control:

- `docs`
- `course`
- `starterRepo` (legacy, off by default)
- `codex`
- `observability`

Current behavior:

- the packet-first flow now starts at `/start`, keeps `/product`, `/design`, `/marketing`, and `/build-plan` as stable stage-entry routes, and uses nested packet pages under those stage roots as the canonical protected runtime
- `/mission`, `/lesson/[lessonKey]`, and `/artifacts` now redirect into the packet-first flow instead of acting as canonical product surfaces
- when `docs` is `false`, docs links hide and `/docs` renders a disabled-state surface instead of the docs shell
- when `starterRepo` is `false`, the legacy starter-repo path disappears from the visible protected app instead of showing as a disabled module

These are code-level starter defaults, not a full in-app admin surface yet.

The public homepage now has its own starter-controlled shell:

- `starterConfig.homePage.sections` controls the fixed top-level homepage sections: `hero`, `sprintPath`, `whatsInside`, `durability`, `socialProof`, `faq`, `pricing`, and `footer`
- `starterConfig.homePage.heroPrimaryCta` and `starterConfig.homePage.pricingPrimaryCta` control whether those surfaces route through checkout or a normal link target
- `apps/web/features/marketing/lib/home-page-render-model.ts` is the single place that translates starter config plus homepage content into the render contract used by `apps/web/features/marketing/components/home-page.tsx`
- `apps/web/content/docs/configure-the-homepage.mdx` is the durable operating guide future builders and AI agents should read before changing homepage structure

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

## CLI Packet Intake

The repo now includes a local Ship by Sunday intake CLI that writes one draft under `.ship-by-sunday/`, reports readiness against the live packet stages, and generates the same starter snapshot shape as the protected `/review` flow.

Common CLI commands:

```bash
bun run sbs init --fixture complete --json
bun run sbs schema --json
bun run sbs stages --json
bun run sbs fields --stage design --json
bun run sbs next --json
bun run sbs validate --json
bun run sbs set product.product_name "Ship by Sunday CLI" --json
bun run sbs append scope_in "Packet intake" --json
bun run sbs unset build-plan.domain --json
bun run sbs mutate --file ./tmp/mutations.json --json
bun run sbs --help
bun run sbs resume
bun run sbs stage design
bun run sbs review --stage build-plan --missing-only --json
bun run sbs export --out -
bun run sbs export --out ./.ship-by-sunday/export.json
bun run sbs import --file ./tmp/sbs-cli-complete.json --json
cat ./tmp/build-plan-patch.json | bun run sbs apply --stage build-plan --file - --json
bun run sbs generate --out ./tmp/sbs-cli-repo --json
bun run sbs generate --out ./tmp/sbs-cli-repo.zip --zip --json
```

Notes:

- `init --fixture complete --json` is the fastest seed path for agents, QA, and demos.
- `schema`, `stages`, `fields`, `next`, and `validate` let agents inspect the packet contract and the next action directly from the CLI.
- `set`, `unset`, `append`, and `remove` give agents field-level draft control without writing patch files.
- `mutate --file <file|-> --json` applies a whole batch atomically from a file or stdin. If one operation is invalid, none of the batch is saved.
- `resume` auto-creates a blank local draft if one does not exist yet.
- `stage <product|design|marketing|build-plan>` revisits a specific packet stage without changing the canonical stage definitions.
- `review --stage ... --missing-only --json` lets agents ask for a smaller readiness payload instead of the full envelope.
- `export --out -`, `import --file -`, and `apply --file -` are pipe-friendly for stdin/stdout workflows.
- `generate --json` returns structured machine-readable metadata about the artifact path and repo slug. `generate --dry-run --json` returns blockers without writing files.
- `generate` requires a review-ready draft and an explicit `--out` path. Directory output creates a slugified repo folder inside the target path. `--zip` writes the same snapshot as a zip archive.

The current QA docs are split by purpose:

- local browser and checkout runbook: [apps/web/content/docs/local-qa.mdx](apps/web/content/docs/local-qa.mdx)
- QA control plane and scenario packs: [qa/README.md](qa/README.md)
- shared-branch and production release workflow: [docs/release-workflow.md](docs/release-workflow.md)

For Stripe checkout testing from your local machine against hosted Convex dev, use:

```bash
bun run dev:full
bun run stripe:listen:dev
bun run stripe:dev:doctor
bun run clerk:test-user:prepare:entitled
bun run stripe:dev:verify
QA_ALLOW_BILLING_INTEGRATION=1 PLAYWRIGHT_USE_LOCAL_SERVER=0 PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run qa:run-pack -- --pack=billing_integration
```

In this repo, local Stripe forwarding must hit `NEXT_PUBLIC_CONVEX_SITE_URL` on `.convex.site` for `/stripe/webhook`; `NEXT_PUBLIC_CONVEX_URL` stays on the `.convex.cloud` browser client origin.

`bun run stripe:dev:doctor` compares the app Stripe account from `.env.local` against the pinned Stripe CLI project `ship-by-sunday`. If the CLI project is missing or points at the wrong account, repair it with `stripe login --project-name ship-by-sunday`. `bun run clerk:test-user:prepare:entitled` is the fast single-user local helper. `bun run qa:personas:prepare -- --pack=billing_integration` remains the canonical multi-persona QA prep path.

The purchase-to-access behavior contract lives in [docs/delivery-onboarding/stack-decision.md](docs/delivery-onboarding/stack-decision.md).

## Optional Video Pipeline

The repo now has a repeatable local video workflow for lesson exports:

```bash
bun run --cwd apps/web video:cut:setup
bun run --cwd apps/web video:prepare:color
bun run --cwd apps/web video:grade
bun run --cwd apps/web video:upload:bunny
bun run --cwd apps/web video:status
```

Use it in stages:

- `video:prepare:color` cuts silence locally and runs the configured Auphonic preset, then writes handoff files into `Color Correction/`
- `video:grade` applies the current default LUT look headlessly and writes publish-ready masters into `Color Graded/`
- `video:upload:bunny` uploads only the graded masters to Bunny and writes both a JSON report and a Markdown link manifest into `apps/web/output/video-pipeline/`
- if you need to supersede an older Bunny publish, upload the corrected set as a fresh run and then delete the old Bunny video IDs from the earlier report

The durable operator guide lives in [apps/web/content/docs/video-pipeline.mdx](apps/web/content/docs/video-pipeline.mdx).

## Telegram Observability

The app now ships a self-hosted error pipeline:

- Next.js server and client failures are normalized in `apps/web/features/observability/`
- high-signal Clerk `session.revoked` webhooks are verified at `/api/observability/clerk`
- production Vercel deployment failures and cancellations are verified at `/api/observability/vercel`
- maintainers can change live incident state through `/api/observability/incidents/[incidentId]/status`
- unexpected API route failures are tagged with `x-request-id`
- events are ingested into Convex through `/observability/events`
- Convex deduplicates repeated incidents and sends alerts to Telegram while suppressing recursive `telegram_delivery` incidents

Required env values:

```bash
CLERK_WEBHOOK_SIGNING_SECRET=
OBSERVABILITY_INGEST_TOKEN=
OBSERVABILITY_INCIDENT_CONTROL_TOKEN=
OBSERVABILITY_VERCEL_WEBHOOK_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

For production deploys, also set:

```bash
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

`OBSERVABILITY_INGEST_TOKEN` is not a vendor-issued key. It is just a strong random shared secret that must match in both the Next.js runtime and the Convex runtime. Generate one with:

```bash
openssl rand -hex 32
```

`CLERK_WEBHOOK_SIGNING_SECRET` comes from the Clerk webhook endpoint configuration for `/api/observability/clerk`.

`OBSERVABILITY_INCIDENT_CONTROL_TOKEN` is a separate bearer token for the maintainer-only status route at `/api/observability/incidents/[incidentId]/status`. Do not reuse `OBSERVABILITY_INGEST_TOKEN`; incident creation and incident lifecycle mutation intentionally use different secrets.

`OBSERVABILITY_VERCEL_WEBHOOK_SECRET` comes from the Vercel webhook configuration for `/api/observability/vercel` and is used to verify the `x-vercel-signature` HMAC header on incoming deployment events.

`NEXT_PUBLIC_CONVEX_SITE_URL` should point at the matching `.convex.site` origin for the same deployment used by `NEXT_PUBLIC_CONVEX_URL` whenever the app needs Convex HTTP actions such as observability ingest or the incident-control route. The browser client URL can stay on `.convex.cloud`.

`TELEGRAM_BOT_TOKEN` comes from BotFather. `TELEGRAM_CHAT_ID` is the chat or group id the bot should post into. A simple way to fetch it is to message the bot once, then inspect:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates"
```

Use `ENABLE_OBSERVABILITY_TEST_TRIGGER=1` only in automated browser-testing environments; it enables the protected-shell fault injection used by the Playwright auth harness.

The live production smoke now proves:

- signed Clerk webhook incidents persist and deliver
- signed Vercel webhook incidents persist and deliver
- the public incident status route can `ack` a live incident and suppress repeat delivery

The only remaining unproven live path is the authenticated Codex runtime route.

## Public SEO Surface

- Root metadata defaults live in `apps/web/app/layout.tsx` and resolve absolute canonical hosts through `apps/web/platform/next/metadata-base.ts`.
- Public crawl directives are generated from `apps/web/app/robots.ts` and `apps/web/app/sitemap.ts`, with docs-backed `lastModified` hints from `apps/web/content/docs`.
- Social preview images are generated from `apps/web/app/opengraph-image.tsx` and `apps/web/app/twitter-image.tsx`.
- Docs metadata defaults and per-page canonical/OG/Twitter fields are built through `apps/web/features/docs/lib/docs-metadata.ts`.
- Homepage structured data is injected from `apps/web/app/page.tsx` via `apps/web/features/marketing/lib/home-page-structured-data.ts`; `Organization` always stays, while `Product` and `FAQPage` now follow the visible pricing and FAQ sections from the derived homepage render model.
- Protected app routes and auth or recovery flows are intentionally marked `noindex` in `apps/web/app/(workspace)/layout.tsx` and the individual utility route entrypoints.
- Rendered SEO regressions are smoke-checked in `apps/web/tests/browser-smoke/app-smoke.spec.ts`.

## Intentionally Customizable

- Starter contract, module flags, workspace labels, and starter-mode defaults: `apps/web/config/product.ts` and `apps/web/features/starter/lib/starter-selectors.ts`
- Curriculum shape, stable lesson identity, canonical labels, and route mapping: `apps/web/features/course/lesson/model/curriculum.ts`
- Lesson copy, workbench fields, and lesson-specific page behavior: `apps/web/features/course/lesson/model/lessons/*.ts` and `apps/web/features/course/lesson/content/build.ts`
- Landing-page copy, offer framing, media, section defaults, and CTA targets: `apps/web/config/product.ts`, `apps/web/features/marketing/content/home.ts`, `apps/web/features/marketing/lib/home-page-render-model.ts`, `apps/web/features/marketing/components/home-page.tsx`, `apps/web/features/marketing/components/faq-accordion.tsx`, and `apps/web/public/`
- Protected workspace UI and shell behavior: `apps/web/features/course/`, `apps/web/features/workspace-home/`, and the protected route group in `apps/web/app/(workspace)/`
- Theme tokens and visual language: `apps/web/app/globals.css`
- Purchase, product-access, and access flow: `apps/web/app/api/stripe/checkout`, `apps/web/features/checkout/`, `apps/web/features/product-access/`, `apps/web/convex/access.ts`, `apps/web/convex/http.ts`, and `apps/web/convex/course/`
- Optional starter-template and Codex-assisted build helpers: `apps/web/.env.local.example`, `apps/web/scripts/`, `apps/web/app/api/codex/*`, and `apps/web/features/codex/`

More detail: [docs/dev/customization.md](docs/dev/customization.md)

## Curriculum Kernel

The course runtime now uses one typed curriculum kernel in [curriculum.ts](/Users/parkerrex/Projects/manmeetsai-workspace/apps/web/features/course/lesson/model/curriculum.ts).

- `lessonKey` is the stable internal identity used for routing, navigation, and persisted progress.
- `displayLabel` is the canonical student-facing label shown across mission, lesson, and rail surfaces.
- `routeSegment` is the stable URL slug for `/lesson/[lessonKey]`.
- `videoAssetId` is the lesson-owned link to published lesson media.

Lesson modules still own lesson-specific content and workbench definitions, but they no longer act as the source of truth for sequence, rail numbering, or route identity.

## Docs

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Release workflow: [docs/release-workflow.md](docs/release-workflow.md)
- Architecture: [docs/dev/architecture.md](docs/dev/architecture.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

If you are new to the repo, start with `README.md`, then `CONTRIBUTING.md`, then `docs/release-workflow.md` if you are operating shared branches or production. The public builder docs live at `/docs` and are backed by `apps/web/content/docs`.
