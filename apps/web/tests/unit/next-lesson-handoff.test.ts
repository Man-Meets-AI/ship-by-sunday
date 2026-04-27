import { getCompletionButtonLabel } from "@/app/(workspace)/_hooks/course/lesson/use-lesson-completion";
import { getLessonById } from "@/lib/course/lesson/model";
import {
	formatHandoffLabelForLesson,
	getNextLessonHandoffLabel,
} from "@/lib/course/lesson/model/next-lesson-handoff";

describe("next lesson handoff labels", () => {
	it("formats id and full title with a colon", () => {
		const next = getLessonById("1.3");
		expect(next).toBeTruthy();
		if (!next) {
			throw new Error("Expected lesson 1.3.");
		}
		expect(formatHandoffLabelForLesson(next)).toBe(
			"1.3: Start With the Problem",
		);
	});

	it("returns handoff for lesson 1.2 pointing at 1.3", () => {
		const lesson = getLessonById("1.2");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.2.");
		}
		expect(getNextLessonHandoffLabel(lesson)).toBe(
			"1.3: Start With the Problem",
		);
	});

	it("returns null when there is no next lesson", () => {
		const lesson = getLessonById("4.0");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 4.0.");
		}
		expect(getNextLessonHandoffLabel(lesson)).toBeNull();
	});

	it("uses Continue-to-next copy when incomplete and a next lesson exists", () => {
		const handoff = getNextLessonHandoffLabel(getLessonById("1.2")!);
		expect(
			getCompletionButtonLabel({
				isCelebrating: false,
				isCompleting: false,
				requiresManualContinuation: false,
				completionPayload: null,
				lessonReadyToComplete: false,
				completionActionLabel: "Complete lesson",
				completionPendingLabel: "Locking in...",
				celebrationShortLabel: "Lesson complete",
				nextHandoffLabel: handoff,
			}),
		).toBe("Continue to 1.3: Start With the Problem");
	});

	it("uses Complete lesson when ready despite a next handoff", () => {
		expect(
			getCompletionButtonLabel({
				isCelebrating: false,
				isCompleting: false,
				requiresManualContinuation: false,
				completionPayload: null,
				lessonReadyToComplete: true,
				completionActionLabel: "Complete lesson",
				completionPendingLabel: "Locking in...",
				celebrationShortLabel: "Lesson complete",
				nextHandoffLabel: "1.3: Start With the Problem",
			}),
		).toBe("Complete lesson");
	});

	it("falls back when incomplete and no next lesson", () => {
		expect(
			getCompletionButtonLabel({
				isCelebrating: false,
				isCompleting: false,
				requiresManualContinuation: false,
				completionPayload: null,
				lessonReadyToComplete: false,
				completionActionLabel: "Complete lesson",
				completionPendingLabel: "Locking in...",
				celebrationShortLabel: "Lesson complete",
				nextHandoffLabel: null,
			}),
		).toBe("Complete required steps");
	});
});
