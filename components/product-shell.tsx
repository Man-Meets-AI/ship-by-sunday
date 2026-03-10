"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { getLesson } from "@/app/lessonRegistry";
import { api } from "@/convex/_generated/api";
import { ProductThemeProvider, useProductTheme } from "@/components/product-theme-provider";
import { SkillRail } from "@/components/skill-rail";

const navItems = [
	{ href: "/mission", label: "Mission" },
	{ href: "/artifacts", label: "Artifacts" },
	{ href: "/settings", label: "Settings" },
];

type LayoutMode = "split" | "focus";

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
	title?: string;
	subtitle?: string;
	currentLessonId?: string;
	currentBlockId?: string;
	layoutMode?: LayoutMode;
	onLayoutModeChange?: (mode: LayoutMode) => void;
	coachVisible?: boolean;
	onCoachToggle?: () => void;
	viewportMode?: "document" | "app";
};

function isBlockActive(block: MissionState["blocks"][number]) {
	return block.lessons.some(
		(lesson) => lesson.status === "in_progress" || lesson.status === "available",
	);
}

function blockStatusClass(status: "completed" | "active" | "locked") {
	switch (status) {
		case "completed":
			return "border-product-border bg-product-surface text-product-text";
		case "active":
			return "border-product-accent bg-product-chip text-product-accent";
		default:
			return "border-product-border/60 bg-product-surface-strong/70 text-product-muted";
	}
}

