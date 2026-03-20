"use client";

import type { ReactNode } from "react";
import { Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
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

const DEFAULT_HELPER =
	"Play the lesson video, then work through the steps below.";

type CoreUxPlanFlowInlineVideoProps = {
	coachContent: LessonContent["coach"];
	helperText?: string;
};

function VideoEmptyState() {
	return (
		<div className="flex aspect-video min-h-[320px] flex-col items-center justify-center border border-dashed border-border bg-muted/30 px-6 py-8 text-center">
			<div className="max-w-md space-y-2">
				<CardTitle className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
					Video isn’t attached yet
				</CardTitle>
				<CardDescription className="text-sm leading-relaxed">
					The lesson video will appear here when it is attached.
				</CardDescription>
			</div>
		</div>
	);
}

export function CoreUxPlanFlowInlineVideo({
	coachContent,
	helperText = DEFAULT_HELPER,
}: CoreUxPlanFlowInlineVideoProps) {
	const video = coachContent?.video;

	let body: ReactNode = <VideoEmptyState />;

	if (video && isLessonVideoReady(video)) {
		const src = resolveLessonVideoUrl(video);
		if (src) {
			body =
				video.provider === "bunny" ? (
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
				);
		}
	}

	return (
		<Card className="gap-0 overflow-hidden py-0">
			<CardHeader className="border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-5">
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						variant="outline"
						className="h-6 gap-1 border-primary/25 bg-primary/8 px-2.5 text-xs font-medium text-primary"
					>
						<Play className="size-3 opacity-90" aria-hidden />
						Watch first
					</Badge>
					<span className="text-xs text-muted-foreground">{helperText}</span>
				</div>
			</CardHeader>
			<CardContent className="p-0">{body}</CardContent>
		</Card>
	);
}
