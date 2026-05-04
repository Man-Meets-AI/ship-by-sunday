"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { routeConfig, timingConfig } from "@/config/product";
import type { CheckoutSessionState } from "@/platform/billing/checkout/checkout-session";

import { CheckoutSuccessSurface } from "./checkout-success-view-surface";
import {
	getCheckoutViewModel,
	validatedStatusCopy,
} from "../_lib/checkout-success-view-model";

export function CheckoutSuccessViewContent({
	checkoutSessionState,
	isAccessReady,
	suppressRedirect,
	fixtureSlug,
}: {
	checkoutSessionState: CheckoutSessionState;
	isAccessReady: boolean;
	suppressRedirect: boolean;
	fixtureSlug?: string;
}) {
	const router = useRouter();
	const [statusIndex, setStatusIndex] = useState(0);
	const canAutoRedirect =
		checkoutSessionState.kind === "validated" && isAccessReady;
	const viewModel = getCheckoutViewModel(
		checkoutSessionState,
		isAccessReady,
		validatedStatusCopy[statusIndex],
	);

	useEffect(() => {
		if (!canAutoRedirect || suppressRedirect) {
			return;
		}

		const timeout = window.setTimeout(() => {
			router.replace(routeConfig.codebase);
		}, timingConfig.checkoutAutoRedirectMs);

		return () => window.clearTimeout(timeout);
	}, [canAutoRedirect, router, suppressRedirect]);

	useEffect(() => {
		if (checkoutSessionState.kind !== "validated" || isAccessReady) {
			return;
		}

		const interval = window.setInterval(() => {
			setStatusIndex((current) => (current + 1) % validatedStatusCopy.length);
		}, timingConfig.checkoutStatusRotateMs);

		return () => window.clearInterval(interval);
	}, [checkoutSessionState.kind, isAccessReady]);

	return (
		<CheckoutSuccessSurface
			viewModel={viewModel}
			canAutoRedirect={canAutoRedirect}
			fixtureSlug={fixtureSlug}
		/>
	);
}
