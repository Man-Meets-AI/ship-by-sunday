"use client";

import Image from "next/image";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { getLessonHref } from "@/lib/course/manifest";
import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

const blockImages: Record<string, string> = {
	CEO: "/product/block-ceo.png",
	DESIGN: "/product/block-design.png",
	BUILD: "/product/block-build.png",
	SHIP: "/product/block-ship.png",
};

type MissionLesson = {
	id: string;
	title: string;
	shortTitle: string;
	status: "available" | "completed" | "in_progress" | "locked";
	artifactLabel: string;
	isImplemented: boolean;
};

type MissionBlock = {
	id: string;
	label: string;
	order: number;
	completedCount: number;
	totalLessons: number;
	lessons: MissionLesson[];
};

function blockStatus(block: MissionBlock) {
	if (block.completedCount === block.totalLessons) return "completed";
	if (block.lessons.some((l) => l.status === "in_progress")) return "active";
	if (block.lessons.some((l) => l.status === "available")) return "ready";
	return "locked";
}

function BlockCard({
	block,
	status,
}: {
	block: MissionBlock;
	status: ReturnType<typeof blockStatus>;
}) {
	const nextLesson =
		block.lessons.find(
			(l) => l.status === "in_progress" || l.status === "available",
		) ?? block.lessons[0];

	const pct =
		block.totalLessons > 0
			? Math.round((block.completedCount / block.totalLessons) * 100)
			: 0;

	const inner = (
		<div className="flex h-full flex-col">
			{/* Image banner */}
			<div className="relative overflow-hidden bg-product-surface-strong">
				<div className="relative h-[56px]">
					<Image
						src={blockImages[block.id] ?? blockImages.CEO}
						alt={block.label}
						fill
						className={`object-cover ${status === "locked" ? "grayscale" : ""}`}
						sizes="(min-width: 1280px) 25vw, 50vw"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
					<div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-2.5 pb-1.5">
						<p className="font-display text-sm uppercase leading-none tracking-[0.06em] text-white">
							{block.label}
						</p>
						<span
							className={`font-mono text-[8px] uppercase tracking-[0.15em] ${
								status === "active"
									? "text-[#95ffff]"
									: status === "completed"
										? "text-white/80"
										: "text-white/40"
							}`}
						>
							{status === "active"
								? "Active"
								: status === "completed"
									? "Done"
									: status === "ready"
										? "Ready"
										: "Locked"}
						</span>
					</div>
				</div>
			</div>

			{/* Progress strip */}
			<div className="border-t border-product-border px-2.5 py-2">
				<div className="flex items-center justify-between">
					<span className="font-mono text-[9px] uppercase tracking-[0.15em] text-product-muted">
						{block.completedCount}/{block.totalLessons}
					</span>
					<span className="font-mono text-[9px] uppercase tracking-[0.15em] text-product-muted">
						{pct}%
					</span>
				</div>
				<div className="mt-1 h-[3px] w-full overflow-hidden bg-product-border/30">
					<div
						className="h-full bg-[rgb(var(--product-accent))] transition-all"
						style={{ width: `${pct}%` }}
					/>
				</div>
			</div>
		</div>
	);

	const base =
		"rounded-none border bg-product-surface shadow-panel backdrop-blur-xl overflow-hidden";
	const cardClass =
		status === "locked"
			? `${base} border-product-border/50 opacity-45`
			: `${base} border-product-border transition-colors hover:bg-product-surface-alt/40`;

	if (status === "locked") {
		return (
			<article aria-disabled="true" className={cardClass}>
				{inner}
			</article>
		);
	}

	return (
		<Link href={getLessonHref(nextLesson.id)} className={cardClass}>
			{inner}
		</Link>
	);
}