function ShellInner({
	children,
	title,
	subtitle,
	currentLessonId,
	currentBlockId,
	layoutMode,
	onLayoutModeChange,
	coachVisible,
	onCoachToggle,
	viewportMode = "document",
}: ProductShellProps) {
	const pathname = usePathname();
	const { theme, toggleTheme } = useProductTheme();
	const { isAuthenticated } = useConvexAuth();
	const mission = useQuery(
		api.course.getMissionState,
		isAuthenticated ? {} : "skip",
	) as MissionState | undefined;

	const derivedLessonBlockId = currentLessonId ? getLesson(currentLessonId)?.block : undefined;
	const resolvedBlockId =
		currentBlockId ??
		derivedLessonBlockId ??
		mission?.blocks.find((block) =>
			block.lessons.some((lesson) => lesson.id === currentLessonId),
		)?.id ??
		mission?.blocks.find((block) => isBlockActive(block))?.id ??
		mission?.blocks[0]?.id;

	const activeBlock = mission?.blocks.find((block) => block.id === resolvedBlockId);

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
			? "min-h-screen bg-product-bg text-product-text xl:h-dvh xl:overflow-hidden"
			: "min-h-screen bg-product-bg text-product-text";

	const shellInnerClassName =
		viewportMode === "app"
			? "mx-auto flex min-h-screen max-w-[1920px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3 xl:h-full xl:min-h-0"
			: "mx-auto flex min-h-screen max-w-[1920px] flex-col gap-3 px-2 py-2 sm:px-3 sm:py-3";

	return (
		<main className={shellClassName} style={backgroundStyle}>
			<div className={shellInnerClassName}>
				<header className="shrink-0 overflow-hidden rounded-none border border-product-border bg-product-surface/76 shadow-panel backdrop-blur-lg">
					<div className="flex flex-col gap-2 px-3 py-2 lg:px-5">
						<div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
							<div className="space-y-2">
								<div className="flex flex-wrap items-center gap-3">
									<Link
										href="/mission"
										className="font-display text-[1.55rem] uppercase tracking-[0.08em] text-product-text sm:text-[1.9rem]"
									>
										Ship by Sunday
									</Link>
									<nav className="flex flex-wrap gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-product-muted sm:text-[11px]">
										{navItems.map((item) => {
											const isActive = pathname === item.href;
											return (
												<Link
													key={item.href}
													href={item.href}
													className={`rounded-none border px-2.5 py-1.5 transition-colors ${
														isActive
															? "border-product-accent bg-product-chip text-product-accent"
															: "border-product-border bg-product-surface-alt/70 text-product-text hover:bg-product-surface"
													}`}
												>
													{item.label}
												</Link>
											);
										})}
									</nav>
								</div>

								{mission ? (
									<div className="flex flex-wrap items-start gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px]">
											{mission.blocks.map((block) => {
												const status = (blockStatuses.get(block.id) ??
													"locked") as "completed" | "active" | "locked";
												return (
													<div
														key={block.id}
													className={`rounded-none border px-2.5 py-1.5 ${blockStatusClass(status)}`}
												>
													<div className="flex items-center gap-1.5">
														<span>[ {block.label} ]</span>
														<span className="text-[10px] tracking-[0.24em] text-current/80">
															{status}
														</span>
													</div>
												</div>
											);
										})}
									</div>
								) : null}
							</div>

							<div className="flex flex-col gap-2 xl:items-end">
								<div className="flex flex-wrap items-center gap-1.5">
									<button
										type="button"
										onClick={toggleTheme}
										className="rounded-none border border-product-border bg-product-surface-alt/80 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-product-text transition-colors hover:bg-product-surface"
									>
										{theme === "dark" ? "Light mode" : "Dark mode"}
									</button>
									{onLayoutModeChange ? (
										<div className="flex rounded-none border border-product-border bg-product-surface-strong/70 p-1">
											{(["split", "focus"] as LayoutMode[]).map((mode) => {
												const isActive = layoutMode === mode;
												return (
													<button
														key={mode}
														type="button"
														onClick={() => onLayoutModeChange(mode)}
														className={`rounded-none px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors sm:px-3 ${
															isActive
																? "bg-product-chip text-product-accent"
																: "text-product-muted hover:text-product-text"
														}`}
													>
														{mode}
													</button>
												);
											})}
										</div>
									) : null}
									{onCoachToggle ? (
										<button
											type="button"
											onClick={onCoachToggle}
											className={`rounded-none border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
												coachVisible
													? "border-product-accent bg-product-chip text-product-accent"
													: "border-product-border bg-product-surface-alt/80 text-product-muted hover:text-product-text"
											}`}
										>
											Coach
										</button>
									) : null}
									<div className="border-l border-product-border/70 pl-2 text-right">
										<p className="font-mono text-[9px] uppercase tracking-[0.22em] text-product-muted">
											Progress
										</p>
										<p className="mt-0.5 font-display text-[1.4rem] uppercase leading-none tracking-[0.08em] text-product-text sm:text-[1.65rem]">
											{mission ? `${mission.progressCount}/${mission.totalLessons}` : "--/--"}
										</p>
									</div>
									<UserButton />
								</div>
							</div>
						</div>

						{title ? (
							<div className="rounded-none border border-product-border bg-product-surface-strong/78 px-4 py-2.5">
								<p className="font-display text-[1.55rem] uppercase tracking-[0.08em] text-product-text sm:text-[1.85rem]">
									{title}
								</p>
								{subtitle ? (
									<p className="mt-1 max-w-4xl text-[13px] font-medium leading-relaxed text-product-muted">
										{subtitle}
									</p>
								) : null}
							</div>
						) : null}
					</div>
				</header>

				<div className="flex min-h-0 flex-1 flex-col">{children}</div>

				{activeBlock ? (
					<footer className="shrink-0 overflow-hidden rounded-none border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-lg">
						<div className="px-3 py-3 lg:px-5">
							<SkillRail
								label="Skills"
								subtitle={`${activeBlock.label} sprint path`}
								lessons={activeBlock.lessons}
								currentLessonId={currentLessonId}
							/>
						</div>
					</footer>
				) : null}
			</div>
		</main>
	);
}

export function ProductShell(props: ProductShellProps) {
	return (
		<ProductThemeProvider>
			<ShellInner {...props} />
		</ProductThemeProvider>
	);
}
