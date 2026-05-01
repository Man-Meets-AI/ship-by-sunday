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
	it("lets public visitors edit the preview and routes first-screen actions toward conversion context", async () => {
		const user = userEvent.setup();

		render(
			<ProductPreviewSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Build the worker layer.",
			}),
		).toBeTruthy();
		expect(screen.getByTestId("preview-primary-cta").getAttribute("href")).toBe(
			"#pricing",
		);
		expect(
			screen.getByTestId("preview-secondary-cta").getAttribute("href"),
		).toBe("#system");

		const githubInput = screen.getByLabelText("Codebase GitHub username");
		await user.clear(githubInput);
		await user.type(githubInput, "shipper");
		expect(screen.getAllByText("@shipper").length).toBeGreaterThan(0);

		await user.click(screen.getByRole("tab", { name: "Proof" }));
		expect(
			screen.getByRole("heading", { level: 2, name: "Code shipping path" }),
		).toBeTruthy();

		const channelLoopCheckbox = screen.getByRole("checkbox", {
			name: "Channel loop ready",
		});
		expect(channelLoopCheckbox.getAttribute("aria-checked")).toBe("false");
		await user.click(channelLoopCheckbox);
		expect(channelLoopCheckbox.getAttribute("aria-checked")).toBe("true");
	});
});
