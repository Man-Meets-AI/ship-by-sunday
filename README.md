# Ship by Sunday

`Ship by Sunday` is a Next.js + Clerk + Convex + Stripe app for selling and delivering the course product.

## Stack

- Next.js app router for marketing and product routes
- Clerk for auth and route protection
- Convex for entitlements, lesson state, uploads, and mission progress
- Stripe for checkout and webhook-driven access grants

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the env template and fill in local values:

```bash
cp .env.local.example .env.local
```

3. Start the app and Convex together:

```bash
pnpm run dev
```

If you only need one side:

```bash
pnpm run dev:web
pnpm run dev:convex
```

## Local Stripe testing

Local checkout success depends on Stripe webhook delivery into the same local Next app and the same webhook secret being present in both `.env.local` and the active Convex env.

1. Start the app on `localhost:3000`.
2. Start local Convex dev.
3. Start Stripe forwarding against the same Stripe account as `STRIPE_SECRET_KEY`:

```bash
pnpm run stripe:listen:local
```

That command starts `stripe listen`, detects the fresh webhook signing secret, updates `.env.local`, and syncs the same value into Convex env automatically.

4. Run the local doctor before a fresh buyer-flow pass:

```bash
pnpm run stripe:local:doctor
```

5. If you already have a listener secret and only need to sync it manually:

```bash
pnpm run stripe:webhook:sync -- --secret whsec_...
```

6. Verify Convex picked it up:

```bash
node --env-file=.env.local ./node_modules/convex/bin/main.js env list
```

Use `localhost:3000` consistently during local buyer-flow testing. Mixing `127.0.0.1` and `localhost` makes auth and webhook debugging harder.

After a sandbox checkout completes, verify the real handoff deterministically:

```bash
pnpm run stripe:local:verify
```

You can also target a specific session:

```bash
pnpm run stripe:local:verify -- --session-id cs_test_...
```

## Useful commands

```bash
pnpm run typecheck
pnpm run lint
pnpm run format:check
pnpm run test:unit
pnpm run test:smoke
pnpm run build
pnpm run check
```

## Architecture

- Public marketing lives in `app/`
- Protected product routes are `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and `/access-required`
- Shared course-domain logic lives in `lib/course/`
- Manual lesson definitions and student-facing lesson content live in `lib/course/lessons/`
- Lesson pages resolve static lesson definitions locally from `lib/course`
- Convex functions live in `convex/`
- Convex stores dynamic course state only: entitlements, progress, uploads, and hydrated lesson draft data

The buyer path is:

1. Landing page CTA
2. Clerk sign-in if needed
3. Stripe checkout
4. Stripe webhook grants entitlement in Convex
5. Success page redirects the buyer into `Mission`

More detail: [docs/dev/architecture.md](docs/dev/architecture.md)

Convex workflow: [docs/dev/convex-sop.md](docs/dev/convex-sop.md)

## Safe-change checklist

Before merging changes that touch auth, lesson state, checkout, or access:

1. Run `pnpm run check`
2. Confirm the protected routes still gate correctly
3. Confirm lesson content still resolves for all lessons
4. Confirm checkout success and access-required fallbacks still render
