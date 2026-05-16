---
title: Telegram Support Bot Planning Brief 7
program_id: telegram-support-bot
brief_version: 7
status: current
summary: Simplify the Telegram operator workflow so Parker can answer from a small set of natural buttons and review AI drafts before sending them.
read_when:
  - "Creating or resuming the Parker-Style Telegram Operator UX child ExecPlan."
  - "Changing customer-facing support auto-acknowledgement copy."
  - "Changing Telegram operator buttons or AI draft send behavior."
---

# Telegram Support Bot Planning Brief 7

The next child ExecPlan should be titled `Parker-Style Telegram Operator UX`.

The existing support bridge is provider-proven on hosted Convex dev, but the operator experience still feels like a generic helpdesk. The next slice should make the Telegram side feel like Parker answering from his phone. When a visitor sends the first message in a new support thread, the website should immediately show two customer-facing bot messages: `Got it. This went straight to Parker's Telegram.` and `He'll reply here when he can.` These are support-system messages shown in the website widget only; they must not pretend Parker is online or promise a response time.

The Telegram default keyboard should be reduced to four actions: `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`. `Yoooo` sends `Yooo - how'd you find my site?` to the visitor. `Whatcha` sends `Whatcha trying to make?` to the visitor. `Draft Parker` creates a private AI draft in Parker's style and should not send anything to the visitor until Parker taps a follow-up `Send draft` button. `Close` marks the support thread done and starts the existing retention behavior. Do not keep `More`, `Pricing`, `Checkout`, `Hot lead`, `Summary`, `Codex prompt`, or `Linear draft` in the default keyboard. Existing callback parsers may continue supporting old in-flight buttons for compatibility, but new topic headers should not show them.

The AI prompt should make the generated draft sound like Parker, not SaaS support. The style is casual, short, direct, and human. It may naturally use words like `yooo`, `whatcha`, `lemme`, and `haha`, but it should not force slang into every reply. It must not say `our team`, `happy to assist`, or promise a response time. It must not auto-send generated text. The generated Telegram note for `Draft Parker` should include `Send draft` and `Discard` buttons. `Send draft` writes the generated draft into the Convex support messages as an operator message visible to the visitor exactly once. `Discard` marks the draft as discarded or otherwise makes a later send impossible. Duplicate callbacks must not send duplicates.

Keep the implementation in the existing support boundaries. Convex support state remains the source of truth. Telegram webhook input remains validated at the boundary. Generated output must not reach PostHog analytics or admin snapshots. Do not add a separate operator dashboard, account-wide transcript history, CRM/Linear side effects, file uploads, CAPTCHA, a real online indicator, or a live-availability promise in this slice. Do not use Convex local mode. Use `bunx`, not `npx`, for Convex commands.

Hosted Convex dev is currently configured to the `@sbsprodbot` support bot and the `SBS Website` forum supergroup. The bot has admin rights for topic management and message deletion, and a synthetic support thread was delivered and closed there. The bot token was pasted in chat during setup, so the token must be rotated in BotFather and replaced in Convex env before treating the setup as production-safe. Production support Telegram env still needs a deliberate setup decision.

Focused validation should cover support operator action parsing, reduced keyboard shape, customer-visible canned replies, AI draft prompt style, `Send draft`/`Discard` idempotence, first-thread auto-ack messages, privacy boundaries, and the existing support route/widget behavior. Run hosted Convex codegen after Convex schema or function-reference changes, targeted support unit tests, support widget integration-ui tests, plan/program/markdown linting, `git diff --check`, and broader repo gates when runtime code changes.
