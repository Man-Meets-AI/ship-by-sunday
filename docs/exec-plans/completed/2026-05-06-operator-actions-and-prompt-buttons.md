---
title: Operator Actions And Prompt Buttons
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add audited Telegram support action buttons so Parker can send safe canned replies and generate operator-only drafts from Telegram.
post_build_recap: Telegram support topics now render an expanded action keyboard with audited customer-visible canned replies, operator-only draft/prompt outputs, hot-lead marking, duplicate callback protection, setup docs, codegen, and focused validation.
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-2.md
read_when:
  - Resuming the second Telegram support implementation slice.
  - Adding or changing Telegram support bot operator buttons.
  - Validating support action audit, customer-visible canned replies, or operator-only prompt buttons.
---

# Operator Actions And Prompt Buttons

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Slice 1 proved the hard loop: a homepage visitor can message Parker on the site, Convex stores the thread, Telegram receives the visitor message in a dedicated support topic, and an allowlisted operator can reply or close the thread. This slice turns that one safe callback into a reusable operator action system. After the change, Parker can tap Telegram buttons to ask for an email, ask for product context, send pricing or checkout guidance, generate draft-only operator notes, create a paste-ready Linear issue draft, generate a Codex prompt, mark a lead hot, or close the thread.

The user-visible proof is that customer-facing buttons create normal website-visible operator messages only after Parker taps them in Telegram. The operator-visible proof is that draft, summary, Codex prompt, Linear draft, and hot-lead buttons create audited operator-only output in the Telegram topic without sending AI or generated text to the visitor.

## Progress

- [x] 2026-05-06 EDT: Created this ExecPlan from `docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-2.md`.
- [x] 2026-05-06 EDT: Read root and app instructions, Convex AI guidance, homepage docs, design instructions, Program packet, plan split, dependency graph, Slice 1 implementation, and Telegram Bot API callback guidance.
- [x] 2026-05-06 EDT: Implemented support action taxonomy, callback data helpers, deterministic action output builders, and an expanded Telegram inline keyboard.
- [x] 2026-05-06 EDT: Implemented audited action handling, duplicate callback protection, customer-visible canned sends, operator-only generated output, hot-lead marking, and generalized close-thread handling.
- [x] 2026-05-06 EDT: Updated setup/operator docs with visitor-visible versus operator-only button behavior, draft-only AI/Linear boundaries, callback data limits, and Telegram callback acknowledgement notes.
- [x] 2026-05-06 EDT: Ran hosted Convex codegen and focused support validation: support operator action tests, Telegram update tests, Convex support model tests, support route/session/env/http boundary tests, docs content loader test, and homepage support widget integration UI test.
- [x] 2026-05-06 EDT: Ran `bun --cwd apps/web format:check`, `bun --cwd apps/web lint`, `bun run plans:lint`, `bun run programs:lint`, and `bun run markdown:lint` for this slice before closeout.
- [x] 2026-05-06 EDT: Repo completion gates passed: `bun run format`, `bun lint`, and `bun typecheck`.

## Surprises & Discoveries

Telegram inline keyboard `callback_data` is limited to 1 to 64 bytes, so action callback data must stay compact and deterministic. The existing `support:<supportId>:close` shape has enough space for short action slugs and can stay readable.

Hosted Convex dev still lacks the support-specific Telegram env values from Slice 1. This slice can be proven with unit tests, codegen, and local route/widget behavior, but a real Telegram tap cannot be truthfully live-proven until the documented provider setup is completed.

## Decision Log

Decision: Keep Slice 2 deterministic and operator-approved, with no AI API calls and no Linear API writes.
Rationale: Slice 3 owns AI drafting and product context, and Linear writes introduce a new provider side effect. This slice should prove the audited action framework and safe action boundaries first.
Date: 2026-05-06

Decision: Use normal operator support messages for customer-visible canned actions.
Rationale: The website widget already renders operator messages from Convex. A tapped action should create the same customer-facing shape as Parker's normal reply, with an audit record linking the callback to the generated message.
Date: 2026-05-06

Decision: Keep operator-only outputs inside `supportOperatorActions` and Telegram bot notes, not PostHog.
Rationale: Drafts, summaries, Linear drafts, and Codex prompts can contain transcript context. They belong to the support retention boundary and should not enter analytics or replay payloads.
Date: 2026-05-06

## Outcomes & Retrospective

This slice shipped the structured Telegram operator action framework. The support topic header now uses an expanded inline keyboard backed by compact `support:<supportId>:<action>` callback data. The webhook parser now returns one generic operator action update for supported callbacks, and `processTelegramSupportWebhookUpdate` applies actions through one internal mutation that validates the configured support chat, mapped topic, support id, and operator allowlist.

Customer-visible buttons now insert normal operator support messages for `ask_for_email`, `ask_for_context`, `send_pricing_link`, and `send_checkout_link`, so the website widget displays them through the existing transcript path. Operator-only buttons now generate deterministic Telegram notes for `draft_reply`, `summarize_lead`, `generate_codex_prompt`, and `create_linear_draft` without creating website-visible messages. `mark_hot_lead` records a thread-level hot lead marker. `close_thread` keeps the Slice 1 lifecycle behavior through the same generalized action path.

