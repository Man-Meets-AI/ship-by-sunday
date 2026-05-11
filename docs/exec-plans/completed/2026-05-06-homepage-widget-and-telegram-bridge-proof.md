---
title: Homepage Widget And Telegram Bridge Proof
status: complete
created_at: 2026-05-06
completed_at: 2026-05-06
summary: Build the first homepage support chat loop so a visitor can message Parker on the site and Parker can reply from Telegram.
post_build_recap: The homepage now has a first-party Message Parker widget, HttpOnly support-session bridge, Convex support model, Telegram webhook/provider path, setup docs, replay masking proof, and focused validation; live Telegram provider proof is pending support-specific Convex env setup.
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-1.md
read_when:
  - Resuming the first Telegram support implementation slice.
  - Changing homepage support UI, Convex support state, or Telegram support bot delivery.
  - Validating the support widget before adding AI drafts or broader operator buttons.
---

# Homepage Widget And Telegram Bridge Proof

This is a living execution plan. Keep it current as implementation, validation, discoveries, and decisions change.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday needs a support channel that keeps visitors on the landing page while letting Parker answer from the Telegram app. After this slice, a visitor on `/` can open a quiet support launcher, send a text message without entering an email address or leaving the site, and later see Parker's Telegram reply in the same widget. Parker receives each visitor thread in a dedicated private Telegram support supergroup, replies normally inside the mapped forum topic, and can close the thread with one audited `Close thread` button.

The visible proof is the core loop: open the homepage, open `Message Parker`, send a message, observe the message stored in Convex before Telegram delivery, see it appear in a Telegram forum topic through the dedicated support bot, reply as an allowlisted operator, and see the reply render live in the website widget. If Telegram setup is missing or delivery fails, the visitor should see a clear fallback to `https://t.me/parkerrex`, and the failed message should remain in Convex with safe delivery metadata.

## Progress

- [x] 2026-05-06 EDT: Created this ExecPlan from `docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-1.md`.
- [x] 2026-05-06 EDT: Read root `AGENTS.md`, `apps/web/AGENTS.md`, `docs/exec-plans/PLANS.md`, `apps/web/convex/_generated/ai/guidelines.md`, the Program packet, and the first planning brief.
- [x] 2026-05-06 EDT: Inspected the homepage route, homepage render model, homepage content, Convex HTTP router, Convex env helper, Convex schema, root Convex client provider, observability Telegram code, PostHog client, app docs registry, and focused test layout.
- [x] 2026-05-06 EDT: Incorporated review hardening for main-checkout execution, HttpOnly support session storage, exact Telegram setup, retry-safe webhook responses, exact forum-topic permissions, and PostHog replay masking proof.
- [x] 2026-05-06 EDT: Implemented the Convex support schema, validators, support session token hashing, lifecycle model, abuse controls, delivery state, Telegram provider helpers, maintainer recovery action, and generated Convex bindings.
- [x] 2026-05-06 EDT: Implemented the Telegram support HTTP action at `/telegram/support/webhook`, outbound forum-topic creation and visitor-message delivery, inbound operator reply parsing, operator allowlisting, authenticated ignored-update behavior, and the `Close thread` callback.
- [x] 2026-05-06 EDT: Implemented the homepage-only Message Parker widget, Next support-session routes backed by the HttpOnly `__Host-sbs_support_session` cookie, message reads/sends, delivery/closed/fallback states, metadata-only analytics, and PostHog replay masking attributes.
- [x] 2026-05-06 EDT: Documented Telegram support setup in `apps/web/content/docs/telegram-support-bot.mdx`, registered the docs page, updated environment-variable docs, and updated `apps/web/.env.local.example`.
- [x] 2026-05-06 EDT: Ran `bun --cwd apps/web convex codegen`, which generated bindings and uploaded the support Convex functions to hosted Convex dev.
- [x] 2026-05-06 EDT: Focused validation passed: support unit tests, widget integration-ui test, `bun --cwd apps/web lint`, `bun --cwd apps/web format:check`, `bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md`, `bun run programs:lint`, `bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs`, and `git diff --check`.
- [x] 2026-05-06 EDT: Browser proof passed on `http://localhost:3105/`: desktop `1440x900` and mobile `390x844` screenshots showed the launcher and open panel within the viewport, no console errors, `data-ph-no-capture="true"` on the transcript log, and `data-ph-mask="true"` on the input.
- [x] 2026-05-06 EDT: Repo completion gates passed: `bun run format`, `bun lint`, and `bun typecheck`.
- [x] 2026-05-06 EDT: Confirmed support-specific Convex env keys are not configured yet in hosted dev, so the live Telegram topic/reply loop remains blocked on provider setup. The setup doc now records exact env, webhook, permission, and verification steps.

## Surprises & Discoveries

