import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/_components/home-page/sections/scroll-reveal", () => ({
	ScrollReveal: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

import { homePageContent } from "@/app/_content/home-page";
import { ProductPreviewSectionBlock } from "@/app/_components/home-page/sections/product-preview-section";

describe("ProductPreviewSectionBlock", () => {
	it("lets public visitors edit the preview and keeps build/video actions protected by route", async () => {
		const user = userEvent.setup();

		render(
			<ProductPreviewSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Set up the repo.",
			}),
		).toBeTruthy();
		expect(screen.getByTestId("preview-build-repo").getAttribute("href")).toBe(
			"/settings",
		);
		expect(screen.getByTestId("preview-watch-video").getAttribute("href")).toBe(
			"/lesson/welcome-to-ship-by-sunday",
		);

		const githubInput = screen.getByLabelText("GitHub username");
		await user.clear(githubInput);
		await user.type(githubInput, "shipper");
		expect(screen.getAllByText("@shipper").length).toBeGreaterThan(0);

		await user.click(screen.getByRole("tab", { name: "QA" }));
		expect(
			screen.getByRole("heading", { level: 2, name: "QA path" }),
		).toBeTruthy();

		const repoInviteCheckbox = screen.getByRole("checkbox", {
			name: "Repo invite ready",
		});
		expect(repoInviteCheckbox.getAttribute("aria-checked")).toBe("false");
		await user.click(repoInviteCheckbox);
		expect(repoInviteCheckbox.getAttribute("aria-checked")).toBe("true");
	});
});
