import type { CanonicalProjectFactsDraft } from "./schema";
import { buildGeneratedDesignSystem } from "../design-system/generated-design-system";
import { buildDesignPresetFactSeed } from "../design-system/design-preset-catalog";

const DEFAULT_SCOPE_OUT = ["Provider setup wizard", "GitHub invite flow"];
const DEFAULT_DESIGN_REFERENCES = [
	"apps/web/src/app/globals.css",
	"apps/web/src/components/ui",
];
const DEFAULT_BRAND_ASSETS = ["wordmark.svg"];
const DEFAULT_OBJECTIONS = [
	"Will this generate real output?",
	"Do I need GitHub access first?",
];
const DEFAULT_SCOPE_IN = ["Codebase intake", "Generated docs", "Repo download"];
const DEFAULT_MUST_HAVE_CAPABILITIES = [
	"Collect canonical facts",
	"Generate codebases",
	"Download repo",
];
const DEFAULT_MARKETING_GOALS = [
	"Explain the promise",
	"Convert buyers",
	"Set accurate expectations",
];
const DEFAULT_CHANNEL_SCOPE = [
	"Homepage",
	"Checkout follow-up",
	"Email handoff",
];
const DEFAULT_CAMPAIGN_TYPES = ["Launch page", "Lifecycle email"];
const DEFAULT_BRAND_VOICE_SUMMARY = "Confident, specific, and non-hype.";
const DEFAULT_APPROVED_CLAIMS = [
	"Codebase-first delivery",
	"Downloadable Codebase",
];
const DEFAULT_DO_NOT_SAY_RULES = [
	"Do not promise zero setup",
	"Do not imply GitHub invite delivery",
];
const DEFAULT_WORKFLOW_MAP = [
	"Launch page refresh",
	"Checkout follow-up sequence",
];
const DEFAULT_RESEARCH_SCOPE = ["Competitors", "Current buyer objections"];
const DEFAULT_RESEARCH_NEEDS = [
	"Buyer interview notes",
	"Competitive copy audit",
];
const DEFAULT_CONTENT_WORKFLOWS = [
	"Homepage updates",
	"Lifecycle email updates",
];
const DEFAULT_ANALYTICS_NEEDS = [
	"Checkout conversion",
	"Codebase download conversion",
];
const DEFAULT_PROOF_SOURCES = [
	"Current checkout data",
	"Founder interview notes",
];
const DEFAULT_CREATIVE_SPEC =
	"Pair codebase previews with repo screenshots and exact file names.";
const DEFAULT_OBJECTIVE =
	"Build the codebase compiler and codebase-first runtime.";
const DEFAULT_USER_VISIBLE_OUTCOME =
	"A buyer can move through the funnel and download a Codebase zip.";
const DEFAULT_CONSTRAINTS = [
	"Web-app only",
	"Download-only delivery",
	"No GitHub invite dependency",
];
const DEFAULT_DELIVERABLES = [
	"Codebase compiler",
	"Protected codebase routes",
	"Repo download",
];
const DEFAULT_DONE_WHEN =
	"A buyer can download the full repo snapshot from Review.";
const DEFAULT_ACCEPTANCE_CRITERIA = [
	"Codebases unlock at the right stages",
	"Repo zip contains generated docs under docs/",
];
const DEFAULT_VALIDATION_PLAN = [
	"Run Codebase contract check",
	"Run generated operating pack check",
];
const DEFAULT_DEMO_FLOW =
	"Complete the funnel, review the Codebase materials, then download the Codebase zip with docs/ at the root.";
const DEFAULT_RISKS = [
	"Schema drift",
	"Missing route tracing",
	"Legacy route confusion",
];
const DEFAULT_DEPENDENCIES = [
	"Next.js tracing config",
	"Convex schema",
	"Codebase templates",
];
const DEFAULT_OPEN_QUESTIONS = ["Which routes need archive downloads first?"];
const DEFAULT_SELECTED_NEXT_SLICE =
	"Bootstrap the compiler and canonical schema.";

