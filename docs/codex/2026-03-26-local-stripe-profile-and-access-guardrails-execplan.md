---
summary: "ExecPlan for pinning the local Stripe CLI context and hardening paid-access guardrails so local billing and protected-route QA are deterministic. It addresses profile drift, entitlement bootstrap reliability, and clearer signed-in account recovery messaging on access-required surfaces."
read_when: "Open this when local Stripe, Clerk, or access guardrail behavior is ambiguous or developers are getting stuck on `/access-required`."
plan_status: "done"
---

# Pin Local Stripe CLI Context and Harden Paid-Access Guardrails

This document is a living execution plan for removing the local-development failure mode where Ship by Sunday silently uses the wrong Stripe CLI account or the wrong signed-in Clerk user, then leaves the developer staring at `/access-required` without enough context to know whether the problem is billing, auth, or entitlements.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

After this change, a developer can start the local buyer-flow environment and know that the local Stripe guardrail checks are speaking about the same named Stripe CLI project for this repository, that the repo-root QA entitlement bootstrap actually grants product access on the active hosted Convex dev deployment, that the canonical local billing QA pack includes the right preflight steps, and that the app makes the current signed-in account obvious when access is missing. The human-visible win is that local checkout and protected-route QA become deterministic: the app continues to run from `.env.local` Stripe secrets, the Stripe CLI profile becomes a guardrail instead of a hidden machine-global dependency, the QA control plane records the same preflight logic the docs teach, and the recovery UI explains which Clerk account is signed in before the developer guesses at webhook drift.

## Progress

- [x] 2026-03-26 09:31 EDT — Read `AGENTS.md`, `apps/web/AGENTS.md`, `docs/codex/PLANS.md`, and `docs/prompts/execplan-writer.md`, then inspected the real local Stripe, Clerk, Convex, product-access, and QA helper code paths before drafting this plan.
- [x] 2026-03-26 09:35 EDT — Confirmed the current failure shape from the repository and live commands: `auth:dev:doctor` passes, `stripe:dev:verify` passes against `Glaucous Swing`, the known entitled QA user has a granted `productAccessGrants` row, and the remaining risks are project-global Stripe CLI config drift plus weak developer-facing clues when the signed-in user is not the entitled one.
- [x] 2026-03-26 09:58 EDT — Completed the grill pass using `docs/prompts/execplan-grill.md`. Resolved the source-of-truth split between `.env.local` and Stripe CLI profiles, locked the QA control-plane scope, chose warning-versus-failure behavior for local billing guardrails, chose interactive profile repair, kept the fast local helper and QA persona prep as separate workflows with a shared entitlement-grant implementation, and kept checkout-success identity hints out of scope.
- [x] 2026-03-26 10:13 EDT — Completed Milestone 1 by adding `apps/web/scripts/lib/stripe-cli-project.mjs`, pinning `local-stripe-doctor.mjs` to the `ship-by-sunday` Stripe CLI project, and validating that `bun run stripe:dev:doctor` now reports `Stripe CLI project ship-by-sunday` instead of reading the machine-global default profile slot.
- [x] 2026-03-26 10:20 EDT — Completed Milestone 2 by teaching the Stripe profile helper to emit missing-versus-mismatch repair guidance, adding non-blocking Stripe guardrail logging to `dev-stripe-listen-ready.mjs`, moving Convex product-access grants into `apps/web/scripts/lib/convex-product-access-grant.mjs`, and validating the shared helper through `clerk:test-user:prepare:entitled`, `qa:personas:prepare -- --pack=billing_integration`, focused unit tests, and a live `dev:stripe` startup transcript.
- [x] 2026-03-26 10:23 EDT — Completed Milestone 3 by adding a signed-in account identity hint to the access-required status panel for signed-in recovery states, keeping the view model text-driven with a new `signedInAccountHint` field, and validating the behavior with focused unit and integration-ui coverage for signed-in versus signed-out viewers.
- [x] 2026-03-26 10:29 EDT — Completed Milestone 4 by teaching the local `billing_integration` pack to record `stripe:dev:doctor` as a warning-only preflight and `stripe:dev:verify` as the hard local handoff proof, updating the README plus local QA and troubleshooting docs to teach the pinned `ship-by-sunday` profile and account-debug order, recording the shipped change in `todo.md`, and re-running the broader format, unit, integration-ui, and build checks.

## Surprises & Discoveries

The repository already proves that the Stripe webhook path itself can work. Running `bun run stripe:dev:verify` from the repository root against the active hosted Convex dev deployment returned a completed Stripe session with `productAccess.source === "stripe_webhook"` and `status === "granted"`. The unstable part was not the app’s billing code. The unstable part was local operator context.

The Stripe CLI risk is specifically machine-global configuration drift. The local app uses `STRIPE_SECRET_KEY` from `apps/web/.env.local`, but the Stripe CLI keeps its active project in `~/.config/stripe/config.toml` under a single `project-name` entry. Before the manual local repair, `stripe config --list` showed the global default profile as `storyblast`, while `bun run stripe:dev:doctor` showed the app itself was using `Glaucous Swing (acct_1T9QdGELhKLJkXlW)`. That mismatch is exactly the kind of state drift the project should not tolerate silently.

