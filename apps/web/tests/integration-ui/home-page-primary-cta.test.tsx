import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
			data-has-before-checkout={onBeforeCheckout ? "true" : "false"}
			onClick={() => void onBeforeCheckout?.()}
		>
			{label}
		</button>
	),
}));

import { routeConfig } from "@/config/product";
import { HomePagePrimaryCta } from "@/app/_components/home-page/sections/home-page-primary-cta";

describe("HomePagePrimaryCta", () => {
	it("delegates checkout targets to CheckoutButton", () => {
		render(
			<HomePagePrimaryCta
				target={{
					kind: "checkout",
				}}
				label="Get instant access"
				className="cta-size"
				testId="hero-cta"
			/>,
		);

		const button = screen.getByRole("button", { name: "Get instant access" });
		expect(button.getAttribute("data-kind")).toBe("checkout");
		expect(button.getAttribute("data-testid")).toBe("hero-cta");
		expect(button.className).toContain("cta-size");
	});

	it("renders link targets as anchors without checkout wiring", () => {
		render(
			<HomePagePrimaryCta
				target={{ kind: "link", href: routeConfig.docs }}
				label="Read the docs"
				testId="docs-cta"
			/>,
		);

		const link = screen.getByRole("link", { name: "Read the docs" });
		expect(link.getAttribute("href")).toBe(routeConfig.docs);
		expect(link.getAttribute("data-testid")).toBe("docs-cta");
		expect(screen.queryByRole("button", { name: "Read the docs" })).toBeNull();
	});

	it("forwards onBeforeCheckout to the CheckoutButton on the checkout branch", async () => {
		const onBeforeCheckout = vi.fn();
		render(
			<HomePagePrimaryCta
				target={{
					kind: "checkout",
				}}
				label="Start my AI build"
				testId="demo-cta"
				onBeforeCheckout={onBeforeCheckout}
			/>,
		);

		const button = screen.getByRole("button", {
			name: "Start my AI build",
		});
		expect(button.getAttribute("data-has-before-checkout")).toBe("true");
		button.click();
		expect(onBeforeCheckout).toHaveBeenCalledTimes(1);
	});
});
