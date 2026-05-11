"use client";

import { useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";

import type { TelegramChatRealtimeState } from "../../core/telegram-chat-client";
import type { TelegramChatThreadState } from "../../core/telegram-chat-types";

export type ConvexTelegramChatThreadQuery = FunctionReference<
	"query",
	"public",
	{ capabilityToken: string },
	TelegramChatThreadState
>;

export type ConvexTelegramChatRealtimeOptions = {
	readonly capabilityToken: string | null;
	readonly enabled?: boolean;
	readonly query: ConvexTelegramChatThreadQuery;
};

export function useConvexTelegramChatRealtime({
	capabilityToken,
	enabled = true,
	query,
}: ConvexTelegramChatRealtimeOptions): TelegramChatRealtimeState {
	const threadState = useQuery(
		query,
		enabled && capabilityToken ? { capabilityToken } : "skip",
	);

	if (!enabled || !capabilityToken) {
		return { status: "unavailable" };
	}

	if (threadState === undefined) {
		return { status: "loading" };
	}

	return adaptConvexTelegramChatThreadState(threadState);
}

export function adaptConvexTelegramChatThreadState(
	threadState: TelegramChatThreadState,
): TelegramChatRealtimeState {
	if (
		threadState.status === "disabled" &&
		threadState.error?.toLowerCase().includes("realtime session expired")
	) {
		return { status: "unavailable" };
	}

	return {
		status: "ready",
		threadState,
	};
}