Code inspection confirmed the root app already mounts `ConvexProviderWithClerk` in `apps/web/platform/convex/convex-client-provider.tsx`, but review found that using a JavaScript-readable bearer token for transcript access would create an unnecessary XSS and local-device exposure. The shipped widget uses a narrow Next support-session bridge backed by an HttpOnly cookie for transcript reads and sends, while Convex remains the durable state owner. Code inspection also confirmed `apps/web/convex/http.ts` already owns provider HTTP actions, so the Telegram webhook belongs there rather than in a Next route.

Convex functions that call other functions in the same file through `internal.support.*` need explicit return annotations to avoid TypeScript circular inference. The support action and webhook action now annotate `Promise<SupportThreadState>` and `Promise<TelegramSupportWebhookResult>` where needed.

`bun --cwd apps/web convex codegen` both regenerated bindings and uploaded functions to hosted Convex dev. The deployment does not yet have `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, or `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, so live Telegram provider proof could not be run without completing the documented setup.

## Decision Log

Decision: Use a dedicated first-party homepage widget rather than a third-party script.
Rationale: The widget must match the homepage visual system, keep customer support data inside repo-owned Convex state, and evolve into typed operator actions. A third-party script would add another data processor and make custom Telegram-side actions harder to audit.
Date: 2026-05-06

Decision: Use Convex as the support state owner.
Rationale: The website needs live subscribed messages, Telegram replies need a durable backend target, and Convex already owns provider webhook mutations in this app. Convex HTTP actions can receive Telegram updates while mutations keep support records consistent.
Date: 2026-05-06

Decision: Use a narrow Next support-session bridge for anonymous website transcript reads and visitor sends, backed by internal Convex functions.
Rationale: A visitor send must persist the message before attempting external Telegram delivery, but the browser should not hold the raw support credential as a JavaScript-readable bearer token. Next route handlers can read the HttpOnly support session cookie, call server-facing Convex functions, and return only widget-safe thread state. Convex still owns support visitors, threads, messages, delivery metadata, and Telegram delivery.
Date: 2026-05-06

Decision: Store the anonymous support session token in an HttpOnly cookie and store only its hash in Convex.
Rationale: Anonymous visitors need to read and write their own thread without login, but OWASP warns against storing session identifiers in local storage because JavaScript can read them. The support session token should be minted by the server, returned as a `__Host-sbs_support_session` cookie with `HttpOnly`, `SameSite=Lax`, `Path=/`, no `Domain`, and `Secure` in production, and hashed before Convex storage. The widget must not read or persist the raw token.
Date: 2026-05-06

Decision: Create durable support state only on first real visitor message.
Rationale: Opening the widget is local UI state. Creating Convex rows or Telegram forum topics on open would create noise and empty records.
Date: 2026-05-06

Decision: Keep Slice 1 text-only and contact-form-free.
Rationale: The first slice proves support chat, not file intake or lead capture. Visitors can type links or contact details naturally in the message body, but the widget must not render uploads, a dedicated email field, an email validation gate, or a separate lead-form step.
Date: 2026-05-06

Decision: Use a private Telegram supergroup with forum topics enabled.
Rationale: One forum topic per support thread keeps Parker's Telegram inbox organized and maps directly to Telegram `message_thread_id` for outbound and inbound delivery.
Date: 2026-05-06

Decision: Ship only the `Close thread` operator button in this slice.
Rationale: `Close thread` proves callback parsing, operator allowlisting, support action audit, lifecycle mutation, and website closed-state rendering without widening into AI drafts, checkout links, Linear drafts, or canned customer-visible sends.
Date: 2026-05-06

Decision: Track analytics only as safe lifecycle metadata.
Rationale: Support messages can contain private product context, contact details, or customer plans. PostHog events may record event names such as widget opened, thread created, message sent, reply received, send failed, and fallback clicked, but never message bodies, emails, Telegram ids, visitor tokens, or transcript text.
Date: 2026-05-06

Decision: Include a maintainer-only recovery action for failed Telegram deliveries.
Rationale: Store-first delivery means a visitor message can be safely retained even when Telegram delivery fails. A separate no-UI recovery action lets a maintainer retry one stored failed message after fixing env or bot permissions without asking the visitor to resend, while still avoiding automatic background retries in Slice 1.
Date: 2026-05-06

## Outcomes & Retrospective

This slice shipped the first-party support loop foundation. The public homepage now renders a passive `Message Parker` launcher from the homepage render-model contract. Opening it shows a compact desktop panel or mobile bottom sheet, reads thread state through `/api/support/messages`, and sends visitor text through the same route without exposing a browser-readable support token. The route creates or reuses the HttpOnly `__Host-sbs_support_session` cookie, sets `Cache-Control: no-store`, and calls Convex server-side.

