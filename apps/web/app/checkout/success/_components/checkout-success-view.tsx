"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { routeConfig, timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import type { CheckoutSessionState } from "@/features/checkout/server/checkout-session";
import type { ProductAccess } from "@/lib/product-access";

import { CheckoutSuccessSurface } from "./checkout-success-view-surface";
import {
	getCheckoutViewModel,
	validatedStatusCopy,
} from "../_lib/checkout-success-view-model";

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
			router.replace(routeConfig.blueprint);
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

export function CheckoutSuccessView({
	checkoutSessionState,
	initialProductAccess,
}: {
	checkoutSessionState: CheckoutSessionState;
	initialProductAccess?: ProductAccess | null;
}) {
	const { isAuthenticated } = useConvexAuth();
	const liveAccess = useQuery(
		api.access.viewerProductAccess,
		isAuthenticated ? {} : "skip",
	) as ProductAccess | undefined;
	const access = liveAccess ?? initialProductAccess ?? undefined;

	return (
		<CheckoutSuccessViewContent
			checkoutSessionState={checkoutSessionState}
			isAccessReady={Boolean(access?.hasAccess)}
		/>
	);
}
