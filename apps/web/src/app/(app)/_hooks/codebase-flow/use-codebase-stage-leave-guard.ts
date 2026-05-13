"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const PACKET_LEAVE_WARNING = "You have unsaved changes. Leave without saving?";

export function useCodebaseStageLeaveGuard({
	hasUnsavedChanges,
}: {
	hasUnsavedChanges: boolean;
}) {
	const router = useRouter();
	const [pendingHref, setPendingHref] = useState<string | null>(null);
	const hasHistorySentinelRef = useRef(false);
	const ignoreNextPopStateRef = useRef(false);
	const isNavigatingAwayRef = useRef(false);

	const navigateToHref = useCallback(
		(href: string) => {
			isNavigatingAwayRef.current = true;
			setPendingHref(null);
			if (hasHistorySentinelRef.current) {
				hasHistorySentinelRef.current = false;
				router.replace(href);
				return;
			}

			router.push(href);
		},
		[router],
	);

	const requestNavigation = useCallback(
		(href: string) => {
			if (!hasUnsavedChanges) {
				navigateToHref(href);
				return;
			}

			setPendingHref(href);
		},
		[hasUnsavedChanges, navigateToHref],
	);

	const handleLinkNavigation = useCallback(
		(event: { preventDefault: () => void }, href: string) => {
			if (!hasUnsavedChanges && !hasHistorySentinelRef.current) {
				return;
			}

			event.preventDefault();
			requestNavigation(href);
		},
		[hasUnsavedChanges, requestNavigation],
	);

	const stayOnPage = useCallback(() => {
		setPendingHref(null);
	}, []);

	const leaveWithoutSaving = useCallback(() => {
		if (!pendingHref) {
			stayOnPage();
			return;
		}

		navigateToHref(pendingHref);
	}, [navigateToHref, pendingHref, stayOnPage]);

	useEffect(() => {
		if (typeof window === "undefined" || !hasUnsavedChanges) {
			return;
		}

		if (!hasHistorySentinelRef.current) {
			window.history.pushState(
				{ codebaseStageLeaveGuard: true },
				"",
				window.location.href,
			);
			hasHistorySentinelRef.current = true;
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handlePopState = () => {
			if (!hasHistorySentinelRef.current) {
				return;
			}
			if (ignoreNextPopStateRef.current) {
				ignoreNextPopStateRef.current = false;
				return;
			}
			if (!hasUnsavedChanges) {
				ignoreNextPopStateRef.current = true;
				hasHistorySentinelRef.current = false;
				window.history.back();
				return;
			}
			if (window.confirm(PACKET_LEAVE_WARNING)) {
				ignoreNextPopStateRef.current = true;
				hasHistorySentinelRef.current = false;
				isNavigatingAwayRef.current = true;
				window.history.back();
				return;
			}

			window.history.pushState(
				{ codebaseStageLeaveGuard: true },
				"",
				window.location.href,
			);
			hasHistorySentinelRef.current = true;
		};

		window.addEventListener("popstate", handlePopState);
		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [hasUnsavedChanges]);

	useEffect(() => {
		if (
			typeof window === "undefined" ||
			hasUnsavedChanges ||
			!hasHistorySentinelRef.current ||
			isNavigatingAwayRef.current
		) {
			return;
		}

		ignoreNextPopStateRef.current = true;
		hasHistorySentinelRef.current = false;
		window.history.back();
	}, [hasUnsavedChanges]);

	return {
		handleLinkNavigation,
		isDialogOpen: pendingHref !== null,
		leaveWithoutSaving,
		navigateToHref,
		requestNavigation,
		stayOnPage,
	};
}
