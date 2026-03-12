import type { UploadFieldValue } from "@/lib/course/manifest";
import { formatTablePreview } from "@/lib/course/table";
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

	if (Array.isArray(value)) {
		if (value.some((item) => Array.isArray(item))) {
			return formatTablePreview(value);
		}

		if (value.every((item) => typeof item === "string")) {
			return value.join(", ");
		}

		return JSON.stringify(value);
	}

	return value === null || value === undefined || value === ""
		? "No saved value yet."
		: String(value);
}

export function isUploadArtifactValue(
	value: unknown,
): value is UploadFieldValue {
	return Boolean(getUploadMetadata(value));
}
