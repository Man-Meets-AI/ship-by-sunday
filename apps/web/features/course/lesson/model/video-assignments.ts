// Lesson ids are canonical. This sparse map only records cases where the Bunny
// asset id differs from the lesson id.
export const lessonVideoAssignments: Partial<Record<string, string>> = {
	"1.1": "0.1",
	"1.2": "0.2",
	"1.3": "1.2",
	"1.4": "1.3",
	"1.5": "1.3",
	"1.6": "1.4",
	"1.7": "1.5",
	"1.8": "1.6",
	"1.9": "1.7",
};

export function resolveLessonVideoAssetId(lessonId: string): string {
	return lessonVideoAssignments[lessonId] ?? lessonId;
}