The local Stripe listener is already env-driven, not profile-driven. `apps/web/scripts/local-stripe-webhook.mjs` runs `stripe listen` with `--api-key process.env.STRIPE_SECRET_KEY`, so the pinned Stripe CLI profile is a guardrail and operator-quality improvement, not the underlying runtime source of truth for webhook forwarding. The plan must preserve that distinction so it does not falsely block working billing flows only because the local guardrail profile is noisy.

`local-stripe-doctor.mjs` still treats the local web server as part of its health contract. The new pinned-profile check passed immediately during implementation, but `bun run stripe:dev:doctor` still exits non-zero until something is listening on `localhost:3000`. For script-only validation, a temporary local server is enough to prove the Stripe and Convex checks, but the plan should keep treating the web-app reachability check as an independent prerequisite rather than a Stripe regression.

The repo-root entitlement helper had its own bug. `apps/web/scripts/ensure-clerk-entitled-test-user.mjs` was shelling out with `bunx exec convex ...` from the repository root, but `convex` is installed under `apps/web`, so the helper could fail even when the active hosted Convex dev deployment was healthy. That bug has already been observed and repaired during investigation, and the plan must preserve that working path rather than assuming it was never broken.

The access-required surface currently explains several entitlement states but does not tell the developer which email address is actually signed in. The repository already has a low-risk pattern for rendering the current user identity in `apps/web/features/settings/components/settings-account-card.tsx` via `useUser()`. That pattern should be reused instead of inventing a separate account-debug mechanism.

The repository’s QA system already owns the heavy browser and billing proof. `qa/README.md`, `qa/AGENTS.md`, `qa/scripts/run-pack.mjs`, and the green baseline `qa/runs/2026-03-25-dev-billing-integration-rerun.md` establish that `billing_integration` is the canonical local billing proof pack. This plan must therefore not invent a parallel billing runbook. It should strengthen the existing QA control plane by feeding it better local preflight checks and clearer local recovery guidance.

There are two entitlement bootstrap paths in the repository today. `bun run clerk:test-user:prepare:entitled` is a fast app-level helper for one known entitled user. `bun run qa:personas:prepare` is the canonical multi-persona QA setup path. They should remain separate workflows, but the brittle Convex entitlement-grant step should be shared so one bug cannot break one path while the other keeps working.

The live `dev:stripe` startup path now has a clear place for local Stripe guidance before the listener begins forwarding. After the hosted Convex dev context is detected, `dev-stripe-listen-ready.mjs` can read `.env.local`, compare the pinned Stripe CLI project against the app Stripe account, print either a healthy match or a warning with the exact `stripe login --project-name ship-by-sunday` repair step, and then continue into the env-driven listener path.

The access-required surface was already split into a shell, status panel, path cards, and action footer. That meant the signed-in account hint did not need a new global auth-debug panel or a card-level prop explosion. The smallest valid slice was to keep the wording in `access-required-view-model.ts`, let the client-only `AccessRequiredStatusPanel` read Clerk with `useUser()`, and render the active email once above the recovery cards.

The repo-level formatter currently includes `apps/web/tests/e2e/.auth/*.json`. After the billing and persona checks rewrote those auth-state files, `bun run format:check` failed until those JSON fixtures were reformatted. That is not a blocker now, but it means local authenticated QA can dirty the tree in a way the repo-wide formatter still enforces.

Evidence from the live repo inspection that motivated this plan:

    $ bun run stripe:dev:doctor
    - PASS Stripe account: Glaucous Swing (acct_1T9QdGELhKLJkXlW)
    - FAIL Stripe CLI default account: Story Blast (acct_1TBLwIEL60bcsWK2)

    $ bun run stripe:dev:verify
    - PASS Stripe session complete: status=complete, payment_status=paid
    - PASS Convex product access granted: status=granted
    - PASS Product access source: source=stripe_webhook

    $ bun run clerk:test-user:check:entitled
    {
      "status": "exists",
      "email": "test-entitled@test.com",
      "clerkUserId": "user_3AtkmAfsh5boruDVmfHICGz7JcI"
    }

## Decision Log

Decision: Treat the Stripe CLI profile name as repository-owned configuration even though Stripe stores it in the user’s home directory.
Rationale: The app already treats hosted Convex dev deployment values as repo-driven local state in `.env.local`. The same principle should apply to Stripe CLI context. The repository cannot own `~/.config/stripe/config.toml`, but it can own the expected profile name and force every script-owned Stripe CLI invocation to use that profile explicitly.
Date/Author: 2026-03-26 / Codex

Decision: Use a single shared Stripe CLI profile name such as `ship-by-sunday` and pass it with `--project-name` in script-owned Stripe CLI calls rather than depending on the machine-global default project.
Rationale: This removes the hidden dependency on whichever Stripe account the developer last used for unrelated work on the same machine. It also makes the doctor output and local operator behavior consistent without mutating unrelated Stripe profiles.
Date/Author: 2026-03-26 / Codex

