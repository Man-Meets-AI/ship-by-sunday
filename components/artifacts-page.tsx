"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

export function ArtifactsPage() {
	const { isAuthenticated } = useConvexAuth();
	const artifacts = useQuery(
		api.course.listArtifacts,
		isAuthenticated ? {} : "skip",
	) as
		| Array<{
				lessonId: string;
				artifactLabel: string;
				lessonTitle: string;
				fields: Array<[string, unknown]>;
		  }>
		| undefined;

	return (
		<ProductShell
			title="Artifacts"
			subtitle="Every saved output that has been completed inside the sprint."
		>
			<ViewerGate>
				<section className="border border-line bg-white p-5 shadow-card">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
						Artifact library
					</p>
					{artifacts === undefined ? (
						<p className="mt-4 text-sm font-medium text-ink/70">
							Loading completed artifacts.
						</p>
					) : artifacts.length === 0 ? (
						<p className="mt-4 text-sm font-medium text-ink/70">
							Nothing has been completed yet. Start from the mission map and
							finish the first lesson to populate this view.
						</p>
					) : (
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							{artifacts.map((artifact) => (
								<article
									key={artifact.lessonId}
									className="border border-line bg-paper p-4"
								>
									<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
										{artifact.lessonId}
									</p>
									<h2 className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.04em]">
										{artifact.artifactLabel}
									</h2>
									<p className="mt-2 text-sm font-medium text-ink/70">
										{artifact.lessonTitle}
									</p>
									<div className="mt-4 space-y-2 text-sm font-medium text-ink/80">
										{artifact.fields.length === 0 ? (
											<p>No structured preview yet.</p>
										) : (
											artifact.fields.slice(0, 4).map(([fieldId, value]) => (
												<div key={fieldId} className="border border-line bg-white p-3">
													<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
														{fieldId.replaceAll("_", " ")}
													</p>
													<p className="mt-2 break-words">
														{Array.isArray(value)
															? JSON.stringify(value)
															: String(value)}
													</p>
												</div>
											))
										)}
									</div>
									<Link
										href={`/lesson/${artifact.lessonId}`}
										className="mt-4 inline-flex border border-line bg-ink px-3 py-2 font-display text-xl uppercase tracking-[0.04em] text-paper"
									>
										Open lesson
									</Link>
								</article>
							))}
						</div>
					)}
				</section>
			</ViewerGate>
		</ProductShell>
	);
}