function deriveThemePreset(facts: CanonicalProjectFactsDraft) {
	const preset = trimText(
		facts.theme_preset ??
			(facts as CanonicalProjectFactsDraft & { theme_hex?: string }).theme_hex,
	);
	if (!preset) {
		return buildDesignPresetFactSeed(facts.design_preset_id).theme_preset;
	}
	if (preset.startsWith("#")) {
		return buildDesignPresetFactSeed(facts.design_preset_id).theme_preset;
	}
	return preset;
}

function deriveDesignPresetId(facts: CanonicalProjectFactsDraft) {
	return trimText(facts.design_preset_id) || undefined;
}

function trimText(value: string | undefined) {
	return value?.trim() ?? "";
}

function normalizeTextList(value: readonly string[] | undefined) {
	return (value ?? [])
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

function listOrFallback(
	value: readonly string[] | undefined,
	fallback: readonly string[],
) {
	const normalizedValue = normalizeTextList(value);
	return normalizedValue.length > 0 ? normalizedValue : [...fallback];
}

function splitSummaryFlow(value: string | undefined) {
	const summary = trimText(value);
	if (!summary) {
		return [];
	}

	const normalizedSummary = summary
		.replace(/\bthen\b/gi, ",")
		.replace(/->/g, ",")
		.replace(/[•|]/g, ",");
	return normalizedSummary
		.split(/[\n,;]+/)
		.map((item) => item.trim().replace(/[.]+$/, ""))
		.filter(Boolean);
}

function formatPriceDisplay(priceUsdCents: number) {
	const dollars = priceUsdCents / 100;
	return dollars % 1 === 0
		? `$${dollars.toFixed(0)}`
		: `$${dollars.toFixed(2)}`;
}

function deriveProblemUrgency(problemSeverity: string | undefined) {
	if (!problemSeverity) {
		return "";
	}

	const normalizedSeverity = Number(problemSeverity);
	if (!Number.isFinite(normalizedSeverity)) {
		return "Can schedule";
	}

	if (normalizedSeverity >= 8) {
		return "Needs action now";
	}
	if (normalizedSeverity >= 4) {
		return "Needs attention soon";
	}
	return "Can schedule";
}

function derivePriceUsdCents(
	facts: CanonicalProjectFactsDraft,
	priceUsdCents?: number,
) {
	if (typeof priceUsdCents === "number" && Number.isFinite(priceUsdCents)) {
		return Math.max(0, Math.trunc(priceUsdCents));
	}

	if (typeof facts.pricing === "number" && Number.isFinite(facts.pricing)) {
		return Math.max(0, Math.round(facts.pricing * 100));
	}

	return undefined;
}

function derivePricing(priceUsdCents: number | undefined, pricing?: number) {
	if (typeof pricing === "number" && Number.isFinite(pricing)) {
		return pricing;
	}

	if (typeof priceUsdCents === "number" && Number.isFinite(priceUsdCents)) {
		return priceUsdCents / 100;
	}

	return undefined;
}

function deriveCoreFlow(facts: CanonicalProjectFactsDraft) {
	const directCoreFlow = normalizeTextList(facts.core_flow);
	if (directCoreFlow.length > 0) {
		return directCoreFlow;
	}

	const legacyScreenSequence = normalizeTextList(facts.screen_sequence);
	if (legacyScreenSequence.length > 0) {
		return legacyScreenSequence;
	}

	const summaryFlow = splitSummaryFlow(facts.core_flow_summary);
	if (summaryFlow.length > 0) {
		return summaryFlow;
	}

	return [];
}

function deriveScopeIn(
	facts: CanonicalProjectFactsDraft,
	coreFlow: readonly string[],
) {
	const scopeIn = normalizeTextList(facts.scope_in);
	if (scopeIn.length > 0) {
		return scopeIn;
	}

	if (coreFlow.length > 0) {
		return [...coreFlow];
	}

	return [...DEFAULT_SCOPE_IN];
}

function deriveScopeOut(facts: CanonicalProjectFactsDraft) {
	const scopeOut = normalizeTextList(facts.scope_out);
	if (scopeOut.length > 0) {
		return scopeOut;
	}

	return [...DEFAULT_SCOPE_OUT];
}

function deriveDesignReferences(facts: CanonicalProjectFactsDraft) {
	const normalizedDesignReferences = normalizeTextList(facts.design_references);
	if (normalizedDesignReferences.length > 0) {
		return normalizedDesignReferences;
	}
	if (!trimText(facts.design_preset_id) && trimText(facts.theme_preset)) {
		return [];
	}

	return [
		...buildDesignPresetFactSeed(facts.design_preset_id).design_references,
	];
}

function deriveSupportEmail(facts: CanonicalProjectFactsDraft) {
	return trimText(facts.support_email ?? facts.contact_email) || undefined;
}

function deriveContactEmail(facts: CanonicalProjectFactsDraft) {
	return trimText(facts.contact_email ?? facts.support_email) || undefined;
}

function deriveOutcomeStatement(facts: CanonicalProjectFactsDraft) {
	const outcomeStatement = trimText(facts.outcome_statement);
	if (outcomeStatement) {
		return outcomeStatement;
	}

	const successLooksLike = trimText(facts.success_looks_like);
	if (successLooksLike) {
		return successLooksLike;
	}

	return "";
}

function deriveSuccessLooksLike(facts: CanonicalProjectFactsDraft) {
	const successLooksLike = trimText(facts.success_looks_like);
	if (successLooksLike) {
		return successLooksLike;
	}

	const outcomeStatement = trimText(facts.outcome_statement);
	if (outcomeStatement) {
		return outcomeStatement;
	}

	return "";
}

function deriveProblemContextWhen(facts: CanonicalProjectFactsDraft) {
	const existingValue = trimText(facts.problem_context_when);
	if (existingValue) {
		return existingValue;
	}

	return trimText(facts.problem_trigger) || "";
}

function deriveProblemContextWhere(facts: CanonicalProjectFactsDraft) {
	const existingValue = trimText(facts.problem_context_where);
	if (existingValue) {
		return existingValue;
	}

	return trimText(facts.problem_trigger) || "";
}

function deriveProblemTrigger(facts: CanonicalProjectFactsDraft) {
	const existingValue = trimText(facts.problem_trigger);
	if (existingValue) {
		return existingValue;
	}

	const contextWhen = trimText(facts.problem_context_when);
	const contextWhere = trimText(facts.problem_context_where);
	if (contextWhen && contextWhere) {
		return `${contextWhen} in ${contextWhere}`;
	}
	if (contextWhen) {
		return contextWhen;
	}
	if (contextWhere) {
		return contextWhere;
	}
	return "";
}

export function deriveCodebaseFacts(
	facts: CanonicalProjectFactsDraft,
): CanonicalProjectFactsDraft {
	const designPresetId = deriveDesignPresetId(facts);
	const designPresetSeed = buildDesignPresetFactSeed(designPresetId);
	const coreFlow = deriveCoreFlow(facts);
	const priceUsdCents = derivePriceUsdCents(facts, facts.price_usd_cents);
	const pricing = derivePricing(priceUsdCents, facts.pricing);
	const outcomeStatement = deriveOutcomeStatement(facts);
	const successLooksLike = deriveSuccessLooksLike(facts);
	const generatedDesignSystem = buildGeneratedDesignSystem(facts);

	return {
		...facts,
		core_flow: coreFlow,
		pricing,
		design_preset_id: designPresetId,
		theme_preset: deriveThemePreset(facts),
		problem_context_when: deriveProblemContextWhen(facts),
		problem_context_where: deriveProblemContextWhere(facts),
		problem_trigger: deriveProblemTrigger(facts),
		problem_urgency:
			trimText(facts.problem_urgency) ||
			deriveProblemUrgency(facts.problem_severity),
		outcome_statement: outcomeStatement || successLooksLike,
		success_looks_like: successLooksLike || outcomeStatement,
		user_benefit:
			trimText(facts.user_benefit) ||
			"They can move directly into implementation without re-briefing.",
		evidence_summary:
			trimText(facts.evidence_summary) ||
			"Generated docs and repo outputs make the plan concrete.",
		why_this_matters:
			trimText(facts.why_this_matters) ||
			"The codebase should replace vague planning with a usable Ship by Sunday Codebase.",
		core_flow_summary:
			trimText(facts.core_flow_summary) ||
			coreFlow.join(", ") ||
			"Capture the codebase, generate the repo, and review the codebase.",
		screen_sequence: listOrFallback(facts.screen_sequence, coreFlow),
		must_have_capabilities: listOrFallback(
			facts.must_have_capabilities,
			DEFAULT_MUST_HAVE_CAPABILITIES,
		),
		scope_in: deriveScopeIn(facts, coreFlow),
		scope_out: deriveScopeOut(facts),
		non_goals: listOrFallback(facts.non_goals, ["Persist archive history"]),
		v1_rationale:
			trimText(facts.v1_rationale) ||
			"A narrow codebase-first flow creates a truthful v1 quickly.",
		distribution_model:
			trimText(facts.distribution_model) || "Protected web app with downloads",
		install_destination:
			trimText(facts.install_destination) ||
			"Customer clones and configures the Codebase locally.",
		buyer_ai_promise:
			trimText(facts.buyer_ai_promise) ||
			"AI helps generate the Ship by Sunday Codebase structure.",
		surface_type: (trimText(facts.surface_type) || "web_app") as "web_app",
		design_references: listOrFallback(
			deriveDesignReferences(facts),
			DEFAULT_DESIGN_REFERENCES,
		),
		visual_thesis:
			trimText(facts.visual_thesis) ||
			trimText(designPresetSeed.visual_thesis) ||
			generatedDesignSystem.derivedFacts.visualThesis,
		content_plan:
			trimText(facts.content_plan) ||
			trimText(designPresetSeed.content_plan) ||
			generatedDesignSystem.derivedFacts.contentPlan,
		interaction_thesis:
			trimText(facts.interaction_thesis) ||
			trimText(designPresetSeed.interaction_thesis) ||
			generatedDesignSystem.derivedFacts.interactionThesis,
		design_tokens:
			trimText(facts.design_tokens) ||
			trimText(designPresetSeed.design_tokens) ||
			generatedDesignSystem.derivedFacts.designTokens,
		typography_direction:
			trimText(facts.typography_direction) ||
			trimText(designPresetSeed.typography_direction) ||
			generatedDesignSystem.derivedFacts.typographyDirection,
		imagery_direction:
			trimText(facts.imagery_direction) ||
			trimText(designPresetSeed.imagery_direction) ||
			generatedDesignSystem.derivedFacts.imageryDirection,
		layout_direction:
			trimText(facts.layout_direction) ||
			trimText(designPresetSeed.layout_direction) ||
			generatedDesignSystem.derivedFacts.layoutDirection,
		brand_assets: listOrFallback(facts.brand_assets, DEFAULT_BRAND_ASSETS),
		existing_system_mode:
			trimText(facts.existing_system_mode) ||
			trimText(designPresetSeed.existing_system_mode) ||
			generatedDesignSystem.derivedFacts.existingSystemMode,
		hero_goal:
			trimText(facts.hero_goal) ||
			"Explain the codebase-first promise clearly.",
		primary_cta: trimText(facts.primary_cta) || "Start your codebase",
		proof_strategy:
			trimText(facts.proof_strategy) ||
			"Show codebase file previews and repo outputs.",
		objections: listOrFallback(facts.objections, DEFAULT_OBJECTIONS),
		section_narrative:
			trimText(facts.section_narrative) ||
			"Problem, codebase promise, unlock flow, proof, call to action.",
		copy_tone:
			trimText(facts.copy_tone) ||
			trimText(designPresetSeed.copy_tone) ||
			generatedDesignSystem.derivedFacts.copyTone,
		marketing_goals: listOrFallback(
			facts.marketing_goals,
			DEFAULT_MARKETING_GOALS,
		),
		channel_scope: listOrFallback(facts.channel_scope, DEFAULT_CHANNEL_SCOPE),
		campaign_types: listOrFallback(
			facts.campaign_types,
			DEFAULT_CAMPAIGN_TYPES,
		),
		brand_voice_summary:
			trimText(facts.brand_voice_summary) || DEFAULT_BRAND_VOICE_SUMMARY,
		approved_claims: listOrFallback(
			facts.approved_claims,
			DEFAULT_APPROVED_CLAIMS,
		),
		do_not_say_rules: listOrFallback(
			facts.do_not_say_rules,
			DEFAULT_DO_NOT_SAY_RULES,
		),
		workflow_map: listOrFallback(facts.workflow_map, DEFAULT_WORKFLOW_MAP),
		research_scope: listOrFallback(
			facts.research_scope,
			DEFAULT_RESEARCH_SCOPE,
		),
		research_needs: listOrFallback(
			facts.research_needs,
			DEFAULT_RESEARCH_NEEDS,
		),
		content_workflows: listOrFallback(
			facts.content_workflows,
			DEFAULT_CONTENT_WORKFLOWS,
		),
		analytics_needs: listOrFallback(
			facts.analytics_needs,
			DEFAULT_ANALYTICS_NEEDS,
		),
		proof_sources: listOrFallback(facts.proof_sources, DEFAULT_PROOF_SOURCES),
		creative_spec: trimText(facts.creative_spec) || DEFAULT_CREATIVE_SPEC,
		objective: trimText(facts.objective) || DEFAULT_OBJECTIVE,
		user_visible_outcome:
			trimText(facts.user_visible_outcome) || DEFAULT_USER_VISIBLE_OUTCOME,
		constraints: listOrFallback(facts.constraints, DEFAULT_CONSTRAINTS),
		deliverables: listOrFallback(facts.deliverables, DEFAULT_DELIVERABLES),
		done_when: trimText(facts.done_when) || DEFAULT_DONE_WHEN,
		acceptance_criteria: listOrFallback(
			facts.acceptance_criteria,
			DEFAULT_ACCEPTANCE_CRITERIA,
		),
		validation_plan: listOrFallback(
			facts.validation_plan,
			DEFAULT_VALIDATION_PLAN,
		),
		demo_flow: trimText(facts.demo_flow) || DEFAULT_DEMO_FLOW,
		risks: listOrFallback(facts.risks, DEFAULT_RISKS),
		dependencies: listOrFallback(facts.dependencies, DEFAULT_DEPENDENCIES),
		open_questions: listOrFallback(
			facts.open_questions,
			DEFAULT_OPEN_QUESTIONS,
		),
		selected_next_slice:
			trimText(facts.selected_next_slice) || DEFAULT_SELECTED_NEXT_SLICE,
		pricing_model: trimText(facts.pricing_model) || "one_time",
		price_usd_cents: priceUsdCents,
		price_display:
			trimText(facts.price_display) ||
			(priceUsdCents === undefined
				? undefined
				: formatPriceDisplay(priceUsdCents)),
		currency: trimText(facts.currency) || "USD",
		domain: trimText(facts.domain) || undefined,
		contact_email: deriveContactEmail(facts),
		support_email: deriveSupportEmail(facts),
	};
}
