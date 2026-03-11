"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import {
	getLesson,
	getLessonHref,
	type ChecklistItemValue,
	type LessonConfig,
} from "@/lib/course/manifest";
import type { LessonContent } from "@/content/lessons/types";
import { api } from "@/convex/_generated/api";
import { WorkbenchRenderer } from "@/components/lesson-workbench";
import {
	LessonShellFocus,
	LessonShellSplit,
	type PinnedArtifact,
} from "@/components/lesson-shells";
import { ProductShell } from "@/components/product-shell";
import {
	getCompletionIssues,
	isChecklistItemArray,
	OBJECTIVE_CHECKLIST_FIELD_ID,
	type CompletionIssue,
} from "@/lib/course/registry";
import type { ProductTheme } from "@/lib/product-theme";

type LessonChromeState = {
	layoutMode: "split" | "focus";
	coachVisible: boolean;
	activeCoachPanel: "watch" | "transcript" | "examples" | "resources";
};

type LessonState = {
	accessStatus: "unlocked";
	lesson: LessonConfig;
	fieldValues: Record<string, unknown>;
	status: string;
	pinnedArtifacts: PinnedArtifact[];
	isImplemented: boolean;
};

type LockedLessonState = {
	accessStatus: "locked";
	lessonId: string;
	title: string;
	shortTitle: string;
	requiredLessonId: string | null;
};

type CompletionErrorData = {
	code: "INCOMPLETE_LESSON";
	message: string;
	issues?: CompletionIssue[];
};

