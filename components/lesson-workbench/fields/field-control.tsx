import type { FieldControlProps } from "../types";
import { renderBasicFieldControl } from "./basic-field-controls";
import { renderCollectionFieldControl } from "./collection-field-controls";
import { ReadonlyFieldControl } from "./readonly-field-control";
import { UploadFieldControl } from "./upload-field-control";

export function FieldControl({
	field,
	value,
	onChange,
	pinnedArtifacts,
}: FieldControlProps) {
	if (field.kind === "readonly") {
		return (
			<ReadonlyFieldControl field={field} pinnedArtifacts={pinnedArtifacts} />
		);
	}

	const basicControl = renderBasicFieldControl(field, value, onChange);
	if (basicControl) {
		return basicControl;
	}

	const collectionControl = renderCollectionFieldControl(
		field,
		value,
		onChange,
	);
	if (collectionControl) {
		return collectionControl;
	}

	if (field.kind === "image_upload" || field.kind === "video_upload") {
		return (
			<UploadFieldControl field={field} value={value} onChange={onChange} />
		);
	}

	return null;
}
