"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { timingConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	getLessonByKey,
	type LessonConfig,
} from "@/features/course/lesson/model/manifest";
import {
	formatHandoffLabelForLesson,
	getNextLessonHandoffLabel,
} from "@/features/course/lesson/model/next-lesson-handoff";
import type {
	CompletionIssue,
	PersistedFieldValues,
} from "@/features/course/lesson/model/registry";
import { getLessonHref } from "@/features/course/lesson/routing/lesson-routes";
import { getLessonMapHref } from "@/features/workspace-navigation/lib/lesson-map-href";

type CompletionErrorData = {
	code: "INCOMPLETE_LESSON";
	message: string;
	issues?: CompletionIssue[];
};

type CompletionPhase = "idle" | "submitting" | "celebrating";

type CompletionPayload = {
	completedLessonId: string;
	artifactLabel: string;
	nextLessonKey: string | null;
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
		return timingConfig.lessonCompletionReducedMotionNavigateMs;
	}

	return timingConfig.lessonCompletionNavigateMs;
}

export function getCompletionButtonLabel({
	isCelebrating,
	isCompleting,
	requiresManualContinuation,
	completionPayload,
	lessonReadyToComplete,
	completionActionLabel,
	completionPendingLabel,
	celebrationShortLabel,
	nextHandoffLabel,
}: {
	isCelebrating: boolean;
	isCompleting: boolean;
	requiresManualContinuation: boolean;
	completionPayload: CompletionPayload | null;
	lessonReadyToComplete: boolean;
	completionActionLabel: string;
	completionPendingLabel: string;
	celebrationShortLabel: string;
	nextHandoffLabel: string | null;
}) {
	if (isCompleting) {
		return completionPendingLabel;
	}
	if (isCelebrating && requiresManualContinuation) {
		return completionPayload?.nextLessonLabel
			? `Continue to ${completionPayload.nextLessonLabel}`
			: "Back to mission";
	}
	if (isCelebrating) {
		return celebrationShortLabel;
	}
	if (lessonReadyToComplete) {
		return completionActionLabel;
	}
	return nextHandoffLabel
		? `Continue to ${nextHandoffLabel}`
		: "Complete required steps";
}

function getStageUnlockConfig(lesson: LessonConfig) {
	return lesson.briefAssembler?.variant === "stage_unlock"
		? lesson.briefAssembler
		: null;
}

