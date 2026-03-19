"use client";

import { Columns2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { LessonLayoutMode } from "@/features/course/lesson/model/manifest";

import { AppShellUserMenu } from "./app-shell-user-menu";
import {
	AppShellFocusViewIcon,
	AppShellSplitViewIcon,
} from "./app-shell-header-icons";

type MissionProgress = {
	progressCount: number;
	totalLessons: number;
};

type AppShellHeaderTrailingProps = {
	layoutMode: LessonLayoutMode | undefined;
	onLayoutModeChange: ((mode: LessonLayoutMode) => void) | undefined;
	mission: MissionProgress | undefined;
	lesson11Viewport?: boolean;
};

export function AppShellHeaderTrailing({
	layoutMode,
	onLayoutModeChange,
	mission,
	lesson11Viewport = false,
}: AppShellHeaderTrailingProps) {
	const progressLabel = mission
		? `${mission.progressCount} of ${mission.totalLessons} lessons completed`
		: "Progress unavailable";

	return (
		<div className="flex shrink-0 items-center gap-1 border-l border-border/50 pl-2 sm:gap-1.5 sm:pl-3">
			{onLayoutModeChange ? (
				<Card className="flex-row gap-0 border border-border/60 bg-muted/20 p-0.5 shadow-none dark:bg-muted/15">
					<Button
						type="button"
						title="Split view — coach and workbench side by side"
						aria-label="Switch to split view"
						aria-pressed={layoutMode === "split"}
						onClick={() => onLayoutModeChange("split")}
						variant={layoutMode === "split" ? "secondary" : "ghost"}
						size="icon"
						className="size-7 rounded-md sm:size-8"
					>
						{lesson11Viewport ? (
							<Columns2 className="size-3.5" aria-hidden />
						) : (
							<AppShellSplitViewIcon />
						)}
					</Button>
					<Button
						type="button"
						title="Focus view — full-width workbench"
						aria-label="Switch to focus view"
						aria-pressed={layoutMode === "focus"}
						onClick={() => onLayoutModeChange("focus")}
						variant={layoutMode === "focus" ? "secondary" : "ghost"}
						size="icon"
						className="size-7 rounded-md sm:size-8"
					>
						{lesson11Viewport ? (
							<Square className="size-3.5" aria-hidden />
						) : (
							<AppShellFocusViewIcon />
						)}
					</Button>
				</Card>
			) : null}
			<span
				className="hidden tabular-nums text-xs font-medium text-muted-foreground sm:inline"
				title={progressLabel}
			>
				<span className="sr-only">Lessons completed: </span>
				{mission ? `${mission.progressCount}/${mission.totalLessons}` : "--/--"}
			</span>
			<div className="pl-0.5">
				<AppShellUserMenu />
			</div>
		</div>
	);
}
