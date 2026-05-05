/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/checkout/_components/express-checkout-button", () => ({
	ExpressCheckoutButton: ({
		testId,
		checkoutIntent,
		buttonHeight,
	}: {
		readonly testId?: string;
		readonly checkoutIntent?: { readonly checkoutCtaId?: string };
		readonly buttonHeight?: number;
	}) => (
		<div
			data-testid={testId}
			data-button-height={buttonHeight}
			data-checkout-cta-id={checkoutIntent?.checkoutCtaId}
		/>
	),
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({
		label,
		testId,
		checkoutIntent,
	}: {
		readonly label: string;
		readonly testId?: string;
		readonly checkoutIntent?: { readonly checkoutCtaId?: string };
	}) => (
		<button
			data-testid={testId}
			data-checkout-cta-id={checkoutIntent?.checkoutCtaId}
		>
			{label}
		</button>
	),
}));

import { HomePagePrimaryCta } from "@/app/_components/home-page/sections/home-page-primary-cta";

describe("HomePagePrimaryCta", () => {
	it("renders express checkout plus hosted checkout fallback for checkout CTAs", () => {
		render(
			<HomePagePrimaryCta
				target={{
					kind: "checkout",
					checkoutIntent: {
						buyerStartingPoint: "no_codebase",
						checkoutCtaId: "hero_primary",
					},
				}}
				label="Buy now"
				testId="primary-cta"
			/>,
		);

		expect(screen.getByTestId("primary-cta-express")).toBeTruthy();
		expect(screen.getByTestId("primary-cta").textContent).toBe("Buy now");
		expect(
			screen.getByTestId("primary-cta-express").dataset.checkoutCtaId,
		).toBe("hero_primary");
		expect(screen.getByTestId("primary-cta").dataset.checkoutCtaId).toBe(
			"hero_primary",
		);
	});

	it("keeps tall homepage express checkout buttons inside Stripe's allowed height", () => {
		render(
			<HomePagePrimaryCta
				target={{
					kind: "checkout",
					checkoutIntent: {
						buyerStartingPoint: "no_codebase",
						checkoutCtaId: "pricing_primary",
					},
				}}
				label="Buy now"
				className="h-16"
				testId="pricing-cta"
			/>,
		);

		expect(
			screen
				.getByTestId("pricing-cta-express")
				.getAttribute("data-button-height"),
		).toBe("55");
	});
});
