import { Separator } from "@/components/ui/separator";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchMediaLayout } from "../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../types";
import { FocusInlineLessonVideo } from "../shared/focus-inline-lesson-video";
import { CandidateProblemHandoff } from "./candidate-problem-handoff";
import { DefineOutcomeSupport } from "./define-outcome-support";
import { GuidedFormWorkbenchSections } from "./guided-form-workbench-sections";
import { PickOneUserStatementPreviewCard } from "./pick-one-user-statement-preview-card";
import { StartWithProblemSupport } from "./start-with-problem-support";

export function GuidedFormWorkbench(props: WorkbenchModeProps) {
	const {
		lesson,
		lessonContent,
		fieldValues,
		onFieldChange,
		pinnedArtifacts,
		invalidFieldIds,
		invalidFieldMessages,
		fields,
		objectiveTasks,
		workbenchSections,
		sectionStates,
		completedTaskCount,
		layoutMode,
	} = props;

	const visiblePinnedArtifacts = lesson.handoff
		? pinnedArtifacts.filter(
				(artifact) =>
					artifact.artifactKey !== lesson.handoff?.sourceArtifactKey,
			)
		: pinnedArtifacts;
	const showInlineVideo = lesson.coachVideoPlacement === "workbench";
	const showSplitWorkbenchMedia =
		showInlineVideo &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";
	const showStartWithProblemSupport = lesson.id === "1.3";
	const showPickOneUserStatementPreview =
		lesson.id === "1.4" && lesson.handoff?.mode === "select_candidate_problem";
	const showDefineOutcomeSupport = lesson.id === "1.5";
	const showPrimaryFieldsFirst = showStartWithProblemSupport;
	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);
	const supportingContent = (
		<>
			{showStartWithProblemSupport ? (
				<StartWithProblemSupport lessonContent={lessonContent} />
			) : null}
			{lesson.handoff?.mode === "select_candidate_problem" ? (
				<>
					<CandidateProblemHandoff
						handoff={lesson.handoff}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						pinnedArtifacts={pinnedArtifacts}
						invalidFieldIds={invalidFieldIds}
					/>
					{showPickOneUserStatementPreview ? (
						<PickOneUserStatementPreviewCard
							handoff={lesson.handoff}
							fieldValues={fieldValues}
							pinnedArtifacts={pinnedArtifacts}
						/>
					) : null}
				</>
			) : null}
			{showDefineOutcomeSupport ? (
				<DefineOutcomeSupport fieldValues={fieldValues} />
			) : null}
			<ArtifactContext pinnedArtifacts={visiblePinnedArtifacts} />
		</>
	);
	const sectionContent = (
		<GuidedFormWorkbenchSections
			workbenchSections={workbenchSections}
			fields={fields}
			fieldValues={fieldValues}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			sectionStates={sectionStates}
		/>
	);

	const workbenchBody = (
		<>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					<div className="space-y-5">
						{showPrimaryFieldsFirst ? sectionContent : supportingContent}
						{showPrimaryFieldsFirst ? supportingContent : sectionContent}
					</div>
				</WorkbenchMediaLayout>
			) : showInlineVideo ? (
				inlineVideoCard
			) : (
				<StatusRail
					lessonContent={lessonContent}
					completedTaskCount={completedTaskCount}
					totalTaskCount={Math.max(objectiveTasks.length, 1)}
				/>
			)}
			{showSplitWorkbenchMedia
				? null
				: showPrimaryFieldsFirst
					? sectionContent
					: supportingContent}
			{showSplitWorkbenchMedia
				? null
				: showPrimaryFieldsFirst
					? supportingContent
					: sectionContent}
		</>
	);

	return <WorkbenchContainer>{workbenchBody}</WorkbenchContainer>;
}
