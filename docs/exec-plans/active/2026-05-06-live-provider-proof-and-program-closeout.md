---
title: Live Provider Proof And Program Closeout
status: active
created_at: 2026-05-06
completed_at: null
summary: Prove the live Telegram and OpenAI support provider loop or record the exact hosted setup gap before closing the Telegram Support Bot Program.
post_build_recap: null
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-6.md
read_when:
  - Resuming live Telegram Support Bot provider proof.
  - Checking whether the Telegram Support Bot Program can be completed.
  - Investigating missing support-specific Telegram or OpenAI hosted setup.
---

# Live Provider Proof And Program Closeout

This document is a living execution plan for proving the live Telegram and OpenAI provider loop before closing the Telegram Support Bot Program.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now has a first-party support widget, Convex support state, Telegram operator actions, private OpenAI draft generation, retention maintenance, and privacy tests. The remaining question is whether the hosted provider setup is real: can a website message create a Telegram topic, can Parker reply from Telegram back into the widget, and can an AI-backed operator-only button use OpenAI without exposing generated text to visitors or analytics. This plan either captures that live proof and closes the Program, or records the exact hosted setup gap so the next operator can run the same proof without relying on chat memory.

## Progress

- [x] 2026-05-06: Created `planning-brief-6.md`, updated `current-planning-brief.txt`, and created this child ExecPlan for live provider proof and Program closeout.
- [x] 2026-05-06: Probed hosted Convex dev env variable presence without printing secret values; all required support provider values are missing or empty.
- [x] 2026-05-06: Attempted Telegram webhook verification without exposing the bot token; blocked because `TELEGRAM_SUPPORT_BOT_TOKEN` is missing or empty in hosted Convex dev.
- [x] 2026-05-07: Re-ran the hosted Convex dev env presence probe with secret values suppressed; all required support provider values are still missing or empty.
- [x] 2026-05-07: Checked local shell readiness without printing values; `TELEGRAM_SUPPORT_BOT_TOKEN` and `NEXT_PUBLIC_CONVEX_SITE_URL` are missing or empty, so Telegram `getWebhookInfo` and live support-loop proof remain blocked.
- [x] 2026-05-07: Added a presence-only readiness probe to `apps/web/content/docs/telegram-support-bot.mdx` so the next operator can verify setup without leaking provider values.
- [x] 2026-05-07: Re-ran provider readiness after bug fixes; hosted Convex dev and production both still have all required support provider values missing or empty. `apps/web/.env.local` has `NEXT_PUBLIC_CONVEX_SITE_URL`, but neither hosted Convex nor the local shell has a support bot token, so Telegram `getWebhookInfo` remains blocked.
- [x] 2026-05-07: Configured hosted Convex dev support Telegram env from the existing Worker forum bot/group using `bunx convex env set`; generated fresh support webhook and admin recovery tokens without printing values. `OPENAI_API_KEY` remains missing.
- [x] 2026-05-07: Registered the Worker forum bot webhook to the hosted Convex dev support endpoint. `getWebhookInfo` reports the support path, expected `message` and `callback_query` updates, zero pending updates, and no last error.
- [x] 2026-05-07: Exercised the live Telegram delivery loop through Convex: `support:sendVisitorMessage` created a support thread, created a Telegram forum topic, posted the visitor message, and returned `delivered_to_parker`.
- [x] 2026-05-07: Exercised the signed inbound webhook path with a Telegram-shaped operator reply; Convex recorded an operator message with `deliveryStatus: "not_required"`.
- [x] 2026-05-07: Exercised one customer-visible callback action and one AI-backed callback action. The customer-visible action inserted an operator message. The AI-backed action used deterministic fallback because `OPENAI_API_KEY` is missing, recorded `aiDraftGenerationStatus: "failed"`, `generatedOutputSource: "deterministic"`, and delivered the private Telegram operator note.
- [x] 2026-05-07: Closed the smoke support thread through the callback path and verified the thread status moved to `closed` with retention timestamps.
- [x] 2026-05-07: Verified the support operations snapshot returns metadata only and did not contain the smoke message text.
- [x] 2026-05-07: Updated the support docs and Program with the exact hosted setup blocker.
- [x] 2026-05-07: Passed plan/program/markdown linting and `git diff --check` for this proof-record slice.
- [x] 2026-05-08: Verified hosted Convex dev and production both have `OPENAI_API_KEY` present without printing values. Production support Telegram env remains missing, so production Telegram support proof is still blocked.
- [x] 2026-05-08: Re-ran the hosted Convex dev live AI draft proof on a fresh synthetic support thread. The visitor message delivered to Telegram, the signed draft callback returned `200`, the action completed with `generatedOutputSource: "openai_responses"` and model `gpt-5.4-mini-2026-03-17`, and the private Telegram operator note delivered.
- [x] 2026-05-08: Closed the synthetic OpenAI smoke thread through the signed callback path and verified closed status plus retention timestamps.

