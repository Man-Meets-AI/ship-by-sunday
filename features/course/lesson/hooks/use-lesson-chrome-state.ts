"use client";

import { useEffect, useMemo, useState } from "react";

import {
	getDefaultLayoutModeForLesson,
	normalizeLayoutModeForLesson,
	type LessonConfig,
	type LessonLayoutMode,
} from "@/features/course/lesson/model/manifest";
import type { CoachPanelKey } from "@/features/course/lesson/shells";

export type LessonChromeState = {
	layoutMode: LessonLayoutMode;
	coachVisible: boolean;
	activeCoachPanel: CoachPanelKey;
};

function getAvailableCoachPanels(lesson: LessonConfig): CoachPanelKey[] {
	return lesson.coachVideoPlacement === "workbench"
		? ["transcript", "examples", "resources"]
		: ["watch", "transcript", "examples", "resources"];
}

function getDefaultCoachPanel(lesson: LessonConfig): CoachPanelKey {
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

export function useLessonChromeState({
	lesson,
	lessonId,
}: {
	lesson: LessonConfig;
	lessonId: string;
}) {
	const fallbackChromeState = useMemo(
		() => getDefaultChromeState(lesson),
		[lesson],
	);
	const [chromeState, setChromeState] =
		useState<LessonChromeState>(fallbackChromeState);

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

	return {
		chromeState,
		setLayoutMode: (layoutMode: LessonLayoutMode) => {
			setChromeState((current) => ({
				...current,
				layoutMode: normalizeLayoutModeForLesson(lesson, layoutMode),
			}));
		},
		toggleCoach: () => {
			setChromeState((current) => ({
				...current,
				coachVisible: !current.coachVisible,
			}));
		},
		setActiveCoachPanel: (activeCoachPanel: CoachPanelKey) => {
			setChromeState((current) => ({
				...current,
				activeCoachPanel: getAvailableCoachPanels(lesson).includes(
					activeCoachPanel,
				)
					? activeCoachPanel
					: current.activeCoachPanel,
				coachVisible: true,
			}));
		},
	};
}
