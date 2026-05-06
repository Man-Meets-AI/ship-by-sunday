---
title: "Telegram Support Widget And Bot Research"
summary: "Research pass for a custom landing-page chat widget backed by Telegram as Parker's operator inbox."
docType: "research_pass"
status: "active"
read_when:
  - "Planning the customer support chat widget."
  - "Checking Telegram bot, widget, and operator-inbox constraints."
---

# Telegram Support Widget And Bot Research

This research pass records the stable facts and current assumptions behind a custom Ship by Sunday support chat that lets visitors write on the website while Parker answers from the Telegram app.

## Current Repo Facts

The public homepage is controlled by `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, and `apps/web/app/_components/home-page/home-page.tsx`. `apps/web/content/docs/configure-the-homepage.mdx` explicitly says future homepage behavior should enter through the homepage content and render model instead of being scattered across section components.

The app already has Convex as the backend and PostHog as the generic analytics/error source. Convex remains product state, and homepage or chat state should not be stored in local-only browser state after a visitor starts a real support conversation.

The repo already has Telegram incident delivery. `docs/internal/observability.md` states that Telegram is a thin alert delivery client for high-signal production issues. `apps/web/convex/observability/model.ts` reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to send incident notifications. This existing bot and chat should not become customer support. Customer support needs separate token, chat, table names, docs, and failure handling.

## Telegram Platform Facts

Telegram public username links such as `https://t.me/parkerrex` can open a direct chat. That is the simplest support bubble behavior, but it sends the visitor away from the landing page and does not allow custom operator buttons inside Parker's workflow.

Telegram Bot API supports sending messages through `sendMessage`, receiving webhook updates through `setWebhook`, and attaching inline keyboards through `reply_markup`. Inline keyboard button taps arrive as callback queries that the app can answer and route to internal actions. These primitives are enough for a Telegram operator inbox where the bot posts visitor messages and Parker taps action buttons such as "Draft reply", "Send checkout", or "Generate prompt".

Telegram bots are distinct from a personal Telegram account. If visitors message `@parkerrex` directly, the app cannot reliably attach custom operator buttons or write the conversation back to the website. If visitors chat with the website widget and the website bridges messages to a bot-controlled operator thread, the app can provide custom controls and keep the visitor on the landing page.

Telegram Business connected bots are a possible later direction for business-account messaging. They add more provider setup and authorization surface than the first version needs. The first useful version should use a normal support bot in an admin chat or supergroup.

## Widget Market Pattern

Third-party widget products usually sell one of two patterns:

- a polished floating Telegram launch bubble that opens a `t.me` chat after a short welcome panel
- a custom website chat UI that bridges visitor messages to Telegram for the operator

The first pattern is fast but shallow. The second pattern matches the desired product: visitors do not leave the landing page, Parker replies from Telegram, and the bot can expose structured buttons for support workflows.

The good-looking visual pattern is not embedded Telegram chrome. It is a custom first-party support widget using Ship by Sunday's visual system: quiet fixed launcher, compact on-page panel, clear operator identity, message stream, and a conservative set of actions.

## Product Conclusions

The right initiative is a custom website chat plus Telegram operator bot.

Visitors should type in the Ship by Sunday page. Convex should store support threads and messages. A dedicated Telegram support bot should forward each visitor message into Parker's operator chat. Parker replies from Telegram. The bot webhook should turn the reply into a support message visible in the website widget.

Operator buttons should be included from the beginning as a narrow framework, not as a pile of ad hoc commands. Early buttons can draft a reply, send a pricing or checkout link, ask for product context, summarize the lead, generate a Codex prompt, create a Linear draft, or mark the lead as hot. The first implementation should ship only the safest subset and leave mutation-heavy actions behind explicit later slices.

The widget should be designed like a high-trust concierge lane, not a generic Intercom clone. It should look native to the landing page and avoid noisy badges, fake online states, or unread counts that the backend cannot prove.

## Source Anchors

- Telegram links: `https://core.telegram.org/api/links`
- Telegram Bot API: `https://core.telegram.org/bots/api`
- Telegram bot features and business mode: `https://core.telegram.org/bots/features`
- Elfsight Telegram Chat feature examples: `https://elfsight.com/telegram-chat-widget/features/`
- TeleChat site pattern: `https://www.telechat.site/`
