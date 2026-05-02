"use client";

import type { LessonVideoContent } from "@/lib/course/lesson/model/contracts";
import { resolveLessonVideoUrl } from "@/lib/course/lesson/model/video";

const BUNNY_IFRAME_ALLOW =
	"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

export function LessonVideoPlayer({
	video,
	className,
	title,
	onReady,
}: {
	video: LessonVideoContent;
	className: string;
	title?: string;
	onReady?: () => void;
}) {
	const src = resolveLessonVideoUrl(video);

	if (!src) {
		return null;
	}

	if (video.provider === "bunny") {
		return (
			<iframe
				src={src}
				title={video.title ?? title ?? "Lesson video"}
				className={className}
				allow={BUNNY_IFRAME_ALLOW}
				allowFullScreen
				loading="lazy"
				referrerPolicy="strict-origin-when-cross-origin"
				onLoad={onReady}
			/>
		);
	}

	return (
		<video
			controls
			poster={video.posterUrl}
			className={className}
			src={src}
			onLoadedData={onReady}
		/>
	);
}
