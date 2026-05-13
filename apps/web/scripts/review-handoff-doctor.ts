import { routeConfig } from "../src/config/product";
import {
	getReviewAutoDownloadHref,
	REVIEW_ARTIFACT_LABEL,
	REVIEW_AUTO_DOWNLOAD_QUERY_PARAM,
	REVIEW_AUTO_DOWNLOAD_STATUS,
	REVIEW_DOWNLOAD_HREF,
	REVIEW_FALLBACK_LINK_LABEL_AUTO,
	REVIEW_FALLBACK_LINK_LABEL_PASSIVE,
	REVIEW_REDOWNLOAD_LINK_LABEL,
	REVIEW_SURFACE_LABEL,
	REVIEW_SURFACE_TITLE,
} from "../src/lib/codebase-flow/review-download-handoff";

type Check = {
	label: string;
	ok: boolean;
	detail: string;
};

const expectedReviewRoute = "/starter/generate-codebase/review";
const expectedAutoDownloadHref = `${expectedReviewRoute}?download=1`;

function check(label: string, ok: boolean, detail: string): Check {
	return { label, ok, detail };
}

function printCheck(result: Check) {
	const icon = result.ok ? "PASS" : "FAIL";
	const stream = result.ok ? console.log : console.error;
	stream(`${icon} ${result.label}: ${result.detail}`);
}

const checks = [
	check(
		"review surface label",
		REVIEW_SURFACE_LABEL === "Review",
		REVIEW_SURFACE_LABEL,
	),
	check(
		"review surface title",
		REVIEW_SURFACE_TITLE === "Review",
		REVIEW_SURFACE_TITLE,
	),
	check(
		"review route",
		routeConfig.review === expectedReviewRoute,
		routeConfig.review,
	),
	check(
		"auto-download route",
		getReviewAutoDownloadHref() === expectedAutoDownloadHref,
		getReviewAutoDownloadHref(),
	),
	check(
		"auto-download query param",
		REVIEW_AUTO_DOWNLOAD_QUERY_PARAM === "download",
		REVIEW_AUTO_DOWNLOAD_QUERY_PARAM,
	),
	check(
		"download href",
		REVIEW_DOWNLOAD_HREF === "/api/download/repo",
		REVIEW_DOWNLOAD_HREF,
	),
	check(
		"review artifact label",
		REVIEW_ARTIFACT_LABEL === "Ship by Sunday Codebase",
		REVIEW_ARTIFACT_LABEL,
	),
	check(
		"auto-download status copy",
		REVIEW_AUTO_DOWNLOAD_STATUS.length > 0,
		REVIEW_AUTO_DOWNLOAD_STATUS,
	),
	check(
		"fallback auto link label",
		REVIEW_FALLBACK_LINK_LABEL_AUTO.length > 0,
		REVIEW_FALLBACK_LINK_LABEL_AUTO,
	),
	check(
		"fallback passive link label",
		REVIEW_FALLBACK_LINK_LABEL_PASSIVE.length > 0,
		REVIEW_FALLBACK_LINK_LABEL_PASSIVE,
	),
	check(
		"re-download execute-track label",
		REVIEW_REDOWNLOAD_LINK_LABEL.length > 0,
		REVIEW_REDOWNLOAD_LINK_LABEL,
	),
];

console.log("Review handoff doctor");
console.log("");

for (const result of checks) {
	printCheck(result);
}

const hasFailure = checks.some((result) => !result.ok);
if (hasFailure) {
	console.error("");
	console.error(
		"Fix the failed review-handoff contract above before treating the /starter/generate-codebase -> /starter/generate-codebase/review flow as validated.",
	);
	process.exit(1);
}
