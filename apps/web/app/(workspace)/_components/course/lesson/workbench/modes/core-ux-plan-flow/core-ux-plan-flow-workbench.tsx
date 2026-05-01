"use client";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchModeProps } from "../../types";
import { WorkbenchHeader } from "../../shared/workbench-header";
import { WorkbenchMediaLayout } from "../../shared/workbench-media-layout";

import { CoreUxPlanFlowApprovedSummary } from "./core-ux-plan-flow-approved-summary";
import { CoreUxPlanFlowCommandsCard } from "./core-ux-plan-flow-commands-card";
import { CORE_UX_PLAN_FIELD_IDS } from "@/lib/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-constants";
import { CoreUxPlanFlowInstructorExample } from "./core-ux-plan-flow-instructor-example";
import { CoreUxPlanFlowInlineVideo } from "./core-ux-plan-flow-inline-video";
import { CoreUxPlanFlowPinnedArtifacts } from "./core-ux-plan-flow-pinned-artifacts";
import { CoreUxPlanFlowPlanOutcome } from "./core-ux-plan-flow-plan-outcome";
import { CoreUxPlanFlowShadcnFields } from "./core-ux-plan-flow-shadcn-fields";
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
		<CoreUxPlanFlowInlineVideo coachContent={lessonContent.coach} />
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
				<CoreUxPlanFlowShadcnFields
					fields={[checklistField]}
					fieldValues={fieldValues}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					invalidFieldIds={invalidFieldIds}
					invalidFieldMessages={invalidFieldMessages}
				/>
			) : null}
			<CoreUxPlanFlowPinnedArtifacts pinnedArtifacts={pinnedArtifacts} />
		</div>
	);

	return (
		<div className="w-full space-y-4 pb-1">
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
		</div>
	);
}
