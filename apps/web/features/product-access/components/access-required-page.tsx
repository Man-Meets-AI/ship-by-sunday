"use client";

import { useQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

import { routeConfig, timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { buildSignInHref } from "@/features/auth/sign-in/sign-in-route-utils";
import { AccessRequiredContent } from "@/features/product-access/components/access-required-content";
import {
	formatRefreshTime,
	getAccessViewModel,
	getAccessViewState,
} from "@/features/product-access/lib/access-required-view-model";
import type { ProductAccess } from "@/features/product-access/lib/product-access";

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

export function AccessRequiredPage({
	initialAccess,
}: {
	initialAccess?: ProductAccess;
}) {
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
	const access = liveAccess ?? initialAccess;
	const shouldRetryWorkspaceEntry =
		liveAccess?.hasAccess === true &&
		workspaceEntryRefreshAttemptCount < MAX_WORKSPACE_ENTRY_REFRESH_ATTEMPTS;
	const viewAccess =
		liveAccess?.hasAccess === true &&
		!shouldRetryWorkspaceEntry &&
		initialAccess
			? initialAccess
			: access;
	const viewState = getAccessViewState(viewAccess);
	const viewModel = getAccessViewModel({
		viewState,
		signInHref,
		homeHref: routeConfig.home,
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
			router.replace(signInHref);
		});
	}, [access?.status, router, signInHref]);

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
