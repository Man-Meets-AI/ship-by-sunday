"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import {
	getSignInRedirectHref,
	routeConfig,
	timingConfig,
} from "@/config/product";
import { api } from "@/convex/_generated/api";
import { AccessRequiredContent } from "@/features/product-access/components/access-required-content";
import {
	formatRefreshTime,
	getAccessViewModel,
	getAccessViewState,
} from "@/features/product-access/lib/access-required-view-model";
import type { ProductAccess } from "@/features/product-access/lib/product-access";

export function AccessRequiredPage() {
	const router = useRouter();
	const access = useQuery(api.access.viewerProductAccess) as
		| ProductAccess
		| undefined;
	const [isRetryingAccess, setIsRetryingAccess] = useState(false);
	const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
	const signInHref = getSignInRedirectHref(routeConfig.accessRequired);
	const viewState = getAccessViewState(access);
	const viewModel = getAccessViewModel({
		viewState,
		signInHref,
		homeHref: routeConfig.home,
	});
	const lastRefreshLabel = formatRefreshTime(lastRefreshAt);

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace(routeConfig.mission);
		}
	}, [access, router]);

	useEffect(() => {
		if (!isRetryingAccess) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setIsRetryingAccess(false);
		}, timingConfig.accessRetryResetMs);

		return () => window.clearTimeout(timeout);
	}, [isRetryingAccess]);

	function handleRetryAccessCheck() {
		setIsRetryingAccess(true);
		setLastRefreshAt(Date.now());
		startTransition(() => {
			router.refresh();
		});
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6">
				<AccessRequiredContent
					viewModel={viewModel}
					isRetryingAccess={isRetryingAccess}
					lastRefreshLabel={lastRefreshLabel}
					onRetryAccessCheck={handleRetryAccessCheck}
				/>
			</div>
		</main>
	);
}
