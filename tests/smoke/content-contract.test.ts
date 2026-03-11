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
});
