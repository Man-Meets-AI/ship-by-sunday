import {
	buildDesignPresetFactSeed,
	createCanonicalProjectDefinition,
	DEFAULT_DESIGN_PRESET_ID,
	type CanonicalProjectDefinition,
	type CanonicalProjectDefinitionDraft,
	type CanonicalProjectFactsDraft,
} from "@shipbysunday/blueprint-compiler";
import {
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

function deriveLegacyThemePreset(legacyFacts: Record<string, unknown>) {
	const preset =
		typeof legacyFacts.theme_preset === "string"
			? legacyFacts.theme_preset.trim()
			: undefined;
	if (preset && !preset.startsWith("#")) {
		return preset;
	}
	const hex =
		typeof legacyFacts.theme_hex === "string"
			? legacyFacts.theme_hex.trim()
			: undefined;
	if (hex && !hex.startsWith("#")) {
		return hex;
	}
	return undefined;
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
		design_preset_id:
			typeof legacyFacts.design_preset_id === "string"
				? legacyFacts.design_preset_id.trim()
				: undefined,
		theme_preset: deriveLegacyThemePreset(legacyFacts),
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
): CanonicalProjectFactsDraft {
	const normalizedDesignPresetId =
		typeof facts.design_preset_id === "string"
			? facts.design_preset_id
			: DEFAULT_DESIGN_PRESET_ID;
	const presetSeed = buildDesignPresetFactSeed(normalizedDesignPresetId);
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
	return {
		product_name:
			typeof facts.product_name === "string" ? facts.product_name : undefined,
		product_summary:
			typeof facts.product_summary === "string"
				? facts.product_summary
				: undefined,
		primary_user:
			typeof facts.primary_user === "string" ? facts.primary_user : undefined,
		problem_statement:
			typeof facts.problem_statement === "string"
				? facts.problem_statement
				: undefined,
		problem_context_when: when,
		problem_context_where: where,
		problem_trigger:
			typeof facts.problem_trigger === "string"
				? facts.problem_trigger
				: undefined,
		problem_severity:
			typeof facts.problem_severity === "string"
				? facts.problem_severity
				: undefined,
		problem_urgency: deriveProblemUrgency(
			typeof facts.problem_severity === "string"
				? facts.problem_severity
				: undefined,
		),
		outcome_statement:
			typeof facts.success_looks_like === "string"
				? facts.success_looks_like
				: undefined,
		success_looks_like:
			typeof facts.success_looks_like === "string"
				? facts.success_looks_like
				: undefined,
		user_benefit:
			typeof facts.success_looks_like === "string"
				? facts.success_looks_like
				: undefined,
		evidence_summary:
			typeof facts.problem_statement === "string"
				? `The founder reports: ${facts.problem_statement}`
				: undefined,
		why_this_matters:
			typeof facts.product_summary === "string"
				? facts.product_summary
				: undefined,
		core_flow_summary:
			facts.core_flow === undefined ? undefined : coreFlow.join(" -> "),
		screen_sequence: facts.core_flow === undefined ? undefined : screenSequence,
		must_have_capabilities:
			facts.core_flow === undefined ? undefined : capabilities,
		scope_in: normalizedScopeIn,
		scope_out: normalizedScopeOut,
		non_goals: scopeOut === undefined ? undefined : normalizedScopeOut,
		v1_rationale:
			facts.core_flow === undefined
				? undefined
				: coreFlow.length > 0
					? `Start with ${coreFlow[0]} and keep the first release focused.`
					: "",
		design_references:
			facts.design_references === undefined ||
			(Array.isArray(facts.design_references) &&
				facts.design_references.length === 0)
				? [...presetSeed.design_references]
				: Array.isArray(facts.design_references)
					? facts.design_references
					: [...presetSeed.design_references],
		visual_thesis: presetSeed.visual_thesis,
		content_plan: presetSeed.content_plan,
		interaction_thesis: presetSeed.interaction_thesis,
		design_tokens: presetSeed.design_tokens,
		typography_direction: presetSeed.typography_direction,
		imagery_direction: presetSeed.imagery_direction,
		layout_direction: presetSeed.layout_direction,
		existing_system_mode: presetSeed.existing_system_mode,
		copy_tone: presetSeed.copy_tone,
		pricing_model: "one_time",
		design_preset_id: normalizedDesignPresetId,
		theme_preset:
			typeof facts.theme_preset === "string"
				? facts.theme_preset
				: presetSeed.theme_preset,
		price_usd_cents: Math.max(0, Math.round(pricing * 100)),
		price_display: pricing > 0 ? formatPriceDisplay(pricing) : undefined,
		currency: pricing > 0 ? "USD" : undefined,
		domain: typeof facts.domain === "string" ? facts.domain : undefined,
		contact_email:
			typeof facts.contact_email === "string" ? facts.contact_email : undefined,
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
