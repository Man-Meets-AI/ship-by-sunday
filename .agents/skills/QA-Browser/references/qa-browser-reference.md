# QA-Browser Reference

Use this reference for the standard smoke playbooks, Clerk preflight rules, severity definitions, and the required bug report format.

## Shared Test Account

The canonical shared test account lives in [internal-test-accounts.json](internal-test-accounts.json).

Use that account only for the user's own apps, this repo, or other environments the user confirms share this internal test account. Do not try it on arbitrary third-party software.

## Input Contract

Required inputs:

- environment
- base URL
- flow to test
- software name when it is not obvious from the URL or when the user provides it for clarity

Optional inputs:

- credentials override
- destructive actions allowed
- extra acceptance checks

If a required input is missing, ask before testing. If destructive actions are not explicitly allowed, treat them as disallowed.

## Safety Rules

- Default to non-destructive testing.
- Never complete live purchases, refunds, deletes, admin mutations, or irreversible submissions unless the user explicitly says the environment is safe.
- For checkout flows, inspect the shell, pricing, redirects, and cancel path before any irreversible submit.
- If a later checkpoint requires an unsafe action, stop there and mark the rest as blocked or unverified.

## Clerk-Backed Repo Preflight

Use this only for this repo or another repo the user explicitly confirms shares the same Clerk instance.

Before `auth smoke`, `protected route`, or an auth-dependent `post-purchase access` pass:

1. Inspect the sign-in surface first.
2. If password auth is clearly available, run `pnpm run clerk:test-user:check`.
3. If that returns `missing`, ask once before running `pnpm run clerk:test-user:create`.
4. If the sign-in surface is SSO-only, enterprise-domain-routed, magic-link-only, passkey-only, social-only, OTP-only, or otherwise incompatible with the shared password user, stop and ask for the correct test identity or SSO instructions.

Do not attempt Clerk provisioning on arbitrary non-repo apps unless the user explicitly says they use the same Clerk instance or supplies an equivalent admin helper.

## Evidence Rules

- Save failure screenshots in `output/playwright/qa/`.
- Capture screenshots for broken states, ambiguous states, or visual regressions worth reporting.
- Pull console or network logs only when they clarify the issue.
- Include exact URLs, route states, and redirect outcomes when they matter to reproduction.

## Playbook Selection

Choose the smallest playbook that matches the request:

- `auth smoke`: sign-in page, login flow, and logged-in landing state
- `protected route`: direct entry into an auth-gated route and post-login continuation
- `landing-to-CTA`: public page load, CTA path, and redirect behavior
- `checkout shell`: pricing, checkout load, cancel path, and safety stop before irreversible submit
- `post-purchase access`: success screen, entitlement handoff, access-required fallback, and first protected destination
- `mobile spot check`: core flow at a mobile viewport with layout and interaction checks

Do not merge playbooks unless the user explicitly asks for a broader pass.

## Standard Playbooks

### Auth Smoke

Use when the user wants sign-in verified.

Checkpoints:

- sign-in entry page loads without obvious layout breaks
- sign-in surface is inspected for password versus SSO or other non-password auth
- repo-local Clerk preflight is run when the target uses this repo's Clerk instance
- email/password fields are usable
- the canonical shared test credentials submit successfully when password auth is supported
- post-login landing state is coherent
- logout or account menu is reachable if relevant

Stop and escalate if the flow requires SSO, magic links, passkeys, OTP, MFA, or tenant setup.

### Protected Route

Use when the user wants a gated route validated.

Checkpoints:

- direct visit to the protected route behaves as expected while signed out
- auth redirect is clear and not looping
- repo-local Clerk preflight is run when the target uses this repo's Clerk instance
- sign-in succeeds with the shared account when password auth is supported
- post-login redirect returns to the intended route
- gated content loads without dead ends

### Landing-to-CTA

Use when the request is about a public funnel step.

Checkpoints:

- landing page loads on the requested viewport
- target CTA is visible and usable
- CTA leads to the intended next step
- obvious copy or layout breaks are absent on the tested path
- redirect or modal state is understandable

### Checkout Shell

Use when the user asks to verify checkout without assuming purchase completion is safe.

Checkpoints:

- signed-out and signed-in entry behavior matches expectations
- checkout route or hosted checkout loads
- price shown is coherent with the request
- guarantee, refund, or trust copy is present if expected
- cancel path works
- irreversible purchase submit is not completed unless explicitly allowed

If the environment is live or unclear, stop before final payment confirmation.

### Post-Purchase Access

Use only when the environment is safe or when access can be tested with an already entitled account.

Checkpoints:

- success or confirmation page loads
- entitlement handoff is visible or inferable
- user reaches the expected first protected destination
- access-required fallback explains next steps if access is delayed
- first action after purchase is obvious

If purchase completion is not safe and no entitled account exists, mark the entitlement-dependent checks unverified.

### Mobile Spot Check

Use when the user specifically asks for mobile QA or when the main risk is viewport behavior.

Checkpoints:

- key route loads at a mobile viewport
- primary CTA or main action remains visible and tappable
- nav, drawers, and forms remain usable
- no severe overflow, clipping, or blocked tap targets appear
- the requested flow still works end to end at mobile width

## Severity Definitions

Use this rubric unless the user gives a stricter one:

### `critical`

- blocks purchase
- blocks access
- blocks the first meaningful action after access; for Ship by Sunday this means the first lesson or first worksheet
- creates broken trust around price, promise, or delivery

### `high`

- causes major confusion in onboarding
- breaks a key CTA
- breaks layout on one major device class
- breaks a core redirect or protected-route continuation, or causes an important scoped event or state transition to become untrustworthy

### `medium`

- creates friction but not full failure
- causes copy mismatch or misleading UI state
- creates a non-critical visual or interaction bug

### `low`

- cosmetic only
- minor typo
- non-blocking polish issue

## Report Format

Return these sections in this order:

### Scope tested

- software name
- environment
- base URL
- flow tested
- viewport or device context
- whether destructive actions were allowed

### Passed checkpoints

- list only the checks you actually verified

### Findings

For each finding, include:

- severity
- title
- repro steps
- expected behavior
- actual behavior
- evidence path or note

If there are no findings, say `None`.

### Blocked / unverified

- list anything you intentionally stopped short of
- state why it was blocked or unsafe

### Evidence

- screenshots
- relevant console or network notes
- final URL or redirect notes when important

### Recommended next fixes

- one line per fix
- point to the most likely owner area when obvious

## Reporting Rules

- Do not invent defects to fill the report.
- Keep pass lists factual and short.
- Prefer one precise finding over a vague cluster.
- If the environment itself is unstable, report that as the top issue and mark downstream checks unverified.
