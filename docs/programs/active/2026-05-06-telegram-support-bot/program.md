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

The current research is recorded in `research-pass-telegram-support-widget-and-bot.md`. The normalized implementation direction is `normalized-pass-telegram-support-bot.md`. The locked initiative decisions are in `converged-decision-packet.md`. Ordering is in `dependency-graph.md` and `plan-split-recommendation.md`. Risk review is in `cross-repo-review.md`. The latest immutable implementation brief is `planning-brief-7.md`, and `current-planning-brief.txt` points at that brief.

## Current State

Slices 1 through 5 have landed the custom customer-support foundation, structured Telegram operator actions, private AI-backed operator drafts, authenticated workspace entry, and operations hardening. The homepage renders a first-party `Message Parker` widget, signed-in buyers get a protected workspace `Ask Parker` launcher, anonymous visitor transcript access goes through an HttpOnly Secure support-session cookie and Next support routes, Convex owns support visitors, threads, messages, delivery metadata, operator actions, retention maintenance, and rate-limit buckets, and the dedicated Telegram support webhook/provider path is implemented separately from incident observability. Telegram support topics now include audited buttons for safe canned visitor replies, AI-backed private draft/prompt output, hot-lead marking, and close-thread lifecycle control. Post-review Telegram hardening now schedules AI generation in the same mutation that creates the action row, treats authenticated missing support env as `200` ignored webhook results, records operator-note delivery status on the action audit row, purges retained transcript bodies/generated output after the retention window, rejects duplicate manual retry while a retry is in flight, and exposes a token-protected operations snapshot.

The repo does have an observability Telegram path. It is intentionally for production incident delivery, not customer support. The observability bot reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, renders incident messages, and stores delivery metadata on incident records. This Program must not reuse that bot or data path.

The homepage has a clear control seam through `apps/web/config/product.ts`, `apps/web/app/_content/home-page.ts`, `apps/web/app/_lib/home-page-render-model.ts`, and `apps/web/app/_components/home-page/home-page.tsx`. A support widget should enter through the same content/render-model pattern so future agents can find and test it.

Convex is the natural state owner for support threads and messages because the website widget needs live subscribed messages and Telegram replies need a durable backend target. The implementation must use hosted Convex dev for Convex work and must not switch the repo to Convex local mode.

The current remaining setup gap is production Telegram setup and final Program closeout, but hosted Convex dev is now usable for product-shaping smoke tests. Hosted Convex dev support Telegram env has been repointed from the Worker forum bot/group to `@sbsprodbot` in the `SBS Website` forum group, with the bot verified as an admin that can manage topics and delete messages. The hosted dev support path has smoke proof for visitor delivery to Telegram, signed operator reply ingestion, customer-visible callback actions, deterministic AI fallback without `OPENAI_API_KEY`, live OpenAI Responses draft generation after key setup, close-thread lifecycle, metadata-only operations snapshot, first-message website acknowledgements, the simplified Parker keyboard, explicit AI draft send/discard decisions, duplicate-send idempotence, discard-blocks-send behavior, and close-thread retention timestamps. Production Convex has `OPENAI_API_KEY`, but production Convex support Telegram env remains unconfigured. The bot token used during setup was pasted in chat and must be rotated before production confidence. `apps/web/content/docs/telegram-support-bot.mdx` owns the setup and verification contract. The completed product slice is `docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md`, while `docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md` remains the closeout/prod-proof plan.

## Progress

