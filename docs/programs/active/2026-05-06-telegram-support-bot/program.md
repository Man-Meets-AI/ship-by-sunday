---
program_id: telegram-support-bot
title: Telegram Support Bot
status: active
created_at: 2026-05-06
completed_at: null
summary: Build a first-party landing-page support chat that keeps visitors on the site while Parker replies from Telegram through a dedicated operator bot with structured action buttons.
post_build_recap: null
read_when:
  - Planning or implementing the support chat widget.
  - Updating Telegram support bot setup, Convex support chat state, or homepage support UI.
  - Adding operator buttons, AI drafts, support prompts, Linear drafts, or support analytics.
---

# Telegram Support Bot

This Program is a living initiative document. Update it whenever a child slice lands, the ordering changes, or validation changes the durable truth.

This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.

## Purpose / Big Picture

Ship by Sunday needs a support channel that feels native to the landing page while still letting Parker operate from Telegram. A plain Telegram bubble is useful but sends visitors away from the product. A first-party widget plus Telegram operator bot keeps the visitor in context, gives Parker the Telegram app workflow, and creates a path for structured support buttons such as draft reply, ask for product context, send pricing, generate a prompt, create a Linear draft, or mark a hot lead.

The initiative is moving in the right direction when visitors can start and continue a support thread on the site, Parker can reply from Telegram without opening a separate dashboard, the bot can offer safe operator buttons, customer support is fully separated from production incident Telegram delivery, and all external provider setup is documented where future maintainers will look.

## Program Inputs

The durable packet artifacts for this Program live in `docs/programs/active/2026-05-06-telegram-support-bot/`.

The current research is recorded in `research-pass-telegram-support-widget-and-bot.md`. The normalized implementation direction is `normalized-pass-telegram-support-bot.md`. The locked initiative decisions are in `converged-decision-packet.md`. Ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is in `cross-repo-review.md`. The current immutable implementation brief is `planning-brief-1.md`, and `current-planning-brief.txt` points at that brief.

## Current State

No custom customer-support chat exists yet. The homepage can render CTAs and interactive product-preview surfaces, but there is no support widget, no support thread state, no support message schema, no Telegram support webhook, and no operator action model.

The repo does have an observability Telegram path. It is intentionally for production incident delivery, not customer support. The observability bot reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, renders incident messages, and stores delivery metadata on incident records. This Program must not reuse that bot or data path.

The homepage has a clear control seam through `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, and `apps/web/app/_components/home-page/home-page.tsx`. A support widget should enter through the same content/render-model pattern so future agents can find and test it.

Convex is the natural state owner for support threads and messages because the website widget needs live subscribed messages and Telegram replies need a durable backend target. The implementation must use hosted Convex dev for Convex work and must not switch the repo to Convex local mode.

## Progress

- [x] 2026-05-06: Researched Telegram support patterns, official bot primitives, and the repo's existing Telegram observability boundary.
- [x] 2026-05-06: Created the Telegram Support Bot Program packet and selected the first vertical proof slice.
- [x] 2026-05-06: Locked first-slice architecture decisions for Telegram forum topics, Convex HTTP webhook handling, anonymous visitor token access, lazy thread creation, direct Convex React widget calls, normal Telegram replies, operator buttons, and Telegram operator allowlisting.
- [x] 2026-05-06: Locked explicit support transcript retention: auto-close idle anonymous threads after 14 days, retain closed transcripts for 90 days, then purge message bodies and delete the matching Telegram forum topic while retaining minimal audit metadata.
- [x] 2026-05-06: Locked first-slice abuse controls: one open thread per anonymous token, message length cap, per-token cooldown, pending-message cap before operator reply, global hourly cap, support kill switch, and no CAPTCHA in v1.
- [x] 2026-05-06: Locked passive widget launch behavior: quiet fixed launcher, no auto-open, no timed popups, desktop compact panel, and mobile bottom sheet.
- [x] 2026-05-06: Locked Parker-first visitor-facing identity: launcher and header should read like "Message Parker" or "Ask Parker"; system and fallback states can say "Ship by Sunday support."
- [x] 2026-05-06: Locked asynchronous expectation copy: no green dot, no "online," no response-time promise, and starter text that says Parker will reply in the widget when available.
- [x] 2026-05-06: Locked metadata-only support analytics: lifecycle events only, no message bodies, emails, Telegram ids, visitor tokens, or transcript text in PostHog.
- [x] 2026-05-06: Locked provider setup boundary: support bot secrets live in Convex env, and app docs own BotFather, supergroup, webhook, verification, and failure-mode setup.
- [x] 2026-05-06: Locked first Telegram button scope: Slice 1 ships only `Close thread` as a safe lifecycle button; AI drafts, prompts, checkout links, Linear drafts, and canned sends wait for Slice 2.
- [x] 2026-05-06: Locked store-first delivery semantics: write visitor messages to Convex before Telegram delivery, expose delivery status in the widget, and fail visibly with fallback instead of pretending Parker saw undelivered messages.
- [x] 2026-05-06: Locked Slice 1 retry boundary: record delivery attempts and errors, provide a maintainer-only Convex recovery action protected by `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and defer automatic background retries to hardening.
- [x] 2026-05-06: Locked Slice 1 validation scope: focused unit, Convex model, webhook, integration-ui, and desktop/mobile browser proof; broad repo gates; no full hosted e2e unless auth, checkout, or release-sensitive paths are touched.
- [x] 2026-05-06: Locked text-only v1: plain text and links-as-text only; no uploads, screenshots, voice notes, or binary attachments in Slice 1.
- [x] 2026-05-06: Locked optional Clerk association for signed-in visitors while preserving browser support token as the thread access authority in Slice 1.
- [x] 2026-05-06: Locked homepage-only scope for Slice 1; protected workspace support waits for the authenticated-support slice.
- [x] 2026-05-06: Locked safe Telegram topic naming: generated support id plus safe metadata only, with no visitor names, emails, message text, or product details in topic titles.
- [x] 2026-05-06: Locked Telegram topic header model: bot posts a safe context header before the first visitor message, with support id, entry surface/path, date, visitor kind, delivery status, and `Close thread`.
- [x] 2026-05-06: Locked Slice 1 contact capture scope: no dedicated email or contact field, no validation gate, and `Ask for email` remains a later structured operator action.
- [x] 2026-05-06: Created child ExecPlan `docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md` for Slice 1.

