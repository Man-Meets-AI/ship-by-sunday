"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

function statusClasses(status: "available" | "completed" | "in_progress" | "locked") {
	switch (status) {
		case "completed":
			return "border-ink bg-ink text-paper";
		case "in_progress":
			return "border-ink bg-muted text-ink";
		case "available":
			return "border-line bg-white text-ink";
		default:
			return "border-line bg-paper text-ink/45";
	}
}

export function MissionPage() {
	const mission = useQuery(api.course.getMissionState) as
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

	return (
		<ProductShell
			title="Mission"
			subtitle="Track block progress, jump into the next unlocked lesson, and keep the sprint moving."
		>
			<ViewerGate>
				{mission === undefined ? (
					<section className="border border-line bg-white px-5 py-10 shadow-card">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
							Loading mission map
						</p>
					</section>
				) : (
					<>
						<section className="grid gap-4 md:grid-cols-2">
							<div className="border border-line bg-white p-5 shadow-card">
								<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
									Progress
								</p>
								<p className="mt-3 font-display text-6xl uppercase leading-none tracking-[0.04em]">
									{mission.progressCount}/{mission.totalLessons}
								</p>
								<p className="mt-2 text-sm font-medium text-ink/70">
									Completed lessons across the full sprint.
								</p>
							</div>

							<div className="border border-line bg-white p-5 shadow-card">
								<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
									Next action
								</p>
								{mission.blocks
									.flatMap((block) => block.lessons)
									.find((lesson) => lesson.status === "in_progress" || lesson.status === "available") ? (
									(() => {
										const nextLesson = mission.blocks
											.flatMap((block) => block.lessons)
											.find(
												(lesson) =>
													lesson.status === "in_progress" ||
													lesson.status === "available",
											);

										if (!nextLesson) {
											return null;
										}

										return (
											<div className="mt-3">
												<p className="font-display text-3xl uppercase tracking-[0.04em]">
													{nextLesson.id} {nextLesson.title}
												</p>
												<p className="mt-2 text-sm font-medium text-ink/70">
													{nextLesson.status === "in_progress"
														? "Pick up where you left off."
														: "This lesson is ready to start."}
												</p>
												<Link
													href={`/lesson/${nextLesson.id}`}
													className="mt-4 inline-flex border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper"
												>
													Open lesson
												</Link>
											</div>
										);
									})()
								) : (
									<p className="mt-3 text-sm font-medium text-ink/70">
										All unlocked lessons are complete.
									</p>
								)}
							</div>
						</section>

						<div className="grid gap-4 lg:grid-cols-2">
							{mission.blocks.map((block) => (
								<section
									key={block.id}
									className="border border-line bg-white p-5 shadow-card"
								>
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
												Block {block.order}
											</p>
											<h2 className="mt-2 font-display text-4xl uppercase leading-none tracking-[0.04em]">
												{block.label}
											</h2>
										</div>
										<p className="text-sm font-semibold text-ink/70">
											{block.completedCount}/{block.totalLessons} complete
										</p>
									</div>

									<div className="mt-5 grid gap-3">
										{block.lessons.map((lesson) => (
											<Link
												key={lesson.id}
												href={`/lesson/${lesson.id}`}
												className={`border p-4 transition-transform hover:-translate-y-1 ${statusClasses(
													lesson.status,
												)}`}
											>
												<div className="flex items-start justify-between gap-4">
													<div>
														<p className="text-xs font-bold uppercase tracking-[0.18em]">
															{lesson.id}
														</p>
														<p className="mt-2 font-display text-2xl uppercase leading-none tracking-[0.04em]">
															{lesson.shortTitle}
														</p>
														<p className="mt-2 text-sm font-medium opacity-80">
															{lesson.artifactLabel}
														</p>
													</div>
													<div className="text-right text-xs font-bold uppercase tracking-[0.18em]">
														<p>{lesson.status.replace("_", " ")}</p>
														{lesson.isImplemented ? null : (
															<p className="mt-2 opacity-60">Partial UI</p>
														)}
													</div>
												</div>
											</Link>
										))}
									</div>
								</section>
							))}
						</div>
					</>
				)}
			</ViewerGate>
		</ProductShell>
	);
}
