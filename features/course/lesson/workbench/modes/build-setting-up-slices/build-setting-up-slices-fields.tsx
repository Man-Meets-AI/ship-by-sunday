"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldList } from "../../fields/field-list";

import { BUILD_SLICES_FIELD_IDS } from "./build-setting-up-slices-constants";

export function BuildSettingUpSlicesFields({
	fields,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: {
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
}) {
	const workFields = fields.filter(
		(f) => f.id !== BUILD_SLICES_FIELD_IDS.planningPath,
	);

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
			<FieldList
				fields={workFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
			/>
		</div>
	);
}
