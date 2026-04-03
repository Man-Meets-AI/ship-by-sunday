import type { CanonicalProjectFactsDraft } from "@blueprint-compiler";

export const blueprintFieldOptimizationTemplateIds = {
	problem_statement: "blueprint_problem_statement",
} as const;

export type BlueprintOptimizableFieldKey =
	keyof typeof blueprintFieldOptimizationTemplateIds;

type BlueprintFieldOptimizationTemplate = {
	templateId: string;
	buildPrompt: (draftValues: CanonicalProjectFactsDraft) => string;
};

const blueprintFieldOptimizationTemplates = {
	problem_statement: {
		templateId: blueprintFieldOptimizationTemplateIds.problem_statement,
		buildPrompt: (draftValues: CanonicalProjectFactsDraft) => {
			const contextLines = [
				"Rewrite the founder's problem statement so it is sharper, more concrete, and easier to say out loud.",
				"Return plain text only for the improved problem statement.",
				"Do not add bullets, labels, markdown, or explanation.",
				"Keep the statement rooted in the founder's product, the user, the pain trigger, and the outcome they want instead.",
				"",
				"Context:",
				`- Product name: ${draftValues.product_name?.trim() || "(blank)"}`,
				`- Product summary: ${draftValues.product_summary?.trim() || "(blank)"}`,
				`- Primary user: ${draftValues.primary_user?.trim() || "(blank)"}`,
				`- Current problem statement: ${draftValues.problem_statement?.trim() || "(blank)"}`,
				`- Problem trigger: ${draftValues.problem_trigger?.trim() || "(blank)"}`,
				`- Problem severity: ${draftValues.problem_severity?.trim() || "(blank)"}`,
				`- Success looks like: ${draftValues.success_looks_like?.trim() || "(blank)"}`,
			];

			return contextLines.join("\n");
		},
	},
} as const satisfies Record<
	BlueprintOptimizableFieldKey,
	BlueprintFieldOptimizationTemplate
>;

export function isBlueprintFieldOptimizable(
	fieldKey: string,
): fieldKey is BlueprintOptimizableFieldKey {
	return fieldKey in blueprintFieldOptimizationTemplates;
}

export function buildBlueprintFieldOptimizationRequest(
	fieldKey: BlueprintOptimizableFieldKey,
	draftValues: CanonicalProjectFactsDraft,
) {
	const template = blueprintFieldOptimizationTemplates[fieldKey];

	return {
		templateId: template.templateId,
		prompt: template.buildPrompt(draftValues),
	};
}
