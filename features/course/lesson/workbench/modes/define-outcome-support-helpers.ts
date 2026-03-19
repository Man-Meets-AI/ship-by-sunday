export const FEATURE_LANGUAGE_PATTERN =
	/\b(app|tool|platform|dashboard|feature|features|ai|workflow|system)\b/i;

export const CAPTURE_ITEMS = [
	"Promised outcome: the one result the product should make true.",
	"Observable proof: what the user can now do or finish.",
	"Pain removed: what gets easier or stops hurting.",
] as const;

export function getTextValue(
	fieldValues: Record<string, unknown>,
	fieldId: string,
) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}

export type DefineOutcomePreviewLine = {
	label: string;
	filled: boolean;
	value: string;
};
