import fs from "node:fs";
import path from "node:path";

function readSource(relativePath: string) {
	return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("lesson completion celebration contract", () => {
	it("keeps lesson completion in a dedicated hook state machine before route navigation", () => {
		const pageSource = readSource(
			"features/course/lesson/components/lesson-page.tsx",
		);
		const source = readSource(
			"features/course/lesson/hooks/use-lesson-completion.ts",
		);
		const ceoLessonSource = readSource(
			"features/course/lesson/model/lessons/ceo.ts",
		);

		expect(pageSource).toContain("useLessonCompletion");
		expect(source).toContain(
			'type CompletionPhase = "idle" | "submitting" | "celebrating";',
		);
		expect(source).toContain("const [completionPayload, setCompletionPayload]");
		expect(source).toContain('setCompletionPhase("submitting")');
		expect(source).toContain('setCompletionPhase("celebrating")');
		expect(source).toContain("getCompletionNavigationDelayMs()");
		expect(source).toContain(
			'window.matchMedia("(prefers-reduced-motion: reduce)")',
		);
		expect(source).toContain("Locking in...");
		expect(source).toContain("Lesson cleared");
		expect(source).toContain("Artifact locked:");
		expect(source).toContain("Next unlocked:");
		expect(source).toContain("completionActionLabel");
		expect(source).toContain("celebrationTitle");
		expect(ceoLessonSource).toContain("createVideoLesson");
		expect(ceoLessonSource).not.toContain('preset: "ceo"');
		expect(ceoLessonSource).not.toContain("completionCtaLabel");
	});

	it("passes a temporary completion cue into the product shell and rail", () => {
		const lessonSource = readSource(
			"features/course/lesson/components/lesson-page.tsx",
		);
		const shellSource = readSource(
			"features/course/shared/components/product-shell.tsx",
		);
		const railSource = readSource(
			"features/course/shared/components/skill-rail.tsx",
		);

		expect(lessonSource).toContain("completionCue:");
		expect(lessonSource).toContain("completionCue={completionCue}");
		expect(shellSource).toContain(
			"completionCue?: SkillRailCompletionCue | null;",
		);
		expect(shellSource).toContain("completionCue={completionCue}");
		expect(railSource).toContain("sbs-rail-complete-slot");
		expect(railSource).toContain("sbs-rail-complete-sweep");
		expect(railSource).toContain("sbs-rail-unlock-slot");
	});

	it("defines shared completion motion utilities with reduced-motion fallbacks", () => {
		const source = readSource("app/globals.css");

		expect(source).toContain("@keyframes sbs-completion-banner-in");
		expect(source).toContain("@keyframes sbs-completion-footer-lock-in");
		expect(source).toContain("@keyframes sbs-rail-complete-sweep");
		expect(source).toContain("@keyframes sbs-rail-unlock-ping");
		expect(source).toContain(".sbs-completion-banner");
		expect(source).toContain(".sbs-completion-footer");
		expect(source).toContain(".sbs-rail-complete-sweep");
		expect(source).toContain(".sbs-rail-unlock-slot");
		expect(source).toContain("@media (prefers-reduced-motion: reduce)");
	});
});
