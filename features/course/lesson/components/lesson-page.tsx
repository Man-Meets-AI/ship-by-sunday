"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { routeConfig } from "@/config/product";
import { useLessonChromeState } from "@/features/course/lesson/hooks/use-lesson-chrome-state";
import { useLessonCompletion } from "@/features/course/lesson/hooks/use-lesson-completion";
import {
	type LessonSaveStatus,
	useLessonState,
} from "@/features/course/lesson/hooks/use-lesson-state";
import {
	getLesson,
	getLessonHref,
	type LessonConfig,
	type LessonLayoutMode,
	lessonSupportsLayoutToggle,
} from "@/features/course/lesson/model/manifest";
import {
	buildResolvedArtifactPreview,
	getCompletionIssues,
	getObjectiveTasks,
	OBJECTIVE_CHECKLIST_FIELD_ID,
} from "@/features/course/lesson/model/registry";
import {
	LessonShellFocus,
	LessonShellSplit,
	LessonShellWatch,
} from "@/features/course/lesson/shells";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench";
import { AppShell } from "@/features/course/shared/components/app-shell";

function PreviousLessonBackLink({ href }: { href: string }) {
	return (
		<Button
			variant="secondary"
			size="default"
			asChild
			className={cn("h-auto min-h-8 self-stretch")}
		>
			<Link href={href}>Back</Link>
		</Button>
	);
}

