import { notFound, redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { LessonPage } from "@/features/course/lesson/components/lesson-page";
import { getLesson } from "@/features/course/lesson/model";
import { getLegacyLessonRedirect } from "@/features/course/lesson/utils/legacy-routes";
import { preloadAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page({
	params,
}: {
	params: Promise<{ lessonId: string }>;
}) {
	const { lessonId } = await params;

	const legacyRedirect = getLegacyLessonRedirect(lessonId);
	if (legacyRedirect) {
		redirect(legacyRedirect);
	}
	const lesson = getLesson(lessonId);

	if (!lesson) {
		notFound();
	}

	return (
		<LessonPage
			key={lessonId}
			lessonId={lessonId}
			preloadedMission={await preloadAuthenticatedQuery(
				api.course.getMissionState,
				{},
			)}
		/>
	);
}