Convex now owns `supportVisitors`, `supportThreads`, `supportMessages`, `supportOperatorActions`, and `supportRateLimitBuckets`. The model hashes the support session token before lookup or storage, creates visitor/thread/message records lazily on first send, enforces message length, cooldown, pending-message cap, global hourly cap, and kill-switch behavior, records explicit delivery status, and exposes a maintainer-only failed-delivery recovery action protected by `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`.

Telegram support now has a dedicated provider path separate from incident observability. The Convex HTTP action at `/telegram/support/webhook` verifies `X-Telegram-Bot-Api-Secret-Token`, returns non-2xx for auth failures or invalid JSON, returns 200 ignored responses for authenticated noise, maps allowlisted operator text replies into website-visible operator messages, and audits the `Close thread` callback. Outbound delivery stores visitor messages first, creates a forum topic when needed, posts a safe header with `Close thread`, sends the visitor message, and records delivered or failed metadata.

Setup docs now live in `apps/web/content/docs/telegram-support-bot.mdx`, with registry entries and environment docs updated. The docs name BotFather setup, dedicated supergroup/forum-topic requirements, `setWebhook.secret_token`, `X-Telegram-Bot-Api-Secret-Token`, Telegram's secret-token character and length constraints, `allowed_updates`, `getWebhookInfo` checks, `can_manage_topics`, and `can_delete_messages`.

Validation passed for focused support tests, widget integration UI, docs/plan/program linting, browser proof, and the repo gates. Desktop and mobile browser proof on `http://localhost:3105/` showed the widget correctly framed with no console errors, and proved replay masking attributes on transcript and input DOM. The remaining gap is provider setup: hosted Convex dev does not yet have the support-specific Telegram env values, so the real Telegram topic/reply loop is implemented but not live-proven.

## Context and Orientation

This work happens in the `apps/web` app. The public homepage route is `apps/web/app/page.tsx`, which renders `apps/web/app/_components/home-page/home-page.tsx`. The homepage shell deliberately separates control, copy, render decisions, and presentation through `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, and the component tree under `apps/web/app/_components/home-page/`. The support widget should enter through that same homepage seam so future agents can find it.

The homepage is a server component tree until it reaches interactive client components. The support widget itself must be a client component because it uses form input, local open/closed state, and client-side polling or fetching for widget-safe thread state. The app already mounts `ConvexProviderWithClerk` at the root in `apps/web/platform/convex/convex-client-provider.tsx`, but anonymous transcript reads and writes must go through Next route handlers that can read an HttpOnly support session cookie. Direct Convex React hooks are still available for non-sensitive public state, but not for credential-bound support transcripts unless a later design proves a short-lived, in-memory, non-persistent read token that does not expose the main support session.

Convex code lives under `apps/web/convex`. Before implementation, reread `apps/web/convex/_generated/ai/guidelines.md`. Use hosted Convex dev only; do not switch this repo into Convex local mode. HTTP endpoints are registered in `apps/web/convex/http.ts` through `httpRouter` and `httpAction`. Environment parsing for Convex functions is in `apps/web/convex/env.ts`. The existing production-incident Telegram delivery in `apps/web/convex/observability/model.ts` is useful as a provider-call reference, but it is a negative ownership example: customer support must not reuse `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, incident tables, or incident delivery semantics.

The new support implementation should be feature-local. A reasonable backend shape is `apps/web/convex/support/validators.ts`, `apps/web/convex/support/model.ts`, `apps/web/convex/support/telegram.ts`, `apps/web/convex/support.ts`, and `apps/web/convex/supportAdmin.ts` for maintainer-only failed-delivery recovery. Use exact names that describe support behavior; do not create generic files named `utils`, `helpers`, or `misc`.

The browser support widget can live under `apps/web/app/_components/home-page/support/`. Put the visual shell in a component such as `home-page-support-widget.tsx`, state orchestration in a hook such as `use-home-page-support-chat.ts`, and support API calls in a small file such as `home-page-support-api-client.ts`. Do not add browser token storage for the support session. If the widget stores local UI preferences such as open state, those preferences must not authorize support transcript access.

The Next support-session bridge can live under `apps/web/app/api/support/`. A practical shape is `apps/web/app/api/support/session/route.ts` to create or refresh the HttpOnly cookie and `apps/web/app/api/support/messages/route.ts` to read the current thread and send visitor text through server-facing Convex functions. These route handlers should set `Cache-Control: no-store`, validate request bodies at the boundary, and never return the raw support session token or token hash.

Docs for provider setup should live in the shipped app docs because external setup is part of the product contract. Add a page such as `apps/web/content/docs/telegram-support-bot.mdx`, then register it in `apps/web/content/docs/_meta.ts` and `apps/web/app/docs/_server/docs-content.ts`. Update `apps/web/content/docs/environment-variables.mdx` and `apps/web/.env.local.example` for the local contract. If the implementation changes local QA, update `apps/web/content/docs/local-qa.mdx`.

