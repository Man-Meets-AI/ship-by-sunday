"use client";

import type { WorkbenchType } from "@/features/course/lesson/model/manifest";
import {
	buildResolvedArtifactPreview,
	getObjectiveTasks,
	getWorkbenchSectionStates,
	getWorkbenchSections,
} from "@/features/course/lesson/model/registry";
import { buildStageUnlockSummary } from "@/features/course/lesson/model/stage-unlock";
import { BrandKitWorkbench } from "./modes/brand-kit/brand-kit-workbench";
import { BriefAssemblerWorkbench } from "./modes/brief-assembler-workbench";
import { BuildProductIterationWorkbench } from "./modes/build-product-iteration/build-product-iteration-workbench";
import { BuildSettingUpSlicesWorkbench } from "./modes/build-setting-up-slices/build-setting-up-slices-workbench";
import { BuildShipRoadmapWorkbench } from "./modes/build-ship-roadmap/build-ship-roadmap-workbench";
import { BuildSetupLaunchpadWorkbench } from "./modes/build-setup-launchpad/build-setup-launchpad-workbench";
import { CaptureUploadWorkbench } from "./modes/capture-upload-workbench";
import { CheckoutQaLoopWorkbench } from "./modes/checkout-qa-loop/checkout-qa-loop-workbench";
import { CodexMarketingSiteWorkbench } from "./modes/codex-marketing-site/codex-marketing-site-workbench";
import { CollectorBoardWorkbench } from "./modes/collector-board-workbench";
import { CompetitorResearchLightWorkbench } from "./modes/competitor-research-light/competitor-research-light-workbench";
import { ConsoleChecklistWorkbench } from "./modes/console-checklist-workbench";
import { CoreFlowSketchWorkbench } from "./modes/core-flow-sketch/core-flow-sketch-workbench";
import { CoreUxBuildWorkbench } from "./modes/core-ux-build/core-ux-build-workbench";
import { CoreUxPlanFlowWorkbench } from "./modes/core-ux-plan-flow/core-ux-plan-flow-workbench";
import { ExternalWorkspaceWorkbench } from "./modes/external-workspace-workbench";
import { FreshTemplatePlanWorkbench } from "./modes/fresh-template-plan/fresh-template-plan-workbench";
import { GuidedFormWorkbench } from "./modes/guided-form-workbench";
import { PaperPhotoUploadWorkbench } from "./modes/paper-photo-upload-workbench";
import { ProductionDeployHandoffWorkbench } from "./modes/production-deploy-handoff/production-deploy-handoff-workbench";
import { ReferenceGalleryWorkbench } from "./modes/reference-gallery-workbench";
import { RepoMapOrientationWorkbench } from "./modes/repo-map-orientation-workbench";
import { RouteAccessOrientationWorkbench } from "./modes/route-access-orientation/route-access-orientation-workbench";
import { RoadmapOverviewWorkbench } from "./modes/roadmap-overview-workbench";
import { ScoreTableWorkbench } from "./modes/score-table-workbench";
import { SkillsQuickstartWorkbench } from "./modes/skills-quickstart/skills-quickstart-workbench";
import { SketchUploadWorkbench } from "./modes/sketch-upload-workbench";
import { TrackerLogWorkbench } from "./modes/tracker-log-workbench";
import { VisualDirectionWorkbench } from "./modes/visual-direction-workbench";
import { WorkbenchContainer } from "./shared/workbench-container";
import { WorkbenchHeader } from "./shared/workbench-header";
import type { WorkbenchModeComponent, WorkbenchRendererProps } from "./types";

const modeRenderers: Record<WorkbenchType, WorkbenchModeComponent> = {
	guided_form: GuidedFormWorkbench,
	score_table: ScoreTableWorkbench,
	collector_board: CollectorBoardWorkbench,
	capture_upload: CaptureUploadWorkbench,
	paper_photo_upload: PaperPhotoUploadWorkbench,
	sketch_upload: SketchUploadWorkbench,
	reference_gallery: ReferenceGalleryWorkbench,
	core_flow_sketch: CoreFlowSketchWorkbench,
	brief_assembler: BriefAssemblerWorkbench,
	build_setup_launchpad: BuildSetupLaunchpadWorkbench,
	console_checklist: ConsoleChecklistWorkbench,
	roadmap_overview: RoadmapOverviewWorkbench,
	tracker_log: TrackerLogWorkbench,
	external_workspace: ExternalWorkspaceWorkbench,
	visual_direction: VisualDirectionWorkbench,
	competitor_research_light: CompetitorResearchLightWorkbench,
	repo_map_orientation: RepoMapOrientationWorkbench,
	route_access_orientation: RouteAccessOrientationWorkbench,
	production_deploy_handoff: ProductionDeployHandoffWorkbench,
	build_product_iteration: BuildProductIterationWorkbench,
	brand_kit_workbench: BrandKitWorkbench,
	codex_marketing_site: CodexMarketingSiteWorkbench,
	checkout_qa_loop: CheckoutQaLoopWorkbench,
	build_setting_up_slices: BuildSettingUpSlicesWorkbench,
	build_ship_roadmap: BuildShipRoadmapWorkbench,
	fresh_template_plan: FreshTemplatePlanWorkbench,
	core_ux_plan_flow: CoreUxPlanFlowWorkbench,
	core_ux_build: CoreUxBuildWorkbench,
	skills_quickstart: SkillsQuickstartWorkbench,
};

function UnsupportedWorkbench({
	lesson,
	lessonContent,
}: Pick<WorkbenchRendererProps, "lesson" | "lessonContent">) {
	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<div className="rounded-none border border-dashed border-border bg-muted/30 p-5 text-sm font-medium leading-relaxed text-muted-foreground">
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
	layoutMode,
	invalidFieldIds = new Set<string>(),
	invalidFieldMessages = new Map<string, string>(),
	fieldValuesReady = true,
	workbenchCompletionSlot,
}: WorkbenchRendererProps) {
	const fields = lesson.workbenchFields ?? [];
	const resolvedArtifactPreview = buildResolvedArtifactPreview(
		lesson,
		fieldValues,
		pinnedArtifacts,
	);
	const stageUnlockSummary = buildStageUnlockSummary(lesson, pinnedArtifacts);
	const workbenchSections = getWorkbenchSections(lesson);
	const sectionStates = getWorkbenchSectionStates(lesson, fieldValues);
	const objectiveTasks = getObjectiveTasks(lesson, fieldValues, {
		pinnedArtifacts,
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
			layoutMode={layoutMode}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			fieldValuesReady={fieldValuesReady}
			stageUnlockSummary={stageUnlockSummary}
			resolvedArtifactPreview={resolvedArtifactPreview}
			fields={fields}
			objectiveTasks={objectiveTasks}
			completedTaskCount={completedTaskCount}
			workbenchSections={workbenchSections}
			sectionStates={sectionStates}
			workbenchCompletionSlot={workbenchCompletionSlot}
		/>
	);
}
