import type { LessonConfig } from "../contracts";
import { createVideoLesson } from "../video-lesson-factory";

export const designLessons = [
	createVideoLesson({
		id: "2.0",
		slug: "02-00-design-references",
		order: 9,
		block: "DESIGN",
		title: "Design References",
		shortTitle: "References",
		prevLessonId: "1.9",
		nextLessonId: "2.1",
		intro:
			"Start the Design block with the live reference lesson from Bunny, then move straight into the core flow remap.",
		teachingPoints: [
			"Use this to frame how to collect design references.",
			"Do not stall in a giant moodboard loop.",
			"Keep moving into the next live design lesson.",
		],
	}),
	createVideoLesson({
		id: "2.1",
		slug: "02-01-map-the-core-flow",
		order: 10,
		block: "DESIGN",
		title: "Map the Core Flow",
		shortTitle: "Core Flow",
		prevLessonId: "2.0",
		nextLessonId: "2.2",
		intro:
			"Map the core flow inside Design so the visual sequence stays grounded in the real user journey before Build starts.",
		teachingPoints: [
			"Treat the core flow as a Design-block rep.",
			"Keep the flow simple enough to build and ship.",
			"Move into reference gathering with the flow already clear.",
		],
	}),
	createVideoLesson({
		id: "2.2",
		slug: "02-02-find-references-first",
		order: 11,
		block: "DESIGN",
		title: "Find References First",
		shortTitle: "Find References",
		prevLessonId: "2.1",
		nextLessonId: "3.0",
		unlockBlocks: ["BUILD"],
		intro:
			"Use the filmed references lesson as the final live Design step before the Build block starts.",
		teachingPoints: [
			"Pull the strongest patterns only.",
			"Stop once the direction is clear enough to build.",
			"Move directly into the Build kickoff after this lesson.",
		],
	}),
] satisfies LessonConfig[];
