"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { WorkbenchModeProps } from "../../types";

import { BuildProductIterationTabs } from "./build-product-iteration-tabs";
import { BuildProductIterationWorkbenchHeader } from "./build-product-iteration-workbench-header";
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
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

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
			<BuildProductIterationWorkbenchHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
					<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
						{inlineVideoCard}
					</div>
					<div className="min-w-0">{body}</div>
				</div>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{body}
				</>
			) : (
				body
			)}
		</div>
	);
}
