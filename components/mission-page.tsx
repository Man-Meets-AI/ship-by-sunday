"use client";

import Image from "next/image";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { getLessonHref } from "@/app/lessonRegistry";
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
	if (block.completedCount === block.totalLessons) {
		return "completed";
	}

	if (block.lessons.some((lesson) => lesson.status === "in_progress")) {
		return "active";
	}

	if (block.lessons.some((lesson) => lesson.status === "available")) {
		return "ready";
	}

	return "locked";
}

function statusLabel(status: ReturnType<typeof blockStatus>) {
	switch (status) {
		case "completed":
			return "Completed";
		case "active":
			return "In progress";
		case "ready":
			return "Ready";
		default:
			return "Locked";
	}
}

function statusTone(status: ReturnType<typeof blockStatus>) {
	switch (status) {
		case "completed":
			return "border-product-border bg-product-surface text-product-text";
		case "active":
			return "border-product-accent bg-product-chip text-product-accent";
		case "ready":
			return "border-product-border bg-product-surface-strong text-product-text";
		default:
			return "border-product-border/60 bg-product-surface-strong/60 text-product-muted";
	}
}

function nextActionLabel(status: ReturnType<typeof blockStatus>) {
	switch (status) {
		case "completed":
			return "Review block";
		case "active":
			return "Continue";
		case "ready":
			return "Start block";
		default:
			return "Locked";
	}
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
		.find((lesson) => lesson.status === "in_progress" || lesson.status === "available");

	return (
		<ProductShell
			currentBlockId={mission?.blocks.find((block) => blockStatus(block) !== "locked")?.id}
		>
			<ViewerGate>
				{mission === undefined ? (
					<section className="rounded-none border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Loading mission map
						</p>
						<p className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-product-text">
							Loading
						</p>
					</section>
				) : (
					<div className="space-y-4">
						<section className="rounded-none border border-product-border bg-product-surface/70 px-5 py-6 shadow-panel backdrop-blur-xl lg:px-6">
							<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
								<div>
									<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
										Mission control
									</p>
									<h1 className="mt-4 font-display text-5xl uppercase leading-none tracking-[0.08em] text-product-text sm:text-6xl">
										Ship an app by Sunday
									</h1>
									<p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-product-muted">
										Move through CEO, DESIGN, BUILD, and SHIP in order. Open the
										next lesson, finish the rep, and keep going until your v1 is
										live.
									</p>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<div className="rounded-none border border-product-border bg-product-surface-strong/75 px-4 py-4">
										<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
											Progress
										</p>
										<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.05em] text-product-text">
											{mission.progressCount}/{mission.totalLessons}
										</p>
										<p className="mt-2 text-sm font-medium text-product-muted">
											Lessons completed
										</p>
									</div>
									<div className="rounded-none border border-product-border bg-product-surface-strong/75 px-4 py-4">
										<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
											Next action
										</p>
										{nextLesson ? (
											<>
												<p className="mt-3 font-display text-2xl uppercase leading-none tracking-[0.05em] text-product-text">
													{nextLesson.id}
												</p>
												<p className="mt-2 text-sm font-medium text-product-text">
													{nextLesson.title}
												</p>
												<Link
													href={getLessonHref(nextLesson.id)}
													className="mt-4 inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
												>
													Open next lesson
												</Link>
											</>
										) : (
											<p className="mt-3 text-sm font-medium text-product-muted">
												Everything unlocked is complete.
											</p>
										)}
									</div>
								</div>
							</div>
						</section>

						<section className="grid gap-4 xl:grid-cols-2">
							{mission.blocks.map((block) => {
								const status = blockStatus(block);
								const blockNextLesson =
									block.lessons.find(
										(lesson) =>
											lesson.status === "in_progress" || lesson.status === "available",
									) ?? block.lessons[0];
								const cardClass = `rounded-none border bg-product-surface/74 shadow-panel backdrop-blur-xl ${
									status === "locked"
										? "border-product-border/70 opacity-60"
										: "border-product-border transition-colors hover:bg-product-surface"
								}`;
								const cardContent = (
									<div className="space-y-4 p-5">
										<div className="relative overflow-hidden border border-product-border bg-product-surface-strong">
											<div className="relative h-[168px]">
												<Image
													src={blockImages[block.id] ?? blockImages.CEO}
													alt={`${block.label} block`}
													fill
													className={`object-cover ${
														status === "locked" ? "grayscale" : ""
													}`}
													sizes="(min-width: 1280px) 50vw, 100vw"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
												<div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
													<div className="border border-white/30 bg-black/45 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/85">
														Block {block.order}
													</div>
													<div
														className={`rounded-none border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] ${
															status === "active"
																? "border-[#95ffff] bg-black/55 text-[#95ffff]"
																: status === "completed"
																	? "border-white/35 bg-black/45 text-white"
																	: status === "ready"
																		? "border-white/35 bg-black/45 text-white"
																		: "border-white/20 bg-black/35 text-white/65"
														}`}
													>
														{statusLabel(status)}
													</div>
												</div>
												<div className="absolute inset-x-0 bottom-0 p-4">
													<p className="font-display text-4xl uppercase leading-none tracking-[0.06em] text-white">
														{block.label}
													</p>
												</div>
											</div>
										</div>

										<div className="grid gap-3 sm:grid-cols-2">
											<div className="border border-product-border bg-product-surface px-4 py-4">
												<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
													Progress
												</p>
												<p className="mt-3 font-display text-3xl uppercase leading-none tracking-[0.05em] text-product-text">
													{block.completedCount}/{block.totalLessons}
												</p>
												<p className="mt-2 text-sm font-medium text-product-muted">
													Lessons finished
												</p>
											</div>
											<div className="border border-product-border bg-product-surface px-4 py-4">
												<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
													Outcome
												</p>
												<p className="mt-3 text-sm font-medium leading-relaxed text-product-text">
													{blockNextLesson.artifactLabel}
												</p>
											</div>
										</div>

										<div className="border border-product-border bg-product-surface-strong/85 px-4 py-4">
											<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
												Next lesson
											</p>
											<p className="mt-3 font-mono text-sm uppercase tracking-[0.08em] text-product-text">
												{blockNextLesson.id}
											</p>
											<p className="mt-2 text-sm font-medium text-product-text">
												{blockNextLesson.title}
											</p>
											<p className="mt-2 text-sm font-medium text-product-muted">
												{status === "locked"
													? "Finish the previous block to unlock this one."
													: status === "completed"
														? "Reopen this block if you want to review the work."
														: "Open the next lesson and keep moving."}
											</p>
										</div>

										<div
											className={`inline-flex rounded-none border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] ${
												status === "locked"
													? "border-product-border/70 bg-product-surface-strong/70 text-product-muted"
													: "border-product-accent bg-product-chip text-product-accent"
											}`}
										>
											{nextActionLabel(status)}
										</div>
									</div>
								);

								if (status === "locked") {
									return (
										<article key={block.id} aria-disabled="true" className={cardClass}>
											{cardContent}
										</article>
									);
								}

								return (
									<Link
										key={block.id}
										href={getLessonHref(blockNextLesson.id)}
										className={cardClass}
									>
										{cardContent}
									</Link>
								);
							})}
						</section>
					</div>
				)}
			</ViewerGate>
		</ProductShell>
	);
}
