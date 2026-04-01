import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { LessonContent } from "@/features/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

const videoPlayerClass =
	"aspect-video w-full rounded-none border-0 bg-black object-cover";

const DEFAULT_HELPER =
	"Play the lesson video, then work through the steps below.";

function LessonVideoSurface({
	coachContent,
}: {
	coachContent: LessonContent["coach"];
}) {
	const video = coachContent?.video;
	const emptyTitle = "Video isn’t attached yet";
	const emptyBody = "The lesson video will appear here when it is attached.";

	if (video && isLessonVideoReady(video)) {
		return (
			<Card className="gap-0 overflow-hidden p-0 py-0">
				<LessonVideoPlayer
					video={video}
					title={video.title}
					className={videoPlayerClass}
				/>
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

export function BuildProductIterationWorkbenchInlineVideo({
	coachContent,
	helperText = DEFAULT_HELPER,
}: {
	coachContent: LessonContent["coach"];
	helperText?: string;
}) {
	return (
		<Card className="gap-0 overflow-hidden py-0">
			<CardHeader className="border-b border-border/60 bg-muted/30 px-4 py-3 sm:px-5">
				<div className="flex flex-wrap items-center gap-2">
					<Badge
						variant="outline"
						className="h-6 border-primary/25 bg-primary/8 px-2.5 text-xs font-medium text-primary"
					>
						Watch first
					</Badge>
					<span className="text-xs text-muted-foreground">{helperText}</span>
				</div>
			</CardHeader>
			<CardContent className="p-4 sm:p-5 sm:pt-4">
				<LessonVideoSurface coachContent={coachContent} />
			</CardContent>
		</Card>
	);
}