Decision: Treat `STRIPE_SECRET_KEY` from `apps/web/.env.local` as the only runtime source of truth for local Stripe behavior. The pinned Stripe CLI profile is a guardrail and operator-quality improvement, not a second runtime authority.
Rationale: The real listener path already uses `--api-key process.env.STRIPE_SECRET_KEY`. Keeping that contract explicit prevents the plan from over-weighting machine-global Stripe CLI state and turning a working billing flow into a false failure.
Date/Author: 2026-03-26 / Codex

Decision: Keep the app-side Stripe account check and the CLI-side profile check as separate validations.
Rationale: The app’s `STRIPE_SECRET_KEY` can be correct while the CLI profile is wrong, or vice versa. The project needs both checks so it can distinguish “the app is pointing at the wrong Stripe account” from “the local Stripe CLI guardrail is pointing at the wrong project.”
Date/Author: 2026-03-26 / Codex

Decision: Repair a missing or wrong pinned Stripe CLI profile through an explicit interactive operator step, not by silently writing `~/.config/stripe/config.toml` from repository scripts.
Rationale: The profile lives in the user’s home directory and is not repository-owned state. The safest repair path is exact guidance such as `stripe login --project-name ship-by-sunday`, while the doctor continues to compare that profile against the app’s `STRIPE_SECRET_KEY`.
Date/Author: 2026-03-26 / Codex

Decision: `bun run dev:stripe` and `bun run dev:full` should warn loudly, not hard-fail, when the pinned Stripe CLI profile is missing or mismatched. Hard failure remains reserved for true runtime prerequisites such as missing app secrets or missing hosted Convex dev deployment values.
Rationale: The billing flow can still work when the local guardrail profile is noisy because the listener uses the app API key directly. Warning preserves momentum while still surfacing degraded local environment quality.
Date/Author: 2026-03-26 / Codex

Decision: Update the QA control plane narrowly rather than redesigning it. `qa/README.md`, `qa/AGENTS.md`, and the local/dev `billing_integration` runner behavior should absorb the new guardrails, but this work does not add new packs, personas, or scenario IDs.
Rationale: The repository explicitly declares `qa/` as the canonical QA operating system. The right move is to strengthen that system’s local billing guidance, not create a second QA model.
Date/Author: 2026-03-26 / Codex

Decision: Keep both entitlement bootstrap entrypoints and document their roles clearly. `clerk:test-user:prepare:entitled` remains the fast single-user local debug helper. `qa:personas:prepare` remains the canonical QA pack/persona provisioning path.
Rationale: Both are useful, but they solve different operator jobs. The problem is unclear boundaries, not the mere existence of two commands.
Date/Author: 2026-03-26 / Codex

Decision: Consolidate the Convex entitlement-grant implementation behind one shared helper used by both the app-level helper and the QA control-plane provisioning path.
Rationale: The same `bunx convex run access:grantProductAccess` flow currently exists twice, and one copy already drifted into a broken state. Sharing that logic is the smallest way to reduce future breakage without merging the workflows.
Date/Author: 2026-03-26 / Codex

Decision: Implement the shared Convex entitlement grant with a direct `process.execPath` plus `apps/web/node_modules/convex/bin/main.js` invocation instead of `bunx convex`.
Rationale: The broken behavior came from depending on the repository-root shell environment to resolve `convex`. Calling the app-local Convex binary with an explicit `cwd`, `env`, and JSON payload keeps both helper entrypoints deterministic from the repo root and from the QA control plane.
Date/Author: 2026-03-26 / Codex

Decision: Add focused unit tests for the Stripe CLI profile helper and doctor mismatch parsing, while keeping the heavier browser and billing proof in the existing QA control plane.
Rationale: The brittle part of this work is the script and guardrail logic. Focused unit tests protect that logic without rebuilding the QA pack system inside app-level tests.
Date/Author: 2026-03-26 / Codex

Decision: Show the active signed-in email on access-recovery surfaces in all environments for signed-in recovery states. This is normal recovery UX, not a local-only debug affordance.
Rationale: The wrong-account problem is a real user and QA issue, not only a local developer issue. A small identity line is low-risk and high-leverage because the user is already authenticated.
Date/Author: 2026-03-26 / Codex

Decision: Render the signed-in email once in the status panel instead of repeating it inside each recovery card.
Rationale: The page-level problem is “which account is active right now,” not “which card is selected.” A single status-panel identity line keeps the view model text-driven, keeps the actions component focused on buttons, and avoids duplicating the same email above both recovery cards.
Date/Author: 2026-03-26 / Codex

Decision: Keep checkout-success identity hints out of scope for this slice.
Rationale: The immediate confusion that triggered this plan came from `/access-required`, and adding identity hints to `/checkout/success` would widen both the UI scope and the checkout session data contract. It should be revisited only if confusion remains after the access-required and QA/script guardrails land.
Date/Author: 2026-03-26 / Codex

Decision: When the local/dev `billing_integration` pack runs the Stripe doctor, a pinned-profile mismatch should be recorded as a warning in the pack output rather than failing the pack outright, as long as the billing handoff and `stripe:dev:verify` still pass.
Rationale: The pack’s primary purpose is proving the user journey. The Stripe profile mismatch is important local drift, but it should not override a successful env-driven billing proof.
Date/Author: 2026-03-26 / Codex

