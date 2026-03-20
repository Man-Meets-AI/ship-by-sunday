import { Alert, AlertDescription } from "@/components/ui/alert";

import { FieldControl } from "../fields/field-control";
import { ArtifactPreviewContent } from "../shared/artifact-preview-content";
import type { WorkbenchModeProps } from "../types";
import {
	LessonWorkbenchLabeledCard,
	LessonWorkbenchPageHeader,
	LessonWorkbenchStatusCards,
} from "./lesson-workbench-shadcn-chrome";

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
		<div className="w-full space-y-4 pb-1">
			<LessonWorkbenchPageHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			<LessonWorkbenchStatusCards
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{pinnedArtifacts.length > 0 ? (
				<div className="grid gap-3 md:grid-cols-2">
					{pinnedArtifacts.map((artifact) => (
						<LessonWorkbenchLabeledCard
							key={artifact.artifactKey}
							label={artifact.contextTitle ?? artifact.artifactLabel}
						>
							<ArtifactPreviewContent artifact={artifact} />
						</LessonWorkbenchLabeledCard>
					))}
				</div>
			) : null}
			{galleryField ? (
				<div className="space-y-3">
					<LessonWorkbenchLabeledCard>
						<FieldControl
							field={galleryField}
							value={fieldValues[galleryField.id]}
							onChange={(value) => onFieldChange(galleryField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
					</LessonWorkbenchLabeledCard>
					{isInvalid ? (
						<Alert variant="destructive">
							<AlertDescription>
								Save at least {Math.max(galleryField.minItems ?? 1, 1)}{" "}
								references before continuing.
							</AlertDescription>
						</Alert>
					) : null}
				</div>
			) : null}
		</div>
	);
}