Plain-language definitions for this plan: a support visitor is one server-minted anonymous support session cookie plus optional Clerk metadata. A support thread is the conversation visible in the website widget and mapped to one Telegram forum topic. A support message is one visitor, operator, or system text record inside a thread. A support action is an audited operator action, such as closing the thread from Telegram. A delivery attempt is one attempt to send a stored visitor message to Telegram.

### In Scope

This plan includes dedicated support environment variables in Convex env, Convex support tables, validators, support session token hashing, lazy first-message thread creation, text-only support messages, retention fields, first-slice abuse controls, outbound Telegram topic creation and message delivery, inbound Telegram webhook parsing, Telegram operator allowlisting, normal Telegram replies becoming website-visible operator replies, one `Close thread` inline button, homepage-only support widget UI, an HttpOnly support session cookie bridge, delivery states, closed-state rendering, metadata-only analytics events, setup docs, focused tests, and desktop/mobile browser proof.

The required support environment values are `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, and `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`. The admin recovery token protects the no-UI maintainer action that retries one stored failed visitor message after provider setup is repaired; do not reuse an existing webhook, observability, or operator secret for that boundary.

### Out Of Scope

Do not reuse the observability Telegram bot, token, chat id, delivery code, or incident tables. Do not add a third-party widget script. Do not add uploads, images, screenshots, voice notes, file storage, or binary attachments. Do not add a dedicated contact/email field or email validation step. Do not add CAPTCHA or Turnstile in this slice. Do not auto-open the widget, use timed popups, show a green online dot, or promise a response time. Do not render support inside protected workspace routes. Do not auto-send AI-generated customer-visible text. Do not add AI draft buttons, prompt generation, checkout links, Linear drafts, canned replies, multi-operator assignment, public CRM views, customer email notifications, or automatic background delivery retries.

## Plan of Work

Start by adding the backend domain contract. Define explicit validators for support visitor status, thread status, message source, delivery status, action type, action status, visitor kind, delivery failure class, and Telegram update parse results. Add Convex schema tables for support visitors, support threads, support messages, support operator actions, and any rate-limit buckets needed for the global hourly cap. Keep child items as separate tables rather than arrays on a thread. Add indexes for token-hash lookup, one open thread per visitor, thread lookup by Telegram topic id, messages by thread and creation time, actions by thread and creation time, and rate-limit bucket key.

Implement support session and lifecycle helpers next. The Next session route should create a high-entropy support session token on first use, set it as `__Host-sbs_support_session`, and only pass the raw token server-to-server to Convex. Convex should hash that token before lookup or insert and should never persist or return the raw token. The first visitor send should create or reuse the visitor, create or reuse one open thread for that visitor, create the message, increment pending counters, enforce message length and rate limits, and return enough state for the delivery action to deliver the message to Telegram.

Implement Telegram outbound delivery as a Convex action. The visitor-facing Next route should call a server-facing Convex action that calls an internal mutation first to store the visitor message with a delivery state such as `sending`, then calls Telegram `createForumTopic` when the thread has no topic yet, sends a bot-authored context header with a `Close thread` inline keyboard, sends the visitor message into the topic, and marks the message `delivered_to_parker` with Telegram message ids. On any provider failure, mark the message `delivery_failed`, record attempt count, last attempt time, safe error class, and a trimmed error message that does not include visitor text, then return a widget-safe failure result.

Implement Telegram inbound webhook parsing in `apps/web/convex/http.ts`. The route should use a path such as `/telegram/support/webhook`, require the incoming `X-Telegram-Bot-Api-Secret-Token` header to match `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, parse JSON at the boundary, and never trust callback data without checking it maps to the current thread/topic state. Configure Telegram with `setWebhook.secret_token` and `allowed_updates` set to only `message` and `callback_query`. Missing or wrong secret headers should return a deliberate non-2xx response because the update is unauthenticated. Invalid JSON can return 400. Authenticated but unsupported update shapes, unknown chats, unknown operators, unmapped topics, media messages, commands, bot messages, and non-text replies should return 200 with an ignored response so Telegram does not retry them indefinitely. Normal text messages from allowlisted operators in mapped topics should insert operator support messages and clear pending visitor count.

Implement the `Close thread` button as a structured support action. The first header message in each Telegram topic should include a callback button whose callback data is short and maps to the support thread, such as a support id plus action name. The webhook should verify the chat, topic, operator id, and callback data before closing the thread. Closing should write a support operator action record, update the thread to a closed state, record closed timestamps and retention timestamps, answer the callback query where possible, and make the website widget render a closed state. Do not add any other operator buttons in this slice.

Implement the homepage widget after the backend contract is shaped. Add a support widget entry to the homepage control plane in `apps/web/config/product.ts`, support copy in `apps/web/app/_content/home-page.ts`, and support render data in `apps/web/app/_lib/home-page-render-model.ts`. Render the widget from `apps/web/app/_components/home-page/home-page.tsx` only when the homepage support widget is enabled. Keep the launcher quiet and fixed, with Parker-first copy such as `Message Parker` or `Ask Parker`. Desktop should open a compact panel. Mobile should open a bottom sheet. The widget must not cover the homepage's checkout, demo, or sticky mobile controls.

