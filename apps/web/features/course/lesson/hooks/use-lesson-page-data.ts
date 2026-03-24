"use client";

import { useLessonChromeState } from "@/features/course/lesson/hooks/use-lesson-chrome-state";
import { useLessonCompletion } from "@/features/course/lesson/hooks/use-lesson-completion";
import { useLessonState } from "@/features/course/lesson/hooks/use-lesson-state";
import {
	getLessonByKey,
	getLessonHref,
	lessonSupportsLayoutToggle,
	type LessonLayoutMode,
} from "@/features/course/lesson/model/manifest";
import {
	buildResolvedArtifactPreview,
	getCompletionIssues,
	getObjectiveTasks,
	OBJECTIVE_CHECKLIST_FIELD_ID,
} from "@/features/course/lesson/model/registry";

export function useLessonPageData(lessonKey: string) {
	const lesson = getLessonByKey(lessonKey);
	if (!lesson) {
		throw new Error(`Unknown lesson: ${lessonKey}`);
	}

	const lessonContent = lesson.content;
	const isWatchLesson = lesson.shell === "watch";
	const {
		lessonState,
		fieldValues,
		fieldValuesReady,
		saveStatus,
		setFieldValue,
		setSaveStatusError,
	} = useLessonState({ lessonKey });
	const { chromeState, setLayoutMode, setActiveCoachPanel } =
		useLessonChromeState({ lesson, lessonKey });
	const pinnedArtifacts =
		lessonState?.accessStatus === "unlocked" ? lessonState.pinnedArtifacts : [];
	const previousHref = lesson.prevLessonKey
		? getLessonHref(lesson.prevLessonKey)
		: null;
	const resolvedArtifactPreview = buildResolvedArtifactPreview(
		lesson,
		fieldValues,
		pinnedArtifacts,
	);
	const objectiveTasks = getObjectiveTasks(lesson, fieldValues, {
		pinnedArtifacts,
		resolvedArtifactPreview,
	});
	const completionIssues = getCompletionIssues(lesson, fieldValues, {
		pinnedArtifacts,
		resolvedArtifactPreview,
	});
	const completedObjectiveCount = objectiveTasks.filter(
		(task) => task.status === "complete",
	).length;
	const completion = useLessonCompletion({
		lessonKey,
		lesson,
		fieldValues,
		completionIssues,
		objectiveTaskCount: objectiveTasks.length,
		isWatchLesson,
		lessonStatus:
			lessonState?.accessStatus === "unlocked" ? lessonState.status : "locked",
		onUnexpectedSaveError: setSaveStatusError,
	});

	const shellProps = {
		currentLessonId: lessonKey,
		viewportMode: "app" as const,
		layoutMode: chromeState.layoutMode,
		onLayoutModeChange:
			!isWatchLesson && lessonSupportsLayoutToggle(lesson)
			? (layoutMode: LessonLayoutMode) => setLayoutMode(layoutMode)
					: undefined,
		completionCue: null,
	};

	const clearCompletionFeedback = completion.clearCompletionFeedback;

	const setValue = (fieldId: string, value: unknown) => {
		clearCompletionFeedback();
		setFieldValue(fieldId, value);
	};

	const setObjectiveTaskChecked = (taskId: string, checked: boolean) => {
		const manualTasks = objectiveTasks.filter(
			(task) => task.source === "manual",
		);
		if (manualTasks.length === 0) {
			return;
		}

		setValue(
			OBJECTIVE_CHECKLIST_FIELD_ID,
			manualTasks.map((task) => ({
				label: task.label,
				checked: task.id === taskId ? checked : task.status === "complete",
			})),
		);
	};

	return {
		lesson,
		lessonContent,
		isWatchLesson,
		lessonState,
		shellProps,
		completion,
		chromeState,
		setActiveCoachPanel,
		pinnedArtifacts,
		fieldValues,
		fieldValuesReady,
		objectiveTasks,
		completedObjectiveCount,
		previousHref,
		saveStatus,
		setValue,
		setObjectiveTaskChecked,
	};
}