function LessonRoadmap({ blocks }: { blocks: MissionBlock[] }) {
	const allLessons = blocks.flatMap((block) =>
		block.lessons.map((lesson) => ({
			...lesson,
			blockId: block.id,
			blockLabel: block.label,
		})),
	);

	const completedCount = allLessons.filter(
		(l) => l.status === "completed",
	).length;
	const currentIndex = allLessons.findIndex(
		(l) => l.status === "in_progress" || l.status === "available",
	);

	return (
		<section className="rounded-none border border-product-border bg-product-surface shadow-panel backdrop-blur-xl">
			{/* Header + global progress */}
			<div className="border-b border-product-border px-3 py-2">
				<div className="flex items-center justify-between">
					<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
						Lesson roadmap
					</span>
					<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
						{completedCount}/{allLessons.length}
					</span>
				</div>
				<div className="mt-1.5 flex h-1 gap-[2px]">
					{allLessons.map((lesson) => (
						<div
							key={lesson.id}
							className={`flex-1 transition-colors ${
								lesson.status === "completed"
									? "bg-[rgb(var(--product-accent))]"
									: lesson.status === "in_progress"
										? "bg-[rgb(var(--product-accent))]/35"
										: "bg-product-border/25"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Block sections */}
			{blocks.map((block, blockIdx) => {
				const status = blockStatus(block);
				const isLocked = status === "locked";

				return (
					<div
						key={block.id}
						className={blockIdx < blocks.length - 1 ? "border-b border-product-border" : ""}
					>
						{/* Block label */}
						<div className="flex items-center gap-2 border-b border-product-border/50 bg-product-surface-strong/50 px-3 py-1.5">
							<span className="font-display text-xs uppercase tracking-[0.08em] text-product-text">
								{block.label}
							</span>
							<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
								{block.completedCount}/{block.totalLessons}
							</span>
							{isLocked && (
								<span className="ml-auto font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted/50">
									Locked
								</span>
							)}
						</div>

						{/* Lesson grid */}
						<div
							className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
								isLocked ? "opacity-35" : ""
							}`}
						>
							{block.lessons.map((lesson, lessonIdx) => {
								const globalIdx = allLessons.findIndex(
									(l) => l.id === lesson.id,
								);
								const isCurrent = globalIdx === currentIndex;
								const isClickable = lesson.status !== "locked";

								// Border logic: right border on all except last in row handled by CSS,
								// bottom border on all except last row
								const hasBorderRight =
									lessonIdx < block.lessons.length - 1;
								const hasBorderBottom =
									lessonIdx < block.lessons.length - 1;

								const cell = (
									<div
										className={`group relative flex items-center gap-2.5 px-3 py-2.5 ${
											isCurrent
												? "bg-[rgb(var(--product-accent))]/[0.06]"
												: "bg-transparent"
										} ${isClickable && !isCurrent ? "hover:bg-product-surface-alt/30" : ""}`}
									>
										{/* Status indicator */}
										<div className="flex shrink-0 flex-col items-center">
											<div
												className={`h-2.5 w-2.5 rounded-full border ${
													lesson.status === "completed"
														? "border-[rgb(var(--product-accent))] bg-[rgb(var(--product-accent))]"
														: lesson.status === "in_progress"
															? "border-[rgb(var(--product-accent))] bg-transparent"
															: lesson.status === "available"
																? "border-product-border bg-transparent"
																: "border-product-border/40 bg-transparent"
												}`}
											/>
										</div>

										{/* Content */}
										<div className="min-w-0 flex-1">
											<div className="flex items-baseline gap-1.5">
												<span className="font-mono text-[9px] uppercase tracking-[0.12em] text-product-muted">
													{lesson.id}
												</span>
												{isCurrent && (
													<span className="rounded-none border border-[rgb(var(--product-accent))]/30 bg-[rgb(var(--product-accent))]/10 px-1 py-px font-mono text-[7px] uppercase tracking-[0.15em] text-[rgb(var(--product-accent))]">
														Current
													</span>
												)}
												{lesson.status === "completed" && (
													<span className="font-mono text-[7px] uppercase tracking-[0.15em] text-product-muted/60">
														Done
													</span>
												)}
											</div>
											<p
												className={`text-[11px] font-medium leading-tight ${
													lesson.status === "locked"
														? "text-product-muted/60"
														: "text-product-text"
												}`}
											>
												{lesson.shortTitle}
											</p>
										</div>
									</div>
								);

								const borderClasses = [
									"border-product-border/30",
									"[&:not(:last-child)]:border-r",
								].join(" ");

								if (isClickable) {
									return (
										<Link
											key={lesson.id}
											href={getLessonHref(lesson.id)}
											className={`border-b border-product-border/30 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0 xl:[&:nth-last-child(-n+4)]:border-b-0 ${borderClasses}`}
										>
											{cell}
										</Link>
									);
								}

								return (
									<div
										key={lesson.id}
										className={`border-b border-product-border/30 last:border-b-0 ${borderClasses}`}
									>
										{cell}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</section>
	);
}

export function MissionPage() {
	const { isAuthenticated } = useConvexAuth();
	const mission = useQuery(
		api.course.getMissionState,
		isAuthenticated ? {} : "skip",
	) as
		| {
				progressCount: number;
				totalLessons: number;
				blocks: MissionBlock[];
		  }
		| undefined;

	const nextLesson = mission?.blocks
		.flatMap((block) => block.lessons)
		.find(
			(lesson) =>
				lesson.status === "in_progress" || lesson.status === "available",
		);

	return (
		<ProductShell
			viewportMode="app"
			showSkillRail={false}
			currentBlockId={
				mission?.blocks.find((block) => blockStatus(block) !== "locked")?.id
			}
		>
			<ViewerGate>
				{mission === undefined ? (
					<section className="rounded-none border border-product-border bg-product-surface/78 px-4 py-6 text-center shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
							Loading
						</p>
					</section>
				) : (
					<div className="flex flex-1 flex-col gap-2 xl:min-h-0 xl:overflow-y-auto">
						{/* Compact header */}
						<div className="flex items-center justify-between rounded-none border border-product-border bg-product-surface/70 px-3 py-2 shadow-panel backdrop-blur-xl">
							<div className="flex items-baseline gap-2.5">
								<h1 className="font-display text-base uppercase leading-none tracking-[0.06em] text-product-text">
									Mission map
								</h1>
								<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									{mission.progressCount}/{mission.totalLessons}
								</span>
							</div>
							{nextLesson ? (
								<Link
									href={getLessonHref(nextLesson.id)}
									className="rounded-none border border-product-accent bg-product-chip px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
								>
									Continue {nextLesson.id}
								</Link>
							) : null}
						</div>

						{/* Block cards */}
						<div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
							{mission.blocks.map((block) => (
								<BlockCard
									key={block.id}
									block={block}
									status={blockStatus(block)}
								/>
							))}
						</div>

						{/* Full lesson roadmap */}
						<LessonRoadmap blocks={mission.blocks} />
					</div>
				)}
			</ViewerGate>
		</ProductShell>
	);
}
