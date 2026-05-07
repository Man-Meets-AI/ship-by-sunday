---
title: Operations, Analytics, And Hardening
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Add support retention maintenance, bounded retry rules, admin failure snapshots, metadata-only analytics proof, and operator documentation for the Telegram support bot.
post_build_recap: Added Convex retention cron maintenance, transcript/generated-output purge, Telegram topic cleanup status, bounded manual retry eligibility, token-protected operations snapshots, metadata-only support analytics proof, and runbook docs.
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-5.md
read_when:
  - Resuming Telegram Support Bot Slice 5.
  - Changing support retention, retry, operations snapshot, or support analytics behavior.
  - Validating production-readiness work for the Telegram support bot.
---

# Operations, Analytics, And Hardening

This document is the completed execution plan for the Telegram support operations hardening slice.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The support bridge is useful only if Parker can operate it safely after launch. Visitors can already message from the homepage and workspace, Parker can reply in Telegram, structured operator buttons are audited, and AI output stays private. This slice closes the production-confidence gap by adding automated retention maintenance, bounded manual retry rules, a token-protected operations snapshot, analytics proof that no transcript text leaves the widget, and a runbook for real provider verification and recovery.

## Progress

- [x] 2026-05-06: Read the Program contract, ExecPlan contract, Telegram Support Bot Program, plan split recommendation, Slice 4 plan, app instructions, Convex guidance, release workflow, and current support backend/widget/tests before writing this plan.
- [x] 2026-05-06: Created `planning-brief-5.md`, updated `current-planning-brief.txt`, and created this child ExecPlan for Slice 5.
- [x] 2026-05-06: Added Convex support retention maintenance, six-hour cron registration, Telegram forum-topic cleanup attempts, and cleanup status audit fields.
- [x] 2026-05-06: Added explicit manual retry eligibility and a token-protected support operations snapshot that returns bounded metadata without transcript bodies or generated output.
- [x] 2026-05-06: Hardened support widget PostHog events to include safe lifecycle metadata only and expanded homepage/workspace integration-ui assertions so typed support text is not captured.
- [x] 2026-05-06: Updated the Telegram support bot runbook with retention, snapshot, retry, cleanup failure, and analytics privacy operations.
- [x] 2026-05-06: Validation passed: focused support unit tests, support widget integration-ui tests, hosted Convex codegen, plan/program/markdown lint, `bun run format`, `bun run format:check`, `bun lint`, `bun typecheck`, and `git diff --check`.

## Surprises & Discoveries

- 2026-05-06: The schema already has `idleCloseAfter`, `retainUntil`, `purgeAfter`, `bodyPurgedAt`, and `generatedOutputPurgedAt`, but there is no worker that actually closes idle threads or purges transcript bodies.
- 2026-05-06: Manual visitor-message recovery exists in `apps/web/convex/supportAdmin.ts`, but retry eligibility currently only checks `delivery_failed` and a present body. It needs explicit policy for closed threads, purged bodies, content rejection, and attempt limits.
- 2026-05-06: Support widget PostHog events are already metadata-only in practice, but the tests only assert the successful send event. This slice should prove all support analytics calls avoid message text and tokens.

## Decision Log

Decision: Use a Convex cron plus internal maintenance functions for retention.
Rationale: Retention is backend-owned customer data lifecycle work. Convex already owns support state and has indexed `status` plus timestamp fields for idle close and purge eligibility.
Date: 2026-05-06

Decision: Keep retries manual and token-protected in this slice.
Rationale: Automatic delivery retries can duplicate Telegram messages if a provider call succeeds but the marking mutation fails. The current safer milestone is to make manual retry eligibility explicit and observable before adding scheduling.
Date: 2026-05-06

Decision: Ship an admin operations snapshot, not a new dashboard UI.
Rationale: A full UI would widen the slice into admin product work. A token-protected Convex action that returns bounded metadata gives Parker the operational signal needed for recovery while keeping transcript bodies and AI output private.
Date: 2026-05-06

Decision: Support analytics may include page path and status metadata, but never transcript content.
Rationale: The Program already allows lifecycle metadata. Message bodies, emails, Telegram ids, visitor tokens, generated output, and rendered transcript text remain outside PostHog.
Date: 2026-05-06

## Outcomes & Retrospective

