import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchQueryMock = vi.fn();
const getConvexServerSessionMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: fetchQueryMock,
}));

vi.mock("@/platform/auth/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		billing: {
			viewerBillingState: "viewerBillingState",
		},
	},
}));

describe("app shell billing attention server loader", () => {
	beforeEach(() => {
		vi.resetModules();
		fetchQueryMock.mockReset();
		getConvexServerSessionMock.mockReset();
	});

	it("skips Convex billing state when no server token is available", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: null,
		});
		const { getServerAppShellBillingAttention } =
			await import("@/app/(app)/_server/app-shell-billing-attention");

		await expect(getServerAppShellBillingAttention()).resolves.toBeNull();

		expect(fetchQueryMock).not.toHaveBeenCalled();
	});

	it("maps Workers past-due state to the app shell recovery banner", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "convex-token",
		});
		fetchQueryMock.mockResolvedValue({
			kind: "ready",
			workers: {
				billingAttention: {
					kind: "workers_past_due",
					productKey: "workers",
					nondismissible: true,
					paymentRecoveryUrl: "https://billing.stripe.test/recover",
				},
			},
		});
		const { getServerAppShellBillingAttention } =
			await import("@/app/(app)/_server/app-shell-billing-attention");

		await expect(getServerAppShellBillingAttention()).resolves.toEqual({
			title: "Payment needs attention",
			message:
				"Workers access stays active during the retry window. Update the payment method to keep the workspace current.",
			statusLabel: "past_due",
			action: {
				label: "Update payment method",
				href: "https://billing.stripe.test/recover",
			},
		});
		expect(fetchQueryMock).toHaveBeenCalledWith(
			"viewerBillingState",
			{},
			{ token: "convex-token" },
		);
	});

	it("returns no banner when billing attention is clear", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "convex-token",
		});
		fetchQueryMock.mockResolvedValue({
			kind: "ready",
			workers: {
				billingAttention: {
					kind: "none",
				},
			},
		});
		const { getServerAppShellBillingAttention } =
			await import("@/app/(app)/_server/app-shell-billing-attention");

		await expect(getServerAppShellBillingAttention()).resolves.toBeNull();
	});
});
