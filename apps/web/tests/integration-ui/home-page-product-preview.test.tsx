import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/_components/home-page/sections/scroll-reveal", () => ({
	ScrollReveal: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/components/ui/pointer-highlight", () => ({
	PointerHighlight: ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	),
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({
		label,
		className,
		testId,
		onBeforeCheckout,
	}: {
		label: string;
		className?: string;
		testId?: string;
		onBeforeCheckout?: () => void | Promise<void>;
	}) => (
		<button
			type="button"
			data-kind="checkout"
			data-testid={testId}
			className={className}
			onClick={() => void onBeforeCheckout?.()}
		>
			{label}
		</button>
	),
}));

import { homePageContent } from "@/app/_content/home-page";
import { BlueprintDemoSectionBlock } from "@/app/_components/home-page/sections/blueprint-demo/blueprint-demo-section";
import {
	HOME_PAGE_BLUEPRINT_DRAFT_STORAGE_KEY,
	parseHomePageBlueprintDraftEnvelope,
} from "@/app/_components/home-page/sections/blueprint-demo/home-page-blueprint-draft-storage";

describe("BlueprintDemoSectionBlock", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		window.localStorage.clear();
	});

	it("renders all 7 canonical sections in order with foundation, design, and pricing interactive", () => {
		render(
			<BlueprintDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		const sidebarItems = screen.getAllByTestId(
			/blueprint-demo-sidebar-section-/,
		);
		expect(sidebarItems.map((item) => item.dataset.testid)).toEqual([
			"blueprint-demo-sidebar-section-foundation",
			"blueprint-demo-sidebar-section-problem",
			"blueprint-demo-sidebar-section-outcome",
			"blueprint-demo-sidebar-section-design",
			"blueprint-demo-sidebar-section-pricing",
			"blueprint-demo-sidebar-section-setup",
			"blueprint-demo-sidebar-section-generated-preview",
		]);

		expect(
			screen.getByTestId("blueprint-demo-section-foundation"),
		).toBeTruthy();
		expect(screen.getByTestId("blueprint-demo-section-design")).toBeTruthy();
		expect(screen.getByTestId("blueprint-demo-section-pricing")).toBeTruthy();
		expect(screen.getByTestId("blueprint-demo-locked-problem")).toBeTruthy();
		expect(screen.getByTestId("blueprint-demo-locked-outcome")).toBeTruthy();
		expect(screen.getByTestId("blueprint-demo-locked-setup")).toBeTruthy();
		expect(
			screen.getByTestId("blueprint-demo-locked-generated-preview"),
		).toBeTruthy();
	});

	it("typing into Foundation, choosing a Design preset, and toggling pricing model updates the draft and persists before checkout", async () => {
		const user = userEvent.setup();
		render(
			<BlueprintDemoSectionBlock
				section={homePageContent.productPreviewSection}
			/>,
		);

		const productNameInput = screen.getByTestId(
			"blueprint-demo-input-product_name",
		);
		await user.type(productNameInput, "Telemetry Pro");
		expect((productNameInput as HTMLInputElement).value).toBe("Telemetry Pro");

		const linearChip = screen.getByTestId(
			"blueprint-demo-design-preset-linear",
		);
		await user.click(linearChip);
		expect(linearChip.getAttribute("aria-checked")).toBe("true");

		const monthlyToggle = screen.getByTestId(
			"blueprint-demo-pricing-model-monthly",
		);
		await user.click(monthlyToggle);
		expect(monthlyToggle.getAttribute("aria-checked")).toBe("true");
		expect(
			screen.getByTestId("blueprint-demo-pricing-label").textContent,
		).toContain("monthly");

		const checkoutButton = screen.getByTestId("blueprint-demo-checkout-cta");
		expect(checkoutButton.textContent).toContain("Generate my codebase");
		await user.click(checkoutButton);

		await waitFor(() => {
			const raw = window.localStorage.getItem(
				HOME_PAGE_BLUEPRINT_DRAFT_STORAGE_KEY,
			);
			expect(raw).not.toBeNull();
			const envelope = parseHomePageBlueprintDraftEnvelope(raw ?? "");
			expect(envelope?.fields.product_name).toBe("Telemetry Pro");
			expect(envelope?.fields.design_preset_id).toBe("linear");
			expect(envelope?.fields.pricing_model).toBe("monthly");
			expect(envelope?.fields.theme_preset.length).toBeGreaterThan(0);
		});
	});
});
