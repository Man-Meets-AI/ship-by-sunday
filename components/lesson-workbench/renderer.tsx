"use client";

import type { WorkbenchType } from "@/lib/course/manifest";
import {
	buildResolvedArtifactPreview,
	getObjectiveTasks,
	getWorkbenchSectionStates,
	getWorkbenchSections,
} from "@/lib/course/registry";

import { BriefAssemblerWorkbench } from "./modes/brief-assembler-workbench";
import { CaptureUploadWorkbench } from "./modes/capture-upload-workbench";
import { CollectorBoardWorkbench } from "./modes/collector-board-workbench";
import { CoreFlowMapWorkbench } from "./modes/core-flow-map-workbench";
import { ConsoleChecklistWorkbench } from "./modes/console-checklist-workbench";
import { ExternalWorkspaceWorkbench } from "./modes/external-workspace-workbench";
import { GuidedFormWorkbench } from "./modes/guided-form-workbench";
import { ReferenceGalleryWorkbench } from "./modes/reference-gallery-workbench";
import { RoadmapOverviewWorkbench } from "./modes/roadmap-overview-workbench";
import { SketchUploadWorkbench } from "./modes/sketch-upload-workbench";
import { ScoreTableWorkbench } from "./modes/score-table-workbench";
import { ScopeSplitWorkbench } from "./modes/scope-split-workbench";
import { TrackerLogWorkbench } from "./modes/tracker-log-workbench";
import { VisualDirectionWorkbench } from "./modes/visual-direction-workbench";
import type { WorkbenchModeComponent, WorkbenchRendererProps } from "./types";
import { WorkbenchContainer } from "./shared/workbench-container";
import { WorkbenchHeader } from "./shared/workbench-header";

const modeRenderers: Record<WorkbenchType, WorkbenchModeComponent> = {
	guided_form: GuidedFormWorkbench,
	score_table: ScoreTableWorkbench,
	collector_board: CollectorBoardWorkbench,
	capture_upload: CaptureUploadWorkbench,
	sketch_upload: SketchUploadWorkbench,
	reference_gallery: ReferenceGalleryWorkbench,
	core_flow_map: CoreFlowMapWorkbench,
	scope_split: ScopeSplitWorkbench,
	brief_assembler: BriefAssemblerWorkbench,
	console_checklist: ConsoleChecklistWorkbench,
	roadmap_overview: RoadmapOverviewWorkbench,
	tracker_log: TrackerLogWorkbench,
	external_workspace: ExternalWorkspaceWorkbench,
	visual_direction: VisualDirectionWorkbench,
};

function UnsupportedWorkbench({
	lesson,
	lessonContent,
}: Pick<WorkbenchRendererProps, "lesson" | "lessonContent">) {
	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<div className="rounded-none border border-dashed border-product-border bg-product-surface-strong/70 p-5 text-sm font-medium leading-relaxed text-product-muted">
				This workbench type has not been wired yet.
			</div>
		</WorkbenchContainer>
	);
}

export function WorkbenchRenderer({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds = new Set<string>(),
	fieldValuesReady = true,
}: WorkbenchRendererProps) {
	const fields = lesson.workbenchFields ?? [];
	const resolvedArtifactPreview = buildResolvedArtifactPreview(
		lesson,
		fieldValues as any,
		pinnedArtifacts as any,
	);
	const workbenchSections = getWorkbenchSections(lesson);
	const sectionStates = getWorkbenchSectionStates(lesson, fieldValues as any);
	const objectiveTasks = getObjectiveTasks(lesson, fieldValues as any, {
		pinnedArtifacts: pinnedArtifacts as any,
		resolvedArtifactPreview,
	});
	const completedTaskCount = objectiveTasks.filter(
		(task) => task.status === "complete",
	).length;

	const ModeRenderer = modeRenderers[lesson.workbench];

	if (!ModeRenderer) {
		return (
			<UnsupportedWorkbench lesson={lesson} lessonContent={lessonContent} />
		);
	}

	return (
		<ModeRenderer
			lesson={lesson}
			lessonContent={lessonContent}
			fieldValues={fieldValues}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
			fieldValuesReady={fieldValuesReady}
			resolvedArtifactPreview={resolvedArtifactPreview}
			fields={fields}
			objectiveTasks={objectiveTasks}
			completedTaskCount={completedTaskCount}
			workbenchSections={workbenchSections}
			sectionStates={sectionStates}
		/>
	);
}
