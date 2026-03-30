"use client";

import type { LessonLayoutMode } from "@/features/course/lesson/model/manifest";
import type {
	AppShellPrimaryNav,
	AppShellProgressSummary,
} from "./app-shell-props";
import { AppShellHeaderTrailing } from "./app-shell-header-trailing";
import { AppShellPrimaryNav as AppShellHeaderPrimaryNav } from "./app-shell-primary-nav";
import { AppShellWorkspaceNav } from "./app-shell-workspace-nav";

type AppShellHeaderProps = {
	viewportMode: "document" | "app";
	primaryNav: AppShellPrimaryNav | undefined;
	progressSummary: AppShellProgressSummary | undefined;
	layoutMode: LessonLayoutMode | undefined;
	onLayoutModeChange: ((mode: LessonLayoutMode) => void) | undefined;
	lesson11Viewport?: boolean;
};

export function AppShellHeader({
	viewportMode,
	primaryNav,
	progressSummary,
	layoutMode,
	onLayoutModeChange,
	lesson11Viewport = false,
}: AppShellHeaderProps) {
	const chromeRowClass =
		viewportMode === "app"
			? "mx-auto flex min-h-10 w-full max-w-[1920px] flex-wrap items-center gap-x-3 gap-y-2 px-2 py-2 sm:min-h-11 sm:px-3 lg:px-4"
			: "flex min-h-10 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:min-h-11 lg:px-4";

	return (
		<div className={chromeRowClass}>
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
				<AppShellWorkspaceNav lesson11Viewport={lesson11Viewport} />
				{primaryNav ? (
					<div className="min-w-0 flex-1">
						<AppShellHeaderPrimaryNav primaryNav={primaryNav} />
					</div>
				) : null}
			</div>

			<AppShellHeaderTrailing
				layoutMode={layoutMode}
				onLayoutModeChange={onLayoutModeChange}
				progress={progressSummary}
				lesson11Viewport={lesson11Viewport}
			/>
		</div>
	);
}
