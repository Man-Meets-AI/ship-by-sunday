---
title: Telegram Support Bot Planning Brief 5
program_id: telegram-support-bot
brief_version: 5
status: current
summary: Add the operations hardening needed before treating the Telegram support bot as production-ready.
read_when:
  - "Creating or resuming the Operations, Analytics, And Hardening child ExecPlan."
  - "Changing support retention, retry policy, operator runbooks, or support analytics."
---

# Telegram Support Bot Planning Brief 5

The next child ExecPlan should be titled `Operations, Analytics, And Hardening`.

The goal is to turn the already-built support bridge into a maintainable production surface. Homepage and workspace support entry now exist, Telegram operator actions are audited, and private AI drafts are operator-only. The next slice should add the missing operational guarantees: retention maintenance, bounded retry policy, admin-readable failure snapshots, metadata-only analytics evidence, and a runbook that tells Parker or a future maintainer exactly how to verify and recover the bridge.

Keep this slice focused on first-party operational confidence. Implement Convex maintenance that closes idle anonymous support threads after 14 days, purges closed transcript bodies and generated operator-only output after 90 days, and attempts Telegram forum-topic cleanup when the topic id is known. Add retry eligibility rules for failed visitor-message delivery so manual recovery cannot retry purged, closed, content-rejected, or over-attempted messages. Add an admin-facing support operations snapshot protected by the existing `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`; it should return bounded metadata about failures and due maintenance, not transcript bodies or generated AI text.

Strengthen client analytics only with metadata that is already safe by Program decision: support surface, page path, entry surface, thread status, message count, latest delivery status, delivery failure class, and generic failure class. Do not send message bodies, emails, Telegram ids, raw support session tokens, generated output, or transcript text to PostHog. Keep the transcript replay block attributes and the SDK-recognized `ph-no-capture` / `ph-sensitive` classes, and keep the textarea `data-ph-mask` plus `ph-mask` / `ph-sensitive` proof.

Do not add a broad admin dashboard UI, CRM workflow, Linear mutation, CAPTCHA, uploads, automatic AI replies, automatic customer-visible sends, account-wide transcript history, or automatic delivery retry scheduling in this slice. A bounded admin snapshot and manual retry path are enough. Do not claim live provider proof until the documented Convex env and OpenAI setup have been completed and the real Telegram/OpenAI loop has been exercised.

External setup should not introduce new providers. If the slice adds a Convex cron or new admin command, document exactly where it runs, what env it uses, how to inspect it from the Convex dashboard or CLI, what it changes, and what failure looks like. The existing support env names remain the authority.

Focused validation should include Convex support model tests for idle close, purge, Telegram cleanup marking, and retry eligibility; support admin tests for the token-protected operations snapshot and retry denial cases; integration-ui tests proving support analytics remain metadata-only; docs/plan/program linting; hosted Convex codegen or equivalent type validation if Convex function references change; and the repo gates `bun run format`, `bun lint`, and `bun typecheck`.
