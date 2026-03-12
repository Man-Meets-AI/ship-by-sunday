"use client";

import type { LessonContent } from "@/lib/course/manifest";

export function LessonVideoSurface({
	coachContent,
	variant = "panel",
}: {
	coachContent: LessonContent["coach"];
	variant?: "panel" | "watch-shell";
}) {
	const video = coachContent?.video;
	const isWatchShell = variant === "watch-shell";

	if (video?.status === "ready" && video.url) {
		return (
			<div className={isWatchShell ? "space-y-3" : "space-y-1.5"}>
				<video
					controls
					poster={video.posterUrl}
					className={
						isWatchShell
							? "aspect-video w-full rounded-none border border-product-border bg-product-surface-strong shadow-panel"
							: "aspect-video w-full rounded-none border border-product-border bg-product-surface-strong"
					}
					src={video.url}
				/>
				{video.title || video.durationLabel ? (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.18em] text-product-muted">
						{video.title ? <p>{video.title}</p> : null}
						{video.durationLabel ? <p>{video.durationLabel}</p> : null}
					</div>
				) : null}
			</div>
		);
	}

	if (isWatchShell) {
		return (
			<div className="flex aspect-video min-h-[320px] w-full items-center justify-center rounded-none border border-dashed border-product-border bg-product-surface-strong/70 px-6 py-8 text-center shadow-panel">
				<div className="max-w-md space-y-3">
					<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-product-muted">
						Watch video
					</p>
					<p className="font-display text-2xl uppercase tracking-[0.08em] text-product-text sm:text-3xl">
						Video placeholder
					</p>
					<p className="text-sm font-medium leading-relaxed text-product-muted">
						The lesson video will appear here when it is attached.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex aspect-video items-center justify-center rounded-none border border-dashed border-product-border bg-product-surface-strong/70 px-4 py-6 text-center">
			<div className="max-w-sm space-y-2">
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
					Watch lesson
				</p>
				<p className="text-sm font-medium leading-relaxed text-product-muted">
					The lesson video will appear here when it is attached.
				</p>
			</div>
		</div>
	);
}