The widget should use the Next support-session bridge. It should query the current support thread through the support messages route, call the visitor-send route, render messages, and show explicit sending, delivered-to-Parker, delivery-failed, and closed states. Polling the route is acceptable for Slice 1 if direct Convex subscriptions would require exposing the raw support credential. It should expose `https://t.me/parkerrex` as a fallback only when the bridge is unavailable or the visitor intentionally chooses Telegram. Mark transcript containers and individual rendered message text with `data-ph-no-capture` or the existing `.ph-no-capture` block selector, and mark text inputs with `data-ph-mask`, `data-sensitive`, or the existing `.ph-mask` mask selector so session replay cannot capture support content.

Add metadata-only analytics through `capturePostHogProductEvent` where useful. Safe events include `support_widget_opened`, `support_thread_created`, `support_message_sent`, `support_reply_received`, `support_send_failed`, and `support_fallback_clicked`. Safe properties include page path, thread status, delivery status, and error class. Do not pass message bodies, raw token values, token hashes, emails, Telegram ids, operator ids, visitor names, or transcript text into PostHog.

Document external setup before calling the slice done. The setup doc should explain BotFather bot creation, dedicated private support supergroup creation, forum topics enabled, exact bot admin permissions, how to discover the support chat id, how to set the Telegram webhook to the Convex HTTP-action site URL from `NEXT_PUBLIC_CONVEX_SITE_URL`, how to configure local, preview, and production Convex env values, how to verify a visitor message creates a topic and Parker reply returns to the site, and what failure looks like for missing env, wrong chat id, missing forum-topic permissions, unknown operator id, invalid webhook secret, and Telegram delivery failure. Name the exact Telegram webhook pieces: call `setWebhook` with `secret_token` set to the same value as `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, expect Telegram to send `X-Telegram-Bot-Api-Secret-Token`, keep the secret token 1 to 256 characters using only `A-Z`, `a-z`, `0-9`, `_`, and `-`, set `allowed_updates` to `["message", "callback_query"]`, and verify `getWebhookInfo` shows the expected URL, allowed updates, low `pending_update_count`, and no `last_error_message`. Name the exact forum-topic permissions: the bot needs admin rights with `can_manage_topics` to create and close topics and `can_delete_messages` to delete a forum topic during retention cleanup.

## Milestones

The first milestone is the Convex support data model and visitor access contract. At the end, the schema has support visitor, thread, message, action, and rate-limit records; support session token hashing works; one open thread per anonymous support session is enforced; text length, per-session cooldown, pending-message cap, and global hourly cap are modeled; retention timestamps exist; and focused unit tests prove lifecycle and abuse behavior without calling Telegram.

The second milestone is Telegram outbound and inbound bridge behavior. At the end, a visitor-send route stores a message before Telegram delivery, creates a forum topic for the first message, posts a safe topic header, posts the visitor message, records delivery ids or failure metadata, and the webhook can turn an allowlisted operator's normal topic text into a website-visible reply. Tests should prove secret verification with `X-Telegram-Bot-Api-Secret-Token`, chat verification, operator allowlisting, topic mapping, authenticated ignored-update 2xx behavior, text-only handling, provider failure classification, and `Close thread` callback behavior.

The third milestone is the homepage widget. At the end, `/` renders a passive `Message Parker` launcher behind the homepage render-model contract, opens a compact desktop panel and mobile bottom sheet, uses the HttpOnly support session bridge, sends through Next route handlers into Convex, polls or fetches replies, renders delivery and closed states, masks message content from analytics/session replay, and stays clear of existing conversion controls. Integration-ui tests should prove open, send, failure, fallback, closed states, and replay-masking DOM attributes.

The fourth milestone is setup docs, browser proof, and closeout. At the end, app docs describe Telegram provider setup and env ownership, `.env.local.example` and environment docs list the support env contract, desktop and mobile browser proof show the widget correctly framed on the homepage, focused tests pass, broad gates pass, this ExecPlan is updated, and the Program Slice Ledger points to this child plan with observed validation.

## Concrete Steps

Work from the main checkout:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing implementation code, reread the required instructions and versioned framework docs:

    sed -n '1,260p' AGENTS.md
    sed -n '1,220p' apps/web/AGENTS.md
    sed -n '1,260p' docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md
    sed -n '1,320p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,180p' /Users/bazelrex/Developer/ship-by-sunday/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
    sed -n '1,220p' /Users/bazelrex/Developer/ship-by-sunday/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md

Inspect the implementation anchors before writing code:

    sed -n '1,180p' apps/web/config/product.ts
    sed -n '1,220p' apps/web/app/_content/home-page.ts
    sed -n '1,220p' apps/web/app/_lib/home-page-render-model.ts
    sed -n '1,160p' apps/web/app/_components/home-page/home-page.tsx
    sed -n '1,280p' apps/web/convex/http.ts
    sed -n '1,120p' apps/web/convex/env.ts
    sed -n '1,380p' apps/web/convex/schema.ts
    sed -n '1,560p' apps/web/convex/observability/model.ts
    sed -n '1,120p' apps/web/lib/observability/posthog-client.ts

Create the backend support boundary. Prefer these files unless implementation inspection finds a stronger existing local pattern:

    apps/web/convex/support/validators.ts
    apps/web/convex/support/model.ts
    apps/web/convex/support/telegram.ts
    apps/web/convex/support.ts
    apps/web/convex/supportAdmin.ts

Create the Next support-session bridge. Prefer these files unless implementation inspection finds a stronger existing local pattern:

    apps/web/app/api/support/session/route.ts
    apps/web/app/api/support/messages/route.ts
    apps/web/app/api/support/support-session-cookie.ts

Update `apps/web/convex/schema.ts` with separate support tables. A practical first shape is `supportVisitors`, `supportThreads`, `supportMessages`, `supportOperatorActions`, and `supportRateLimitBuckets`. Keep indexes motivated by reads named in this plan. Do not store an unbounded messages array on `supportThreads`.

Update `apps/web/convex/env.ts` with support env keys. Add support provider and maintainer-recovery code that reads:

    TELEGRAM_SUPPORT_BOT_TOKEN
    TELEGRAM_SUPPORT_CHAT_ID
    TELEGRAM_SUPPORT_WEBHOOK_SECRET
    TELEGRAM_SUPPORT_OPERATOR_USER_IDS
    TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN

Implement the server-facing visitor send function and internal mutation helpers. The Next route should accept message text, page path, and current entry surface from the browser, read or mint the HttpOnly support session cookie, and pass the raw token only server-to-server into Convex. It should not accept a caller-provided visitor id, thread id, Clerk user id, operator id, delivery status, Telegram id, raw support token, or token hash for authorization. Derive optional Clerk metadata server-side only when identity is present.

Implement the Telegram webhook in `apps/web/convex/http.ts` with an exact path such as `/telegram/support/webhook`. Validate the `X-Telegram-Bot-Api-Secret-Token` header against `TELEGRAM_SUPPORT_WEBHOOK_SECRET`. Use a strict parser for update payloads. For inbound operator messages, accept only text from configured operator user ids in the configured support chat and mapped topic. For callback queries, accept only the `Close thread` action in this slice. Return non-2xx only for missing or wrong secret headers and invalid JSON. Return 200 ignored responses for authenticated unsupported updates, unknown chats, unknown operators, unmapped topics, media, commands, bot messages, and non-text replies.

Create the homepage widget files under a feature-local folder such as:

    apps/web/app/_components/home-page/support/home-page-support-widget.tsx
    apps/web/app/_components/home-page/support/home-page-support-widget-panel.tsx
    apps/web/app/_components/home-page/support/use-home-page-support-chat.ts
    apps/web/app/_components/home-page/support/home-page-support-api-client.ts

Add support widget control and copy through:

    apps/web/config/product.ts
    apps/web/app/_content/home-page.ts
    apps/web/app/_lib/home-page-render-model.ts
    apps/web/app/_components/home-page/home-page.tsx

Add setup docs and docs registry entries:

    apps/web/content/docs/telegram-support-bot.mdx
    apps/web/content/docs/_meta.ts
    apps/web/app/docs/_server/docs-content.ts
    apps/web/content/docs/environment-variables.mdx
    apps/web/.env.local.example

Add or update focused tests near the touched surfaces. Expected test files include:

    apps/web/tests/unit/support-session-cookie.test.ts
    apps/web/tests/unit/support-session-route.test.ts
    apps/web/tests/unit/support-message-route.test.ts
    apps/web/tests/unit/convex-support-model.test.ts
    apps/web/tests/unit/convex-support-admin.test.ts
    apps/web/tests/unit/support-telegram-update.test.ts
    apps/web/tests/unit/convex-env.test.ts
    apps/web/tests/unit/convex-http-boundary.test.ts
    apps/web/tests/unit/home-page-render-model.test.ts
    apps/web/tests/unit/docs-content-loader.test.ts
    apps/web/tests/integration-ui/home-page-support-widget.test.tsx

Implement `apps/web/convex/supportAdmin.ts` as a maintainer-only no-UI recovery boundary for failed Telegram delivery. It should expose a narrow action or mutation that accepts a failed support message id and recovery token, verifies `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, verifies the message is still eligible for retry, records another delivery attempt, and reuses the same provider-delivery path as visitor sends. It must not create a second visitor message or accept arbitrary thread ids as proof of authority.

