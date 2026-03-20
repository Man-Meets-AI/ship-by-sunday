import { Separator } from "@/components/ui/separator";

import type { WorkbenchModeProps } from "../types";
import {
	GuidedFormInlineVideo,
	GuidedFormSplitMediaLayout,
} from "./guided-form-workbench-chrome";
import { GuidedFormSupportingContent } from "./guided-form-workbench-supporting";
import { GuidedFormWorkbenchSections } from "./guided-form-workbench-sections";
import {
	LessonWorkbenchPageHeader,
	LessonWorkbenchStatusCards,
} from "./lesson-workbench-shadcn-chrome";

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
		workbenchCompletionSlot,
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
	const showWorkbenchCompletionAfterForm =
		lesson.id === "1.4" && Boolean(workbenchCompletionSlot);
	const showPrimaryFieldsFirst = lesson.id === "1.3";
	const totalTasks = Math.max(objectiveTasks.length, 1);
	const inlineVideoCard = (
		<GuidedFormInlineVideo coachContent={lessonContent.coach} />
	);
	const supportingContent = (
		<GuidedFormSupportingContent
			lesson={lesson}
			lessonContent={lessonContent}
			fieldValues={fieldValues}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
			visiblePinnedArtifacts={visiblePinnedArtifacts}
			workbenchCompletionSlot={workbenchCompletionSlot}
		/>
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
			<LessonWorkbenchPageHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<GuidedFormSplitMediaLayout media={inlineVideoCard}>
					<div className="space-y-5">
						{showPrimaryFieldsFirst ? sectionContent : supportingContent}
						{showPrimaryFieldsFirst ? supportingContent : sectionContent}
					</div>
				</GuidedFormSplitMediaLayout>
			) : showInlineVideo ? (
				inlineVideoCard
			) : (
				<LessonWorkbenchStatusCards
					lessonContent={lessonContent}
					completedTaskCount={completedTaskCount}
					totalTaskCount={totalTasks}
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
			{showWorkbenchCompletionAfterForm ? (
				<div className="flex flex-wrap justify-end gap-2">
					{workbenchCompletionSlot}
				</div>
			) : null}
		</>
	);

	return <div className="w-full space-y-4 pb-1">{workbenchBody}</div>;
}
