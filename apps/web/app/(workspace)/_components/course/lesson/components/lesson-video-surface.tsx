"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { LessonVideoEmptyState } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-empty-state";
import { LessonVideoMetadata } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-metadata";
import { LessonVideoPlayer } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-player";
import { LessonVideoWatchBareWithControls } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-watch-bare-with-controls";
import type { LessonContent } from "@/lib/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/lib/course/lesson/model/video";
import { cn } from "@/lib/utils";

const PLAYER_CLASS =
	"relative z-10 h-full w-full rounded-none border-0 bg-black object-cover";

export function LessonVideoSurface({
	coachContent,
	variant = "panel",
	emptyState,
	playerFrame = "card",
	className,
}: {
	coachContent: LessonContent["coach"];
	variant?: "panel" | "watch-shell";
	/** When the player sits inside a parent `Card`, use `bare` to avoid nested cards. */
	playerFrame?: "card" | "bare";
	className?: string;
	emptyState?: {
		eyebrow?: string;
		title?: string;
		body: string;
	};
}) {
	const video = coachContent?.video;
	const [isIframeLoading, setIsIframeLoading] = useState(true);
	const isWatchShell = variant === "watch-shell";

	if (video && isLessonVideoReady(video)) {
		if (isWatchShell && playerFrame === "bare") {
			return (
				<LessonVideoWatchBareWithControls video={video} className={className} />
			);
		}

		const ratio = (
			<AspectRatio
				ratio={16 / 9}
				className={cn(
					"relative overflow-hidden bg-black",
					playerFrame === "bare" &&
						"rounded-xl border border-border/60 ring-1 ring-foreground/5",
				)}
			>
				<div
					aria-hidden
					data-testid="lesson-video-loading-backplate"
					data-loaded={isIframeLoading ? "false" : "true"}
					className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-300 motion-reduce:transition-none data-[loaded=true]:opacity-0"
				>
					<Loader2
						className="size-6 animate-spin text-muted-foreground/60 motion-reduce:animate-none"
						aria-hidden
					/>
				</div>
				<LessonVideoPlayer
					video={video}
					title={video.title}
					className={PLAYER_CLASS}
					onReady={() => setIsIframeLoading(false)}
				/>
			</AspectRatio>
		);

		const playerBlock =
			playerFrame === "card" ? (
				<Card className="gap-0 overflow-hidden p-0 py-0">
					{ratio}
					<LessonVideoMetadata
						durationLabel={video.durationLabel}
						footer
						title={video.title}
					/>
				</Card>
			) : (
				<div className="flex flex-col gap-3">
					{ratio}
					<LessonVideoMetadata
						durationLabel={video.durationLabel}
						title={video.title}
					/>
				</div>
			);

		if (playerFrame === "bare") {
			return <div className={cn("w-full", className)}>{playerBlock}</div>;
		}

		return (
			<Card
				className={cn(
					"border-0 bg-transparent p-0 py-0 shadow-none ring-0",
					isWatchShell
						? "mx-auto w-full max-w-[min(100%,58rem)] gap-3"
						: "gap-1.5",
					className,
				)}
			>
				{playerBlock}
			</Card>
		);
	}

	return (
		<LessonVideoEmptyState
			variant={variant}
			eyebrow={
				emptyState?.eyebrow ?? (isWatchShell ? "Watch video" : "Watch lesson")
			}
			title={
				emptyState?.title ?? (isWatchShell ? "Video placeholder" : undefined)
			}
			body={
				emptyState?.body ??
				"The lesson video will appear here when it is attached."
			}
		/>
	);
}
