import {
	createCanonicalProjectDefinition,
	type CanonicalProjectDefinition,
	type CanonicalProjectFactsDraft,
} from "../canonical-project-definition/project-definition";

const defaultStarterTemplateCreatedAt = 1_742_853_600_000;

const defaultStarterTemplateFacts = {
	product_name: "AI Chat Starter",
	product_summary:
		"A ChatGPT-style starter app with BYO OpenAI, auth-ready app routes, Convex state, Stripe setup plans, and an agent-friendly operating pack.",
	primary_user:
		"Builders who want a serious AI chat app foundation before they answer custom product questions.",
	problem_statement:
		"Starting a useful AI app stalls when chat state, provider setup, billing, and agent instructions are scattered.",
	problem_trigger:
		"They need a runnable AI chat starter and setup roadmap immediately.",
	problem_severity: "7",
	problem_context_when:
		"When a builder is ready to start an AI chat product but has not answered custom product questions yet.",
	problem_context_where:
		"In a freshly downloaded local repo that still needs provider setup.",
	problem_urgency:
		"Needs a no-provider-safe starting point before live configuration begins.",
	success_looks_like:
		"A builder downloads a no-provider-safe AI chat starter repo, runs the local checks, configures providers through the setup plans, and sends a persisted chat message after OpenAI setup.",
	evidence_summary:
		"The generated repo contains pinned template-source provenance, project facts, setup ExecPlans, and local validation scripts.",
	why_this_matters:
		"Builders should receive a real AI chat product foundation without waiting on questionnaire state or mutable template fetches.",
	core_flow_summary:
		"Download the starter repo, run no-provider checks, configure providers, then customize the chat product.",
	core_flow: [
		"Download the starter repo",
		"Run the no-provider checks",
		"Configure Clerk, Convex, Stripe, and OpenAI",
		"Customize the chat app",
	],
	pricing: 19,
	pricing_model: "subscription",
	price_usd_cents: 1900,
	price_display: "$19/mo",
	currency: "USD",
	design_preset_id: "t3-code",
	design_references: [
		"ChatGPT conversation layout",
		"T3 Code app shell and primitive system",
		"DM Sans, zinc surfaces, and blue primary actions",
	],
	visual_thesis:
		"A calm, product-grade AI workspace with a focused chat surface, restrained chrome, and clear setup states.",
	content_plan:
		"Explain the starter promise, expose setup status, route product work through the generated plans, and keep provider gaps visible.",
	interaction_thesis:
		"Make the chat loop feel immediate while keeping setup, billing, and provider actions explicit.",
	design_tokens:
		"Zinc semantic surfaces, blue primary actions, compact T3 Code radii, readable chat spacing, and one strong primary action.",
	typography_direction:
		"Use DM Sans for primary UI text with mono treatment only for setup values, scripts, and validation commands.",
	imagery_direction:
		"Prefer concrete product screenshots, setup states, and chat workspace previews over abstract AI art.",
	layout_direction:
		"Use a narrow marketing shell, authenticated dashboard, conversation sidebar, and full-height chat workbench.",
	brand_assets: ["Generated wordmark", "Product facts", "Design tokens"],
	existing_system_mode:
		"Generated Next.js app using the T3 Code visual contract and template-source layout conventions.",
	hero_goal:
		"Show that the download is a runnable AI chat starter with explicit setup proof.",
	primary_cta: "Start chatting",
	outcome_statement:
		"Ship a polished AI chat product foundation with durable setup plans and proof.",
	user_benefit:
		"They can start from a real chat app instead of rebuilding auth, billing, persistence, and agent instructions from scratch.",
	must_have_capabilities: [
		"Chat with streamed assistant responses",
		"Persist conversations and messages",
		"Configure providers through setup ExecPlans",
		"Customize product copy and design safely",
	],
	scope_in: [
		"ChatGPT-style chat surface",
		"Convex-owned chat state",
		"Server-only OpenAI key setup",
		"Starter setup Program and ExecPlans",
	],
	scope_out: [
		"End-user API key storage",
		"File uploads",
		"Custom tools",
		"Production provider setup completed for the buyer",
	],
	non_goals: [
		"Store arbitrary customer OpenAI keys",
		"Pretend providers are configured before setup proof passes",
	],
	v1_rationale:
		"A focused chat starter gives buyers a familiar AI product surface while keeping provider setup explicit and testable.",
	distribution_model: "Generated repo download",
	install_destination:
		"Customer installs the generated repo locally, then follows the setup ExecPlans.",
	buyer_ai_promise:
		"AI agents can work from the same Program, ExecPlans, generated facts, design system, and app source.",
	objections: [
		"Will this work before my provider accounts are configured?",
		"Can I customize the app after download?",
		"Where do billing, auth, and OpenAI setup steps live?",
	],
	screen_sequence: [
		"Marketing",
		"Sign in",
		"Dashboard",
		"Chat",
		"Billing setup",
	],
	proof_strategy:
		"Ship no-provider checks first, then prove Clerk, Convex, Stripe, and OpenAI through ordered setup plans.",
	section_narrative:
		"Promise, no-provider boot path, chat product surface, setup roadmap, validation proof.",
	copy_tone:
		"Direct, technical, and setup-honest without pretending providers are already configured.",
	marketing_goals: [
		"Explain the AI chat starter outcome",
		"Set clear setup expectations",
		"Move builders into the generated repo quickly",
	],
	channel_scope: ["Generated homepage", "Setup docs", "README handoff"],
	campaign_types: ["Starter launch page", "Setup handoff sequence"],
	brand_voice_summary:
		"Precise, calm, and implementation-focused for builders who want real source code.",
	approved_claims: [
		"Generated from pinned template source",
		"No-provider-safe before setup",
		"Includes Program and ExecPlan operating material",
	],
	do_not_say_rules: [
		"Do not claim providers are configured automatically",
		"Do not promise arbitrary tools or uploads in v1",
		"Do not call the zip a static template artifact",
	],
	workflow_map: [
		"Download starter",
		"Run validation",
		"Complete setup ExecPlans",
		"Build the first product slice",
	],
	research_scope: [
		"AI chat onboarding",
		"Provider setup friction",
		"Generated repo handoff clarity",
	],
	research_needs: [
		"Customer-specific workflow after setup",
		"Preferred billing model after first launch",
	],
	content_workflows: [
		"Update generated homepage copy",
		"Maintain setup ExecPlans",
		"Refresh validation notes after provider setup",
	],
	analytics_needs: [
		"Starter download conversion",
		"Provider setup completion",
		"First successful chat message",
	],
	proof_sources: [
		"Generated repo validation output",
		"Template-source provenance file",
		"Provider setup ExecPlan evidence",
	],
	creative_spec:
		"Show the chat workspace, setup-gated provider states, and exact validation commands rather than generic AI claims.",
	objective:
		"Deliver a generated AI chat starter that can boot safely before providers and guide setup afterward.",
	user_visible_outcome:
		"A builder downloads `ai-chat-starter.zip`, runs the repo checks, completes setup, and sends a persisted AI chat message.",
	constraints: [
		"No static zip source of truth",
		"No mutable remote template fetch at request time",
		"No client-exposed OpenAI API key",
	],
	deliverables: [
		"Generated AI chat app",
		"Setup Program and ExecPlans",
		"Template-source provenance",
		"Validation scripts",
	],
	done_when:
		"The starter boots in no-provider mode and the setup plans lead to a persisted chat response after OpenAI configuration.",
	acceptance_criteria: [
		"Zip includes pinned template provenance",
		"Generated app exposes the chat route",
		"Provider setup remains explicit",
		"Validation commands are documented in the repo",
	],
	validation_plan: [
		"Run generated operating-pack checks",
		"Run app typecheck",
		"Verify provider setup plans before activating live integrations",
	],
	demo_flow:
		"Download the starter, install dependencies, open the app, configure OpenAI, then send and persist a chat message.",
	risks: [
		"Provider setup drift",
		"Template-source provenance drift",
		"Chat state and OpenAI continuation falling out of sync",
	],
	dependencies: [
		"Next.js App Router",
		"Convex",
		"Clerk",
		"Stripe",
		"OpenAI Responses API",
	],
	open_questions: [
		"Which customer-specific product workflow should the buyer add after setup?",
	],
	selected_next_slice: "Complete the generated Core Boot setup plan.",
} satisfies CanonicalProjectFactsDraft;

export function createDefaultStarterTemplateProjectDefinition(): CanonicalProjectDefinition {
	return createCanonicalProjectDefinition({
		clerkUserId: "starter-template-direct-download",
		productKey: "ai-chat-starter",
		facts: defaultStarterTemplateFacts,
		placeholdersInUse: ["domain", "contact_email", "support_email"],
		createdAt: defaultStarterTemplateCreatedAt,
		updatedAt: defaultStarterTemplateCreatedAt,
	});
}
