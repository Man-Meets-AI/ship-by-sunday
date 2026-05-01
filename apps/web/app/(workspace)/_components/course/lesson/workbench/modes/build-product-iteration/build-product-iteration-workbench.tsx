"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { WorkbenchModeProps } from "../../types";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaPlacement } from "../../shared/workbench-media-layout";

import { BuildProductIterationTabs } from "./build-product-iteration-tabs";
import { BuildProductIterationWorkbenchInlineVideo } from "./build-product-iteration-workbench-inline-video";
import { BuildProductIterationWorkbenchPinnedArtifacts } from "./build-product-iteration-workbench-pinned-artifacts";

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
	const inlineVideoCard = (
		<BuildProductIterationWorkbenchInlineVideo
			coachContent={lessonContent.coach}
		/>
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
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
			/>
			<Card className="border-dashed bg-muted/20">
				<CardContent className="pt-4 text-xs text-muted-foreground">
					Soft launch and distribution are a later step—finish outputs here
					first.
				</CardContent>
			</Card>
			<BuildProductIterationWorkbenchPinnedArtifacts
				pinnedArtifacts={pinnedArtifacts}
			/>
		</div>
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			<WorkbenchMediaPlacement
				lesson={lesson}
				layoutMode={layoutMode}
				media={inlineVideoCard}
			>
				{body}
			</WorkbenchMediaPlacement>
		</div>
	);
}
