import { lessonRegistry, type LessonConfig } from "@/app/lessonRegistry";
import { ceoBlockWrapUpLessonContent } from "@/content/lessons/01-07-ceo-block-wrap-up";
import { killScopeLessonContent } from "@/content/lessons/01-06-kill-scope";
import { mapTheCoreFlowLessonContent } from "@/content/lessons/01-05-map-the-core-flow";
import { lightResearchNotAThesisLessonContent } from "@/content/lessons/01-04-light-research-not-a-thesis";
import { defineTheOutcomeLessonContent } from "@/content/lessons/01-03-define-the-outcome";
import { pickOneUserLessonContent } from "@/content/lessons/01-02-pick-one-user";
import { startWithTheProblemLessonContent } from "@/content/lessons/01-01-start-with-the-problem";
import { howTheSprintWorksLessonContent } from "@/content/lessons/00-02-how-the-sprint-works";
import { welcomeToShipBySundayLessonContent } from "@/content/lessons/00-01-welcome-to-ship-by-sunday";
import type { LessonContent } from "@/content/lessons/types";

const authoredLessonContent = [
	welcomeToShipBySundayLessonContent,
	howTheSprintWorksLessonContent,
	startWithTheProblemLessonContent,
	pickOneUserLessonContent,
	defineTheOutcomeLessonContent,
	lightResearchNotAThesisLessonContent,
	mapTheCoreFlowLessonContent,
	killScopeLessonContent,
	ceoBlockWrapUpLessonContent,
] as const satisfies readonly LessonContent[];

const lessonSlugById: Record<string, string> = {
	"0.1": "00-01-welcome-to-ship-by-sunday",
	"0.2": "00-02-how-the-sprint-works",
	"1.1": "01-01-start-with-the-problem",
	"1.2": "01-02-pick-one-user",
	"1.3": "01-03-define-the-outcome",
	"1.4": "01-04-light-research-not-a-thesis",
	"1.5": "01-05-map-the-core-flow",
	"1.6": "01-06-kill-scope",
	"1.7": "01-07-ceo-block-wrap-up",
	"2.1": "02-01-find-references-first",
	"2.2": "02-02-sketch-before-software",
	"2.3": "02-03-storyboard-the-journey",
	"2.4": "02-04-figma-basics-for-speed",
	"2.5": "02-05-turn-sketches-into-rough-screens",
	"2.6": "02-06-choose-a-visual-direction",
	"2.7": "02-07-design-block-wrap-up",
	"3.1": "03-01-build-from-the-brief",
	"3.2": "03-02-set-up-the-environment",
	"3.3": "03-03-brief-the-agent-correctly",
	"3.4": "03-04-build-the-core-flow",
	"3.5": "03-05-debug-without-spiraling",
	"3.6": "03-06-build-block-wrap-up",
	"4.1": "04-01-ship-the-core-not-the-fantasy",
	"4.2": "04-02-deploy-the-app",
	"4.3": "04-03-record-a-simple-demo",
	"4.4": "04-04-send-it-to-real-humans",
	"4.5": "04-05-capture-feedback-and-plan-version-two",
	"4.6": "04-06-final-wrap",
};

function buildOutlineLessonContent(lesson: LessonConfig): LessonContent {
	return {
		lessonId: lesson.id,
		slug: lessonSlugById[lesson.id] ?? lesson.id.replace(".", "-"),
		status: "outline",
		intro:
			lesson.helperText ??
			"This lesson outline exists, but the final student-facing copy has not been attached yet.",
		coach: {
			video: {
				status: "pending",
				title: lesson.title,
			},
			transcript: {
				status: "empty",
			},
		},
		workbench: {
			prompt: lesson.helperText ?? lesson.winCondition,
			steps: lesson.checklist,
			emptyState:
				"Lesson copy for this step is still being attached. Use the checklist and workbench contract for now.",
		},
		sourceRefs: [],
	};
}

function buildLessonContentMap() {
	const authoredByLessonId = new Map(authoredLessonContent.map((lesson) => [lesson.lessonId, lesson]));
	const seenSlugs = new Set<string>();
	const output = new Map<string, LessonContent>();

	for (const lesson of lessonRegistry) {
		if (lesson.id === "0.0") {
			continue;
		}

		const content = authoredByLessonId.get(lesson.id) ?? buildOutlineLessonContent(lesson);
		const expectedSlug = lessonSlugById[content.lessonId];
		if (!expectedSlug) {
			throw new Error(`Missing lesson slug for ${content.lessonId}`);
		}
		if (content.slug !== expectedSlug) {
			throw new Error(
				`Lesson content slug mismatch for ${content.lessonId}: expected ${expectedSlug}, received ${content.slug}`,
			);
		}
		if (seenSlugs.has(content.slug)) {
			throw new Error(`Duplicate lesson slug: ${content.slug}`);
		}

		seenSlugs.add(content.slug);
		output.set(content.lessonId, content);
	}

	for (const content of authoredLessonContent) {
		const lessonExists = lessonRegistry.some((lesson) => lesson.id === content.lessonId);
		if (!lessonExists) {
			throw new Error(`Lesson content points to missing lesson id ${content.lessonId}`);
		}
	}

	return output;
}

export const lessonContentById = buildLessonContentMap();

export function getLessonContent(lessonId: string) {
	return lessonContentById.get(lessonId) ?? null;
}
