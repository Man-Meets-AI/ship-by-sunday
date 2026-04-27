"use client";

import { Card } from "@/components/ui/card";
import { getLesson } from "@/lib/course/lesson/model/manifest";
import { AppShellFooterRail } from "@/app/(workspace)/_components/app-shell/app-shell-footer-rail";
import { AppShellHeader } from "@/app/(workspace)/_components/app-shell/app-shell-header";
import { AppShellLocalNavRail } from "@/app/(workspace)/_components/app-shell/app-shell-local-nav";
import { cn } from "@/lib/utils";
import { type AppShellProps } from "@/app/(workspace)/_components/app-shell/app-shell-props";
import { isBlockActive } from "@/app/(workspace)/_components/app-shell/app-shell-block-status";

function ShellInner({
	children,
	currentLessonId,
	currentBlockId,
	mission,
	localNav,
	progressSummary,
	primaryNav,
	showSkillRail: explicitShowSkillRail,
	layoutMode,
	onLayoutModeChange,
	viewportMode = "document",
	appScrollMode = "viewport",
	completionCue,
}: AppShellProps) {
	const derivedLessonBlockId = currentLessonId
		? getLesson(currentLessonId)?.block
		: undefined;
	const activeBlockId =
		currentBlockId ??
		derivedLessonBlockId ??
		mission?.blocks.find((block) =>
			block.lessons.some((lesson) => lesson.lessonKey === currentLessonId),
		)?.id ??
		mission?.blocks.find((block) => isBlockActive(block))?.id ??
		mission?.blocks[0]?.id;

	const activeBlock = mission?.blocks.find(
		(block) => block.id === activeBlockId,
	);
	const showSkillRail = explicitShowSkillRail ?? Boolean(currentLessonId);
	const lesson11Viewport =
		getLesson(currentLessonId ?? "")?.displayLabel === "1.1";

	const shellClassName =
		viewportMode === "app"
			? appScrollMode === "page"
				? "flex min-h-screen flex-col bg-background text-foreground"
				: "flex min-h-screen flex-col bg-background text-foreground xl:h-dvh xl:overflow-hidden"
			: "min-h-screen bg-background text-foreground";

	const shellInnerClassName =
		"mx-auto flex min-h-screen max-w-[1920px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3";

	const appContentClassName = cn(
		"mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col px-2 py-2 sm:px-3 sm:py-3",
		localNav ? "gap-4 xl:grid xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-6" : "",
	);

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
	const resolvedProgressSummary =
		progressSummary ??
		(mission
			? {
					progressCount: mission.progressCount,
					totalLessons: mission.totalLessons,
					progressLabel: mission.progressLabel,
				}
			: undefined);

	return (
		<main className={shellClassName}>
			{viewportMode === "app" ? (
				<>
					<header className="relative z-20 shrink-0 overflow-visible">
						<Card className="gap-0 overflow-visible rounded-none border-0 py-0 shadow-none">
							<AppShellHeader
								viewportMode={viewportMode}
								primaryNav={primaryNav}
								progressSummary={resolvedProgressSummary}
								layoutMode={layoutMode}
								onLayoutModeChange={onLayoutModeChange}
								lesson11Viewport={lesson11Viewport}
							/>
						</Card>
					</header>
					<div className={appContentClassName}>
						{localNav ? <AppShellLocalNavRail localNav={localNav} /> : null}
						<div className="flex min-h-0 flex-1 flex-col">{children}</div>
					</div>
					{footerRail}
				</>
			) : (
				<div className={shellInnerClassName}>
					<header className="relative z-20 shrink-0 overflow-visible">
						<Card className="gap-0 overflow-visible rounded-none border-0 py-0 shadow-sm">
							<AppShellHeader
								viewportMode={viewportMode}
								primaryNav={primaryNav}
								progressSummary={resolvedProgressSummary}
								layoutMode={layoutMode}
								onLayoutModeChange={onLayoutModeChange}
								lesson11Viewport={lesson11Viewport}
							/>
						</Card>
					</header>
					<div className={appContentClassName}>
						{localNav ? <AppShellLocalNavRail localNav={localNav} /> : null}
						<div className="flex min-h-0 flex-1 flex-col">{children}</div>
					</div>
					{footerRail}
				</div>
			)}
		</main>
	);
}

export function AppShell(props: AppShellProps) {
	return <ShellInner {...props} />;
}
