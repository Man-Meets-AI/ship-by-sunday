"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
	apiRouteConfig,
	getSignInRedirectHref,
	routeConfig,
} from "@/config/product";
import { assert } from "@/features/course/lesson/lib/assert";

export function useStripeCheckout() {
	const { userId } = useAuth();
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

		if (!userId) {
			router.push(signInHref);
			return;
		}

		setIsLoading(true);
		const response = await fetch(apiRouteConfig.stripeCheckout, {
			method: "POST",
		});

		if (response.status === 401) {
			router.push(signInHref);
			return;
		}

		const data = (await response.json()) as { url: string } | { error: string };

		if (!response.ok) {
			assert("error" in data, "Missing checkout error message.");
			setError(data.error);
			setIsLoading(false);
			return;
		}

		assert("url" in data, "Missing checkout redirect URL.");
		window.location.assign(data.url);
	}, [router, signInHref, userId]);

	return { startCheckout, isLoading, error, clearError };
}
