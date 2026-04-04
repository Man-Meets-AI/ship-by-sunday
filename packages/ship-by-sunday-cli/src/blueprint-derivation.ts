import {
	createCanonicalProjectDefinition,
	createCompleteProjectDefinition,
	type CanonicalProjectDefinition,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFacts,
} from "@shipbysunday/blueprint-compiler";
import {
	DEFAULT_THEME_HEX,
	createScopeFromCoreFlow,
	type CliBlueprintFactsDraft,
} from "./field-contract";

function asTextList(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.map((entry) =>
			String(entry)
				.trim()
				.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
				.trim(),
		)
		.filter((entry) => entry.length > 0);
}

function formatPriceDisplay(pricing: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: pricing % 1 === 0 ? 0 : 2,
		minimumFractionDigits: pricing % 1 === 0 ? 0 : 2,
	}).format(pricing);
}

function deriveProblemUrgency(problemSeverity?: string) {
	if (problemSeverity === undefined) {
		return "Needs attention soon";
	}

	const severity = Number(problemSeverity);
	if (!Number.isFinite(severity)) {
		return "Needs attention soon";
	}

	if (severity >= 8) {
		return "Needs action now";
	}

	if (severity >= 5) {
		return "Needs attention soon";
	}

	return "Can schedule";
}

function deriveLegacyProblemContext(problemTrigger?: string) {
	const trigger = problemTrigger?.trim();
	if (!trigger) {
		return {
			when: "During the moment the user feels the problem most sharply.",
			where: "In the product or workflow where the problem appears.",
		};
	}

	return {
		when: `When ${trigger}`,
		where: "In the workflow where the pain shows up.",
	};
}

function deriveLegacyFlowFacts(coreFlow: readonly string[]) {
	const screenSequence = coreFlow.map(
		(entry, index) => `${index + 1}. ${entry}`,
	);
	const capabilities = coreFlow.map((entry) => entry);

	return {
		screenSequence,
		capabilities,
	};
}

export function extractCliFactsFromLegacyFacts(
	legacyFacts: Record<string, unknown>,
): CliBlueprintFactsDraft {
	const coreFlow =
		"core_flow" in legacyFacts
			? asTextList(legacyFacts.core_flow)
			: asTextList(legacyFacts.screen_sequence);
	const scopeIn = asTextList(legacyFacts.scope_in);
	const scopeOut = asTextList(legacyFacts.scope_out);
	const designReferences = asTextList(legacyFacts.design_references);
	const pricing =
		typeof legacyFacts.pricing === "number"
			? legacyFacts.pricing
			: typeof legacyFacts.price_usd_cents === "number"
				? legacyFacts.price_usd_cents / 100
				: undefined;

	return {
		product_name:
			typeof legacyFacts.product_name === "string"
				? legacyFacts.product_name.trim()
				: undefined,
		product_summary:
			typeof legacyFacts.product_summary === "string"
				? legacyFacts.product_summary.trim()
				: undefined,
		primary_user:
			typeof legacyFacts.primary_user === "string"
				? legacyFacts.primary_user.trim()
				: undefined,
		problem_statement:
			typeof legacyFacts.problem_statement === "string"
				? legacyFacts.problem_statement.trim()
				: undefined,
		problem_trigger:
			typeof legacyFacts.problem_trigger === "string"
				? legacyFacts.problem_trigger.trim()
				: undefined,
		problem_severity:
			typeof legacyFacts.problem_severity === "string"
				? legacyFacts.problem_severity.trim()
				: undefined,
		success_looks_like:
			typeof legacyFacts.success_looks_like === "string"
				? legacyFacts.success_looks_like.trim()
				: typeof legacyFacts.outcome_statement === "string"
					? legacyFacts.outcome_statement.trim()
					: undefined,
		core_flow: coreFlow.length > 0 ? coreFlow : undefined,
		pricing,
		theme_hex:
			typeof legacyFacts.theme_hex === "string"
				? legacyFacts.theme_hex.trim()
				: DEFAULT_THEME_HEX,
		design_references:
			designReferences.length > 0 ? designReferences : undefined,
		scope_in: scopeIn.length > 0 ? scopeIn : undefined,
		scope_out: scopeOut.length > 0 ? scopeOut : undefined,
		domain:
			typeof legacyFacts.domain === "string"
				? legacyFacts.domain.trim()
				: undefined,
		contact_email:
			typeof legacyFacts.contact_email === "string"
				? legacyFacts.contact_email.trim()
				: typeof legacyFacts.support_email === "string"
					? legacyFacts.support_email.trim()
					: undefined,
	};
}

