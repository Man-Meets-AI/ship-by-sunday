---
title: "Telegram Support Bot Converged Decision Packet"
summary: "Locked initiative decisions for the custom support widget and Telegram operator bot."
docType: "converged_decision_packet"
status: "active"
read_when:
  - "Checking the approved direction before writing a Telegram support ExecPlan."
  - "Resolving whether support should be a direct Telegram link, third-party widget, or custom bridge."
---

# Telegram Support Bot Converged Decision Packet

## Decisions

Decision: Build a first-party on-site chat widget with Telegram as the operator inbox.
Rationale: Visitors get a better landing-page experience, Parker stays in the Telegram app, and the app can later add product-specific operator buttons.

Decision: Use a dedicated Telegram support bot, not Parker's personal chat, for the primary bridge.
Rationale: Bot messages can carry inline keyboards, callback queries, message ids, webhook updates, and delivery metadata. Direct personal chat cannot provide the same app-controlled operator workflow.

Decision: Keep direct `t.me/parkerrex` as fallback, not the main product path.
Rationale: A direct link is useful when the bridge is unavailable, but it sends visitors away from the website and cannot support custom prompt/action buttons.

Decision: Keep support chat separate from Telegram observability.
Rationale: The current Telegram incident path is for high-signal production alerts. Customer support needs separate provider setup, state, retention, tone, and failure handling.

Decision: Store thread state in Convex.
Rationale: The website widget needs live subscribed state, durable messages, and a safe bridge between anonymous website visitors and Telegram operator replies.

Decision: Use a private Telegram supergroup with forum topics enabled as the operator inbox.
Rationale: One Telegram topic per support thread gives Parker an organized Telegram-native inbox and maps cleanly to Telegram `message_thread_id` for outbound and inbound delivery.

Decision: Use a Convex HTTP action for the Telegram webhook.
Rationale: Convex owns support state, the webhook mutates that state, and the repo already uses Convex HTTP actions for provider webhook surfaces.

Decision: Do not add a dedicated contact or email field in Slice 1.
Rationale: The landing-page widget should reduce support friction and behave like chat, not a lead form. Visitors can volunteer contact details in the message body. Email collection can become an audited `Ask for email` operator action in Slice 2.

Decision: Use HttpOnly anonymous support session cookies with Convex-stored token hashes.
Rationale: Session-scoped access lets unauthenticated visitors read and write only their own support thread while preserving a future path to attach Clerk identity. The browser should not hold a JavaScript-readable bearer token for support transcripts. The server should mint the token, set it as `__Host-sbs_support_session` with `HttpOnly`, `SameSite=Lax`, `Path=/`, no `Domain`, and `Secure` in production, and store only a hash in Convex.

Decision: Create the support visitor, Convex thread, and Telegram forum topic on first real message.
Rationale: Widget open state is not a durable conversation. Lazy creation avoids empty backend records and empty Telegram topics.

Decision: Use a narrow Next support-session bridge for anonymous support transcript reads and writes.
Rationale: Convex remains the support state owner, but support transcripts may contain contact details or customer product context. Next route handlers can read the HttpOnly support session cookie, call server-facing Convex functions, and avoid exposing the raw support credential to widget JavaScript. Direct Convex React hooks remain acceptable for non-sensitive public state.

Decision: Treat normal Telegram topic messages from allowed operators as visitor-visible replies.
Rationale: Parker gets fast normal Telegram replying while buttons and commands remain reserved for explicit internal actions.

Decision: Restrict Telegram operator replies and button taps to configured Telegram user ids.
Rationale: A private group is not a complete authorization boundary. An allowlist keeps customer-visible replies and side effects limited to deliberate operators.

Decision: Make transcript retention explicit from v1.
Rationale: Support conversations may contain contact details and product context. Open threads remain available, idle anonymous threads auto-close after 14 days, closed transcript bodies retain for 90 days, and purge removes Convex message bodies plus the matching Telegram forum topic while keeping minimal audit metadata.

Decision: Use Convex-side abuse controls without CAPTCHA in the first slice.
Rationale: The support widget should stay frictionless, but the backend must protect operator attention and Telegram delivery. The first slice should enforce one open thread per anonymous support session, message length cap, per-session send cooldown, pending visitor message cap before operator reply, global hourly cap, and a support kill switch. CAPTCHA or Turnstile can be added later only if real spam justifies the provider setup.

Decision: Make the support widget passive and on-demand.
Rationale: The homepage support surface should help visitors without competing with the hero, product preview, or pricing CTA. The widget should not auto-open, use timed popups, or imply fake availability; it should render as a quiet fixed launcher, compact desktop panel, and mobile bottom sheet.

Decision: Make the visitor-facing support identity Parker-first.
Rationale: The homepage already builds trust through Parker-specific proof. Launcher and header copy should read like "Message Parker" or "Ask Parker," while system, error, and fallback states can say "Ship by Sunday support."

