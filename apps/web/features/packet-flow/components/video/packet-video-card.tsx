import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import type { PacketPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";

export function PacketVideoCard({ content }: { content: PacketPageMedia }) {
	return (
		<Card>
			<CardHeader className="gap-3">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
							{content.eyebrow}
						</p>
						<CardTitle>{content.title}</CardTitle>
					</div>
					<Badge variant="outline">{content.badge}</Badge>
				</div>
				<p className="text-sm text-muted-foreground">{content.description}</p>
			</CardHeader>
			<CardContent>
				{content.kind === "video" ? (
					<LessonVideoPlayer
						video={content.video}
						title={content.video.title ?? content.title}
						className="aspect-video w-full rounded-xl border-0 bg-black"
					/>
				) : (
					<div className="flex min-h-40 items-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-5 text-sm text-muted-foreground">
						{content.body}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