## Surprises & Discoveries

- 2026-05-06: The Program is code-complete through Slice 5, but it intentionally remains active because hosted Convex dev provider env and real Telegram/OpenAI smoke proof were not available during those slices.
- 2026-05-06: `bunx convex env get NAME` exits with status 0 even for a missing variable. The proof probe must treat non-empty stdout as the presence signal, not command success.
- 2026-05-06: The corrected hosted Convex dev probe showed `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and `OPENAI_API_KEY` are all missing or empty. Telegram `getWebhookInfo` cannot run until at least the bot token is configured.
- 2026-05-07: The repeated hosted Convex dev probe produced the same missing-or-empty result for every required support provider env name. The local shell also lacks `TELEGRAM_SUPPORT_BOT_TOKEN`, so webhook verification cannot safely call Telegram yet.
- 2026-05-07: Production Convex has the same missing-or-empty support provider env state as hosted Convex dev. `apps/web/.env.local` contains a Convex site URL, but no support bot token or OpenAI key is available locally, so no safe read-only Telegram or OpenAI provider proof can run from this checkout.
- 2026-05-07: The current Convex observability `TELEGRAM_CHAT_ID` points at a private chat, not a forum supergroup, so it cannot host support topics. The Worker Telegram config has the reusable forum bot/group: the bot has no webhook, the group is a forum supergroup, the bot is an admin, and it can manage topics and delete messages.
- 2026-05-07: Reusing the Worker forum bot required registering a webhook. This is safe only if Worker is not relying on `getUpdates` polling for the same bot while support is active, because Telegram does not support webhook delivery and polling at the same time for one bot.
- 2026-05-07: `support:sendVisitorMessage` was unavailable until `bunx convex dev --once --typecheck disable` pushed the current support functions to hosted Convex dev. After that deploy, the support function and webhook smoke passed.
- 2026-05-07: A signed inbound webhook smoke found and fixed a real argument validation bug: parsed operator-message updates included a local `kind` discriminator, but `recordOperatorReply` rejected that extra field. The fix strips parser discriminators before calling internal Convex mutations.
- 2026-05-08: Live OpenAI proof succeeded on hosted Convex dev after `OPENAI_API_KEY` was configured. Production has the OpenAI key, but production support Telegram env is still missing, so production support proof cannot run yet.

## Decision Log

Decision: Treat live provider proof as a separate closeout slice rather than folding it into operations hardening.
Rationale: The runtime code, tests, and docs already landed. The remaining risk is external setup and provider behavior, so the proof work needs a narrow plan that can complete or clearly block without changing product behavior.
Date: 2026-05-06

Decision: Probe secrets by presence only.
Rationale: The support provider values include Telegram bot tokens, webhook secrets, admin recovery tokens, OpenAI API keys, Telegram chat ids, and operator ids. The proof can establish whether values exist without printing secret values into terminal output, plans, commits, or summaries.
Date: 2026-05-06

## Outcomes & Retrospective

This plan is active. The expected finished state is either a completed Program with concise live proof evidence, or an explicit active Program blocker naming which hosted Convex env values, Telegram webhook registration, bot permissions, operator access, or OpenAI setup remain missing.

The hosted Convex dev support loop is now smoke-proven through Telegram delivery, signed operator reply ingestion, customer-visible callback actions, live OpenAI Responses draft generation, close-thread lifecycle, and metadata-only operations snapshot. The Program remains active because production support Telegram env is still missing and a human Telegram-client reply has not been manually exercised even though the signed webhook path records operator replies correctly.

## Context and Orientation

The support widget is rendered by `apps/web/app/_components/support/support-widget.tsx` and `apps/web/app/_components/support/support-widget-panel.tsx`. Homepage support enters through `apps/web/app/_components/home-page/support/home-page-support-widget.tsx`; workspace support enters through `apps/web/app/(workspace)/_components/workspace-support/workspace-support-widget.tsx`. Browser code calls `/api/support/messages`, implemented by `apps/web/app/api/support/messages/route.ts` and `apps/web/app/api/support/_server/support-message-route.ts`, so the browser never receives the raw support-session token.

Convex owns support state. Public and internal support actions live in `apps/web/convex/support.ts`; pure data rules live in `apps/web/convex/support/model.ts`; Telegram provider calls live in `apps/web/convex/support/telegram.ts`; OpenAI Responses calls live in `apps/web/convex/support/aiDrafts.ts`; admin snapshot and retry actions live in `apps/web/convex/supportAdmin.ts`; cron registration lives in `apps/web/convex/crons.ts`; schema and indexes live in `apps/web/convex/schema.ts`.

The support setup source of truth is `apps/web/content/docs/telegram-support-bot.mdx`. It names the required Convex env values, Telegram BotFather setup, private supergroup with topics, bot admin rights, webhook URL, `setWebhook.secret_token`, narrow `allowed_updates`, OpenAI key setup, manual retry, operations snapshot, and failure shapes. Do not use the observability Telegram bot variables for this support bot.

### In Scope

This plan includes provider readiness probing, Telegram webhook verification, live support-loop smoke proof when credentials and operator access are present, OpenAI-backed operator-only button proof when `OPENAI_API_KEY` is present, missing-key fallback proof only in a safe non-production environment, support docs and Program closeout updates, and focused validation for any touched docs or runtime proof helpers.

### Out Of Scope

This plan does not add new support product behavior, new Telegram buttons, automatic AI replies, account-wide transcript history, CRM or Linear mutations, uploads, CAPTCHA, automatic delivery retry scheduling, or new providers. It does not print or commit secrets. It does not mark the Program complete if the live provider loop cannot be exercised.

## Plan of Work

First, establish the hosted Convex dev provider state without exposing values. From `apps/web`, capture `bunx convex env get NAME` into a shell variable and treat the name as present only when stdout is non-empty. Convex CLI can exit successfully for missing names, so command success alone is not proof. Record only `present` or `missing_or_empty` in this plan. The required names are `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and `OPENAI_API_KEY`. Also check whether `NEXT_PUBLIC_CONVEX_SITE_URL` is available in the app environment or derive the Convex site URL from the deployment when possible.

