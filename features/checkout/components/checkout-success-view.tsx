"use client";

import type { Preloaded } from "convex/react";
import { useConvexAuth, usePreloadedQuery, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { routeConfig, timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { CheckoutSessionState } from "@/features/checkout/server/checkout-session";

import { CheckoutSuccessSurface } from "./checkout-success-view-surface";
import {
	getCheckoutViewModel,
	validatedStatusCopy,
} from "./checkout-success-view-model";

function CheckoutSuccessViewContent({
	checkoutSessionState,
	isAccessReady,
}: {
	checkoutSessionState: CheckoutSessionState;
	isAccessReady: boolean;
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
		if (!canAutoRedirect) {
			return;
		}

		const timeout = window.setTimeout(() => {
			router.replace(routeConfig.mission);
		}, timingConfig.checkoutAutoRedirectMs);

		return () => window.clearTimeout(timeout);
	}, [canAutoRedirect, router]);

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
		/>
	);
}

function CheckoutSuccessViewLive({
	checkoutSessionState,
}: {
	checkoutSessionState: CheckoutSessionState;
}) {
	const { isAuthenticated } = useConvexAuth();
	const access = useQuery(
		api.access.viewerProductAccess,
		isAuthenticated ? {} : "skip",
	) as { hasAccess: boolean } | undefined;

	return (
		<CheckoutSuccessViewContent
			checkoutSessionState={checkoutSessionState}
			isAccessReady={Boolean(access?.hasAccess)}
		/>
	);
}

function CheckoutSuccessViewPreloaded({
	checkoutSessionState,
	preloadedProductAccess,
}: {
	checkoutSessionState: CheckoutSessionState;
	preloadedProductAccess: Preloaded<typeof api.access.viewerProductAccess>;
}) {
	const access = usePreloadedQuery(preloadedProductAccess) as { hasAccess: boolean };

	return (
		<CheckoutSuccessViewContent
			checkoutSessionState={checkoutSessionState}
			isAccessReady={Boolean(access.hasAccess)}
		/>
	);
}

export function CheckoutSuccessView({
	checkoutSessionState,
	preloadedProductAccess,
}: {
	checkoutSessionState: CheckoutSessionState;
	preloadedProductAccess?: Preloaded<typeof api.access.viewerProductAccess> | null;
}) {
	return preloadedProductAccess ? (
		<CheckoutSuccessViewPreloaded
			checkoutSessionState={checkoutSessionState}
			preloadedProductAccess={preloadedProductAccess}
		/>
	) : (
		<CheckoutSuccessViewLive checkoutSessionState={checkoutSessionState} />
	);
}
