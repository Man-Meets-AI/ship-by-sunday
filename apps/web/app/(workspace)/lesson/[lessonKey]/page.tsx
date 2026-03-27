import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import { routeConfig } from "@/config/product";
import { getLessonByRouteSegment } from "@/features/course/lesson/model/manifest";
import { BonusLessonPage } from "@/features/execute-ship/components/bonus-lesson-page";
import { BonusRouteStatePanel } from "@/features/execute-ship/components/bonus-route-state-panel";
import { loadBonusRouteAccess } from "@/features/execute-ship/server/load-bonus-route-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	params,
}: {
	params: Promise<{ lessonKey: string }>;
}) {
	const { lessonKey: routeSegment } = await params;
	const lesson = getLessonByRouteSegment(routeSegment);

	if (!lesson) {
		notFound();
	}

	const bonusRouteAccess = await loadBonusRouteAccess();

	if (!bonusRouteAccess.isUnlocked) {
		return (
			<BonusRouteStatePanel
				eyebrow="Bonus lesson"
				title="Bonus lessons unlock after Review & Download."
				description="The restored continuation lessons stay locked until you reach Review & Download and unlock the post-review bonus."
				actionHref={routeConfig.review}
				actionLabel="Go to Review & Download"
				detail={`"${lesson.displayLabel} ${lesson.title}" will open after the bonus unlock is active.`}
			/>
		);
	}

	const missionState = await fetchAuthenticatedQuery(
		api.course.getBonusMissionState,
		{},
	);

	if (!missionState) {
		throw new Error("Bonus mission state missing");
	}

	return (
		<BonusLessonPage lessonKey={lesson.lessonKey} missionState={missionState} />
	);
}
