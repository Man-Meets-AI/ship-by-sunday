import type { ReactNode } from "react";

import type { LessonLayoutMode } from "@/features/course/lesson/model/manifest";
import type { SkillRailCompletionCue } from "@/features/course/shared/components/skill-rail";

export type AppShellMissionState = {
	progressCount: number;
	totalLessons: number;
	blocks: Array<{
		id: string;
		label: string;
		order: number;
		completedCount: number;
		totalLessons: number;
		lessons: Array<{
			lessonKey: string;
			id: string;
			displayLabel: string;
			title: string;
			shortTitle: string;
			status: "available" | "completed" | "in_progress" | "locked";
			artifactLabel: string;
			isImplemented: boolean;
		}>;
	}>;
};

export type AppShellViewerAccessState = {
	hasAccess: boolean;
	status: string;
};

export type AppShellProps = {
	children: ReactNode;
	title?: string;
	subtitle?: string;
	currentLessonId?: string;
	currentBlockId?: string;
	mission?: AppShellMissionState;
	showSkillRail?: boolean;
	layoutMode?: LessonLayoutMode;
	onLayoutModeChange?: (mode: LessonLayoutMode) => void;
	viewportMode?: "document" | "app";
	appScrollMode?: "viewport" | "page";
	completionCue?: SkillRailCompletionCue | null;
	enableMissionQuery?: boolean;
};
