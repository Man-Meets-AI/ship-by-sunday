import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const requireProductAccessMock = vi.fn();

vi.mock("@/features/product-access/server/product-access", () => ({
	requireProductAccess: requireProductAccessMock,
}));

describe("protected app layout", () => {
	beforeEach(() => {
		requireProductAccessMock.mockReset();
		requireProductAccessMock.mockResolvedValue({
			clerkUserId: "user_123",
			hasAccess: true,
			status: "granted",
		});
	});

	it("checks product access once before rendering protected children", async () => {
		const { default: AppLayout } = await import("@/app/(app)/layout");

		const markup = renderToStaticMarkup(
			await AppLayout({
				children: <div>Protected content</div>,
			}),
		);

		expect(requireProductAccessMock).toHaveBeenCalledTimes(1);
		expect(markup).toContain("Protected content");
	});
});
