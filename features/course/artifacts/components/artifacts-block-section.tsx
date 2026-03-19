"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import type { BlockConfig } from "@/features/course/lesson/model/manifest";
import type { ArtifactPreview } from "@/features/course/lesson/model/registry";
import { ArtifactPreviewContent } from "@/features/course/lesson/workbench/shared/artifact-preview-content";

export type BlockGroup = {
	block: BlockConfig;
	artifacts: ArtifactPreview[];
};

function ArtifactRow({ artifact }: { artifact: ArtifactPreview }) {
	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1 space-y-1">
					<p className="text-xs text-muted-foreground">{artifact.lessonId}</p>
					<p className="text-sm font-medium leading-snug">
						{artifact.artifactLabel}
					</p>
					<p className="text-sm text-muted-foreground">
						{artifact.lessonTitle}
					</p>
				</div>
				<Button asChild variant="outline" size="sm" className="shrink-0">
					<Link href={getLessonHref(artifact.lessonId)}>Open lesson</Link>
				</Button>
			</div>
			<div className="rounded-md bg-muted/50 p-3">
				<ArtifactPreviewContent artifact={artifact} maxTextFields={4} />
			</div>
		</div>
	);
}

export function ArtifactsBlockSection({ group }: { group: BlockGroup }) {
	const count = group.artifacts.length;
	const countLabel = `${count} ${count === 1 ? "artifact" : "artifacts"}`;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{group.block.label}</CardTitle>
				<CardAction>
					<Badge variant="secondary">{countLabel}</Badge>
				</CardAction>
			</CardHeader>
			<CardContent className="space-y-6">
				{group.artifacts.map((artifact, index) => (
					<div key={artifact.artifactKey}>
						{index > 0 ? <Separator className="mb-6" /> : null}
						<ArtifactRow artifact={artifact} />
					</div>
				))}
			</CardContent>
		</Card>
	);
}
