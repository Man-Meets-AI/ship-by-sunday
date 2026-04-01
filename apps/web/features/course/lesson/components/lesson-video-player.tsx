"use client";

import type { LessonVideoContent } from "@/features/course/lesson/model/contracts";
import { useBunnyVideoAvailability } from "@/features/course/lesson/hooks/use-bunny-video-availability";
import { resolveLessonVideoUrl } from "@/features/course/lesson/model/video";
import { cn } from "@/lib/utils";

const BUNNY_IFRAME_ALLOW =
	"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

export function LessonVideoPlayer({
	video,
	className,
	title,
}: {
	video: LessonVideoContent;
	className: string;
	title?: string;
}) {
	const src = resolveLessonVideoUrl(video);
	const availability = useBunnyVideoAvailability(src, video.provider);

	if (!src) {
		return null;
	}

	if (video.provider === "bunny") {
		if (availability.kind === "checking") {
			return (
				<div
					className={cn(
						className,
						"flex items-center justify-center bg-muted/30 text-center",
					)}
				>
					<div className="space-y-1 px-6">
						<p className="text-sm font-medium text-foreground">
							Checking video availability
						</p>
						<p className="text-xs text-muted-foreground">
							Loading the lesson player.
						</p>
					</div>
				</div>
			);
		}

		if (availability.kind === "unavailable") {
			return (
				<div
					className={cn(
						className,
						"flex items-center justify-center bg-muted/30 text-center",
					)}
				>
					<div className="max-w-md space-y-1 px-6">
						<p className="text-sm font-medium text-foreground">
							Video temporarily unavailable
						</p>
						<p className="text-xs leading-relaxed text-muted-foreground">
							This lesson video is offline right now while the Bunny embed is
							being restored.
						</p>
					</div>
				</div>
			);
		}

		return (
			<iframe
				src={src}
				title={video.title ?? title ?? "Lesson video"}
				className={className}
				allow={BUNNY_IFRAME_ALLOW}
				allowFullScreen
				loading="lazy"
				referrerPolicy="strict-origin-when-cross-origin"
			/>
		);
	}

	return (
		<video controls poster={video.posterUrl} className={className} src={src} />
	);
}
