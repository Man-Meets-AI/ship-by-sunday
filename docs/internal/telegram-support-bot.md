---
title: Telegram Support Bot
summary: Internal setup and operations contract for the first-party support widget backed by Telegram forum topics and private OpenAI drafts.
docType: reference
status: active
read_when:
  - Setting up or verifying the Telegram support bot.
  - Changing the support widget, Convex support bridge, Telegram webhook, or private AI draft behavior.
  - Recovering failed support delivery or checking support retention behavior.
---

# Telegram Support Bot

The homepage and workspace support widgets are first-party UI. Visitors stay in the app. Parker replies from a support-configured Telegram bot in a forum-topic support group.

The browser never receives a support bearer token or Telegram bot token. The widget talks to `/api/support/messages`, and the Next.js route stores the support session in an HttpOnly Secure `__Host-sbs_support_session` cookie.

## Telegram Setup

Create or intentionally reuse a dedicated support bot in `@BotFather`. Store its token only in hosted Convex env as `TELEGRAM_SUPPORT_BOT_TOKEN`.

Disable privacy mode for the support bot so normal operator replies in the support group arrive as `message` updates. Verify with `getMe`; `can_read_all_group_messages` should be `true`.

Create a dedicated Telegram supergroup for support and enable Topics. Add the support bot to the group as an administrator.

Grant these bot rights:

- `can_manage_topics`: required for `createForumTopic` and for closing or reopening topics.
- `can_delete_messages`: required for `deleteForumTopic` when retention cleanup starts deleting closed support topics.

Find the support supergroup chat id and store it as `TELEGRAM_SUPPORT_CHAT_ID` in hosted Convex env. Supergroup ids usually look like `-100...`.

Find each allowed operator's Telegram user id and store a comma-separated list as `TELEGRAM_SUPPORT_OPERATOR_USER_IDS` in hosted Convex env.

Hosted smoke and production can share the same support bot and group only when webhook delivery points at the active Convex site URL:

```text
https://<your-convex-site>.convex.site/telegram/support/webhook
```

Reusing any existing bot is safe only when nothing else depends on `getUpdates` polling for that bot. Telegram allows either webhook delivery or polling for one bot, not both.

Rotate any bot token that was pasted into chat, a terminal transcript, an issue, a PR comment, or another non-secret store before treating setup as production-safe.

## Convex Env

Set these on the hosted Convex deployment that owns web app data:

```bash
bunx convex env set TELEGRAM_SUPPORT_BOT_TOKEN "<bot-token>"
bunx convex env set TELEGRAM_SUPPORT_CHAT_ID "<support-group-id>"
bunx convex env set TELEGRAM_SUPPORT_OPERATOR_USER_IDS "<telegram-user-id>,<telegram-user-id>"
bunx convex env set TELEGRAM_SUPPORT_WEBHOOK_SECRET "<secret-token>"
bunx convex env set TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN "<random-recovery-token>"
bunx convex env set OPENAI_API_KEY "<openai-api-key>"
```

Before registering the webhook, run a presence-only readiness probe from `apps/web`. Do not print raw values:

```bash
for name in TELEGRAM_SUPPORT_BOT_TOKEN TELEGRAM_SUPPORT_CHAT_ID TELEGRAM_SUPPORT_OPERATOR_USER_IDS TELEGRAM_SUPPORT_WEBHOOK_SECRET TELEGRAM_SUPPORT_ADMIN_RECOVERY_TOKEN OPENAI_API_KEY; do
  value="$(bunx convex env get "$name" 2>/dev/null)"
  if [ -n "$value" ]; then
    printf "%s present\n" "$name"
  else
    printf "%s missing_or_empty\n" "$name"
  fi
done
```

Every Telegram support name must print `present` before Telegram proof can run. `OPENAI_API_KEY` must print `present` before live OpenAI draft proof can run. If `OPENAI_API_KEY` is missing, AI-backed buttons should use the deterministic private fallback path.

`TELEGRAM_SUPPORT_WEBHOOK_SECRET` must be the same value sent to Telegram as `setWebhook.secret_token`. Telegram echoes it back in the `X-Telegram-Bot-Api-Secret-Token` header. Telegram requires this token to be 1-256 characters and only `A-Z`, `a-z`, `0-9`, `_`, and `-`.

