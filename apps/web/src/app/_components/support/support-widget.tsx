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
	const { capabilityState: realtimeCapability, requestCapability } =
		useSupportRealtimeCapability();
	const convexRealtimeState = useConvexTelegramChatRealtime({
		capabilityToken: realtimeCapability.capabilityToken,
		enabled: realtimeCapability.status === "ready",
		query: api.support.getThreadByConversationCapability,
	});
	const realtimeState: TelegramChatRealtimeState =
		realtimeCapability.status === "loading"
			? { status: "loading" }
			: convexRealtimeState;
	const recordSupportEvent = useCallback(
		(event: TelegramChatEvent) => {
			if (
				event.name === "support_widget_opened" ||
				event.name === "support_widget_message_sent"
			) {
				requestCapability();
			}

			capturePostHogProductEvent({
				event: event.name,
				properties: event.properties,
			});
		},
		[requestCapability],
	);

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
