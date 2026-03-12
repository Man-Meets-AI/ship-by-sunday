"use client";

import type { WorkbenchType } from "@/lib/course/manifest";
import {
	getObjectiveTasks,
	getWorkbenchSectionStates,
	getWorkbenchSections,
} from "@/lib/course/registry";

import { BriefAssemblerWorkbench } from "./modes/brief-assembler-workbench";
import { CaptureUploadWorkbench } from "./modes/capture-upload-workbench";
import { CollectorBoardWorkbench } from "./modes/collector-board-workbench";
import { ConsoleChecklistWorkbench } from "./modes/console-checklist-workbench";
import { ExternalWorkspaceWorkbench } from "./modes/external-workspace-workbench";
import { GuidedFormWorkbench } from "./modes/guided-form-workbench";
import { RoadmapOverviewWorkbench } from "./modes/roadmap-overview-workbench";
import { ScoreTableWorkbench } from "./modes/score-table-workbench";
import { ScopeSplitWorkbench } from "./modes/scope-split-workbench";
import { TrackerLogWorkbench } from "./modes/tracker-log-workbench";
import type { WorkbenchModeComponent, WorkbenchRendererProps } from "./types";
import { WorkbenchContainer } from "./shared/workbench-container";
import { WorkbenchHeader } from "./shared/workbench-header";

const modeRenderers: Record<WorkbenchType, WorkbenchModeComponent> = {
	guided_form: GuidedFormWorkbench,
	score_table: ScoreTableWorkbench,
	collector_board: CollectorBoardWorkbench,
	capture_upload: CaptureUploadWorkbench,
	scope_split: ScopeSplitWorkbench,
	brief_assembler: BriefAssemblerWorkbench,
	console_checklist: ConsoleChecklistWorkbench,
	roadmap_overview: RoadmapOverviewWorkbench,
	tracker_log: TrackerLogWorkbench,
	external_workspace: ExternalWorkspaceWorkbench,
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
}: WorkbenchRendererProps) {
	const fields = lesson.workbenchFields ?? [];
	const workbenchSections = getWorkbenchSections(lesson);
	const sectionStates = getWorkbenchSectionStates(lesson, fieldValues as any);
	const objectiveTasks = getObjectiveTasks(lesson, fieldValues as any);
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
			fields={fields}
			objectiveTasks={objectiveTasks}
			completedTaskCount={completedTaskCount}
			workbenchSections={workbenchSections}
			sectionStates={sectionStates}
		/>
	);
}
