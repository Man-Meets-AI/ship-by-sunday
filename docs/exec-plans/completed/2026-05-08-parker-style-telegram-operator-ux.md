---
title: Parker-Style Telegram Operator UX
status: complete
created_at: 2026-05-08
completed_at: 2026-05-08
summary: Make the Telegram support workflow feel like Parker answering from his phone with natural quick replies, reviewable AI drafts, and a simple operator header.
post_build_recap: The website now posts first-message Parker acknowledgements, new Telegram topics render the four-button Parker keyboard, Draft Parker notes require Send draft or Discard, and hosted Convex dev smoke proved the path against @sbsprodbot in the SBS Website forum.
program_id: telegram-support-bot
planning_brief: docs/programs/active/2026-05-06-telegram-support-bot/planning-brief-7.md
read_when:
  - Reviewing the finished Parker-style Telegram operator UX slice.
  - Changing support auto-acknowledgement copy or Parker quick replies.
  - Changing Telegram support buttons, AI draft review, or draft send behavior.
---

# Parker-Style Telegram Operator UX

This document is a living execution plan for turning the working Telegram support bridge into a small, natural operator workflow for Parker.

This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.

## Purpose / Big Picture

The support bridge works, but the Telegram side still feels like a generic support console. Parker should be able to open a new support topic, understand what happened, and answer with a few natural actions that match how he actually talks. After this change, a visitor who sends the first message sees a friendly acknowledgement in the website widget, and Parker sees a Telegram topic with only four default buttons: `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`. AI drafts remain private until Parker taps `Send draft`.

The work is successful when a live hosted Convex dev smoke shows a new visitor message landing in the `SBS Website` Telegram forum, the website transcript immediately showing the two acknowledgement messages, the `Yoooo` and `Whatcha` buttons sending the exact casual replies to the visitor, `Draft Parker` generating a Parker-style private note with `Send draft` and `Discard`, and duplicate or discarded draft callbacks not sending duplicate visitor-visible messages.

## Progress

- [x] 2026-05-08: Discussed and locked the operator UX direction with Parker: no `More` button, no pricing/checkout/hot/default helpdesk buttons, two customer-facing auto-ack messages, default Telegram buttons `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`, and Parker-style drafts that require explicit send.
- [x] 2026-05-08: Created `planning-brief-7.md`, updated `current-planning-brief.txt`, and created this child ExecPlan.
- [x] 2026-05-08: Implemented first-thread customer acknowledgement messages in Convex support state and proved they appear in focused widget tests and hosted Convex dev smoke without being delivered to Telegram as visitor messages.
- [x] 2026-05-08: Replaced the default Telegram support keyboard with `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`, while keeping old callback parsing safe for in-flight buttons.
- [x] 2026-05-08: Added `Send draft` and `Discard` decision callbacks for AI-generated Parker drafts, with idempotent Convex state transitions and no duplicate visitor-visible sends.
- [x] 2026-05-08: Updated focused tests, setup docs, Program truth, and live hosted Convex dev smoke evidence.

## Surprises & Discoveries

- 2026-05-08: Parker does not want generic support classifications like `hot lead`, `ticket`, `pricing`, `checkout`, `summary`, `Codex prompt`, or `Linear draft` in the default Telegram workflow. The operator flow should first feel like texting from Parker's phone.
- 2026-05-08: `Parker usually catches these pretty quickly when he's near his phone.` is acceptable visitor-facing copy because it describes the support vibe without claiming a real online status or response-time SLA.
- 2026-05-08: Hosted Convex dev currently points at `@sbsprodbot` and the `SBS Website` Telegram forum. The bot has forum-topic and delete-message admin permissions, and a synthetic support message delivered there. The bot token was pasted in chat during setup and must be rotated before production confidence.
- 2026-05-08: `bunx convex codegen` regenerated bindings but did not deploy the changed Convex functions for hosted smoke. The first smoke still showed the old one-message transcript behavior until `bunx convex dev --once --typecheck disable` pushed the current functions.
- 2026-05-08: A live `Discard` callback arrived for an earlier draft before the synthetic `Send draft` proof ran, leaving that draft with `draftDecisionStatus: "discarded"`. The later send attempt returned `draft_discarded`, which proved discard blocks send; a fresh draft was then used for the successful send proof.

## Decision Log

