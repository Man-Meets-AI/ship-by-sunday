---
title: "Telegram Support Bot Normalized Direction"
summary: "Normalized architecture and product direction for the custom on-site support widget and Telegram operator bot."
docType: "normalized_pass"
status: "active"
read_when:
  - "Choosing between a direct Telegram link and a first-party support chat."
  - "Implementing customer-support Telegram surfaces without touching incident alerting."
---

# Telegram Support Bot Normalized Direction

Ship by Sunday should build a first-party website chat widget backed by a dedicated Telegram support bot.

The visitor experience stays on the landing page. The bottom-right launcher opens a compact Ship by Sunday chat panel. The visitor can send a message without first providing email or filling out a contact field, see replies, and continue browsing without being forced into Telegram.

The operator experience stays in Telegram. The support bot posts each visitor message into a private Parker-owned supergroup with forum topics enabled. Each support thread maps to one Telegram forum topic. Parker replies in Telegram. The bot webhook writes that reply back into Convex, and the website widget subscribes to the thread.

## Boundary Rules

Do not reuse the observability Telegram bot, token, chat id, delivery code, or incident tables for customer support. Production incident alerts and customer support have different privacy, tone, delivery, retention, retry, and failure semantics.

Do not use direct `@parkerrex` chat as the primary implementation if the goal includes custom buttons, prompt generation, or website-visible replies. Direct personal Telegram chat is acceptable only as a fallback link.

Do not introduce a third-party widget script unless a future decision explicitly accepts the tradeoff. The first-party UI can be more brand-aligned, can preserve customer data boundaries, and can evolve into product-specific operator actions.

Do not ship AI-generated replies directly to visitors without Parker approval. Early AI actions should produce Telegram-side drafts or prompts for Parker to review.

Do not make the chat widget a login gate. Anonymous landing-page visitors can start a thread with an HttpOnly support session cookie. Convex stores only the token hash, and every thread read or write checks the server-minted support session. Authenticated customers can later have their support thread associated with their Clerk user when safe. Do not store the raw support session token in localStorage or any other JavaScript-readable browser storage.

Do not make the first widget a contact form. Slice 1 should not render a dedicated email/contact field, email validation gate, or separate lead form step. Visitors can type contact details naturally in chat. A structured `Ask for email` operator action belongs to Slice 2.

If the visitor is already signed in during Slice 1, the support thread may store `clerkUserId` as optional support metadata. That association must not replace the HttpOnly support session cookie as the widget read/write authority. Account-level support history and protected-route support belong to a later authenticated-support slice.

## State Direction

Convex should own support state:

- `supportVisitors`: anonymous or authenticated visitor identity, token hash, first seen time, optional Clerk user id, last seen time, and lightweight browser/session metadata.
- `supportThreads`: support thread status, visitor id, current Telegram chat id and forum topic mapping, source page, created time, last message time, assigned operator, and lifecycle flags.
- `supportMessages`: visitor, operator, system, and action messages with delivery state, Telegram message ids, timestamps, and safe metadata.
- `supportOperatorActions`: button-triggered actions such as draft reply, send checkout link, generate prompt, summarize lead, create Linear draft, or mark hot lead.

Visitor sends should be store-first. Convex writes the support message before Telegram delivery starts, then updates delivery state to `sending`, `delivered_to_parker`, or `delivery_failed`. If Telegram delivery fails, the message remains in Convex, the widget shows the failure with the fallback Telegram link, and backend metadata records enough error detail to retry or debug without sending message text to analytics.

Slice 1 should not add automatic background retries. It should store delivery attempt count, last delivery error, and last delivery attempt time, and provide a no-UI maintainer recovery action that retries one stored failed visitor message after setup repair. Protect that action with `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`; do not reuse the webhook secret, observability token, or Telegram operator allowlist as its only authority. Automatic retries belong in the hardening slice after the bridge is stable.

The exact table names can change during implementation if a better local naming pattern exists, but customer support names must stay specific. Avoid vague names such as `messages`, `threads`, `chatData`, or `handler`.

## Telegram Direction

Use a dedicated support bot and a dedicated private supergroup with forum topics enabled. The app should document exactly where the bot is created, what supergroup it is added to, how topics are used, what webhook URL is set, which environment owns each value, and which Convex or Vercel env variables hold the values.

