"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import type { LessonConfig } from "@/app/lessonRegistry";
import { api } from "@/convex/_generated/api";
import { WorkbenchRenderer } from "@/components/lesson-workbench";
import {
	LessonShellFocus,
	LessonShellSplit,
	type PinnedArtifact,
} from "@/components/lesson-shells";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

type LessonChromeState = {
	layoutMode: "split" | "focus";
	objectiveCollapsed: boolean;
	coachVisible: boolean;
	activeCoachPanel: "watch" | "transcript" | "examples" | "resources";
};

type LessonState = {
	lesson: LessonConfig;
	fieldValues: Record<string, unknown>;
	status: string;
	pinnedArtifacts: PinnedArtifact[];
	isImplemented: boolean;
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
}: {
	lessonId: string;
}) {
	const router = useRouter();
	const { isAuthenticated } = useConvexAuth();
	const lessonState = useQuery(
		api.course.getLessonState,
		isAuthenticated ? { lessonId } : "skip",
	) as LessonState | undefined;
	const saveLessonDraft = useMutation(api.course.saveLessonDraft);
	const completeLesson = useMutation(api.course.completeLesson);
	const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "saving" | "error">(
		"idle",
	);
	const [chromeState, setChromeState] = useState<LessonChromeState | null>(null);
	const initializedForLessonId = useRef<string | null>(null);
	const lastSavedSnapshot = useRef("");

	useEffect(() => {
		if (!lessonState) {
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
		if (!lessonState) {
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
		if (!lessonState || initializedForLessonId.current !== lessonId) {
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

	if (lessonState === undefined || chromeState === null) {
		return (
			<ProductShell currentLessonId={lessonId}>
				<ViewerGate>
					<section className="rounded-[26px] border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
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
				{lesson.prevLessonId ? (
					<Link
						href={`/lesson/${lesson.prevLessonId}`}
						className="rounded-full border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
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
					className="rounded-full border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
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
					className="rounded-full border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
				>
					Complete lesson
				</button>
			</div>
		</div>
	);

	const workbench = (
		<WorkbenchRenderer
			lesson={lesson}
			fieldValues={fieldValues}
			onFieldChange={setValue}
			pinnedArtifacts={pinnedArtifacts}
		/>
	);

	return (
		<ProductShell
			currentLessonId={lessonId}
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
						pinnedArtifacts={pinnedArtifacts}
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
						pinnedArtifacts={pinnedArtifacts}
						footer={footer}
					>
						{workbench}
					</LessonShellSplit>
				)}
			</ViewerGate>
		</ProductShell>
	);
}