Decision: Limit the pack-owned Stripe doctor and `stripe:dev:verify` steps to localhost-style `billing_integration` targets.
Rationale: Those scripts are explicitly local-dev helpers that rely on the local app, local Stripe test workflow, and `.env.local` assumptions. Localhost target detection keeps the QA control plane truthful without pretending the same helper commands are the right proof for hosted or production billing runs.
Date/Author: 2026-03-26 / Codex

## Outcomes & Retrospective

Local Stripe CLI drift is now a first-class repo guardrail instead of a hidden machine-global dependency. The doctor and `dev:stripe` startup path both talk about the same pinned `ship-by-sunday` profile, the repair guidance is explicit, and the live Stripe listener still remains env-driven through `STRIPE_SECRET_KEY`.

The entitlement bootstrap split is now clean instead of duplicated. `clerk:test-user:prepare:entitled` remains the fastest one-user local helper, `qa:personas:prepare` remains the canonical multi-persona pack-prep path, and both now rely on the same direct Convex grant helper from `apps/web/scripts/lib/convex-product-access-grant.mjs`.

The access-required surface now answers the first debugging question directly for signed-in recovery states by showing the active email before the recovery cards. That is the smallest shipped UX change in this plan, but it removes a large amount of confusion because the wrong-account case no longer looks identical to a Stripe or Convex failure.

The local `billing_integration` pack is now more truthful than the previous manual runbook. It records the Stripe doctor as a warning-only preflight on localhost targets, keeps the real pass/fail weight on the browser billing journey and `stripe:dev:verify`, and the durable docs now teach the same workflow the scripts enforce.

## Context and Orientation

This plan touches four connected systems. The first system is local Stripe command orchestration in `apps/web/scripts/local-stripe-webhook.mjs`, `apps/web/scripts/dev-stripe-listen-ready.mjs`, `apps/web/scripts/local-stripe-doctor.mjs`, and `apps/web/scripts/verify-local-stripe-checkout.mjs`. These files define how the repository starts the Stripe listener, checks the local Stripe account, and verifies that a completed local checkout created a `productAccessGrants` row in Convex. The key contract discovered during the grill is that the listener itself is env-driven through `STRIPE_SECRET_KEY`, while the pinned Stripe CLI profile is only a local guardrail.

The second system is app-level QA account and entitlement setup in `apps/web/scripts/ensure-clerk-test-user.mjs` and `apps/web/scripts/ensure-clerk-entitled-test-user.mjs`. The first script creates or checks Clerk QA users based on `.agents/skills/QA-Browser/references/internal-test-accounts.json`. The second script builds on that by granting Convex product access for the entitled user on the active hosted Convex dev deployment. The `bun run clerk:test-user:*` commands in the root `package.json` delegate into these scripts through `apps/web/package.json`.

The third system is the QA control plane in `qa/README.md`, `qa/AGENTS.md`, `qa/scripts/run-pack.mjs`, and `qa/scripts/personas.mjs`. This system already owns the canonical `default_ship` and `billing_integration` flows. `qa:personas:prepare` is the correct multi-persona setup path for packs, and the local `billing_integration` pack is the correct place to run local billing proof. The plan must improve this control plane narrowly, not replace it.

The fourth system is the product-access recovery path that the user sees in the browser. `apps/web/features/product-access/server/product-access.ts` computes the server-side access state from Clerk plus Convex. `apps/web/features/product-access/components/access-required-page.tsx`, `apps/web/features/product-access/components/access-required-content.tsx`, `apps/web/features/product-access/components/access-required-actions.tsx`, and `apps/web/features/product-access/lib/access-required-view-model.ts` render the signed-out, token-missing, no-access, pending, revoked, and refunded states. The current settings account card in `apps/web/features/settings/components/settings-account-card.tsx` is the best example of how this repository displays the active Clerk identity without inventing custom auth plumbing. Checkout-success recovery exists in a separate surface, but it is intentionally out of scope for this slice.

For this plan, “Stripe CLI profile” means the named project entry in `~/.config/stripe/config.toml` that the local `stripe` command reads. “Pinned profile” means the repository always passes the same profile name to Stripe CLI commands that depend on profile state, rather than trusting the machine-global default. “Entitled QA user” means the known Clerk test user that should already have a granted `productAccessGrants` record in Convex so protected routes such as `/start` and `/settings` can load. “Product access grant” means the row in `productAccessGrants` returned by `apps/web/convex/access.ts` and enforced by `requireGrantedProductAccess` in `apps/web/convex/access/model.ts`.

The durable docs that must stay aligned are `README.md`, `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/troubleshooting/local-dev-issues.mdx`, `apps/web/content/docs/troubleshooting/stripe-convex.mdx`, `apps/web/content/docs/troubleshooting/access.mdx`, `apps/web/content/docs/commands.mdx`, `qa/README.md`, and `qa/AGENTS.md`. The recent-work tracker in `todo.md` must record the shipped result once implementation is complete.

## Plan of Work

