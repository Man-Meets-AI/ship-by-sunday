---
name: QA-Browser
description: Run focused interactive browser QA against a supplied app URL and return a structured bug report. Use when the user asks to QA a flow, smoke test staging, test sign-in, check onboarding, verify checkout, validate protected routes, or inspect a buyer or student journey in a real browser.
---

# QA-Browser

Use this skill to run a bounded browser QA pass against a specific product and environment.

This is a workspace-local skill. It uses [references/qa-browser-reference.md](references/qa-browser-reference.md) for the QA workflow and [references/internal-test-accounts.json](references/internal-test-accounts.json) for the canonical shared test account.

## Required Inputs

Collect these before testing:

- environment
- base URL
- flow to test
- software name when the user provides it or when it cannot be inferred from the URL

Optional inputs:

- credentials override
- destructive actions allowed
- extra acceptance checks

If a required input is missing, ask once before opening the browser.

## Default Stance

- Default to non-destructive testing.
- Do not complete live purchases, refunds, destructive admin actions, or irreversible submissions unless the user explicitly says the environment is safe for that.
- Use Codex's existing browser automation. Do not build Playwright test files unless the user explicitly asks for tests.
- Run the smallest relevant playbook instead of wandering through the product.
- Use the shared test login from the canonical JSON account file only for the user's own products, this repo, or other environments the user confirms share that account. Otherwise ask for an override.
- Save screenshots for failures and ambiguous states under `output/playwright/qa/`.
- Pull console or network evidence only when it helps explain a defect.
- Do not invent findings. If a check passes cleanly, mark it passed. If it cannot be verified safely, mark it blocked or unverified.

## Read Order

1. Read the user's request and extract the required inputs.
2. Read the relevant sections of [references/qa-browser-reference.md](references/qa-browser-reference.md).
3. If the target is this repo and the flow touches the buyer journey, read [docs/internal/analytics-qa/plan.md](../../../docs/internal/analytics-qa/plan.md) for the current route and severity language.
4. If the flow needs auth on this repo, read the Clerk-backed preflight section in the QA reference and use the repo-local helper commands before entering credentials.
5. Run the smallest matching playbook with the browser tools already available in Codex.
6. Return the structured bug report from the reference file.

## Use This Skill For

- "QA this flow"
- "smoke test staging"
- "test sign-in"
- "check onboarding"
- "verify checkout"
- "validate this protected route"
- "test the buyer journey"
- "check this app on mobile"

## Do Not Use This Skill For

- generating Playwright spec files when the user only asked for an interactive QA pass
- broad exploratory product research with no clear flow or checkpoint
- security testing, load testing, or API-only validation
- completing real purchases or other irreversible actions without explicit approval

## Default Workflow

1. Confirm scope.
   - environment
   - base URL
   - target flow
   - software name if needed for clarity
   - whether destructive actions are allowed
2. Choose the smallest matching playbook from the reference file.
3. Open the base URL and validate the entry state.
4. If the playbook needs auth, inspect the sign-in surface first.
5. If the sign-in surface clearly supports password auth and the target is this repo or another explicitly confirmed repo on the same Clerk instance, run `pnpm run clerk:test-user:check`.
6. If that check returns `missing`, ask once before running `pnpm run clerk:test-user:create`.
7. If the requested flow requires entitlement (mission/lesson/protected product checks), run `pnpm run clerk:test-user:prepare:entitled` and sign in with the entitled QA account from the canonical JSON file.
8. If the sign-in surface is SSO-only, magic-link-only, passkey-only, social-only, OTP-only, or otherwise not compatible with the shared password user, stop and ask for the correct test identity or SSO instructions.
9. Sign in only after preflight is satisfied.
10. Execute the defined checkpoints without expanding scope.
11. Capture only the evidence needed to explain failures.
12. Return a structured bug report with passes, findings, blocked checks, evidence, and recommended next fixes.

## Escalation Rules

- If the app uses SSO, enterprise-domain routing, passkeys, magic links, social-only sign-in, OTP-only auth, MFA, or other non-password auth that the shared account cannot complete, stop and ask for the missing requirement.
- If the flow requires a purchase to continue and the environment is not clearly safe, stop before the irreversible step and mark the remaining checks unverified.
- If the product exposes multiple environments from the same URL, state which one you actually tested.
- For arbitrary non-repo apps, do not run the repo-local Clerk helper unless the user explicitly confirms the app uses the same Clerk instance.

## Output Contract

Always return:

1. `Scope tested`
2. `Passed checkpoints`
3. `Findings`
4. `Blocked / unverified`
5. `Evidence`
6. `Recommended next fixes`

Keep the report short and concrete. Findings should include severity, repro steps, expected behavior, and actual behavior.
