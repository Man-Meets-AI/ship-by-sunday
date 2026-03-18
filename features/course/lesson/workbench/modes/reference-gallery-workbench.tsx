import type { WorkbenchModeProps } from "../types";
import { FieldControl } from "../fields/field-control";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

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

	return (
		<WorkbenchContainer className="max-w-6xl">
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
						invalidFieldIds.has(galleryField.id)
							? "sbs-danger-card-shadow rounded-none border border-danger/75 bg-danger/[0.06] p-3"
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
					{invalidFieldIds.has(galleryField.id) ? (
						<p className="mt-2 text-[11px] font-medium leading-snug text-danger">
							Save at least {Math.max(galleryField.minItems ?? 1, 1)} references
							before continuing.
						</p>
					) : null}
				</div>
			) : null}
		</WorkbenchContainer>
	);
}
