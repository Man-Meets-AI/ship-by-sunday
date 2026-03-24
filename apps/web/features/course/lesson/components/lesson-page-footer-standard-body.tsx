"use client";

import type { ReactNode } from "react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getSaveStatusMeta } from "@/features/course/lesson/components/lesson-page-footer-props";
import { LessonPageFooterCompletionAlert } from "@/features/course/lesson/components/lesson-page-footer-completion-alert";
import type { CompletionIssue } from "@/features/course/lesson/model/registry";
import type { LessonSaveStatus } from "@/features/course/lesson/hooks/use-lesson-state";

type LessonPageFooterStandardBodyProps = {
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
	footerActions: ReactNode;
};

export function LessonPageFooterStandardBody({
	showCelebrationBanner,
	celebrationEyebrow,
	celebrationTitle,
	completionArtifactLine,
	completionNextLine,
	completedObjectiveCount,
	objectiveTaskCount,
	saveStatus,
	isCelebrating,
	hasCompletionPayload,
	lessonReadyToComplete,
	showCompletionFeedback,
	pendingIssueSummary,
	hasMorePendingIssues,
	displayedCompletionIssues,
	serverCompletionMessage,
	readyStateCopy,
	footerActions,
}: LessonPageFooterStandardBodyProps) {
	const saveStatusMeta = getSaveStatusMeta(saveStatus);
	const progressDenominator = Math.max(objectiveTaskCount, 1);
	const progressPercent =
		objectiveTaskCount > 0
			? (completedObjectiveCount / objectiveTaskCount) * 100
			: 0;

	return (
		<>
			{showCelebrationBanner ? (
				<Card
					role="status"
					aria-live="polite"
					className="mx-auto w-full max-w-xl text-center shadow-none ring-0"
				>
					<CardHeader className="space-y-1">
						<CardDescription>{celebrationEyebrow}</CardDescription>
						<CardTitle className="text-2xl sm:text-3xl">
							{celebrationTitle}
						</CardTitle>
						{completionArtifactLine ? (
							<CardDescription className="text-foreground">
								{completionArtifactLine}
							</CardDescription>
						) : null}
						<CardDescription className="text-base leading-relaxed">
							{completionNextLine}
						</CardDescription>
					</CardHeader>
				</Card>
			) : null}
			<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
				<div className="max-w-2xl space-y-1">
					<CardDescription>
						Progress {completedObjectiveCount}/{progressDenominator}
					</CardDescription>
					<Progress className="mt-1.5 h-1.5" value={progressPercent} />
					<p
						className={cn(
							"text-xs font-medium leading-relaxed",
							saveStatusMeta.className,
						)}
					>
						{saveStatusMeta.label}
					</p>
					{isCelebrating && hasCompletionPayload ? (
						<>
							{completionArtifactLine ? (
								<p className="text-xs font-medium leading-relaxed text-primary">
									{completionArtifactLine}
								</p>
							) : null}
							<p className="text-xs leading-relaxed text-foreground">
								{completionNextLine}
							</p>
						</>
					) : lessonReadyToComplete && !showCompletionFeedback ? (
						<p className="text-xs font-medium leading-relaxed text-primary">
							{readyStateCopy}
						</p>
					) : null}
					{!lessonReadyToComplete &&
					!showCompletionFeedback &&
					!isCelebrating &&
					pendingIssueSummary ? (
						<p className="text-xs leading-relaxed text-muted-foreground">
							Complete before continuing: {pendingIssueSummary}
							{hasMorePendingIssues ? " • ..." : ""}
						</p>
					) : null}
					{showCompletionFeedback && !isCelebrating ? (
						<LessonPageFooterCompletionAlert
							serverCompletionMessage={serverCompletionMessage}
							displayedCompletionIssues={displayedCompletionIssues}
							className="mt-1"
						/>
					) : null}
				</div>
				{footerActions}
			</div>
		</>
	);
}
