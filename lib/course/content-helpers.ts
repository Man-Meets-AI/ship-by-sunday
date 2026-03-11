import type {
	LessonCoachContent,
	LessonExampleContent,
	LessonResourceContent,
} from "./contracts";

type CoachArgs = {
	title: string;
	resources: LessonResourceContent[];
	examples?: LessonExampleContent[];
};

export function createPendingLessonCoach({
	title,
	resources,
	examples = [],
}: CoachArgs): LessonCoachContent {
	return {
		video: {
			status: "pending",
			title,
		},
		transcript: {
			status: "empty",
		},
		examples,
		resources,
	};
}
