# QA-Browser Auth Accounts

Use two Clerk QA accounts for browser testing in this repo:

- non-entitled: auth + `/access-required` flows
- entitled: mission + lesson flows

Canonical account definitions live in:

- `.agents/skills/QA-Browser/references/internal-test-accounts.json`

## Commands

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

`clerk:test-user:prepare:entitled` ensures the entitled Clerk user exists and grants Convex course entitlement.

## Recommended QA-Browser Flow

1. For auth/access fallback QA, use the non-entitled account.
2. For mission/lesson QA, run `pnpm run clerk:test-user:prepare:entitled` first and use the entitled account.
3. If Clerk is configured for SSO, magic link, passkey, OTP, or other non-password flows, stop and provide compatible test identity instructions.

