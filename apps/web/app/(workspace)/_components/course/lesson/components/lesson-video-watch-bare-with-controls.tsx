"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LessonVideoControls } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-controls";
import { LessonVideoMetadata } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-metadata";
import { LessonVideoPlayer } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-player";
import { useBunnyPlayerKeyboard } from "@/app/(workspace)/_components/course/lesson/components/use-bunny-player-controls";
import type { LessonVideoContent } from "@/lib/course/lesson/model/contracts";
import { cn } from "@/lib/utils";

const PLAYER_CLASS =
	"relative z-10 h-full w-full rounded-none border-0 bg-ink object-cover";

export function LessonVideoWatchBareWithControls({
	video,
	className,
}: {
	video: LessonVideoContent;
	className?: string;
}) {
	const [isIframeLoading, setIsIframeLoading] = useState(true);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const reducedMotion = useReducedMotion() ?? false;
	const isBunny = video.provider === "bunny";
	const { onKeyDown } = useBunnyPlayerKeyboard(iframeRef, isBunny);

	return (
		<div className={cn("mx-auto w-full max-w-5xl", className)}>
			<div className="flex flex-col gap-3">
				<div
					data-testid="lesson-video-focus-catcher"
					tabIndex={isBunny ? 0 : -1}
					onKeyDown={isBunny ? onKeyDown : undefined}
					className={cn(
						"relative overflow-hidden rounded-xl border border-border/60 ring-1 ring-foreground/5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
					)}
				>
					<AspectRatio
						ratio={16 / 9}
						className="relative overflow-hidden bg-ink"
					>
						<div
							aria-hidden
							data-testid="lesson-video-loading-backplate"
							data-loaded={isIframeLoading ? "false" : "true"}
							className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink transition-opacity duration-300 motion-reduce:transition-none data-[loaded=true]:opacity-0"
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
							onBunnyIframeRef={
								isBunny
									? (el) => {
											iframeRef.current = el;
										}
									: undefined
							}
						/>
					</AspectRatio>
				</div>
				<LessonVideoMetadata
					durationLabel={video.durationLabel}
					title={video.title}
				/>
				<LessonVideoControls
					reducedMotion={reducedMotion}
					variant={isBunny ? "bunny-forward" : "embed-help"}
				/>
			</div>
		</div>
	);
}
