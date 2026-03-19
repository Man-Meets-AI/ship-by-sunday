import { FieldControl } from "../fields/field-control";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

export function ReferenceGalleryWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	onFieldChange,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const galleryField = fields[0];
	const isInvalid = galleryField ? invalidFieldIds.has(galleryField.id) : false;

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
			{galleryField ? (
				<div
					className={
						isInvalid
							? "space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
							: "p-0"
					}
				>
					<WorkbenchCard>
						<FieldControl
							field={galleryField}
							value={fieldValues[galleryField.id]}
							onChange={(value) => onFieldChange(galleryField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
					</WorkbenchCard>
					{isInvalid ? (
						<p className="text-[12px] font-medium leading-[1.6] text-destructive">
							Save at least {Math.max(galleryField.minItems ?? 1, 1)} references
							before continuing.
						</p>
					) : null}
				</div>
			) : null}
		</WorkbenchContainer>
	);
}
