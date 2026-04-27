import type { LessonSourceConfig } from "../contracts";
import { createVideoLesson } from "../video-lesson-factory";

export const shipLessons = [
	createVideoLesson({
		id: "4.0",
		slug: "04-00-product-review",
		order: 29,
		block: "SHIP",
		title: "Product Review",
		shortTitle: "Review",
		prevLessonId: "3.16",
		teachingPoints: [
			"Treat this as the live Ship-block bridge for now.",
			"Use the review to close the loop on what was built.",
			"The rest of Ship stays out of the student path until the real videos exist.",
		],
	}),
] satisfies LessonSourceConfig[];
