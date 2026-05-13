import { isReferenceGalleryValue } from "@/lib/course/lesson/model/reference-gallery";
import type { ArtifactPreview } from "@/lib/course/lesson/model/registry";

import { hasUploadGalleryValue } from "./artifact-value-format";

export function getReferenceGalleryField(artifact: ArtifactPreview) {
	for (const [label, value] of artifact.fields) {
		if (isReferenceGalleryValue(value)) {
			return { label, value };
		}
	}

	for (const [fieldId, value] of Object.entries(artifact.fieldValues)) {
		if (isReferenceGalleryValue(value)) {
			return { label: fieldId.replaceAll("_", " "), value };
		}
	}

	return null;
}

export function getUploadGalleryField(artifact: ArtifactPreview) {
	for (const [label, value] of artifact.fields) {
		if (hasUploadGalleryValue(value)) {
			return { label, value };
		}
	}

	for (const [fieldId, value] of Object.entries(artifact.fieldValues)) {
		if (hasUploadGalleryValue(value)) {
			return { label: fieldId.replaceAll("_", " "), value };
		}
	}

	return null;
}
