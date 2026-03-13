import { notFound, redirect } from "next/navigation";

import { LessonPage } from "@/components/lesson-page";
import { getLegacyLessonRedirect } from "@/legacy/lesson-routes";
import { getLesson } from "@/lib/course";
import { requireCourseAccess } from "@/lib/server/course-access";
import { getInitialProductTheme } from "@/lib/server/product-theme";

export default async function Page({
	params,
}: {
	params: Promise<{ lessonId: string }>;
}) {
	await requireCourseAccess();
	const initialTheme = await getInitialProductTheme();
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
			initialTheme={initialTheme}
			lessonId={lessonId}
		/>
	);
}
