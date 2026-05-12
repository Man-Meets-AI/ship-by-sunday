import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { routeConfig } from "@/config/product";
import { getLessonByRouteSegment } from "@/lib/course/lesson/model/manifest";
import { BonusLessonPage } from "@/app/(workspace)/_components/execute-ship/bonus-lesson-page";
import { BonusRouteStatePanel } from "@/app/(workspace)/_components/execute-ship/bonus-route-state-panel";
import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
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
	const [{ lessonKey: routeSegment }, { showLessonMap }] = await Promise.all([
		params,
		searchParams,
	]);
	const lesson = getLessonByRouteSegment(routeSegment);

	if (!lesson) {
		notFound();
	}

	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
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

	const [missionState, resumeDestination] = await Promise.all([
		fetchAuthenticatedQuery(api.course.getBonusMissionState, {}),
		fetchAuthenticatedQuery(api.codebase.getCodebaseResumeDestination, {}),
	]);

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
