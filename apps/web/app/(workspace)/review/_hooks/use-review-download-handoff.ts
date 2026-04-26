"use client";

import { useEffect, useRef } from "react";
import {
	getReviewFallbackLinkLabel,
	REVIEW_AUTO_DOWNLOAD_QUERY_PARAM,
	REVIEW_AUTO_DOWNLOAD_STATUS,
	REVIEW_DOWNLOAD_HREF,
} from "@/features/blueprint-flow/lib/review-download-handoff";

function clearReviewAutoDownloadQueryParam() {
	if (typeof window === "undefined") {
		return;
	}

	const currentUrl = new URL(window.location.href);
	if (!currentUrl.searchParams.has(REVIEW_AUTO_DOWNLOAD_QUERY_PARAM)) {
		return;
	}

	currentUrl.searchParams.delete(REVIEW_AUTO_DOWNLOAD_QUERY_PARAM);
	const nextHref = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
	window.history.replaceState(window.history.state, "", nextHref);
}

export function useReviewDownloadHandoff({
	autoDownloadEnabled,
}: {
	autoDownloadEnabled: boolean;
}) {
	const hasAttemptedAutoDownloadRef = useRef(false);

	useEffect(() => {
		if (
			!autoDownloadEnabled ||
			hasAttemptedAutoDownloadRef.current ||
			typeof document === "undefined"
		) {
			return;
		}

		hasAttemptedAutoDownloadRef.current = true;
		const link = document.createElement("a");
		link.href = REVIEW_DOWNLOAD_HREF;
		link.download = "";
		link.style.display = "none";
		document.body.append(link);

		try {
			link.click();
		} finally {
			link.remove();
			clearReviewAutoDownloadQueryParam();
		}
	}, [autoDownloadEnabled]);

	return {
		autoDownloadStatus: autoDownloadEnabled
			? REVIEW_AUTO_DOWNLOAD_STATUS
			: null,
		downloadHref: REVIEW_DOWNLOAD_HREF,
		fallbackLinkLabel: getReviewFallbackLinkLabel(autoDownloadEnabled),
	};
}
