import type { ReactNode } from "react";
import type {
	CodebaseStageId,
	CodebaseStageStatus,
} from "@shipbysunday/codebase-compiler";

import type { LessonLayoutMode } from "@/lib/course/lesson/model/manifest";
import type { SkillRailCompletionCue } from "@/app/(protected)/_components/course/shared/components/skill-rail-shared";
import type {
	WorkspacePrimaryNavActionId,
	WorkspacePrimaryNavItem,
} from "@/lib/workspace-navigation/build-primary-nav-model";

export type AppShellMissionState = {
	progressCount: number;
	totalLessons: number;
	progressLabel?: string;
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

export type AppShellProgressSummary = {
	progressCount: number;
	totalLessons: number;
	progressLabel?: string;
};

export type AppShellPrimaryNav = {
	kind: "combined";
	currentCodebaseStageId?: CodebaseStageId;
	stageStatuses: CodebaseStageStatus[];
	postReviewItems: WorkspacePrimaryNavItem[];
	onLinkNavigate?: (
		event: { preventDefault: () => void },
		href: string,
	) => void;
	onNavigate?: (href: string) => void;
	onAction?: (actionId: WorkspacePrimaryNavActionId) => void;
};

export type AppShellLocalNav =
	| {
			kind: "codebase";
			desktop: ReactNode;
			compact?: ReactNode;
	  }
	| {
			kind: "review";
			desktop: ReactNode;
			compact?: ReactNode;
	  }
	| {
			kind: "workspace";
			desktop: ReactNode;
			compact?: ReactNode;
	  };

export type AppShellProps = {
	children: ReactNode;
	title?: string;
	subtitle?: string;
	currentLessonId?: string;
	currentBlockId?: string;
	mission?: AppShellMissionState;
	progressSummary?: AppShellProgressSummary;
	primaryNav?: AppShellPrimaryNav;
	localNav?: AppShellLocalNav;
	showSkillRail?: boolean;
	layoutMode?: LessonLayoutMode;
	onLayoutModeChange?: (mode: LessonLayoutMode) => void;
	viewportMode?: "document" | "app";
	appScrollMode?: "viewport" | "page";
	completionCue?: SkillRailCompletionCue | null;
};