Decision: Use a friendly website acknowledgement pair instead of a fake online indicator.
Rationale: Telegram bots cannot truthfully know Parker's personal phone availability. The exact copy `Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.` followed by `Parker usually catches these pretty quickly when he's near his phone.` sets expectations without promising live availability.
Date: 2026-05-08

Decision: Keep the default Telegram keyboard to four actions.
Rationale: Parker needs fast phone-side actions, not a CRM menu. `Yoooo`, `Whatcha`, `Draft Parker`, and `Close` cover the first operator moves without making every support thread look like an operations dashboard.
Date: 2026-05-08

Decision: Keep AI drafts private until an explicit `Send draft` callback.
Rationale: AI can help Parker answer, but the visitor should not see generated text until Parker approves it. This preserves the existing privacy and automation boundary while removing copy-paste friction.
Date: 2026-05-08

Decision: Preserve old callback support where practical but stop rendering old buttons.
Rationale: Existing Telegram topics can contain older inline keyboards. Unknown or old callbacks should fail safe or continue to work according to the existing audited behavior, but new support topics should show only the simplified Parker workflow.
Date: 2026-05-08

## Outcomes & Retrospective

This plan is complete. The implementation added first-message website acknowledgements, simplified the default Telegram topic keyboard to `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`, made `Yoooo` and `Whatcha` customer-visible canned replies, changed draft prompting to Parker's casual phone style, and added explicit `Send draft` and `Discard` callbacks for `Draft Parker`.

Focused automated tests prove the Convex model, Telegram parser/webhook action, operator action keyboard/effects, AI draft prompt and note labels, support message route, support session cookie, and homepage/workspace widget rendering. Hosted Convex dev proof against `@sbsprodbot` in the `SBS Website` forum proved first-message delivery, acknowledgement insertion, safe topic header, customer-visible canned callbacks, OpenAI-backed private draft generation, explicit send, duplicate-send idempotence, discard blocking send, and close-thread retention timestamps without printing generated output or real transcript text.

Remaining risk is provider setup, not this product slice. Production support Telegram env remains a separate closeout decision, and the bot token that was pasted in chat must be rotated before any production-confidence claim. The production support loop should not be treated as proven until production Convex has the intended support Telegram env, the webhook points at the production Convex site URL, and a real production smoke has exercised visitor delivery, Telegram reply, one customer-visible action, one AI draft action, and close.

## Context and Orientation

The website support widget is rendered from `apps/web/app/_components/support/support-widget.tsx` and `apps/web/app/_components/support/support-widget-panel.tsx`. The hook in `apps/web/app/_components/support/use-support-chat.ts` calls the Next route in `apps/web/app/api/support/messages/route.ts`, which delegates to `apps/web/app/api/support/_server/support-message-route.ts`. That route calls the public Convex action `support:sendVisitorMessage` in `apps/web/convex/support.ts`.

Convex owns the durable support state. The schema lives in `apps/web/convex/schema.ts`; validators live in `apps/web/convex/support/validators.ts`; pure support rules live in `apps/web/convex/support/model.ts`; Telegram parsing and provider calls live in `apps/web/convex/support/telegram.ts`; Telegram button definitions and canned action effects live in `apps/web/convex/support/operatorActions.ts`; AI prompt and response handling live in `apps/web/convex/support/aiDrafts.ts`.

The current data model has support visitors, support threads, support messages, and support operator actions. `supportMessages.source` can be `visitor`, `operator`, or `system`. The website renders visitor messages on the right and every non-visitor message on the left, so the auto-acknowledgement messages can be stored as `system` messages and shown in the widget without pretending Parker personally replied. Telegram operator actions are audited in `supportOperatorActions`.

The phrase "operator header" in this plan means the first bot-authored message in each Telegram forum topic. It is not a new data model. It should be safe, readable context for Parker: support id, entry surface, page path, status such as `Needs reply`, and one short instruction that replying in the Telegram topic sends a message back to the visitor. It must not include visitor tokens, raw Telegram ids, emails, or hidden identifiers.

### In Scope

This plan includes the visitor auto-acknowledgement pair for the first message in a thread, the simplified default Telegram keyboard, new `Yoooo` and `Whatcha` customer-visible button actions, Parker-style AI draft prompting, `Send draft` and `Discard` decision callbacks for AI draft replies, idempotence protections for draft sends, focused tests, support docs updates, Program updates, and hosted Convex dev smoke proof against the configured `SBS Website` forum.

### Out Of Scope

This plan does not add a `More` menu, pricing or checkout default buttons, hot-lead status, Linear issue creation, Codex side effects, a separate operator dashboard, account-wide transcript history, file uploads, CAPTCHA, actual online-status tracking, response-time promises, automatic AI replies, or production Telegram setup changes. It does not remove historical action audit rows. It should not print or commit Telegram bot tokens, webhook secrets, OpenAI keys, visitor session tokens, Telegram user ids, message text from real users, or generated AI output from live tests.

## Plan of Work

Start by making the customer acknowledgement explicit in Convex support state. In `apps/web/convex/support/model.ts`, update `createVisitorMessageForDeliveryHandler` so that when a new thread receives its first visitor message, Convex also inserts two `system` messages immediately after the visitor message. Use the exact copy from this plan. These messages should have `deliveryStatus: "not_required"` and must not be passed to Telegram delivery as visitor messages. The logic must be idempotent: retries or later visitor messages in the same thread must not insert another acknowledgement pair.

Then simplify the operator keyboard in `apps/web/convex/support/operatorActions.ts`. Add explicit action types for `Yoooo` and `Whatcha`, with callback slugs that stay within Telegram's 64-byte callback data limit. `Yoooo` sends `Yooo - how'd you find my site?` as a customer-visible operator message. `Whatcha` sends `Whatcha trying to make?` as a customer-visible operator message. Keep existing action types and parser support for old in-flight keyboards, but change `buildTelegramSupportActionKeyboard` so newly created topic headers show only `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`.

