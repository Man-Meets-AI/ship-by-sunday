"use client";

import { useConvexAuth, useQuery } from "convex/react";

import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { getLesson } from "@/features/course/lesson/model/manifest";
import { AppShellFooterRail } from "@/features/course/shared/components/app-shell/app-shell-footer-rail";
import { AppShellHeader } from "@/features/course/shared/components/app-shell/app-shell-header";
import {
	type AppShellMissionState,
	type AppShellProps,
	type AppShellViewerAccessState,
} from "@/features/course/shared/components/app-shell/app-shell-props";
import {
	getAppShellBlockStatus,
	isBlockActive,
} from "@/features/course/shared/components/app-shell/app-shell-block-status";

function ShellInner({
	children,
	title,
	subtitle,
	currentLessonId,
	currentBlockId,
	showSkillRail = true,
	layoutMode,
	onLayoutModeChange,
	viewportMode = "document",
	appScrollMode = "viewport",
	completionCue,
	enableMissionQuery = true,
}: AppShellProps) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const viewerAccess = useQuery(
		api.access.viewerProductAccess,
		isAuthenticated && !isLoading ? {} : "skip",
	) as AppShellViewerAccessState | undefined;
	const mission = useQuery(
		api.course.getMissionState,
		enableMissionQuery && viewerAccess?.hasAccess ? {} : "skip",
	) as AppShellMissionState | undefined;

	const derivedLessonBlockId = currentLessonId
		? getLesson(currentLessonId)?.block
		: undefined;
	const activeBlockId =
		currentBlockId ??
		derivedLessonBlockId ??
		mission?.blocks.find((block) =>
			block.lessons.some((lesson) => lesson.id === currentLessonId),
		)?.id ??
		mission?.blocks.find((block) => isBlockActive(block))?.id ??
		mission?.blocks[0]?.id;

	const activeBlock = mission?.blocks.find(
		(block) => block.id === activeBlockId,
	);
	const lesson11Viewport = currentLessonId === "1.1";
	const blockStatuses = mission
		? new Map(
				mission.blocks.map((block) => [
					block.id,
					getAppShellBlockStatus(block, activeBlockId),
				]),
			)
		: new Map();

	const shellClassName =
		viewportMode === "app"
			? appScrollMode === "page"
				? "flex min-h-screen flex-col bg-background text-foreground"
				: "flex min-h-screen flex-col bg-background text-foreground xl:h-dvh xl:overflow-hidden"
			: "min-h-screen bg-background text-foreground";

	const shellInnerClassName =
		"mx-auto flex min-h-screen max-w-[1920px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3";

	const appContentClassName =
		"mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col px-2 py-2 sm:px-3 sm:py-3";

	const footerRail =
		showSkillRail && activeBlock ? (
			<AppShellFooterRail
				viewportMode={viewportMode}
				activeBlock={activeBlock}
				navigationLessons={mission?.blocks.flatMap((block) => block.lessons)}
				currentLessonId={currentLessonId}
				completionCue={completionCue}
			/>
		) : null;

	return (
		<main className={shellClassName}>
			{viewportMode === "app" ? (
				<>
					<header className="shrink-0">
						<Card className="gap-0 rounded-none border-x-0 border-t-0 py-0 shadow-none">
							<AppShellHeader
								viewportMode={viewportMode}
								title={title}
								subtitle={subtitle}
								mission={mission}
								blockStatuses={blockStatuses}
								activeBlockId={activeBlockId}
								layoutMode={layoutMode}
								onLayoutModeChange={onLayoutModeChange}
								lesson11Viewport={lesson11Viewport}
							/>
						</Card>
					</header>
					<div className={appContentClassName}>
						<div className="flex min-h-0 flex-1 flex-col">{children}</div>
					</div>
					{footerRail}
				</>
			) : (
				<div className={shellInnerClassName}>
					<header className="shrink-0">
						<Card className="gap-0 overflow-hidden rounded-none py-0 shadow-sm">
							<AppShellHeader
								viewportMode={viewportMode}
								title={title}
								subtitle={subtitle}
								mission={mission}
								blockStatuses={blockStatuses}
								activeBlockId={activeBlockId}
								layoutMode={layoutMode}
								onLayoutModeChange={onLayoutModeChange}
								lesson11Viewport={lesson11Viewport}
							/>
						</Card>
					</header>
					<div className="flex min-h-0 flex-1 flex-col">{children}</div>
					{footerRail}
				</div>
			)}
		</main>
	);
}

export function AppShell(props: AppShellProps) {
	return <ShellInner {...props} />;
}