This plan is complete. The support bridge now has hosted Convex retention maintenance that closes idle anonymous threads, purges closed transcript bodies and operator-only generated output after the retention window, and records Telegram topic cleanup success or failure. Manual retry is bounded by explicit eligibility rules and claims a failed message as `sending` before Telegram I/O so duplicate recovery commands are rejected. Maintainers can inspect a token-protected operations snapshot that returns metadata only. Support widget analytics now include useful lifecycle metadata while tests prove typed support text is not sent to PostHog.

The remaining Program-level blocker is live provider proof. The code and runbook are ready, but the real Telegram/OpenAI loop still requires the documented support-specific Convex env values, bot permissions, webhook registration, and `OPENAI_API_KEY` in the target hosted environment.

## Context and Orientation

Support state lives in `apps/web/convex/schema.ts`. `supportVisitors` stores the HttpOnly support-session token hash and optional Clerk id. `supportThreads` stores the generated support id, status, Telegram topic ids, idle close timestamp, and closed-retention timestamps. `supportMessages` stores visitor and operator messages plus Telegram delivery metadata. `supportOperatorActions` stores button actions and operator-only generated output.

The main support backend entry is `apps/web/convex/support.ts`, which exposes public widget reads/sends, internal Telegram webhook functions, private AI draft generation, and manual retry helpers. Pure model logic lives in `apps/web/convex/support/model.ts`; Telegram provider helpers live in `apps/web/convex/support/telegram.ts`; support admin actions live in `apps/web/convex/supportAdmin.ts`.

The client widget sends analytics from `apps/web/app/_components/support/use-support-chat.ts`. Homepage and workspace wrappers pass different surfaces and entry surfaces, but the same hook owns open, close, send, refresh, and fallback events. Transcript DOM is rendered by `apps/web/app/_components/support/support-widget-panel.tsx`, where the message log must keep `data-ph-no-capture="true"` plus `ph-no-capture ph-sensitive`, and the textarea must keep `data-ph-mask="true"` plus `ph-mask ph-sensitive`.

Convex cron jobs belong in `apps/web/convex/crons.ts` and must use `cronJobs()` with `crons.interval` or `crons.cron`. Cron functions should call internal function references through `internal` from `./_generated/api`. Do not use Convex local mode.

### In Scope

This plan includes Convex retention maintenance for idle anonymous thread closure, closed transcript purge, generated-output purge, Telegram forum-topic cleanup attempts, explicit retry eligibility, a token-protected operations snapshot action, metadata-only support analytics improvements, focused tests, and documentation/runbook updates.

### Out Of Scope

This plan does not add a dashboard UI, CRM workflow, Linear writes, account-wide support history, automatic workspace context summaries, CAPTCHA, uploads, automatic delivery retry scheduling, automatic customer-visible AI replies, Telegram Business migration, or live provider mutation beyond the existing Telegram support bot calls needed for retention cleanup. It also does not claim the real Telegram/OpenAI loop is live-proven without the documented provider env setup.

## Plan of Work

First, update `apps/web/convex/support/telegram.ts` with a narrow `deleteTelegramSupportTopic` provider helper that calls Telegram `deleteForumTopic` for a known support topic id. Keep error classification through the existing `createSupportDeliveryFailure` path where possible.

Next, update `apps/web/convex/schema.ts`, `apps/web/convex/support/validators.ts`, `apps/web/convex/support/model.ts`, and `apps/web/convex/support.ts` so retention maintenance can close idle anonymous open threads, purge message bodies and generated output for expired closed threads, mark topic cleanup status, and return bounded metadata about what happened. Add indexes only where the maintenance query or snapshot would otherwise scan too broadly.

Then update `apps/web/convex/supportAdmin.ts` so maintainers can call a token-protected operations snapshot and so manual retry uses the new eligibility policy. The snapshot should return counts or bounded metadata for failed visitor deliveries, failed operator note deliveries, pending retention cleanup, and recent cleanup failures, without transcript bodies or generated output.

After that, add `apps/web/convex/crons.ts` to run support retention maintenance on an interval. The cron should call an internal action that combines mutation-owned database work with Telegram cleanup I/O.

Then update `apps/web/app/_components/support/use-support-chat.ts` and focused widget tests so every support analytics event includes safe metadata and test coverage proves message text is never sent to PostHog. Keep replay masking attributes intact.

