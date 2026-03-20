"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LessonPageFooterProps } from "@/features/course/lesson/components/lesson-page-footer-props";
import { useLessonPageData } from "@/features/course/lesson/hooks/use-lesson-page-data";

export function useLessonPage(lessonId: string) {
	const data = useLessonPageData(lessonId);
	const {
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
	} = data;

	const completionAction = useMemo(
		() => (
			<Button
				type="button"
				disabled={completion.completionButtonDisabled}
				aria-busy={completion.isCompleting}
				onClick={completion.handleCompletionAction}
				variant="default"
				size="default"
				className={cn("h-auto min-h-8 max-w-full whitespace-normal")}
			>
				{completion.completionButtonLabel}
			</Button>
		),
		[
			completion.completionButtonDisabled,
			completion.completionButtonLabel,
			completion.handleCompletionAction,
			completion.isCompleting,
		],
	);

	const footerProps: LessonPageFooterProps = {
		variant: isWatchLesson ? "compact" : "standard",
		showCelebrationBanner: completion.showCelebrationBanner,
		celebrationEyebrow: completion.celebrationEyebrow,
		celebrationTitle: completion.celebrationTitle,
		completionArtifactLine: completion.completionArtifactLine,
		completionNextLine: completion.completionNextLine,
		completedObjectiveCount,
		objectiveTaskCount: objectiveTasks.length,
		saveStatus,
		isCelebrating: completion.isCelebrating,
		hasCompletionPayload: Boolean(completion.completionPayload),
		lessonReadyToComplete: completion.lessonReadyToComplete,
		showCompletionFeedback: completion.showCompletionFeedback,
		pendingIssueSummary: completion.pendingIssueSummary,
		hasMorePendingIssues: completion.hasMorePendingIssues,
		displayedCompletionIssues: completion.displayedCompletionIssues,
		serverCompletionMessage: completion.serverCompletionMessage,
		readyStateCopy: completion.readyStateCopy,
		previousHref,
		hideFooterCompletionButton: lesson.id === "1.4",
		completionAction,
	};

	return {
		lesson,
		lessonContent,
		isWatchLesson,
		lessonState,
		shellProps,
		completionCue: completion.completionCue,
		chromeState,
		setActiveCoachPanel,
		pinnedArtifacts,
		fieldValues,
		fieldValuesReady,
		objectiveTasks,
		invalidFieldIds: completion.invalidFieldIds,
		invalidFieldMessages: completion.invalidFieldMessages,
		setValue,
		setObjectiveTaskChecked,
		completionAction,
		footerProps,
	};
}
