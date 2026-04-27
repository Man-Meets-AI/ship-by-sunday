"use client";

import type { PostReviewNavigationTargets } from "@/lib/workspace-navigation/post-review-destination";

import { useReviewDownloadHandoff } from "../_hooks/use-review-download-handoff";
import { BlueprintReviewHandoffCard } from "./blueprint-review-handoff-card";

export function BlueprintReviewDownloadBridge({
	buildLessonsFallbackHref,
	autoDownloadEnabled,
	postReviewTargets,
}: {
	buildLessonsFallbackHref: string;
	autoDownloadEnabled: boolean;
	postReviewTargets: PostReviewNavigationTargets | null;
}) {
	const { autoDownloadStatus, downloadHref, fallbackLinkLabel } =
		useReviewDownloadHandoff({
			autoDownloadEnabled,
		});

	return (
		<BlueprintReviewHandoffCard
			autoDownloadStatus={autoDownloadStatus}
			buildLessonsHref={
				postReviewTargets?.buildLessonsDestination ?? buildLessonsFallbackHref
			}
			downloadHref={downloadHref}
			fallbackLinkLabel={fallbackLinkLabel}
		/>
	);
}
