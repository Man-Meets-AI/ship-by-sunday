import type {
	ChecklistItemValue,
	UploadFieldValue,
} from "@/lib/course/manifest";
import { parseLegacyTableText, toLegacyTableText } from "@/lib/course/table";
import {
	isChecklistItemArray,
	isUploadFieldValue,
} from "@/lib/course/registry";

export function toLineList(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value.map((item) => String(item)).join("\n");
}

export function toTableText(value: unknown) {
	return toLegacyTableText(value);
}

export function parseLines(value: string) {
	return value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);
}

export function parseTable(value: string) {
	return parseLegacyTableText(value);
}

export function normalizeChecklistValue(
	value: unknown,
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

export function getUploadMetadata(value: unknown): UploadFieldValue | null {
	return isUploadFieldValue(value) ? value : null;
}

export function getUploadMetadataList(value: unknown): UploadFieldValue[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter(isUploadFieldValue);
}
