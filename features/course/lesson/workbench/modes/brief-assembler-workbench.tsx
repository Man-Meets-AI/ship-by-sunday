import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FieldList } from "../fields/field-list";
import { ArtifactPreviewContent } from "../shared/artifact-preview-content";
import type { WorkbenchModeProps } from "../types";
import { DefaultBriefAssemblerWorkbench } from "./brief-assembler/default-brief-assembler-workbench";
import { StageUnlockWorkbench } from "./brief-assembler/stage-unlock-workbench";

export function BriefAssemblerWorkbench(props: WorkbenchModeProps) {
	if (props.lesson.briefAssembler?.variant === "stage_unlock") {
		const showLeadVideo = props.lesson.briefAssembler.leadVideo;

		return (
			<StageUnlockWorkbench
				lesson={props.lesson}
				fieldValues={props.fieldValues}
				onFieldChange={props.onFieldChange}
				invalidFieldIds={props.invalidFieldIds}
				invalidFieldMessages={props.invalidFieldMessages}
				stageUnlockSummary={props.stageUnlockSummary}
				videoSlot={
					showLeadVideo ? (
						<LessonVideoSurface
							coachContent={props.lessonContent.coach}
							variant="watch-shell"
						/>
					) : null
				}
			/>
		);
	}

	const artifactsSlot =
		props.pinnedArtifacts.length > 0 ? (
			<div className="grid gap-3 md:grid-cols-2">
				{props.pinnedArtifacts.map((artifact) => (
					<Card key={artifact.artifactKey} className="gap-0 py-0">
						<CardHeader className="border-b border-border/60 pb-4">
							<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{artifact.contextTitle ?? artifact.artifactLabel}
							</CardTitle>
						</CardHeader>
						<CardContent className="py-4">
							<ArtifactPreviewContent artifact={artifact} />
						</CardContent>
					</Card>
				))}
			</div>
		) : null;

	const fieldsSlot = (
		<FieldList
			fields={props.fields}
			fieldValues={props.fieldValues}
			onFieldChange={props.onFieldChange}
			pinnedArtifacts={props.pinnedArtifacts}
			invalidFieldIds={props.invalidFieldIds}
			invalidFieldMessages={props.invalidFieldMessages}
			className="space-y-2"
		/>
	);

	return (
		<DefaultBriefAssemblerWorkbench
			lesson={props.lesson}
			lessonContent={props.lessonContent}
			completedTaskCount={props.completedTaskCount}
			objectiveTasks={props.objectiveTasks}
			artifactsSlot={artifactsSlot}
			fieldsSlot={fieldsSlot}
		/>
	);
}
