import type { CanonicalProjectFactKey } from "../canonical-project-definition/project-definition";

export type PacketStageId =
	| "start"
	| "product"
	| "design"
	| "marketing"
	| "build-plan"
	| "review";

export type PacketStepDefinition = {
	id: string;
	label: string;
	fieldKeys: readonly CanonicalProjectFactKey[];
	requiredFieldKeys?: readonly CanonicalProjectFactKey[];
};

export type PacketStageDefinition = {
	id: PacketStageId;
	label: string;
	description: string;
	route: `/${string}`;
	steps: readonly PacketStepDefinition[];
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
] as const satisfies readonly PacketStepDefinition[];

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
] as const satisfies readonly PacketStepDefinition[];

const marketingStageSteps = [
	{
		id: "goals",
		label: "Goals",
		fieldKeys: ["marketing_goals", "channel_scope", "campaign_types"],
	},
	{
		id: "voice",
		label: "Voice",
		fieldKeys: [
			"brand_voice_summary",
			"approved_claims",
			"do_not_say_rules",
			"proof_sources",
		],
	},
	{
		id: "operations",
		label: "Operations",
		fieldKeys: [
			"workflow_map",
			"research_scope",
			"research_needs",
			"content_workflows",
			"analytics_needs",
			"creative_spec",
		],
	},
] as const satisfies readonly PacketStepDefinition[];

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
		],
	},
	{
		id: "execution",
		label: "Execution",
		fieldKeys: [
			"constraints",
			"deliverables",
			"done_when",
			"acceptance_criteria",
			"validation_plan",
			"demo_flow",
			"risks",
			"dependencies",
			"open_questions",
			"selected_next_slice",
		],
	},
	{
		id: "pricing",
		label: "Pricing",
		fieldKeys: [
			"pricing_model",
			"price_usd_cents",
			"price_display",
			"currency",
			"domain",
			"support_email",
		],
		requiredFieldKeys: [
			"pricing_model",
			"price_usd_cents",
			"price_display",
			"currency",
		],
	},
] as const satisfies readonly PacketStepDefinition[];

export const packetStageDefinitions = [
	{
		id: "start",
		label: "Start",
		description: "Orientation and packet-first framing.",
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
		description: "Review readiness and download the packets and repo.",
		route: "/review",
		steps: [],
	},
] as const satisfies readonly PacketStageDefinition[];

export const packetStageIds = packetStageDefinitions.map((stage) => stage.id);

const packetStageDefinitionById = new Map(
	packetStageDefinitions.map((stage) => [stage.id, stage]),
);

export function getPacketStageDefinition(
	stageId: PacketStageId,
): PacketStageDefinition {
	const stage = packetStageDefinitionById.get(stageId);
	if (!stage) {
		throw new Error(`Unknown packet stage: ${stageId}`);
	}

	return stage;
}
