import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({
		label,
		offerId,
		testId,
		onBeforeCheckout,
	}: {
		label: string;
		offerId: "starter" | "workers";
		testId?: string;
		onBeforeCheckout?: () => void | Promise<void>;
	}) => (
		<button
			type="button"
			data-offer-id={offerId}
			data-testid={testId}
			onClick={() => void onBeforeCheckout?.()}
		>
			{label}
		</button>
	),
}));

import { homePageContent } from "@/app/_content/home-page";
import {
	HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY,
	parseHomePageCodebaseDraftEnvelope,
} from "@/app/_components/home-page/sections/codebase-demo/home-page-codebase-draft-storage";
import { StarterInteractivePreview } from "@/components/starter/StarterInteractivePreview";

describe("StarterInteractivePreview", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		window.localStorage.clear();
		vi.restoreAllMocks();
	});

	it("renders only the Starter preview path and persists draft fields before checkout", async () => {
		const user = userEvent.setup();
		render(
			<StarterInteractivePreview
				section={homePageContent.productPreviewSection}
				offerPriceDisplay="$297"
			/>,
		);

		expect(screen.getByTestId("starter-interactive-preview")).toBeTruthy();
		expect(screen.queryByTestId("codebase-demo-codebase-branch")).toBeNull();
		expect(
			screen
				.getByTestId("starter-preview-checkout-cta")
				.getAttribute("data-offer-id"),
		).toBe("starter");

		const sidebarItems = screen.getAllByTestId(
			/codebase-demo-sidebar-section-/,
		);
		expect(sidebarItems.map((item) => item.dataset.testid)).toEqual([
			"codebase-demo-sidebar-section-foundation",
			"codebase-demo-sidebar-section-design",
			"codebase-demo-sidebar-section-pricing",
			"codebase-demo-sidebar-section-generated-preview",
		]);

		await user.type(
			screen.getByTestId("codebase-demo-input-product_name"),
			"Telemetry Pro",
		);
		await user.type(
			screen.getByTestId("codebase-demo-input-product_summary"),
			"Ops teams spot revenue leaks before renewal calls.",
		);
		await user.type(
			screen.getByTestId("codebase-demo-input-primary_user"),
			"Customer success lead",
		);

		const linearPreset = screen.getByTestId(
			"codebase-demo-design-preset-linear",
		);
		await user.click(linearPreset);
		expect(linearPreset.getAttribute("aria-checked")).toBe("true");

		const monthlyModel = screen.getByTestId(
			"codebase-demo-pricing-model-monthly",
		);
		await user.click(monthlyModel);
		expect(monthlyModel.getAttribute("aria-checked")).toBe("true");

		await user.click(screen.getByTestId("starter-preview-checkout-cta"));

		await waitFor(() => {
			const raw = window.localStorage.getItem(
				HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY,
			);
			expect(raw).not.toBeNull();
			const envelope = parseHomePageCodebaseDraftEnvelope(raw ?? "");
			expect(envelope?.fields.product_name).toBe("Telemetry Pro");
			expect(envelope?.fields.product_summary).toBe(
				"Ops teams spot revenue leaks before renewal calls.",
			);
			expect(envelope?.fields.primary_user).toBe("Customer success lead");
			expect(envelope?.fields.design_preset_id).toBe("linear");
			expect(envelope?.fields.pricing_model).toBe("monthly");
			expect(envelope?.fields.theme_preset.length).toBeGreaterThan(0);
		});
	});
});
