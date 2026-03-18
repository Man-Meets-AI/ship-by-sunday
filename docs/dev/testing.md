# Testing Guide

Use this page as the obvious entry point for local verification in this repo.

## Quick Matrix

### Fast code checks

Use these for normal implementation work:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:unit
pnpm run test:smoke
```

For the full repo gate:

```bash
pnpm run check
```

Note: `pnpm run check` includes `format:check`, so it will fail if there is unrelated Prettier debt elsewhere in the tree.

### Browser QA with shared auth accounts

For route-level and product-flow QA, use the shared Clerk test users documented in [qa-browser-auth.md](qa-browser-auth.md).

Non-entitled account:

```bash
pnpm run clerk:test-user:check
pnpm run clerk:test-user:create
```

Entitled account:

```bash
pnpm run clerk:test-user:check:entitled
pnpm run clerk:test-user:create:entitled
pnpm run clerk:test-user:prepare:entitled
```

Use:

- non-entitled account for sign-in, `/access-required`, wrong-account, and pre-purchase checks
- entitled account for `/mission`, `/lesson/[lessonId]`, `/artifacts`, `/settings`, and post-access checks

### Local Stripe checkout QA

Before testing a real local checkout handoff:

```bash
pnpm run stripe:listen:local
```

That command:

- starts Stripe forwarding to `http://localhost:3000/api/stripe/webhook`
- prints a fresh webhook signing secret
- syncs the same secret into `.env.local`
- syncs the same secret into the active Convex env

If the listener updates the secret and the app was already running, restart `pnpm run dev:web` or `pnpm run dev` before testing payment completion.

Health checks:

```bash
pnpm run stripe:local:doctor
pnpm run stripe:local:verify
```

## Recommended Local QA Flows

### Protected-route smoke

1. Visit `/mission` or `/settings` while signed out.
2. Confirm redirect into `/sign-in`.
3. Sign in with the non-entitled account.
4. Confirm the app routes to `/access-required` instead of protected content.

### Non-entitled access flow

1. Sign in with the non-entitled account.
2. Visit `/access-required`.
3. Confirm the page explains that the account has no active entitlement.
4. Confirm `Buy access now` opens Stripe Checkout.
5. Confirm unpaid checkout returns show the right `/checkout/success` state.

### Entitled access flow

1. Run `pnpm run clerk:test-user:prepare:entitled`.
2. Sign in with the entitled account.
3. Confirm `/mission` loads.
4. Confirm at least one protected lesson route loads.
5. Confirm `/settings` and `/artifacts` are reachable.

### Full paid local handoff

Use only in local or another clearly safe test environment.

1. Start the app and local Convex.
2. Start `pnpm run stripe:listen:local`.
3. Sign in with the non-entitled account.
4. Start checkout from the app.
5. Complete payment with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC, and ZIP `10001`.
6. Confirm Stripe redirects to `/checkout/success?session_id=...`.
7. Confirm the webhook grants entitlement.
8. Confirm the app redirects into `/mission`.
9. Optionally run:

```bash
pnpm run stripe:local:verify -- --session-id <checkout-session-id>
```

### Starter repo access QA

Use this after an entitled user reaches `/mission` or `/settings`.

1. Sign in with the entitled account.
2. Save a GitHub username in the starter repo access card.
3. Run:

```bash
pnpm run starter-repo:pending
pnpm run starter-repo:invite
```

4. Accept the GitHub invite on that GitHub account.
5. Run:

```bash
pnpm run starter-repo:sync
```

6. Confirm `/mission` hides the onboarding card once access is accepted.
7. Confirm `/settings` shows the accepted state and `Open starter repo`.
8. Confirm Build lesson `3.1` now enables `Use template` and `Open template`.

If the wrong GitHub username was invited, reset the record and cancel the stale invite manually in GitHub:

```bash
pnpm run starter-repo:reset -- --clerkUserId <clerk-user-id>
```

## Change-Specific Guidance

- Auth, route protection, or Clerk changes:
  - run `pnpm run check`
  - browser-test signed-out, non-entitled, and entitled paths

- Checkout, success page, webhook, or entitlement changes:
  - run `pnpm run check`
  - run the Stripe listener flow
  - verify unpaid and paid checkout-success states

- Starter repo access or Build template-path changes:
  - run the focused starter repo unit tests
  - run `pnpm run starter-repo:pending`
  - run the invite and sync script flow with an entitled test account
  - verify `3.1` keeps the template path disabled until access is accepted

- Lesson-shell or workbench changes:
  - run `pnpm run typecheck`
  - run focused unit/smoke tests for the touched lesson/runtime area
  - browser-test one affected lesson with a real signed-in account

## Source Docs

- [qa-browser-auth.md](qa-browser-auth.md)
- [architecture.md](architecture.md)
- [../delivery-onboarding/stack-decision.md](../delivery-onboarding/stack-decision.md)
