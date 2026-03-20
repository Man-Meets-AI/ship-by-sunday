import { Separator } from "@/components/ui/separator";

import { ArtifactContext } from "../shared/artifact-context";
import { FocusInlineLessonVideo } from "../shared/focus-inline-lesson-video";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import { WorkbenchMediaLayout } from "../shared/workbench-media-layout";
import type { WorkbenchModeProps } from "../types";

import { RepoMapOrientationPanel } from "./repo-map-orientation-panel";

export function RepoMapOrientationWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	objectiveTasks,
	completedTaskCount,
	layoutMode,
	workbenchCompletionSlot,
}: WorkbenchModeProps) {
	const showSplitWorkbenchMedia =
		lesson.coachVideoPlacement === "workbench" &&
		lesson.workbenchMediaLayout === "split" &&
		layoutMode === "focus";

	const inlineVideoCard = (
		<FocusInlineLessonVideo coachContent={lessonContent.coach} />
	);

	const panel = (
		<RepoMapOrientationPanel
			lessonContent={lessonContent}
			fieldValues={fieldValues}
			onFieldChange={onFieldChange}
			fields={fields}
			pinnedArtifacts={pinnedArtifacts}
			invalidFieldIds={invalidFieldIds}
			invalidFieldMessages={invalidFieldMessages}
			workbenchCompletionSlot={workbenchCompletionSlot}
		/>
	);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<Separator className="bg-border" />
			{showSplitWorkbenchMedia ? (
				<WorkbenchMediaLayout media={inlineVideoCard}>
					<div className="space-y-5">
						{panel}
						<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
					</div>
				</WorkbenchMediaLayout>
			) : (
				<>
					{lesson.coachVideoPlacement === "workbench" ? inlineVideoCard : null}
					<StatusRail
						lessonContent={lessonContent}
						completedTaskCount={completedTaskCount}
						totalTaskCount={Math.max(objectiveTasks.length, 1)}
					/>
					<div className="space-y-5">
						{panel}
						<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
					</div>
				</>
			)}
		</WorkbenchContainer>
	);
}