Support provider setup should live in Convex env and app docs. The support-specific Convex env values should be `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, and `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN` unless implementation finds a stronger local naming convention. The setup doc should explain BotFather, private supergroup/forum topics, webhook URL construction from `NEXT_PUBLIC_CONVEX_SITE_URL`, maintainer recovery-token usage, local/preview/production ownership, verification, and failure modes. It must name `setWebhook.secret_token`, the incoming `X-Telegram-Bot-Api-Secret-Token` header, Telegram's 1 to 256 character secret-token constraint using only `A-Z`, `a-z`, `0-9`, `_`, and `-`, `allowed_updates` limited to `message` and `callback_query`, `getWebhookInfo` checks, `can_manage_topics` for topic creation and closing, and `can_delete_messages` for deleting forum topics during retention cleanup.

Telegram topic titles should not include user-supplied text. Use a generated support id and safe routing metadata only, such as `SBS-0421 · homepage · May 6`. Visitor names, emails, message text, and product details belong inside support messages, not topic names.

Every Telegram topic should start with a bot-authored context header before the first visitor message. The header should include safe operator context such as support id, entry surface/path, date, visitor kind (`anonymous` or `signed-in`), delivery status, and the `Close thread` action. It must not include the visitor token, raw email, message text, or hidden identifiers that do not help Parker operate the thread.

The operator chat should support two reply modes:

- normal reply: Parker replies in Telegram and the message appears on the website
- structured action: Parker taps an inline button and the app records a narrow, auditable action before doing anything customer-visible

The first structured action should be only `Close thread`. It proves callback parsing, operator allowlisting, action audit, thread lifecycle mutation, and website closed-state rendering without widening Slice 1 into AI drafts, prompt generation, checkout links, Linear drafts, or canned sends.

The first slice should prefer forum-topic mapping over complicated command parsing. The bot can create or reuse a topic for the support thread, post visitor messages into that topic, and map normal allowed-operator messages in that topic back to the support thread.

Only configured Telegram operator user ids can create visitor-visible replies or run operator actions. Unknown Telegram users, unknown chats, and unmapped topics fail closed without creating support state. For webhook responses, missing or wrong secret headers should return non-2xx, invalid JSON can return 400, and authenticated unsupported updates should return 200 ignored responses so Telegram does not retry unsupported Slice 1 shapes indefinitely.

The widget should call a narrow Next support-session bridge for transcript reads and visitor sends. The route handlers should read or mint the HttpOnly support session cookie, call server-facing Convex functions, and return widget-safe thread state. Direct Convex React queries remain acceptable for non-sensitive public state, but not for support transcripts that depend on the anonymous support credential.

## Retention Direction

Support transcript retention should be explicit from the first implementation. Open threads remain available. Idle anonymous threads auto-close after 14 days. Closed transcript bodies retain for 90 days. After that, the purge path removes Convex message bodies and deletes the matching Telegram forum topic, while retaining only minimal audit metadata needed to understand that a thread existed and how it was disposed.

## Abuse-Control Direction

The first slice should stay CAPTCHA-free. Abuse controls should be server-side in Convex: one open thread per anonymous support session, a message length cap, per-session send cooldown, a cap on pending visitor messages before an operator reply, a global hourly send cap to protect Telegram delivery, and a support kill switch that turns the widget into the fallback Telegram link. Turnstile or another CAPTCHA belongs in a later hardening slice only if actual spam justifies the provider setup and UX friction.

## Message Format Direction

Slice 1 should be text-only. The widget accepts plain text and links as text, and does not support image upload, file upload, screenshots, voice notes, or binary attachments. Telegram-side media messages should not become website-visible support replies in the first slice. Attachment support needs a later storage, privacy, retention, and Telegram file-mapping decision.

## Analytics Direction

Support analytics should be metadata-only. PostHog can record lifecycle events such as `support_widget_opened`, `support_thread_created`, `support_message_sent`, `support_reply_received`, `support_send_failed`, and `support_fallback_clicked` with safe properties such as page path, thread status, delivery status, and error class. Do not send message bodies, emails, Telegram ids, visitor tokens, or transcript text to analytics. Rendered transcript DOM and message inputs must also carry the repo's replay blocking or masking attributes, and the first slice needs browser or integration-ui proof that those attributes are present.

## UI Direction

The widget should feel like a native Ship by Sunday concierge surface:

- fixed launcher on the public homepage
- passive on-demand behavior with no auto-open, timed popup, or fake online state
- Parker-first visitor-facing identity in the launcher and panel header
- compact popover panel with restrained neutral styling
- mobile bottom sheet with the same conversation model
- first message that sets asynchronous expectations without fake availability claims, green dots, "online" labels, or response-time promises
- text input with send action and clear pending/error states
- desktop and mobile-safe placement that does not cover primary checkout or product-preview controls
- fallback link to `https://t.me/parkerrex` only when the custom bridge is unavailable or explicitly selected

The first launch is homepage-only. Later slices may expose the widget inside authenticated workspace routes only after account-level support history, product-context summaries, and privacy rules are designed.
