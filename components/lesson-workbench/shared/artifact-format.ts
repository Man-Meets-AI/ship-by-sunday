import type { UploadFieldValue } from "@/lib/course/manifest";
import { isChecklistItemArray } from "@/lib/course/registry";

import { getUploadMetadata } from "../fields/value-codecs";

export function formatArtifactValue(value: unknown) {
	const upload = getUploadMetadata(value);
	if (upload) {
		return upload.fileName ?? "Uploaded file";
	}

	if (isChecklistItemArray(value)) {
		return value
			.filter((item) => item.checked)
			.map((item) => item.label)
			.join(", ");
	}

	return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

export function isUploadArtifactValue(
	value: unknown,
): value is UploadFieldValue {
	return Boolean(getUploadMetadata(value));
}