export function useLessonCompletion({
	lessonKey,
	lesson,
	fieldValues,
	completionIssues,
	objectiveTaskCount,
	isWatchLesson,
	lessonStatus,
	onUnexpectedSaveError,
}: {
	lessonKey: string;
	lesson: LessonConfig;
	fieldValues: PersistedFieldValues;
	completionIssues: CompletionIssue[];
	objectiveTaskCount: number;
	isWatchLesson: boolean;
	lessonStatus: string;
	onUnexpectedSaveError: () => void;
}) {
	const router = useRouter();
	const completeLesson = useMutation(api.course.completeLesson);
	const stageUnlockConfig = getStageUnlockConfig(lesson);
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
	const completionTimeoutRef = useRef<number | null>(null);
	const activeLessonKeyRef = useRef(lessonKey);

	useEffect(
		() => () => {
			if (completionTimeoutRef.current !== null) {
				window.clearTimeout(completionTimeoutRef.current);
			}
		},
		[],
	);

	useEffect(() => {
		if (activeLessonKeyRef.current === lessonKey) {
			return;
		}

		activeLessonKeyRef.current = lessonKey;
		setCompletionPhase("idle");
		setCompletionPayload(null);
		setServerCompletionIssues([]);
		setServerCompletionMessage(null);
		if (completionTimeoutRef.current !== null) {
			window.clearTimeout(completionTimeoutRef.current);
			completionTimeoutRef.current = null;
		}
	}, [lessonKey]);

	const displayedCompletionIssues = useMemo(() => {
		if (serverCompletionIssues.length === 0 && !serverCompletionMessage) {
			return [];
		}
		return serverCompletionIssues.length > 0
			? serverCompletionIssues
			: completionIssues;
	}, [completionIssues, serverCompletionIssues, serverCompletionMessage]);
	const invalidFieldIds = useMemo(
		() =>
			new Set(
				displayedCompletionIssues
					.filter((issue) => issue.kind === "field")
					.map((issue) => issue.id),
			),
		[displayedCompletionIssues],
	);
	const invalidFieldMessages = useMemo(
		() =>
			new Map(
				displayedCompletionIssues
					.filter(
						(issue): issue is CompletionIssue & { message: string } =>
							issue.kind === "field" &&
							"message" in issue &&
							typeof issue.message === "string",
					)
					.map((issue) => [issue.id, issue.message]),
			),
		[displayedCompletionIssues],
	);
	const nextHandoffLabel = useMemo(
		() => getNextLessonHandoffLabel(lesson),
		[lesson],
	);
	const lessonReadyToComplete =
		completionIssues.length === 0 &&
		(isWatchLesson || objectiveTaskCount > 0) &&
		lessonStatus !== "completed";
	const isCompleting = completionPhase === "submitting";
	const isCelebrating = completionPhase === "celebrating";
	const requiresManualContinuation = lesson.id === "1.3";
	const completionButtonDisabled =
		isCompleting ||
		(isCelebrating && !requiresManualContinuation) ||
		(!isCelebrating && !lessonReadyToComplete);
	const pendingCompletionIssues = completionIssues.map((issue) => issue.label);
	const pendingIssueSummary = pendingCompletionIssues.slice(0, 3).join(" • ");
	const completionNextLine = stageUnlockConfig
		? `Next: ${stageUnlockConfig.nextStepLabel}`
		: lesson.nextStepLabel
			? `Next: ${lesson.nextStepLabel}`
			: completionPayload?.nextLessonLabel
				? `Next unlocked: ${completionPayload.nextLessonLabel}`
				: "Lesson Map updated";
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
	const celebrationShortLabel = stageUnlockConfig
		? "Unlocked"
		: "Lesson complete";

	const navigateToNextStep = (nextLessonKey: string | null) => {
		router.push(
			nextLessonKey ? getLessonHref(nextLessonKey) : getLessonMapHref(),
		);
	};

	return {
		completionPayload,
		completionCue:
			completionPhase === "celebrating" && completionPayload
				? {
						completedLessonId: completionPayload.completedLessonId,
						nextLessonId: completionPayload.nextLessonKey,
					}
				: null,
		displayedCompletionIssues,
		invalidFieldIds,
		invalidFieldMessages,
		serverCompletionMessage,
		showCompletionFeedback:
			displayedCompletionIssues.length > 0 || Boolean(serverCompletionMessage),
		lessonReadyToComplete,
		isCompleting,
		isCelebrating,
		completionButtonDisabled,
		pendingIssueSummary,
		hasMorePendingIssues: pendingCompletionIssues.length > 3,
		completionNextLine,
		completionArtifactLine,
		readyStateCopy,
		completionActionLabel,
		completionPendingLabel,
		celebrationEyebrow,
		celebrationTitle,
		showCelebrationBanner: isCelebrating && completionPayload !== null,
		completionButtonLabel: getCompletionButtonLabel({
			isCelebrating,
			isCompleting,
			requiresManualContinuation,
			completionPayload,
			lessonReadyToComplete,
			completionActionLabel,
			completionPendingLabel,
			celebrationShortLabel,
			nextHandoffLabel,
		}),
		clearCompletionFeedback: () => {
			if (serverCompletionIssues.length > 0) {
				setServerCompletionIssues([]);
			}
			if (serverCompletionMessage) {
				setServerCompletionMessage(null);
			}
		},
		handleCompletionAction: () => {
			if (isCelebrating && requiresManualContinuation && completionPayload) {
				navigateToNextStep(completionPayload.nextLessonKey);
				return;
			}
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
			void completeLesson({ lessonKey, fieldValues }).then(
				(result: { nextLessonKey: string | null }) => {
					const nextLesson = result.nextLessonKey
						? getLessonByKey(result.nextLessonKey)
						: null;

					setCompletionPayload({
						completedLessonId: lesson.lessonKey,
						artifactLabel: lesson.artifact.label,
						nextLessonKey: result.nextLessonKey,
						nextLessonLabel: nextLesson
							? formatHandoffLabelForLesson(nextLesson)
							: null,
					});
					setCompletionPhase("celebrating");
					if (requiresManualContinuation) {
						return;
					}

					completionTimeoutRef.current = window.setTimeout(() => {
						completionTimeoutRef.current = null;
						navigateToNextStep(result.nextLessonKey);
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

					onUnexpectedSaveError();
					setServerCompletionMessage(
						"Unable to complete the lesson right now. Try again.",
					);
				},
			);
		},
	};
}
