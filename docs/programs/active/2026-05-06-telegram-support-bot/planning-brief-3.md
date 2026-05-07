---
title: Telegram Support Bot Planning Brief 3
program_id: telegram-support-bot
brief_version: 3
status: current
summary: Add AI-backed Parker-side drafts and product-aware support context without sending generated text to visitors automatically.
read_when:
  - "Creating or resuming the AI Drafting And Product Context child ExecPlan."
  - "Changing Telegram support AI draft behavior, model configuration, or support-context prompts."
---

# Telegram Support Bot Planning Brief 3

The next child ExecPlan should be titled `AI Drafting And Product Context`.

The goal is to upgrade the existing operator-only `Draft reply`, `Summary`, `Codex prompt`, and `Linear draft` buttons from deterministic templates into AI-backed Parker-side assistance. The homepage visitor experience must remain unchanged: visitors only see normal operator messages or explicit canned sends after Parker taps a customer-visible action. AI output must be stored as support operator action output and posted only into the private Telegram support topic for Parker to review, copy, edit, or ignore.

Use the OpenAI Responses API from Convex action runtime, not from Convex mutations and not from browser code. Keep the current deterministic output builders as safe fallbacks and tests, but schedule AI generation asynchronously after the callback action is accepted so the Telegram webhook can acknowledge the button tap quickly. The background AI action should read a bounded latest-message thread context, stable product context about Ship by Sunday, and the action type, then write the generated output back onto the existing `supportOperatorActions` audit record and post the generated note to Telegram. If `OPENAI_API_KEY` or Telegram delivery is missing, the system should fail safely by preserving deterministic output and recording a failure reason instead of retry-looping the webhook or sending anything to the visitor.

Use a pinned, configurable model. Default to a fast durable snapshot suitable for support drafts, `gpt-5.4-mini-2026-03-17`, and allow Convex env `SUPPORT_AI_DRAFT_MODEL` to override it. The OpenAI API key must be `OPENAI_API_KEY` in hosted Convex env. Follow the current OpenAI docs: use the Responses API for text generation, do not assume raw text lives at `output[0].content[0].text`, and prefer a production-pinned model snapshot for consistent behavior.

Scope the product context to safe public facts in the repo, not private customer code, raw logs, payment internals, or hidden workspace state. The initial context can be a feature-local support prompt that describes Ship by Sunday as a codebase-first product, the public homepage pricing/checkout posture, the asynchronous Parker-first support tone, and the no-response-time-promise rule. Do not add workspace support, retrieval, file search, web search, Linear writes, Stripe checkout session creation, uploads, or customer-visible AI replies in this slice.

Add audit fields only where they improve operator visibility and retention safety. The action record should be able to show whether output came from the deterministic fallback or OpenAI Responses, which model produced it, and any AI generation failure reason. Keep generated output in the same support retention boundary as Slice 2 by retaining the existing generated-output purge field.

External setup docs must add `OPENAI_API_KEY` and optional `SUPPORT_AI_DRAFT_MODEL` as hosted Convex env values, including how to verify by tapping an operator-only AI button and what failure looks like when the key is missing. The docs must state that AI draft output is private to the Telegram operator topic and is never inserted into `supportMessages` automatically.

Focused validation should include unit tests for AI prompt construction, Responses API output parsing, model/env fallback behavior, generation failure behavior, action audit patching, scheduled generation from the webhook action, and the invariant that AI-backed actions do not insert visitor-visible support messages. Run hosted Convex codegen after function or validator changes. Finish with the relevant support unit tests, docs/plan/program linting, `git diff --check`, and the repo gates that are not already blocked by unrelated local dirt.
