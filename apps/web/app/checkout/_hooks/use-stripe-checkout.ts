"use client";

import { useCallback, useState } from "react";

import { apiRouteConfig } from "@/app/api/_lib/api-route-config";
import { assert } from "@/lib/assert";
import { capturePostHogProductEvent } from "@/lib/observability/posthog-client";

export type StripeCheckoutOptions = {
	onBeforeCheckout?: () => void | Promise<void>;
};

export function useStripeCheckout(options: StripeCheckoutOptions = {}) {
	const { onBeforeCheckout } = options;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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

		setIsLoading(true);

		if (onBeforeCheckout) {
			try {
				await onBeforeCheckout();
			} catch (callbackError) {
				const message =
					callbackError instanceof Error
						? callbackError.message
						: "Unable to prepare checkout.";
				setError(message);
				setIsLoading(false);
				return;
			}
		}

		const response = await fetch(apiRouteConfig.stripeCheckout, {
			method: "POST",
		});

		if (!response.ok) {
			const data = (await response
				.json()
				.catch(() => ({ error: "Unable to start Stripe checkout." }))) as
				| { error: string }
				| { url?: never };

			assert("error" in data, "Missing checkout error message.");
			setError(data.error);
			setIsLoading(false);
			return;
		}

		const data = (await response.json()) as { sessionId: string; url: string };

		assert("url" in data, "Missing checkout redirect URL.");
		window.location.assign(data.url);
	}, [onBeforeCheckout]);

	return { startCheckout, isLoading, error, clearError };
}
