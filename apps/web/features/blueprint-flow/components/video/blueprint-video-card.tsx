import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { BlueprintPageMedia } from "@/features/blueprint-flow/lib/blueprint-stage-videos";

export function BlueprintVideoCard({
	content,
}: {
	content: BlueprintPageMedia;
}) {
	if (content.kind === "video") {
		return (
			<section className="relative overflow-hidden rounded-2xl border border-border/40 shadow-xl ring-1 ring-black/5">
				<LessonVideoPlayer
					video={content.video}
					title={content.video.title ?? content.title}
					className="aspect-video w-full border-0 bg-black"
				/>
			</section>
		);
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-border/40 bg-muted/20 p-6 shadow-lg ring-1 ring-black/5 space-y-5">
			<div className="space-y-2">
				<h2 className="text-lg font-bold tracking-tight text-foreground">
					{content.title}
				</h2>
				<p className="text-[0.8rem] leading-6 text-muted-foreground/90">
					{content.description}
				</p>
			</div>
			{content.body ? (
				<div className="text-[0.75rem] italic leading-6 text-muted-foreground/70 border-t border-border/40 pt-4">
					&ldquo;{content.body}&rdquo;
				</div>
			) : null}
		</section>
	);
}
