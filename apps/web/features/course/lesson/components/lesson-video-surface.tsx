"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { LessonVideoMetadata } from "@/features/course/lesson/components/lesson-video-metadata";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { LessonContent } from "@/features/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

import { cn } from "@/lib/utils";

const PLAYER_CLASS =
	"h-full w-full rounded-none border-0 bg-black object-cover";

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

	if (video && isLessonVideoReady(video)) {
		const ratio = (
			<AspectRatio
				ratio={16 / 9}
				className={cn(
					"overflow-hidden bg-black",
					playerFrame === "bare" && "rounded-lg border border-border",
				)}
			>
				<LessonVideoPlayer
					video={video}
					title={video.title}
					className={PLAYER_CLASS}
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
				<>
					{ratio}
					<LessonVideoMetadata
						durationLabel={video.durationLabel}
						title={video.title}
					/>
				</>
			);

		return (
			<Card
				className={cn(
					"border-0 bg-transparent p-0 py-0 shadow-none ring-0",
					isWatchShell
						? "mx-auto w-full max-w-[min(100%,58rem)] gap-3"
						: "gap-1.5",
				)}
			>
				{playerBlock}
			</Card>
		);
	}

	if (isWatchShell) {
		return (
			<Empty className="aspect-video min-h-[320px] border-border bg-muted/30 px-6 py-8">
				<EmptyHeader className="max-w-md gap-3">
					<EmptyTitle className="text-xs font-medium text-muted-foreground">
						{emptyEyebrow}
					</EmptyTitle>
					{emptyTitle ? (
						<EmptyTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							{emptyTitle}
						</EmptyTitle>
					) : null}
					<EmptyDescription>{emptyBody}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<Empty className="aspect-video border-border bg-muted/30 px-4 py-6">
			<EmptyHeader className="max-w-sm gap-2">
				<EmptyTitle className="text-xs font-medium text-muted-foreground">
					{emptyEyebrow}
				</EmptyTitle>
				{emptyTitle ? (
					<EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
						{emptyTitle}
					</EmptyTitle>
				) : null}
				<EmptyDescription>{emptyBody}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
