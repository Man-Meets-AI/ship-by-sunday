import { notFound, redirect } from "next/navigation";
import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { LessonPage } from "@/features/course/lesson/components/lesson-page";
import { getLesson } from "@/features/course/lesson/model";
import { getLegacyLessonRedirect } from "@/features/course/lesson/utils/legacy-routes";

export default async function Page({
	params,
}: {
	params: Promise<{ lessonId: string }>;
}) {
	await requireCourseAccess();
	const { lessonId } = await params;

	const legacyRedirect = getLegacyLessonRedirect(lessonId);
	if (legacyRedirect) {
		redirect(legacyRedirect);
	}
	const lesson = getLesson(lessonId);

	if (!lesson) {
		notFound();
	}

	return <LessonPage key={lessonId} lessonId={lessonId} />;
}
