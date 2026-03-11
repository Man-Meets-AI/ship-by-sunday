import { lessonRegistry, type LessonConfig } from "@/lib/course/manifest";
import { lessonContentManifest } from "@/lib/course/content-manifest";
import { authoredLessonContent } from "@/content/lessons/generated";
import { lessonContentOverrides } from "@/content/lessons/overrides";
import type { LessonContent } from "@/content/lessons/types";

const internalCoachExampleIds = new Set(["key-line", "lock-it-in", "avoid-this"]);
const internalCoachExampleTitles = new Set([
	"key line",
	"lock it in",
	"avoid this",
]);

function sanitizeLessonContentForStudent(content: LessonContent): LessonContent {
	const sanitizedIntro =
		content.status !== "outline" && content.workbench.prompt
			? content.workbench.prompt
			: content.intro;

	return {
		...content,
		intro: sanitizedIntro,
		coach: {
			...content.coach,
			examples: content.coach.examples?.filter(
				(example) =>
					!internalCoachExampleIds.has(example.id) &&
					!internalCoachExampleTitles.has(example.title.trim().toLowerCase()),
			),
		},
	};
}

function mergeLessonContent(
	base: LessonContent,
	override: (typeof lessonContentOverrides)[string] | undefined,
): LessonContent {
	if (!override) {
		return base;
	}

	return {
		...base,
		intro: override.intro ?? base.intro,
		actionCard: {
			...base.actionCard,
			...override.actionCard,
		},
		workbench: {
			...base.workbench,
			...override.workbench,
			sections: {
				...base.workbench.sections,
				...override.workbench?.sections,
			},
		},
	};
}

function buildOutlineLessonContent(lesson: LessonConfig): LessonContent {
	const slug = lessonContentManifest.lessons[lesson.id]?.slug;
	if (!slug) {
		throw new Error(`Missing lesson slug for ${lesson.id}`);
	}

	return {
		lessonId: lesson.id,
		slug,
		status: "outline",
		intro:
			lesson.helperText ??
			"This lesson outline exists, but the final student-facing copy has not been attached yet.",
		lessonMeta: {
			runtimeLabel: undefined,
			goal: lesson.winCondition,
			purpose: lesson.helperText ?? lesson.winCondition,
		},
		actionCard: {
			jobNow: lesson.checklist[0] ?? "Complete the lesson rep.",
			timebox: "10 minutes",
			comeBackWith: lesson.artifact.label,
		},
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
			prompt: lesson.winCondition,
			teachingPoints: lesson.checklist,
			emptyState:
				"Lesson copy for this step is still being attached. Use the checklist and workbench contract for now.",
		},
		sourceRefs: [],
	};
}

function buildLessonContentMap() {
	const authoredByLessonId = new Map(
		authoredLessonContent.map((lesson) => [lesson.lessonId, lesson]),
	);
	const seenSlugs = new Set<string>();
	const output = new Map<string, LessonContent>();

	for (const lesson of lessonRegistry) {
		if (lesson.id === "0.0") {
			continue;
		}

		const content =
			mergeLessonContent(
				authoredByLessonId.get(lesson.id) ?? buildOutlineLessonContent(lesson),
				lessonContentOverrides[lesson.id],
			);
		const expectedSlug = lessonContentManifest.lessons[content.lessonId]?.slug;
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
		output.set(content.lessonId, sanitizeLessonContentForStudent(content));
	}

	for (const content of authoredLessonContent) {
		const lessonExists = lessonRegistry.some(
			(lesson) => lesson.id === content.lessonId,
		);
		if (!lessonExists) {
			throw new Error(
				`Lesson content points to missing lesson id ${content.lessonId}`,
			);
		}
	}

	return output;
}

export const lessonContentById = buildLessonContentMap();

export function getLessonContent(lessonId: string) {
	return lessonContentById.get(lessonId) ?? null;
}
