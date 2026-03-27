"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
	apiRouteConfig,
	getSignInRedirectHref,
	routeConfig,
} from "@/config/product";
import { assert } from "@/features/course/lesson/lib/assert";

export function useStripeCheckout() {
	const pathname = usePathname();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const signInHref = getSignInRedirectHref(
		`${pathname}${routeConfig.pricingHash}`,
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	const startCheckout = useCallback(async () => {
		setError(null);

		setIsLoading(true);
		const response = await fetch(apiRouteConfig.stripeCheckout, {
			method: "POST",
		});

		if (response.status === 401) {
			router.push(signInHref);
			setIsLoading(false);
			return;
		}

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

		const data = (await response.json()) as { url: string };

		assert("url" in data, "Missing checkout redirect URL.");
		window.location.assign(data.url);
	}, [router, signInHref]);

	return { startCheckout, isLoading, error, clearError };
}
