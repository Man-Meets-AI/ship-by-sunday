"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { getLesson } from "@/lib/course/lesson/model/manifest";
import { AppShellFooterRail } from "@/app/(workspace)/_components/app-shell/app-shell-footer-rail";
import { AppShellHeader } from "@/app/(workspace)/_components/app-shell/app-shell-header";
import { AppShellLocalNavRail } from "@/app/(workspace)/_components/app-shell/app-shell-local-nav";
import {
	APP_SHELL_MAIN_ID,
	AppShellSkipToContentLink,
} from "@/app/(workspace)/_components/app-shell/app-shell-skip-to-content-link";
import { useAppShellPreferences } from "@/app/(workspace)/_hooks/app-shell/use-app-shell-preferences";
import { useHeaderScrollShadow } from "@/app/(workspace)/_hooks/app-shell/use-header-scroll-shadow";
import { cn } from "@/lib/utils";
import { type AppShellProps } from "@/app/(workspace)/_components/app-shell/app-shell-props";
import { isBlockActive } from "@/app/(workspace)/_components/app-shell/app-shell-block-status";

const headerBaseClassName =
	"relative z-20 shrink-0 overflow-visible border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-shadow duration-200 motion-reduce:transition-none";
const headerRestShadowClassName = "border-border/60 shadow-none";
const headerScrolledShadowClassName = "border-border/30 shadow-sm";

const mainContentClassName = "flex min-h-0 flex-1 flex-col focus:outline-none";

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
	const scrolled = useHeaderScrollShadow({ mainId: APP_SHELL_MAIN_ID });
	const headerClassName = cn(
		headerBaseClassName,
		scrolled ? headerScrolledShadowClassName : headerRestShadowClassName,
	);
	const { preferences, toggleLocalNavCollapsed } = useAppShellPreferences();
	const localNavCollapsed = preferences.localNavCollapsed;
	const pathname = usePathname();
	const initialPathnameRef = useRef(pathname);
	useEffect(() => {
		if (pathname === initialPathnameRef.current) {
			return;
		}
		initialPathnameRef.current = pathname;
		const target = document.getElementById(APP_SHELL_MAIN_ID);
		target?.focus({ preventScroll: true });
	}, [pathname]);
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
		localNav
			? localNavCollapsed
				? "gap-4 xl:grid xl:grid-cols-[3rem_minmax(0,1fr)] xl:gap-3"
				: "gap-4 xl:grid xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-6"
			: "",
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
			<AppShellSkipToContentLink />
			{viewportMode === "app" ? (
				<>
					<header className={headerClassName}>
						<AppShellHeader
							viewportMode={viewportMode}
							primaryNav={primaryNav}
							progressSummary={resolvedProgressSummary}
							layoutMode={layoutMode}
							onLayoutModeChange={onLayoutModeChange}
							lesson11Viewport={lesson11Viewport}
						/>
					</header>
					<div className={appContentClassName}>
						{localNav ? (
							<AppShellLocalNavRail
								localNav={localNav}
								collapsed={localNavCollapsed}
								onToggleCollapsed={toggleLocalNavCollapsed}
							/>
						) : null}
						<div
							id={APP_SHELL_MAIN_ID}
							tabIndex={-1}
							className={mainContentClassName}
						>
							{children}
						</div>
					</div>
					{footerRail}
				</>
			) : (
				<div className={shellInnerClassName}>
					<header className={headerClassName}>
						<AppShellHeader
							viewportMode={viewportMode}
							primaryNav={primaryNav}
							progressSummary={resolvedProgressSummary}
							layoutMode={layoutMode}
							onLayoutModeChange={onLayoutModeChange}
							lesson11Viewport={lesson11Viewport}
						/>
					</header>
					<div className={appContentClassName}>
						{localNav ? (
							<AppShellLocalNavRail
								localNav={localNav}
								collapsed={localNavCollapsed}
								onToggleCollapsed={toggleLocalNavCollapsed}
							/>
						) : null}
						<div
							id={APP_SHELL_MAIN_ID}
							tabIndex={-1}
							className={mainContentClassName}
						>
							{children}
						</div>
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
