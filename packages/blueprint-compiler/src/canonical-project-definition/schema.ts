import { z } from "zod";

const requiredText = z.string().trim().min(1);
const requiredTextList = z.array(requiredText).min(1);

export const canonicalPlaceholderFieldSchema = z.enum([
	"domain",
	"contact_email",
	"support_email",
]);

export const canonicalSurfaceTypeSchema = z.literal("web_app");

export const canonicalProjectFactsShape = {
	product_name: requiredText,
	product_summary: requiredText,
	primary_user: requiredText,
	problem_statement: requiredText,
	core_flow: requiredTextList,
	pricing: z.number().int().nonnegative(),
	theme_preset: requiredText,
	problem_context_when: requiredText,
	problem_context_where: requiredText,
	problem_trigger: requiredText,
	problem_severity: requiredText,
	problem_urgency: requiredText,
	outcome_statement: requiredText,
	success_looks_like: requiredText,
	user_benefit: requiredText,
	evidence_summary: requiredText,
	why_this_matters: requiredText,
	core_flow_summary: requiredText,
	screen_sequence: requiredTextList,
	must_have_capabilities: requiredTextList,
	scope_in: requiredTextList,
	scope_out: requiredTextList,
	non_goals: requiredTextList,
	v1_rationale: requiredText,
	distribution_model: requiredText,
	install_destination: requiredText,
	buyer_ai_promise: requiredText,
	surface_type: canonicalSurfaceTypeSchema.default("web_app"),
	design_references: requiredTextList,
	visual_thesis: requiredText,
	content_plan: requiredText,
	interaction_thesis: requiredText,
	design_tokens: requiredText,
	typography_direction: requiredText,
	imagery_direction: requiredText,
	layout_direction: requiredText,
	brand_assets: requiredTextList,
	existing_system_mode: requiredText,
	hero_goal: requiredText,
	primary_cta: requiredText,
	proof_strategy: requiredText,
	objections: requiredTextList,
	section_narrative: requiredText,
	copy_tone: requiredText,
	marketing_goals: requiredTextList,
	channel_scope: requiredTextList,
	campaign_types: requiredTextList,
	brand_voice_summary: requiredText,
	approved_claims: requiredTextList,
	do_not_say_rules: requiredTextList,
	workflow_map: requiredTextList,
	research_scope: requiredTextList,
	research_needs: requiredTextList,
	content_workflows: requiredTextList,
	analytics_needs: requiredTextList,
	proof_sources: requiredTextList,
	creative_spec: requiredText,
	objective: requiredText,
	user_visible_outcome: requiredText,
	constraints: requiredTextList,
	deliverables: requiredTextList,
	done_when: requiredText,
	acceptance_criteria: requiredTextList,
	validation_plan: requiredTextList,
	demo_flow: requiredText,
	risks: requiredTextList,
	dependencies: requiredTextList,
	open_questions: requiredTextList,
	selected_next_slice: requiredText,
	pricing_model: requiredText,
	price_usd_cents: z.number().int().nonnegative(),
	price_display: requiredText,
	currency: requiredText,
	domain: requiredText.optional(),
	contact_email: requiredText.optional(),
	support_email: requiredText.optional(),
} satisfies Record<string, z.ZodTypeAny>;

export const canonicalProjectFactsSchema = z
	.object(canonicalProjectFactsShape)
	.strict();

export const canonicalProjectFactsDraftShape = z
	.object(canonicalProjectFactsShape)
	.partial()
	.extend({
		core_flow: requiredTextList.optional(),
		pricing: z.number().int().nonnegative().optional(),
		theme_preset: requiredText.optional(),
		contact_email: requiredText.optional(),
	})
	.strict();

export const canonicalProjectFactsDraftSchema = z
	.object(canonicalProjectFactsDraftShape.shape)
	.strict();

export const canonicalProjectDefinitionSchema = z
	.object({
		clerkUserId: requiredText,
		productKey: requiredText,
		schemaVersion: z.literal(1),
		facts: canonicalProjectFactsSchema,
		placeholdersInUse: z.array(canonicalPlaceholderFieldSchema),
		createdAt: z.number().int().nonnegative(),
		updatedAt: z.number().int().nonnegative(),
	})
	.strict();

export const canonicalProjectDefinitionDraftSchema = z
	.object({
		clerkUserId: requiredText,
		productKey: requiredText,
		schemaVersion: z.literal(1),
		facts: canonicalProjectFactsDraftSchema,
		placeholdersInUse: z.array(canonicalPlaceholderFieldSchema),
		createdAt: z.number().int().nonnegative(),
		updatedAt: z.number().int().nonnegative(),
	})
	.strict();

export type CanonicalPlaceholderField = z.infer<
	typeof canonicalPlaceholderFieldSchema
>;
export type CanonicalProjectFacts = z.infer<typeof canonicalProjectFactsSchema>;
export type CanonicalProjectFactsDraft = z.infer<
	typeof canonicalProjectFactsDraftSchema
>;
export type CanonicalProjectDefinition = z.infer<
	typeof canonicalProjectDefinitionSchema
>;
export type CanonicalProjectDefinitionDraft = z.infer<
	typeof canonicalProjectDefinitionDraftSchema
>;
export type CanonicalProjectFactKey = keyof CanonicalProjectFacts;

export const canonicalProjectFactKeys = Object.keys(
	canonicalProjectFactsShape,
) as CanonicalProjectFactKey[];

export const placeholderFriendlyFactKeys = [
	"domain",
	"contact_email",
	"support_email",
] as const satisfies readonly CanonicalPlaceholderField[];
