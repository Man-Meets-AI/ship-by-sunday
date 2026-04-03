import type { CanonicalProjectFactKey } from "../canonical-project-definition/project-definition";

export type BlueprintStageId =
	| "start"
	| "product"
	| "design"
	| "marketing"
	| "build-plan"
	| "review";

export type BlueprintStepDefinition = {
	id: string;
	label: string;
	fieldKeys: readonly CanonicalProjectFactKey[];
	requiredFieldKeys?: readonly CanonicalProjectFactKey[];
};

export type BlueprintStageDefinition = {
	id: BlueprintStageId;
	label: string;
	description: string;
	route: `/${string}`;
	steps: readonly BlueprintStepDefinition[];
};

const productStageSteps = [
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
] as const satisfies readonly BlueprintStepDefinition[];

const designStageSteps = [
	{
		id: "direction",
		label: "Direction",
		fieldKeys: ["theme_hex"],
		requiredFieldKeys: [],
	},
	{
		id: "references",
		label: "References",
		fieldKeys: ["design_references"],
		requiredFieldKeys: [],
	},
] as const satisfies readonly BlueprintStepDefinition[];

const marketingStageSteps = [
	{
		id: "preview",
		label: "Generated preview",
		fieldKeys: [],
		requiredFieldKeys: [],
	},
] as const satisfies readonly BlueprintStepDefinition[];

const buildPlanStageSteps = [
	{
		id: "delivery",
		label: "Delivery",
		fieldKeys: ["pricing"],
		requiredFieldKeys: ["pricing"],
	},
	{
		id: "setup",
		label: "Setup",
		fieldKeys: ["scope_in", "scope_out", "domain", "contact_email"],
		requiredFieldKeys: [],
	},
] as const satisfies readonly BlueprintStepDefinition[];

export const blueprintStageDefinitions = [
	{
		id: "start",
		label: "Start",
		description: "Orientation and blueprint-first framing.",
		route: "/start",
		steps: [],
	},
	{
		id: "product",
		label: "Product",
		description: "Lock the product, problem, and core flow.",
		route: "/product",
		steps: productStageSteps,
	},
	{
		id: "design",
		label: "Design",
		description: "Set the visual anchor and any references.",
		route: "/design",
		steps: designStageSteps,
	},
	{
		id: "marketing",
		label: "Marketing",
		description:
			"Review generated defaults instead of filling a marketing form.",
		route: "/marketing",
		steps: marketingStageSteps,
	},
	{
		id: "build-plan",
		label: "Build Plan",
		description: "Capture pricing and optional rollout details.",
		route: "/build-plan",
		steps: buildPlanStageSteps,
	},
	{
		id: "review",
		label: "Review",
		description: "Review readiness and download the blueprints and repo.",
		route: "/review",
		steps: [],
	},
] as const satisfies readonly BlueprintStageDefinition[];

export const blueprintStageIds = blueprintStageDefinitions.map(
	(stage) => stage.id,
);

const blueprintStageDefinitionById = new Map(
	blueprintStageDefinitions.map((stage) => [stage.id, stage]),
);

export function getBlueprintStageDefinition(
	stageId: BlueprintStageId,
): BlueprintStageDefinition {
	const stage = blueprintStageDefinitionById.get(stageId);
	if (!stage) {
		throw new Error(`Unknown blueprint stage: ${stageId}`);
	}

	return stage;
}
