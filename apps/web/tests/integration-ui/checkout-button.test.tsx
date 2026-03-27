import React from "react";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
	usePathname: () => usePathnameMock(),
	useRouter: () => ({
		push: pushMock,
	}),
}));

import { CheckoutButton } from "@/features/checkout/components/checkout-button";

describe("CheckoutButton interactions", () => {
	beforeEach(() => {
		pushMock.mockReset();
		usePathnameMock.mockReset();
		usePathnameMock.mockReturnValue("/");
		vi.restoreAllMocks();
	});

	it("routes signed-out visitors to sign-in after the checkout route returns 401", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(null, { status: 401 }));

		const user = userEvent.setup();
		render(<CheckoutButton label="Get instant access" />);

		await user.click(screen.getByRole("button"));

		expect(fetchMock).toHaveBeenCalledWith("/api/stripe/checkout", {
			method: "POST",
		});
		expect(pushMock).toHaveBeenCalledWith(
			"/sign-in?redirect_url=%2F%23pricing",
		);
	});

	it("routes back to sign-in when checkout returns 401", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({ error: "Sign in before starting checkout." }),
				{
					status: 401,
					headers: {
						"content-type": "application/json",
					},
				},
			),
		);

		const user = userEvent.setup();
		render(<CheckoutButton label="Get instant access" />);

		await user.click(screen.getByRole("button"));

		expect(pushMock).toHaveBeenCalledWith(
			"/sign-in?redirect_url=%2F%23pricing",
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
				JSON.stringify({ url: "https://checkout.stripe.com/pay/cs_test_123" }),
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
