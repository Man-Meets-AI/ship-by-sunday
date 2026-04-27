import type {
	ReferenceGalleryItem,
	ReferenceGalleryValue,
	UploadFieldValue,
} from "@/lib/course/lesson/model/manifest";
import { isReferenceGalleryValue } from "@/lib/course/lesson/model/reference-gallery";

export type ReferenceGalleryUploadState =
	| { status: "idle" }
	| { status: "uploading" }
	| { status: "error"; message: string };

function getEmptyGalleryValue(): ReferenceGalleryValue {
	return {
		kind: "reference_gallery",
		items: [],
	};
}

export function normalizeReferenceGalleryControlValue(
	value: unknown,
): ReferenceGalleryValue {
	return isReferenceGalleryValue(value) ? value : getEmptyGalleryValue();
}

function createReferenceGalleryItemId() {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	return `reference-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function revokeReferenceGalleryPreviewUrl(item: ReferenceGalleryItem) {
	if (item.previewUrl?.startsWith("blob:")) {
		URL.revokeObjectURL(item.previewUrl);
	}
}

export async function validateReferenceImageUrl(url: string) {
	await new Promise<void>((resolve, reject) => {
		const image = new Image();

		image.onload = () => resolve();
		image.onerror = () => reject(new Error("invalid-image-url"));
		image.src = url;
	});
}

export function getRemoteReferenceImageLabel(url: string) {
	try {
		const parsed = new URL(url);
		const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
		return lastSegment || parsed.hostname;
	} catch {
		return "Reference image";
	}
}

export function createUploadedReferenceGalleryItem(
	upload: UploadFieldValue,
): ReferenceGalleryItem {
	return {
		id: createReferenceGalleryItemId(),
		source: "upload",
		fileName: upload.fileName,
		mimeType: upload.mimeType,
		size: upload.size,
		storageId: upload.storageId,
		url: upload.previewUrl,
		previewUrl: upload.previewUrl,
	};
}

export function createRemoteReferenceGalleryItem(
	url: string,
): ReferenceGalleryItem {
	return {
		id: createReferenceGalleryItemId(),
		source: "remote_url",
		url,
		fileName: getRemoteReferenceImageLabel(url),
	};
}
