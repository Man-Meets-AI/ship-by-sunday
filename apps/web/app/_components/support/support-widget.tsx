"use client";

import {
	TelegramChatWidget,
	type TelegramChatContent,
	type TelegramChatEntrySurface,
	type TelegramChatEvent,
	type TelegramChatLauncherMotion,
	type TelegramChatRealtimeState,
	type TelegramChatSurface,
} from "@shipbysunday/telegram-chat-widget";
import { useConvexTelegramChatRealtime } from "@shipbysunday/telegram-chat-widget/convex";
import { createFetchTelegramChatClient } from "@shipbysunday/telegram-chat-widget/fetch";
import { useCallback, useMemo } from "react";

import { api } from "@/convex/_generated/api";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import { useSupportRealtimeCapability } from "./use-support-realtime-capability";

export type SupportWidgetAnalyticsSurface = TelegramChatSurface;
export type SupportWidgetContent = TelegramChatContent;
export type SupportWidgetEntrySurface = TelegramChatEntrySurface;
export type SupportWidgetLauncherMotion = TelegramChatLauncherMotion;

export function SupportWidget({
	analyticsSurface,
	content,
	entrySurface,
	fallbackHref,
	launcherMotion,
}: {
	readonly analyticsSurface: SupportWidgetAnalyticsSurface;
	readonly content: SupportWidgetContent;
	readonly entrySurface: SupportWidgetEntrySurface;
	readonly fallbackHref: string;
	readonly launcherMotion: SupportWidgetLauncherMotion;
}) {
	const supportChatClient = useMemo(() => createFetchTelegramChatClient(), []);
	const realtimeCapability = useSupportRealtimeCapability();
	const convexRealtimeState = useConvexTelegramChatRealtime({
		capabilityToken: realtimeCapability.capabilityToken,
		enabled: realtimeCapability.status === "ready",
		query: api.support.getThreadByConversationCapability,
	});
	const realtimeState: TelegramChatRealtimeState =
		realtimeCapability.status === "loading"
			? { status: "loading" }
			: convexRealtimeState;
	const recordSupportEvent = useCallback((event: TelegramChatEvent) => {
		capturePostHogProductEvent({
			event: event.name,
			properties: event.properties,
		});
	}, []);

	return (
		<TelegramChatWidget
			client={supportChatClient}
			content={content}
			entrySurface={entrySurface}
			eventSink={recordSupportEvent}
			fallbackHref={fallbackHref}
			launcherMotion={launcherMotion}
			realtime={realtimeState}
			surface={analyticsSurface}
		/>
	);
}