Next, verify Telegram webhook registration when the bot token is available through the local operator environment. Use `curl` against Telegram `getWebhookInfo`, but do not echo the token. Record only safe fields: whether the configured URL ends in `/telegram/support/webhook`, whether `allowed_updates` is exactly `message` and `callback_query`, whether `pending_update_count` is zero or not growing, and whether `last_error_message` is absent. Do not paste raw Telegram chat ids or operator user ids into this plan.

Then exercise the live support loop if the environment is ready. Start or use the web app, open the homepage support widget, send a benign synthetic message that does not contain private data, confirm a Telegram topic appears with a safe `SBS-... homepage ...` title, reply from an allowlisted Telegram operator, and confirm the reply appears in the widget. Repeat the same core path from the workspace `Ask Parker` launcher if a signed-in session is available without changing account history policy.

After that, prove operator actions. Tap one customer-visible action such as `Ask email` or `Pricing` and confirm the widget receives only the canned support message. Tap one AI-backed operator-only action such as `Draft reply` or `Summary` and confirm Telegram receives a private note while the widget does not receive generated output. Inspect the relevant Convex support action metadata through safe admin tooling or dashboard UI without copying generated text into this plan.

Finally, update `apps/web/content/docs/telegram-support-bot.mdx`, `docs/programs/active/2026-05-06-telegram-support-bot/program.md`, and this ExecPlan. If live proof passes, fill the Program retrospective, move the Program folder to `docs/programs/completed/`, update active/completed Program indexes, and mark this plan complete. If proof is blocked, leave the Program active, record the exact missing setup and recovery commands, and keep this plan active with the next runnable step.

## Milestones

Milestone 1 establishes provider readiness without leaking secrets. Success means this plan records which required hosted Convex env names are present or missing, and whether webhook verification can run.

Milestone 2 proves the Telegram loop. Success means a fresh support message creates a Telegram forum topic, an allowlisted operator reply appears in the website widget, invalid setup does not cause Telegram retry storms, and the topic title/header keep safe metadata only.

