import React from "react";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutButton } from "@/features/checkout/components/checkout-button";

describe("CheckoutButton interactions", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("starts guest checkout without redirecting through sign-in", async () => {
		const assignMock = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: {
				assign: assignMock,
			},
		});
		const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					sessionId: "cs_guest_123",
					url: "https://checkout.stripe.com/pay/cs_guest_123",
				}),
				{
					status: 200,
					headers: {
						"content-type": "application/json",
					},
				},
			),
		);

		const user = userEvent.setup();
		render(<CheckoutButton label="Get instant access" />);

		await user.click(screen.getByRole("button"));

		expect(fetchMock).toHaveBeenCalledWith("/api/stripe/checkout", {
			method: "POST",
		});
		expect(assignMock).toHaveBeenCalledWith(
			"https://checkout.stripe.com/pay/cs_guest_123",
		);
	});

	it("shows the checkout error and re-enables the button", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({ error: "Unable to start Stripe checkout." }),
				{
					status: 500,
					headers: {
						"content-type": "application/json",
					},
				},
			),
		);

		const user = userEvent.setup();
		render(<CheckoutButton label="Get instant access" />);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(
			await screen.findByText("Unable to start Stripe checkout."),
		).toBeTruthy();
		expect(button.getAttribute("disabled")).toBeNull();
		expect(button.getAttribute("aria-busy")).toBe("false");
	});

	it("redirects to the Stripe checkout URL on success", async () => {
		const assignMock = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: {
				assign: assignMock,
			},
		});
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					sessionId: "cs_test_123",
					url: "https://checkout.stripe.com/pay/cs_test_123",
				}),
				{
					status: 200,
					headers: {
						"content-type": "application/json",
					},
				},
			),
		);

		const user = userEvent.setup();
		render(<CheckoutButton label="Get instant access" />);

		await user.click(screen.getByRole("button"));

		await act(async () => {});

		expect(assignMock).toHaveBeenCalledWith(
			"https://checkout.stripe.com/pay/cs_test_123",
		);
	});
});
