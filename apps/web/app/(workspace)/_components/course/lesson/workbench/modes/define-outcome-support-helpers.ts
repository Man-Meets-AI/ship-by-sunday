export const FEATURE_LANGUAGE_PATTERN =
	/\b(app|tool|platform|dashboard|feature|features|ai|workflow|system)\b/i;

export function getTextValue(
	fieldValues: Record<string, unknown>,
	fieldId: string,
) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}
