"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { BuildProductIterationTabs } from "./build-product-iteration-tabs";

export function BuildProductIterationWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	layoutMode,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
}: WorkbenchModeProps) {
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const body = (
		<div className="space-y-6">
			<p className="border-l-2 border-border pl-3 text-xs text-muted-foreground">
				Lightweight wrap-up: link the right accounts, paste one prompt into
				ChatGPT, save brand instructions, then land starter ideas and posts.
			</p>
			<BuildProductIterationTabs
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<Card className="border-dashed bg-muted/20">
				<CardContent className="pt-4 text-xs text-muted-foreground">
					Soft launch and distribution are a later step—finish outputs here first.
				</CardContent>
			</Card>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>{body}</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{body}
				</>
			) : (
				body
			)}
		</WorkbenchContainer>
	);
}