## Decision Log

Decision: Build a custom first-party website chat, not a third-party widget script.
Rationale: The widget can match Ship by Sunday's visual system, keep data in repo-owned state, and evolve into product-specific operator actions.
Date: 2026-05-06

Decision: Use Telegram as the operator inbox.
Rationale: Parker wants to answer from the Telegram app. A support bot can post visitor messages into Telegram and receive replies through webhook updates.
Date: 2026-05-06

Decision: Use a dedicated support bot and support chat.
Rationale: Customer support and production incidents have different privacy, retention, tone, and failure semantics. The existing observability bot must remain isolated.
Date: 2026-05-06

Decision: Keep direct `t.me/parkerrex` as fallback.
Rationale: Direct Telegram is useful when the bridge is unavailable, but it cannot power website-visible replies or structured operator buttons.
Date: 2026-05-06

Decision: Model operator buttons as structured support actions.
Rationale: Buttons that generate prompts, send links, or create Linear drafts need explicit action ids, statuses, audit records, and customer-visible result boundaries.
Date: 2026-05-06

Decision: AI assistance starts as Parker-approved drafts or prompts.
Rationale: The support surface is customer-facing. Generated replies should not auto-send to visitors before the operator selects or edits them.
Date: 2026-05-06

Decision: Use a private Telegram supergroup with forum topics enabled as the operator inbox.
Rationale: One forum topic per support thread keeps Telegram usable as volume grows, maps cleanly to Telegram `message_thread_id`, and avoids mixing unrelated visitors in one flat chat.
Date: 2026-05-06

Decision: Use a Convex HTTP action for the Telegram webhook.
Rationale: Convex owns support state, and the existing repo already uses Convex HTTP actions for provider webhook surfaces that mutate Convex state.
Date: 2026-05-06

Decision: Do not add a dedicated contact or email field in Slice 1.
Rationale: The widget should reduce support friction on the landing page and behave like chat, not a lead form. Visitors can volunteer contact details in the message body if they want. If Parker needs an email later, Slice 2 can add an audited `Ask for email` operator action.
Date: 2026-05-06

Decision: Identify anonymous support visitors with a browser-held access token and a Convex-stored token hash.
Rationale: The widget can support unauthenticated visitors without exposing arbitrary thread access. Reads and writes stay scoped to the visitor's token, and authenticated identity can be associated later.
Date: 2026-05-06

