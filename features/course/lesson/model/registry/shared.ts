import { PRODUCT_COURSE_SLUG } from "@/config/product";
import type {
	ArtifactType,
	ChecklistItemValue,
	ReferenceGalleryValue,
	UploadFieldValue,
	WorkbenchField,
} from "../manifest";

export const COURSE_SLUG = PRODUCT_COURSE_SLUG;

export const SUPPORTED_FIELD_KINDS = new Set<WorkbenchField["kind"]>([
	"text",
	"textarea",
	"url",
	"number",
	"toggle",
	"select",
	"image_upload",
	"video_upload",
	"table",
	"board",
	"reference_gallery",
	"checklist",
	"readonly",
]);

export const PRIVATE_FIELD_PREFIX = "__";
export const OBJECTIVE_CHECKLIST_FIELD_ID = `${PRIVATE_FIELD_PREFIX}objectiveChecklist`;
export const FIELD_SHAPE_VERSION_FIELD_ID = `${PRIVATE_FIELD_PREFIX}fieldShapeVersion`;

export type CompletionIssue = {
	id: string;
	label: string;
	kind: "field" | "objective";
	message?: string;
};

export type PersistedFieldValue =
	| boolean
	| number
	| string
	| string[]
	| string[][]
	| ChecklistItemValue[]
	| ReferenceGalleryValue
	| UploadFieldValue
	| UploadFieldValue[]
	| null;

export type PersistedFieldValues = Record<string, PersistedFieldValue>;

export type WorkbenchSectionState = {
	id: string;
	title: string;
	completionLabel: string;
	totalRequiredFields: number;
	completedRequiredFields: number;
	isComplete: boolean;
	incompleteFieldIds: string[];
};

export type ObjectiveTask = {
	id: string;
	label: string;
	status: "complete" | "incomplete";
	source: "field" | "checklist_option" | "manual" | "handoff";
	fieldId?: string;
	sectionId?: string;
	sectionTitle?: string;
	interactive: boolean;
};

export type CandidateProblemOption = {
	index: number;
	owner: string;
	statement: string;
};

export type ArtifactPreview = {
	artifactKey: string;
	artifactLabel: string;
	contextTitle?: string;
	artifactType: ArtifactType;
	lessonId: string;
	lessonTitle: string;
	fieldValues: PersistedFieldValues;
	fields: Array<[string, PersistedFieldValue]>;
};

export type FieldValuesSource = Record<string, unknown> | null | undefined;

export function normalizeFieldValues(
	fieldValues: FieldValuesSource,
): PersistedFieldValues {
	return (fieldValues ?? {}) as PersistedFieldValues;
}

export function isUploadFieldValue(value: unknown): value is UploadFieldValue {
	return (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		"kind" in value &&
		(value as { kind?: string }).kind === "upload"
	);
}

export function isUploadFieldValueArray(
	value: unknown,
): value is UploadFieldValue[] {
	return (
		Array.isArray(value) && value.every((item) => isUploadFieldValue(item))
	);
}

export function isChecklistItemArray(
	value: unknown,
): value is ChecklistItemValue[] {
	return (
		Array.isArray(value) &&
		value.every(
			(item) =>
				Boolean(item) &&
				typeof item === "object" &&
				!Array.isArray(item) &&
				typeof (item as { label?: unknown }).label === "string" &&
				typeof (item as { checked?: unknown }).checked === "boolean",
		)
	);
}