Milestone 3 proves operator actions and OpenAI boundaries. Success means one customer-visible action reaches the widget, one AI-backed action stays private in Telegram and in Convex action audit metadata, generated output does not enter `supportMessages`, and the missing-key deterministic fallback is recorded if it can be tested safely.

Milestone 4 closes or preserves the Program truthfully. Success means the Program either moves to completed with proof evidence and retrospective, or remains active with a precise external setup blocker and a runnable command sequence for the next operator.

## Concrete Steps

Work from the repository root unless a command says otherwise:

    cd /Users/bazelrex/Developer/ship-by-sunday

Check hosted Convex dev env presence without printing values:

    cd apps/web
    for name in TELEGRAM_SUPPORT_BOT_TOKEN TELEGRAM_SUPPORT_CHAT_ID TELEGRAM_SUPPORT_OPERATOR_USER_IDS TELEGRAM_SUPPORT_WEBHOOK_SECRET TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN OPENAI_API_KEY; do
      value="$(bunx convex env get "$name" 2>/dev/null)"
      if [ -n "$value" ]; then
        printf "%s present\n" "$name"
      else
        printf "%s missing_or_empty\n" "$name"
      fi
    done

If the bot token is available in the local shell as `TELEGRAM_SUPPORT_BOT_TOKEN`, verify webhook state without printing the token:

    curl --fail --silent --show-error "https://api.telegram.org/bot${TELEGRAM_SUPPORT_BOT_TOKEN}/getWebhookInfo"

Read only the safe fields from that response: `url`, `allowed_updates`, `pending_update_count`, and `last_error_message`. Do not commit the raw response if it contains sensitive values.

Run the already-built support validation after any doc or proof-helper changes:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-admin.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx

Run docs and Program validation before stopping:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    git diff --check

## Validation and Acceptance

This plan is accepted as complete only if the real provider loop is proven or the blocker is recorded precisely enough for a maintainer with Telegram and OpenAI access to finish it without rediscovering the setup. Live completion requires a visitor message to create a Telegram topic, a Telegram reply to appear in the widget, `Close thread` to close the website thread, one customer-visible action to create a normal support message, one AI-backed operator-only action to stay private, and no provider proof output to leak secrets, transcript text, Telegram ids, visitor tokens, or generated output.

If hosted provider access is unavailable, this plan must remain active. In that case acceptance for the current stopping point is a clean commit or diff that updates the plan, updates the Program truth, records which readiness probes were possible, and passes plan/program/markdown lint plus `git diff --check`.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday` when touching only docs and proof records:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    git diff --check

Run these additional commands if runtime proof helpers or support code change:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-admin.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx
    bunx --cwd apps/web convex codegen
    bun run format
    bun lint
    bun typecheck

Manual live proof is required before completing the Program. The manual proof must use a benign synthetic support message and record only safe evidence such as statuses, topic-safe labels, action ids, and pass/fail outcomes.

## Idempotence and Recovery

The env-presence probe is read-only and safe to rerun. Webhook verification through `getWebhookInfo` is read-only and safe to rerun. Do not call `setWebhook` unless the URL, secret token, and target deployment are known and match the support docs. Do not unset `OPENAI_API_KEY` or other hosted env values in production to test fallback; fallback proof should happen only in a non-production deployment or by using an already-missing key state.

If a live visitor message creates a Convex message but Telegram delivery fails, use the existing operations snapshot and manual retry runbook after fixing provider setup. If a Telegram topic is created during smoke proof, close the thread through the `Close thread` button so retention timestamps are set. Do not delete audit rows to clean up proof data; use benign non-private messages and let retention handle lifecycle.

## Artifacts and Notes

The prior support implementation was committed as `d34d6cc9` with message `feat: add telegram support bot`.

The support setup and runbook live in `apps/web/content/docs/telegram-support-bot.mdx`.

Record provider readiness results here as short, secret-free lines. Use `present`, `missing`, `verified`, `blocked`, or `not attempted`; do not paste tokens, chat ids, operator ids, message bodies, generated AI output, visitor tokens, or transcript text.

Provider readiness results from 2026-05-06:

- `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- `TELEGRAM_SUPPORT_CHAT_ID`: `missing_or_empty`
- `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`: `missing_or_empty`
- `TELEGRAM_SUPPORT_WEBHOOK_SECRET`: `missing_or_empty`
- `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`: `missing_or_empty`
- `OPENAI_API_KEY`: `missing_or_empty`
- Telegram `getWebhookInfo`: `blocked`, because the hosted Convex dev bot token is missing or empty.