Decision: Create the support visitor, Convex thread, and Telegram forum topic on first real visitor message.
Rationale: Opening the widget should not create Telegram noise or empty backend records. First send is the durable lifecycle boundary.
Date: 2026-05-06

Decision: Use Convex React queries and mutations directly from the widget.
Rationale: The app already mounts `ConvexProviderWithClerk` at the root, so a Next API proxy would add another state boundary without improving durability.
Date: 2026-05-06

Decision: Treat normal Telegram topic messages from allowed operators as visitor-visible replies, and keep buttons or commands as internal actions.
Rationale: Parker can reply quickly from Telegram while structured actions remain explicit and auditable.
Date: 2026-05-06

Decision: Restrict Telegram operator actions to configured Telegram user ids.
Rationale: A private group is not enough as an authorization boundary. An allowlist keeps replies and button taps limited to deliberate operators.
Date: 2026-05-06

Decision: Make support transcript retention explicit from v1.
Rationale: Support chat can contain customer contact details and product context. Open threads should remain usable, idle anonymous threads should auto-close after 14 days, closed transcripts should retain message bodies for 90 days, and the purge path should remove Convex message bodies plus the matching Telegram forum topic while preserving minimal audit metadata.
Date: 2026-05-06

Decision: Use Convex-side abuse controls without CAPTCHA in the first slice.
Rationale: The landing-page chat should remain low-friction while still protecting Telegram delivery and operator attention. The first slice should enforce one open thread per anonymous token, message length limits, per-token send cooldown, a cap on pending visitor messages before operator reply, a global hourly send cap, and a support kill switch that falls back to direct Telegram. CAPTCHA or Turnstile can be added later only if spam proves it necessary.
Date: 2026-05-06

Decision: Make the support widget passive and on-demand.
Rationale: The homepage already has a conversion-critical hero, product preview, and pricing path. The support launcher should help visitors without competing for attention: no auto-open, no timed popup, no fake online state, a quiet fixed launcher, a compact desktop panel, and a mobile bottom sheet.
Date: 2026-05-06

Decision: Make the visitor-facing support identity Parker-first.
Rationale: The homepage already uses founder-led proof and Parker-specific trust signals. The widget should feel like visitors can message Parker directly while system, fallback, and error states remain clearly owned by Ship by Sunday support.
Date: 2026-05-06

Decision: Set asynchronous support expectations.
Rationale: The support widget should not imply a staffed live-chat SLA. It should invite questions about fit, setup, checkout, or the visitor's codebase, and clearly say Parker will reply in the widget when available without using green dots, "online" claims, or response-time promises.
Date: 2026-05-06

Decision: Track only support lifecycle metadata in analytics.
Rationale: Support messages may contain contact details, product details, and customer context. PostHog events should capture lifecycle and delivery signals such as widget opened, thread created, message sent, reply received, send failed, and fallback clicked, but must not include message bodies, emails, Telegram ids, visitor tokens, or transcript text.
Date: 2026-05-06

Decision: Keep Telegram support provider setup in Convex env and app docs.
Rationale: Telegram webhook ingestion and delivery run through Convex HTTP actions, so support bot secrets belong in Convex env. The future setup doc should live under the app docs and explain BotFather setup, private supergroup/forum topics, bot admin permissions, webhook URL construction from `NEXT_PUBLIC_CONVEX_SITE_URL`, local/preview/production ownership, verification, and failure modes.
Date: 2026-05-06

Decision: Ship only `Close thread` as the first Telegram button.
Rationale: The first implementation should prove callback parsing, operator allowlisting, support action audit, thread lifecycle mutation, and website closed-state rendering without widening into AI drafts, prompt generation, checkout links, Linear drafts, or canned customer-visible sends.
Date: 2026-05-06

Decision: Store visitor messages before Telegram delivery.
Rationale: Convex is the source of truth for support state. A visitor send should create the message first, then attempt Telegram delivery. The widget should render explicit states such as `sending`, `delivered_to_parker`, and `delivery_failed`; failed Telegram delivery should leave the message in Convex, show a fallback path, and record retry/error metadata instead of implying Parker received it.
Date: 2026-05-06

Decision: Defer automatic Telegram delivery retries beyond Slice 1.
Rationale: The first implementation should prove the bridge and failure visibility before adding background scheduling. Slice 1 should store delivery attempt count, last delivery error, and last delivery attempt time, show fallback to visitors on failure, and provide a no-UI maintainer recovery action that can retry one stored failed visitor message after env or bot-permission repair. That action must be protected by a separate Convex env token named `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`; it must not reuse the webhook secret, observability tokens, or operator allowlist as its only authority.
Date: 2026-05-06