After each milestone, update this ExecPlan's `Progress`, `Surprises & Discoveries`, and `Decision Log` sections. After implementation, update `docs/programs/active/2026-05-06-telegram-support-bot/program.md` with the child plan status, validation evidence, and next recommended slice.

## Validation and Acceptance

Acceptance for this plan is a working homepage-to-Telegram-to-homepage loop, not just a rendered bubble. A visitor on `/` must be able to open the widget, send a text message without email, see a stored message status, recover when Telegram is unavailable, and see Parker's reply after an allowlisted Telegram operator replies in the mapped support topic.

The Convex model is accepted when anonymous access is scoped by the hash of the server-minted support session token, one open thread per support session is enforced, first message lazily creates the visitor and thread, support messages are separate rows, delivery metadata is explicit, retention timestamps exist, a maintainer-only recovery action can retry one stored failed visitor message, and abuse controls enforce message length, cooldown, pending-message cap, global hourly cap, and kill-switch behavior without CAPTCHA.

Telegram delivery is accepted when visitor messages are stored before delivery, a first visitor message creates one safe forum topic, the bot posts a safe context header before the visitor message, topic names contain only a support id plus safe metadata, provider failures mark the stored message failed, normal text replies from allowlisted operators become visitor-visible messages, unknown chats/operators/topics are ignored without creating support state, and `Close thread` is audited and reflected in the website. Auth failures for the Telegram secret header intentionally return non-2xx. Authenticated unsupported updates return 200 ignored responses so Telegram retry state stays clean.

