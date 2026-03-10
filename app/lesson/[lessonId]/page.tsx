import { notFound } from "next/navigation";

import { getLessonContent } from "@/content/lessons";
import { LessonPage } from "@/components/lesson-page";

export default async function Page({
	params,
}: {
	params: Promise<{ lessonId: string }>;
}) {
	const { lessonId } = await params;
	const lessonContent = getLessonContent(lessonId);

	if (!lessonContent) {
		notFound();
	}

	return <LessonPage lessonId={lessonId} lessonContent={lessonContent} />;
}
