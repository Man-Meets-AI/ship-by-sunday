"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";

import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import type { ArtifactPreview } from "@/features/course/lesson/model/registry";
import { ArtifactPreviewContent } from "@/features/course/lesson/workbench/shared/artifact-preview-content";
import { ProductShell } from "@/features/course/shared/components/product-shell";

const skeletonCardIds = ["one", "two", "three", "four"] as const;

function ArtifactsSkeleton() {
	return (
		<div className="mt-4 grid animate-pulse gap-4 md:grid-cols-2">
			{skeletonCardIds.map((cardId) => (
				<article
					key={cardId}
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

export function ArtifactsPage() {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const artifacts = useQuery(
		api.course.listArtifacts,
		isAuthenticated && !isLoading ? {} : "skip",
	) as ArtifactPreview[] | undefined;

	return (
		<ProductShell
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
							href={routeConfig.mission}
							className="inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
						>
							Open mission
						</Link>
					</div>
				) : (
					<div className="mt-4 grid gap-4 md:grid-cols-2">
						{artifacts.map((artifact) => (
							<article
								key={artifact.artifactKey}
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
								<div className="mt-4 rounded-none border border-product-border bg-product-surface p-3">
									<ArtifactPreviewContent
										artifact={artifact}
										maxTextFields={4}
									/>
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