The widget is accepted when it renders only on the public homepage, stays passive and on-demand, uses Parker-first copy, avoids online/SLA claims, opens as a compact desktop panel and mobile bottom sheet, never renders a contact/email field, uses the HttpOnly support session bridge instead of browser token storage, masks support content from analytics replay, and does not cover primary homepage conversion controls in desktop or mobile browser proof. Browser or integration-ui proof must assert that the transcript DOM has `data-ph-no-capture` or the equivalent block selector and text inputs have `data-ph-mask`, `data-sensitive`, or the equivalent mask selector.

External setup is accepted when app docs say what to create in Telegram, where to create it, exact bot and supergroup requirements, required permissions, Convex env names, webhook URL construction, local/preview/production ownership, verification steps, and failure modes. The setup doc must name `setWebhook.secret_token`, the incoming `X-Telegram-Bot-Api-Secret-Token` header, the 1 to 256 character Telegram secret-token constraint using only `A-Z`, `a-z`, `0-9`, `_`, and `-`, `allowed_updates` set to `message` and `callback_query`, `getWebhookInfo` verification, `can_manage_topics` for topic creation and closing, and `can_delete_messages` for retention cleanup that deletes forum topics. Chat history or local `.env` files are not sufficient setup documentation.

### Test Commands

Run focused unit tests first from the checkout root, updating file names if implementation chooses slightly different test ownership:

    bun run --cwd apps/web test:unit -- tests/unit/support-session-cookie.test.ts tests/unit/support-session-route.test.ts tests/unit/support-message-route.test.ts tests/unit/convex-support-model.test.ts tests/unit/convex-support-admin.test.ts tests/unit/support-telegram-update.test.ts tests/unit/convex-env.test.ts tests/unit/convex-http-boundary.test.ts tests/unit/home-page-render-model.test.ts tests/unit/docs-content-loader.test.ts

Run the widget integration UI proof:

    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx

Run app surface checks for the touched app:

    bun run --cwd apps/web format:check
    bun run --cwd apps/web lint
    bun run --cwd apps/web typecheck

Run plan, Program, docs, and diff checks:

    bun run plans:lint -- --plan docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs
    git diff --check

Before marking complete after code changes, run the repo completion gates unless a concrete blocker is recorded in this plan:

    bun run format
    bun lint
    bun typecheck

For browser proof, run the app against hosted Convex dev, never Convex local mode:

    bun run --cwd apps/web dev:web:only -- -p 3105

Then verify the homepage at `http://localhost:3105/` in one desktop viewport and one mobile viewport. If Telegram env is not configured locally, verify the configured failure state and fallback link, and record that limitation. If Telegram env is configured, send one test visitor message, reply in the mapped Telegram topic, and record the observed website reply.

Expected success means every command exits with code 0, the widget proof shows no text overlap or conversion-control coverage, support message bodies never appear in PostHog payload assertions, transcript DOM is blocked or masked from session replay, the support session cookie is HttpOnly and not readable from widget JavaScript, `getWebhookInfo` shows no Telegram retry backlog for ignored authenticated updates, and the Telegram loop is either proven live or the missing-provider limitation is recorded with the exact fallback behavior observed.

## Idempotence and Recovery