Next, make the AI draft path reviewable. Keep the existing `draft_reply` action type but render it as `Draft Parker`. In `apps/web/convex/support/aiDrafts.ts`, update the prompt instructions so `draft_reply` output sounds like Parker: casual, short, direct, human, and never corporate. It may use `yooo`, `whatcha`, `lemme`, or `haha` naturally, but it should not force slang into every sentence. It must not use `our team`, `happy to assist`, or response-time promises. For `draft_reply` only, the Telegram operator note should include inline buttons for `Send draft` and `Discard`. Other AI artifacts, if they remain supported for old callbacks, should not receive send-to-visitor buttons.

Implement draft decision callbacks in the existing Telegram webhook boundary. Add a parser branch in `apps/web/convex/support/telegram.ts` for compact callback data that identifies a support operator action id and a decision of `send` or `discard`. Add validators in `apps/web/convex/support/validators.ts` and optional schema fields in `apps/web/convex/schema.ts` on `supportOperatorActions` to record the draft decision, decision time, and decision Telegram update id. In `apps/web/convex/support.ts`, route draft decision callbacks to a new internal mutation in `apps/web/convex/support/model.ts`.

The `Send draft` mutation should load the original draft action, verify it belongs to the Telegram topic that sent the callback, verify the thread is still open and unpurged, verify the draft action is completed, verify generated output exists, verify the action type is `draft_reply`, and verify no customer-visible message was already created. It should then insert one operator `supportMessages` row with the generated draft body, patch the thread's message timestamps and pending visitor count, patch the original operator action with `customerVisibleMessageId` and a `sent` draft decision, and return a callback answer such as `Sent draft.` Duplicate `Send draft` callbacks must return an ignored result and must not insert a second message.

The `Discard` mutation should patch the original draft action with a `discarded` draft decision and return a callback answer such as `Draft discarded.` If a draft is already sent, discard should be ignored. If a draft is already discarded, send should be ignored. The implementation may leave the original Telegram note in place; editing or removing inline keyboards is optional unless it can be done cleanly with the existing provider boundary.

Update the operator header text in `deliverSupportVisitorMessage` in `apps/web/convex/support/model.ts`. The header should read like a small phone-side support prompt rather than a generic ticket. Include the support id, status `Needs reply`, the entry label, page path, visitor kind, and the instruction `Reply in this topic to message the visitor.` Keep it safe and free of user-supplied transcript content. The topic title should remain safe metadata only. Dynamic topic renaming can wait unless it falls out naturally from existing Telegram provider helpers.

Finally, update `apps/web/content/docs/telegram-support-bot.mdx`, this ExecPlan, and `docs/programs/active/2026-05-06-telegram-support-bot/program.md` so the durable docs describe the simplified operator workflow and the explicit-send AI boundary. Use hosted Convex dev, not local Convex, for proof. Use `bunx` for Convex commands.

## Milestones

Milestone 1 adds the website acknowledgement messages. At the end of this milestone, a new support thread should return a thread state containing the visitor's message followed by the two system acknowledgement messages, and later messages in the same thread should not duplicate them. Prove this with focused Convex model or route tests and an integration-ui assertion that the widget displays the acknowledgement copy.

Milestone 2 simplifies the default Telegram operator actions. At the end of this milestone, `buildTelegramSupportActionKeyboard` should render only `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`; `Yoooo` and `Whatcha` should create normal customer-visible operator messages; and old supported callbacks should remain safe. Prove this with `support-operator-actions` and `support-telegram-update` tests.