- [x] 2026-05-06: Researched Telegram support patterns, official bot primitives, and the repo's existing Telegram observability boundary.
- [x] 2026-05-06: Created the Telegram Support Bot Program packet and selected the first vertical proof slice.
- [x] 2026-05-06: Locked first-slice architecture decisions for Telegram forum topics, Convex HTTP webhook handling, anonymous visitor support sessions, lazy thread creation, a Next support-session bridge, normal Telegram replies, operator buttons, and Telegram operator allowlisting.
- [x] 2026-05-06: Locked explicit support transcript retention: auto-close idle anonymous threads after 14 days, retain closed transcripts for 90 days, then purge message bodies and delete the matching Telegram forum topic while retaining minimal audit metadata.
- [x] 2026-05-06: Locked first-slice abuse controls: one open thread per anonymous support session, message length cap, per-session cooldown, pending-message cap before operator reply, global hourly cap, support kill switch, and no CAPTCHA in v1.
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
- [x] 2026-05-06: Locked optional Clerk association for signed-in visitors while preserving the HttpOnly support session cookie as the thread access authority in Slice 1.
- [x] 2026-05-06: Locked homepage-only scope for Slice 1; protected workspace support waits for the authenticated-support slice.
- [x] 2026-05-06: Locked safe Telegram topic naming: generated support id plus safe metadata only, with no visitor names, emails, message text, or product details in topic titles.
- [x] 2026-05-06: Locked Telegram topic header model: bot posts a safe context header before the first visitor message, with support id, entry surface/path, date, visitor kind, delivery status, and `Close thread`.
- [x] 2026-05-06: Locked Slice 1 contact capture scope: no dedicated email or contact field, no validation gate, and `Ask for email` remains a later structured operator action.
- [x] 2026-05-06: Created child ExecPlan `docs/exec-plans/active/2026-05-06-homepage-widget-and-telegram-bridge-proof.md` for Slice 1.
- [x] 2026-05-06: Incorporated review hardening into the Program and Slice 1 plan: main-checkout execution, HttpOnly support session storage, exact Telegram webhook setup, exact forum-topic permissions, retry-safe webhook responses, and PostHog replay masking proof.
- [x] 2026-05-06: Completed Slice 1 in `docs/exec-plans/completed/2026-05-06-homepage-widget-and-telegram-bridge-proof.md`: homepage widget, HttpOnly support-session bridge, Convex support model, Telegram webhook/provider path, maintainer recovery action, setup docs, focused tests, desktop/mobile browser proof, and repo gates all landed. Live Telegram provider proof remains blocked on support-specific Convex env setup.
- [x] 2026-05-06: Created `planning-brief-2.md` and child ExecPlan `docs/exec-plans/completed/2026-05-06-operator-actions-and-prompt-buttons.md` for Slice 2.
- [x] 2026-05-06: Completed Slice 2: expanded Telegram support topic buttons, generalized callback parsing, audited action records, duplicate callback protection, customer-visible canned sends, operator-only draft/prompt/summary/Linear-draft output, hot-lead marking, setup docs, hosted Convex codegen, focused support tests, widget integration-ui proof, docs/plan/program linting, and repo gates landed. Live Telegram button proof remains blocked on support-specific Convex env setup.
- [x] 2026-05-06: Created `planning-brief-3.md` and child ExecPlan `docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md` for Slice 3.
- [x] 2026-05-06: Completed Slice 3 in `docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md`: private OpenAI Responses API draft generation, scheduled Convex AI action handling, same-record support action audit patching, deterministic fallback notes, model/failure metadata, OpenAI env docs, focused AI/support tests, hosted Convex codegen, docs/plan/program linting, lint, typecheck, and touched-file formatting landed. Live Telegram/OpenAI proof remains blocked on support-specific Convex env and `OPENAI_API_KEY` setup.
- [x] 2026-05-06: Applied Telegram support hardening from review findings: atomic AI scheduling from the callback mutation, legacy stranded duplicate callback re-drive, authenticated setup-gap `200` ignored webhook behavior, operator-note delivery audit fields, delivery-failure tests, and corrected AI-scope docs.
- [x] 2026-05-06: Created `planning-brief-4.md` and child ExecPlan `docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md` for Slice 4.
- [x] 2026-05-06: Completed Slice 4: extracted reusable support widget modules, kept homepage support behavior stable, added the protected workspace `Ask Parker` launcher, passed workspace-scoped support metadata, documented the workspace entry, and validated with focused tests plus repo gates.
- [x] 2026-05-06: Created `planning-brief-5.md` and child ExecPlan `docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md` for Slice 5.
- [x] 2026-05-06: Completed Slice 5: added six-hour Convex support retention maintenance, transcript/generated-output purge, Telegram topic cleanup status, bounded manual retry eligibility, a token-protected operations snapshot, metadata-only support analytics proof, runbook docs, hosted Convex codegen, focused tests, and repo gates.
- [x] 2026-05-06: Created `planning-brief-6.md` and child ExecPlan `docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md` for live provider proof and Program closeout.
- [x] 2026-05-06: Ran the first live-provider readiness probe with secret values suppressed; hosted Convex dev has all required support provider env names missing or empty, so live Telegram/OpenAI proof is blocked on external setup.
- [x] 2026-05-07: Re-ran the live-provider readiness probe with secret values suppressed; hosted Convex dev still has all required support provider env names missing or empty, the local shell has no support bot token for `getWebhookInfo`, and the setup doc now includes the same presence-only probe for future operators.
- [x] 2026-05-07: Re-ran live-provider readiness after support bug fixes; hosted Convex dev and production Convex both still have all required support provider env names missing or empty, so the active closeout plan remains blocked on external setup.
- [x] 2026-05-07: Reused the existing Worker forum bot/group for hosted Convex dev support smoke, configured support Telegram env with `bunx convex env set`, registered the webhook, pushed current Convex functions with `bunx convex dev --once --typecheck disable`, and smoke-proved visitor delivery, signed operator reply ingestion, customer-visible callback action, deterministic AI fallback, close-thread lifecycle, and metadata-only operations snapshot. Live OpenAI proof remains blocked on `OPENAI_API_KEY`.
- [x] 2026-05-08: Verified `OPENAI_API_KEY` presence in hosted Convex dev and production without printing values. Re-ran the hosted Convex dev AI-backed callback proof on a fresh synthetic support thread; the action completed with `generatedOutputSource: "openai_responses"`, model `gpt-5.4-mini-2026-03-17`, private Telegram note delivery succeeded, and the synthetic thread was closed with retention timestamps. Production Telegram support proof remains blocked because production support Telegram env is missing.
- [x] 2026-05-08: Repointed hosted Convex dev support Telegram env to `@sbsprodbot` and the `SBS Website` forum group, verified topic-management and delete-message admin rights, delivered a synthetic support smoke message there, and closed the synthetic thread. The bot token was exposed in chat during setup and must be rotated.
- [x] 2026-05-08: Created `planning-brief-7.md` and child ExecPlan `docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md` for the simplified Parker-style operator workflow.
- [x] 2026-05-08: Completed `docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md`: first-message website acknowledgements, simplified Parker keyboard, Parker-style AI draft prompt, explicit `Send draft` and `Discard` callbacks, focused tests, setup docs, Program truth, hosted Convex dev deployment, and live `SBS Website` forum smoke proof all landed.

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

