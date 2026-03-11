import { notFound, redirect } from "next/navigation";

import { getLessonContent } from "@/content/lessons";
import { LessonPage } from "@/components/lesson-page";
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
	if (lessonId === "0.0") {
		redirect("/mission");
	}
	const lessonContent = getLessonContent(lessonId);

	if (!lessonContent) {
		notFound();
	}

	return (
		<LessonPage
			key={lessonId}
			initialTheme={initialTheme}
			lessonId={lessonId}
			lessonContent={lessonContent}
		/>
	);
}
