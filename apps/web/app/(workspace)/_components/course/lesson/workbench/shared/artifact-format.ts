import type {
	ReferenceGalleryItem,
	UploadFieldValue,
} from "@/lib/course/lesson/model/manifest";
import {
	getReferenceGalleryCount,
	getReferenceGalleryItemImageUrl,
	getReferenceGalleryItems,
	isReferenceGalleryValue,
} from "@/lib/course/lesson/model/reference-gallery";
import { isChecklistItemArray } from "@/lib/course/lesson/model/registry";
import { formatTablePreview } from "@/lib/course/lesson/model/table";

import {
	getUploadMetadata,
	getUploadMetadataList,
} from "../fields/value-codecs";

export function formatArtifactValue(value: unknown) {
	const upload = getUploadMetadata(value);
	if (upload) {
		return upload.fileName ?? "Uploaded file";
	}

	const uploads = getUploadMetadataList(value);
	if (uploads.length > 0) {
		const count = uploads.filter((item) =>
			Boolean(item.storageId ?? item.previewUrl ?? item.url),
		).length;
		return count === 0
			? "No saved uploads yet."
			: `${count} image${count === 1 ? "" : "s"} uploaded`;
	}

	if (isReferenceGalleryValue(value)) {
		const count = getReferenceGalleryCount(value);
		return count === 0
			? "No saved references yet."
			: `${count} saved reference${count === 1 ? "" : "s"}`;
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

export function getUploadPreviewItems(value: unknown): UploadFieldValue[] {
	const upload = getUploadMetadata(value);
	if (upload && (upload.previewUrl ?? upload.url)) {
		return [upload];
	}

	return getUploadMetadataList(value).filter((item) =>
		Boolean(item.previewUrl ?? item.url),
	);
}

export function hasUploadGalleryValue(value: unknown) {
	return getUploadMetadataList(value).length > 0;
}

export function getReferenceGalleryPreviewItems(
	value: unknown,
): ReferenceGalleryItem[] {
	return getReferenceGalleryItems(value).filter((item) =>
		Boolean(getReferenceGalleryItemImageUrl(item)),
	);
}
