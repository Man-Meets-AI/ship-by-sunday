"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";

import { getLessonHref } from "@/lib/course/manifest";
import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import type { ProductTheme } from "@/lib/product-theme";

function ArtifactsSkeleton() {
	return (
		<div className="mt-4 grid animate-pulse gap-4 md:grid-cols-2">
			{Array.from({ length: 4 }).map((_, index) => (
				<article
					key={index}
					className="rounded-none border border-product-border bg-product-surface-strong/80 p-4"
				>
					<div className="h-2 w-12 bg-product-border/15" />
					<div className="mt-3 h-6 w-32 bg-product-border/20" />
					<div className="mt-3 h-3 w-40 bg-product-border/10" />
					<div className="mt-4 space-y-2">
						<div className="h-14 border border-product-border/40 bg-product-surface" />
						<div className="h-14 border border-product-border/40 bg-product-surface" />
					</div>
				</article>
			))}
		</div>
	);
}

export function ArtifactsPage({
	initialTheme,
}: {
	initialTheme: ProductTheme;
}) {
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
			initialTheme={initialTheme}
			title="Saved Work"
			subtitle="Your completed outputs in one place."
		>
			<section className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Completed outputs
				</p>
				{artifacts === undefined ? (
					<ArtifactsSkeleton />
				) : artifacts.length === 0 ? (
					<div className="mt-4 space-y-4">
						<p className="text-sm font-medium text-product-muted">
							Nothing has been completed yet. Finish your first lesson and the
							work will show up here automatically.
						</p>
						<Link
							href="/mission"
							className="inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
						>
							Open mission
						</Link>
					</div>
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
										<p>No preview yet.</p>
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
														? value.join(", ")
														: String(value)}
												</p>
											</div>
										))
									)}
								</div>
								<Link
									href={getLessonHref(artifact.lessonId)}
									className="mt-4 inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
								>
									Open lesson
								</Link>
							</article>
						))}
					</div>
				)}
			</section>
		</ProductShell>
	);
}
