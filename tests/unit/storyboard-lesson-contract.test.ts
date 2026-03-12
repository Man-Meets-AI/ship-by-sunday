import { getLessonById, getUnlockedLessonIds } from "@/lib/course";

describe("storyboard lesson contract", () => {
	it("keeps lesson 2.3 as the required gate into Figma", () => {
		expect(getUnlockedLessonIds(["1.7", "2.1", "2.2"])).toContain("2.3");
		expect(getUnlockedLessonIds(["1.7", "2.1", "2.2"])).not.toContain("2.4");
		expect(getUnlockedLessonIds(["1.7", "2.1", "2.2", "2.3"])).toContain(
			"2.4",
		);
	});

	it("keeps the downstream storyboard artifact dependency stable", () => {
		const figmaLesson = getLessonById("2.4");
		expect(figmaLesson).toBeTruthy();
		expect(figmaLesson?.artifact.dependsOn).toEqual(["storyboard_image"]);
	});
});
