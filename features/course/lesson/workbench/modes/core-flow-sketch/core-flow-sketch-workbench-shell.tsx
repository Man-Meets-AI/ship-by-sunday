"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
	LessonConfig,
	LessonContent,
} from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";
import { formatArtifactValue } from "@/features/course/lesson/workbench/shared/artifact-format";
import { renderLessonTitle } from "@/features/course/lesson/workbench/shared/workbench-header";

import { CoreFlowSketchInlineVideo } from "./core-flow-sketch-inline-video";

type CoreFlowSketchWorkbenchShellProps = {
	lesson: LessonConfig;
	lessonContent: LessonContent;
	pinnedArtifacts: PinnedArtifact[];
	showSplitMedia: boolean;
	children: ReactNode;
};

export function CoreFlowSketchWorkbenchShell({
	lesson,
	lessonContent,
	pinnedArtifacts,
	showSplitMedia,
	children,
}: CoreFlowSketchWorkbenchShellProps) {
	const video = (
		<CoreFlowSketchInlineVideo coachContent={lessonContent.coach} />
	);

	const pinned =
		pinnedArtifacts.length > 0 ? (
			<div className="grid gap-3 md:grid-cols-2">
				{pinnedArtifacts.map((artifact) => (
					<Card key={artifact.artifactKey}>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">
								{artifact.contextTitle ?? artifact.artifactLabel}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							{artifact.fields.map(([label, value]) => (
								<div key={label}>
									<p className="font-medium text-foreground">{label}</p>
									<p className="whitespace-pre-wrap text-muted-foreground">
										{formatArtifactValue(value)}
									</p>
								</div>
							))}
						</CardContent>
					</Card>
				))}
			</div>
		) : null;

	const mainColumn = (
		<div className="min-w-0 space-y-4">
			{pinned}
			{children}
		</div>
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<div className="space-y-3">
				<div className="flex flex-wrap items-center gap-2 text-muted-foreground">
					<Badge variant="secondary" className="text-xs font-medium">
						{lesson.id}
					</Badge>
					<Badge variant="outline" className="text-xs font-medium">
						{lesson.artifact.label}
					</Badge>
					{lessonContent.lessonMeta.runtimeLabel ? (
						<span className="text-xs font-medium text-muted-foreground">
							{lessonContent.lessonMeta.runtimeLabel}
						</span>
					) : null}
				</div>
				<h1 className="text-balance text-3xl font-semibold text-foreground sm:text-4xl">
					{renderLessonTitle(lesson.title)}
				</h1>
				<p className="max-w-prose pt-0.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
					{lessonContent.intro}
				</p>
			</div>
			<Separator className="bg-border" />
			{showSplitMedia ? (
				<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
					<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
						{video}
					</div>
					{mainColumn}
				</div>
			) : (
				<>
					{video}
					{mainColumn}
				</>
			)}
		</div>
	);
}
