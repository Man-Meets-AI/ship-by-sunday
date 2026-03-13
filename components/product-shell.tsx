"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { getLesson } from "@/lib/course/manifest";
import type { LessonLayoutMode } from "@/lib/course/manifest";
import { api } from "@/convex/_generated/api";
import {
	ProductThemeProvider,
	useProductTheme,
} from "@/components/product-theme-provider";
import { getProductShellBlockNavigationTarget } from "@/components/product-shell-navigation";
import {
	SkillRail,
	type SkillRailCompletionCue,
} from "@/components/skill-rail";
import type { ProductTheme } from "@/lib/product-theme";

const navItems = [
	{ href: "/artifacts", label: "Artifacts" },
	{ href: "/settings", label: "Settings" },
];

function isNavItemActive(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

type LayoutMode = LessonLayoutMode;

type MissionState = {
	progressCount: number;
	totalLessons: number;
	blocks: Array<{
		id: string;
		label: string;
		order: number;
		completedCount: number;
		totalLessons: number;
		lessons: Array<{
			id: string;
			title: string;
			shortTitle: string;
			status: "available" | "completed" | "in_progress" | "locked";
			artifactLabel: string;
			isImplemented: boolean;
		}>;
	}>;
};

type ProductShellProps = {
	children: React.ReactNode;
	initialTheme: ProductTheme;
	title?: string;
	subtitle?: string;
	currentLessonId?: string;
	currentBlockId?: string;
	showSkillRail?: boolean;
	layoutMode?: LayoutMode;
	onLayoutModeChange?: (mode: LayoutMode) => void;
	coachVisible?: boolean;
	onCoachToggle?: () => void;
	viewportMode?: "document" | "app";
	appScrollMode?: "viewport" | "page";
	completionCue?: SkillRailCompletionCue | null;
};

function isBlockActive(block: MissionState["blocks"][number]) {
	return block.lessons.some(
		(lesson) =>
			lesson.status === "in_progress" || lesson.status === "available",
	);
}

function blockStatusClass(status: "completed" | "active" | "locked") {
	switch (status) {
		case "completed":
			return "border-product-border bg-product-surface text-product-text";
		case "active":
			return "border-product-accent bg-product-chip text-product-accent shadow-[0_0_0_1px_var(--product-accent)]";
		default:
			return "border-product-border/40 bg-product-surface-strong/40 text-product-muted opacity-50";
	}
}

function ShellInner({
	children,
	title,
	subtitle,
	currentLessonId,
	currentBlockId,
	showSkillRail = true,
	layoutMode,
	onLayoutModeChange,
	coachVisible,
	onCoachToggle,
	viewportMode = "document",
	appScrollMode = "viewport",
	completionCue,
}: ProductShellProps) {
	const pathname = usePathname();
	const { theme, toggleTheme } = useProductTheme();
	const { isAuthenticated, isLoading } = useConvexAuth();
	const mission = useQuery(
		api.course.getMissionState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as MissionState | undefined;

	const derivedLessonBlockId = currentLessonId
		? getLesson(currentLessonId)?.block
		: undefined;
	const resolvedBlockId =
		currentBlockId ??
		derivedLessonBlockId ??
		mission?.blocks.find((block) =>
			block.lessons.some((lesson) => lesson.id === currentLessonId),
		)?.id ??
		mission?.blocks.find((block) => isBlockActive(block))?.id ??
		mission?.blocks[0]?.id;

	const activeBlock = mission?.blocks.find(
		(block) => block.id === resolvedBlockId,
	);

	const blockStatuses = useMemo(() => {
		if (!mission) {
			return new Map<string, "completed" | "active" | "locked">();
		}

		const activeId =
			resolvedBlockId ??
			mission.blocks.find((block) => isBlockActive(block))?.id ??
			mission.blocks[0]?.id;

		return new Map(
			mission.blocks.map((block) => {
				const status =
					block.completedCount === block.totalLessons
						? "completed"
						: block.id === activeId
							? "active"
							: "locked";

				return [block.id, status];
			}),
		);
	}, [mission, resolvedBlockId]);

	const backgroundStyle =
		theme === "dark"
			? {
					backgroundImage:
						"linear-gradient(180deg, rgba(4,7,11,0.74), rgba(4,7,11,0.9)), url('/product/mission-bg.png')",
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
					backgroundSize: "cover",
				}
			: undefined;

	const shellClassName =
		viewportMode === "app"
			? appScrollMode === "page"
				? "flex min-h-screen flex-col bg-product-bg text-product-text"
				: "flex min-h-screen flex-col bg-product-bg text-product-text xl:h-dvh xl:overflow-hidden"
			: "min-h-screen bg-product-bg text-product-text";

	const shellInnerClassName =
		"mx-auto flex min-h-screen max-w-[1920px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3";

	const appChromeInnerClassName =
		"relative mx-auto flex w-full max-w-[1920px] items-center gap-2 px-2 py-1.5 sm:px-3 lg:px-4";
	const appContentClassName =
		"mx-auto flex w-full max-w-[1920px] min-h-0 flex-1 flex-col px-2 py-2 sm:px-3 sm:py-3";

	const headerContent = (
		<div
			className={
				viewportMode === "app"
					? appChromeInnerClassName
					: "relative flex items-center gap-2 px-3 py-1.5 lg:px-4"
			}
		>
			{/* Left: logo + nav */}
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				<Link
					href="/mission"
					className="font-display text-base uppercase tracking-[0.08em] text-product-text sm:text-lg"
				>
					Ship by Sunday
				</Link>

				<nav className="flex gap-1 font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted sm:text-[10px]">
					{navItems.map((item) => {
						const isActive = isNavItemActive(pathname, item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`px-2 py-1 transition-colors ${
									isActive
										? "text-product-text"
										: "text-product-muted hover:text-product-text"
								}`}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				{title ? (
					<div className="hidden items-center gap-2 border-l border-product-border/70 pl-2 xl:flex">
						<p className="font-display text-sm uppercase tracking-[0.06em] text-product-text">
							{title}
						</p>
						{subtitle ? (
							<p className="max-w-md truncate text-[11px] text-product-muted">
								{subtitle}
							</p>
						) : null}
					</div>
				) : null}
			</div>

			{/* Center: block progression */}
			{mission ? (
				<div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
					<div className="pointer-events-auto flex select-none items-center">
						{mission.blocks.map((block, i) => {
							const status = (blockStatuses.get(block.id) ?? "locked") as
								| "completed"
								| "active"
								| "locked";
							const target = getProductShellBlockNavigationTarget(block);
							const chipClassName = `flex items-center gap-1.5 rounded-none border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] ${blockStatusClass(status)} ${
								target
									? "transition-colors hover:border-product-accent/70 hover:bg-product-accent/8 hover:text-product-accent"
									: ""
							}`;
							const chipContent = (
								<>
									<span>{block.label}</span>
									{status === "completed" ? (
										<svg
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="3"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									) : status === "active" ? (
										<div className="h-1.5 w-1.5 rounded-full bg-product-accent" />
									) : (
										<svg
											width="10"
											height="10"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="opacity-50"
										>
											<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
											<path d="M7 11V7a5 5 0 0 1 10 0v4" />
										</svg>
									)}
								</>
							);
							return (
								<div key={block.id} className="flex items-center">
									{i > 0 && (
										<div
											className={`h-px w-3 ${
												status === "locked"
													? "bg-product-border/40"
													: "bg-product-border"
											}`}
										/>
									)}
									{target ? (
										<Link
											href={target.href}
											scroll={false}
											title={`Open ${block.label}`}
											aria-label={`Open ${block.label}`}
											aria-current={
												block.id === resolvedBlockId ? "page" : undefined
											}
											className={chipClassName}
										>
											{chipContent}
										</Link>
									) : (
										<div aria-disabled="true" className={chipClassName}>
											{chipContent}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			) : null}

			{/* Right: controls */}
			<div className="flex shrink-0 items-center gap-1.5">
				{onLayoutModeChange ? (
					<div className="flex rounded-none border border-product-border bg-product-surface-strong/70 p-px">
						<button
							type="button"
							title="Split view"
							onClick={() => onLayoutModeChange("split")}
							className={`rounded-none p-1 transition-colors ${
								layoutMode === "split"
									? "bg-product-chip text-product-accent"
									: "text-product-muted hover:text-product-text"
							}`}
						>
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<line x1="12" y1="3" x2="12" y2="21" />
							</svg>
						</button>
						<button
							type="button"
							title="Focus view"
							onClick={() => onLayoutModeChange("focus")}
							className={`rounded-none p-1 transition-colors ${
								layoutMode === "focus"
									? "bg-product-chip text-product-accent"
									: "text-product-muted hover:text-product-text"
							}`}
						>
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
							</svg>
						</button>
					</div>
				) : null}
				<button
					type="button"
					onClick={toggleTheme}
					title={theme === "dark" ? "Light mode" : "Dark mode"}
					className="rounded-none border border-product-border bg-product-surface-alt/80 p-1 text-product-text transition-colors hover:bg-product-surface"
				>
					{theme === "dark" ? (
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="5" />
							<line x1="12" y1="1" x2="12" y2="3" />
							<line x1="12" y1="21" x2="12" y2="23" />
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
							<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
							<line x1="1" y1="12" x2="3" y2="12" />
							<line x1="21" y1="12" x2="23" y2="12" />
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
							<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
						</svg>
					) : (
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
						</svg>
					)}
				</button>
				<span className="font-mono text-[9px] tracking-[0.2em] text-product-muted">
					{mission
						? `${mission.progressCount}/${mission.totalLessons}`
						: "--/--"}
				</span>
				<UserButton />
			</div>
		</div>
	);

	const footerRail =
		showSkillRail && activeBlock ? (
			<footer
				className={
					viewportMode === "app"
						? "shrink-0 border-t border-product-border/50 bg-product-surface-strong/88 backdrop-blur-md"
						: "shrink-0 border-t border-product-border/40 bg-product-surface-strong/80 backdrop-blur-md"
				}
			>
				<div
					className={
						viewportMode === "app"
							? "mx-auto w-full max-w-[1920px] px-2 py-1.5 sm:px-3 sm:py-2"
							: "flex justify-center px-3 py-2"
					}
				>
					<SkillRail
						label={activeBlock.label}
						lessons={activeBlock.lessons}
						navigationLessons={mission?.blocks.flatMap(
							(block) => block.lessons,
						)}
						currentLessonId={currentLessonId}
						completionCue={completionCue}
					/>
				</div>
			</footer>
		) : null;

	return (
		<main className={shellClassName} style={backgroundStyle}>
			{viewportMode === "app" ? (
				<>
					<header className="shrink-0 border-b border-product-border/60 bg-product-surface/82 backdrop-blur-lg">
						{headerContent}
					</header>
					<div className={appContentClassName}>{children}</div>
					{footerRail}
				</>
			) : (
				<div className={shellInnerClassName}>
					<header className="shrink-0 overflow-hidden rounded-none border border-product-border bg-product-surface/76 shadow-panel backdrop-blur-lg">
						{headerContent}
					</header>
					<div className="flex min-h-0 flex-1 flex-col">{children}</div>
					{footerRail}
				</div>
			)}
		</main>
	);
}

export function ProductShell(props: ProductShellProps) {
	return (
		<ProductThemeProvider initialTheme={props.initialTheme}>
			<ShellInner {...props} />
		</ProductThemeProvider>
	);
}
