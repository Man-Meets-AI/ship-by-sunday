import React from "react";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutButton } from "@/app/checkout/_components/checkout-button";

const capturePostHogProductEventMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (input: unknown) =>
		capturePostHogProductEventMock(input),
}));

describe("CheckoutButton interactions", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		capturePostHogProductEventMock.mockReset();
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
		render(<CheckoutButton offerId="starter" label="Get instant access" />);

		await user.click(screen.getByRole("button"));

		expect(fetchMock).toHaveBeenCalledWith("/api/stripe/checkout", {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({ offerId: "starter" }),
		});
		expect(capturePostHogProductEventMock).toHaveBeenCalledWith({
			event: "checkout_started",
			properties: {
				offer_id: "starter",
				surface: "checkout_button",
			},
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
		render(<CheckoutButton offerId="starter" label="Get instant access" />);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(
			await screen.findByText("Unable to start Stripe checkout."),
		).toBeTruthy();
		expect(button.getAttribute("disabled")).toBeNull();
		expect(button.getAttribute("aria-busy")).toBe("false");
	});

	it("recovers when the checkout request cannot reach Stripe", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(
			new Error("Network unavailable."),
		);

		const user = userEvent.setup();
		render(<CheckoutButton offerId="starter" label="Get instant access" />);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(await screen.findByText("Network unavailable.")).toBeTruthy();
		expect(button.getAttribute("disabled")).toBeNull();
		expect(button.getAttribute("aria-busy")).toBe("false");
	});

	it("recovers when Stripe checkout returns a malformed success payload", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(JSON.stringify({ sessionId: "cs_missing_url" }), {
				status: 200,
				headers: {
					"content-type": "application/json",
				},
			}),
		);

		const user = userEvent.setup();
		render(<CheckoutButton offerId="starter" label="Get instant access" />);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(
			await screen.findByText("Missing checkout redirect URL."),
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
		render(<CheckoutButton offerId="starter" label="Get instant access" />);

		await user.click(screen.getByRole("button"));

		await act(async () => {});

		expect(assignMock).toHaveBeenCalledWith(
			"https://checkout.stripe.com/pay/cs_test_123",
		);
	});

	it("runs onBeforeCheckout before starting the Stripe redirect", async () => {
		const assignMock = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: {
				assign: assignMock,
			},
		});
		const eventOrder: string[] = [];
		const onBeforeCheckout = vi.fn(async () => {
			eventOrder.push("before-checkout");
		});
		const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
			eventOrder.push("fetch");
			return Promise.resolve(
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
		});

		const user = userEvent.setup();
		render(
			<CheckoutButton
				offerId="starter"
				label="Get instant access"
				onBeforeCheckout={onBeforeCheckout}
			/>,
		);

		await user.click(screen.getByRole("button"));

		await act(async () => {});

		expect(onBeforeCheckout).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(eventOrder).toEqual(["before-checkout", "fetch"]);
		expect(assignMock).toHaveBeenCalledWith(
			"https://checkout.stripe.com/pay/cs_test_123",
		);
	});

	it("aborts the redirect and re-enables the button when onBeforeCheckout throws", async () => {
		const assignMock = vi.fn();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: {
				assign: assignMock,
			},
		});
		const fetchMock = vi.spyOn(globalThis, "fetch");
		const onBeforeCheckout = vi.fn(() => {
			throw new Error("Saving draft failed.");
		});

		const user = userEvent.setup();
		render(
			<CheckoutButton
				offerId="starter"
				label="Get instant access"
				onBeforeCheckout={onBeforeCheckout}
			/>,
		);

		const button = screen.getByRole("button");
		await user.click(button);

		expect(await screen.findByText("Saving draft failed.")).toBeTruthy();
		expect(fetchMock).not.toHaveBeenCalled();
		expect(assignMock).not.toHaveBeenCalled();
		expect(button.getAttribute("disabled")).toBeNull();
		expect(button.getAttribute("aria-busy")).toBe("false");
	});
});
