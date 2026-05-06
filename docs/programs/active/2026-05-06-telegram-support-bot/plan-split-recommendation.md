---
title: "Telegram Support Bot Plan Split Recommendation"
summary: "Recommended child ExecPlan split for the custom support widget and Telegram operator bot Program."
docType: "program_plan_split"
status: "active"
read_when:
  - "Creating child ExecPlans for the Telegram support bot Program."
  - "Checking which support-chat slice should happen next."
---

# Telegram Support Bot Plan Split Recommendation

## Slice 1: Homepage Widget And Telegram Bridge Proof

Ship the narrow vertical proof: dedicated env names, Convex support visitor/thread/message tables and functions, retention fields, first-slice abuse controls, browser-held anonymous visitor access token with Convex-stored hash, homepage chat widget, no dedicated contact/email field, text-only lazy first-message visitor send, store-first delivery state, maintainer-only failed-delivery recovery action, Telegram support bot forum-topic creation and outbound post, Convex HTTP action webhook inbound reply, operator allowlist enforcement, `Close thread` operator button, and live website reply rendering. Do not include uploads, attachments, AI drafts, prompt generation, checkout links, Linear drafts, canned customer-visible sends, or automatic background retries in this slice.

## Slice 2: Operator Actions And Prompt Buttons

Add the structured operator action framework beyond `Close thread`. Buttons should include draft reply, ask for email, ask for product context, send pricing link, send checkout link, summarize lead, generate Codex prompt, create Linear draft, and mark hot lead. Start with draft-only or reversible actions. Record action status, source message, operator, generated output, and customer-visible result when applicable.

## Slice 3: AI Drafting And Product Context

Use existing product context, page source, and support thread history to generate Parker-side drafts and prompts. Keep AI output operator-approved by default. Add safety tests proving generated drafts are not auto-sent to visitors.

## Slice 4: Authenticated Customer Support And Workspace Entry

Extend the widget into authenticated product routes if useful. Associate support visitors with Clerk users only after privacy and access rules are documented. Add support context from workspace state without exposing secrets, raw source, private runner logs, or payment internals.

## Slice 5: Operations, Analytics, And Hardening

Add deeper rate limits, spam controls, retention automation, metadata-only PostHog events, failure dashboards, delivery retry rules, operator runbook, production smoke, and release proof. This slice should also decide whether Telegram Business connected bots are worth a follow-up Program or should remain out of scope.

## Deferred Or Separate Work

Full CRM, multi-operator assignment, SLA reporting, customer email notifications, Telegram Business migration, public support knowledge base automation, and automatic AI replies are not required for the first useful support bot.
