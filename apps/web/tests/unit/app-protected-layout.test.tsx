import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const getServerProductAccessMock = vi.fn();

vi.mock("@/platform/access/product-access", () => ({
	getServerProductAccess: getServerProductAccessMock,
}));

vi.mock(
	"@/app/(workspace)/_components/access-required/access-required-page",
	() => ({
		AccessRequiredPage: () => <div>Access recovery</div>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/workspace-support/workspace-support-widget",
	() => ({
		WorkspaceSupportWidget: () => <div>Support widget</div>,
	}),
);

describe("protected app layout", () => {
	beforeEach(() => {
		getServerProductAccessMock.mockReset();
		getServerProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
		});
	});

	it("checks product access once before rendering protected children", async () => {
		const { default: AppLayout } = await import("@/app/(workspace)/layout");

		const markup = renderToStaticMarkup(
			await AppLayout({
				children: <div>Protected content</div>,
			}),
		);

		expect(getServerProductAccessMock).toHaveBeenCalledTimes(1);
		expect(markup).toContain("Protected content");
	});
});
