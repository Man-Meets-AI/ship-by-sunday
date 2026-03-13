"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import {
	getDefaultLayoutModeForLesson,
	getLesson,
	getLessonHref,
	lessonSupportsLayoutToggle,
	normalizeLayoutModeForLesson,
	type LessonConfig,
	type LessonLayoutMode,
} from "@/lib/course/manifest";
import { api } from "@/convex/_generated/api";
import { WorkbenchRenderer } from "@/components/lesson-workbench";
import {
	LessonShellFocus,
	LessonShellSplit,
	LessonShellWatch,
	type PinnedArtifact,
} from "@/components/lesson-shells";
import { ProductShell } from "@/components/product-shell";
import {
	buildResolvedArtifactPreview,
	getCompletionIssues,
	getObjectiveTasks,
	OBJECTIVE_CHECKLIST_FIELD_ID,
	type CompletionIssue,
} from "@/lib/course/registry";
import type { ProductTheme } from "@/lib/product-theme";

type LessonChromeState = {
	layoutMode: LessonLayoutMode;
	coachVisible: boolean;
	activeCoachPanel: "watch" | "transcript" | "examples" | "resources";
};

function getAvailableCoachPanels(
	lesson: LessonConfig,
): LessonChromeState["activeCoachPanel"][] {
	return lesson.coachVideoPlacement === "workbench"
		? ["transcript", "examples", "resources"]
		: ["watch", "transcript", "examples", "resources"];
}

type UnlockedLessonState = {
	accessStatus: "unlocked";
	fieldValues: Record<string, unknown>;
	status: string;
	pinnedArtifacts: PinnedArtifact[];
};

type LockedLessonState = {
	accessStatus: "locked";
};

type CompletionErrorData = {
	code: "INCOMPLETE_LESSON";
	message: string;
	issues?: CompletionIssue[];
};

type CompletionPhase = "idle" | "submitting" | "celebrating";

type CompletionPayload = {
	completedLessonId: string;
	artifactLabel: string;
	nextLessonId: string | null;
	nextLessonLabel: string | null;
};

function getCompletionErrorData(error: unknown): CompletionErrorData | null {
	if (!error || typeof error !== "object" || !("data" in error)) {
		return null;
	}

	const data = (error as { data?: unknown }).data;
	if (!data || typeof data !== "object") {
		return null;
	}

	const candidate = data as Partial<CompletionErrorData>;
	if (candidate.code !== "INCOMPLETE_LESSON") {
		return null;
	}

	return {
		code: "INCOMPLETE_LESSON",
		message:
			typeof candidate.message === "string"
				? candidate.message
				: "Finish the required work before continuing.",
		issues: Array.isArray(candidate.issues)
			? (candidate.issues as CompletionIssue[])
			: [],
	};
}

function getCompletionNavigationDelayMs() {
	if (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		return 250;
	}

	return 900;
}

function getDefaultCoachPanel(
	lesson: LessonConfig,
): LessonChromeState["activeCoachPanel"] {
	const availablePanels = getAvailableCoachPanels(lesson);
	if (
		lesson.panelDefaults.transcript === "open" &&
		availablePanels.includes("transcript")
	) {
		return "transcript";
	}
	if (
		lesson.panelDefaults.examples === "open" &&
		availablePanels.includes("examples")
	) {
		return "examples";
	}
	if (
		lesson.panelDefaults.resources === "open" &&
		availablePanels.includes("resources")
	) {
		return "resources";
	}
	return availablePanels[0] ?? "watch";
}

function getDefaultChromeState(lesson: LessonConfig): LessonChromeState {
	return {
		layoutMode: getDefaultLayoutModeForLesson(lesson),
		coachVisible: lesson.panelDefaults.coach !== "minimized",
		activeCoachPanel: getDefaultCoachPanel(lesson),
	};
}

function getStageUnlockConfig(lesson: LessonConfig) {
	return lesson.briefAssembler?.variant === "stage_unlock"
		? lesson.briefAssembler
		: null;
}

function storageKey(lessonId: string) {
	return `sbs:lesson-ui:${lessonId}`;
}

function isChromeState(value: unknown): value is LessonChromeState {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<LessonChromeState>;
	return (
		(candidate.layoutMode === "split" || candidate.layoutMode === "focus") &&
		typeof candidate.coachVisible === "boolean" &&
		(candidate.activeCoachPanel === "watch" ||
			candidate.activeCoachPanel === "transcript" ||
			candidate.activeCoachPanel === "examples" ||
			candidate.activeCoachPanel === "resources")
	);
}

