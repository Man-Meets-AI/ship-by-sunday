export type PreviewRow = {
	label: string;
	filled: boolean;
	value: string;
};

export type CandidateProblemPreview = {
	index: number;
	owner: string;
	statement: string;
};

export function getTextValue(
	fieldValues: Record<string, unknown>,
	fieldId: string,
) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}

export function buildPreviewRows(
	fieldValues: Record<string, unknown>,
	selectedProblem: CandidateProblemPreview | null | undefined,
): PreviewRow[] {
	return [
		{
			label: "User",
			filled: Boolean(
				getTextValue(fieldValues, "selected_problem_owner") ||
				selectedProblem?.owner,
			),
			value:
				getTextValue(fieldValues, "selected_problem_owner") ||
				selectedProblem?.owner ||
				"Choose one problem above.",
		},
		{
			label: "Chosen problem",
			filled: Boolean(
				getTextValue(fieldValues, "selected_problem_statement") ||
				selectedProblem?.statement,
			),
			value:
				getTextValue(fieldValues, "selected_problem_statement") ||
				selectedProblem?.statement ||
				"The chosen problem will appear here.",
		},
		{
			label: "When it happens",
			filled: Boolean(getTextValue(fieldValues, "problem_when")),
			value:
				getTextValue(fieldValues, "problem_when") ||
				"When does this problem happen?",
		},
		{
			label: "Where / situation",
			filled: Boolean(getTextValue(fieldValues, "problem_where")),
			value:
				getTextValue(fieldValues, "problem_where") ||
				"Where or in what situation does it happen?",
		},
		{
			label: "Trigger",
			filled: Boolean(getTextValue(fieldValues, "problem_trigger")),
			value:
				getTextValue(fieldValues, "problem_trigger") ||
				"What triggers the problem?",
		},
		{
			label: "Pain level",
			filled: Boolean(getTextValue(fieldValues, "pain_level")),
			value: getTextValue(fieldValues, "pain_level") || "Low, Medium, or High.",
		},
		{
			label: "Why solve now",
			filled: Boolean(getTextValue(fieldValues, "pain_why_now")),
			value:
				getTextValue(fieldValues, "pain_why_now") ||
				"Why is this painful enough to solve now?",
		},
	];
}