export function buildCanonicalProjectFactsFromCliFacts(
	facts: CliBlueprintFactsDraft,
): CanonicalProjectFacts {
	const baselineFacts = createCompleteProjectDefinition().facts;
	const coreFlow =
		facts.core_flow === undefined
			? []
			: Array.isArray(facts.core_flow)
				? facts.core_flow
				: [];
	const scopeIn =
		facts.scope_in === undefined
			? undefined
			: Array.isArray(facts.scope_in)
				? facts.scope_in
				: [];
	const scopeOut =
		facts.scope_out === undefined
			? undefined
			: Array.isArray(facts.scope_out)
				? facts.scope_out
				: [];
	const pricing = typeof facts.pricing === "number" ? facts.pricing : 0;
	const { when, where } = deriveLegacyProblemContext(
		typeof facts.problem_trigger === "string"
			? facts.problem_trigger
			: undefined,
	);
	const { screenSequence, capabilities } = deriveLegacyFlowFacts(coreFlow);
	const generatedScope = createScopeFromCoreFlow(coreFlow);
	const normalizedScopeIn =
		scopeIn === undefined || scopeIn.length === 0
			? generatedScope.scopeIn
			: scopeIn;
	const normalizedScopeOut =
		scopeOut === undefined || scopeOut.length === 0
			? generatedScope.scopeOut
			: scopeOut;
	const priceUsdCents = Math.max(0, Math.round(pricing * 100));

	return {
		...baselineFacts,
		product_name:
			typeof facts.product_name === "string"
				? facts.product_name
				: baselineFacts.product_name,
		product_summary:
			typeof facts.product_summary === "string"
				? facts.product_summary
				: baselineFacts.product_summary,
		primary_user:
			typeof facts.primary_user === "string"
				? facts.primary_user
				: baselineFacts.primary_user,
		problem_statement:
			typeof facts.problem_statement === "string"
				? facts.problem_statement
				: baselineFacts.problem_statement,
		problem_context_when: when,
		problem_context_where: where,
		problem_trigger:
			typeof facts.problem_trigger === "string"
				? facts.problem_trigger
				: baselineFacts.problem_trigger,
		problem_severity:
			typeof facts.problem_severity === "string"
				? facts.problem_severity
				: baselineFacts.problem_severity,
		problem_urgency: deriveProblemUrgency(
			typeof facts.problem_severity === "string"
				? facts.problem_severity
				: baselineFacts.problem_severity,
		),
		outcome_statement:
			typeof facts.success_looks_like === "string"
				? facts.success_looks_like
				: baselineFacts.outcome_statement,
		success_looks_like:
			typeof facts.success_looks_like === "string"
				? facts.success_looks_like
				: baselineFacts.success_looks_like,
		user_benefit:
			typeof facts.success_looks_like === "string"
				? facts.success_looks_like
				: baselineFacts.user_benefit,
		evidence_summary:
			typeof facts.problem_statement === "string"
				? `The founder reports: ${facts.problem_statement}`
				: baselineFacts.evidence_summary,
		why_this_matters:
			typeof facts.product_summary === "string"
				? facts.product_summary
				: baselineFacts.why_this_matters,
		core_flow_summary:
			facts.core_flow === undefined
				? baselineFacts.core_flow_summary
				: coreFlow.join(" -> "),
		screen_sequence:
			facts.core_flow === undefined
				? baselineFacts.screen_sequence
				: screenSequence,
		must_have_capabilities:
			facts.core_flow === undefined
				? baselineFacts.must_have_capabilities
				: capabilities,
		scope_in: normalizedScopeIn,
		scope_out: normalizedScopeOut,
		non_goals:
			scopeOut === undefined ? baselineFacts.non_goals : normalizedScopeOut,
		v1_rationale:
			facts.core_flow === undefined
				? baselineFacts.v1_rationale
				: coreFlow.length > 0
					? `Start with ${coreFlow[0]} and keep the first release focused.`
					: "",
		surface_type: "web_app",
		design_references:
			facts.design_references === undefined ||
			(Array.isArray(facts.design_references) &&
				facts.design_references.length === 0)
				? baselineFacts.design_references
				: Array.isArray(facts.design_references)
					? facts.design_references
					: baselineFacts.design_references,
		visual_thesis: baselineFacts.visual_thesis,
		content_plan: baselineFacts.content_plan,
		interaction_thesis: baselineFacts.interaction_thesis,
		design_tokens: baselineFacts.design_tokens,
		typography_direction: baselineFacts.typography_direction,
		imagery_direction: baselineFacts.imagery_direction,
		layout_direction: baselineFacts.layout_direction,
		brand_assets: baselineFacts.brand_assets,
		existing_system_mode: baselineFacts.existing_system_mode,
		hero_goal: baselineFacts.hero_goal,
		primary_cta: baselineFacts.primary_cta,
		proof_strategy: baselineFacts.proof_strategy,
		objections: baselineFacts.objections,
		section_narrative: baselineFacts.section_narrative,
		copy_tone: baselineFacts.copy_tone,
		marketing_goals: baselineFacts.marketing_goals,
		channel_scope: baselineFacts.channel_scope,
		campaign_types: baselineFacts.campaign_types,
		brand_voice_summary: baselineFacts.brand_voice_summary,
		approved_claims: baselineFacts.approved_claims,
		do_not_say_rules: baselineFacts.do_not_say_rules,
		workflow_map: baselineFacts.workflow_map,
		research_scope: baselineFacts.research_scope,
		research_needs: baselineFacts.research_needs,
		content_workflows: baselineFacts.content_workflows,
		analytics_needs: baselineFacts.analytics_needs,
		proof_sources: baselineFacts.proof_sources,
		creative_spec: baselineFacts.creative_spec,
		objective: baselineFacts.objective,
		user_visible_outcome: baselineFacts.user_visible_outcome,
		constraints: baselineFacts.constraints,
		deliverables: baselineFacts.deliverables,
		done_when: baselineFacts.done_when,
		acceptance_criteria: baselineFacts.acceptance_criteria,
		validation_plan: baselineFacts.validation_plan,
		demo_flow: baselineFacts.demo_flow,
		risks: baselineFacts.risks,
		dependencies: baselineFacts.dependencies,
		open_questions: baselineFacts.open_questions,
		selected_next_slice: baselineFacts.selected_next_slice,
		pricing_model: baselineFacts.pricing_model,
		price_usd_cents: priceUsdCents,
		price_display: formatPriceDisplay(pricing),
		currency: "USD",
		domain: typeof facts.domain === "string" ? facts.domain : undefined,
		support_email:
			typeof facts.contact_email === "string" ? facts.contact_email : undefined,
	};
}

