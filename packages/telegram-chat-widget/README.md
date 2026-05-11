# Telegram Chat Widget

Internal React package for the Ship by Sunday Telegram-backed customer support widget.

This package owns the stable widget contracts first: message/thread types, screenshot policy, bug-report payload rendering, metadata-only event helpers, CSS variables, and the fetch adapter for the current app routes. The production app still renders the existing widget from `apps/web` until the UI extraction slice moves the interface into this package.

## Imports

```ts
import {
	TelegramChatWidget,
	mergeTelegramChatContent,
	type TelegramChatClient,
} from "@shipbysunday/telegram-chat-widget";
import { createFetchTelegramChatClient } from "@shipbysunday/telegram-chat-widget/fetch";
import "@shipbysunday/telegram-chat-widget/styles.css";
```

The root export contains framework-independent types, content helpers, privacy constants, the skeletal `TelegramChatWidget`, and shared client contracts. The fetch adapter lives under `./fetch` so a future Convex realtime adapter can stay optional.

## Fetch Adapter

`createFetchTelegramChatClient()` defaults to the current Ship by Sunday support routes:

- `GET /api/support/messages`
- `POST /api/support/messages`
- `POST /api/support/attachments`, followed by the returned upload URL

Override endpoints only when the host app deliberately mounts the bridge somewhere else:

```ts
const client = createFetchTelegramChatClient({
	messagesEndpoint: "/api/support/messages",
	attachmentsEndpoint: "/api/support/attachments",
});
```

Tests should pass `fetchImpl` instead of touching global network state.

## Content

`defaultTelegramChatContent` is Parker/Ship by Sunday branded. Hosts can pass partial overrides and `mergeTelegramChatContent()` will keep the package defaults for omitted labels.

## Screenshots And Bug Reports

The v1 attachment contract is one optional screenshot per message:

- PNG, JPEG, or WebP
- 10 MB max
- normalized file names

Bug reports stay structured in package input types and are rendered into the readable message body that the current app route accepts.

## Privacy And Analytics

Transcript and input privacy hooks are exported as constants so UI slices can consistently apply PostHog replay masking. Analytics helpers accept metadata-only primitive values and reject obvious transcript fields such as `messageText`, `body`, screenshot URLs, raw session tokens, email, or Telegram ids.

## Convex Realtime

`@shipbysunday/telegram-chat-widget/convex` is reserved for a later Convex realtime adapter slice. It does not import Convex and does not replace polling yet.

## Commands

```sh
bun run --cwd packages/telegram-chat-widget lint
bun run --cwd packages/telegram-chat-widget format:check
bun run --cwd packages/telegram-chat-widget typecheck
bun run --cwd packages/telegram-chat-widget test
```
