import {
	shouldPollTelegramChatThread,
	telegramChatRealtimeSuppressesFetchRefresh,
} from "../src/react/telegram-chat-widget";
import { createTelegramChatTestThreadState } from "../src/testing";
import { describe, expect, it } from "vitest";

describe("telegram chat realtime state", () => {
	it("suppresses fetch refresh while realtime is loading or ready", () => {
		expect(
			telegramChatRealtimeSuppressesFetchRefresh({ status: "loading" }),
		).toBe(true);
		expect(
			telegramChatRealtimeSuppressesFetchRefresh({
				status: "ready",
				threadState: createTelegramChatTestThreadState(),
			}),
		).toBe(true);
		expect(
			telegramChatRealtimeSuppressesFetchRefresh({
				status: "unavailable",
			}),
		).toBe(false);
	});

	it("keeps polling as a fallback only when realtime is unavailable", () => {
		expect(
			shouldPollTelegramChatThread({
				hasLoadedThread: true,
				isOpen: true,
				realtime: { status: "unavailable" },
			}),
		).toBe(true);
		expect(
			shouldPollTelegramChatThread({
				hasLoadedThread: true,
				isOpen: true,
				realtime: { status: "loading" },
			}),
		).toBe(false);
		expect(
			shouldPollTelegramChatThread({
				hasLoadedThread: false,
				isOpen: true,
				realtime: undefined,
			}),
		).toBe(false);
	});
});
