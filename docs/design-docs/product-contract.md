# Product contract

Ship by Sunday is blueprint-first, not course-first.

## Canonical protected flow

The guided flow is:

`Start -> Product -> Design -> Marketing -> Build Plan -> Review & Download`

Optional post-download library:

`Execute / Ship`

Current stage-entry routes:

- `/start`
- `/product`
- `/design`
- `/marketing`
- `/build-plan`
- `/review`
- `/settings`

`/product`, `/design`, `/marketing`, and `/build-plan` are stable stage-entry routes that redirect into nested blueprint pages such as `/product/foundation` and `/build-plan/validation`.

Older routes such as `/mission`, `/lesson/[lessonKey]`, and `/artifacts` are compatibility redirects, not canonical product surfaces.

## Review and download contract

`/review` exposes exactly one download artifact: `Starter Snapshot`.

That snapshot:

- expands into a single repo folder named from the product slug
- includes generated design, marketing, build, facts, and prompt materials under repo-root `docs/`
- includes starter-safe operator surfaces such as `.agents/`, app-local test docs under `apps/web/tests/`, workflow examples, and `apps/web/.env.production.example`
- does not expose separate Design, Marketing, or Build zip downloads

## Starter control plane

The starter control plane lives in `starterConfig` inside `apps/web/config/product.ts`.

Current module flags:

- `docs`
- `course`
- `starterRepo`
- `codex`
- `observability`

Current homepage control plane:

- fixed top-level section visibility under `starterConfig.homePage.sections`
- CTA behavior under `starterConfig.homePage.heroPrimaryCta` and `starterConfig.homePage.pricingPrimaryCta`
- render translation in `apps/web/features/marketing/lib/home-page-render-model.ts`

## CLI contract

The local CLI writes one draft under `.ship-by-sunday/` and generates the same starter snapshot shape as the protected `/review` flow. Treat that CLI as another intake surface for the same contract, not as a separate product.
