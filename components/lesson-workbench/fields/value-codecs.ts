import type {
	ChecklistItemValue,
	UploadFieldValue,
} from "@/lib/course/manifest";
import { isChecklistItemArray } from "@/lib/course/registry";

export function toLineList(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value.map((item) => String(item)).join("\n");
}

export function toTableText(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value
		.map((row) => (Array.isArray(row) ? row.join(" | ") : String(row)))
		.join("\n");
}

export function parseLines(value: string) {
	return value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);
}

export function parseTable(value: string) {
	return value
		.split("\n")
		.map((row) =>
			row
				.split("|")
				.map((column) => column.trim())
				.filter(Boolean),
		)
		.filter((row) => row.length > 0);
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
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	if ("kind" in value && (value as { kind?: string }).kind === "upload") {
		return value as UploadFieldValue;
	}

	return null;
}
