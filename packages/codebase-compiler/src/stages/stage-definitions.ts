import type { CanonicalProjectFactKey } from "../canonical-project-definition/project-definition";

export type CodebaseStageId = "codebase" | "review";

export type CodebaseStepDefinition = {
	id: string;
	label: string;
	fieldKeys: readonly CanonicalProjectFactKey[];
	requiredFieldKeys?: readonly CanonicalProjectFactKey[];
};

export type CodebaseStageDefinition = {
	id: CodebaseStageId;
	label: string;
	description: string;
	route: `/${string}`;
	steps: readonly CodebaseStepDefinition[];
};

const codebaseStageSteps = [
	{
		id: "foundation",
		label: "Foundation",
		fieldKeys: ["product_name", "product_summary", "primary_user"],
	},
	{
		id: "problem",
		label: "Problem",
		fieldKeys: ["problem_statement", "problem_trigger", "problem_severity"],
	},
	{
		id: "outcome",
		label: "Outcome",
		fieldKeys: ["success_looks_like", "core_flow"],
	},
	{
		id: "design",
		label: "Design",
		fieldKeys: ["design_preset_id", "theme_preset", "design_references"],
		requiredFieldKeys: [],
	},
	{
		id: "pricing",
		label: "Pricing",
		fieldKeys: ["pricing_model", "pricing"],
		requiredFieldKeys: ["pricing_model", "pricing"],
	},
	{
		id: "setup",
		label: "Setup",
		fieldKeys: ["scope_in", "scope_out", "domain", "contact_email"],
		requiredFieldKeys: [],
	},
	{
		id: "generated-preview",
		label: "Generated preview",
		fieldKeys: [],
		requiredFieldKeys: [],
	},
] as const satisfies readonly CodebaseStepDefinition[];

export const codebaseStageDefinitions = [
	{
		id: "codebase",
		label: "Codebase",
		description:
			"Lock the full reduced codebase on one page before review and download.",
		route: "/codebase",
		steps: codebaseStageSteps,
	},
	{
		id: "review",
		label: "Review",
		description: "Review readiness and download the codebases and repo.",
		route: "/review",
		steps: [],
	},
] as const satisfies readonly CodebaseStageDefinition[];

export const codebaseStageIds = codebaseStageDefinitions.map(
	(stage) => stage.id,
);

const codebaseStageDefinitionById = new Map(
	codebaseStageDefinitions.map((stage) => [stage.id, stage]),
);

export function getCodebaseStageDefinition(
	stageId: CodebaseStageId,
): CodebaseStageDefinition {
	const stage = codebaseStageDefinitionById.get(stageId);
	if (!stage) {
		throw new Error(`Unknown codebase stage: ${stageId}`);
	}

	return stage;
}
