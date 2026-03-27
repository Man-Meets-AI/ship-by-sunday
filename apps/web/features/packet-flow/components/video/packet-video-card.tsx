import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { PacketPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";

export function PacketVideoCard({ content }: { content: PacketPageMedia }) {
	return (
		<section className="space-y-4">
			<div className="space-y-2">
				<h2 className="max-w-xl text-xl font-semibold tracking-tight text-balance">
					{content.title}
				</h2>
				<p className="max-w-xl text-sm leading-6 text-muted-foreground">
					{content.description}
				</p>
			</div>
			<div>
				{content.kind === "video" ? (
					<LessonVideoPlayer
						video={content.video}
						title={content.video.title ?? content.title}
						className="aspect-video w-full rounded-xl border-0 bg-black"
					/>
				) : (
					<div className="flex min-h-40 items-center px-1 py-2 text-sm leading-6 text-muted-foreground">
						{content.body}
					</div>
				)}
			</div>
		</section>
	);
}