export function buildCanonicalProjectDefinitionFromCliFacts(args: {
	clerkUserId: string;
	productKey: string;
	facts: CliBlueprintFactsDraft;
	createdAt?: number;
	updatedAt?: number;
	placeholdersInUse?: CanonicalProjectDefinition["placeholdersInUse"];
}): CanonicalProjectDefinition {
	const createdAt = args.createdAt ?? Date.now();
	const updatedAt = args.updatedAt ?? createdAt;

	return createCanonicalProjectDefinition({
		clerkUserId: args.clerkUserId,
		productKey: args.productKey,
		facts: buildCanonicalProjectFactsFromCliFacts(args.facts),
		placeholdersInUse: args.placeholdersInUse ?? [],
		createdAt,
		updatedAt,
	});
}

export function buildCanonicalProjectDefinitionDraftFromCliFacts(args: {
	clerkUserId: string;
	productKey: string;
	facts: CliBlueprintFactsDraft;
	createdAt?: number;
	updatedAt?: number;
	placeholdersInUse?: CanonicalProjectDefinitionDraft["placeholdersInUse"];
}): CanonicalProjectDefinitionDraft {
	const createdAt = args.createdAt ?? Date.now();
	const updatedAt = args.updatedAt ?? createdAt;

	return {
		clerkUserId: args.clerkUserId,
		productKey: args.productKey,
		schemaVersion: 1,
		facts: args.facts as CanonicalProjectDefinitionDraft["facts"],
		placeholdersInUse: args.placeholdersInUse ?? [],
		createdAt,
		updatedAt,
	};
}
