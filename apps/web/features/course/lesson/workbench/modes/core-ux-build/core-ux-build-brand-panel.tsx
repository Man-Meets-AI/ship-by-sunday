import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

import { FieldControl } from "../../fields/field-control";
import { CoreUxBuildTemplateCard } from "./core-ux-build-template-card";

type Props = {
	brandField: WorkbenchField;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds: Set<string>;
};

export function CoreUxBuildBrandPanel({
	brandField,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
}: Props) {
	return (
		<div className="space-y-4">
			<CoreUxBuildTemplateCard />
			<FieldControl
				field={brandField}
				value={fieldValues[brandField.id]}
				onChange={(value) => onFieldChange(brandField.id, value)}
				pinnedArtifacts={pinnedArtifacts}
				invalid={invalidFieldIds.has(brandField.id)}
			/>
		</div>
	);
}
