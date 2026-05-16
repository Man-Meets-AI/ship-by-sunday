import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const getServerProductAccessMock = vi.fn();
const getServerAppShellBillingAttentionMock = vi.fn();

vi.mock("@/platform/access/product-access", () => ({
	getServerProductAccess: getServerProductAccessMock,
}));

vi.mock("@/app/(app)/_server/app-shell-billing-attention", () => ({
	getServerAppShellBillingAttention: getServerAppShellBillingAttentionMock,
}));

vi.mock("@/app/(app)/_components/access-required/access-required-page", () => ({
	AccessRequiredPage: () => <div>Access recovery</div>,
}));

vi.mock(
	"@/app/(app)/_components/workspace-support/workspace-support-widget",
	() => ({
		WorkspaceSupportWidget: () => (
			<div data-testid="workspace-support-widget">Support widget</div>
		),
	}),
);

describe("protected app layout", () => {
	beforeEach(() => {
		getServerProductAccessMock.mockReset();
		getServerAppShellBillingAttentionMock.mockReset();
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
		});
		getServerAppShellBillingAttentionMock.mockResolvedValue(null);
	});

	it("checks product access once before rendering protected children", async () => {
		const { default: AppLayout } = await import("@/app/(app)/layout");

		const markup = renderToStaticMarkup(
			await AppLayout({
				children: <div>Protected content</div>,
			}),
		);

		expect(getServerProductAccessMock).toHaveBeenCalledTimes(1);
		expect(getServerAppShellBillingAttentionMock).toHaveBeenCalledTimes(1);
		expect(markup).toContain("Protected content");
		expect(
			markup.match(/data-testid="workspace-support-widget"/g),
		).toHaveLength(1);
	});

	it("does not load billing attention for blocked visitors", async () => {
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: null,
			hasAccess: false,
			status: "signed_out",
		});
		const { default: AppLayout } = await import("@/app/(app)/layout");

		const markup = renderToStaticMarkup(
			await AppLayout({
				children: <div>Protected content</div>,
			}),
		);

		expect(getServerProductAccessMock).toHaveBeenCalledTimes(1);
		expect(getServerAppShellBillingAttentionMock).not.toHaveBeenCalled();
		expect(markup).toContain("Access recovery");
		expect(markup).not.toContain("Protected content");
		expect(markup).not.toContain('data-testid="workspace-support-widget"');
	});
});
