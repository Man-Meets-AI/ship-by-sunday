"use client";

import { useCallback, useState } from "react";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { assert } from "@/lib/assert";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";
import {
	UNSPECIFIED_CHECKOUT_INTENT,
	normalizeCheckoutIntent,
	type CheckoutIntent,
	type CheckoutIntentInput,
} from "@/platform/billing/checkout/checkout-intent";

export type StripeCheckoutPhase = "idle" | "saving" | "redirecting";

export type StripeCheckoutOptions = {
	checkoutIntent?: CheckoutIntentInput;
	onBeforeCheckout?: () => void | Promise<void>;
};

export function useStripeCheckout(options: StripeCheckoutOptions = {}) {
	const { checkoutIntent: checkoutIntentInput, onBeforeCheckout } = options;
	const [phase, setPhase] = useState<StripeCheckoutPhase>("idle");
	const [error, setError] = useState<string | null>(null);

	const isLoading = phase !== "idle";

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const startCheckout = useCallback(async () => {
		const checkoutIntent: CheckoutIntent = checkoutIntentInput
			? normalizeCheckoutIntent(checkoutIntentInput)
			: UNSPECIFIED_CHECKOUT_INTENT;
		setError(null);
		capturePostHogProductEvent({
			event: "checkout_started",
			properties: {
				surface: "checkout_button",
				...checkoutIntent,
			},
		});

		setPhase(onBeforeCheckout ? "saving" : "redirecting");

		if (onBeforeCheckout) {
			try {
				await onBeforeCheckout();
			} catch (callbackError) {
				const message =
					callbackError instanceof Error
						? callbackError.message
						: "Unable to prepare checkout.";
				setError(message);
				setPhase("idle");
				return;
			}
			setPhase("redirecting");
		}

		try {
			const response = await fetch(apiRouteConfig.stripeCheckout, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					checkoutIntent,
				}),
			});

			if (!response.ok) {
				const data = (await response
					.json()
					.catch(() => ({ error: "Unable to start Stripe checkout." }))) as
					| { error: string }
					| { url?: never };

				assert("error" in data, "Missing checkout error message.");
				setError(data.error);
				setPhase("idle");
				return;
			}

			const data = (await response.json()) as {
				sessionId: string;
				url: string;
			};

			assert("url" in data, "Missing checkout redirect URL.");
			window.location.assign(data.url);
		} catch (checkoutError) {
			setError(
				checkoutError instanceof Error
					? checkoutError.message
					: "Unable to start Stripe checkout.",
			);
			setPhase("idle");
		}
	}, [checkoutIntentInput, onBeforeCheckout]);

	return { startCheckout, phase, isLoading, error, clearError };
}