The implementation should proceed by first removing the global-default Stripe CLI dependency from the scripts, because every other local guardrail becomes more trustworthy once all Stripe-related diagnostics are talking about the same named project. That work should centralize the expected Stripe CLI profile name in one script-local helper module, then thread it through the doctor and any other script-owned Stripe CLI calls that depend on profile state. The plan must still treat `STRIPE_SECRET_KEY` as the actual runtime source of truth for the listener.

Once the profile is pinned, the next step is to tighten the doctors and helper scripts around observable operator mistakes. The Stripe doctor should explain whether the named profile is missing, whether it exists but points at the wrong account, and how to repair it without guessing. The repair path should be explicit operator guidance such as `stripe login --project-name ship-by-sunday`, not silent mutation of Stripe CLI config. `dev:stripe` and `dev:full` should warn loudly when the guardrail profile is wrong, but they should reserve hard failure for true runtime prerequisites. In parallel, the entitled-user helper and the QA persona-prep path should share one Convex entitlement-grant implementation and keep working from the repository root.

After the tooling layer is stable, the implementation should improve the in-app recovery story. The access-required surface should show which Clerk email is currently signed in for every signed-in recovery state where account mismatch is a realistic explanation. That small addition matters because developers and QA operators often blame Stripe or Convex when the real issue is simply that the browser is signed into the wrong Clerk user. This identity hint should be part of the normal recovery UX in every environment, not a local-only debug banner.

The final step is to align the durable docs, QA control plane, and command expectations. The README, local QA docs, and QA control-plane docs should stop speaking about “the Stripe listener” in abstract terms and instead define the exact profile name, the exact doctor commands, the distinction between the fast local app helper and the canonical QA persona-prep path, and the exact repair steps when a developer hits `/access-required` unexpectedly during local paid-flow work. The local/dev `billing_integration` pack should incorporate the Stripe guardrail checks in a way that records warnings without incorrectly failing a billing run that still proves the real user journey.

## Milestones

### Milestone 1: Pin a repository-owned Stripe CLI profile as a local guardrail, not as the runtime authority

At the end of this milestone, the repository no longer relies on the machine-global Stripe CLI default project for local diagnostics and operator guidance. The implementation should add a small helper in `apps/web/scripts/lib/`, for example `apps/web/scripts/lib/stripe-cli-project.mjs`, that exports the expected profile name, likely `ship-by-sunday`, plus helper functions for invoking Stripe CLI commands with `--project-name`. `apps/web/scripts/local-stripe-doctor.mjs` and any other script that reads Stripe CLI project state should use that helper instead of calling bare `stripe ...`. `apps/web/scripts/local-stripe-webhook.mjs` must continue to use `STRIPE_SECRET_KEY` as the runtime source of truth for the listener. The doctor output must compare the pinned profile’s account id to the account behind `STRIPE_SECRET_KEY`, not the machine-global default profile.

Success means that `bun run stripe:dev:doctor` reports the pinned profile name and can pass even if the developer’s machine-global Stripe CLI default project is unrelated, and that the listener still uses the same account the app uses through `STRIPE_SECRET_KEY`. Validation should include one focused run of `bun run stripe:dev:doctor` after intentionally setting a conflicting global default project while keeping the repo’s pinned profile correct.

### Milestone 2: Harden local doctor and entitlement bootstrap commands so they emit exact repair guidance and share one grant implementation

At the end of this milestone, the local doctor layer explains operator repair steps in repo language, and the entitled QA bootstrap paths work from the repository root every time. `apps/web/scripts/local-stripe-doctor.mjs` should distinguish at least three states: missing pinned profile, wrong pinned profile account id, and healthy pinned profile. The repair guidance should tell the operator exactly how to repair the profile interactively, for example with `stripe login --project-name ship-by-sunday`. `apps/web/scripts/dev-stripe-listen-ready.mjs` should surface the doctor mismatch as a loud warning without turning it into a false hard failure when the actual listener prerequisites are healthy. `apps/web/scripts/ensure-clerk-entitled-test-user.mjs` and `qa/scripts/personas.mjs` must share one Convex entitlement-grant helper so both the fast app helper and the QA control plane stay in sync.

Success means that a fresh developer can run `bun run clerk:test-user:prepare:entitled` and receive a successful “entitled user is ready” result from the repository root, and that a broken Stripe profile produces a precise warning or failure message that tells them exactly which profile name to log in to or repair. Validation should include focused unit coverage for the Stripe doctor’s parsing logic, the new shared entitlement-grant helper, and the existing helper-script tests in `apps/web/tests/unit/ensure-clerk-test-user.test.ts`.

### Milestone 3: Make the current signed-in Clerk account explicit on the access-recovery surfaces

At the end of this milestone, the access-recovery UI no longer makes the developer or end user guess which Clerk account is active. `apps/web/features/product-access/components/access-required-content.tsx`, `apps/web/features/product-access/components/access-required-actions.tsx`, and `apps/web/features/product-access/lib/access-required-view-model.ts` should be extended so the signed-in recovery states can render the active user’s primary email address and a short explanation that the wrong signed-in user is a first-class reason for `no_access`, `token_missing`, `pending`, `revoked`, or `refunded` outcomes. Reuse the pattern already present in `apps/web/features/settings/components/settings-account-card.tsx` by relying on `useUser()` in a client component rather than inventing a second auth source. Do not widen this milestone to change the checkout-success recovery surface.

