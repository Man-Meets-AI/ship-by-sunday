import type { WorkbenchModeProps } from "../types";

function findArtifactValue(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
	artifactKey: string,
	fieldId: string,
) {
	return pinnedArtifacts.find(
		(artifact) => artifact.artifactKey === artifactKey,
	)?.fieldValues?.[fieldId];
}

function getStringValue(value: unknown) {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: null;
}

export function getPaperPhotoFlowContext(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
) {
	const selectedUser =
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"user_statement",
				"selected_problem_owner",
			),
		) ?? "your chosen user";
	const userPain =
		getStringValue(
			findArtifactValue(pinnedArtifacts, "user_statement", "problem_when"),
		) ??
		getStringValue(
			findArtifactValue(pinnedArtifacts, "user_statement", "problem_trigger"),
		) ??
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"user_statement",
				"selected_problem_statement",
			),
		) ??
		"when and how this problem shows up";
	const currentWorkaround =
		getStringValue(
			findArtifactValue(pinnedArtifacts, "user_statement", "pain_why_now"),
		) ??
		getStringValue(
			findArtifactValue(pinnedArtifacts, "user_statement", "problem_where"),
		) ??
		"why this problem is painful enough to solve now";
	const outcome =
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"outcome_statement",
				"outcome_statement_body",
			),
		) ?? "the promised result";
	const successLooksLike =
		getStringValue(
			findArtifactValue(
				pinnedArtifacts,
				"outcome_statement",
				"messaging_what_it_does",
			),
		) ?? "what the user can review, send, or use when the product works";

	return {
		selectedUser,
		userPain,
		currentWorkaround,
		outcome,
		successLooksLike,
	};
}
