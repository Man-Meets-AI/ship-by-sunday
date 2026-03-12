import type { FieldControlProps } from "../types";
import { renderBasicFieldControl } from "./basic-field-controls";
import { renderCollectionFieldControl } from "./collection-field-controls";
import { ReadonlyFieldControl } from "./readonly-field-control";
import { ReferenceGalleryFieldControl } from "./reference-gallery-field-control";
import { UploadFieldControl } from "./upload-field-control";

export function FieldControl({
	field,
	value,
	onChange,
	pinnedArtifacts,
	showLabel = true,
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
		{ showLabel },
	);
	if (collectionControl) {
		return collectionControl;
	}

	if (field.kind === "reference_gallery") {
		return (
			<ReferenceGalleryFieldControl
				field={field}
				value={value}
				onChange={onChange}
				showLabel={showLabel}
			/>
		);
	}

	if (
		field.kind === "image_upload" ||
		field.kind === "image_uploads" ||
		field.kind === "video_upload"
	) {
		return (
			<UploadFieldControl field={field} value={value} onChange={onChange} />
		);
	}

	return null;
}
