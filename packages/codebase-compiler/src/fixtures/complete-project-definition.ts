import {
	createCanonicalProjectDefinition,
	type CanonicalProjectDefinition,
	type CanonicalProjectFacts,
} from "../canonical-project-definition/project-definition";
import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
} from "../design-system/design-preset-catalog";

const defaultDesignPresetSeed = buildDesignPresetFactSeed(
	DEFAULT_DESIGN_PRESET_ID,
);

const completeProjectFacts: CanonicalProjectFacts = {
	product_name: "Ship by Sunday OS",
	product_summary: "A codebase-first product builder for solo founders.",
	primary_user: "Solo founders shipping a web product in one weekend.",
	problem_statement:
		"Founders lose momentum when product planning stays vague.",
	core_flow: ["Capture product facts", "Unlock codebases", "Download repo"],
	pricing: 29,
	design_preset_id: DEFAULT_DESIGN_PRESET_ID,
	theme_preset: defaultDesignPresetSeed.theme_preset,
	problem_context_when: "When a founder is moving from idea to build week.",
	problem_context_where: "Inside their local app and planning workflow.",
	problem_trigger: "They need a clear codebase and repo handoff immediately.",
	problem_severity: "8",
	problem_urgency: "Needs attention soon",
	outcome_statement: "Leave with a build-ready Ship by Sunday Codebase.",
	success_looks_like: "A founder downloads a working Codebase zip.",
	user_benefit:
		"They can move directly into implementation without re-briefing.",
	evidence_summary:
		"Repeated founder interviews show planning drift blocks shipping.",
	why_this_matters:
		"The codebase should replace vague course completion as the outcome.",
	core_flow_summary:
		"Capture product facts, unlock codebases, then download the repo.",
	screen_sequence: [
		"Start",
		"Product",
		"Design",
		"Marketing",
		"Build Plan",
		"Review",
	],
	must_have_capabilities: [
		"Collect canonical facts",
		"Generate codebases",
		"Download repo",
	],
	scope_in: [
		"Codebase-first funnel",
		"Codebase downloads",
		"Repo snapshot download",
	],
	scope_out: ["Provider setup wizard", "GitHub invite flow"],
	non_goals: ["Persist archive history", "Support non-web surfaces"],
	v1_rationale: "A narrow codebase-first flow creates a truthful v1 quickly.",
	distribution_model: "Protected web app with downloads",
	install_destination: "Customer clones and configures the Codebase locally.",
	buyer_ai_promise: "AI helps generate the Ship by Sunday Codebase structure.",
	surface_type: "web_app",
	design_references: [
		"https://example.com/reference-1",
		"https://example.com/reference-2",
	],
	visual_thesis:
		"Editorial product OS with strong hierarchy and practical polish.",
	content_plan: "Lead with the codebase outcome, then explain each unlock.",
	interaction_thesis:
		"Guided multi-step intake with explicit continue actions.",
	design_tokens: "Neutral surfaces with a high-contrast action color.",
	typography_direction: "Readable grotesk headline with sober body copy.",
	imagery_direction: "Product-first diagrams instead of lifestyle photography.",
	layout_direction: "Two-panel workbench shell with clear codebase previews.",
	brand_assets: ["wordmark.svg", "icon.svg"],
	existing_system_mode: "net_new",
	hero_goal: "Explain the codebase-first promise clearly.",
	primary_cta: "Start your codebase",
	proof_strategy: "Show codebase file previews and repo outputs.",
	objections: [
		"Will this generate real output?",
		"Do I need GitHub access first?",
	],
	section_narrative:
		"Problem, codebase promise, unlock flow, proof, call to action.",
	copy_tone: "Direct, practical, and outcome-led.",
	marketing_goals: [
		"Explain the promise",
		"Convert buyers",
		"Set accurate expectations",
	],
	channel_scope: ["Homepage", "Checkout follow-up", "Email handoff"],
	campaign_types: ["Launch page", "Lifecycle email"],
	brand_voice_summary: "Confident, specific, and non-hype.",
	approved_claims: ["Codebase-first delivery", "Downloadable Codebase"],
	do_not_say_rules: [
		"Do not promise zero setup",
		"Do not imply GitHub invite delivery",
	],
	workflow_map: ["Launch page refresh", "Checkout follow-up sequence"],
	research_scope: ["Competitors", "Current buyer objections"],
	research_needs: ["Buyer interview notes", "Competitive copy audit"],
	content_workflows: ["Homepage updates", "Lifecycle email updates"],
	analytics_needs: ["Checkout conversion", "Codebase download conversion"],
	proof_sources: ["Current checkout data", "Founder interview notes"],
	creative_spec:
		"Pair codebase previews with repo screenshots and exact file names.",
	objective: "Build the codebase compiler and codebase-first runtime.",
	user_visible_outcome:
		"A buyer can move through the funnel and download a Codebase zip.",
	constraints: [
		"Web-app only",
		"Download-only delivery",
		"No GitHub invite dependency",
	],
	deliverables: [
		"Codebase compiler",
		"Protected codebase routes",
		"Repo download",
	],
	done_when: "A buyer can download the full repo snapshot from Review.",
	acceptance_criteria: [
		"Codebases unlock at the right stages",
		"Repo zip contains generated docs under docs/",
	],
	validation_plan: [
		"Run compiler tests",
		"Run app build",
		"Run codebase-flow integration tests",
	],
	demo_flow:
		"Complete the funnel, review the Codebase materials, then download the Codebase zip with docs/ at the root.",
	risks: ["Schema drift", "Missing route tracing", "Legacy route confusion"],
	dependencies: [
		"Next.js tracing config",
		"Convex schema",
		"Codebase templates",
	],
	open_questions: ["Which routes need archive downloads first?"],
	selected_next_slice: "Bootstrap the compiler and canonical schema.",
	pricing_model: "one_time",
	price_usd_cents: 2900,
	price_display: "$29",
	currency: "USD",
	domain: "example.com",
	contact_email: "support@example.com",
	support_email: "support@example.com",
};

type CompleteProjectDefinitionOverrides = Omit<
	Partial<CanonicalProjectDefinition>,
	"facts"
> & {
	facts?: Partial<CanonicalProjectFacts>;
};

export function createCompleteProjectDefinition(
	overrides: CompleteProjectDefinitionOverrides = {},
): CanonicalProjectDefinition {
	return createCanonicalProjectDefinition({
		clerkUserId: overrides.clerkUserId ?? "user_123",
		productKey: overrides.productKey ?? "ship-by-sunday",
		facts: {
			...completeProjectFacts,
			...overrides.facts,
		},
		placeholdersInUse: overrides.placeholdersInUse ?? [],
		createdAt: overrides.createdAt ?? 1_742_853_600_000,
		updatedAt: overrides.updatedAt ?? 1_742_853_600_000,
	});
}
