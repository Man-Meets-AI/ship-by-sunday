---
title: Telegram Support Bot Planning Brief 4
program_id: telegram-support-bot
brief_version: 4
status: current
summary: Add a protected workspace support entry point while keeping support transcripts private, session-scoped, and free of automatic workspace state sharing.
read_when:
  - "Creating or resuming the Authenticated Customer Support And Workspace Entry child ExecPlan."
  - "Changing where authenticated buyers can open support or how workspace context enters support."
---

# Telegram Support Bot Planning Brief 4

The next child ExecPlan should be titled `Authenticated Customer Support And Workspace Entry`.

The goal is to extend the already-built support chat entry from the public homepage into authenticated product routes without changing the support privacy model. A signed-in buyer should be able to message Parker from the protected workspace, and the resulting support thread should still flow through the existing Next support-session bridge, Convex support state, and Telegram support bot. The support session cookie remains the transcript access authority in this slice; Clerk user id association is metadata on message creation, not a replacement access model.

The first milestone should be deliberately small: make the support widget implementation reusable outside the homepage, render a workspace-scoped `Ask Parker` launcher from the protected workspace layout, send `entrySurface: "workspace_support_widget"` with workspace messages, and record metadata-only analytics with `surface: "workspace"`. This proves authenticated workspace entry without adding account-wide support history, support dashboards, or automatic workspace summaries.

Do not send workspace state, source code, findings text, runner logs, payment details, local paths, screenshots, or Codex transcripts to Telegram automatically. If Parker needs workspace context in this slice, the visitor must type it into the support message intentionally. A later hardening slice can design a safe summary model after privacy and retention rules are explicit.

Keep the existing customer-visible support behavior: generated AI output remains private to Parker, normal Telegram replies become visitor-visible, and structured customer-visible action buttons remain explicit operator actions. The workspace entry must not auto-open, must not promise live availability or response times, and must not add CAPTCHA, uploads, binary attachments, CRM behavior, Linear writes, or automatic AI replies.

External setup does not change for this slice. The existing `apps/web/content/docs/telegram-support-bot.mdx` provider contract still owns the dedicated support bot, Convex env, OpenAI env, webhook, and verification steps. Implementation should only update docs if the user-facing setup or verification flow changes because the workspace entry exists.

Focused validation should include the existing homepage support widget integration-ui test, a new workspace support widget integration-ui test that verifies `entrySurface: "workspace_support_widget"` and `surface: "workspace"`, support route tests proving signed-in requests pass a Clerk Convex auth token so Convex derives Clerk metadata without exposing the raw support token, touched-file formatting, `bun lint`, and `bun typecheck`. Because this touches protected workspace UI, use the existing route/component test pattern and App Router guidance from the installed Next docs.