The action audit is richer: `supportOperatorActions` now supports source message ids, customer-visible message ids, generated output, future generated-output purge metadata, failure reasons, completion timestamps, and a callback-query id index for idempotence. Duplicate callback queries return an ignored result without repeating side effects.

The setup doc now explains the expanded button set, visitor-visible versus draft-only behavior, callback data limits, and callback acknowledgement behavior. Hosted Convex codegen and focused tests passed. Live Telegram button proof remains blocked until support-specific Convex env values are configured, matching the Slice 1 provider setup gap.

## Context and Orientation

This work builds directly on the landed support foundation in `apps/web/convex/support.ts`, `apps/web/convex/support/model.ts`, `apps/web/convex/support/telegram.ts`, `apps/web/convex/support/validators.ts`, `apps/web/convex/schema.ts`, and `apps/web/convex/http.ts`. The homepage widget reads and sends messages through `apps/web/app/api/support/messages/route.ts` and renders thread state under `apps/web/app/_components/home-page/support/`.

Telegram sends callback queries when an operator taps an inline keyboard button. The Convex HTTP action at `/telegram/support/webhook` already verifies `X-Telegram-Bot-Api-Secret-Token`, parses authenticated updates, checks the configured support chat id and operator allowlist, and handles `Close thread`. This slice should generalize that code without weakening those checks.

A support action is an audited operator-triggered event. Some actions create customer-visible support messages. Other actions create operator-only generated output that is posted back into the Telegram topic for Parker to copy, edit, or use elsewhere. Generated output must never auto-send to visitors in this slice.

### In Scope

In scope: add a typed support operator action taxonomy for `close_thread`, `ask_for_email`, `ask_for_context`, `send_pricing_link`, `send_checkout_link`, `draft_reply`, `summarize_lead`, `generate_codex_prompt`, `create_linear_draft`, and `mark_hot_lead`; build compact Telegram callback data and an expanded inline keyboard; parse callbacks into validated action types; audit each action with status, operator id, callback id, update id, source message id, generated output, customer-visible message id, and failure reason; insert website-visible operator messages for customer-facing canned sends; generate deterministic operator-only output for draft, summary, Codex prompt, and Linear draft actions; mark a thread hot; answer Telegram callback queries; update docs; and add focused tests.

### Out Of Scope

Out of scope: AI model calls, customer-visible AI auto-replies, Linear API writes, Stripe checkout session creation, uploads, protected workspace support, new public dashboards, CRM assignment, email notifications, changes to the homepage widget visual design, changes to support session cookie authority, new Telegram permissions, and automatic background retries.

## Plan of Work

First add a feature-local action definition module under `apps/web/convex/support/`. It should own action names, short callback slugs, button labels, customer-visible canned text, deterministic operator-only output builders, callback data generation, callback data parsing, and the expanded inline keyboard. Keep callback data under Telegram's 64 byte limit.

Next update validators and schema. `supportOperatorActionTypeValidator` should include every action type. `supportThreads` should gain an optional operator priority such as `leadStatus` for `mark_hot_lead`. `supportOperatorActions` should gain optional fields for `sourceMessageId`, `customerVisibleMessageId`, `generatedOutput`, `generatedOutputPurgedAt`, `failureReason`, and `completedAt`, plus an index by `telegramCallbackQueryId` so callback retries and double taps are idempotent.

Then update Telegram parsing and webhook orchestration. `parseTelegramSupportUpdate` should return one generic operator action callback for any supported action. `processTelegramSupportWebhookUpdate` should run one internal mutation that validates the mapped thread, dedupes the callback query, applies the action, and returns a callback answer plus optional operator note text. The action should answer the callback query and post operator-only result notes through Telegram best-effort, without retrying authenticated webhook updates forever if note delivery fails.

Then update support model behavior. Customer-facing actions should insert a normal operator `supportMessages` record and reset pending visitor count. Operator-only actions should write generated output only on `supportOperatorActions` and return a Telegram note. `mark_hot_lead` should patch the thread's lead status and write an audit record. `close_thread` should preserve the Slice 1 lifecycle behavior while using the generalized action path.

Finally update setup docs and tests. The docs should explain which buttons send visitor-visible text, which are draft-only, and that AI/Linear buttons are deterministic drafts until later slices. Tests should cover callback parsing, callback length, action output builders, duplicate callback handling, customer-visible message insertion semantics, and docs registration.

## Milestones

The first milestone is action taxonomy and callback parsing. Success means the action definitions are typed, every generated callback data value is under 64 bytes, Telegram callback parsing accepts supported actions, and unsupported callbacks remain ignored with 200-safe webhook behavior.

The second milestone is audited action execution. Success means callbacks are idempotent by callback query id, every action writes a support operator action record, customer-facing actions insert website-visible operator messages, operator-only actions do not insert visitor-visible messages, and `mark_hot_lead` records thread priority.

