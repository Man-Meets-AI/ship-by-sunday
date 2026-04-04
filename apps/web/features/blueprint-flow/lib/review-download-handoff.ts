import { routeConfig } from "@/config/product";

export const REVIEW_SURFACE_LABEL = "Review";
export const REVIEW_SURFACE_TITLE = "Review";
export const REVIEW_ARTIFACT_LABEL = "Ship by Sunday Blueprint";
export const REVIEW_AUTO_DOWNLOAD_STATUS =
	"Your blueprint download should already be starting. If the browser blocks it, use the link below.";
export const REVIEW_FALLBACK_LINK_LABEL_AUTO =
	"Download didn’t start? Click here.";
export const REVIEW_FALLBACK_LINK_LABEL_PASSIVE =
	"Need the Ship by Sunday Blueprint again? Download it here.";
export const REVIEW_REDOWNLOAD_LINK_LABEL = "Download Blueprint Again";
export const REVIEW_DOWNLOAD_HREF = "/api/download/repo";
export const REVIEW_AUTO_DOWNLOAD_QUERY_PARAM = "download";
const REVIEW_AUTO_DOWNLOAD_QUERY_VALUE = "1";

export function getReviewAutoDownloadHref() {
	const separator = routeConfig.review.includes("?") ? "&" : "?";
	return `${routeConfig.review}${separator}${REVIEW_AUTO_DOWNLOAD_QUERY_PARAM}=${REVIEW_AUTO_DOWNLOAD_QUERY_VALUE}`;
}

export function isReviewAutoDownloadEnabled(
	value: string | string[] | undefined,
) {
	return value === REVIEW_AUTO_DOWNLOAD_QUERY_VALUE;
}

export function getReviewFallbackLinkLabel(autoDownloadEnabled: boolean) {
	return autoDownloadEnabled
		? REVIEW_FALLBACK_LINK_LABEL_AUTO
		: REVIEW_FALLBACK_LINK_LABEL_PASSIVE;
}
