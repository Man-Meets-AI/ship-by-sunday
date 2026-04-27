import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { routeConfig } from "@/config/product";
import { getLessonByRouteSegment } from "@/features/course/lesson/model/manifest";
import { BonusLessonPage } from "@/app/(workspace)/_components/execute-ship/bonus-lesson-page";
import { BonusRouteStatePanel } from "@/app/(workspace)/_components/execute-ship/bonus-route-state-panel";
import { buildFallbackPostReviewTargets } from "@/lib/execute-ship/bonus-library-presentation";
import { loadBonusRouteAccess } from "@/app/(workspace)/lesson/[lessonKey]/_server/load-bonus-route-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ lessonKey: string }>;
	searchParams: Promise<{ showLessonMap?: string }>;
}) {
	const { lessonKey: routeSegment } = await params;
	const { showLessonMap } = await searchParams;
	const lesson = getLessonByRouteSegment(routeSegment);

	if (!lesson) {
		notFound();
	}

	const bonusRouteAccess = await loadBonusRouteAccess();

	if (!bonusRouteAccess.isUnlocked) {
		return (
			<BonusRouteStatePanel
				eyebrow="Bonus lesson"
				title="Bonus lessons unlock after Review."
				description="The restored continuation lessons stay locked until you reach Review and unlock the post-review bonus."
				actionHref={routeConfig.review}
				actionLabel="Go to Review"
				detail={`"${lesson.displayLabel} ${lesson.title}" will open after the bonus unlock is active.`}
			/>
		);
	}

	const missionState = await fetchAuthenticatedQuery(
		api.course.getBonusMissionState,
		{},
	);
	const resumeDestination = await fetchAuthenticatedQuery(
		api.blueprint.getBlueprintResumeDestination,
		{},
	);

	if (!missionState) {
		throw new Error("Bonus mission state missing");
	}

	return (
		<BonusLessonPage
			initialStageStatuses={bonusRouteAccess.workspaceState.stageStatuses}
			lessonKey={lesson.lessonKey}
			missionState={missionState}
			postReviewTargets={
				resumeDestination?.postReviewTargets ??
				buildFallbackPostReviewTargets(missionState)
			}
			initialShowLessonMap={showLessonMap === "1"}
		/>
	);
}
