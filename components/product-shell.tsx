"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { getLesson } from "@/app/lessonRegistry";
import { api } from "@/convex/_generated/api";
import { ProductThemeProvider, useProductTheme } from "@/components/product-theme-provider";

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

function lessonRailClass(isCurrent: boolean, status: string) {
	if (isCurrent) {
		return "border-product-accent bg-product-chip text-product-accent shadow-panel";
	}

	if (status === "completed") {
		return "border-product-border bg-product-surface text-product-text";
	}

	if (status === "in_progress" || status === "available") {
		return "border-product-border bg-product-surface-alt/80 text-product-text";
	}

	return "border-product-border/60 bg-product-surface-strong/70 text-product-muted";
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

	return (
		<main className="min-h-screen bg-product-bg text-product-text" style={backgroundStyle}>
			<div className="mx-auto flex min-h-screen max-w-[1728px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4">
				<header className="overflow-hidden rounded-[24px] border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-xl">
					<div className="flex flex-col gap-4 px-4 py-4 lg:px-6">
						<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
							<div className="space-y-4">
								<div className="flex flex-wrap items-center gap-4">
									<Link
										href="/mission"
										className="font-display text-3xl uppercase tracking-[0.08em] text-product-text sm:text-4xl"
									>
										Ship by Sunday
									</Link>
									<nav className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-product-muted sm:text-xs">
										{navItems.map((item) => {
											const isActive = pathname === item.href;
											return (
												<Link
													key={item.href}
													href={item.href}
													className={`rounded-full border px-3 py-2 transition-colors ${
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
										<div className="flex flex-wrap items-start gap-2 font-mono text-[11px] uppercase tracking-[0.18em] sm:text-xs">
											{mission.blocks.map((block) => {
												const status = (blockStatuses.get(block.id) ??
													"locked") as "completed" | "active" | "locked";
												return (
													<div
														key={block.id}
													className={`rounded-full border px-3 py-2 ${blockStatusClass(status)}`}
												>
													<div className="flex items-center gap-2">
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

							<div className="flex flex-col gap-4 xl:items-end">
								<div className="flex flex-wrap items-center gap-2">
									<button
										type="button"
										onClick={toggleTheme}
										className="rounded-full border border-product-border bg-product-surface-alt/80 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text transition-colors hover:bg-product-surface"
									>
										{theme === "dark" ? "Light mode" : "Dark mode"}
									</button>
									{onLayoutModeChange ? (
										<div className="flex rounded-full border border-product-border bg-product-surface-strong/70 p-1">
											{(["split", "focus"] as LayoutMode[]).map((mode) => {
												const isActive = layoutMode === mode;
												return (
													<button
														key={mode}
														type="button"
														onClick={() => onLayoutModeChange(mode)}
														className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors sm:px-4 ${
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
											className={`rounded-full border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
												coachVisible
													? "border-product-accent bg-product-chip text-product-accent"
													: "border-product-border bg-product-surface-alt/80 text-product-muted hover:text-product-text"
											}`}
										>
											Coach
										</button>
									) : null}
									<UserButton />
								</div>

								<div className="text-right">
									<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
										Progress
									</p>
									<p className="mt-1 font-display text-4xl uppercase leading-none tracking-[0.08em] text-product-text sm:text-5xl">
										{mission ? `${mission.progressCount}/${mission.totalLessons}` : "--/--"}
									</p>
								</div>
							</div>
						</div>

						{title ? (
							<div className="rounded-[20px] border border-product-border bg-product-surface-strong/80 px-4 py-4">
								<p className="font-display text-3xl uppercase tracking-[0.08em] text-product-text sm:text-4xl">
									{title}
								</p>
								{subtitle ? (
									<p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-product-muted">
										{subtitle}
									</p>
								) : null}
							</div>
						) : null}
					</div>
				</header>

				<div className="flex-1">{children}</div>

				{activeBlock ? (
					<footer className="overflow-hidden rounded-[24px] border border-product-border bg-product-surface/78 shadow-panel backdrop-blur-xl">
						<div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
							<div>
								<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
									Skills
								</p>
								<p className="mt-1 text-sm font-medium text-product-muted">
									{activeBlock.label} sprint path
								</p>
							</div>
							<div className="flex gap-2 overflow-x-auto pb-1">
								{activeBlock.lessons.map((lesson) => {
									const isCurrent = lesson.id === currentLessonId;
									return (
										<Link
											key={lesson.id}
											href={`/lesson/${lesson.id}`}
											className={`min-w-[136px] rounded-[18px] border px-3 py-3 transition-transform hover:-translate-y-0.5 ${lessonRailClass(
												isCurrent,
												lesson.status,
											)}`}
										>
											<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-current/70">
												{lesson.id}
											</p>
											<p className="mt-2 font-display text-xl uppercase leading-none tracking-[0.05em]">
												{lesson.shortTitle}
											</p>
											<p className="mt-2 text-xs font-medium text-current/75">
												{lesson.status.replace("_", " ")}
											</p>
										</Link>
									);
								})}
							</div>
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