All first-slice schema changes should be additive. If implementation discovers that an existing table needs a breaking migration, stop and update this ExecPlan with a migration strategy before editing data shape. Do not delete existing app records.

Visitor send behavior must be safe to retry. If the first action stores a message and then Telegram delivery fails, a repeated send should not silently duplicate the old failed message unless the visitor explicitly sends again. Maintainer recovery should operate on a specific failed message id, verify `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and record another delivery attempt.

Webhook handling must be safe under Telegram retries. Use the Telegram update id or message id plus topic mapping to prevent duplicate operator replies or duplicate close actions where practical. Return deliberate non-2xx responses only for missing or wrong secret headers and invalid JSON. Authenticated unsupported updates should return 200 ignored responses. If exact de-duplication cannot be complete in the first implementation, document the residual risk and make duplicate close actions no-op once the thread is already closed.

If the support bot lacks forum-topic permissions, delivery should fail visibly, leave the visitor message in Convex, and tell the visitor to use the fallback link. Recovery is to repair bot permissions, including `can_manage_topics` for topic creation and closing plus `can_delete_messages` for future topic deletion, verify env and `getWebhookInfo`, then run the documented maintainer recovery action for the failed message. Asking the visitor to resend is a fallback only if the stored message is no longer eligible for recovery.

If the kill switch is enabled, the widget should avoid creating new threads and render the fallback Telegram path. Existing open threads should remain readable unless a later hardening decision changes that behavior.

If broad repo gates fail because of unrelated dirty checkout changes, do not revert unrelated files. Record the exact failure and determine whether it belongs to this support slice before continuing.

## Artifacts and Notes

Important Program artifacts:

    docs/programs/active/2026-05-06-telegram-support-bot/program.md
    docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-1.md
    docs/programs/active/2026-05-06-telegram-support-bot/converged-decision-packet.md
    docs/programs/active/2026-05-06-telegram-support-bot/plan-split-recommendation.md

Important homepage anchors:

    apps/web/config/product.ts
    apps/web/app/_content/home-page.ts
    apps/web/app/_lib/home-page-render-model.ts
    apps/web/app/_components/home-page/home-page.tsx
    apps/web/app/api/support/session/route.ts
    apps/web/app/api/support/messages/route.ts
    apps/web/lib/observability/posthog-client.ts

Important Convex and provider anchors:

    apps/web/convex/http.ts
    apps/web/convex/env.ts
    apps/web/convex/schema.ts
    apps/web/convex/observability/model.ts
    apps/web/platform/convex/convex-client-provider.tsx

Official Telegram anchors already captured by the Program:

    https://core.telegram.org/api/links
    https://core.telegram.org/bots/api
    https://core.telegram.org/bots/features

## Interfaces and Dependencies

This slice depends on Next.js App Router server/client component boundaries, Next route handlers, HttpOnly cookie handling, the existing homepage render-model contract, Convex hosted backend state, Convex HTTP actions, Telegram Bot API forum topics and inline keyboards, the dedicated Telegram support bot, PostHog browser analytics and replay masking selectors, and the app docs content registry.

The website-facing support interface should be a narrow Next route surface. A practical shape is a session route that creates or refreshes the `__Host-sbs_support_session` cookie, a messages route that reads the current visitor thread for that cookie, a send route or POST handler that sends visitor text, and no public client-facing mutation that accepts arbitrary thread ids for authorization. Every website read or write must require the HttpOnly support session cookie, and the raw token must travel only between Next and Convex.

The Convex support interface should expose only server-facing functions for the Next support routes plus the Telegram webhook. It should hash support session tokens before lookup, avoid returning token hashes, and keep direct browser Convex access out of transcript-bearing reads and writes.

The Telegram webhook interface must accept Telegram updates only at the configured Convex HTTP action path and verify `TELEGRAM_SUPPORT_WEBHOOK_SECRET` through the `X-Telegram-Bot-Api-Secret-Token` header. It must deliberately reject auth failures, return 200 ignored responses for authenticated unsupported updates, and ignore updates from the wrong chat, unknown topics, unknown operators, unsupported message types, and malformed callback data.

The Telegram provider interface should include only the methods this slice needs: create a forum topic, send a message with optional inline keyboard, answer a callback query where possible, and later delete or mark a topic during retention cleanup. The Slice 1 implementation may model deletion metadata without scheduling purge automation.

The required Convex env interface is:

    TELEGRAM_SUPPORT_BOT_TOKEN
    TELEGRAM_SUPPORT_CHAT_ID
    TELEGRAM_SUPPORT_WEBHOOK_SECRET
    TELEGRAM_SUPPORT_OPERATOR_USER_IDS
    TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN

The homepage support widget content interface should include launcher label, panel title, starter prompt, message placeholder, fallback label, disabled copy, sending label, delivered label, failed label, closed label, and privacy-safe analytics event names. It should not include a response-time promise, online state, email field label, or upload copy.
