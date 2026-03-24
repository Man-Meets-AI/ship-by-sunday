import { notFound, redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { LessonPage } from "@/features/course/lesson/components/lesson-page";
import { getLessonByRouteSegment } from "@/features/course/lesson/model";
import { getLegacyLessonRedirect } from "@/features/course/lesson/utils/legacy-routes";
import { CourseModuleDisabledState } from "@/features/starter/components/course-module-disabled-state";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	params,
}: {
	params: Promise<{ lessonKey: string }>;
}) {
	const { lessonKey } = await params;

	if (!isStarterModuleEnabled("course")) {
		return <CourseModuleDisabledState />;
	}

	const legacyRedirect = getLegacyLessonRedirect(lessonKey);
	if (legacyRedirect) {
		redirect(legacyRedirect);
	}
	const lesson = getLessonByRouteSegment(lessonKey);

	if (!lesson) {
		notFound();
	}

	return (
		<LessonPage
			key={lesson.lessonKey}
			lessonKey={lesson.lessonKey}
			initialMission={await fetchAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
