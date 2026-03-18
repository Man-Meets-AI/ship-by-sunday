import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string) {
	return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("watch lesson shell contract", () => {
	it("routes watch lessons through a dedicated shell and compact footer path", () => {
		const source = readSource(
			"features/course/lesson/components/lesson-page.tsx",
		);
		const completionSource = readSource(
			"features/course/lesson/hooks/use-lesson-completion.ts",
		);
		const shellSource = readSource("features/course/lesson/shells/index.tsx");
		const videoSurfaceSource = readSource(
			"features/course/lesson/components/lesson-video-surface.tsx",
		);

		expect(source).toContain('const isWatchLesson = lesson.shell === "watch";');
		expect(source).toMatch(
			/onLayoutModeChange:\s*!isWatchLesson && lessonSupportsLayoutToggle\(lesson\)/,
		);
		expect(source).toMatch(/coachVisible:\s*!isWatchLesson &&/);
		expect(completionSource).toContain(
			"(isWatchLesson || objectiveTaskCount > 0)",
		);
		expect(source).toContain(
			"const footer = isWatchLesson ? compactFooter : standardFooter;",
		);
		expect(source).toContain("<LessonShellWatch");
		expect(shellSource).toContain('variant="watch-shell"');
		expect(videoSurfaceSource).toContain("Watch video");
		expect(videoSurfaceSource).toContain("Video placeholder");
	});
});
