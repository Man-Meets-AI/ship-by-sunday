"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LessonPageFooterCompletionAlert } from "@/features/course/lesson/components/lesson-page-footer-completion-alert";
import type { LessonPageFooterProps } from "@/features/course/lesson/components/lesson-page-footer-props";
import { LessonPageFooterStandardBody } from "@/features/course/lesson/components/lesson-page-footer-standard-body";

export type { LessonPageFooterProps } from "@/features/course/lesson/components/lesson-page-footer-props";

export function LessonPageFooter(props: LessonPageFooterProps) {
	const {
		variant,
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
		previousHref,
		hideFooterCompletionButton,
		completionAction,
	} = props;

	const backButton = previousHref ? (
		<Button variant="secondary" size="default" asChild>
			<Link href={previousHref}>Back</Link>
		</Button>
	) : null;

	if (variant === "compact") {
		return (
			<div className="flex flex-col gap-2">
				{showCompletionFeedback && !isCelebrating ? (
					<LessonPageFooterCompletionAlert
						serverCompletionMessage={serverCompletionMessage}
						displayedCompletionIssues={displayedCompletionIssues}
					/>
				) : null}
				<div className="flex flex-wrap items-center justify-end gap-2">
					{backButton}
					{completionAction}
				</div>
			</div>
		);
	}

	const footerActions = (
		<div className="flex flex-wrap justify-end gap-2 lg:ml-auto">
			{backButton}
			{hideFooterCompletionButton ? null : completionAction}
		</div>
	);

	const standardFooterInner = (
		<LessonPageFooterStandardBody
			showCelebrationBanner={showCelebrationBanner}
			celebrationEyebrow={celebrationEyebrow}
			celebrationTitle={celebrationTitle}
			completionArtifactLine={completionArtifactLine}
			completionNextLine={completionNextLine}
			completedObjectiveCount={completedObjectiveCount}
			objectiveTaskCount={objectiveTaskCount}
			saveStatus={saveStatus}
			isCelebrating={isCelebrating}
			hasCompletionPayload={hasCompletionPayload}
			lessonReadyToComplete={lessonReadyToComplete}
			showCompletionFeedback={showCompletionFeedback}
			pendingIssueSummary={pendingIssueSummary}
			hasMorePendingIssues={hasMorePendingIssues}
			displayedCompletionIssues={displayedCompletionIssues}
			serverCompletionMessage={serverCompletionMessage}
			readyStateCopy={readyStateCopy}
			footerActions={footerActions}
		/>
	);

	if (isCelebrating) {
		return (
			<Card className="gap-0 bg-primary/5 py-0">
				<CardContent className="flex flex-col gap-3 px-3 py-3">
					{standardFooterInner}
				</CardContent>
			</Card>
		);
	}

	return <div className="flex flex-col gap-3">{standardFooterInner}</div>;
}
