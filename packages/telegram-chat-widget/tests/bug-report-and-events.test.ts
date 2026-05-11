import {
	createTelegramChatBugReportPayload,
	createTelegramChatEvent,
	getTelegramChatLatestVisitorDeliveryMetadata,
	renderTelegramChatBugReportBody,
} from "../src/index";
import {
	createTelegramChatTestMessage,
	createTelegramChatTestThreadState,
} from "../src/testing";
import { describe, expect, it } from "vitest";

describe("telegram chat bug reports", () => {
	it("preserves structured metadata and renders the current readable body", () => {
		const payload = createTelegramChatBugReportPayload({
			draft: {
				summary: "Checkout button does nothing",
				steps: "Opened checkout and clicked pay",
				expected: "Stripe checkout opens",
				impact: "blocked",
			},
			pageContext: {
				pagePath: "/checkout",
				viewport: "1440x900",
				userAgent: "Test Browser",
			},
		});

		expect(payload).toEqual({
			summary: "Checkout button does nothing",
			steps: "Opened checkout and clicked pay",
			expected: "Stripe checkout opens",
			impact: "blocked",
			pagePath: "/checkout",
			viewport: "1440x900",
			userAgent: "Test Browser",
		});
		expect(renderTelegramChatBugReportBody(payload!)).toContain("Bug report");
		expect(renderTelegramChatBugReportBody(payload!)).toContain(
			"What happened: Checkout button does nothing",
		);
		expect(renderTelegramChatBugReportBody(payload!)).toContain(
			"Expected: Stripe checkout opens",
		);
	});

	it("returns null for empty bug report summaries", () => {
		expect(
			createTelegramChatBugReportPayload({
				draft: {
					summary: " ",
					steps: "Clicked around",
					expected: "Something happened",
					impact: "question",
				},
				pageContext: {
					pagePath: "/",
					viewport: "unknown",
					userAgent: "unknown",
				},
			}),
		).toBeNull();
	});
});

describe("telegram chat events", () => {
	it("creates metadata-only analytics events", () => {
		expect(
			createTelegramChatEvent("support_widget_opened", {
				surface: "homepage",
				entrySurface: "homepage_support_widget",
				messageCount: 2,
				threadStatus: "open",
				latestDeliveryStatus: null,
			}),
		).toEqual({
			name: "support_widget_opened",
			properties: {
				surface: "homepage",
				entrySurface: "homepage_support_widget",
				messageCount: 2,
				threadStatus: "open",
				latestDeliveryStatus: null,
			},
		});
	});

	it("rejects message bodies and object-shaped analytics properties", () => {
		expect(() =>
			createTelegramChatEvent("support_widget_message_sent", {
				messageText: "secret transcript",
			}),
		).toThrow("not metadata");

		expect(() =>
			createTelegramChatEvent("support_widget_message_sent", {
				thread: {} as never,
			}),
		).toThrow("not metadata");
	});

	it("extracts only the latest visitor delivery metadata", () => {
		const threadState = createTelegramChatTestThreadState({
			messages: [
				createTelegramChatTestMessage({
					id: "operator_1",
					source: "operator",
					deliveryStatus: "not_required",
				}),
				createTelegramChatTestMessage({
					id: "visitor_1",
					source: "visitor",
					deliveryStatus: "delivery_failed",
					deliveryFailureClass: "rate_limited",
				}),
			],
		});

		expect(getTelegramChatLatestVisitorDeliveryMetadata(threadState)).toEqual({
			latestDeliveryStatus: "delivery_failed",
			latestDeliveryFailureClass: "rate_limited",
		});
	});
});
