"use client";

import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { LessonContent } from "@/features/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

export function LessonVideoSurface({
	coachContent,
	variant = "panel",
	emptyState,
}: {
	coachContent: LessonContent["coach"];
	variant?: "panel" | "watch-shell";
	emptyState?: {
		eyebrow?: string;
		title?: string;
		body: string;
	};
}) {
	const video = coachContent?.video;
	const isWatchShell = variant === "watch-shell";
	const emptyEyebrow =
		emptyState?.eyebrow ?? (isWatchShell ? "Watch video" : "Watch lesson");
	const emptyTitle =
		emptyState?.title ?? (isWatchShell ? "Video placeholder" : undefined);
	const emptyBody =
		emptyState?.body ??
		"The lesson video will appear here when it is attached.";

	if (video && isLessonVideoReady(video)) {
		return (
			<div className={isWatchShell ? "space-y-3" : "space-y-1.5"}>
				<LessonVideoPlayer
					video={video}
					title={video.title}
					className={
						isWatchShell
							? "aspect-video w-full rounded-none border border-product-border bg-product-surface-strong shadow-panel"
							: "aspect-video w-full rounded-none border border-product-border bg-product-surface-strong"
					}
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
						{emptyEyebrow}
					</p>
					{emptyTitle ? (
						<p className="font-display text-2xl uppercase tracking-[0.08em] text-product-text sm:text-3xl">
							{emptyTitle}
						</p>
					) : null}
					<p className="text-sm font-medium leading-relaxed text-product-muted">
						{emptyBody}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex aspect-video items-center justify-center rounded-none border border-dashed border-product-border bg-product-surface-strong/70 px-4 py-6 text-center">
			<div className="max-w-sm space-y-2">
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
					{emptyEyebrow}
				</p>
				{emptyTitle ? (
					<p className="font-display text-lg uppercase tracking-[0.08em] text-product-text">
						{emptyTitle}
					</p>
				) : null}
				<p className="text-sm font-medium leading-relaxed text-product-muted">
					{emptyBody}
				</p>
			</div>
		</div>
	);
}
