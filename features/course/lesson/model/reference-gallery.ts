import type { ReferenceGalleryItem, ReferenceGalleryValue } from "./contracts";

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isGallerySource(
	value: unknown,
): value is ReferenceGalleryItem["source"] {
	return value === "upload" || value === "remote_url";
}

export function isReferenceGalleryItem(
	value: unknown,
): value is ReferenceGalleryItem {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.id === "string" &&
		isGallerySource(value.source) &&
		(typeof value.url === "undefined" || typeof value.url === "string") &&
		(typeof value.previewUrl === "undefined" ||
			typeof value.previewUrl === "string") &&
		(typeof value.fileName === "undefined" ||
			typeof value.fileName === "string") &&
		(typeof value.mimeType === "undefined" ||
			typeof value.mimeType === "string") &&
		(typeof value.size === "undefined" || typeof value.size === "number") &&
		(typeof value.storageId === "undefined" ||
			typeof value.storageId === "string")
	);
}

export function isReferenceGalleryValue(
	value: unknown,
): value is ReferenceGalleryValue {
	if (!isRecord(value) || value.kind !== "reference_gallery") {
		return false;
	}

	return (
		Array.isArray(value.items) &&
		value.items.every((item) => isReferenceGalleryItem(item))
	);
}

export function getReferenceGalleryItems(
	value: unknown,
): ReferenceGalleryItem[] {
	if (isReferenceGalleryValue(value)) {
		return value.items.filter((item) => {
			if (item.source === "upload") {
				return Boolean(item.storageId || item.url || item.previewUrl);
			}

			return typeof item.url === "string" && item.url.trim().length > 0;
		});
	}

	return [];
}

export function createReferenceGalleryValue(
	items: ReferenceGalleryItem[],
): ReferenceGalleryValue {
	return {
		kind: "reference_gallery",
		items,
	};
}

export function getReferenceGalleryCount(value: unknown) {
	return getReferenceGalleryItems(value).length;
}

export function getReferenceGallerySummary(value: unknown) {
	const count = getReferenceGalleryCount(value);
	if (count === 0) {
		return "No saved references yet.";
	}

	return `${count} saved reference${count === 1 ? "" : "s"}`;
}

export function getReferenceGalleryItemImageUrl(
	item: ReferenceGalleryItem,
): string | null {
	return item.previewUrl ?? item.url ?? null;
}

export function getReferenceGalleryImageUrls(
	value: unknown,
	limit = 4,
): string[] {
	return getReferenceGalleryItems(value)
		.map((item) => getReferenceGalleryItemImageUrl(item))
		.filter((url): url is string => Boolean(url))
		.slice(0, limit);
}

export function toPersistedReferenceGalleryValue(
	value: unknown,
): ReferenceGalleryValue {
	return createReferenceGalleryValue(
		getReferenceGalleryItems(value).map((item) =>
			item.source === "remote_url"
				? {
						id: item.id,
						source: "remote_url",
						url: item.url,
						fileName: item.fileName,
					}
				: {
						id: item.id,
						source: "upload",
						fileName: item.fileName,
						mimeType: item.mimeType,
						size: item.size,
						storageId: item.storageId,
					},
		),
	);
}

export async function hydrateReferenceGalleryValue(
	value: unknown,
	resolveUploadUrl: (
		storageId: NonNullable<ReferenceGalleryItem["storageId"]>,
	) => Promise<string | null>,
): Promise<ReferenceGalleryValue> {
	const items = await Promise.all(
		getReferenceGalleryItems(value).map(async (item) => {
			if (item.source !== "upload" || !item.storageId) {
				return item;
			}

			const url = await resolveUploadUrl(item.storageId);
			return {
				...item,
				url: url ?? undefined,
			};
		}),
	);

	return createReferenceGalleryValue(items);
}
