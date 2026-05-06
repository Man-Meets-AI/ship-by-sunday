import React, { useEffect, useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const checkoutConfirmMock = vi.hoisted(() => vi.fn());
const checkoutElementsResultMock = vi.hoisted(() => vi.fn());
const loadStripeMock = vi.hoisted(() => vi.fn());
const capturePostHogProductEventMock = vi.hoisted(() => vi.fn());

vi.mock("@stripe/stripe-js", () => ({
	loadStripe: (publishableKey: string) => loadStripeMock(publishableKey),
}));

vi.mock("@stripe/react-stripe-js/checkout", () => ({
	CheckoutElementsProvider: ({
		children,
	}: {
		readonly children: React.ReactNode;
	}) => <div data-testid="checkout-elements-provider">{children}</div>,
	ExpressCheckoutElement: ({
		onConfirm,
		onReady,
	}: {
		readonly onConfirm: (event: {
			readonly expressPaymentType: "link";
		}) => void;
		readonly onReady?: (event: {
			readonly availablePaymentMethods: Record<string, boolean>;
		}) => void;
	}) => {
		useEffect(() => {
			onReady?.({ availablePaymentMethods: { link: true } });
		}, [onReady]);

		return (
			<button
				type="button"
				data-testid="express-checkout-link"
				onClick={() => onConfirm({ expressPaymentType: "link" })}
			>
				Pay with Link
			</button>
		);
	},
	useCheckoutElements: () => checkoutElementsResultMock(),
}));

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (input: unknown) =>
		capturePostHogProductEventMock(input),
}));

import { ExpressCheckoutButton } from "@/app/checkout/_components/express-checkout-button";

function createExpressCheckoutResponse(sessionId: string) {
	return new Response(
		JSON.stringify({
			clientSecret: `${sessionId}_secret`,
			publishableKey: "pk_live_publishable",
			returnUrl: `https://app.example.com/checkout/success?session_id=${sessionId}`,
			sessionId,
		}),
		{
			status: 200,
			headers: {
				"content-type": "application/json",
			},
		},
	);
}

describe("ExpressCheckoutButton", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		checkoutConfirmMock.mockReset();
		checkoutConfirmMock.mockResolvedValue({ type: "success" });
		checkoutElementsResultMock.mockReset();
		checkoutElementsResultMock.mockReturnValue({
			type: "success",
			checkout: {
				total: {
					total: {
						amount: "US$250.00",
					},
				},
				confirm: checkoutConfirmMock,
			},
		});
		capturePostHogProductEventMock.mockReset();
		loadStripeMock.mockReset();
		loadStripeMock.mockResolvedValue({ id: "stripe" });
	});

	it("does not render the Link button until Stripe checkout actions are ready", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			createExpressCheckoutResponse("cs_express_loading"),
		);
		checkoutElementsResultMock.mockReturnValue({ type: "loading" });

		render(
			<ExpressCheckoutButton
				checkoutIntent={{
					buyerStartingPoint: "no_codebase",
					checkoutCtaId: "codebase_demo_generated",
				}}
			/>,
		);

		await screen.findByTestId("checkout-elements-provider");

		expect(screen.queryByTestId("express-checkout-link")).toBeNull();
		expect(checkoutConfirmMock).not.toHaveBeenCalled();
	});

	it("does not recreate the Checkout Session when an inline checkout intent re-renders with the same values", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(createExpressCheckoutResponse("cs_express_123"));
		const { rerender } = render(
			<ExpressCheckoutButton
				checkoutIntent={{
					buyerStartingPoint: "no_codebase",
					checkoutCtaId: "codebase_demo_generated",
				}}
			/>,
		);

		await screen.findByTestId("express-checkout-link");
		expect(screen.getByText("Total US$250.00")).toBeTruthy();

		rerender(
			<ExpressCheckoutButton
				checkoutIntent={{
					buyerStartingPoint: "no_codebase",
					checkoutCtaId: "codebase_demo_generated",
				}}
			/>,
		);

		await act(async () => {});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith("/api/stripe/checkout/express", {
			body: JSON.stringify({
				checkoutIntent: {
					buyerStartingPoint: "no_codebase",
					checkoutCtaId: "codebase_demo_generated",
					fulfillmentTrack: "generated_codebase",
				},
			}),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		});
	});

	it("keeps the same Checkout Session alive when draft persistence re-renders during Link confirmation", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(createExpressCheckoutResponse("cs_express_123"));
		const user = userEvent.setup();

		function ExpressCheckoutWithDraftSave() {
			const [savedAt, setSavedAt] = useState<number | null>(null);
			return (
				<div data-saved-at={savedAt}>
					<ExpressCheckoutButton
						checkoutIntent={{
							buyerStartingPoint: "no_codebase",
							checkoutCtaId: "codebase_demo_generated",
						}}
						onBeforeCheckout={() => {
							setSavedAt(Date.now());
						}}
					/>
				</div>
			);
		}

		render(<ExpressCheckoutWithDraftSave />);

		await user.click(await screen.findByTestId("express-checkout-link"));

		await waitFor(() => expect(checkoutConfirmMock).toHaveBeenCalledTimes(1));
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(checkoutConfirmMock).toHaveBeenCalledWith({
			expressCheckoutConfirmEvent: { expressPaymentType: "link" },
			returnUrl:
				"https://app.example.com/checkout/success?session_id=cs_express_123",
		});
		expect(capturePostHogProductEventMock).toHaveBeenCalledWith({
			event: "checkout_started",
			properties: {
				surface: "express_checkout",
				buyerStartingPoint: "no_codebase",
				checkoutCtaId: "codebase_demo_generated",
				fulfillmentTrack: "generated_codebase",
			},
		});
	});
});
