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
				"Choose one user-problem pair above.",
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
			label: "Pain moment",
			filled: Boolean(getTextValue(fieldValues, "pain_moment")),
			value:
				getTextValue(fieldValues, "pain_moment") ||
				"Name the exact moment this becomes painful.",
		},
		{
			label: "Current workaround",
			filled: Boolean(getTextValue(fieldValues, "current_solution")),
			value:
				getTextValue(fieldValues, "current_solution") ||
				"Describe how they handle it today.",
		},
		{
			label: "Reach this week",
			filled: Boolean(getTextValue(fieldValues, "reachability")),
			value:
				getTextValue(fieldValues, "reachability") ||
				"State the real path you have to show this to them this week.",
		},
	];
}
