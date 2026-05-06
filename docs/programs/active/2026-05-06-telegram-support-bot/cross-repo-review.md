---
title: "Telegram Support Bot Cross Repo Review"
summary: "Risk review for adding a custom website support chat and Telegram operator bot to Ship by Sunday."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Reviewing the support bot Program for privacy, scope, and existing-system conflicts."
  - "Before shipping Telegram support code."
---

# Telegram Support Bot Cross Repo Review

## Findings

Risk: Reusing the observability Telegram bot would mix customer support with production incidents.
Evidence: `docs/internal/observability.md` defines Telegram as a thin alert delivery client for high-signal production issues, and `apps/web/convex/observability/model.ts` owns incident-specific delivery behavior.
Requirement: Use separate support env names, separate Convex support tables, separate docs, and separate failure handling.

Risk: A direct `t.me` link would not support custom operator buttons or website-visible replies.
Evidence: Direct links are useful for opening Telegram chats, but app-controlled inline keyboards and callback query handling require a bot flow.
Requirement: Keep direct chat as fallback only.

Risk: A generic chat widget could become a privacy and spam surface.
Evidence: Anonymous visitors can send arbitrary text. Authenticated users may eventually discuss private app state.
Requirement: Add Convex-side abuse controls, message length limits, retention policy, sensitive-data guidance, and no raw-source or secret ingestion. The first slice should stay CAPTCHA-free but enforce one open thread per anonymous token, per-token cooldown, pending-message caps, global send caps, and a support kill switch.

Risk: Support analytics can accidentally capture private message content.
Evidence: The repo has PostHog autocapture and product-event helpers, and support messages are arbitrary visitor text.
Requirement: Support analytics must be metadata-only. Do not capture message bodies, emails, Telegram ids, visitor tokens, or transcript text. Only lifecycle events and safe status/error properties belong in PostHog.

Risk: Contact capture can turn the support widget into a lead form and expand PII handling before the chat bridge is proven.
Evidence: Slice 1 is a landing-page chat proof, and the widget already accepts arbitrary visitor text.
Requirement: Do not add dedicated email/contact fields or an email validation gate in Slice 1. Let visitors volunteer contact details in chat. Treat any explicit `Ask for email` flow as a later structured operator action with audit.

Risk: Attachments widen support from chat into unreviewed file intake.
Evidence: Image upload, file upload, screenshots, voice notes, and binary attachments require storage, scanning, Telegram file mapping, retention, and privacy policy.
Requirement: Keep Slice 1 text-only. Accept plain text and links as text. Defer attachment support behind a separate storage, privacy, retention, and provider-mapping decision.

Risk: Support transcripts can retain customer contact details and product context longer than needed.
Evidence: The widget accepts arbitrary visitor text and mirrors it into Telegram topics.
Requirement: Model retention from v1. Idle anonymous threads auto-close after 14 days, closed transcript bodies retain for 90 days, and purge removes Convex message bodies plus the matching Telegram forum topic while preserving only minimal audit metadata.

Risk: AI draft buttons could accidentally send unreviewed text to customers.
Evidence: The desired buttons may generate prompts or replies. Without a strict state model, draft and send actions can blur.
Requirement: Model draft, preview, send, and failure states explicitly. The first AI slice must be Parker-approved by default.

Risk: Telegram webhook endpoints can become unauthenticated write surfaces.
Evidence: The app will need to receive updates from Telegram and mutate Convex support state.
Requirement: Protect the webhook with a Telegram secret token or equivalent verification, validate update shape at the boundary, and reject unmapped chats, messages, or callback data.

Risk: Optional Clerk association can accidentally become a second support-thread authority.
Evidence: The app already uses Clerk user ids for protected product state, while support starts as an anonymous homepage flow.
Requirement: In Slice 1, Clerk identity may be stored as support metadata for signed-in visitors, but widget reads and writes must still require the browser support token. Account-level support history requires a later privacy and access design.

Risk: Public support can creep into protected workspace routes before privacy rules exist.
Evidence: Workspace routes carry product state, project context, runner status, and potentially sensitive support summaries.
Requirement: Keep Slice 1 homepage-only. Protected-route support requires a later authenticated-support slice with account-history, product-context, and privacy rules.

Risk: Telegram topic titles can leak user-supplied details into durable operator chrome.
Evidence: Forum topic names are visible outside the message body and can outlive the conversation context.
Requirement: Use generated support ids and safe routing metadata in topic titles. Keep visitor names, emails, message text, and product details inside retained support messages only.

Risk: The Telegram topic header can leak the same sensitive details if it tries to be too helpful.
Evidence: The header is pinned-like operator context and may be read before retention cleanup.
Requirement: The header should contain only safe operator context: support id, entry surface/path, date, visitor kind, delivery status, and `Close thread`. Do not include visitor tokens, raw emails, message text, or hidden identifiers that do not help Parker operate the thread.

Risk: A visitor message can appear sent even though Telegram delivery failed.
Evidence: The bridge has two writes: Convex support state and Telegram operator delivery.
Requirement: Persist visitor messages before Telegram delivery, render explicit delivery states in the widget, keep failed messages in Convex, show a fallback link, and record safe delivery-error metadata for retry or debugging. Slice 1 should use manual/admin retry recovery only; automatic background retries belong to hardening.

Risk: Widget placement can damage the homepage conversion path.
Evidence: The homepage already has sticky checkout/demo controls and mobile layout constraints.
Requirement: Verify desktop and mobile screenshots, avoid covering primary CTAs, and add responsive placement rules. The support widget should be passive and on-demand: no auto-open, no timed popup, no fake online state, compact desktop panel, and mobile bottom sheet.

Risk: The slice can look done because unit tests pass while the real homepage widget placement or webhook boundary is broken.
Evidence: The feature spans local storage, Convex state, Telegram delivery, webhook parsing, and responsive homepage UI.
Requirement: Require unit tests, Convex model tests, webhook integration tests, widget integration-ui tests, desktop/mobile browser proof, and broad format/lint/typecheck gates. Full hosted e2e is only required if auth, checkout, entitlement, release proof, or another release-sensitive path is touched.

Risk: Linear or checkout operator buttons can create side effects without enough audit.
Evidence: Buttons like "create Linear draft" and "send checkout" affect business workflow and customer messaging.
Requirement: Start with draft-only or reversible actions, record action audit, and require explicit operator choice for customer-visible sends.

## Open Questions

The first child ExecPlan should use support-specific env names, including support bot token, support chat id, support webhook secret, and support operator Telegram user ids. The Telegram webhook should run as a Convex HTTP action because Convex owns support state.

Those support env names should be Convex env values, not Next.js server env values, unless implementation moves part of the support bridge into Next.js. The app docs should own the setup page and explain BotFather, private supergroup/forum topics, bot permissions, webhook URL construction from `NEXT_PUBLIC_CONVEX_SITE_URL`, environment ownership, verification, and failure modes.

The first child ExecPlan should use a private Telegram supergroup with forum topics enabled. Each support thread maps to one forum topic through Telegram `message_thread_id`.

The first child ExecPlan should use a browser-held anonymous visitor access token with a Convex-stored token hash. Retention should follow the locked default: idle anonymous threads auto-close after 14 days, closed transcript bodies retain for 90 days, and purge removes message bodies plus the matching Telegram forum topic.

## Review Conclusion

The initiative is worth doing as a Program because it spans homepage UI, Convex data, Telegram provider setup, bot webhooks, operator actions, AI drafting, analytics, privacy, and release proof. The safe first slice is a vertical proof with a dedicated support bot and no automatic AI-to-customer sends.