Decision: Set asynchronous support expectations.
Rationale: The widget should invite questions without implying a staffed live-chat SLA. It should avoid green dots, "online" claims, and response-time promises, and should say Parker will reply in the widget when available.

Decision: Track only support lifecycle metadata in analytics.
Rationale: Support threads can contain contact details and product context. Analytics should capture events like widget opened, thread created, message sent, reply received, send failed, and fallback clicked, but must not include message bodies, emails, Telegram ids, visitor tokens, or transcript text. Browser proof must also assert that rendered transcript DOM and inputs are blocked or masked from PostHog session replay.

Decision: Keep Telegram support provider setup in Convex env and app docs.
Rationale: Telegram webhook ingestion and delivery run through Convex HTTP actions. Support bot secrets should live in Convex env, while app docs should explain BotFather setup, private supergroup/forum topics, exact bot permissions, webhook URL construction, `setWebhook.secret_token`, the incoming `X-Telegram-Bot-Api-Secret-Token` header, `allowed_updates`, `getWebhookInfo` verification, environment ownership, verification, and failure modes.

Decision: Make Telegram webhook responses retry-safe.
Rationale: Telegram retries non-2xx webhook responses. Missing or wrong secret headers should deliberately return non-2xx, invalid JSON can return 400, and authenticated unsupported updates should return 200 ignored responses so unknown chats, unknown operators, unmapped topics, media, commands, and other non-Slice-1 shapes do not create retry storms.

Decision: Ship only `Close thread` as the first Telegram button.
Rationale: Slice 1 should prove callback parsing, operator allowlisting, support action audit, thread lifecycle mutation, and website closed-state rendering with one safe lifecycle action. AI drafts, prompt generation, checkout links, Linear drafts, and canned customer-visible sends belong to Slice 2 or later.

Decision: Store visitor messages before Telegram delivery.
Rationale: Convex should remain the support source of truth even when Telegram delivery fails. A send writes the visitor message first, then attempts Telegram delivery, and the widget renders explicit states such as `sending`, `delivered_to_parker`, and `delivery_failed` with a fallback link on failure.

Decision: Defer automatic Telegram delivery retries beyond Slice 1.
Rationale: The first implementation should prove delivery state and recovery visibility before adding background scheduling. Slice 1 should record attempt count, last error, and last attempt time, provide a no-UI maintainer recovery action for one stored failed visitor message, protect it with `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and document common env or permission repairs.

Decision: Validate Slice 1 with focused automated tests and browser proof, not full hosted e2e by default.
Rationale: The support bridge should be proven through unit tests, Convex model tests, webhook integration tests, integration-ui widget tests, desktop/mobile browser proof, and repo format/lint/typecheck gates. Full hosted e2e is only required if implementation touches auth, checkout, entitlement, release proof, or another release-sensitive surface.

Decision: Keep Slice 1 text-only.
Rationale: Plain text and links-as-text are enough to prove the support bridge. Uploads, screenshots, voice notes, and binary attachments would add storage, scanning, Telegram file mapping, retention, and privacy complexity that belongs to a later slice.

Decision: Attach Clerk identity only as optional support metadata in Slice 1.
Rationale: Signed-in visitors can give Parker useful support context, but the HttpOnly support session cookie remains the thread access authority. Account-level support history and stronger authenticated support rules belong to a later slice.

Decision: Keep Slice 1 homepage-only.
Rationale: Public homepage support should prove the bridge before protected workspace support is added. Workspace support needs separate account-history, product-context, and privacy decisions.

Decision: Keep Telegram topic titles free of user-supplied text.
Rationale: Topic names are durable operator chrome. They should use a generated support id and safe metadata such as entry surface and date, while visitor names, emails, message text, and product details stay inside retained support messages.

Decision: Start each Telegram topic with a safe bot-authored context header.
Rationale: Parker needs context in Telegram without putting visitor-supplied data in topic names. The bot should post a header with support id, entry surface/path, date, visitor kind, delivery status, and `Close thread`, then post the visitor's actual message separately.

Decision: Start with Parker-approved AI assistance only.
Rationale: The requested custom buttons can generate prompts or drafts, but customer-visible AI replies should not be sent without Parker selecting or editing them.

Decision: Treat Linear issue creation, checkout-link sending, and prompt generation as structured actions with audit.
Rationale: These actions create business workflow or customer-facing outcomes. They should have explicit action ids, status, source message, and result records instead of being hidden inside free-form bot text.

Decision: Make the first implementation a vertical proof, not a platform.
Rationale: The smallest valuable slice is homepage widget to Convex thread to Telegram bot to operator reply back to widget, with one or two safe buttons. Broader CRM, assignment, workspace-wide support, and AI automation belong to later slices.

## Non-Decisions

The Program does not decide the final support bot username, the exact support chat id, or the production webhook URL. Those belong to the implementation and external setup docs.

The Program does not decide whether Telegram Business connected bots should replace the normal support bot. That is a later evaluation after the normal bot bridge works.

The Program does not decide long-term customer notification policy for authenticated customers. The first version is live website chat plus Telegram operator bridge.
