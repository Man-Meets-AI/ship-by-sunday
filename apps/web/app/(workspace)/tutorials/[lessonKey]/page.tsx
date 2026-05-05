import { notFound } from "next/navigation";

import { getLessonByRouteSegment } from "@/lib/course/lesson/model/manifest";

import { TutorialVideoPage } from "../_components/tutorial-video-page";

export default async function TutorialVideoRoute({
	params,
}: {
	params: Promise<{ lessonKey: string }>;
}) {
	const { lessonKey } = await params;
	const lesson = getLessonByRouteSegment(lessonKey);

	if (!lesson) {
		notFound();
	}

	return <TutorialVideoPage lesson={lesson} />;
}
