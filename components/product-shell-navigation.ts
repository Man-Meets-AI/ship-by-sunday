import { getLessonHref } from "@/lib/course/manifest";

type ProductShellBlockLesson = {
	id: string;
	status: "available" | "completed" | "in_progress" | "locked";
};

type ProductShellBlock = {
	id: string;
	lessons: ProductShellBlockLesson[];
};

export type ProductShellBlockNavigationTarget = {
	blockId: string;
	lessonId: string;
	href: string;
	status: Exclude<ProductShellBlockLesson["status"], "locked">;
};

function isUnlockedLesson(
	lesson: ProductShellBlockLesson | undefined,
): lesson is ProductShellBlockLesson & {
	status: Exclude<ProductShellBlockLesson["status"], "locked">;
} {
	return Boolean(lesson && lesson.status !== "locked");
}

export function getProductShellBlockNavigationTarget(
	block: ProductShellBlock,
): ProductShellBlockNavigationTarget | null {
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
		lessonId: targetLesson.id,
		href: getLessonHref(targetLesson.id),
		status: targetLesson.status,
	};
}