Success means that a developer or end user who is signed into the wrong account can see the wrong email directly on the access-required screen before touching Stripe or Convex. Validation should include focused integration-ui coverage proving that the active email renders in a signed-in access-recovery state and does not render while signed out.

### Milestone 4: Update the durable docs, QA control plane, and recent-work log so the guardrail remains discoverable

At the end of this milestone, the README, the local troubleshooting docs, and the QA control-plane docs tell the truth about how Stripe CLI context works for this repository. `README.md`, `apps/web/content/docs/local-qa.mdx`, `apps/web/content/docs/troubleshooting/local-dev-issues.mdx`, `apps/web/content/docs/troubleshooting/stripe-convex.mdx`, `apps/web/content/docs/troubleshooting/access.mdx`, `apps/web/content/docs/commands.mdx`, `qa/README.md`, and `qa/AGENTS.md` should define the pinned Stripe CLI profile name, the exact doctor commands, the difference between the fast local app helper and the canonical QA persona-prep path, and the fastest diagnosis order for “I hit `/access-required` even though I thought this user paid.” `qa/scripts/run-pack.mjs` should add the Stripe guardrail checks to local/dev `billing_integration` runs in a way that records a pinned-profile mismatch as a warning rather than failing a billing run that still proves the user journey. `todo.md` must receive a timestamped recent-work entry once the implementation and validation are complete.

Success means a newcomer can read the repo docs and understand that Stripe CLI context is project-pinned but env-guardrail-only, that `clerk:test-user:prepare:entitled` is the fastest happy-path setup for one local entitled debug user, that `qa:personas:prepare` remains the canonical multi-persona QA setup, and that a visible signed-in email on `/access-required` usually answers the first debugging question. Validation should include a final human read of the updated docs, a local/dev `billing_integration` dry run or run-pack proof as appropriate, and the normal repo checks for the touched Markdown and script files.

## Concrete Steps

Work from the repository root unless a step says otherwise.

Start by creating the new ExecPlan branch note in `Progress`, then inspect the exact local Stripe and QA helper scripts before editing them:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ sed -n '1,260p' apps/web/scripts/local-stripe-webhook.mjs
    $ sed -n '1,260p' apps/web/scripts/local-stripe-doctor.mjs
    $ sed -n '1,220p' apps/web/scripts/dev-stripe-listen-ready.mjs
    $ sed -n '1,220p' apps/web/scripts/verify-local-stripe-checkout.mjs
    $ sed -n '1,240p' apps/web/scripts/ensure-clerk-entitled-test-user.mjs
    $ sed -n '1,240p' qa/scripts/personas.mjs
    $ sed -n '1,260p' qa/scripts/run-pack.mjs

Milestone 1 should begin by adding one new helper under `apps/web/scripts/lib/`, for example `apps/web/scripts/lib/stripe-cli-project.mjs`, that exports the expected profile name and a tiny wrapper for Stripe CLI argument construction. After that helper exists, update every script that depends on Stripe CLI project state so it uses `--project-name <pinned-profile>`. Keep the app-side Stripe account read based on `STRIPE_SECRET_KEY`; do not replace that with profile-based config. The first expected proof is that `bun run stripe:dev:doctor` prints the pinned profile name even if the machine-global default project is unrelated.

Milestone 2 should refine error messages, share the Convex entitlement-grant implementation, and ensure both entitlement entrypoints are explicitly safe to rerun. Use focused tests from `apps/web` while editing scripts:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace/apps/web
    $ bunx vitest run tests/unit/ensure-clerk-test-user.test.ts

Add focused unit tests for the new Stripe CLI profile helper and doctor mismatch parsing rather than trying to fully mock the listener process tree. If the script layer still shells out to `convex` or `stripe`, prefer wrappers that pass exact `cwd`, `env`, and argument lists rather than open-ended string commands. Any repair guidance printed by the scripts should name the repo’s pinned Stripe profile and the exact operator repair command, such as `stripe login --project-name ship-by-sunday`.

Milestone 3 should add the signed-in email to the access-required UI using feature-local components only. Reuse the display shape from `apps/web/features/settings/components/settings-account-card.tsx`. Avoid overloading the access view model with raw Clerk objects. Instead, keep the view model text-driven and let the client component pull `user?.primaryEmailAddress?.emailAddress` for signed-in states that need it. The expected proof is that the rendered access-required screen includes a small account identity line such as “Signed in as test-entitled@test.com” before the action buttons in all environments for signed-in recovery states.

Milestone 4 should update the durable docs and QA control-plane files from the repository root:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ sed -n '1,220p' README.md
    $ sed -n '1,220p' apps/web/content/docs/local-qa.mdx
    $ sed -n '1,220p' apps/web/content/docs/troubleshooting/local-dev-issues.mdx
    $ sed -n '1,220p' apps/web/content/docs/troubleshooting/stripe-convex.mdx
    $ sed -n '1,220p' apps/web/content/docs/troubleshooting/access.mdx
    $ sed -n '1,220p' apps/web/content/docs/commands.mdx
    $ sed -n '1,220p' qa/README.md
    $ sed -n '1,220p' qa/AGENTS.md