Decision: Validate Slice 1 with focused automated tests and browser proof, not full hosted e2e by default.
Rationale: The first support slice touches homepage UI, Convex support state, Telegram webhook parsing, and support delivery. It should be proven with unit tests, Convex model tests, webhook integration tests, integration-ui tests, desktop/mobile browser proof, and the repo format/lint/typecheck gates. Full hosted e2e should run only if implementation touches auth, checkout, entitlement, release proof, or other release-sensitive paths.
Date: 2026-05-06

Decision: Keep Slice 1 text-only.
Rationale: Uploads would introduce storage, scanning, Telegram file mapping, retention, and privacy complexity before the support bridge is proven. The first implementation should accept plain text and links as text only, with no image upload, file upload, screenshots, voice notes, or binary attachments.
Date: 2026-05-06

Decision: Attach Clerk identity only as optional support metadata in Slice 1.
Rationale: Signed-in visitors can provide useful context for Parker, but the homepage support thread should still be authorized by the browser-held support token. Clerk association should not become a requirement for thread access until a later authenticated-support slice designs account-level support history and privacy rules.
Date: 2026-05-06

Decision: Keep Slice 1 homepage-only.
Rationale: The public homepage support bridge should be proven before adding protected workspace support. Workspace support needs different context, account-level history rules, product-state summaries, and privacy boundaries.
Date: 2026-05-06

Decision: Keep Telegram topic titles free of user-supplied text.
Rationale: Forum topic names are durable, visible operator chrome. They should use generated support ids and safe routing metadata only, such as `SBS-0421 · homepage · May 6`, while richer visitor context stays inside support messages governed by retention and audit rules.
Date: 2026-05-06

Decision: Start each Telegram topic with a safe bot-authored context header.
Rationale: Parker needs durable thread context without leaking user-supplied data into Telegram topic titles. The bot should post a header containing safe operator context such as support id, entry surface/path, date, visitor kind, delivery status, and the `Close thread` button before posting the visitor's actual message separately.
Date: 2026-05-06

## Slice Ledger

Child ExecPlans:

- `docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md`: active Slice 1 plan for `Homepage Widget And Telegram Bridge Proof`.

Recommended Slice 1: Homepage Widget And Telegram Bridge Proof. This homepage-only slice should add the dedicated provider env contract, Convex support visitor/thread/message model, homepage widget, anonymous visitor token storage, lazy first-message thread creation, no dedicated contact/email field, Telegram forum-topic creation, store-first visitor message delivery with explicit status, a maintainer-only failed-delivery recovery action, Telegram HTTP action webhook inbound reply, operator allowlist enforcement, first-slice abuse controls, the `Close thread` operator button, and live website reply rendering.

Recommended Slice 2: Operator Actions And Prompt Buttons. This slice should build on the callback/audit plumbing from `Close thread` and add safe buttons such as draft reply, ask for email, ask for context, send pricing link, send checkout link, summarize lead, generate Codex prompt, create Linear draft, or mark hot lead.

Recommended Slice 3: AI Drafting And Product Context. This slice should use support thread context and product context to generate Parker-side drafts and prompts while proving that AI output is not sent automatically.

Recommended Slice 4: Authenticated Customer Support And Workspace Entry. This slice should decide whether support history becomes account-level, expose support inside protected product routes if it earns the surface area, and define privacy/access rules beyond the optional Clerk metadata captured in Slice 1.

Recommended Slice 5: Operations, Analytics, And Hardening. This slice should deepen rate limits, spam controls, retention automation, metadata-only PostHog support events, failure dashboards, delivery retry rules, operator runbook, production smoke, and release proof.

## Next Slice

The active child ExecPlan for the next recommended slice is `docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md`, written from `planning-brief-1.md`.

It is next because every later operator button, AI draft, Linear draft, or authenticated support feature depends on the basic loop being real: website visitor message to Convex to Telegram, then Telegram operator reply back to Convex and the website.

Boundary rules for the first slice: do not reuse observability Telegram env values, do not require email before the first message, do not add a dedicated contact or email field, do not create threads before the first real visitor message, do not add CAPTCHA or Turnstile, do not auto-open the widget, do not use timed popups, do not imply fake online availability, do not promise response times, do not ship operator buttons beyond `Close thread`, do not support uploads or binary attachments, do not add protected workspace support surfaces, do not auto-send AI replies to customers, do not introduce a third-party widget script, do not add broad CRM behavior, and do not use Convex local mode.

