import type { ReactNode } from "react";
import type {
	BlueprintStageId,
	BlueprintStageStatus,
} from "@shipbysunday/blueprint-compiler";

import type { LessonLayoutMode } from "@/features/course/lesson/model/manifest";
import type { SkillRailCompletionCue } from "@/features/course/shared/components/skill-rail";
import type {
	WorkspacePrimaryNavActionId,
	WorkspacePrimaryNavItem,
} from "@/features/workspace-navigation/lib/build-primary-nav-model";

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
	currentBlueprintStageId?: BlueprintStageId;
	stageStatuses: BlueprintStageStatus[];
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
			kind: "blueprint";
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
