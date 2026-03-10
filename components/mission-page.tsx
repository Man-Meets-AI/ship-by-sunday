"use client";

import Image from "next/image";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

const blockImages: Record<string, string> = {
	CEO: "/product/block-ceo.png",
	DESIGN: "/product/block-design.png",
	BUILD: "/product/block-build.png",
	SHIP: "/product/block-ship.png",
};

function blockStatus(block: {
	completedCount: number;
	totalLessons: number;
	lessons: Array<{ status: "available" | "completed" | "in_progress" | "locked" }>;
}) {
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

function statusCopy(status: ReturnType<typeof blockStatus>) {
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

function railDotClass(status: "available" | "completed" | "in_progress" | "locked") {
	switch (status) {
		case "completed":
			return "bg-product-accent";
		case "in_progress":
			return "border border-product-accent bg-product-chip";
		case "available":
			return "border border-product-border bg-product-surface";
		default:
			return "border border-product-border/60 bg-product-surface-strong/60";
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
		  }
		| undefined;

	const nextLesson = mission?.blocks
		.flatMap((block) => block.lessons)
		.find((lesson) => lesson.status === "in_progress" || lesson.status === "available");

	return (
		<ProductShell currentBlockId={mission?.blocks.find((block) => blockStatus(block) !== "locked")?.id}>
			<ViewerGate>
				{mission === undefined ? (
					<section className="rounded-[26px] border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Loading mission map
						</p>
						<p className="mt-4 font-display text-4xl uppercase tracking-[0.08em] text-product-text">
							Loading
						</p>
					</section>
				) : (
					<div className="space-y-4">
						<section className="rounded-[28px] border border-product-border bg-product-surface/70 px-5 py-6 shadow-panel backdrop-blur-xl lg:px-6">
							<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
								<div>
									<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
										Mission control
									</p>
									<h1 className="mt-4 font-display text-5xl uppercase leading-none tracking-[0.08em] text-product-text sm:text-6xl">
										Ship an app by Sunday
									</h1>
									<p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-product-muted">
										Move through CEO, DESIGN, BUILD, and SHIP in order. Each lesson
										creates a real artifact, and every block exists to get a v1
										into the world instead of turning this into another course you
										watch.
									</p>
								</div>

								<div className="rounded-[22px] border border-product-border bg-product-surface-strong/75 px-5 py-4">
									<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
										Next action
									</p>
									{nextLesson ? (
										<>
											<p className="mt-3 font-display text-3xl uppercase tracking-[0.05em] text-product-text">
												{nextLesson.id} {nextLesson.title}
											</p>
											<p className="mt-2 text-sm font-medium text-product-muted">
												{nextLesson.status === "in_progress"
													? "Pick up where you left off."
													: "This lesson is unlocked and ready to start."}
											</p>
											<Link
												href={`/lesson/${nextLesson.id}`}
												className="mt-4 inline-flex rounded-full border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
											>
												Open lesson
											</Link>
										</>
									) : (
										<p className="mt-3 text-sm font-medium text-product-muted">
											Everything unlocked is complete.
										</p>
									)}
								</div>
							</div>
						</section>

						<section className="grid gap-4 xl:grid-cols-4">
							{mission.blocks.map((block) => {
								const status = blockStatus(block);
								const blockNextLesson =
									block.lessons.find(
										(lesson) =>
											lesson.status === "in_progress" || lesson.status === "available",
									) ?? block.lessons[0];
								const cardClass = `group overflow-hidden rounded-[28px] border border-product-border bg-product-surface/70 shadow-panel backdrop-blur-xl ${
									status === "locked"
										? "cursor-not-allowed opacity-55"
										: "transition-transform hover:-translate-y-1"
								}`;
								const cardContent = (
									<>
										<div className="relative h-[240px] overflow-hidden">
											<Image
												src={blockImages[block.id] ?? blockImages.CEO}
												alt={`${block.label} block`}
												fill
												className={`object-cover transition-transform duration-300 ${
													status === "locked" ? "grayscale" : "group-hover:scale-105"
												}`}
												sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
											<div className="absolute inset-x-0 bottom-0 p-5">
												<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/75">
													Block {block.order}
												</p>
												<p className="mt-2 font-display text-5xl uppercase leading-none tracking-[0.06em] text-white">
													{block.label}
												</p>
												<p className="mt-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[#95ffff]">
													{statusCopy(status)}
												</p>
											</div>
										</div>
										<div className="space-y-4 px-5 py-5">
											<p className="text-sm font-medium text-product-muted">
												{block.completedCount}/{block.totalLessons} lessons complete in
												this block.
											</p>
											<div className="flex flex-wrap gap-2">
												{block.lessons.map((lesson) => (
													<span
														key={lesson.id}
														className={`inline-flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-product-text ${railDotClass(
															lesson.status,
														)}`}
													>
														<span className="size-2 rounded-full bg-current" />
														{lesson.id}
													</span>
												))}
											</div>
											<div>
												<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
													Next entry
												</p>
												<p className="mt-2 font-medium text-product-text">
													{blockNextLesson.id} {blockNextLesson.title}
												</p>
												<p className="mt-2 text-sm font-medium text-product-muted">
													{blockNextLesson.artifactLabel}
												</p>
											</div>
										</div>
									</>
								);

								if (status === "locked") {
									return (
										<article
											key={block.id}
											aria-disabled="true"
											className={cardClass}
										>
											{cardContent}
										</article>
									);
								}

								return (
									<Link
										key={block.id}
										href={`/lesson/${blockNextLesson.id}`}
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
