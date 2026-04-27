"use client";

import { Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { LessonContent } from "@/lib/course/lesson/model/manifest";

import { RoadmapInlineVideoCard } from "../modes/roadmap-inline-video-card";

type FocusInlineLessonVideoProps = {
	coachContent: LessonContent["coach"];
	helperText?: string;
};

const DEFAULT_HELPER =
	"Play the lesson video, then work through the steps below.";

export function FocusInlineLessonVideo({
	coachContent,
	helperText = DEFAULT_HELPER,
}: FocusInlineLessonVideoProps) {
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
			<CardContent className="p-4 sm:p-5 sm:pt-4">
				<RoadmapInlineVideoCard coachContent={coachContent} />
			</CardContent>
		</Card>
	);
}
