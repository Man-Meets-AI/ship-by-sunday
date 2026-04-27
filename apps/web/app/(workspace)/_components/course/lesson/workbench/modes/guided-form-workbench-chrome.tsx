"use client";

import type { ReactNode } from "react";
import { Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { LessonContent } from "@/lib/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/app/(workspace)/_components/course/lesson/shells/types";

import { ArtifactPreviewContent } from "../shared/artifact-preview-content";
import { LessonWorkbenchLabeledCard } from "./lesson-workbench-shadcn-chrome";
import { RoadmapInlineVideoCard } from "./roadmap-inline-video-card";

const DEFAULT_VIDEO_HELPER =
	"Play the lesson video, then work through the steps below.";

export function GuidedFormSplitMediaLayout({
	media,
	children,
}: {
	media: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
			<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
				{media}
			</div>
			<div className="min-w-0">{children}</div>
		</div>
	);
}

export function GuidedFormInlineVideo({
	coachContent,
	helperText = DEFAULT_VIDEO_HELPER,
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

export function GuidedFormArtifactGrid({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (pinnedArtifacts.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			{pinnedArtifacts.map((artifact) => (
				<LessonWorkbenchLabeledCard
					key={artifact.artifactKey}
					label={artifact.contextTitle ?? artifact.artifactLabel}
				>
					<ArtifactPreviewContent artifact={artifact} />
				</LessonWorkbenchLabeledCard>
			))}
		</div>
	);
}