Optional kill switch:

```bash
bunx convex env set SUPPORT_CHAT_DISABLED "1"
```

Unset `SUPPORT_CHAT_DISABLED` or set it to `0` to re-enable the widget bridge.

Optional AI model override:

```bash
bunx convex env set SUPPORT_AI_DRAFT_MODEL "gpt-5.4-mini-2026-03-17"
```

If `SUPPORT_AI_DRAFT_MODEL` is unset, support drafts use `gpt-5.4-mini-2026-03-17`.

## Register The Webhook

Use the Convex site URL, not the browser client URL:

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_SUPPORT_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-convex-site>.convex.site/telegram/support/webhook",
    "secret_token": "'"$TELEGRAM_SUPPORT_WEBHOOK_SECRET"'",
    "allowed_updates": ["message", "callback_query"],
    "drop_pending_updates": false
  }'
```

Keep `allowed_updates` narrow. This bridge accepts only `message` replies and `callback_query` actions from the support topic inline keyboard.

Verify registration without printing the token:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_SUPPORT_BOT_TOKEN/getWebhookInfo"
```

Check that:

- `url` is `https://<your-convex-site>.convex.site/telegram/support/webhook`
- `allowed_updates` is exactly `["message", "callback_query"]`
- `pending_update_count` is not growing after test messages
- `last_error_message` is absent

## Visitor Acknowledgement

On the first visitor message in a support thread, the website stores the visitor message and then shows two website-only system acknowledgement messages:

```text
Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.

Parker usually catches these pretty quickly when he's near his phone.
```

These are `system` messages in Convex. They appear only in the website widget and are not sent to Telegram as visitor messages. They intentionally do not claim Parker is online and do not promise a response time.

## Screenshots And Bug Reports

The support widget accepts one explicit customer-selected screenshot per message. Supported formats are PNG, JPG, and WebP up to 10 MB.

The browser asks `/api/support/attachments` for a Convex storage upload URL using the HttpOnly support session cookie, uploads the file directly to Convex storage, and then sends the storage id through `/api/support/messages`. The browser never receives a support bearer token or Telegram bot token.

When a message includes a screenshot, Convex validates stored blob metadata again before creating the visitor message. Telegram receives the text message in the customer topic and then receives the screenshot through `sendPhoto` with a short caption. The website transcript shows the screenshot inside the visitor bubble when Convex can return a signed storage URL.

The widget also has a `Bug` mode. That mode sends a structured visitor message with impact, page path, viewport, browser user agent, what happened, what the customer was doing, and what they expected instead. The app does not automatically attach workspace source, logs, local paths, payment details, or transcript DOM. Customers must explicitly type the bug report and explicitly choose any screenshot.

Screenshot storage follows the same closed-thread retention path as support transcripts. When closed transcripts are purged, message bodies are removed and attached screenshot files are deleted from Convex storage before Telegram topic cleanup is attempted.

## Operator Buttons

Every support topic starts with a bot-authored header and an inline keyboard. Normal Telegram replies from allowlisted operators become website-visible replies.

New support topics show this default keyboard:

```text
Yoooo | Whatcha
Draft Parker
Close
```

Customer-visible buttons:

- `Yoooo`: sends `Yooo - how'd you find my site?`
- `Whatcha`: sends `Whatcha trying to make?`
- `Close`: closes the website thread and starts the closed-transcript retention window

`Draft Parker` is operator-only and AI-backed when `OPENAI_API_KEY` is configured. It posts a private Parker-style draft in the Telegram topic only. The generated Telegram note includes `Send draft` and `Discard` buttons. `Send draft` writes the generated draft to the visitor transcript as one normal operator message. `Discard` prevents that generated draft from being sent later. Duplicate `Send draft` or `Discard` callbacks do not create duplicate visitor-visible messages.

Older in-flight Telegram keyboards may still include legacy buttons. The webhook continues to validate those callback payloads safely, but new topic headers do not show them by default.

