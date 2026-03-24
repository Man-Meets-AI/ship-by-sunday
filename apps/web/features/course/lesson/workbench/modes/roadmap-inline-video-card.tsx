"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import type { LessonContent } from "@/features/course/lesson/model/manifest";
import {
	isLessonVideoReady,
	resolveLessonVideoUrl,
} from "@/features/course/lesson/model/video";

const BUNNY_IFRAME_ALLOW =
	"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

const videoPlayerClass =
	"aspect-video w-full rounded-none border-0 bg-black object-cover";

export function RoadmapInlineVideoCard({
	coachContent,
}: {
	coachContent: LessonContent["coach"];
}) {
	const video = coachContent?.video;
	const emptyTitle = "Video isn’t attached yet";
	const emptyBody = "The lesson video will appear here when it is attached.";

	if (video && isLessonVideoReady(video)) {
		const src = resolveLessonVideoUrl(video);
		if (!src) {
			return null;
		}

		return (
			<Card className="gap-0 overflow-hidden p-0 py-0">
				{video.provider === "bunny" ? (
					<iframe
						src={src}
						title={video.title ?? "Lesson video"}
						className={videoPlayerClass}
						allow={BUNNY_IFRAME_ALLOW}
						allowFullScreen
						loading="lazy"
						referrerPolicy="strict-origin-when-cross-origin"
					/>
				) : (
					<video
						controls
						poster={video.posterUrl}
						className={videoPlayerClass}
						src={src}
					/>
				)}
			</Card>
		);
	}

	return (
		<Card className="gap-0 border border-dashed border-border bg-muted/30 py-0 ring-0">
			<CardContent className="flex aspect-video min-h-[320px] flex-col items-center justify-center px-6 py-8 text-center">
				<div className="max-w-md space-y-2">
					<CardTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
						{emptyTitle}
					</CardTitle>
					<CardDescription className="text-sm leading-relaxed">
						{emptyBody}
					</CardDescription>
				</div>
			</CardContent>
		</Card>
	);
}
