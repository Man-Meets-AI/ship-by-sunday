---
title: Telegram Support Bot Planning Brief 2
program_id: telegram-support-bot
brief_version: 2
status: superseded
summary: Add audited Telegram operator action buttons on top of the landed homepage support bridge.
read_when:
  - "Creating or resuming the Operator Actions And Prompt Buttons child ExecPlan."
  - "Adding Telegram support bot buttons beyond Close thread."
---

# Telegram Support Bot Planning Brief 2

The next child ExecPlan should be titled `Operator Actions And Prompt Buttons`.

The goal is to turn the proved `Close thread` callback path into a maintainable operator action framework. Parker should be able to tap Telegram inline buttons in a support topic to send safe canned website-visible replies, generate operator-only drafts or prompts, mark a lead as hot, and audit every action without introducing customer-visible AI automation or a separate operator dashboard.

Exact scope: keep the first-party homepage widget and Telegram forum-topic bridge from Slice 1, expand the support operator action taxonomy beyond `close_thread`, add short Telegram callback data for every action, add a reusable action keyboard to the topic header, parse callback queries into a validated action type, enforce the existing support chat id, mapped topic, support id, and operator allowlist checks, dedupe repeated callback queries, write richer `supportOperatorActions` records, create website-visible operator messages for explicitly customer-facing actions, and post operator-only generated output back into the Telegram topic for draft and prompt actions.

Customer-visible actions in this slice should be `ask_for_email`, `ask_for_context`, `send_pricing_link`, and `send_checkout_link`. They should insert normal operator support messages in Convex so the website widget displays them, and they should be clearly Parker-approved because they only happen after an allowlisted operator taps the button. The pricing and checkout actions should send visitors back to the homepage pricing section rather than creating Stripe checkout sessions from Telegram; checkout route and payment behavior are out of scope for this slice.

Operator-only actions in this slice should be `draft_reply`, `summarize_lead`, `generate_codex_prompt`, `create_linear_draft`, and `mark_hot_lead`. They should not send customer-visible text. Drafts, summaries, Codex prompts, and Linear drafts may be deterministic templates based on bounded thread metadata and the latest messages; do not call an AI model and do not call Linear in this slice. `mark_hot_lead` may update a thread-level operator priority and write an audit record.

The callback data must respect Telegram's 1 to 64 byte `callback_data` limit for inline keyboard buttons. Use compact but readable callback data such as `support:<supportId>:<actionSlug>` where every action slug is short enough for current `SBS-...` support ids. Continue to answer callback queries with `answerCallbackQuery` so Telegram clients do not leave a spinner running.

The action audit should record action type, status, operator Telegram user id, callback query id, Telegram update id, source support message id when one exists, generated output when the action creates operator-only text, customer-visible message id when one is created, failure reason when the action is ignored or fails, creation time, and completion time where applicable. If generated output can contain support transcript context, keep it in the same support retention boundary by adding a future-purge field rather than treating it as permanent analytics data.

Do not add AI API calls, automatic AI replies, uploads, protected workspace support, multi-operator assignment, CRM dashboards, Linear API writes, Stripe checkout session creation, or automatic delivery retries in this slice. Do not expose action output to PostHog. Do not send message bodies, generated output, Telegram ids, visitor tokens, or transcript text to analytics.

External provider setup does not require new Telegram permissions beyond Slice 1. The setup docs should still be updated to explain the expanded action keyboard, the callback data limit, the exact actions that are customer-visible, the exact actions that are operator-only, and the fact that Linear and AI buttons are draft-only in this slice.

Focused validation should include unit tests for callback data generation/parsing, action keyboard callback length, Telegram callback parsing, action output builders, customer-visible action insertion semantics, duplicate callback handling, and docs registration. Run hosted Convex codegen after schema or function changes, never Convex local mode. Finish with the relevant support unit tests, widget integration-ui test if customer-visible message rendering changes, plan/program/docs linting, `git diff --check`, and the repo gates when the slice is completed.
