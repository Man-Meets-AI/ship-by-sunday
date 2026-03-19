"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { LessonContent } from "@/features/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

const chromeLabelClass = "text-xs font-medium text-muted-foreground";

export function LessonVideoSurface({
	coachContent,
	variant = "panel",
	emptyState,
	playerFrame = "card",
}: {
	coachContent: LessonContent["coach"];
	variant?: "panel" | "watch-shell";
	/** When the player sits inside a parent `Card`, use `bare` to avoid nested cards. */
	playerFrame?: "card" | "bare";
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
	const videoPlayerClass =
		"aspect-video w-full rounded-none border-0 bg-black object-cover";

	if (video && isLessonVideoReady(video)) {
		const player = (
			<LessonVideoPlayer
				video={video}
				title={video.title}
				className={videoPlayerClass}
			/>
		);
		const inner = (
			<>
				{playerFrame === "bare" ? (
					<div className="overflow-hidden rounded-lg border border-border bg-black">
						{player}
					</div>
				) : (
					<Card className="gap-0 overflow-hidden p-0 py-0">{player}</Card>
				)}
				{video.title || video.durationLabel ? (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						{video.title ? <p>{video.title}</p> : null}
						{video.durationLabel ? <p>{video.durationLabel}</p> : null}
					</div>
				) : null}
			</>
		);
		return (
			<div
				className={
					isWatchShell
						? "mx-auto w-full max-w-[min(100%,58rem)] space-y-3"
						: "space-y-1.5"
				}
			>
				{inner}
			</div>
		);
	}

	if (isWatchShell) {
		const emptyInner = (
			<div className="max-w-md space-y-3">
				<p className={chromeLabelClass}>{emptyEyebrow}</p>
				{emptyTitle ? (
					<p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						{emptyTitle}
					</p>
				) : null}
				<p className="text-sm leading-relaxed text-muted-foreground">
					{emptyBody}
				</p>
			</div>
		);
		if (playerFrame === "bare") {
			return (
				<div className="flex aspect-video min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
					{emptyInner}
				</div>
			);
		}
		return (
			<Card className="gap-0 border border-dashed border-border bg-muted/30 py-0 ring-0">
				<CardContent className="flex aspect-video min-h-[320px] flex-col items-center justify-center px-6 py-8 text-center">
					{emptyInner}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="gap-0 border border-dashed border-border bg-muted/30 py-0 ring-0">
			<CardContent className="flex aspect-video flex-col items-center justify-center px-4 py-6 text-center">
				<div className="max-w-sm space-y-2">
					<p className={chromeLabelClass}>{emptyEyebrow}</p>
					{emptyTitle ? (
						<p className="text-lg font-semibold tracking-tight text-foreground">
							{emptyTitle}
						</p>
					) : null}
					<p className="text-sm leading-relaxed text-muted-foreground">
						{emptyBody}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
