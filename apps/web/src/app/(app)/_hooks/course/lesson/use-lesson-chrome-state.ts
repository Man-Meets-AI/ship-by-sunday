"use client";

import { useEffect, useMemo, useState } from "react";

import {
	getDefaultLayoutModeForLesson,
	type LessonConfig,
	type LessonLayoutMode,
	normalizeLayoutModeForLesson,
} from "@/lib/course/lesson/model/manifest";
import type { CoachPanelKey } from "@/app/(app)/_components/course/lesson/shells";

export type LessonChromeState = {
	layoutMode: LessonLayoutMode;
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
		activeCoachPanel: getDefaultCoachPanel(lesson),
	};
}

function storageKey(lessonKey: string) {
	return `sbs:lesson-ui:${lessonKey}`;
}

function isChromeState(
	value: Partial<LessonChromeState> | null,
): value is LessonChromeState {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Partial<LessonChromeState>;
	return (
		(candidate.layoutMode === "split" || candidate.layoutMode === "focus") &&
		(candidate.activeCoachPanel === "watch" ||
			candidate.activeCoachPanel === "transcript" ||
			candidate.activeCoachPanel === "examples" ||
			candidate.activeCoachPanel === "resources")
	);
}

export function useLessonChromeState({
	lesson,
	lessonKey,
}: {
	lesson: LessonConfig;
	lessonKey: string;
}) {
	const fallbackChromeState = useMemo(
		() => getDefaultChromeState(lesson),
		[lesson],
	);
	const [chromeState, setChromeState] =
		useState<LessonChromeState>(fallbackChromeState);

	useEffect(() => {
		const defaults = fallbackChromeState;
		const stored = window.localStorage.getItem(storageKey(lessonKey));
		if (!stored) {
			setChromeState(defaults);
			return;
		}

		try {
			const parsed = JSON.parse(stored) as Partial<LessonChromeState> | null;
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
	}, [fallbackChromeState, lesson, lessonKey]);

	useEffect(() => {
		window.localStorage.setItem(
			storageKey(lessonKey),
			JSON.stringify(chromeState),
		);
	}, [chromeState, lessonKey]);

	return {
		chromeState,
		setLayoutMode: (layoutMode: LessonLayoutMode) => {
			setChromeState((current) => ({
				...current,
				layoutMode: normalizeLayoutModeForLesson(lesson, layoutMode),
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
			}));
		},
	};
}
