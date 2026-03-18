import { LessonVideoSurface } from "@/features/course/lesson/components/lesson-video-surface";

import { FieldControl } from "../fields/field-control";
import { ArtifactContext } from "../shared/artifact-context";
import { PromptImportCard } from "../shared/prompt-import-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

function InvalidFieldMessage({ visible }: { visible: boolean }) {
	if (!visible) {
		return null;
	}

	return (
		<p className="mt-2 text-[11px] font-medium leading-snug text-danger">
			This step is required before you can complete the lesson.
		</p>
	);
}

export function VisualDirectionWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const notesField = fields.find(
		(field) => field.id === "visual_direction_notes",
	);
	const markdownField = fields.find(
		(field) => field.id === "visual_guide_markdown",
	);

	return (
		<WorkbenchContainer className="max-w-6xl">
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<div className="grid gap-3 xl:grid-cols-[minmax(280px,0.92fr)_minmax(0,1.08fr)]">
				<WorkbenchCard label="Watch lesson">
					<LessonVideoSurface coachContent={lessonContent.coach} />
				</WorkbenchCard>
				<WorkbenchCard label="Screen context">
					<div className="space-y-3">
						<p className="text-sm font-medium leading-relaxed text-product-muted">
							Use your rough screens to lock the visual direction before you ask
							a coding agent for `visualguide.md`.
						</p>
						<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
					</div>
				</WorkbenchCard>
			</div>
			<WorkbenchCard label="Follow this order">
				<ol className="space-y-2 text-sm leading-relaxed text-product-text">
					<li>1. Review the lesson video and your rough screens together.</li>
					<li>2. Write the visual changes or direction you want to push.</li>
					<li>
						3. Copy the generated prompt into your preferred coding agent.
					</li>
					<li>4. Paste the returned `visualguide.md` back here and save it.</li>
				</ol>
			</WorkbenchCard>
			{notesField ? (
				<WorkbenchCard label="Direction note">
					<FieldControl
						field={notesField}
						value={fieldValues[notesField.id]}
						onChange={(value) => onFieldChange(notesField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
					/>
					<InvalidFieldMessage visible={invalidFieldIds.has(notesField.id)} />
				</WorkbenchCard>
			) : null}
			{lesson.promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					fieldValues={fieldValues}
				/>
			) : null}
			{markdownField ? (
				<WorkbenchCard label="Saved visualguide.md">
					<FieldControl
						field={markdownField}
						value={fieldValues[markdownField.id]}
						onChange={(value) => onFieldChange(markdownField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
					/>
					<InvalidFieldMessage
						visible={invalidFieldIds.has(markdownField.id)}
					/>
				</WorkbenchCard>
			) : null}
		</WorkbenchContainer>
	);
}