Milestone 3 makes AI draft replies explicitly reviewable. At the end of this milestone, `Draft Parker` should produce a private Parker-style draft note with `Send draft` and `Discard`; sending should insert exactly one operator message into the visitor transcript; discarding should prevent later send; and duplicate callbacks should not duplicate messages. Prove this with model tests, webhook tests, and AI prompt tests.

Milestone 4 updates docs and runs hosted proof. At the end of this milestone, the setup docs and Program truth should match the simplified workflow, hosted Convex dev should accept the new functions, and a benign synthetic smoke in the `SBS Website` forum should prove `Yoooo`, `Whatcha`, `Draft Parker`, `Send draft`, `Discard`, and `Close` without printing secrets or real transcript content.

## Concrete Steps

Work from the repository root unless a command says otherwise:

    cd /Users/bazelrex/Developer/ship-by-sunday

Before editing Convex code, re-read the Convex guidance and relevant files:

    sed -n '1,220p' apps/web/convex/_generated/ai/guidelines.md
    sed -n '1,260p' apps/web/convex/support/model.ts
    sed -n '1,260p' apps/web/convex/support/operatorActions.ts
    sed -n '1,260p' apps/web/convex/support/telegram.ts
    sed -n '1,240p' apps/web/convex/support/aiDrafts.ts

After implementing the auto-acknowledgement milestone, run the focused route and widget tests:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-message-route.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx

After implementing the Telegram actions and draft decision milestones, run the focused support tests:

    bun run --cwd apps/web test:unit -- tests/unit/support-operator-actions.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/convex-support-model.test.ts

After changing Convex schema, validators, or function references, regenerate hosted Convex bindings from `apps/web`:

    cd apps/web
    bunx convex codegen

Before live smoke proof, verify hosted dev provider presence without printing values:

    cd apps/web
    for name in TELEGRAM_SUPPORT_BOT_TOKEN TELEGRAM_SUPPORT_CHAT_ID TELEGRAM_SUPPORT_OPERATOR_USER_IDS TELEGRAM_SUPPORT_WEBHOOK_SECRET OPENAI_API_KEY; do
      value="$(bunx convex env get "$name" 2>/dev/null)"
      if [ -n "$value" ]; then
        printf "%s present\n" "$name"
      else
        printf "%s missing_or_empty\n" "$name"
      fi
    done

For live proof, send a benign synthetic support message through `support:sendVisitorMessage`, then use signed Telegram-shaped webhook callbacks to exercise `Yoooo`, `Whatcha`, `Draft Parker`, `Send draft`, `Discard`, and `Close`. Record only safe summaries such as support id, action status, generated output source, and whether the customer-visible message count changed. Do not paste the generated draft body or any real customer message into the plan.

Run docs and broad checks before stopping:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    git diff --check
    bun run --cwd apps/web lint
    bun typecheck

Run repo-level `bun lint` only after checking whether the unrelated existing `unknown` boundary violations are still present. If they remain unrelated, report that limitation rather than folding identity or billing cleanup into this support UX slice.

## Validation and Acceptance

This plan is accepted when the simplified operator workflow is both automated-test proven and live-smoke proven on hosted Convex dev. A fresh visitor message must create one Telegram topic in the configured support forum, and the website widget must show the visitor message plus the two acknowledgement messages. The Telegram topic header must be safe and readable. The default keyboard must show exactly `Yoooo`, `Whatcha`, `Draft Parker`, and `Close`.

Pressing `Yoooo` must insert exactly one visitor-visible operator message with `Yooo - how'd you find my site?`. Pressing `Whatcha` must insert exactly one visitor-visible operator message with `Whatcha trying to make?`. Pressing `Draft Parker` must generate a private Telegram note in Parker's style without inserting a visitor-visible message. Pressing `Send draft` must insert exactly one operator message with the draft text, and repeated `Send draft` callbacks must not duplicate it. Pressing `Discard` must prevent later sending. Pressing `Close` must close the thread and set retention timestamps.

Privacy acceptance remains strict. PostHog analytics and admin snapshots must not receive support message text, generated AI output, emails, Telegram ids, visitor tokens, or transcript DOM. Docs and plans must not include real support transcript text, generated draft output, Telegram tokens, or raw operator ids. Hosted proof should use synthetic benign text only.

### Test Commands

Run these focused tests after the implementation:

    bun run --cwd apps/web test:unit -- tests/unit/convex-support-model.test.ts tests/unit/support-operator-actions.test.ts tests/unit/support-telegram-update.test.ts tests/unit/support-ai-drafts.test.ts tests/unit/support-message-route.test.ts tests/unit/support-session-cookie.test.ts
    bun run --cwd apps/web test:integration:ui -- tests/integration-ui/home-page-support-widget.test.tsx tests/integration-ui/workspace-support-widget.test.tsx

