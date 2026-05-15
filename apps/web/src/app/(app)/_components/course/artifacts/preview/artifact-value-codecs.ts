import type {
	ChecklistItemValue,
	UploadFieldValue,
} from "@/lib/course/lesson/model/manifest";
import {
	isChecklistItemArray,
	isUploadFieldValue,
	type PersistedFieldValue,
} from "@/lib/course/lesson/model/registry";

export function normalizeChecklistValue(
	value: PersistedFieldValue | undefined,
	options: string[],
): ChecklistItemValue[] {
	if (isChecklistItemArray(value)) {
		return options.map((option) => {
			const existing = value.find((item) => item.label === option);
			return {
				label: option,
				checked: existing?.checked ?? false,
			};
		});
	}

	if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
		const selected = new Set(value as string[]);
		return options.map((option) => ({
			label: option,
			checked: selected.has(option),
		}));
	}

	return options.map((option) => ({
		label: option,
		checked: false,
	}));
}

export function getUploadMetadata(
	value: PersistedFieldValue | undefined,
): UploadFieldValue | null {
	return isUploadFieldValue(value) ? value : null;
}

export function getUploadMetadataList(
	value: PersistedFieldValue | undefined,
): UploadFieldValue[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter(isUploadFieldValue);
}