Legacy AI and Linear buttons are private and draft-only unless an explicit `Send draft` decision is present for a `Draft Parker` reply. They do not create a Linear issue and do not send generated text to the visitor automatically.

Each button creates a `supportOperatorActions` audit record with operator id, callback query id, source message when available, AI generation status, generated output when applicable, output source, model, generation failure reason, operator-note delivery status, Telegram note message id or delivery failure reason, customer-visible message id when one is created, and draft-send or discard decision when applicable.

When Parker taps an AI-backed button, the callback mutation stores a deterministic private fallback and schedules OpenAI Responses API generation in the same Convex transaction. The webhook answers Telegram with `answerCallbackQuery`. The Responses request sets `store: false`.

If OpenAI succeeds, Convex patches the audit record with `generatedOutputSource: "openai_responses"` and posts the generated text as a private Telegram topic note. If `OPENAI_API_KEY` is missing or OpenAI fails, Convex keeps `generatedOutputSource: "deterministic"`, records `generationFailureReason`, and posts the deterministic fallback note instead. If Telegram cannot receive that private note, Convex records `operatorNoteDeliveryStatus: "delivery_failed"` and leaves the AI result intact.

AI output is not inserted into `supportMessages` or shown in the website transcript until Parker explicitly taps `Send draft` or sends a normal Telegram reply manually. Generated output must not be sent to PostHog.

Telegram inline keyboard callback data is limited to 1-64 bytes, so the app uses compact callback data:

- `support:<support-id>:<action>` for topic actions
- `draft:<operator-action-id>:<decision>` for draft decisions

The webhook answers callback queries with `answerCallbackQuery` so Telegram clients do not leave a spinner running.

## Verification

Open the homepage, open the Message Parker launcher, and send a test message. A new Telegram topic named with the `SBS-...` support id and safe entry label should appear, such as `homepage` or `workspace`.

Reply in that topic from an operator user listed in `TELEGRAM_SUPPORT_OPERATOR_USER_IDS`. The reply should appear in the widget on the next refresh or poll.

Signed-in buyers also get an `Ask Parker` launcher inside protected workspace routes. Messages from that launcher use the same support bridge with `entrySurface: "workspace_support_widget"` and do not automatically send workspace source, findings, logs, local paths, or payment details.

Verify buttons:

- Tap `Yoooo`; the widget should show `Yooo - how'd you find my site?`.
- Tap `Whatcha`; the widget should show `Whatcha trying to make?`.
- Tap `Draft Parker`; Telegram should acknowledge the tap, then receive a private AI note with `Send draft` and `Discard`. The widget should not receive a new message until `Send draft` is tapped.
- Tap `Close`; the widget should show the closed state after refresh.

Verify screenshot and bug-report handling by switching the widget to `Bug`, filling the bug fields, attaching a small PNG screenshot, and sending. The website should render the visitor bubble immediately with sending state, then show the uploaded screenshot after Convex responds. Telegram should receive the structured bug text and a separate photo message. The structured text should include page, viewport, and browser context only; it should not contain source code, logs, local filesystem paths, payment details, or workspace transcript DOM.

Verify the AI provider path by setting `OPENAI_API_KEY`, tapping `Draft Parker`, and inspecting the `supportOperatorActions` record for that callback. It should keep the same action row, set `aiDraftGenerationStatus` to `completed`, set `generatedOutputSource` to `openai_responses`, set `generatedOutputModel` to the active support draft model, record `operatorNoteDeliveryStatus`, and leave `supportMessages` unchanged until `Send draft` is tapped. Tap `Send draft` and verify exactly one operator support message is created. Tap `Send draft` again and verify no duplicate message is created.

Unset `OPENAI_API_KEY` only in a non-production deployment when proving fallback. Telegram should receive the deterministic fallback note and the action row should contain `generationFailureReason`.

## Operations

Convex runs `support retention maintenance` every six hours from `apps/web/convex/crons.ts` on the hosted deployment. It closes idle anonymous open threads after 14 days, retains closed transcript bodies for 90 days, purges `supportMessages.body` and `supportOperatorActions.generatedOutput` after the retention window, and then attempts Telegram `deleteForumTopic` when the thread has a known Telegram topic id.

