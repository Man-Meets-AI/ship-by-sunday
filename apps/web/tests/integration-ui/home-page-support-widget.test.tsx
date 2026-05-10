import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HomePageRenderModel } from "@/app/_lib/home-page-render-model";
import { HomePageSupportWidget } from "@/app/_components/home-page/support/home-page-support-widget";

const capturePostHogProductEventMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (input: unknown) =>
		capturePostHogProductEventMock(input),
}));

const supportWidget = {
	isEnabled: true,
	fallbackHref: "https://t.me/parkerrex",
	content: {
		launcherLabel: "Message Parker",
		panelTitle: "Message Parker",
		panelSubtitle: "Ask about fit, scope, or what to do next.",
		starterMessage:
			"Send a note here. Parker replies from Telegram and the thread stays on this page.",
		messagePlaceholder: "Type your question...",
		bugReportLabel: "Bug",
		bugSummaryPlaceholder: "What broke?",
		bugStepsPlaceholder: "What were you trying to do?",
		bugExpectedPlaceholder: "What did you expect instead?",
		bugImpactLabel: "Bug impact",
		attachScreenshotLabel: "Attach screenshot",
		removeAttachmentLabel: "Remove screenshot",
		sendLabel: "Send",
		closeLabel: "Close support chat",
		fallbackLabel: "Open Telegram",
		directTelegramLabel: "Use Telegram directly",
		loadingLabel: "Loading conversation",
		sendingLabel: "Sending",
		deliveredLabel: "Delivered to Parker",
		failedLabel: "Parker may not have seen this.",
		closedLabel: "This thread is closed.",
	},
} satisfies HomePageRenderModel["supportWidget"];

function createThreadState(messageText = "Can this help my SaaS?") {
	return {
		status: "open",
		supportId: "SBS-0506-1234",
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
				body: "Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.",
				attachment: null,
				createdAt: 2,
				deliveryStatus: "not_required",
				deliveryFailureClass: null,
			},
			{
				id: "message_3",
				source: "system",
				body: "Parker usually catches these pretty quickly when he's near his phone.",
				attachment: null,
				createdAt: 3,
				deliveryStatus: "not_required",
				deliveryFailureClass: null,
			},
		],
	};
}

describe("HomePageSupportWidget", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		capturePostHogProductEventMock.mockReset();
	});

	it("opens the first-party widget, masks transcript DOM, and sends through the route", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
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
		render(<HomePageSupportWidget supportWidget={supportWidget} />);

		await user.click(screen.getByRole("button", { name: "Message Parker" }));

		expect(
			await screen.findByText(
				"Send a note here. Parker replies from Telegram and the thread stays on this page.",
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
		const textarea = screen.getByPlaceholderText("Type your question...");
		expect(textarea.getAttribute("data-ph-mask")).toBe("true");
		expect(textarea.classList.contains("ph-mask")).toBe(true);
		expect(textarea.classList.contains("ph-sensitive")).toBe(true);
		expect(screen.queryByText("Replies stay in this thread")).toBeNull();

		await user.type(textarea, "Can this help my SaaS?{Enter}");

		await waitFor(() =>
			expect(screen.getByText("Delivered to Parker")).toBeTruthy(),
		);
		expect(
			screen.getByText(
				"Howdy - lemme grab Parker. This goes straight to his phone, so bear with him a sec.",
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				"Parker usually catches these pretty quickly when he's near his phone.",
			),
		).toBeTruthy();
		expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/support/messages", {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/support/messages", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messageText: "Can this help my SaaS?",
				pagePath: "/",
				entrySurface: "homepage_support_widget",
				attachment: null,
			}),
		});
		expect(capturePostHogProductEventMock).toHaveBeenCalledWith({
			event: "support_widget_message_sent",
			properties: expect.objectContaining({
				surface: "homepage",
				entrySurface: "homepage_support_widget",
				pagePath: "/",
				threadStatus: "open",
				messageCount: 3,
				latestDeliveryStatus: "delivered_to_parker",
				latestDeliveryFailureClass: null,
			}),
		});
		expect(
			JSON.stringify(capturePostHogProductEventMock.mock.calls),
		).not.toContain("Can this help my SaaS?");
	});

	it("uploads a screenshot and sends a structured bug report", async () => {
		const bugReportState = {
			...createThreadState("Bug report\nImpact: Blocking me"),
			messages: [
				{
					id: "message_1",
					source: "visitor",
					body: "Bug report\nImpact: Blocking me\nWhat happened: Checkout stalled",
					attachment: {
						kind: "screenshot",
						fileName: "checkout-stall.png",
						contentType: "image/png",
						size: 1234,
						url: "https://storage.example/checkout-stall.png",
					},
					createdAt: 1,
					deliveryStatus: "delivered_to_parker",
					deliveryFailureClass: null,
				},
			],
		};
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
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
				new Response(
					JSON.stringify({ uploadUrl: "https://storage.example/upload" }),
					{ status: 200 },
				),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ storageId: "storage_123" }), {
					status: 200,
				}),
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify(bugReportState), { status: 200 }),
			);

		const user = userEvent.setup();
		const { container } = render(
			<HomePageSupportWidget supportWidget={supportWidget} />,
		);

		await user.click(screen.getByRole("button", { name: "Message Parker" }));
		await screen.findByText(
			"Send a note here. Parker replies from Telegram and the thread stays on this page.",
		);
		await user.click(screen.getByRole("button", { name: "Bug" }));
		await user.type(
			screen.getByPlaceholderText("What broke?"),
			"Checkout stalled",
		);
		await user.type(
			screen.getByPlaceholderText("What were you trying to do?"),
			"Pay from the homepage",
		);
		const fileInput =
			container.querySelector<HTMLInputElement>('input[type="file"]');
		expect(fileInput).toBeTruthy();
		await user.upload(
			fileInput as HTMLInputElement,
			new File(["fake image"], "checkout-stall.png", { type: "image/png" }),
		);
		await user.click(screen.getByRole("button", { name: "Send" }));

		await waitFor(() =>
			expect(screen.getByText("Delivered to Parker")).toBeTruthy(),
		);
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/support/attachments", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				fileName: "checkout-stall.png",
				contentType: "image/png",
				size: 10,
			}),
		});
		expect(fetchMock).toHaveBeenNthCalledWith(
			3,
			"https://storage.example/upload",
			expect.objectContaining({
				method: "POST",
				headers: {
					"Content-Type": "image/png",
				},
			}),
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			4,
			"/api/support/messages",
			expect.objectContaining({
				method: "POST",
				body: expect.stringContaining("Bug report"),
			}),
		);
		const messageRequestInit = fetchMock.mock.calls[3]?.[1] as
			| RequestInit
			| undefined;
		if (!messageRequestInit || typeof messageRequestInit.body !== "string") {
			throw new Error("Expected support message request body.");
		}
		const finalRequest = JSON.parse(messageRequestInit.body) as {
			messageText: string;
			attachment: { storageId: string; fileName: string };
		};
		expect(finalRequest.messageText).toContain(
			"What happened: Checkout stalled",
		);
		expect(finalRequest.messageText).toContain(
			"What I was doing: Pay from the homepage",
		);
		expect(finalRequest.attachment).toMatchObject({
			storageId: "storage_123",
			fileName: "checkout-stall.png",
		});
	});
});
