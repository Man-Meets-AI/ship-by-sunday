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
		fieldKeys: [
			"product_name",
			"product_summary",
			"primary_user",
			"why_this_matters",
		],
	},
	{
		id: "problem",
		label: "Problem",
		fieldKeys: [
			"problem_statement",
			"problem_context_when",
			"problem_context_where",
			"problem_trigger",
			"problem_severity",
			"problem_urgency",
		],
	},
	{
		id: "outcome",
		label: "Outcome",
		fieldKeys: [
			"outcome_statement",
			"success_looks_like",
			"user_benefit",
			"evidence_summary",
			"core_flow_summary",
		],
	},
	{
		id: "scope",
		label: "Scope",
		fieldKeys: ["scope_in", "scope_out", "non_goals", "v1_rationale"],
	},
] as const satisfies readonly BlueprintStepDefinition[];

const designStageSteps = [
	{
		id: "flow",
		label: "Flow",
		fieldKeys: ["screen_sequence", "must_have_capabilities", "surface_type"],
		requiredFieldKeys: ["screen_sequence", "must_have_capabilities"],
	},
	{
		id: "references",
		label: "References",
		fieldKeys: ["design_references", "brand_assets", "existing_system_mode"],
	},
	{
		id: "direction",
		label: "Direction",
		fieldKeys: [
			"visual_thesis",
			"content_plan",
			"interaction_thesis",
			"hero_goal",
			"primary_cta",
			"proof_strategy",
			"objections",
			"section_narrative",
			"copy_tone",
		],
	},
	{
		id: "system",
		label: "System",
		fieldKeys: [
			"design_tokens",
			"typography_direction",
			"imagery_direction",
			"layout_direction",
		],
	},
] as const satisfies readonly BlueprintStepDefinition[];

const marketingStageSteps = [
	{
		id: "operating-system",
		label: "Operating System",
		fieldKeys: [
			"marketing_goals",
			"channel_scope",
			"campaign_types",
			"brand_voice_summary",
			"approved_claims",
			"do_not_say_rules",
			"proof_sources",
			"workflow_map",
			"research_scope",
			"research_needs",
			"content_workflows",
			"analytics_needs",
			"creative_spec",
		],
		requiredFieldKeys: [
			"marketing_goals",
			"channel_scope",
			"campaign_types",
			"brand_voice_summary",
			"approved_claims",
			"do_not_say_rules",
			"proof_sources",
			"workflow_map",
			"research_scope",
			"research_needs",
			"content_workflows",
			"analytics_needs",
			"creative_spec",
		],
	},
] as const satisfies readonly BlueprintStepDefinition[];

const buildPlanStageSteps = [
	{
		id: "delivery",
		label: "Delivery",
		fieldKeys: [
			"objective",
			"user_visible_outcome",
			"distribution_model",
			"install_destination",
			"buyer_ai_promise",
			"pricing_model",
			"price_usd_cents",
			"price_display",
			"currency",
			"domain",
			"support_email",
		],
		requiredFieldKeys: [
			"objective",
			"user_visible_outcome",
			"distribution_model",
			"install_destination",
			"buyer_ai_promise",
			"pricing_model",
			"price_usd_cents",
			"price_display",
			"currency",
		],
	},
	{
		id: "plan",
		label: "Plan",
		fieldKeys: [
			"constraints",
			"deliverables",
			"risks",
			"dependencies",
			"open_questions",
			"selected_next_slice",
		],
	},
	{
		id: "validation",
		label: "Validation",
		fieldKeys: [
			"done_when",
			"acceptance_criteria",
			"validation_plan",
			"demo_flow",
		],
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
		description: "Lock the product, problem, outcome, and v1 scope.",
		route: "/product",
		steps: productStageSteps,
	},
	{
		id: "design",
		label: "Design",
		description: "Collect flow, references, direction, and system decisions.",
		route: "/design",
		steps: designStageSteps,
	},
	{
		id: "marketing",
		label: "Marketing",
		description: "Define goals, voice, proof, and repeatable workflows.",
		route: "/marketing",
		steps: marketingStageSteps,
	},
	{
		id: "build-plan",
		label: "Build Plan",
		description: "Capture the implementation, validation, and pricing plan.",
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
