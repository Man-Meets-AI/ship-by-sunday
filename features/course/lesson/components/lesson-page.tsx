"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { ProductShell } from "@/features/course/shared/components/product-shell";

function getSaveStatusMeta(saveStatus: LessonSaveStatus) {
	return saveStatus === "saving"
		? {
				label: "Saving draft...",
				className: "text-product-muted",
			}
		: saveStatus === "saved"
			? {
					label: "All changes saved",
					className: "text-product-accent",
				}
			: saveStatus === "error"
				? {
						label: "Save failed. Edit any field to retry.",
						className: "text-danger",
					}
				: {
						label: "Draft not changed yet",
						className: "text-product-muted",
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
	const { chromeState, setLayoutMode, toggleCoach, setActiveCoachPanel } =
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
		coachVisible:
			!isWatchLesson && chromeState.layoutMode === "split"
				? chromeState.coachVisible
				: false,
		onCoachToggle:
			!isWatchLesson && chromeState.layoutMode === "split"
				? () => toggleCoach()
				: undefined,
		completionCue: null,
	};

	if (lessonState === undefined) {
		return (
			<ProductShell {...shellProps}>
				<LessonSkeleton
					shell={lesson.shell}
					layoutMode={chromeState.layoutMode}
				/>
			</ProductShell>
		);
	}

	if (lessonState.accessStatus === "locked") {
		return (
			<ProductShell currentLessonId={lessonId}>
				<section className="rounded-none border border-product-border bg-product-surface/78 px-4 py-6 text-center shadow-panel backdrop-blur-xl">
					<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
						Lesson locked
					</p>
					<p className="mt-2 font-display text-xl uppercase tracking-[0.08em] text-product-text">
						{lesson.id} {lesson.shortTitle}
					</p>
					<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted sm:mx-auto">
						This lesson is locked. Go back to the mission map and finish{" "}
						{lesson.prevLessonId ?? "the previous unlocked lesson"} first.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
						>
							Go back
						</button>
						<Link
							href={routeConfig.mission}
							className="rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
						>
							Open mission
						</Link>
					</div>
				</section>
			</ProductShell>
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
		<button
			type="button"
			disabled={completionButtonDisabled}
			aria-busy={isCompleting}
			onClick={handleCompletionAction}
			className={
				isCelebrating
					? "sbs-press-feedback inline-flex items-center gap-1.5 rounded-none border border-product-accent bg-product-accent px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-bg shadow-[0_0_0_1px_rgba(var(--product-accent),0.3),0_0_18px_rgba(var(--product-accent),0.24)]"
					: isCompleting
						? "inline-flex items-center gap-1.5 rounded-none border border-product-accent bg-product-accent px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-bg shadow-[0_0_0_1px_rgba(var(--product-accent),0.24)]"
						: lessonReadyToComplete
							? "sbs-press-feedback inline-flex items-center gap-1.5 rounded-none border border-product-accent bg-product-accent px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-bg shadow-[0_0_0_1px_rgba(var(--product-accent),0.3),0_0_18px_rgba(var(--product-accent),0.22)] transition-all hover:brightness-95 motion-safe:animate-pulse"
							: "inline-flex cursor-not-allowed items-center gap-1.5 rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted"
			}
		>
			{isCelebrating ? (
				<>
					<svg
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
					{completionButtonLabel}
				</>
			) : (
				completionButtonLabel
			)}
		</button>
	);

	const footerActions = (
		<div className="flex flex-wrap justify-end gap-2 lg:ml-auto">
			{previousHref ? (
				<Link
					href={previousHref}
					className="inline-flex items-center px-1 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted transition-colors hover:text-product-text"
				>
					Back
				</Link>
			) : null}
			{completionAction}
		</div>
	);

	const standardFooter = (
		<div
			className={`flex flex-col gap-3 ${
				isCelebrating
					? "sbs-completion-footer rounded-none border border-product-accent/30 bg-product-accent/[0.07] px-3 py-3"
					: ""
			}`}
		>
			{showCelebrationBanner ? (
				<div
					role="status"
					aria-live="polite"
					className="sbs-completion-banner mx-auto flex w-full max-w-xl flex-col items-center gap-1 rounded-none border border-product-accent/35 bg-product-surface-strong/95 px-4 py-3 text-center shadow-[0_0_0_1px_rgba(var(--product-accent),0.14),0_18px_36px_rgba(var(--product-shadow),0.35)]"
				>
					<div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-product-accent">
						<span className="inline-flex h-5 w-5 items-center justify-center border border-product-accent/60 bg-product-accent/14 text-product-accent">
							<svg
								width="10"
								height="10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</span>
						{celebrationEyebrow}
					</div>
					<p className="font-display text-[1.65rem] uppercase leading-none tracking-[0.06em] text-product-text sm:text-[2rem]">
						{celebrationTitle}
					</p>
					{completionArtifactLine ? (
						<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-text">
							{completionArtifactLine}
						</p>
					) : null}
					<p className="text-xs font-medium leading-relaxed text-product-muted">
						{completionNextLine}
					</p>
				</div>
			) : null}
			<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
				<div className="max-w-2xl space-y-1">
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
						Progress {completedObjectiveCount}/
						{Math.max(objectiveTasks.length, 1)}
					</p>
					<p
						className={`text-xs font-medium leading-relaxed ${saveStatusMeta.className}`}
					>
						{saveStatusMeta.label}
					</p>
					{isCelebrating && completionPayload ? (
						<>
							{completionArtifactLine ? (
								<p className="text-xs font-medium leading-relaxed text-product-accent">
									{completionArtifactLine}
								</p>
							) : null}
							<p className="text-xs leading-relaxed text-product-text">
								{completionNextLine}
							</p>
						</>
					) : lessonReadyToComplete && !showCompletionFeedback ? (
						<p className="text-xs font-medium leading-relaxed text-product-accent">
							{readyStateCopy}
						</p>
					) : null}
					{!lessonReadyToComplete &&
					!showCompletionFeedback &&
					!isCelebrating &&
					pendingIssueSummary ? (
						<p className="text-xs leading-relaxed text-product-muted">
							Complete before continuing: {pendingIssueSummary}
							{hasMorePendingIssues ? " • ..." : ""}
						</p>
					) : null}
					{showCompletionFeedback && !isCelebrating ? (
						<div className="text-xs font-medium leading-relaxed text-danger">
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
						</div>
					) : null}
				</div>
				{footerActions}
			</div>
		</div>
	);

	const compactFooter = (
		<div className="flex flex-col gap-2">
			{showCompletionFeedback && !isCelebrating ? (
				<div className="text-xs font-medium leading-relaxed text-danger">
					<p>{serverCompletionMessage ?? "Finish these before continuing:"}</p>
					{displayedCompletionIssues.length > 0 ? (
						<div className="mt-1 space-y-1">
							{displayedCompletionIssues.map((issue) => (
								<p key={`${issue.id}-${issue.label}`}>
									{issue.message ?? issue.label}
								</p>
							))}
						</div>
					) : null}
				</div>
			) : null}
			<div className="flex flex-wrap items-center justify-end gap-2">
				{previousHref ? (
					<Link
						href={previousHref}
						className="inline-flex items-center px-1 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted transition-colors hover:text-product-text"
					>
						Back
					</Link>
				) : null}
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
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			fieldValuesReady={fieldValuesReady}
		/>
	);

	return (
		<ProductShell {...shellProps} completionCue={completionCue}>
			{isWatchLesson ? (
				<LessonShellWatch
					lesson={lesson}
					coachContent={lessonContent.coach}
					footer={footer}
				/>
			) : chromeState.layoutMode === "focus" ? (
				<LessonShellFocus
					lesson={lesson}
					coachVisible={chromeState.coachVisible}
					activeCoachPanel={chromeState.activeCoachPanel}
					onCoachPanelChange={setActiveCoachPanel}
					objectiveTasks={objectiveTasks}
					onObjectiveTaskToggle={setObjectiveTaskChecked}
					pinnedArtifacts={pinnedArtifacts}
					coachContent={lessonContent.coach}
					footer={footer}
				>
					{workbench}
				</LessonShellFocus>
			) : (
				<LessonShellSplit
					lesson={lesson}
					coachVisible={chromeState.coachVisible}
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
		</ProductShell>
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
		<section
			className={`min-w-0 rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-lg ${className}`}
		>
			<div className="border-b border-product-border bg-product-surface/95 px-3 py-1.5 backdrop-blur-lg">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					{label}
				</p>
			</div>
			<div className="space-y-2 p-3">
				<div className="h-3 w-3/4 bg-product-border/15" />
				<div className="h-3 w-full bg-product-border/10" />
				<div className="h-20 border border-product-border/40 bg-product-surface-strong/70" />
			</div>
		</section>
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
			<section className="animate-pulse rounded-none border border-product-border/75 bg-product-surface/82 shadow-panel backdrop-blur-lg">
				<div className="space-y-5 px-4 py-4 xl:px-6 xl:py-6">
					<div className="space-y-3 border-b border-product-border/70 pb-4">
						<div className="flex gap-2">
							<div className="h-3 w-12 bg-product-border/15" />
							<div className="h-3 w-24 bg-product-border/10" />
							<div className="h-3 w-14 bg-product-border/10" />
						</div>
						<div className="h-10 w-2/3 bg-product-border/15" />
						<div className="h-4 w-3/4 bg-product-border/10" />
					</div>
					<div className="aspect-video border border-product-border/40 bg-product-surface-strong/70" />
				</div>
			</section>
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
