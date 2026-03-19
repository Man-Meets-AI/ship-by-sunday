export type AppShellBlockStatus = "completed" | "active" | "ready" | "locked";

type BlockLike = {
	id: string;
	completedCount: number;
	totalLessons: number;
	lessons: Array<{ status: string }>;
};

export function isBlockActive(block: BlockLike) {
	return block.lessons.some(
		(lesson) =>
			lesson.status === "in_progress" || lesson.status === "available",
	);
}

export function getAppShellBlockStatus(
	block: BlockLike,
	activeId: string | undefined,
): AppShellBlockStatus {
	if (block.completedCount === block.totalLessons) {
		return "completed";
	}

	if (block.id === activeId) {
		return "active";
	}

	if (block.lessons.some((lesson) => lesson.status !== "locked")) {
		return "ready";
	}

	return "locked";
}
