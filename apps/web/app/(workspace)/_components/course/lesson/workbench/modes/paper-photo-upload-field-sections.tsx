"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { WorkbenchField } from "@/lib/course/lesson/model/manifest";

import { FieldControl } from "../fields/field-control";
import { getUploadMetadata } from "../fields/value-codecs";
import type { WorkbenchModeProps } from "../types";
import { LessonWorkbenchLabeledCard } from "./lesson-workbench-shadcn-chrome";

const nextStepTitleClass =
	"font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

type UploadMeta = ReturnType<typeof getUploadMetadata>;

function UploadFieldErrorAlert({
	visible,
	message,
}: {
	visible: boolean;
	message: string;
}) {
	if (!visible) {
		return null;
	}

	return (
		<Alert variant="destructive" className="mt-2">
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}

export function PaperPhotoUploadFieldSections({
	uploadField,
	qualityField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	upload,
}: {
	uploadField: WorkbenchField | null;
	qualityField: WorkbenchField | null;
	fieldValues: WorkbenchModeProps["fieldValues"];
	onFieldChange: WorkbenchModeProps["onFieldChange"];
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"];
	invalidFieldIds: WorkbenchModeProps["invalidFieldIds"];
	upload: UploadMeta | null;
}) {
	return (
		<>
			{uploadField ? (
				<LessonWorkbenchLabeledCard label="Upload the map">
					<div className="space-y-3">
						<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
							Upload one legible photo. Paper is preferred, but a tablet or
							digital screenshot still counts.
						</p>
						<FieldControl
							field={uploadField}
							value={fieldValues[uploadField.id]}
							onChange={(value) => onFieldChange(uploadField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
							showLabel={false}
						/>
						<UploadFieldErrorAlert
							visible={invalidFieldIds.has(uploadField.id)}
							message="Upload one clean core-flow photo before you continue."
						/>
						{upload?.fileName ? (
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className={nextStepTitleClass}>
										Next up in 1.6
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 pt-0">
									<p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
										You will use this map as the cut line for what belongs in
										v1.
									</p>
									<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
										Replace it now if the steps are blurry or too crowded to
										follow.
									</p>
								</CardContent>
							</Card>
						) : null}
					</div>
				</LessonWorkbenchLabeledCard>
			) : null}
			{qualityField ? (
				<LessonWorkbenchLabeledCard label="Ready for 1.6?">
					<div className="space-y-3">
						<p className="text-xs leading-relaxed text-muted-foreground [text-wrap:pretty]">
							Before you lock the lesson, confirm the map is focused enough to
							use as the scope cut line in `1.6`.
						</p>
						<Card>
							<CardContent className="pt-6">
								<FieldControl
									field={qualityField}
									value={fieldValues[qualityField.id]}
									onChange={(value) => onFieldChange(qualityField.id, value)}
									pinnedArtifacts={pinnedArtifacts}
								/>
							</CardContent>
						</Card>
						<UploadFieldErrorAlert
							visible={invalidFieldIds.has(qualityField.id)}
							message="Confirm the uploaded flow stays focused, shows the value moment, and is clear enough for someone else to follow."
						/>
					</div>
				</LessonWorkbenchLabeledCard>
			) : null}
		</>
	);
}