Provider readiness results from 2026-05-07:

- `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- `TELEGRAM_SUPPORT_CHAT_ID`: `missing_or_empty`
- `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`: `missing_or_empty`
- `TELEGRAM_SUPPORT_WEBHOOK_SECRET`: `missing_or_empty`
- `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`: `missing_or_empty`
- `OPENAI_API_KEY`: `missing_or_empty`
- Local `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- Local `NEXT_PUBLIC_CONVEX_SITE_URL`: `missing_or_empty`
- Telegram `getWebhookInfo`: `blocked`, because neither hosted Convex dev nor the local shell has a bot token available for read-only webhook verification.

Provider readiness results after bug-fix follow-up on 2026-05-07:

- Hosted Convex dev `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- Hosted Convex dev `TELEGRAM_SUPPORT_CHAT_ID`: `missing_or_empty`
- Hosted Convex dev `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`: `missing_or_empty`
- Hosted Convex dev `TELEGRAM_SUPPORT_WEBHOOK_SECRET`: `missing_or_empty`
- Hosted Convex dev `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`: `missing_or_empty`
- Hosted Convex dev `OPENAI_API_KEY`: `missing_or_empty`
- Production Convex `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- Production Convex `TELEGRAM_SUPPORT_CHAT_ID`: `missing_or_empty`
- Production Convex `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`: `missing_or_empty`
- Production Convex `TELEGRAM_SUPPORT_WEBHOOK_SECRET`: `missing_or_empty`
- Production Convex `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`: `missing_or_empty`
- Production Convex `OPENAI_API_KEY`: `missing_or_empty`
- Local shell `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- Local shell `OPENAI_API_KEY`: `missing_or_empty`
- `apps/web/.env.local` `NEXT_PUBLIC_CONVEX_SITE_URL`: `present`
- Telegram `getWebhookInfo`: `blocked`, because no support bot token is available from hosted Convex dev, production Convex, or the local shell.

Telegram setup and smoke results after Worker bot reuse on 2026-05-07:

- Hosted Convex dev `TELEGRAM_SUPPORT_BOT_TOKEN`: `present`
- Hosted Convex dev `TELEGRAM_SUPPORT_CHAT_ID`: `present`
- Hosted Convex dev `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`: `present`
- Hosted Convex dev `TELEGRAM_SUPPORT_WEBHOOK_SECRET`: `present`
- Hosted Convex dev `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`: `present`
- Hosted Convex dev `OPENAI_API_KEY`: `missing_or_empty`
- Source bot readiness: `verified` as a forum bot with topic-management and delete-message admin rights.
- Webhook registration: `verified` for `/telegram/support/webhook`, `message` plus `callback_query`, zero pending updates, and no last error.
- Visitor send smoke: `verified`; Convex returned `delivered_to_parker`.
- Signed operator reply webhook smoke: `verified`; Convex recorded an operator message.
- Customer-visible callback smoke: `verified`; Convex inserted an operator message.
- AI-backed callback fallback smoke: `verified`; missing OpenAI key produced deterministic private output and delivered the private Telegram note.
- Close-thread callback smoke: `verified`; Convex closed the thread and set retention timestamps.
- Operations snapshot privacy smoke: `verified`; snapshot contained no smoke message text.

OpenAI proof results after hosted key setup on 2026-05-08:

- Hosted Convex dev `OPENAI_API_KEY`: `present`
- Production Convex `OPENAI_API_KEY`: `present`
- Production Convex `TELEGRAM_SUPPORT_BOT_TOKEN`: `missing_or_empty`
- Visitor send smoke: `verified`; Convex returned `delivered_to_parker`.
- AI-backed callback smoke: `verified`; Convex returned `200`, created a completed draft action, recorded `generatedOutputSource: "openai_responses"`, recorded model `gpt-5.4-mini-2026-03-17`, and delivered the private Telegram operator note.
- Close-thread callback smoke: `verified`; Convex closed the synthetic smoke thread and set retention timestamps.

## Interfaces and Dependencies

This proof depends on hosted Convex dev, the Convex HTTP actions site URL, Telegram Bot API webhook delivery, a dedicated support Telegram bot, a private Telegram supergroup with topics enabled, bot admin rights for topic management and topic deletion, allowlisted Telegram operators, OpenAI API access through `OPENAI_API_KEY`, the Next support routes, and PostHog privacy boundaries already validated by the support widget tests.