When implementation is complete, run the focused checks first, then the broader ones that prove the repo still builds:

    $ cd /Users/parkerrex/Projects/manmeetsai-workspace
    $ bun run stripe:dev:doctor
    $ bun run clerk:test-user:prepare:entitled
    $ bun run stripe:dev:verify
    $ bun run qa:run-pack -- --pack=billing_integration --dry-run
    $ bun run format:check
    $ bun run test:unit
    $ bun run test:integration:ui
    $ bun run build

The expected successful transcript is that `stripe:dev:doctor` reports the pinned profile and either a PASS summary or a loud local guardrail warning with exact repair steps, `clerk:test-user:prepare:entitled` reports `status: "ok"` and a patched or inserted grant, `stripe:dev:verify` shows `productAccess.source: "stripe_webhook"`, the local/dev `billing_integration` pack can surface a profile mismatch as a warning rather than as a false pack failure, and the broader format, test, and build commands pass without regressions.

## Validation and Acceptance

Acceptance is behavior-based.

The first acceptance criterion is that local Stripe CLI context is no longer ambiguous. A developer can keep unrelated Stripe profiles on the same machine and still run this repository’s local billing commands without changing their global default project. `bun run stripe:dev:doctor` must report the repo’s pinned profile name and compare that profile’s account id to the app’s `STRIPE_SECRET_KEY` account id, while the listener itself continues to run from the env-driven app secret rather than from the local Stripe CLI profile.

The second acceptance criterion is that the repository’s local entitlement bootstrap is trustworthy and non-duplicative. Running `bun run clerk:test-user:prepare:entitled` from the repository root must either create or reuse the entitled Clerk QA user and must patch or insert a granted Convex product-access row on the active hosted Convex dev deployment. `bun run qa:personas:prepare -- --pack=billing_integration` must be able to do the same through the QA control plane using the same shared grant implementation. Both commands must be safe to rerun.

The third acceptance criterion is that the browser makes the signed-in account obvious when access is missing. In any signed-in access-recovery state where account mismatch is plausible, the page must display the active Clerk email address. A developer or end user who is signed into the wrong user should be able to diagnose that from the page itself without reading Convex logs.

The fourth acceptance criterion is that the durable docs and QA control plane teach the same workflow the scripts enforce. The docs must define the pinned Stripe profile name, the doctor commands, the interactive repair step, and the difference between “signed in” and “entitled” in local QA terms. They must also explain that `clerk:test-user:prepare:entitled` is the fast local debug helper, while `qa:personas:prepare` remains the canonical multi-persona QA path. The docs must explain that a wrong signed-in Clerk user can look like a Stripe or Convex problem until the current email is inspected.

The fifth acceptance criterion is that the normal repository checks still pass for the touched surfaces. At minimum, the final implementation should leave `bun run format:check`, `bun run test:unit`, `bun run test:integration:ui`, and `bun run build` passing, plus the local operator commands `bun run stripe:dev:doctor`, `bun run clerk:test-user:prepare:entitled`, `bun run stripe:dev:verify`, and a local/dev `billing_integration` pack proof that records guardrail warnings without masking a passing billing journey.

## Idempotence and Recovery

This work should be safe to rerun repeatedly because local developer environments drift often. Stripe profile pinning must not delete or overwrite unrelated profiles from `~/.config/stripe/config.toml`; it should only require that one named profile exist and be valid. If the profile is missing, the scripts should fail or warn with an exact repair step such as `stripe login --project-name ship-by-sunday`. If the profile exists but points at the wrong account, the scripts should name both the expected account and the actual account so the developer can repair the correct entry. `dev:stripe` and the local/dev `billing_integration` pack should treat this as degraded environment quality unless the actual billing proof also fails.

The entitled QA-user helper and the QA control-plane persona-prep path must remain idempotent. If the Clerk user already exists, each workflow should reuse it. If the Convex access grant already exists, the shared grant helper should patch it rather than failing. If the helper cannot reach the active hosted Convex dev deployment, it should say so explicitly and point the operator at `bun run dev:convex`.

The access-required UI change should be additive and low risk. If rendering the signed-in email creates an unexpected hydration or loading problem, the implementer should keep the existing action model intact, back out only the new identity subcomponent, and leave the script, QA, and doc guardrails in place. Checkout-success identity hints are explicitly out of scope for this slice and should not be introduced opportunistically during implementation.

## Artifacts and Notes

Useful evidence already gathered during planning:

    $ stripe config --list
    [ship-by-sunday]
      account_id=acct_1T9QdGELhKLJkXlW
      display_name=Glaucous Swing

    $ bun run stripe:dev:doctor
    Summary: PASS

    $ bun run clerk:test-user:prepare:entitled
    {
      "status": "ok",
      "email": "test-entitled@test.com",
      "grantOutput": "{\n  \"granted\": \"patched\"\n}"
    }

    $ bun run stripe:dev:verify
    - PASS Product access source: source=stripe_webhook

