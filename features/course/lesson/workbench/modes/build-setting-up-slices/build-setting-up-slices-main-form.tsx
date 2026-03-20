"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { FieldControl } from "../../fields/field-control";
import type { WorkbenchModeProps } from "../../types";

import { BUILD_SLICES_FIELD_IDS } from "./build-setting-up-slices-constants";

function pickField(fields: WorkbenchField[], id: string) {
	return fields.find((f) => f.id === id) ?? null;
}

export function BuildSettingUpSlicesMainForm({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: Pick<
	WorkbenchModeProps,
	| "fields"
	| "fieldValues"
	| "onFieldChange"
	| "pinnedArtifacts"
	| "invalidFieldIds"
>) {
	const coreField = pickField(fields, BUILD_SLICES_FIELD_IDS.coreUxOrPrompt);
	const linkField = pickField(fields, BUILD_SLICES_FIELD_IDS.referenceLink);
	const packetField = pickField(fields, BUILD_SLICES_FIELD_IDS.packet);
	const sliceField = pickField(fields, BUILD_SLICES_FIELD_IDS.selectedSlice);
	const reviewField = pickField(fields, BUILD_SLICES_FIELD_IDS.reviewChecklist);
	const sketchField = pickField(fields, BUILD_SLICES_FIELD_IDS.userFlowSketch);

	const renderField = (field: WorkbenchField | null) =>
		field ? (
			<FieldControl
				key={field.id}
				field={field}
				value={fieldValues[field.id]}
				onChange={(value) => onFieldChange(field.id, value)}
				pinnedArtifacts={pinnedArtifacts}
				invalid={invalidFieldIds.has(field.id)}
			/>
		) : null;

	return (
		<div className="space-y-6">
			<Alert variant="default">
				<AlertTitle>No Figma yet?</AlertTitle>
				<AlertDescription>
					Sketch the user flow on a whiteboard or paper, then describe that flow
					in your own words below (or in the core UX box). Restate it clearly so
					the planner can align slices with what users actually do.
				</AlertDescription>
			</Alert>
			{renderField(coreField)}
			{renderField(linkField)}
			{renderField(packetField)}
			{renderField(sliceField)}
			{renderField(reviewField)}
			{renderField(sketchField)}
		</div>
	);
}
