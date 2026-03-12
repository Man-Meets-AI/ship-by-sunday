import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string) {
	return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("watch lesson shell contract", () => {
	it("routes watch lessons through a dedicated shell and compact footer path", () => {
		const source = readSource("components/lesson-page.tsx");
		const shellSource = readSource("components/lesson-shells.tsx");

		expect(source).toContain('const isWatchLesson = lesson.shell === "watch";');
		expect(source).toMatch(
			/onLayoutModeChange:\s*!isWatchLesson && lessonSupportsLayoutToggle\(lesson\)/,
		);
		expect(source).toMatch(/coachVisible:\s*!isWatchLesson &&/);
		expect(source).toContain("(isWatchLesson || objectiveTasks.length > 0)");
		expect(source).toContain(
			"const footer = isWatchLesson ? compactFooter : standardFooter;",
		);
		expect(source).toContain("<LessonShellWatch");
		expect(shellSource).toContain("Watch video");
		expect(shellSource).toContain("Video placeholder");
	});
});
