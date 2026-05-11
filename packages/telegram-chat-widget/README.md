# Telegram Chat Widget

Internal React package for the Ship by Sunday Telegram-backed customer support widget.

This package owns the rendered widget, message/thread contracts, screenshot policy, bug-report payload rendering, metadata-only event helpers, CSS variables, and the fetch adapter for the current app routes. `apps/web` consumes the package through a thin host wrapper that supplies the fetch client, branded content, fallback link, entry surface, and PostHog event sink.

## Imports

```ts
import {
	TelegramChatWidget,
	mergeTelegramChatContent,
	type TelegramChatClient,
	type TelegramChatRealtimeState,
} from "@shipbysunday/telegram-chat-widget";
import { useConvexTelegramChatRealtime } from "@shipbysunday/telegram-chat-widget/convex";
import { createFetchTelegramChatClient } from "@shipbysunday/telegram-chat-widget/fetch";
import "@shipbysunday/telegram-chat-widget/styles.css";
```

The root export contains framework-independent types, content helpers, privacy constants, the full `TelegramChatWidget`, and shared client contracts. The fetch adapter lives under `./fetch`. The Convex realtime hook lives under `./convex` so Convex stays optional for hosts that do not provide a Convex React provider.

## Widget Host Contract

Hosts render the full widget by passing one typed client adapter plus the small amount of host-owned context:

```tsx
"use client";

import { TelegramChatWidget } from "@shipbysunday/telegram-chat-widget";
import { createFetchTelegramChatClient } from "@shipbysunday/telegram-chat-widget/fetch";

const client = createFetchTelegramChatClient();

export function SupportWidgetHost() {
	return (
		<TelegramChatWidget
			client={client}
			entrySurface="homepage_support_widget"
			fallbackHref="https://t.me/parkerrex"
			launcherMotion="squishy"
			surface="homepage"
		/>
	);
}
```

The host must import package CSS once from a global app entry or root layout:

```tsx
import "@shipbysunday/telegram-chat-widget/styles.css";
```

`TelegramChatWidget` owns launcher/panel state, load-on-open, fetch fallback refresh, realtime thread-state application, message drafts, inline bug-report mode, screenshot validation, optimistic visitor messages, Enter-to-send, and delivery/error states. Host apps own transport implementation, fallback URL, placement choice, content overrides, and analytics mapping.

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

Transcript and input privacy hooks are exported as constants so UI slices can consistently apply PostHog replay masking. Analytics helpers accept the package lifecycle and delivery metadata fields as primitive values and reject transcript fields such as `messageText`, `body`, screenshot URLs, raw session tokens, email, Telegram ids, and unknown event properties.

## Convex Realtime

`@shipbysunday/telegram-chat-widget/convex` exports `useConvexTelegramChatRealtime()`. Hosts pass a generated Convex query reference and a browser-visible support conversation capability token. The hook returns a `TelegramChatRealtimeState` for `TelegramChatWidget`.

```tsx
"use client";

import { TelegramChatWidget } from "@shipbysunday/telegram-chat-widget";
import { useConvexTelegramChatRealtime } from "@shipbysunday/telegram-chat-widget/convex";
import { createFetchTelegramChatClient } from "@shipbysunday/telegram-chat-widget/fetch";
import { api } from "@/convex/_generated/api";

const client = createFetchTelegramChatClient();

export function SupportWidgetHost({
	capabilityToken,
}: {
	readonly capabilityToken: string | null;
}) {
	const realtime = useConvexTelegramChatRealtime({
		capabilityToken,
		query: api.support.getThreadByConversationCapability,
	});

	return (
		<TelegramChatWidget
			client={client}
			entrySurface="homepage_support_widget"
			fallbackHref="https://t.me/parkerrex"
			realtime={realtime}
			surface="homepage"
		/>
	);
}
```

When `realtime.status` is `loading` or `ready`, the widget suppresses the fetch refresh loop. When realtime is unavailable, the widget falls back to the fetch adapter.

Ship by Sunday issues the capability from `GET /api/support/session`: the HttpOnly support-session cookie stays server-only, and Convex stores only a hash of the browser-visible realtime capability.

## Commands

```sh
bun run --cwd packages/telegram-chat-widget lint
bun run --cwd packages/telegram-chat-widget format:check
bun run --cwd packages/telegram-chat-widget typecheck
bun run --cwd packages/telegram-chat-widget test
```
