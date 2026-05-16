import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceSupportWidget } from "@/app/(app)/_components/workspace-support/workspace-support-widget";

const capturePostHogProductEventMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (input: unknown) =>
		capturePostHogProductEventMock(input),
}));

vi.mock("@shipbysunday/telegram-chat-widget/convex", () => ({
	useConvexTelegramChatRealtime: () => ({ status: "unavailable" }),
}));

function createThreadState(messageText = "Can you review my workspace setup?") {
	return {
		status: "open",
		supportId: "SBS-0506-5678",
		fallbackHref: "https://t.me/parkerrex",
		error: null,
		messages: [
			{
				id: "message_1",
				source: "visitor",
				body: messageText,
				attachment: null,
				createdAt: 1,
				deliveryStatus: "delivered_to_parker",
				deliveryFailureClass: null,
			},
			{
				id: "message_2",
				source: "system",
				body: "Got it. This went straight to Parker's Telegram.",
				attachment: null,
				createdAt: 2,
				deliveryStatus: "not_required",
				deliveryFailureClass: null,
			},
			{
				id: "message_3",
				source: "system",
				body: "He'll reply here when he can.",
				attachment: null,
				createdAt: 3,
				deliveryStatus: "not_required",
				deliveryFailureClass: null,
			},
		],
	};
}

describe("WorkspaceSupportWidget", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		capturePostHogProductEventMock.mockReset();
		window.history.pushState({}, "", "/workers/setup");
	});

	it("opens workspace support without exposing transcript DOM and sends workspace-scoped metadata", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						ok: true,
						realtime: { kind: "unavailable" },
					}),
					{ status: 200 },
				),
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						status: "empty",
						supportId: null,
						messages: [],
						fallbackHref: "https://t.me/parkerrex",
						error: null,
					}),
					{ status: 200 },
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify(createThreadState()), { status: 200 }),
			);

		const user = userEvent.setup();
		render(<WorkspaceSupportWidget fallbackHref="https://t.me/parkerrex" />);

		expect(fetchMock).not.toHaveBeenCalled();
		await user.click(screen.getByRole("button", { name: "Ask Parker" }));

		expect(
			await screen.findByText(
				"Send a note from the app. Parker replies from Telegram and the thread stays here.",
			),
		).toBeTruthy();
		expect(screen.getByRole("log").getAttribute("data-ph-no-capture")).toBe(
			"true",
		);
		expect(screen.getByRole("log").classList.contains("ph-no-capture")).toBe(
			true,
		);
		expect(screen.getByRole("log").classList.contains("ph-sensitive")).toBe(
			true,
		);
		const textarea = screen.getByPlaceholderText("Type an app question...");
		expect(textarea.getAttribute("data-ph-mask")).toBe("true");
		expect(textarea.classList.contains("ph-mask")).toBe(true);
		expect(textarea.classList.contains("ph-sensitive")).toBe(true);

		await user.type(textarea, "Can you review my workspace setup?");
		await user.click(screen.getByRole("button", { name: "Send" }));

		await waitFor(() =>
			expect(screen.getByText("Delivered to Parker")).toBeTruthy(),
		);
		expect(
			screen.queryByText("Got it. This went straight to Parker's Telegram."),
		).toBeNull();
		expect(screen.queryByText("He'll reply here when he can.")).toBeNull();
		expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/support/session", {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/support/messages", {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});
		expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/support/messages", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messageText: "Can you review my workspace setup?",
				pagePath: "/workers/setup",
				entrySurface: "workspace_support_widget",
				attachment: null,
			}),
		});
		expect(capturePostHogProductEventMock).toHaveBeenCalledWith({
			event: "support_widget_message_sent",
			properties: expect.objectContaining({
				surface: "workspace",
				entrySurface: "workspace_support_widget",
				pagePath: "/workers/setup",
				threadStatus: "open",
				messageCount: 3,
				latestDeliveryStatus: "delivered_to_parker",
				latestDeliveryFailureClass: null,
			}),
		});
		expect(
			JSON.stringify(capturePostHogProductEventMock.mock.calls),
		).not.toContain("Can you review my workspace setup?");
	});
});