## Risks and Watchpoints

Telegram support can look deceptively simple. The real risk is not drawing a bubble; it is separating customer support from production incidents, validating webhook input, preserving privacy, and preventing bot buttons from becoming unaudited side effects.

Anonymous visitors can send arbitrary text. The first implementation needs token-scoped thread access, length limits, per-token cooldown, pending-message caps, global send caps, explicit retention fields, and clear failure states so the widget cannot become an unbounded spam pipe.

The homepage already has conversion-critical controls. The support launcher must not cover the product-preview CTA, pricing CTA, or sticky mobile controls.

Telegram webhook updates are external input. Parse and validate them at the boundary, reject unknown chats, unknown operators, unmapped forum topics, unmapped message ids, and never trust callback data without checking it maps to an existing support action.

Prompt and draft buttons should help Parker, not impersonate Parker. The default mode is draft-only until a later slice deliberately approves customer-visible automation.

Provider setup is part of the shipped contract. If an implementation requires BotFather, bot membership, webhook secret, Vercel env, Convex env, or local env values, the same change must document exact setup and verification steps.

## Outcomes & Retrospective

This Program is active. The expected outcome is a production-ready support chat where visitors can talk to Ship by Sunday from the landing page, Parker can answer in Telegram, and the Telegram bot can expose safe structured actions that speed up support without hiding customer-facing automation.

The retrospective should be filled after all required slices land, including which support actions shipped, which automation remained draft-only, what provider setup became permanent, whether retention automation worked as designed, and what was learned from real support use.

## Validation and Acceptance

At Program completion, the homepage must have a polished support widget that works on desktop and mobile without covering primary conversion controls. Visitors must be able to start a thread, send a message, receive Parker's Telegram reply, and recover gracefully when the bridge is unavailable.

Slice 1 contact capture is accepted when the widget has no dedicated email/contact field, no email validation gate, and no separate lead form step. Visitors can type contact details naturally in chat, while any explicit `Ask for email` flow remains a later structured operator action.

Telegram customer support must use dedicated support env variables and a dedicated support bot/private supergroup. The existing observability Telegram token and chat must remain incident-only.

Telegram topic naming is accepted when support topics use a generated support id plus safe metadata such as entry surface and date, and do not include visitor names, emails, message text, product details, or other user-supplied content in the topic title.

Telegram topic headers are accepted when the first bot message in every support topic contains safe operator context, includes the `Close thread` action, precedes the visitor's first message, and avoids visitor token, raw email, message text, or hidden identifiers that do not help Parker operate the thread.

Convex must own support visitors, threads, messages, delivery metadata, retention timestamps, and operator actions. Thread state should be queryable for the widget and auditable for operator actions. Anonymous website access must be scoped by browser-held token and Convex-stored hash. Unknown Telegram chats, unknown operators, unmapped replies, invalid callback data, and missing provider setup must fail closed.

Signed-in visitor association is accepted when the app may attach `clerkUserId` to the support visitor or thread as optional metadata, but every widget read/write still requires the browser support token. A signed-in session alone must not grant access to arbitrary support threads in Slice 1.

Homepage-only scope is accepted when the widget renders on the public homepage only, no protected workspace route exposes the support UI in Slice 1, and any future workspace support is deferred to the authenticated-support slice with its own product-context and privacy design.

Delivery state is accepted when visitor messages are persisted before Telegram delivery starts, the widget renders sending, delivered-to-Parker, and delivery-failed states, Telegram delivery failures retain the message in Convex, visitors get a clear fallback link, and the backend records enough error metadata to retry or debug without exposing message text to analytics.

