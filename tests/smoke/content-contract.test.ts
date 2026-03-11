import { lessonContentById } from "@/content/lessons";
import { lessonContentManifest } from "@/lib/course/content-manifest";
import { lessonRegistry } from "@/lib/course/manifest";

describe("lesson content contract", () => {
	it("keeps lesson content, slugs, and registry entries aligned", () => {
		for (const lesson of lessonRegistry) {
			if (lesson.id === "0.0") {
				continue;
			}

			const manifestEntry = lessonContentManifest.lessons[lesson.id];
			const content = lessonContentById.get(lesson.id);

			expect(
				manifestEntry,
				`missing manifest slug for ${lesson.id}`,
			).toBeTruthy();
			expect(content, `missing content for ${lesson.id}`).toBeTruthy();
			expect(content?.slug).toBe(manifestEntry?.slug);
		}
	});

	it("attaches section-level learner guidance for the redesigned CEO guided lessons", () => {
		const problemLesson = lessonContentById.get("1.1");
		const userLesson = lessonContentById.get("1.2");

		expect(problemLesson?.workbench.sections?.problem_1?.example).toContain(
			"Startup operators",
		);
		expect(userLesson?.workbench.sections?.reality_check?.instruction).toContain(
			"reach them this week",
		);
		expect(userLesson?.intro).toContain(
			"Pick one of the three problems you just wrote",
		);
	});
});