The third milestone is docs, Program writeback, and validation. Success means app docs name the expanded action set and draft-only boundaries, the Program points at this active child plan, hosted Convex codegen succeeds, focused tests pass, and broad gates are run before completion.

## Concrete Steps

Work from the main checkout:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before implementation, inspect these files:

    sed -n '1,260p' apps/web/convex/support/model.ts
    sed -n '1,260p' apps/web/convex/support/telegram.ts
    sed -n '1,260p' apps/web/convex/support/validators.ts
    sed -n '1,360p' apps/web/convex/support.ts
    sed -n '300,380p' apps/web/convex/schema.ts
    sed -n '1,220p' apps/web/content/docs/telegram-support-bot.mdx
    sed -n '1,220p' apps/web/tests/unit/support-telegram-update.test.ts
    sed -n '1,220p' apps/web/tests/unit/convex-support-model.test.ts

Add or update these files:

    apps/web/convex/support/operatorActions.ts
    apps/web/convex/support/types.ts
    apps/web/convex/support/validators.ts
    apps/web/convex/schema.ts
    apps/web/convex/support/telegram.ts
    apps/web/convex/support/model.ts
    apps/web/convex/support.ts
    apps/web/content/docs/telegram-support-bot.mdx
    apps/web/tests/unit/support-operator-actions.test.ts
    apps/web/tests/unit/support-telegram-update.test.ts
    apps/web/tests/unit/convex-support-model.test.ts
    docs/programs/active/2026-05-06-telegram-support-bot/program.md

Run hosted Convex codegen after schema/function changes:

    bun --cwd apps/web convex codegen

Run focused validation first, then broader gates:

    bun --cwd apps/web test:unit tests/unit/support-operator-actions.test.ts tests/unit/support-telegram-update.test.ts tests/unit/convex-support-model.test.ts
    bun --cwd apps/web test:unit tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts tests/unit/convex-env.test.ts tests/unit/convex-http-boundary.test.ts
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-operator-actions-and-prompt-buttons.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-06-operator-actions-and-prompt-buttons.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    git diff --check
    bun run format
    bun lint
    bun typecheck

## Validation and Acceptance

Acceptance is behavior-based. A Telegram callback for each supported action must parse only when it comes from the configured support chat, a mapped topic, and an allowlisted operator. A duplicate callback query must not perform the action twice. `ask_for_email`, `ask_for_context`, `send_pricing_link`, and `send_checkout_link` must create website-visible operator messages. `draft_reply`, `summarize_lead`, `generate_codex_prompt`, `create_linear_draft`, and `mark_hot_lead` must not create website-visible messages. `Close thread` must keep the Slice 1 closed-state behavior. No action output may be sent to PostHog.

Live Telegram proof remains conditional on support-specific Convex env setup. If those env values still do not exist, record the limitation in this plan and final summary rather than claiming a real Telegram tap worked.

### Test Commands

    bun --cwd apps/web convex codegen
    bun --cwd apps/web test:unit tests/unit/support-operator-actions.test.ts tests/unit/support-telegram-update.test.ts tests/unit/convex-support-model.test.ts
    bun --cwd apps/web test:unit tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts tests/unit/convex-env.test.ts tests/unit/convex-http-boundary.test.ts
    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-operator-actions-and-prompt-buttons.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-06-operator-actions-and-prompt-buttons.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    git diff --check
    bun run format
    bun lint
    bun typecheck

## Idempotence and Recovery

The webhook action must be safe under Telegram retries. Missing or invalid webhook secrets still return non-2xx. Authenticated unsupported callbacks return 200 ignored responses. Supported callbacks are deduped by `telegramCallbackQueryId`; if Telegram retries a callback after Convex applies it, the second attempt returns an ignored duplicate result and does not insert another message, mark another hot-lead event, or close the thread twice.

Schema additions are additive optional fields on existing support rows. Existing Slice 1 support threads and actions remain valid. If codegen fails after schema edits, fix the schema or validators before touching UI. If Telegram operator note delivery fails after an action is applied, log the provider failure and keep the webhook response 200 so Telegram does not retry a side effect that already committed.

## Artifacts and Notes

Telegram Bot API currently documents inline keyboard `callback_data` as 1 to 64 bytes and says callback queries should be answered so clients do not keep showing progress. This plan uses compact `support:<supportId>:<slug>` callback data and keeps all slugs short.

Slice 1 browser proof and repo gates already passed, but live Telegram provider proof is still blocked on missing support-specific Convex env values. Do not treat that as a code regression in this slice.

## Interfaces and Dependencies

The durable interfaces are the support tables in `apps/web/convex/schema.ts`, the support validators in `apps/web/convex/support/validators.ts`, the Telegram update parser and provider helpers in `apps/web/convex/support/telegram.ts`, the support model handlers in `apps/web/convex/support/model.ts`, and the public/internal Convex functions in `apps/web/convex/support.ts`.

External dependencies remain Telegram Bot API `sendMessage`, `answerCallbackQuery`, inline keyboard callback data, and the Slice 1 webhook setup. There are no new provider accounts, permissions, or secrets in this slice.
