import type { ReactNode } from "react";
import type { LessonSaveStatus } from "@/features/course/lesson/hooks/use-lesson-state";
import type { CompletionIssue } from "@/features/course/lesson/model/registry";

export function getSaveStatusMeta(saveStatus: LessonSaveStatus) {
	return saveStatus === "saving"
		? {
				label: "Saving draft...",
				className: "text-muted-foreground",
			}
		: saveStatus === "saved"
			? {
					label: "All changes saved",
					className: "text-primary",
				}
			: saveStatus === "error"
				? {
						label: "Save failed. Edit any field to retry.",
						className: "text-destructive",
					}
				: {
						label: "Draft not changed yet",
						className: "text-muted-foreground",
					};
}

export type LessonPageFooterProps = {
	variant: "standard" | "compact";
	showCelebrationBanner: boolean;
	celebrationEyebrow: string;
	celebrationTitle: string;
	completionArtifactLine: string | null;
	completionNextLine: string;
	completedObjectiveCount: number;
	objectiveTaskCount: number;
	saveStatus: LessonSaveStatus;
	isCelebrating: boolean;
	hasCompletionPayload: boolean;
	lessonReadyToComplete: boolean;
	showCompletionFeedback: boolean;
	pendingIssueSummary: string | null;
	hasMorePendingIssues: boolean;
	displayedCompletionIssues: CompletionIssue[];
	serverCompletionMessage: string | null;
	readyStateCopy: string;
	previousHref: string | null;
	hideFooterCompletionButton: boolean;
	completionAction: ReactNode;
};
