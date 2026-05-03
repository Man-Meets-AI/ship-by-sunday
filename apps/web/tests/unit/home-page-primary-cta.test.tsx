/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/checkout/_components/express-checkout-button", () => ({
	ExpressCheckoutButton: ({
		testId,
		buttonHeight,
	}: {
		readonly testId?: string;
		readonly buttonHeight?: number;
	}) => <div data-testid={testId} data-button-height={buttonHeight} />,
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({
		label,
		testId,
	}: {
		readonly label: string;
		readonly testId?: string;
	}) => <button data-testid={testId}>{label}</button>,
}));

import { HomePagePrimaryCta } from "@/app/_components/home-page/sections/home-page-primary-cta";

describe("HomePagePrimaryCta", () => {
	it("renders express checkout plus hosted checkout fallback for checkout CTAs", () => {
		render(
			<HomePagePrimaryCta
				target={{ kind: "checkout" }}
				label="Buy now"
				testId="primary-cta"
			/>,
		);

		expect(screen.getByTestId("primary-cta-express")).toBeTruthy();
		expect(screen.getByTestId("primary-cta").textContent).toBe("Buy now");
	});

	it("keeps tall homepage express checkout buttons inside Stripe's allowed height", () => {
		render(
			<HomePagePrimaryCta
				target={{ kind: "checkout" }}
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
