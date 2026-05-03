"use client";

import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

import { routeConfig, timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	buildCheckoutEmailHandoffHref,
	buildSignInHref,
} from "@/platform/auth/auth-route-utils";
import type { ProductAccess } from "@/lib/product-access";
import {
	formatRefreshTime,
	getAccessViewModel,
	getAccessViewState,
} from "../_lib/access-required-view-model";

const MAX_WORKSPACE_ENTRY_REFRESH_ATTEMPTS = 5;

function getCurrentPath(
	pathname: string,
	searchParams: ReturnType<typeof useSearchParams>,
) {
	const query = searchParams.toString();
	if (!query) {
		return pathname;
	}

	return `${pathname}?${query}`;
}

export function useAccessRequiredController(initialAccess?: ProductAccess) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const hasRedirectedSignedOutRef = useRef(false);
	const liveAccess = useQuery(api.access.viewerProductAccess) as
		| ProductAccess
		| undefined;
	const [
		workspaceEntryRefreshAttemptCount,
		setWorkspaceEntryRefreshAttemptCount,
	] = useState(0);
	const [isRetryingAccess, setIsRetryingAccess] = useState(false);
	const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
	const currentPath = getCurrentPath(pathname, searchParams);
	const signInHref = buildSignInHref({ redirectPath: currentPath });
	const checkoutEmailHandoffRecovery =
		initialAccess?.pendingCheckoutRecovery?.kind ===
		"checkout_email_handoff_required"
			? initialAccess.pendingCheckoutRecovery
			: null;
	const checkoutEmailHandoffHref = checkoutEmailHandoffRecovery
		? buildCheckoutEmailHandoffHref({
				redirectPath: currentPath,
				sessionId: checkoutEmailHandoffRecovery.sessionId,
			})
		: null;
	const pricingHref = `${routeConfig.home}${routeConfig.pricingHash}`;
	const access =
		liveAccess &&
		!liveAccess.hasAccess &&
		initialAccess?.pendingCheckoutRecovery
			? {
					...liveAccess,
					pendingCheckoutRecovery: initialAccess.pendingCheckoutRecovery,
				}
			: (liveAccess ?? initialAccess);
	const shouldRetryWorkspaceEntry =
		liveAccess?.hasAccess === true &&
		workspaceEntryRefreshAttemptCount < MAX_WORKSPACE_ENTRY_REFRESH_ATTEMPTS;
	const displayAccess =
		liveAccess?.hasAccess === true &&
		!shouldRetryWorkspaceEntry &&
		initialAccess
			? initialAccess
			: access;
	const viewState = getAccessViewState(displayAccess);
	const viewModel = getAccessViewModel({
		viewState,
		signInHref,
		homeHref: routeConfig.home,
		pricingHref,
		checkoutEmailHandoffHref,
	});
	const lastRefreshLabel = formatRefreshTime(lastRefreshAt);

	useEffect(() => {
		if (liveAccess?.hasAccess !== true) {
			setWorkspaceEntryRefreshAttemptCount(0);
			return;
		}

		if (!shouldRetryWorkspaceEntry) {
			return;
		}

		if (workspaceEntryRefreshAttemptCount === 0) {
			setWorkspaceEntryRefreshAttemptCount(1);
			startTransition(() => {
				router.refresh();
			});
			return;
		}

		const timeout = window.setTimeout(() => {
			setWorkspaceEntryRefreshAttemptCount((currentCount) => currentCount + 1);
			startTransition(() => {
				router.refresh();
			});
		}, timingConfig.accessRetryResetMs);

		return () => window.clearTimeout(timeout);
	}, [
		liveAccess?.hasAccess,
		router,
		shouldRetryWorkspaceEntry,
		workspaceEntryRefreshAttemptCount,
	]);

	useEffect(() => {
		if (access?.status === "signed_out") {
			return;
		}

		hasRedirectedSignedOutRef.current = false;
	}, [access?.status]);

	useEffect(() => {
		if (access?.status !== "signed_out" || hasRedirectedSignedOutRef.current) {
			return;
		}

		hasRedirectedSignedOutRef.current = true;
		startTransition(() => {
			router.replace(checkoutEmailHandoffHref ?? signInHref);
		});
	}, [access?.status, checkoutEmailHandoffHref, router, signInHref]);

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

	return {
		isRetryingAccess,
		lastRefreshLabel,
		onRetryAccessCheck: handleRetryAccessCheck,
		viewModel,
	};
}