Decision: Identify anonymous support visitors with an HttpOnly Secure support session cookie and a Convex-stored token hash.
Rationale: The widget can support unauthenticated visitors without exposing arbitrary thread access, while avoiding a JavaScript-readable bearer token for support transcripts. The server mints the support session token, sets it as `__Host-sbs_support_session` with `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and no `Domain`, and Convex stores only its hash. Authenticated identity is derived from Convex auth when the support route has a Clerk Convex token; it is metadata, not the thread authority.
Date: 2026-05-06

Decision: Create the support visitor, Convex thread, and Telegram forum topic on first real visitor message.
Rationale: Opening the widget should not create Telegram noise or empty backend records. First send is the durable lifecycle boundary.
Date: 2026-05-06

Decision: Use a narrow Next support-session bridge for anonymous support transcript reads and writes.
Rationale: Convex remains the support state owner, but support transcripts can contain contact details and customer product context. A Next route boundary can read the HttpOnly support session cookie and call server-facing Convex functions without exposing the raw support credential to widget JavaScript. Direct Convex React hooks remain acceptable for non-sensitive public state, not for transcript-bearing anonymous support access in Slice 1.
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
Rationale: The landing-page chat should remain low-friction while still protecting Telegram delivery and operator attention. The first slice should enforce one open thread per anonymous support session, message length limits, per-session send cooldown, a cap on pending visitor messages before operator reply, a global hourly send cap, and a support kill switch that falls back to direct Telegram. CAPTCHA or Turnstile can be added later only if spam proves it necessary.
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
Rationale: Support messages may contain contact details, product details, and customer context. PostHog events should capture lifecycle and delivery signals such as widget opened, thread created, message sent, reply received, send failed, and fallback clicked, but must not include message bodies, emails, Telegram ids, visitor tokens, or transcript text. Session replay proof must also assert that rendered transcript DOM is blocked or masked, because metadata-only event payload checks do not prove replay privacy for visible text.
Date: 2026-05-06

Decision: Keep Telegram support provider setup in Convex env and app docs.
Rationale: Telegram webhook ingestion and delivery run through Convex HTTP actions, so support bot secrets belong in Convex env. The future setup doc should live under the app docs and explain BotFather setup, private supergroup/forum topics, exact bot admin permissions, webhook URL construction from `NEXT_PUBLIC_CONVEX_SITE_URL`, `setWebhook.secret_token`, the incoming `X-Telegram-Bot-Api-Secret-Token` header, `allowed_updates`, `getWebhookInfo` verification, local/preview/production ownership, and failure modes.
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
Rationale: Signed-in visitors can provide useful context for Parker, but the homepage support thread should still be authorized by the HttpOnly support session cookie. Clerk association must be derived server-side from Convex auth and should not become a requirement for thread access until a later authenticated-support slice designs account-level support history and privacy rules.
Date: 2026-05-06

Decision: Keep Slice 1 homepage-only.
Rationale: The public homepage support bridge should be proven before adding protected workspace support. Workspace support needs different context, account-level history rules, product-state summaries, and privacy boundaries.
Date: 2026-05-06

Decision: Keep Telegram topic titles free of user-supplied text.
Rationale: Forum topic names are durable, visible operator chrome. They should use generated support ids and safe routing metadata only, such as `SBS-0421 homepage May 6` or `SBS-0421 workspace May 6`, while richer visitor context stays inside support messages governed by retention and audit rules.
Date: 2026-05-06

Decision: Start each Telegram topic with a safe bot-authored context header.
Rationale: Parker needs durable thread context without leaking user-supplied data into Telegram topic titles. The bot should post a header containing safe operator context such as support id, entry surface/path, date, visitor kind, delivery status, and the `Close thread` button before posting the visitor's actual message separately.
Date: 2026-05-06

## Slice Ledger

Child ExecPlans:

- `docs/exec-plans/completed/2026-05-06-homepage-widget-and-telegram-bridge-proof.md`: completed Slice 1 plan for `Homepage Widget And Telegram Bridge Proof`.
- `docs/exec-plans/completed/2026-05-06-operator-actions-and-prompt-buttons.md`: completed Slice 2 plan for `Operator Actions And Prompt Buttons`.
- `docs/exec-plans/completed/2026-05-06-ai-drafting-and-product-context.md`: completed Slice 3 plan for `AI Drafting And Product Context`.
- `docs/exec-plans/completed/2026-05-06-authenticated-customer-support-and-workspace-entry.md`: completed Slice 4 plan for `Authenticated Customer Support And Workspace Entry`.
- `docs/exec-plans/completed/2026-05-06-operations-analytics-and-hardening.md`: completed Slice 5 plan for `Operations, Analytics, And Hardening`.
- `docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md`: active closeout plan for `Live Provider Proof And Program Closeout`.
- `docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md`: completed product slice for `Parker-Style Telegram Operator UX`.

Completed Slice 1: Homepage Widget And Telegram Bridge Proof. This homepage-only slice added the dedicated provider env contract, Convex support visitor/thread/message model, homepage widget, HttpOnly anonymous support session bridge, lazy first-message thread creation, no dedicated contact/email field, Telegram forum-topic creation path, store-first visitor message delivery with explicit status, a maintainer-only failed-delivery recovery action, Telegram HTTP action webhook inbound reply path, operator allowlist enforcement, first-slice abuse controls, the `Close thread` operator button, and website reply rendering. The only unproven piece is the live Telegram provider loop because support-specific Convex env setup is still missing.

Completed Slice 2: Operator Actions And Prompt Buttons. This slice built on the callback/audit plumbing from `Close thread` and added safe buttons for draft reply, ask for email, ask for context, send pricing link, send checkout link, summarize lead, generate Codex prompt, create Linear draft, and mark hot lead. Customer-visible actions create normal Convex operator messages. Draft, summary, Codex prompt, Linear draft, and hot-lead actions remain operator-only and deterministic; they do not call AI or Linear.

Completed Slice 3: AI Drafting And Product Context. This slice uses support thread context and safe public product context to generate Parker-side drafts and prompts while proving that AI output is not sent automatically. AI-capable buttons now schedule private OpenAI-backed generation in the same mutation that creates the action audit row, patch the existing action audit row with output source, model, and failure metadata, and fall back to deterministic private notes when OpenAI is unavailable. No AI output is inserted into visitor-visible support messages automatically.

Completed Slice 4: Authenticated Customer Support And Workspace Entry. This slice added a protected workspace support entry point, keeps support transcripts session-scoped, and defers account-wide support history or automatic workspace context until privacy rules are deliberately designed.

Completed Slice 5: Operations, Analytics, And Hardening. This slice added retention automation, bounded retry policy, metadata-only PostHog support events, admin failure snapshots, operator runbook updates, and production smoke guidance.

Completed Product Slice: Parker-Style Telegram Operator UX. This slice made the working support bridge feel like Parker answering from his phone. New visitor threads now add two website-visible system acknowledgement messages, new Telegram topic headers render only `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`, `Yoooo` and `Whatcha` send the two casual customer-visible replies, `Draft Parker` generates a private OpenAI-backed note with `Send draft` and `Discard`, and draft decisions are recorded on the original action row so duplicate sends do not create duplicate visitor-visible messages and discarded drafts cannot be sent later.

## Next Slice

The active provider closeout plan remains `docs/exec-plans/active/2026-05-06-live-provider-proof-and-program-closeout.md`. Its remaining outcome is the production setup decision. Hosted Convex dev has live Telegram and OpenAI proof, including the Parker-style operator UX. If production support should use `@sbsprodbot`, set the same support env family on production Convex and register the webhook to the production Convex site URL after rotating the exposed bot token; otherwise create a dedicated support bot for production. After production setup, verify the real Telegram/OpenAI loop from the website: visitor message to Convex, forum topic creation, Telegram operator reply from the Telegram client, website-visible reply, `Close thread`, one customer-visible action button, one AI-backed `Draft Parker` action, `Send draft`, duplicate-send idempotence, and missing-key fallback behavior when it can be tested safely outside production.

Boundary rules remain: do not reuse observability Telegram env values, do not require email before the first message, do not create threads before the first real visitor message, do not add CAPTCHA or Turnstile unless spam proves it necessary, do not auto-open the widget, do not use timed popups, do not imply fake online availability, do not promise response times, do not support uploads or binary attachments, do not expand protected workspace support beyond the completed Slice 4 entry point, do not auto-send AI replies to customers, do not introduce a third-party widget script, do not add broad CRM behavior, do not send support transcript text or generated output to PostHog, do not let AI or Linear buttons perform provider side effects without an explicit new plan, and do not use Convex local mode.

## Risks and Watchpoints

Telegram support can look deceptively simple. The real risk is not drawing a bubble; it is separating customer support from production incidents, validating webhook input, preserving privacy, and preventing bot buttons from becoming unaudited side effects.

Anonymous visitors can send arbitrary text. The first implementation needs support-session-scoped thread access, length limits, per-session cooldown, pending-message caps, global send caps, explicit retention fields, and clear failure states so the widget cannot become an unbounded spam pipe.

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

Convex must own support visitors, threads, messages, delivery metadata, retention timestamps, and operator actions. Thread state should be queryable through the Next support-session bridge for the widget and auditable for operator actions. Anonymous website access must be scoped by an HttpOnly support session cookie and Convex-stored token hash; the browser must not read or persist the raw support token. Unknown Telegram chats, unknown operators, unmapped replies, invalid callback data, and missing provider setup must fail closed without creating customer-visible support state.

Telegram webhook retry behavior is accepted when auth failures for missing or wrong `X-Telegram-Bot-Api-Secret-Token` return intentional non-2xx responses, invalid JSON can return 400, authenticated unsupported updates return 200 ignored responses, `allowed_updates` is narrowed to `message` and `callback_query`, and `getWebhookInfo` verification checks for retry backlog through `pending_update_count` and `last_error_message`.

Signed-in visitor association is accepted when the app may attach `clerkUserId` to the support visitor or thread as optional metadata, but every widget read/write still requires the HttpOnly support session cookie. A signed-in session alone must not grant access to arbitrary support threads in Slice 1.

Homepage-only scope is accepted when the widget renders on the public homepage only, no protected workspace route exposes the support UI in Slice 1, and any future workspace support is deferred to the authenticated-support slice with its own product-context and privacy design.

Delivery state is accepted when visitor messages are persisted before Telegram delivery starts, the widget renders sending, delivered-to-Parker, and delivery-failed states, Telegram delivery failures retain the message in Convex, visitors get a clear fallback link, and the backend records enough error metadata to retry or debug without exposing message text to analytics.

Retry behavior is accepted when Slice 1 records `deliveryAttemptCount`, `lastDeliveryError`, and `lastDeliveryAttemptAt`, provides a maintainer-only Convex recovery action that retries one stored failed visitor message after setup repair, documents how to repair common Telegram env or permission failures before retrying, protects that action with `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and does not introduce automatic background retry scheduling until the hardening slice.

