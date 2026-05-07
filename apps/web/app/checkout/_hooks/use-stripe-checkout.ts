"use client";

import { useCallback, useState } from "react";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { assert } from "@/lib/assert";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";

export type StripeCheckoutPhase = "idle" | "saving" | "redirecting";

export type StripeCheckoutOptions = {
	onBeforeCheckout?: () => void | Promise<void>;
};

export function useStripeCheckout(options: StripeCheckoutOptions = {}) {
	const { onBeforeCheckout } = options;
	const [phase, setPhase] = useState<StripeCheckoutPhase>("idle");
	const [error, setError] = useState<string | null>(null);

	const isLoading = phase !== "idle";

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const startCheckout = useCallback(async () => {
		setError(null);
		capturePostHogProductEvent({
			event: "checkout_started",
			properties: {
				surface: "checkout_button",
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
	}, [onBeforeCheckout]);

	return { startCheckout, phase, isLoading, error, clearError };
}
