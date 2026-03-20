"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldList } from "../../fields/field-list";
import { ArtifactContext } from "../../shared/artifact-context";
import { FocusInlineLessonVideo } from "../../shared/focus-inline-lesson-video";
import { WorkbenchContainer } from "../../shared/workbench-container";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../../types";

import { CoreUxPlanFlowApprovedSummary } from "./core-ux-plan-flow-approved-summary";
import { CoreUxPlanFlowCommandsCard } from "./core-ux-plan-flow-commands-card";
import { CORE_UX_PLAN_FIELD_IDS } from "./core-ux-plan-flow-constants";
import { CoreUxPlanFlowInstructorExample } from "./core-ux-plan-flow-instructor-example";
import { CoreUxPlanFlowPlanOutcome } from "./core-ux-plan-flow-plan-outcome";
import { CoreUxPlanFlowStudentWorkspace } from "./core-ux-plan-flow-student-workspace";

export function CoreUxPlanFlowWorkbench(props: WorkbenchModeProps) {
	const {
		lesson,
		lessonContent,
		fieldValues,
		onFieldChange,
		pinnedArtifacts,
		invalidFieldIds,
		invalidFieldMessages,
		fields,
		layoutMode,
	} = props;

	const checklistField = fields.find(
		(f) => f.id === CORE_UX_PLAN_FIELD_IDS.workflowChecklist,
	);

	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const mainColumn = (
		<div className="space-y-5">
			<CoreUxPlanFlowCommandsCard />
			<Tabs defaultValue="instructor">
				<TabsList variant="line" className="w-full max-w-md">
					<TabsTrigger value="instructor">Instructor example</TabsTrigger>
					<TabsTrigger value="yours">Your version</TabsTrigger>
				</TabsList>
				<CoreUxPlanFlowInstructorExample />
				<CoreUxPlanFlowStudentWorkspace {...props} />
			</Tabs>
			<Separator />
			<CoreUxPlanFlowPlanOutcome />
			<CoreUxPlanFlowApprovedSummary {...props} />
			{checklistField ? (
				<FieldList
					fields={[checklistField]}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			) : null}
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					{mainColumn}
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				<>
					{inlineVideoCard}
					{mainColumn}
				</>
			) : (
				mainColumn
			)}
		</WorkbenchContainer>
	);
}