Finally, update `apps/web/content/docs/telegram-support-bot.mdx` and this plan with the operational runbook: what the cron does, how to inspect the operations snapshot, how manual retry eligibility works, how to verify provider setup, and what failure looks like.

## Milestones

Milestone 1 adds the backend retention worker. Success means a focused model test can close an idle anonymous thread, purge expired closed transcript bodies and generated operator output, and record Telegram topic cleanup success or failure without deleting audit rows.

Milestone 2 adds explicit operational controls. Success means support admin tests prove invalid tokens are rejected, closed or purged messages cannot be retried, content-rejected messages are not retried, retry-attempt limits are enforced, and the operations snapshot returns bounded metadata only.

Milestone 3 hardens analytics privacy. Success means homepage and workspace support widget tests assert PostHog events include lifecycle metadata but never include the typed support message or transcript text.

Milestone 4 records and validates the slice. Success means the docs describe retention, retry, snapshot, and live provider proof; the Program points at the next truthful state; and focused tests plus repo gates pass.

## Concrete Steps

Work from the repository root:

    cd /Users/bazelrex/Developer/ship-by-sunday

Inspect the current support surfaces:

    rg -n "support|retention|retry|PostHog|deliveryStatus|purgeAfter" apps/web/convex apps/web/app/_components/support apps/web/tests apps/web/content/docs/telegram-support-bot.mdx

After implementation, run the focused support tests:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx

Before finishing, run every command in `Validation and Acceptance`.

## Validation and Acceptance

The slice is accepted when idle anonymous support threads can be closed by backend maintenance, expired closed transcripts no longer expose message bodies or generated operator output, Telegram topic cleanup status is recorded, manual retry cannot operate on unsupported failed messages, maintainers have a token-protected metadata snapshot, and support analytics tests prove transcript content is not sent to PostHog.

Provider setup is accepted only as documented readiness unless the actual Convex support env and OpenAI key are configured and a real Telegram/OpenAI smoke is run. If that smoke is unavailable, record the limitation rather than claiming production proof.

### Test Commands

Run these commands from `/Users/bazelrex/Developer/ship-by-sunday`:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx
    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    bun run format
    bun lint
    bun typecheck
    git diff --check

## Idempotence and Recovery

The retention worker must be safe to rerun. Closing an already closed thread should be ignored. Purging an already purged message body or generated output should not change retained audit metadata. Telegram topic cleanup should record failure reason and remain visible for manual repair if provider permissions are missing.

Manual retry should remain explicit. If retry eligibility rejects a message, the admin action should throw a clear error and leave the record unchanged. A retry attempt should move the message to `sending` before calling Telegram, then only mark it failed when Telegram delivery itself fails. Do not delete support rows during this slice; purge means removing transcript body fields and generated output fields while preserving ids, timestamps, status, failure class, and audit metadata.

Do not run Convex local mode. Do not revert unrelated dirty worktree changes.

## Artifacts and Notes

Validation evidence from 2026-05-06:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-admin.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    Test Files 7 passed; Tests 49 passed.

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx
    Test Files 2 passed; Tests 2 passed.

    bunx convex codegen
    Completed successfully and generated `apps/web/convex/_generated/api.d.ts` with the new `crons` module.

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md
    docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md: ok

    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    all targeted paths: ok

    bun run format
    Finished successfully.

    bun run format:check
    All matched files use the correct format.

    bun lint
    Found 0 warnings and 0 errors.

    bun run programs:lint
    telegram-support-bot: ok.

    bun typecheck
    Passed and included `/api/support/messages`, `/api/support/session`, and workspace routes in the production build route manifest.

    git diff --check
    Passed with no whitespace errors.

## Interfaces and Dependencies

This slice depends on Convex support tables in `apps/web/convex/schema.ts`, support model handlers in `apps/web/convex/support/model.ts`, support action wrappers in `apps/web/convex/support.ts`, support admin actions in `apps/web/convex/supportAdmin.ts`, Telegram provider helpers in `apps/web/convex/support/telegram.ts`, Convex cron registration in `apps/web/convex/crons.ts`, support widget analytics in `apps/web/app/_components/support/use-support-chat.ts`, and setup docs in `apps/web/content/docs/telegram-support-bot.mdx`.