Failed Telegram topic cleanup is selected again on later maintenance runs. Fixing bot permissions or transient provider failures lets the next run delete the already-purged topic. Support audit rows remain; purge removes transcript content and generated operator output, not the fact that the thread or action existed.

Signed-in workspace support threads are not auto-closed by this retention worker. Their `idleCloseAfter` timestamp is moved forward so they stay visible until a later account-history plan defines a signed-in retention policy.

Use the token-protected operations snapshot before a recovery session:

```bash
bunx convex run supportAdmin:getOperationsSnapshot '{"recoveryToken":"<random-recovery-token>"}'
```

The snapshot returns bounded metadata only: failed visitor message ids, support ids, failure classes, delivery attempt counts, operator-note delivery failures, idle threads due for close, transcripts due for purge, and Telegram topic cleanup failures. It does not return support message bodies, emails, Telegram user ids, visitor session tokens, or AI-generated output.

Manual visitor-message retry is explicit:

```bash
bunx convex run supportAdmin:retryFailedVisitorMessage '{"messageId":"<supportMessages-id>","recoveryToken":"<random-recovery-token>"}'
```

Retry is allowed only when the message is visitor-authored, still has an unpurged body, belongs to an open unpurged thread, has `deliveryStatus: "delivery_failed"`, has a retryable failure class, and has fewer than five recorded delivery attempts. Convex claims the message by moving it back to `sending` before calling Telegram, so repeated retry commands for the same message are rejected while one delivery attempt is in flight.

`content_rejected` messages, closed threads, purged messages, in-flight messages, and over-attempted messages are not retried. Fix provider setup first, then retry once and inspect the returned thread state.

Support PostHog events are metadata-only. They may include support surface, entry surface, page path, thread status, message count, latest delivery status, delivery failure class, and generic failure class. They must not include message text, email addresses, Telegram ids, raw support session tokens, transcript DOM, or generated AI output. The transcript log keeps `data-ph-no-capture="true"` plus `ph-no-capture ph-sensitive`, and the textarea keeps `data-ph-mask="true"` plus `ph-mask ph-sensitive`.

## Failure Shapes

- Missing or wrong `X-Telegram-Bot-Api-Secret-Token`: Convex returns `401`, and Telegram retries.
- Invalid JSON: Convex returns `400`, and Telegram retries.
- Missing support chat id or operator allowlist after a valid webhook secret: Convex returns `200` with an ignored setup reason so Telegram does not retry a non-actionable update.
- Unsupported update shape, unknown chat, unknown operator, missing topic, command, or media-only message: Convex returns `200` with an ignored reason so Telegram does not retry noise.
- Missing `OPENAI_API_KEY` or OpenAI provider failure: the webhook still returns `200`, the AI action keeps deterministic private output, `generationFailureReason` is recorded, and no website-visible message is created.
- Thread closed or purged before a scheduled AI draft runs: Convex marks AI draft generation as failed, records the context-unavailable reason, marks the private operator note as delivery failed, and creates no website-visible message.
- Private Telegram note delivery failure: the webhook still returns `200`, the action row records `operatorNoteDeliveryStatus: "delivery_failed"` with the failure reason, and no generated output is inserted into `supportMessages`.
- Retention cleanup failure: the thread records `telegramTopicCleanupStatus: "failed"` with `telegramTopicCleanupFailureReason`; transcript bodies remain purged, and later maintenance runs retry Telegram topic deletion after bot permissions or provider errors are repaired.
- `Forbidden: not enough rights` from Telegram delivery usually means the bot is missing `can_manage_topics` or was not added as an administrator.
- Closed-topic cleanup failures usually mean the bot is missing `can_delete_messages`.

Telegram API references:

- [setWebhook](https://core.telegram.org/bots/api#setwebhook)
- [getWebhookInfo](https://core.telegram.org/bots/api#getwebhookinfo)
- [createForumTopic](https://core.telegram.org/bots/api#createforumtopic)
- [deleteForumTopic](https://core.telegram.org/bots/api#deleteforumtopic)
- [InlineKeyboardButton](https://core.telegram.org/bots/api#inlinekeyboardbutton)
- [answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery)