Retention is accepted when open support threads remain available, idle anonymous threads are auto-closed after 14 days, closed transcript bodies are retained for 90 days, purged threads no longer expose message bodies, and the matching Telegram forum topic is deleted or clearly marked for manual cleanup if Telegram deletion fails.

Abuse control is accepted when anonymous visitors can still send without CAPTCHA, but the backend enforces one open thread per anonymous support session, rejects overlong messages, throttles rapid sends, blocks additional visitor sends after too many unanswered pending messages, protects Telegram delivery with a global hourly cap, and exposes a kill switch that renders the widget as a fallback Telegram link.

Widget launch behavior is accepted when the support surface never opens itself, never uses timed interruption, never claims real-time availability without proof, renders as a quiet fixed launcher, opens as a compact desktop panel, opens as a mobile bottom sheet, and stays clear of primary homepage conversion controls across desktop and mobile screenshots.

Visitor identity is accepted when launcher and header copy use Parker-first language such as "Message Parker" or "Ask Parker," while error, disabled, and fallback states use "Ship by Sunday support" so the personal support promise and system ownership stay distinct.

Support expectation copy is accepted when the starter message invites questions about fit, setup, checkout, or the visitor's codebase, says Parker will reply in the widget when available, and avoids green dots, "online" labels, and response-time promises.

