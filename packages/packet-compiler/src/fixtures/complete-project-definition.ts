import {
	createCanonicalProjectDefinition,
	type CanonicalProjectDefinition,
	type CanonicalProjectFacts,
} from "../canonical-project-definition/project-definition";

const completeProjectFacts: CanonicalProjectFacts = {
	product_name: "Ship by Sunday OS",
	product_summary: "A packet-first product builder for solo founders.",
	primary_user: "Solo founders shipping a web product in one weekend.",
	problem_statement:
		"Founders lose momentum when product planning stays vague.",
	problem_context_when: "When a founder is moving from idea to build week.",
	problem_context_where: "Inside their local app and planning workflow.",
	problem_trigger: "They need a clear packet and repo handoff immediately.",
	problem_severity: "8",
	problem_urgency: "Needs attention soon",
	outcome_statement: "Leave with a build-ready packet and starter repo.",
	success_looks_like: "A founder downloads a working packet and repo zip.",
	user_benefit:
		"They can move directly into implementation without re-briefing.",
	evidence_summary:
		"Repeated founder interviews show planning drift blocks shipping.",
	why_this_matters:
		"The packet should replace vague course completion as the outcome.",
	core_flow_summary:
		"Capture product facts, unlock packets, then download the repo.",
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
		"Generate packets",
		"Download repo",
	],
	scope_in: [
		"Packet-first funnel",
		"Packet downloads",
		"Repo snapshot download",
	],
	scope_out: ["Provider setup wizard", "GitHub invite flow"],
	non_goals: ["Persist archive history", "Support non-web surfaces"],
	v1_rationale: "A narrow packet-first flow creates a truthful v1 quickly.",
	distribution_model: "Protected web app with downloads",
	install_destination:
		"Customer clones and configures the generated repo locally.",
	buyer_ai_promise: "AI helps generate the packet and starter repo structure.",
	surface_type: "web_app",
	design_references: [
		"https://example.com/reference-1",
		"https://example.com/reference-2",
	],
	visual_thesis:
		"Editorial product OS with strong hierarchy and practical polish.",
	content_plan: "Lead with the packet outcome, then explain each unlock.",
	interaction_thesis:
		"Guided multi-step intake with explicit continue actions.",
	design_tokens: "Neutral surfaces with a high-contrast action color.",
	typography_direction: "Readable grotesk headline with sober body copy.",
	imagery_direction: "Product-first diagrams instead of lifestyle photography.",
	layout_direction: "Two-panel workbench shell with clear packet previews.",
	brand_assets: ["wordmark.svg", "icon.svg"],
	existing_system_mode: "net_new",
	hero_goal: "Explain the packet-first promise clearly.",
	primary_cta: "Start your packet",
	proof_strategy: "Show packet file previews and repo outputs.",
	objections: [
		"Will this generate real output?",
		"Do I need GitHub access first?",
	],
	section_narrative:
		"Problem, packet promise, unlock flow, proof, call to action.",
	copy_tone: "Direct, practical, and outcome-led.",
	marketing_goals: [
		"Explain the promise",
		"Convert buyers",
		"Set accurate expectations",
	],
	channel_scope: ["Homepage", "Checkout follow-up", "Email handoff"],
	campaign_types: ["Launch page", "Lifecycle email"],
	brand_voice_summary: "Confident, specific, and non-hype.",
	approved_claims: ["Packet-first delivery", "Downloadable starter repo"],
	do_not_say_rules: [
		"Do not promise zero setup",
		"Do not imply GitHub invite delivery",
	],
	workflow_map: ["Launch page refresh", "Checkout follow-up sequence"],
	research_scope: ["Competitors", "Current buyer objections"],
	research_needs: ["Buyer interview notes", "Competitive copy audit"],
	content_workflows: ["Homepage updates", "Lifecycle email updates"],
	analytics_needs: ["Checkout conversion", "Packet download conversion"],
	proof_sources: ["Current checkout data", "Founder interview notes"],
	creative_spec:
		"Pair packet previews with repo screenshots and exact file names.",
	objective: "Build the packet compiler and packet-first runtime.",
	user_visible_outcome:
		"A buyer can move through the funnel and download a repo zip.",
	constraints: [
		"Web-app only",
		"Download-only delivery",
		"No GitHub invite dependency",
	],
	deliverables: [
		"Packet compiler package",
		"Protected packet routes",
		"Repo download",
	],
	done_when: "A buyer can download the full repo snapshot from Review.",
	acceptance_criteria: [
		"Packets unlock at the right stages",
		"Repo zip contains generated docs under docs/",
	],
	validation_plan: [
		"Run package tests",
		"Run app build",
		"Run packet-flow integration tests",
	],
	demo_flow:
		"Complete the funnel, download the stage packs, then download the repo zip with docs/ at the root.",
	risks: ["Schema drift", "Missing route tracing", "Legacy route confusion"],
	dependencies: ["Next.js tracing config", "Convex schema", "Packet templates"],
	open_questions: ["Which routes need archive downloads first?"],
	selected_next_slice: "Bootstrap the compiler package and canonical schema.",
	pricing_model: "one_time",
	price_usd_cents: 2900,
	price_display: "$29",
	currency: "USD",
	domain: "example.com",
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
