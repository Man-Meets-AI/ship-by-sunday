"use client";

import type { LessonLayoutMode } from "@/features/course/lesson/model/manifest";
import type { AppShellBlock } from "@/features/course/shared/utils/app-shell-navigation";

import type { AppShellBlockStatus } from "./app-shell-block-status";
import { AppShellHeaderTrailing } from "./app-shell-header-trailing";
import { AppShellMissionRail } from "./app-shell-mission-rail";
import { AppShellMissionRailShadcn } from "./app-shell-mission-rail-shadcn";
import { AppShellWorkspaceNav } from "./app-shell-workspace-nav";

type MissionState = {
	progressCount: number;
	totalLessons: number;
	progressLabel?: string;
	blocks: Array<AppShellBlock & { label: string }>;
};

type AppShellHeaderProps = {
	viewportMode: "document" | "app";
	mission: MissionState | undefined;
	showMissionRail: boolean;
	blockStatuses: Map<string, AppShellBlockStatus>;
	activeBlockId: string | undefined;
	layoutMode: LessonLayoutMode | undefined;
	onLayoutModeChange: ((mode: LessonLayoutMode) => void) | undefined;
	lesson11Viewport?: boolean;
};

export function AppShellHeader({
	viewportMode,
	mission,
	showMissionRail,
	blockStatuses,
	activeBlockId,
	layoutMode,
	onLayoutModeChange,
	lesson11Viewport = false,
}: AppShellHeaderProps) {
	const chromeRowClass =
		viewportMode === "app"
			? "relative mx-auto flex min-h-10 w-full max-w-[1920px] items-center gap-2 px-2 py-2 sm:min-h-11 sm:px-3 lg:gap-3 lg:px-4"
			: "relative flex min-h-10 items-center gap-2 px-3 py-2 sm:min-h-11 lg:gap-3 lg:px-4";

	return (
		<div className={chromeRowClass}>
			<AppShellWorkspaceNav lesson11Viewport={lesson11Viewport} />

			{showMissionRail && mission ? (
				lesson11Viewport ? (
					<AppShellMissionRailShadcn
						blocks={mission.blocks}
						blockStatuses={blockStatuses}
						activeBlockId={activeBlockId}
					/>
				) : (
					<AppShellMissionRail
						blocks={mission.blocks}
						blockStatuses={blockStatuses}
						activeBlockId={activeBlockId}
					/>
				)
			) : null}

			<AppShellHeaderTrailing
				layoutMode={layoutMode}
				onLayoutModeChange={onLayoutModeChange}
				mission={mission}
				lesson11Viewport={lesson11Viewport}
			/>
		</div>
	);
}
