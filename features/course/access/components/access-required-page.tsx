"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

import { getSignInRedirectHref, routeConfig, timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { AccessRequiredContent } from "@/features/course/access/components/access-required-content";
import {
	formatRefreshTime,
	getAccessViewModel,
	getAccessViewState,
	type ViewerAccess,
} from "@/features/course/access/lib/access-required-view-model";
import { AppShell } from "@/features/course/shared/components/app-shell";

export function AccessRequiredPage() {
	const router = useRouter();
	const access = useQuery(api.course.viewerAccess) as ViewerAccess;
	const [isRetryingAccess, setIsRetryingAccess] = useState(false);
	const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
	const viewState = getAccessViewState(access);
	const viewModel = getAccessViewModel(viewState);
	const isCheckingAccess = viewState.kind === "loading";
	const isSignedOut = viewState.kind === "signed_out";
	const lastRefreshLabel = formatRefreshTime(lastRefreshAt);
	const signInHref = getSignInRedirectHref(routeConfig.accessRequired);

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace(routeConfig.mission);
		}
	}, [access, router]);

	useEffect(() => {
		if (!isRetryingAccess || isCheckingAccess) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setIsRetryingAccess(false);
		}, timingConfig.accessRetryResetMs);

		return () => window.clearTimeout(timeout);
	}, [isCheckingAccess, isRetryingAccess]);

	function handleRetryAccessCheck() {
		setIsRetryingAccess(true);
		setLastRefreshAt(Date.now());
		startTransition(() => {
			router.refresh();
		});
	}

	return (
		<AppShell
			title="Access Required"
			subtitle={viewModel.shellSubtitle}
			enableMissionQuery={false}
			showSkillRail={false}
		>
			<AccessRequiredContent
				viewModel={viewModel}
				isCheckingAccess={isCheckingAccess}
				isSignedOut={isSignedOut}
				signInHref={signInHref}
				homeHref={routeConfig.home}
				isRetryingAccess={isRetryingAccess}
				lastRefreshLabel={lastRefreshLabel}
				onRetryAccessCheck={handleRetryAccessCheck}
			/>
		</AppShell>
	);
}
