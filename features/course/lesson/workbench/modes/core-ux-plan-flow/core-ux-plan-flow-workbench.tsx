"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchModeProps } from "../../types";

import { CoreUxPlanFlowApprovedSummary } from "./core-ux-plan-flow-approved-summary";
import { CoreUxPlanFlowCommandsCard } from "./core-ux-plan-flow-commands-card";
import { CORE_UX_PLAN_FIELD_IDS } from "./core-ux-plan-flow-constants";
import { CoreUxPlanFlowInstructorExample } from "./core-ux-plan-flow-instructor-example";
import { CoreUxPlanFlowInlineVideo } from "./core-ux-plan-flow-inline-video";
import { CoreUxPlanFlowPinnedArtifacts } from "./core-ux-plan-flow-pinned-artifacts";
import { CoreUxPlanFlowPlanOutcome } from "./core-ux-plan-flow-plan-outcome";
import { CoreUxPlanFlowShadcnFields } from "./core-ux-plan-flow-shadcn-fields";
import { CoreUxPlanFlowStudentWorkspace } from "./core-ux-plan-flow-student-workspace";

function renderLessonTitle(title: string) {
	const protectedPhrase = "Ship by Sunday";
	const phraseStart = title.indexOf(protectedPhrase);

	if (phraseStart === -1) {
		return title;
	}

	const before = title.slice(0, phraseStart);
	const after = title.slice(phraseStart + protectedPhrase.length);

	return (
		<>
			{before}
			<span className="whitespace-nowrap">{protectedPhrase}</span>
			{after}
		</>
	);
}

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
			{showSplitWorkbenchMedia ? (
				<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(300px,0.88fr)_minmax(0,1.12fr)] xl:items-start">
					<div className="min-w-0 xl:sticky xl:top-0 xl:z-1 xl:self-start">
						{inlineVideoCard}
					</div>
					<div className="min-w-0">{mainColumn}</div>
				</div>
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
