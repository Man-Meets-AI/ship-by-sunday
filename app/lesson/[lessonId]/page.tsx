import { notFound, redirect } from "next/navigation";

import { LessonPage } from "@/features/course/lesson/components/lesson-page";
import { getLegacyLessonRedirect } from "@/features/course/lesson/utils/legacy-routes";
import { getLesson } from "@/features/course/lesson/model";
import { requireCourseAccess } from "@/features/course/access/server/course-access";
import { getInitialProductTheme } from "@/features/course/shared/server/product-theme";

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