const FALLBACK_CHROME_STATE: LessonChromeState = {
	layoutMode: "split",
	coachVisible: true,
	activeCoachPanel: "watch",
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

function getDefaultCoachPanel(
	lesson: LessonConfig,
): LessonChromeState["activeCoachPanel"] {
	if (lesson.panelDefaults.transcript === "open") return "transcript";
	if (lesson.panelDefaults.examples === "open") return "examples";
	if (lesson.panelDefaults.resources === "open") return "resources";
	return "watch";
}

function getDefaultChromeState(lesson: LessonConfig): LessonChromeState {
	return {
		layoutMode: lesson.shell === "focus" ? "focus" : "split",
		coachVisible: lesson.panelDefaults.coach !== "minimized",
		activeCoachPanel: getDefaultCoachPanel(lesson),
	};
}

function storageKey(lessonId: string) {
	return `sbs:lesson-ui:${lessonId}`;
}

function normalizeObjectiveChecklist(
	checklist: string[],
	value: unknown,
): ChecklistItemValue[] {
	if (isChecklistItemArray(value)) {
		return checklist.map((item) => {
			const existing = value.find((entry) => entry.label === item);
			return {
				label: item,
				checked: existing?.checked ?? false,
			};
		});
	}

	return checklist.map((item) => ({
		label: item,
		checked: false,
	}));
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
	lessonContent,
}: {
	initialTheme: ProductTheme;
	lessonId: string;
	lessonContent: LessonContent;
}) {
	const router = useRouter();
	const { isAuthenticated } = useConvexAuth();
	const manifestLesson = getLesson(lessonId);
	const fallbackChromeState = useMemo(
		() =>
			manifestLesson
				? getDefaultChromeState(manifestLesson)
				: FALLBACK_CHROME_STATE,
		[manifestLesson],
	);
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated ? { lessonId } : "skip",
	) as LessonState | LockedLessonState | undefined;
	const markLessonViewed = useMutation(api.course.markLessonViewed);
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const completeLesson = useMutation(api.course.completeLesson);
	const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
	const [saveStatus, setSaveStatus] = useState<
		"idle" | "saved" | "saving" | "error"
	>("idle");
	const [completionAttempted, setCompletionAttempted] = useState(false);
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

	useEffect(() => {
		if (!lessonState || lessonState.accessStatus !== "unlocked") {
			return;
		}

		if (initializedForLessonId.current !== lessonId) {
			const nextValues = lessonState.fieldValues ?? {};
			setFieldValues(nextValues);
			initializedForLessonId.current = lessonId;
			lastSavedSnapshot.current = JSON.stringify(nextValues);
			setSaveStatus("idle");
			setCompletionAttempted(false);
			setServerCompletionIssues([]);
			setServerCompletionMessage(null);
		}
	}, [lessonId, lessonState]);

	useEffect(() => {
		const defaults =
			lessonState && lessonState.accessStatus === "unlocked"
				? getDefaultChromeState(lessonState.lesson)
				: fallbackChromeState;
		const stored = window.localStorage.getItem(storageKey(lessonId));
		if (!stored) {
			setChromeState(defaults);
			return;
		}

		try {
			const parsed = JSON.parse(stored);
			setChromeState(isChromeState(parsed) ? parsed : defaults);
		} catch {
			setChromeState(defaults);
		}
	}, [fallbackChromeState, lessonId, lessonState]);

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
		onLayoutModeChange: (layoutMode: LessonChromeState["layoutMode"]) =>
			setChromeState((current) => ({
				...current,
				layoutMode,
			})),
		coachVisible:
			chromeState.layoutMode === "split" ? chromeState.coachVisible : false,
		onCoachToggle:
			chromeState.layoutMode === "split"
				? () =>
						setChromeState((current) => ({
							...current,
							coachVisible: !current.coachVisible,
						}))
				: undefined,
	};

	if (lessonState === undefined) {
		return (
			<ProductShell {...shellProps}>
				<LessonSkeleton layoutMode={chromeState.layoutMode} />
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
						{lessonState.lessonId} {lessonState.shortTitle}
					</p>
					<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted sm:mx-auto">
						This lesson is locked. Go back to the mission map and finish{" "}
						{lessonState.requiredLessonId ?? "the previous unlocked lesson"}{" "}
						first.
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

	const { lesson, pinnedArtifacts } = lessonState;
	const previousHref = lesson.prevLessonId
		? getLessonHref(lesson.prevLessonId)
		: null;
	const objectiveChecklistItems = normalizeObjectiveChecklist(
		lesson.checklist,
		fieldValues[OBJECTIVE_CHECKLIST_FIELD_ID],
	);
	const completionIssues = getCompletionIssues(lesson, fieldValues as any);
	const validationVisible =
		completionAttempted ||
		serverCompletionIssues.length > 0 ||
		Boolean(serverCompletionMessage);
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
	const showCompletionFeedback =
		validationVisible &&
		(displayedCompletionIssues.length > 0 || Boolean(serverCompletionMessage));

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

	const footer = (
		<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
			{showCompletionFeedback ? (
				<div className="max-w-2xl text-xs font-medium leading-relaxed text-[#a83232]">
					<p>{serverCompletionMessage ?? "Finish these before continuing:"}</p>
					{displayedCompletionIssues.length > 0 ? (
						<p className="mt-1">
							{displayedCompletionIssues
								.map((issue) => issue.label)
								.join(" • ")}
						</p>
					) : null}
				</div>
			) : null}
			<div className="flex flex-wrap justify-end gap-2 lg:ml-auto">
				{previousHref ? (
					<Link
						href={previousHref}
						className="inline-flex items-center px-1 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted transition-colors hover:text-product-text"
					>
						Back
					</Link>
				) : null}
				<button
					type="button"
					onClick={() => {
						setCompletionAttempted(true);
						setServerCompletionIssues([]);
						setServerCompletionMessage(null);

						if (completionIssues.length > 0) {
							return;
						}

						void completeLesson({ lessonId, fieldValues }).then(
							(result: { nextLessonId: string | null }) => {
								setCompletionAttempted(false);
								if (result.nextLessonId) {
									router.push(`/lesson/${result.nextLessonId}`);
									return;
								}

								router.push("/mission");
							},
							(error: unknown) => {
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
					}}
					className="rounded-none border border-product-accent bg-product-chip px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
				>
					Complete lesson
				</button>
			</div>
		</div>
	);

	const workbench = (
		<WorkbenchRenderer
			lesson={lesson}
			lessonContent={lessonContent}
			fieldValues={fieldValues}
			onFieldChange={setValue}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
		/>
	);

	return (
		<ProductShell {...shellProps}>
			{chromeState.layoutMode === "focus" ? (
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
					objectiveChecklistItems={objectiveChecklistItems}
					onObjectiveChecklistToggle={(index, checked) => {
						const nextItems = objectiveChecklistItems.map((item, itemIndex) =>
							itemIndex === index ? { ...item, checked } : item,
						);
						setValue(OBJECTIVE_CHECKLIST_FIELD_ID, nextItems);
					}}
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
					objectiveChecklistItems={objectiveChecklistItems}
					onObjectiveChecklistToggle={(index, checked) => {
						const nextItems = objectiveChecklistItems.map((item, itemIndex) =>
							itemIndex === index ? { ...item, checked } : item,
						);
						setValue(OBJECTIVE_CHECKLIST_FIELD_ID, nextItems);
					}}
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
	layoutMode,
}: {
	layoutMode: LessonChromeState["layoutMode"];
}) {
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
