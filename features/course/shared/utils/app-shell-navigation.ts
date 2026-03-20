import { getLessonHref } from "@/features/course/lesson/model/manifest";

export type AppShellBlockLesson = {
	lessonKey: string;
	displayLabel: string;
	status: "available" | "completed" | "in_progress" | "locked";
};

export type AppShellBlock = {
	id: string;
	lessons: AppShellBlockLesson[];
};

export type AppShellBlockNavigationTarget = {
	blockId: string;
	lessonKey: string;
	displayLabel: string;
	href: string;
	status: Exclude<AppShellBlockLesson["status"], "locked">;
};

function isUnlockedLesson(
	lesson: AppShellBlockLesson | undefined,
): lesson is AppShellBlockLesson & {
	status: Exclude<AppShellBlockLesson["status"], "locked">;
} {
	return Boolean(lesson && lesson.status !== "locked");
}

export function getAppShellBlockNavigationTarget(
	block: AppShellBlock,
): AppShellBlockNavigationTarget | null {
	const preferredLesson = block.lessons.find(
		(lesson) =>
			lesson.status === "in_progress" || lesson.status === "available",
	);
	const fallbackLesson = block.lessons.find(
		(lesson) => lesson.status !== "locked",
	);
	const targetLesson = preferredLesson ?? fallbackLesson;

	if (!isUnlockedLesson(targetLesson)) {
		return null;
	}

	return {
		blockId: block.id,
		lessonKey: targetLesson.lessonKey,
		displayLabel: targetLesson.displayLabel,
		href: getLessonHref(targetLesson.lessonKey),
		status: targetLesson.status,
	};
}