export function LessonPage({
	initialTheme,
	lessonId,
}: {
	initialTheme: ProductTheme;
	lessonId: string;
}) {
	const lesson = getLesson(lessonId);
	if (!lesson) {
		throw new Error(`Unknown lesson: ${lessonId}`);
	}

	const lessonContent = lesson.content;
	const isWatchLesson = lesson.shell === "watch";
	const router = useRouter();
	const { isAuthenticated, isLoading } = useConvexAuth();
	const fallbackChromeState = useMemo(
		() => getDefaultChromeState(lesson),
		[lesson],
	);
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated && !isLoading ? { lessonId } : "skip",
	) as UnlockedLessonState | LockedLessonState | undefined;
	const markLessonViewed = useMutation(api.course.markLessonViewed);
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const completeLesson = useMutation(api.course.completeLesson);
	const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
	const [fieldValuesReady, setFieldValuesReady] = useState(false);
	const [saveStatus, setSaveStatus] = useState<
		"idle" | "saved" | "saving" | "error"
	>("idle");
	const [completionPhase, setCompletionPhase] =
		useState<CompletionPhase>("idle");
	const [completionPayload, setCompletionPayload] =
		useState<CompletionPayload | null>(null);
	const [serverCompletionIssues, setServerCompletionIssues] = useState<
		CompletionIssue[]
	>([]);
	const [serverCompletionMessage, setServerCompletionMessage] = useState<
		string | null
	>(null);
	const [chromeState, setChromeState] =
		useState<LessonChromeState>(fallbackChromeState);
	const initializedForLessonId = useRef<string | null>(null);
	const lastMarkedLessonId = useRef<string | null>(null);
	const lastSavedSnapshot = useRef("");
	const completionTimeoutRef = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (completionTimeoutRef.current !== null) {
				window.clearTimeout(completionTimeoutRef.current);
			}
		},
		[],
	);

	useEffect(() => {
		setFieldValuesReady(false);
	}, [lessonId]);

	useEffect(() => {
		if (!lessonState || lessonState.accessStatus !== "unlocked") {
			setFieldValuesReady(false);
			return;
		}

		if (initializedForLessonId.current !== lessonId) {
			const nextValues = lessonState.fieldValues ?? {};
			setFieldValues(nextValues);
			initializedForLessonId.current = lessonId;
			lastSavedSnapshot.current = JSON.stringify(nextValues);
			setSaveStatus("idle");
			setFieldValuesReady(true);
			setCompletionPhase("idle");
			setCompletionPayload(null);
			setServerCompletionIssues([]);
			setServerCompletionMessage(null);
			if (completionTimeoutRef.current !== null) {
				window.clearTimeout(completionTimeoutRef.current);
				completionTimeoutRef.current = null;
			}
			return;
		}

		setFieldValuesReady(true);
	}, [lessonId, lessonState]);

	useEffect(() => {
		const defaults = fallbackChromeState;
		const stored = window.localStorage.getItem(storageKey(lessonId));
		if (!stored) {
			setChromeState(defaults);
			return;
		}

		try {
			const parsed = JSON.parse(stored);
			if (!isChromeState(parsed)) {
				setChromeState(defaults);
				return;
			}

			setChromeState({
				...parsed,
				layoutMode: normalizeLayoutModeForLesson(lesson, parsed.layoutMode),
				activeCoachPanel: getAvailableCoachPanels(lesson).includes(
					parsed.activeCoachPanel,
				)
					? parsed.activeCoachPanel
					: defaults.activeCoachPanel,
			});
		} catch {
			setChromeState(defaults);
		}
	}, [fallbackChromeState, lesson, lessonId]);

	useEffect(() => {
		window.localStorage.setItem(
			storageKey(lessonId),
			JSON.stringify(chromeState),
		);
	}, [chromeState, lessonId]);

	useEffect(() => {
		if (
			!lessonState ||
			lessonState.accessStatus !== "unlocked" ||
			initializedForLessonId.current !== lessonId
		) {
			return;
		}

		const snapshot = JSON.stringify(fieldValues);
		if (snapshot === lastSavedSnapshot.current) {
			return;
		}

		setSaveStatus("saving");

		const timeout = window.setTimeout(() => {
			void saveLessonDraft({ lessonId, fieldValues }).then(
				() => {
					lastSavedSnapshot.current = JSON.stringify(fieldValues);
					setSaveStatus("saved");
				},
				() => {
					setSaveStatus("error");
				},
			);
		}, 650);

		return () => window.clearTimeout(timeout);
	}, [fieldValues, lessonId, lessonState, saveLessonDraft]);

	useEffect(() => {
		if (!lessonState || lessonState.accessStatus !== "unlocked") {
			return;
		}

		if (lastMarkedLessonId.current === lessonId) {
			return;
		}

		lastMarkedLessonId.current = lessonId;
		void markLessonViewed({ lessonId });
	}, [lessonId, lessonState, markLessonViewed]);

	const shellProps = {
		initialTheme,
		currentLessonId: lessonId,
		viewportMode: "app" as const,
		layoutMode: chromeState.layoutMode,
		onLayoutModeChange:
			!isWatchLesson && lessonSupportsLayoutToggle(lesson)
				? (layoutMode: LessonChromeState["layoutMode"]) =>
						setChromeState((current) => ({
							...current,
							layoutMode: normalizeLayoutModeForLesson(lesson, layoutMode),
						}))
				: undefined,
		coachVisible:
			!isWatchLesson && chromeState.layoutMode === "split"
				? chromeState.coachVisible
				: false,
		onCoachToggle:
			!isWatchLesson && chromeState.layoutMode === "split"
				? () =>
						setChromeState((current) => ({
							...current,
							coachVisible: !current.coachVisible,
						}))
				: undefined,
		completionCue:
			completionPhase === "celebrating" && completionPayload
				? {
						completedLessonId: completionPayload.completedLessonId,
						nextLessonId: completionPayload.nextLessonId,
					}
				: null,
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
			<ProductShell initialTheme={initialTheme} currentLessonId={lessonId}>
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
							href="/mission"
							className="rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
						>
							Open mission
						</Link>
					</div>
				</section>
			</ProductShell>
		);
	}

	const { pinnedArtifacts } = lessonState;
	const stageUnlockConfig = getStageUnlockConfig(lesson);
	const previousHref = lesson.prevLessonId
		? getLessonHref(lesson.prevLessonId)
		: null;
	const resolvedArtifactPreview = buildResolvedArtifactPreview(
		lesson,
		fieldValues as any,
		pinnedArtifacts as any,
	);
	const objectiveTasks = getObjectiveTasks(lesson, fieldValues as any, {
		pinnedArtifacts: pinnedArtifacts as any,
		resolvedArtifactPreview,
	});
	const completionIssues = getCompletionIssues(lesson, fieldValues as any, {
		pinnedArtifacts: pinnedArtifacts as any,
		resolvedArtifactPreview,
	});
	const completedObjectiveCount = objectiveTasks.filter(
		(task) => task.status === "complete",
	).length;
	const validationVisible =
		serverCompletionIssues.length > 0 || Boolean(serverCompletionMessage);
	const displayedCompletionIssues = validationVisible
		? serverCompletionIssues.length > 0
			? serverCompletionIssues
			: completionIssues
		: [];
	const invalidFieldIds = new Set(
		displayedCompletionIssues
			.filter((issue) => issue.kind === "field")
			.map((issue) => issue.id),
	);
	const invalidFieldMessages = new Map(
		displayedCompletionIssues
			.filter(
				(issue): issue is CompletionIssue & { message: string } =>
					issue.kind === "field" &&
					"message" in issue &&
					typeof issue.message === "string",
			)
			.map((issue) => [issue.id, issue.message]),
	);
	const showCompletionFeedback =
		validationVisible &&
		(displayedCompletionIssues.length > 0 || Boolean(serverCompletionMessage));
	const lessonReadyToComplete =
		completionIssues.length === 0 &&
		(isWatchLesson || objectiveTasks.length > 0) &&
		lessonState.status !== "completed";
	const isCompleting = completionPhase === "submitting";
	const isCelebrating = completionPhase === "celebrating";
	const requiresManualContinuation = lesson.id === "1.1";
	const completionButtonDisabled =
		isCompleting ||
		(isCelebrating && !requiresManualContinuation) ||
		(!isCelebrating && !lessonReadyToComplete);
	const pendingCompletionIssues = completionIssues.map((issue) => issue.label);
	const pendingIssueSummary = pendingCompletionIssues.slice(0, 3).join(" • ");
	const hasMorePendingIssues = pendingCompletionIssues.length > 3;
	const completionNextLine = stageUnlockConfig
		? `Next: ${stageUnlockConfig.nextStepLabel}`
		: lesson.nextStepLabel
			? `Next: ${lesson.nextStepLabel}`
			: completionPayload?.nextLessonLabel
				? `Next unlocked: ${completionPayload.nextLessonLabel}`
				: "Mission updated";
	const completionArtifactLine = stageUnlockConfig
		? `${lesson.artifact.label} locked. Design has a real handoff now.`
		: completionPayload
			? `Artifact locked: ${completionPayload.artifactLabel}`
			: null;
	const readyStateCopy =
		stageUnlockConfig?.readyStateCopy ??
		"Everything on this page is filled out. Complete the lesson.";
	const completionActionLabel =
		stageUnlockConfig?.completionCtaLabel ?? "Complete lesson";
	const completionPendingLabel = stageUnlockConfig
		? "Unlocking..."
		: "Locking in...";
	const celebrationEyebrow =
		stageUnlockConfig?.celebrationEyebrow ?? "System updated";
	const celebrationTitle =
		stageUnlockConfig?.celebrationTitle ?? "Lesson cleared";
	const showCelebrationBanner = isCelebrating && completionPayload;
	const saveStatusMeta =
		saveStatus === "saving"
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
							className: "text-[#a83232]",
						}
					: {
							label: "Draft not changed yet",
							className: "text-product-muted",
						};

	const setValue = (fieldId: string, value: unknown) => {
		if (serverCompletionIssues.length > 0) {
			setServerCompletionIssues([]);
		}
		if (serverCompletionMessage) {
			setServerCompletionMessage(null);
		}

		setFieldValues((current) => ({
			...current,
			[fieldId]: value,
		}));
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

	const navigateToNextStep = (nextLessonId: string | null) => {
		if (nextLessonId) {
			router.push(`/lesson/${nextLessonId}`);
			return;
		}

		router.push("/mission");
	};

	const handleCompleteLesson = () => {
		if (completionButtonDisabled) {
			return;
		}

		setServerCompletionIssues([]);
		setServerCompletionMessage(null);

		if (completionIssues.length > 0) {
			return;
		}

		if (completionTimeoutRef.current !== null) {
			window.clearTimeout(completionTimeoutRef.current);
			completionTimeoutRef.current = null;
		}

		setCompletionPhase("submitting");

		void completeLesson({ lessonId, fieldValues }).then(
			(result: { nextLessonId: string | null }) => {
				const nextLesson = result.nextLessonId
					? getLesson(result.nextLessonId)
					: null;

				setCompletionPayload({
					completedLessonId: lessonId,
					artifactLabel: lesson.artifact.label,
					nextLessonId: result.nextLessonId,
					nextLessonLabel: nextLesson
						? `${nextLesson.id} ${nextLesson.shortTitle}`
						: null,
				});
				setCompletionPhase("celebrating");
				if (requiresManualContinuation) {
					return;
				}
				completionTimeoutRef.current = window.setTimeout(() => {
					completionTimeoutRef.current = null;
					navigateToNextStep(result.nextLessonId);
				}, getCompletionNavigationDelayMs());
			},
			(error: unknown) => {
				setCompletionPhase("idle");
				const completionError = getCompletionErrorData(error);
				if (completionError) {
					setServerCompletionIssues(completionError.issues ?? []);
					setServerCompletionMessage(completionError.message);
					return;
				}

				setSaveStatus("error");
				setServerCompletionMessage(
					"Unable to complete the lesson right now. Try again.",
				);
			},
		);
	};

	const handleCompletionAction = () => {
		if (isCelebrating && requiresManualContinuation && completionPayload) {
			navigateToNextStep(completionPayload.nextLessonId);
			return;
		}

		handleCompleteLesson();
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
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
					{celebrationTitle}
				</>
			) : isCompleting ? (
				completionPendingLabel
			) : isCelebrating && requiresManualContinuation ? (
				completionPayload?.nextLessonLabel ? (
					`Continue to ${completionPayload.nextLessonLabel}`
				) : (
					"Back to mission"
				)
			) : lessonReadyToComplete ? (
				completionActionLabel
			) : (
				"Complete required steps"
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
						<div className="text-xs font-medium leading-relaxed text-[#a83232]">
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
				<div className="text-xs font-medium leading-relaxed text-[#a83232]">
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
		<ProductShell {...shellProps}>
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
					onCoachPanelChange={(activeCoachPanel) =>
						setChromeState((current) => ({
							...current,
							activeCoachPanel,
							coachVisible: true,
						}))
					}
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
					onCoachPanelChange={(activeCoachPanel) =>
						setChromeState((current) => ({
							...current,
							activeCoachPanel,
							coachVisible: true,
						}))
					}
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
	layoutMode: LessonChromeState["layoutMode"];
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
