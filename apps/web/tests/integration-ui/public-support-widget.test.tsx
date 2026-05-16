import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PublicSupportWidget } from "@/components/layout/public-support-widget";

const capturePostHogProductEventMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (input: unknown) =>
		capturePostHogProductEventMock(input),
}));

vi.mock("@shipbysunday/telegram-chat-widget/convex", () => ({
	useConvexTelegramChatRealtime: () => ({ status: "unavailable" }),
}));

describe("PublicSupportWidget", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		capturePostHogProductEventMock.mockReset();
		window.history.pushState({}, "", "/starter");
	});

	it("opens with public copy and records metadata-only public support analytics", async () => {
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
			);

		const user = userEvent.setup();
		render(<PublicSupportWidget />);

		await user.click(screen.getByRole("button", { name: "Message Parker" }));

		expect(
			await screen.findByText(
				"Send a note here. Parker replies from Telegram and the thread stays on this page.",
			),
		).toBeTruthy();
		expect(fetchMock).toHaveBeenCalledWith("/api/support/session", {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});
		await waitFor(() =>
			expect(capturePostHogProductEventMock).toHaveBeenCalledWith({
				event: "support_widget_opened",
				properties: {
					surface: "homepage",
					entrySurface: "homepage_support_widget",
					pagePath: "/starter",
				},
			}),
		);
	});
});