Retry behavior is accepted when Slice 1 records `deliveryAttemptCount`, `lastDeliveryError`, and `lastDeliveryAttemptAt`, provides a maintainer-only Convex recovery action that retries one stored failed visitor message after setup repair, documents how to repair common Telegram env or permission failures before retrying, protects that action with `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and does not introduce automatic background retry scheduling until the hardening slice.

Retention is accepted when open support threads remain available, idle anonymous threads are auto-closed after 14 days, closed transcript bodies are retained for 90 days, purged threads no longer expose message bodies, and the matching Telegram forum topic is deleted or clearly marked for manual cleanup if Telegram deletion fails.

Abuse control is accepted when anonymous visitors can still send without CAPTCHA, but the backend enforces one open thread per anonymous token, rejects overlong messages, throttles rapid sends, blocks additional visitor sends after too many unanswered pending messages, protects Telegram delivery with a global hourly cap, and exposes a kill switch that renders the widget as a fallback Telegram link.

Widget launch behavior is accepted when the support surface never opens itself, never uses timed interruption, never claims real-time availability without proof, renders as a quiet fixed launcher, opens as a compact desktop panel, opens as a mobile bottom sheet, and stays clear of primary homepage conversion controls across desktop and mobile screenshots.

Visitor identity is accepted when launcher and header copy use Parker-first language such as "Message Parker" or "Ask Parker," while error, disabled, and fallback states use "Ship by Sunday support" so the personal support promise and system ownership stay distinct.

Support expectation copy is accepted when the starter message invites questions about fit, setup, checkout, or the visitor's codebase, says Parker will reply in the widget when available, and avoids green dots, "online" labels, and response-time promises.

Analytics is accepted when support events record only lifecycle metadata such as page path, thread status, delivery status, and error class, and never send message bodies, emails, Telegram ids, visitor tokens, or transcript text to PostHog.

Operator buttons must be structured, typed, and auditable. AI-generated output must be operator-approved before it becomes customer-visible unless a later explicit decision changes that policy with tests and docs.

The first operator button is accepted when `Close thread` is available in the mapped Telegram topic, only allowlisted operators can use it, the action is audited, the support thread moves to a closed state, the website widget renders that closed state, and no other operator buttons ship in Slice 1.

Text-only scope is accepted when the widget accepts plain text and links-as-text, rejects or ignores file/image/voice/binary inputs, Telegram-side media messages do not become website-visible visitor replies in Slice 1, and future attachment support is deferred behind a separate storage, privacy, retention, and provider-mapping decision.

External setup docs must say what to create in Telegram, where to create it, exact bot/chat/webhook requirements, which environment owns each value, where values go, how to verify the bridge, and what failure looks like when setup is missing or misconfigured.

The support setup contract is accepted when `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, and `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN` are documented as Convex env values, the webhook URL uses the Convex HTTP-actions site origin from `NEXT_PUBLIC_CONVEX_SITE_URL`, and the setup doc names BotFather, private supergroup/forum-topic requirements, bot admin permissions, recovery-token usage, verification steps, and failure modes.

Validation should include support token storage tests, support validators, Telegram update parsing tests, delivery classification tests, Convex model tests for thread/message lifecycle and abuse limits, maintainer recovery authorization tests, webhook route/action integration tests, widget integration-ui tests for open/send/failure/closed states, desktop and mobile browser proof, `bun run programs:lint`, hosted Convex dev validation for Convex implementation slices, and broad app gates: `bun run format`, `bun lint`, and `bun typecheck`. Full hosted e2e is not required by default unless the implementation touches auth, checkout, entitlement, release proof, or other release-sensitive paths.

## Artifacts and Notes

Official Telegram anchors:

- Telegram links: `https://core.telegram.org/api/links`
- Telegram Bot API: `https://core.telegram.org/bots/api`
- Telegram bot features and business mode: `https://core.telegram.org/bots/features`

Third-party pattern anchors:

- Elfsight Telegram Chat feature examples: `https://elfsight.com/telegram-chat-widget/features/`
- TeleChat site pattern: `https://www.telechat.site/`

Important repo anchors:

- `apps/web/content/docs/configure-the-homepage.mdx`
- `apps/web/config/product.ts`
- `apps/web/app/_content/home-page.ts`
- `apps/web/app/_lib/home-page-render-model.ts`
- `apps/web/app/_components/home-page/home-page.tsx`
- `apps/web/convex/schema.ts`
- `apps/web/convex/env.ts`
- `apps/web/convex/observability/model.ts`
- `docs/internal/observability.md`

## Interfaces and Dependencies

This Program depends on the homepage shell contract, Convex hosted backend state, Telegram Bot API, Telegram webhook delivery, environment variable setup in local/preview/production, Vercel or Convex HTTP routing for public webhooks, PostHog support analytics if later added, Linear if issue-draft buttons ship, and OpenAI/Codex boundaries if prompt-generation buttons ship.

Child ExecPlans should carry `program_id: telegram-support-bot` and `planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-<N>.md` in their frontmatter.
