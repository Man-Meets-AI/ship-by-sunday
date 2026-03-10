"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import {
	getLessonHref,
	type ChecklistItemValue,
	type LessonConfig,
} from "@/app/lessonRegistry";
import type { LessonContent } from "@/content/lessons/types";
import { api } from "@/convex/_generated/api";
import { WorkbenchRenderer } from "@/components/lesson-workbench";
import {
	LessonShellFocus,
	LessonShellSplit,
	type PinnedArtifact,
} from "@/components/lesson-shells";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";
import { isChecklistItemArray } from "@/lib/course/registry";

const OBJECTIVE_CHECKLIST_FIELD_ID = "__objectiveChecklist";

type LessonChromeState = {
	layoutMode: "split" | "focus";
	objectiveCollapsed: boolean;
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

function getDefaultCoachPanel(lesson: LessonConfig): LessonChromeState["activeCoachPanel"] {
	if (lesson.panelDefaults.transcript === "open") return "transcript";
	if (lesson.panelDefaults.examples === "open") return "examples";
	if (lesson.panelDefaults.resources === "open") return "resources";
	return "watch";
}

function getDefaultChromeState(lesson: LessonConfig): LessonChromeState {
	return {
		layoutMode: lesson.shell === "focus" ? "focus" : "split",
		objectiveCollapsed: lesson.panelDefaults.objective === "collapsed",
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
		typeof candidate.objectiveCollapsed === "boolean" &&
		typeof candidate.coachVisible === "boolean" &&
		(candidate.activeCoachPanel === "watch" ||
			candidate.activeCoachPanel === "transcript" ||
			candidate.activeCoachPanel === "examples" ||
			candidate.activeCoachPanel === "resources")
	);
}

export function LessonPage({
	lessonId,
	lessonContent,
}: {
	lessonId: string;
	lessonContent: LessonContent;
}) {
	const router = useRouter();
	const { isAuthenticated } = useConvexAuth();
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated ? { lessonId } : "skip",
	) as LessonState | LockedLessonState | undefined;
	const markLessonViewed = useMutation(api.course.markLessonViewed);
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const completeLesson = useMutation(api.course.completeLesson);
	const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "saving" | "error">(
		"idle",
	);
	const [chromeState, setChromeState] = useState<LessonChromeState | null>(null);
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
		}
	}, [lessonId, lessonState]);

	useEffect(() => {
		if (!lessonState || lessonState.accessStatus !== "unlocked") {
			return;
		}

		const defaults = getDefaultChromeState(lessonState.lesson);
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
	}, [lessonId, lessonState]);

	useEffect(() => {
		if (!chromeState) {
			return;
		}

		window.localStorage.setItem(storageKey(lessonId), JSON.stringify(chromeState));
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

	if (lessonState === undefined) {
		return (
			<ProductShell currentLessonId={lessonId}>
				<ViewerGate>
					<section className="rounded-none border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Loading lesson
						</p>
						<p className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-product-text">
							Loading
						</p>
					</section>
				</ViewerGate>
			</ProductShell>
		);
	}

	if (lessonState.accessStatus === "locked") {
		return (
			<ProductShell currentLessonId={lessonId}>
				<ViewerGate>
					<section className="rounded-none border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Lesson locked
						</p>
						<p className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-product-text">
							{lessonState.lessonId} {lessonState.shortTitle}
						</p>
						<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted sm:mx-auto">
							This lesson is locked. Go back to the mission map and finish{" "}
							{lessonState.requiredLessonId ?? "the previous unlocked lesson"} first.
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
				</ViewerGate>
			</ProductShell>
		);
	}

	if (chromeState === null) {
		return (
			<ProductShell currentLessonId={lessonId}>
				<ViewerGate>
					<section className="rounded-none border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Loading lesson
						</p>
						<p className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-product-text">
							Loading
						</p>
					</section>
				</ViewerGate>
			</ProductShell>
		);
	}

	const { lesson, pinnedArtifacts } = lessonState;
	const previousHref = lesson.prevLessonId ? getLessonHref(lesson.prevLessonId) : null;
	const objectiveChecklistItems = normalizeObjectiveChecklist(
		lesson.checklist,
		fieldValues[OBJECTIVE_CHECKLIST_FIELD_ID],
	);

	const setValue = (fieldId: string, value: unknown) => {
		setFieldValues((current) => ({
			...current,
			[fieldId]: value,
		}));
	};

	const footer = (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="text-sm font-medium text-product-muted">
				Status: {lessonState.status.replace("_", " ")}. Autosave:{" "}
				{saveStatus === "idle" ? "ready" : saveStatus}.
			</div>
			<div className="flex flex-wrap gap-3">
				{previousHref ? (
					<Link
						href={previousHref}
						className="rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
					>
						Back
					</Link>
				) : null}
				<button
					type="button"
					onClick={() => {
						setSaveStatus("saving");
						void saveLessonDraft({ lessonId, fieldValues }).then(
							() => {
								lastSavedSnapshot.current = JSON.stringify(fieldValues);
								setSaveStatus("saved");
							},
							() => {
								setSaveStatus("error");
							},
						);
					}}
					className="rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
				>
					Save draft
				</button>
				<button
					type="button"
					onClick={() => {
						void completeLesson({ lessonId, fieldValues }).then(
							(result: { nextLessonId: string | null }) => {
								if (result.nextLessonId) {
									router.push(`/lesson/${result.nextLessonId}`);
									return;
								}

								router.push("/mission");
							},
							() => {
								setSaveStatus("error");
							},
						);
					}}
					className="rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
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
		/>
	);

	return (
		<ProductShell
			currentLessonId={lessonId}
			viewportMode="app"
			layoutMode={chromeState.layoutMode}
			onLayoutModeChange={(layoutMode) =>
				setChromeState((current) =>
					current ? { ...current, layoutMode } : current,
				)
			}
			coachVisible={chromeState.coachVisible}
			onCoachToggle={() =>
				setChromeState((current) =>
					current
						? {
								...current,
								coachVisible: !current.coachVisible,
						  }
						: current,
				)
			}
		>
			<ViewerGate>
				{chromeState.layoutMode === "focus" ? (
					<LessonShellFocus
						lesson={lesson}
						objectiveCollapsed={chromeState.objectiveCollapsed}
						onToggleObjective={() =>
							setChromeState((current) =>
								current
									? {
											...current,
											objectiveCollapsed: !current.objectiveCollapsed,
									  }
									: current,
							)
						}
						coachVisible={chromeState.coachVisible}
						activeCoachPanel={chromeState.activeCoachPanel}
						onCoachPanelChange={(activeCoachPanel) =>
							setChromeState((current) =>
								current
									? {
											...current,
											activeCoachPanel,
											coachVisible: true,
									  }
									: current,
							)
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
						objectiveCollapsed={chromeState.objectiveCollapsed}
						onToggleObjective={() =>
							setChromeState((current) =>
								current
									? {
											...current,
											objectiveCollapsed: !current.objectiveCollapsed,
									  }
									: current,
							)
						}
						coachVisible={chromeState.coachVisible}
						activeCoachPanel={chromeState.activeCoachPanel}
						onCoachPanelChange={(activeCoachPanel) =>
							setChromeState((current) =>
								current
									? {
											...current,
											activeCoachPanel,
											coachVisible: true,
									  }
									: current,
							)
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
			</ViewerGate>
		</ProductShell>
	);
}