Run Convex codegen from `apps/web` after Convex changes:

    cd apps/web
    bunx convex codegen

Run docs and formatting checks from the repo root:

    bun run plans:lint -- --plan docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md
    bun run programs:lint
    bun run markdown:lint -- --paths docs/exec-plans/completed/2026-05-08-parker-style-telegram-operator-ux.md docs/programs/active/2026-05-06-telegram-support-bot apps/web/content/docs/telegram-support-bot.mdx
    git diff --check
    bun run format
    bun run --cwd apps/web lint
    bun typecheck

When running a live hosted smoke, use only hosted Convex dev and record safe summaries. If a check cannot run, write the exact reason in this plan before stopping.

## Idempotence and Recovery

The auto-acknowledgement insertion must be safe to retry. It should only happen once for the first visitor message in a new thread. If a visitor message delivery to Telegram fails and a maintainer later retries delivery, the retry must not insert another acknowledgement pair.

The canned reply callbacks must remain duplicate-safe through the existing callback id audit. If a Telegram callback is delivered twice, Convex should return an ignored duplicate result and should not create a second customer-visible message.

The draft decision callbacks need their own idempotence because `Send draft` creates customer-visible state. Store the decision on the original draft action or otherwise make the original action the single source of truth. If `Send draft` succeeds and Telegram retries the callback, the second attempt must be ignored. If `Discard` succeeds, later `Send draft` must be ignored. If `Send draft` fails halfway after creating the visitor-visible message but before answering the callback, rerunning the callback should detect the existing `customerVisibleMessageId` and avoid a duplicate.

If hosted proof creates synthetic support topics, close them through the `Close` button or signed close callback so retention timestamps are set. Do not delete Convex audit rows by hand. If Telegram provider setup breaks, use the existing setup doc and operations snapshot rather than editing code around the provider failure.

## Artifacts and Notes

Use this section to record short, safe proof snippets as work proceeds. Do not paste real visitor messages or generated AI output.

Expected keyboard shape after implementation:

    Yoooo | Whatcha
    Draft Parker
    Close

Expected visitor acknowledgement copy:

    Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.
    Parker usually catches these pretty quickly when he's near his phone.

Expected canned replies:

    Yooo - how'd you find my site?
    Whatcha trying to make?

Safe live proof summary should look like:

    supportId: SBS-...
    visitorDelivery: delivered_to_parker
    autoAckMessagesPresent: true
    yooooAction: inserted_one_operator_message
    whatchaAction: inserted_one_operator_message
    draftSource: openai_responses
    sendDraftDuplicateSafe: true
    discardBlocksSend: true
    closeStatus: closed

Hosted Convex dev proof recorded on 2026-05-08 used a benign synthetic support thread:

    supportId: SBS-0508-3437
    visitorDelivery: delivered_to_parker
    telegramForum: SBS Website
    bot: @sbsprodbot
    autoAckMessagesPresent: true
    messageCountsAfterFirstSend: visitor=1 system=2
    yooooAction: ok
    whatchaAction: ok
    draftSource: openai_responses
    draftModel: gpt-5.4-mini-2026-03-17
    sendDraftOperatorMessageCount: before=3 after=4
    sendDraftDuplicateSafe: ignored draft_already_sent
    discardBlocksSend: ignored draft_discarded
    closeStatus: closed
    retainUntilPresent: true
    purgeAfterPresent: true

## Interfaces and Dependencies

This plan depends on hosted Convex dev, not Convex local mode. It uses the existing Convex generated API references in `apps/web/convex/_generated/api.ts`, the `supportMessages` and `supportOperatorActions` schema in `apps/web/convex/schema.ts`, and the Telegram Bot API methods already wrapped in `apps/web/convex/support/telegram.ts`.

The support provider env values remain `TELEGRAM_SUPPORT_BOT_TOKEN`, `TELEGRAM_SUPPORT_CHAT_ID`, `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`, `TELEGRAM_SUPPORT_WEBHOOK_SECRET`, `TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN`, and `OPENAI_API_KEY`. Hosted dev currently uses `@sbsprodbot` in the `SBS Website` forum, but the bot token must be rotated because it was exposed in chat. Production support Telegram env remains a separate setup decision.

The OpenAI boundary remains `apps/web/convex/support/aiDrafts.ts` using the Responses API with `store: false`. Generated output stays private until `Send draft` inserts a normal operator support message. The analytics boundary remains metadata-only; the implementation must not add PostHog events containing transcript text or generated drafts.
