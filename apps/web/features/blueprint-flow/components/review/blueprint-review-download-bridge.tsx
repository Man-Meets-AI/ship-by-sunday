"use client";

import { useReviewDownloadHandoff } from "@/features/blueprint-flow/hooks/use-review-download-handoff";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
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
