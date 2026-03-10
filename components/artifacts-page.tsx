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
				<section className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
					<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
						Artifact library
					</p>
					{artifacts === undefined ? (
						<p className="mt-4 text-sm font-medium text-product-muted">
							Loading completed artifacts.
						</p>
					) : artifacts.length === 0 ? (
						<p className="mt-4 text-sm font-medium text-product-muted">
							Nothing has been completed yet. Start from the mission map and
							finish the first lesson to populate this view.
						</p>
					) : (
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							{artifacts.map((artifact) => (
								<article
									key={artifact.lessonId}
									className="rounded-none border border-product-border bg-product-surface-strong/80 p-4"
								>
									<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
										{artifact.lessonId}
									</p>
									<h2 className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.05em] text-product-text">
										{artifact.artifactLabel}
									</h2>
									<p className="mt-2 text-sm font-medium text-product-muted">
										{artifact.lessonTitle}
									</p>
									<div className="mt-4 space-y-2 text-sm font-medium text-product-text">
										{artifact.fields.length === 0 ? (
											<p>No structured preview yet.</p>
										) : (
											artifact.fields.slice(0, 4).map(([fieldId, value]) => (
												<div
													key={fieldId}
													className="rounded-none border border-product-border bg-product-surface p-3"
												>
													<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
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
										className="mt-4 inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
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