Analytics is accepted when support events record only lifecycle metadata such as page path, thread status, delivery status, and error class, and never send message bodies, emails, Telegram ids, visitor tokens, or transcript text to PostHog. Session replay privacy is accepted only when browser or integration-ui proof asserts replay-blocking or masking attributes on rendered transcript DOM and message inputs, not just metadata-only event payloads.

Operator buttons must be structured, typed, and auditable. AI-generated output must be operator-approved before it becomes customer-visible unless a later explicit decision changes that policy with tests and docs.

The first operator button is accepted when `Close thread` is available in the mapped Telegram topic, only allowlisted operators can use it, the action is audited, the support thread moves to a closed state, the website widget renders that closed state, and no other operator buttons ship in Slice 1.

Text-only scope is accepted when the widget accepts plain text and links-as-text, rejects or ignores file/image/voice/binary inputs, Telegram-side media messages do not become website-visible visitor replies in Slice 1, and future attachment support is deferred behind a separate storage, privacy, retention, and provider-mapping decision.

External setup docs must say what to create in Telegram, where to create it, exact bot/chat/webhook requirements, which environment owns each value, where values go, how to verify the bridge, and what failure looks like when setup is missing or misconfigured.

The support setup contract is accepted when `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, and `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN` are documented as Convex env values, the webhook URL uses the Convex HTTP-actions site origin from `NEXT_PUBLIC_CONVEX_SITE_URL`, and the setup doc names BotFather, private supergroup/forum-topic requirements, recovery-token usage, verification steps, and failure modes. It must also name `setWebhook.secret_token`, the incoming `X-Telegram-Bot-Api-Secret-Token` header, Telegram's 1 to 256 character secret-token constraint using only `A-Z`, `a-z`, `0-9`, `_`, and `-`, `allowed_updates` limited to `message` and `callback_query`, `getWebhookInfo` checks for URL, allowed updates, `pending_update_count`, and `last_error_message`, `can_manage_topics` for topic creation and closing, and `can_delete_messages` for retention cleanup that deletes forum topics.

Validation should include support session cookie and route tests, support validators, Telegram update parsing tests, delivery classification tests, Convex model tests for thread/message lifecycle and abuse limits, maintainer recovery authorization tests, webhook route/action integration tests, widget integration-ui tests for open/send/failure/closed states and replay-masking attributes, desktop and mobile browser proof, `bun run programs:lint`, hosted Convex dev validation for Convex implementation slices, and broad app gates: `bun run format`, `bun lint`, and `bun typecheck`. Full hosted e2e is not required by default unless the implementation touches auth, checkout, entitlement, release proof, or other release-sensitive paths.

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

This Program depends on the homepage shell contract, Next route handlers for the website support-session bridge, Convex hosted backend state, Telegram Bot API, Telegram webhook delivery, environment variable setup in local/preview/production, Vercel or Convex HTTP routing for public webhooks, PostHog support analytics and replay privacy controls, Linear if issue-draft buttons ship, and OpenAI/Codex boundaries if prompt-generation buttons ship.

Child ExecPlans should carry `program_id: telegram-support-bot` and `planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-<N>.md` in their frontmatter.