Evidence gathered during implementation:

    $ bun run stripe:dev:doctor
    - PASS Stripe CLI project ship-by-sunday: Glaucous Swing (acct_1T9QdGELhKLJkXlW)

    $ stripe config --list
    [ship-by-sunday]
      display_name=Glaucous Swing

    $ bun run clerk:test-user:prepare:entitled
    {
      "status": "ok",
      "email": "test-entitled@test.com",
      "grantOutput": "{\n  \"granted\": \"patched\"\n}"
    }

    $ bun run qa:personas:prepare -- --pack=billing_integration
    {
      "pack": "billing_integration",
      "personas": [
        {
          "personaId": "member_with_access",
          "status": "exists",
          "message": "Entitled persona is ready."
        }
      ]
    }

    $ bun run --cwd apps/web dev:stripe
    [dev:stripe] Stripe CLI project ship-by-sunday matches Glaucous Swing (acct_1T9QdGELhKLJkXlW)

    $ cd apps/web && bunx vitest run tests/unit/access-required-page.test.tsx tests/integration-ui/access-required-page.test.tsx tests/integration-ui/access-required-page.interactions.test.tsx
    Test Files  3 passed (3)
    Tests  14 passed (14)

    $ bun run qa:run-pack -- --pack=billing_integration --dry-run
    {
      "steps": [
        {
          "label": "Run the local Stripe guardrail doctor",
          "failureMode": "warning"
        },
        {
          "label": "Verify the local Stripe-to-Convex handoff",
          "failureMode": "error"
        }
      ]
    }

    $ bun run format:check
    All matched files use the correct format.

    $ bun run test:unit
    Test Files  86 passed (86)

    $ bun run test:integration:ui
    Test Files  15 passed (15)

    $ bun run build
    ✓ Compiled successfully

Key repository files for the implementation:

    apps/web/scripts/local-stripe-webhook.mjs
    apps/web/scripts/local-stripe-doctor.mjs
    apps/web/scripts/dev-stripe-listen-ready.mjs
    apps/web/scripts/verify-local-stripe-checkout.mjs
    apps/web/scripts/ensure-clerk-entitled-test-user.mjs
    apps/web/scripts/lib/
    qa/scripts/run-pack.mjs
    qa/scripts/personas.mjs
    apps/web/features/product-access/components/access-required-page.tsx
    apps/web/features/product-access/components/access-required-content.tsx
    apps/web/features/product-access/components/access-required-actions.tsx
    apps/web/features/product-access/lib/access-required-view-model.ts
    apps/web/features/settings/components/settings-account-card.tsx
    apps/web/content/docs/local-qa.mdx
    apps/web/content/docs/troubleshooting/local-dev-issues.mdx
    apps/web/content/docs/troubleshooting/stripe-convex.mdx
    apps/web/content/docs/troubleshooting/access.mdx
    apps/web/content/docs/commands.mdx
    qa/README.md
    qa/AGENTS.md
    README.md

## Interfaces and Dependencies

The implementation must preserve Bun-based command entrypoints from the repository root. Root `package.json` commands such as `bun run dev:stripe`, `bun run dev:full`, `bun run stripe:dev:doctor`, `bun run stripe:dev:verify`, `bun run clerk:test-user:prepare:entitled`, and `bun run qa:run-pack -- --pack=billing_integration` are part of the operator contract and must continue to work from `/Users/parkerrex/Projects/manmeetsai-workspace`.

The Stripe CLI integration must keep using the local `stripe` binary on PATH, but every script-owned Stripe CLI invocation that depends on profile state must pass the same pinned `--project-name` value. The repository should own this value in one script-local module so future commands cannot drift by hard-coding profile names in multiple files. The local Stripe profile is a guardrail, not the runtime billing authority.

The app-side Stripe account summary must continue to come from `STRIPE_SECRET_KEY` via the Stripe Node SDK, as it does today in `apps/web/scripts/local-stripe-doctor.mjs` and `apps/web/scripts/local-stripe-webhook.mjs`. This is required so the project can compare “what the app will charge” against “what the CLI listener will forward.”

The Convex access contract must remain unchanged: `apps/web/convex/access.ts` and `apps/web/convex/access/model.ts` continue to treat a granted `productAccessGrants` row as the source of truth for protected-route access. The plan does not introduce a second entitlement source.

The app-level entitled-user helper and the QA control-plane persona-prep path must share one entitlement-grant helper rather than maintaining two independent `bunx convex run access:grantProductAccess` implementations. The most likely home is an app-side script helper under `apps/web/scripts/lib/` that `qa/scripts/personas.mjs` imports, mirroring the existing QA import of `ensure-clerk-test-user.mjs`.

The UI account-display change must use Clerk client APIs that are already present in the repo, specifically `useUser()` from `@clerk/nextjs`, and should remain feature-local to `apps/web/features/product-access/`. Do not move this into a global shared auth-debug utility unless a second feature genuinely needs it, and do not expand this slice to modify the checkout-success recovery surface.