function getSaveStatusMeta(saveStatus: LessonSaveStatus) {
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

export function LessonPage({ lessonId }: { lessonId: string }) {
	const router = useRouter();
	const lesson = getLesson(lessonId);
	if (!lesson) {
		throw new Error(`Unknown lesson: ${lessonId}`);
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
	} = useLessonState({ lessonId });
	const { chromeState, setLayoutMode, setActiveCoachPanel } =
		useLessonChromeState({ lesson, lessonId });
	const pinnedArtifacts =
		lessonState?.accessStatus === "unlocked" ? lessonState.pinnedArtifacts : [];
	const previousHref = lesson.prevLessonId
		? getLessonHref(lesson.prevLessonId)
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
	const {
		completionPayload,
		completionCue,
		displayedCompletionIssues,
		invalidFieldIds,
		invalidFieldMessages,
		serverCompletionMessage,
		showCompletionFeedback,
		lessonReadyToComplete,
		isCompleting,
		isCelebrating,
		completionButtonDisabled,
		pendingIssueSummary,
		hasMorePendingIssues,
		completionNextLine,
		completionArtifactLine,
		readyStateCopy,
		celebrationEyebrow,
		celebrationTitle,
		showCelebrationBanner,
		completionButtonLabel,
		clearCompletionFeedback,
		handleCompletionAction,
	} = useLessonCompletion({
		lessonId,
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
		currentLessonId: lessonId,
		viewportMode: "app" as const,
		layoutMode: chromeState.layoutMode,
		onLayoutModeChange:
			!isWatchLesson && lessonSupportsLayoutToggle(lesson)
				? (layoutMode: LessonLayoutMode) => setLayoutMode(layoutMode)
				: undefined,
		completionCue: null,
	};

	if (lessonState === undefined) {
		return (
			<AppShell {...shellProps}>
				<LessonSkeleton
					shell={lesson.shell}
					layoutMode={chromeState.layoutMode}
				/>
			</AppShell>
		);
	}

	if (lessonState.accessStatus === "locked") {
		return (
			<AppShell currentLessonId={lessonId}>
				<Card className="mx-auto w-full max-w-2xl gap-0 py-0 text-center">
					<CardContent className="px-4 py-6">
						<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Lesson locked
						</CardTitle>
						<p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
							{lesson.id} {lesson.shortTitle}
						</p>
						<p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:mx-auto">
							This lesson is locked. Go back to the mission map and finish{" "}
							{lesson.prevLessonId ?? "the previous unlocked lesson"} first.
						</p>
						<div className="mt-6 flex flex-wrap justify-center gap-3">
							<Button
								type="button"
								onClick={() => router.back()}
								variant="secondary"
								size="default"
							>
								Go back
							</Button>
							<Button asChild variant="default" size="default">
								<Link href={routeConfig.mission}>Open mission</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</AppShell>
		);
	}

	const saveStatusMeta = getSaveStatusMeta(saveStatus);

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

	const completionAction = (
		<Button
			type="button"
			disabled={completionButtonDisabled}
			aria-busy={isCompleting}
			onClick={handleCompletionAction}
			variant="default"
			size="default"
			className={cn("h-auto min-h-8 max-w-full whitespace-normal")}
		>
			{completionButtonLabel}
		</Button>
	);

	const footerActions = (
		<div className="flex flex-wrap justify-end gap-2 lg:ml-auto">
			{previousHref ? <PreviousLessonBackLink href={previousHref} /> : null}
			{lesson.id === "1.4" ? null : completionAction}
		</div>
	);

	const standardFooterInner = (
		<>
			{showCelebrationBanner ? (
				<div
					role="status"
					aria-live="polite"
					className="mx-auto flex w-full max-w-xl flex-col items-center gap-1 text-center"
				>
					<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
						{celebrationEyebrow}
					</p>
					<p className="text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
						{celebrationTitle}
					</p>
					{completionArtifactLine ? (
						<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground">
							{completionArtifactLine}
						</p>
					) : null}
					<p className="text-sm leading-7 text-muted-foreground">
						{completionNextLine}
					</p>
				</div>
			) : null}
			<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
				<div className="max-w-2xl space-y-1">
					<CardTitle className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						Progress {completedObjectiveCount}/
						{Math.max(objectiveTasks.length, 1)}
					</CardTitle>
					<Progress
						className="mt-1.5 h-1.5"
						value={
							objectiveTasks.length > 0
								? (completedObjectiveCount / objectiveTasks.length) * 100
								: 0
						}
					/>
					<p
						className={`text-xs font-medium leading-relaxed ${saveStatusMeta.className}`}
					>
						{saveStatusMeta.label}
					</p>
					{isCelebrating && completionPayload ? (
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
						<Alert variant="destructive" className="mt-1 py-2">
							<AlertDescription className="text-xs font-medium text-destructive">
								<p>
									{serverCompletionMessage ?? "Finish these before continuing:"}
								</p>
								{displayedCompletionIssues.length > 0 ? (
									<div className="mt-1 space-y-1">
										{displayedCompletionIssues.map((issue) => (
											<p key={`${issue.id}-${issue.label}`}>
												{issue.message ?? issue.label}
											</p>
										))}
									</div>
								) : null}
							</AlertDescription>
						</Alert>
					) : null}
				</div>
				{footerActions}
			</div>
		</>
	);

	const standardFooter = isCelebrating ? (
		<Card className="gap-0 bg-primary/5 py-0">
			<CardContent className="flex flex-col gap-3 px-3 py-3">
				{standardFooterInner}
			</CardContent>
		</Card>
	) : (
		<div className="flex flex-col gap-3">{standardFooterInner}</div>
	);

	const compactFooter = (
		<div className="flex flex-col gap-2">
			{showCompletionFeedback && !isCelebrating ? (
				<Alert variant="destructive" className="py-2">
					<AlertDescription className="text-xs font-medium text-destructive">
						<p>
							{serverCompletionMessage ?? "Finish these before continuing:"}
						</p>
						{displayedCompletionIssues.length > 0 ? (
							<div className="mt-1 space-y-1">
								{displayedCompletionIssues.map((issue) => (
									<p key={`${issue.id}-${issue.label}`}>
										{issue.message ?? issue.label}
									</p>
								))}
							</div>
						) : null}
					</AlertDescription>
				</Alert>
			) : null}
			<div className="flex flex-wrap items-center justify-end gap-2">
				{previousHref ? <PreviousLessonBackLink href={previousHref} /> : null}
				{completionAction}
			</div>
		</div>
	);

	const footer = isWatchLesson ? compactFooter : standardFooter;
	const workbench = isWatchLesson ? null : (
		<WorkbenchRenderer
			lesson={lesson}
			lessonContent={lessonContent}
			fieldValues={fieldValues}
			onFieldChange={setValue}
			pinnedArtifacts={pinnedArtifacts}
			layoutMode={chromeState.layoutMode}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			fieldValuesReady={fieldValuesReady}
			workbenchCompletionSlot={
				lesson.id === "1.1" || lesson.id === "1.4" || lesson.id === "1.9"
					? completionAction
					: undefined
			}
		/>
	);

	return (
		<AppShell {...shellProps} completionCue={completionCue}>
			{isWatchLesson ? (
				<LessonShellWatch
					lesson={lesson}
					coachContent={lessonContent.coach}
					footer={footer}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : chromeState.layoutMode === "focus" ? (
				<LessonShellFocus
					lesson={lesson}
					coachContent={lessonContent.coach}
					footer={footer}
				>
					{workbench}
				</LessonShellFocus>
			) : (
				<LessonShellSplit
					lesson={lesson}
					activeCoachPanel={chromeState.activeCoachPanel}
					onCoachPanelChange={setActiveCoachPanel}
					objectiveTasks={objectiveTasks}
					onObjectiveTaskToggle={setObjectiveTaskChecked}
					pinnedArtifacts={pinnedArtifacts}
					coachContent={lessonContent.coach}
					footer={footer}
				>
					{workbench}
				</LessonShellSplit>
			)}
		</AppShell>
	);
}

function SkeletonPanel({
	label,
	className = "",
}: {
	label: string;
	className?: string;
}) {
	return (
		<Card className={cn("min-w-0 gap-0 py-0 backdrop-blur-sm", className)}>
			<div className="border-b border-border bg-card/95 px-3 py-1.5 backdrop-blur-sm">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
					{label}
				</p>
			</div>
			<div className="space-y-2 p-3">
				<div className="h-3 w-3/4 rounded-full bg-muted/70" />
				<div className="h-3 w-full rounded-full bg-muted/50" />
				<div className="h-20 rounded-lg border border-input bg-background" />
			</div>
		</Card>
	);
}

function LessonSkeleton({
	shell,
	layoutMode,
}: {
	shell: LessonConfig["shell"];
	layoutMode: LessonLayoutMode;
}) {
	if (shell === "watch") {
		return (
			<Card className="animate-pulse gap-0 bg-card/80 py-0 backdrop-blur-sm">
				<CardContent className="space-y-5 px-4 py-4 xl:px-6 xl:py-6">
					<div className="space-y-3 border-b border-border/60 pb-4">
						<div className="flex gap-2">
							<div className="h-3 w-12 rounded-full bg-muted/70" />
							<div className="h-3 w-24 rounded-full bg-muted/50" />
							<div className="h-3 w-14 rounded-full bg-muted/50" />
						</div>
						<div className="h-10 w-2/3 rounded-lg bg-muted/70" />
						<div className="h-4 w-3/4 rounded-full bg-muted/50" />
					</div>
					<div className="aspect-video rounded-lg border border-input bg-background/80" />
				</CardContent>
			</Card>
		);
	}

	if (layoutMode === "focus") {
		return (
			<div className="animate-pulse xl:h-full xl:min-h-0">
				<SkeletonPanel label="Workbench" className="xl:h-full" />
			</div>
		);
	}

	return (
		<div className="grid animate-pulse gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)_minmax(280px,320px)]">
			<SkeletonPanel label="Objective" className="xl:h-full" />
			<SkeletonPanel label="Workbench" className="xl:h-full" />
			<SkeletonPanel label="Coach" className="xl:h-full" />
		</div>
	);
}
