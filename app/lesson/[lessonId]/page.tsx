"use client";

import { useParams } from "next/navigation";

import { LessonPage } from "@/components/lesson-page";

export default function Page() {
	const params = useParams<{ lessonId: string }>();

	return <LessonPage lessonId={params.lessonId} />;
}
