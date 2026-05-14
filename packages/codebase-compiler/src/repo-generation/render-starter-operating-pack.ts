import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedCodebaseFile } from "../codebases/render-types";
import type { JsonValue } from "../json-value";
import { buildRepoGenerationManifest } from "./build-repo-generation-manifest";

const operatingPackPlanDefinitions = [
	{ id: "core-boot", title: "Core Boot", slug: "core-boot" },
	{ id: "clerk-setup", title: "Clerk Setup", slug: "clerk-setup" },
	{ id: "convex-setup", title: "Convex Setup", slug: "convex-setup" },
	{ id: "stripe-setup", title: "Stripe Setup", slug: "stripe-setup" },
	{
		id: "first-product-slice",
		title: "First Product Slice",
		slug: "first-product-slice",
	},
] as const;

type OperatingPackPlanId = (typeof operatingPackPlanDefinitions)[number]["id"];

type OperatingPackPlanPath = {
	id: OperatingPackPlanId;
	path: string;
	title: string;
};

type OperatingPackPaths = {
	activeExecPlanPaths: string[];
	activeExecPlans: OperatingPackPlanPath[];
	activeProgramFolderPath: string;
	activeProgramPath: string;
	currentPlanningBriefPath: string;
	nextExecPlanPath: string;
	planningBriefPath: string;
	programId: string;
};

type ExecPlanDetails = {
	artifacts: string;
	concreteSteps: string[];
	context: string;
	decision: string;
	dependencies: string;
	inScope: string[];
	milestones: string[];
	outOfScope: string[];
	planOfWork: string;
	progress: string[];
	purpose: string;
	rationale: string;
	readWhen: string[];
	recovery: string;
	summary: string;
	testCommands: string[];
	validation: string;
};

function formatDate(timestamp: number) {
	return new Date(timestamp).toISOString().slice(0, 10);
}

function renderBulletList(items: readonly string[]) {
	return items.map((item) => `- ${item}`);
}

function renderIndentedCommands(commands: readonly string[]) {
	return commands.map((command) => `    ${command}`);
}

function renderJavaScriptConst(name: string, value: JsonValue) {
	return `const ${name} = ${JSON.stringify(value, null, 2)};`;
}

function getActiveExecPlan(paths: OperatingPackPaths, id: OperatingPackPlanId) {
	const plan = paths.activeExecPlans.find((candidate) => candidate.id === id);

	if (!plan) {
		throw new Error(`Missing generated operating-pack plan: ${id}`);
	}

	return plan;
}

function renderProgramContract() {
	return [
		"---",
		"title: Programs",
		"summary: Customer-safe contract for durable Program packets in this generated Codebase.",
		"status: active",
		"read_when:",
		"  - Starting a multi-slice product initiative.",
		"  - Refreshing the generated Program packet.",
		"  - Checking why an ExecPlan belongs to a larger Program.",
		"---",
		"",
		"# Programs",
		"",
		"A Program is the initiative-level source of truth for product work that spans more than one ExecPlan. It records the product goal, current state, progress, decisions, child ExecPlans, next slice, risks, validation expectations, and artifacts a later agent needs to resume without chat memory.",
		"",
		"Use `docs/programs/active/` for active Programs and `docs/programs/completed/` after the initiative is finished. Do not copy private planning history from another repo into this Codebase.",
		"",
		"## Required Program Shape",
		"",
		"A Program packet should include `program.md`, one or more planning briefs, and `current-planning-brief.txt`. The active generated packet starts with setup and product-work child ExecPlans so the repo can move through a durable operating loop from day one.",
		"",
		"Every `program.md` should include these sections: Purpose / Big Picture, Program Inputs, Current State, Progress, Decision Log, Slice Ledger, Next Slice, Risks and Watchpoints, Outcomes & Retrospective, Validation and Acceptance, Artifacts and Notes, and Interfaces and Dependencies.",
		"",
		"## Validation",
		"",
		"Run `bun run programs:lint` from the repo root to check the generated Program packet structure and active child plan links.",
	].join("\n");
}

function renderExecPlanContract() {
	return [
		"---",
		"title: ExecPlans",
		"summary: Customer-safe contract for execution plans in this generated Codebase.",
		"status: active",
		"read_when:",
		"  - Writing a new product slice plan.",
		"  - Resuming implementation from an existing plan.",
		"  - Checking whether a feature is ready to call complete.",
		"---",
		"",
		"# ExecPlans",
		"",
		"An ExecPlan is the execution-level source of truth for one bounded product slice. It should be specific enough that an agent can inspect the repo, make the change, run validation, and update the plan without relying on chat history.",
		"",
		"Keep unfinished plans under `docs/exec-plans/active/` and move completed plans to `docs/exec-plans/completed/`. Use dated filenames such as `2026-05-05-first-product-slice.md` for new plans.",
		"",
		"## Required ExecPlan Shape",
		"",
		"Every ExecPlan should include front matter with title, status, created_at, completed_at, summary, post_build_recap, and read_when. Program-linked ExecPlans should also include program_id and planning_brief.",
		"",
		"Every ExecPlan should include these sections: Purpose / Big Picture, Progress, Surprises & Discoveries, Decision Log, Outcomes & Retrospective, Context and Orientation, Plan of Work, Milestones, Concrete Steps, Validation and Acceptance, Idempotence and Recovery, Artifacts and Notes, and Interfaces and Dependencies.",
		"",
		"## Validation",
		"",
		"Run `bun run plans:lint` from the repo root to check active ExecPlans, or `bun run plans:lint -- --plan docs/exec-plans/active/<plan>.md` to check one plan.",
	].join("\n");
}

function renderProgramIndex(paths: OperatingPackPaths) {
	return [
		"# Active Programs",
		"",
		"- [`Product Operating System`](" +
			`./${paths.activeProgramFolderPath.split("/").at(-1)}/program.md` +
			")",
	].join("\n");
}

function renderCompletedIndex(title: string) {
	return [`# ${title}`, "", "No completed entries yet."].join("\n");
}

function renderExecPlanIndex(paths: OperatingPackPaths) {
	return [
		"# Active ExecPlans",
		"",
		...paths.activeExecPlans.map(
			(plan) => `- [\`${plan.title}\`](./${plan.path.split("/").at(-1)})`,
		),
	].join("\n");
}

function renderPlanningBrief(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
) {
	const { facts } = projectDefinition;
	const coreBootPlan = getActiveExecPlan(paths, "core-boot");
	const clerkPlan = getActiveExecPlan(paths, "clerk-setup");
	const convexPlan = getActiveExecPlan(paths, "convex-setup");
	const stripePlan = getActiveExecPlan(paths, "stripe-setup");
	const firstProductPlan = getActiveExecPlan(paths, "first-product-slice");

	return [
		"---",
		"title: Product Operating System Planning Brief 1",
		`program_id: ${paths.programId}`,
		"brief_version: 1",
		"status: active",
		`summary: Boot the generated operating pack and setup roadmap for ${facts.product_name}.`,
		"read_when:",
		"  - Starting the generated Codebase for the first time.",
		"  - Choosing the next setup or product slice.",
		"  - Refreshing the generated Program roadmap.",
		"---",
		"",
		"# Product Operating System Planning Brief 1",
		"",
		"## Planning Context",
		"",
		`${facts.product_name} is a generated Codebase for ${facts.primary_user}. The current product promise is: ${facts.outcome_statement}`,
		"",
		"The generated Build Pack already contains implementation context, readiness notes, validation commands, and review guidance. This Program should use those files as source truth instead of relying on chat memory.",
		"",
		"## Next Plan Recommendation",
		"",
		"Exact next plan title: `Core Boot`.",
		"",
		`Exact target path: \`${coreBootPlan.path}\`.`,
		"",
		"Exact scope: prove the generated repo installs with Bun, validates its Program and ExecPlan structure, passes the Codebase contract, and keeps the app shell typecheckable before live provider setup.",
		"",
		"Exact boundaries: do not configure Clerk, Convex, Stripe, or product-specific feature work inside Core Boot. Those are separate child ExecPlans and should remain blocked until the prior proof is recorded.",
		"",
		"## Setup Roadmap",
		"",
		`1. \`${coreBootPlan.path}\` - prove the no-provider local baseline.`,
		`2. \`${clerkPlan.path}\` - configure Clerk after Core Boot passes.`,
		`3. \`${convexPlan.path}\` - connect hosted Convex after Clerk setup is stable.`,
		`4. \`${stripePlan.path}\` - configure Stripe after auth and Convex proof passes.`,
		`5. \`${firstProductPlan.path}\` - build the first customer-visible product slice after setup is stable.`,
		"",
		"## Success Criteria",
		"",
		"The generated operating pack succeeds when all five child ExecPlans exist, the Program points at Core Boot as the next slice, setup plans make their dependencies explicit, and `bun run agentic:check` plus `bun run codebase:contract` pass in a clean generated repo without provider credentials.",
	].join("\n");
}

function renderProgram(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
	date: string,
) {
	const { facts } = projectDefinition;
	const coreBootPlan = getActiveExecPlan(paths, "core-boot");

	return [
		"---",
		`program_id: ${paths.programId}`,
		"title: Product Operating System",
		"status: active",
		`created_at: ${date}`,
		"completed_at: null",
		`summary: Coordinate setup and product work for ${facts.product_name} across durable ExecPlans, validation, and proof.`,
		"post_build_recap: null",
		"read_when:",
		"  - Planning more than one product slice.",
		"  - Choosing the next setup or customer-visible implementation step.",
		"  - Refreshing source truth after validation.",
		"---",
		"",
		"# Product Operating System",
		"",
		"This is a living initiative document for the generated Codebase.",
		"",
		"This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		`${facts.product_name} should become a real product, not just a generated starter. This Program keeps the setup order, product goal, implementation slices, proof, and next recommendation in one durable place so agents can work across sessions.`,
		"",
		"## Program Inputs",
		"",
		`The canonical product facts live in \`docs/facts/project-definition.json\`. The generated design source of truth is \`DESIGN.md\` plus \`docs/facts/design-system.json\`. The Build Pack lives under \`docs/build/\`. The current planning brief is \`${paths.planningBriefPath}\`, with \`${paths.currentPlanningBriefPath}\` pointing at it.`,
		"",
		"## Current State",
		"",
		`The repo currently contains a generated app, generated product facts, generated design guidance, starter setup skills, prompt assets, and this operating pack. The app is expected to install, typecheck, and validate without live Clerk, Convex, or Stripe credentials. Provider setup should proceed through the ordered setup ExecPlans before the first product slice moves ${facts.product_name} toward: ${facts.success_looks_like}`,
		"",
		"## Progress",
		"",
		`- [x] ${date}: Generated the initial customer-safe Program and setup roadmap.`,
		`- [x] ${date}: Wrote active child ExecPlans for Core Boot, Clerk Setup, Convex Setup, Stripe Setup, and First Product Slice.`,
		"- [ ] Complete Core Boot and record no-provider proof.",
		"- [ ] Complete provider setup in order before starting product work.",
		"",
		"## Decision Log",
		"",
		"Decision: Use generated Program and ExecPlan files as the durable operating layer.",
		"Rationale: Product work should survive chat handoffs and should be validated through checked-in files and package scripts.",
		`Date: ${date}`,
		"",
		"Decision: Start with setup ExecPlans before product work.",
		"Rationale: Clerk, Convex, and Stripe are real customer setup surfaces. Keeping them in explicit child plans prevents providers from being configured ad hoc and preserves the no-provider baseline.",
		`Date: ${date}`,
		"",
		"## Slice Ledger",
		"",
		"Active child ExecPlans:",
		"",
		...paths.activeExecPlans.map(
			(plan) => `- \`${plan.path}\` - ${plan.title}`,
		),
		"",
		"Completed child ExecPlans:",
		"",
		"- None yet.",
		"",
		"## Next Slice",
		"",
		`The next slice is \`${coreBootPlan.path}\`. It should prove the generated repo installs with Bun, validates its Program and ExecPlan material, passes the Codebase contract, and keeps the app typecheckable before Clerk, Convex, Stripe, or product implementation work begins.`,
		"",
		"## Risks and Watchpoints",
		"",
		"Do not start provider setup out of order. Do not rewrite auth, billing, provider setup, or generated design tokens unless a specific ExecPlan names those surfaces. Do not rely on chat memory when `docs/facts/project-definition.json`, `DESIGN.md`, and `docs/build/` already contain durable product truth.",
		"",
		"## Outcomes & Retrospective",
		"",
		"This Program is active. Fill this section after the setup roadmap and product operating loop have proven the repo and no required next slice remains.",
		"",
		"## Validation and Acceptance",
		"",
		"Program-level work is acceptable when each completed slice has validation evidence, docs updates where behavior changed, and a next recommendation. Run `bun run agentic:check` and `bun run codebase:contract` before handoff.",
		"",
		"## Artifacts and Notes",
		"",
		"Start with `START-HERE.md`, `docs/index.md`, `docs/build/docs/readiness.md`, and `docs/build/docs/prompt.md` before editing product code. Use `.agents/skills/` wrapper skills to keep setup and product changes routed through the matching ExecPlan.",
		"",
		"## Interfaces and Dependencies",
		"",
		"This Program depends on the generated app under `apps/web/`, product facts under `docs/facts/`, Build Pack docs under `docs/build/`, prompt assets under `docs/prompts/`, starter skills under `.agents/skills/`, and package scripts in the root `package.json`.",
	].join("\n");
}

function buildExecPlanDetails(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
	plan: OperatingPackPlanPath,
	date: string,
): ExecPlanDetails {
	const { facts } = projectDefinition;
	const coreBootPlan = getActiveExecPlan(paths, "core-boot");
	const clerkPlan = getActiveExecPlan(paths, "clerk-setup");
	const convexPlan = getActiveExecPlan(paths, "convex-setup");
	const stripePlan = getActiveExecPlan(paths, "stripe-setup");

	switch (plan.id) {
		case "core-boot":
			return {
				summary: `Prove ${facts.product_name} installs, validates, and boots locally with Bun before provider setup.`,
				readWhen: [
					"Booting the generated repo for the first time.",
					"Checking whether provider setup can begin.",
					"Repairing no-provider validation drift.",
				],
				purpose: `${facts.product_name} needs a known-good local baseline before any external provider work starts. This plan proves the generated repo installs with Bun, the operating pack is valid, and the app shell can typecheck without Clerk, Convex, or Stripe credentials.`,
				progress: [
					`[x] ${date}: Generated this Core Boot ExecPlan from the Codebase operating pack.`,
					"[ ] Run the generated no-provider checks from a fresh checkout.",
					"[ ] Record validation evidence before starting Clerk setup.",
				],
				decision: "Decision: Keep Core Boot separate from provider setup.",
				rationale:
					"Rationale: A clean no-provider baseline makes setup failures easier to diagnose and keeps generated repos useful before customers create external accounts.",
				context:
					"Read `START-HERE.md`, `README.md`, `docs/index.md`, `docs/build/docs/readiness.md`, and `.agents/skills/starter-core-setup/SKILL.md` before changing code. The app lives under `apps/web/`, and the generated operating checks live under `scripts/agentic/`.",
				inScope: [
					"Install dependencies with Bun.",
					"Prepare local env files without adding live provider secrets.",
					"Run generated Program, ExecPlan, and Codebase contract checks.",
					"Typecheck the app shell in its no-provider setup state.",
					"Record exact validation results in this plan.",
				],
				outOfScope: [
					"Creating Clerk, Convex, or Stripe projects.",
					"Changing protected route behavior or billing flows.",
					"Building the first customer-visible product feature.",
				],
				planOfWork:
					"Use `$starter-core-setup`, follow `START-HERE.md`, install dependencies, verify generated operating-pack scripts, typecheck the app, and update this plan with the result before moving to Clerk setup.",
				milestones: [
					"Orientation is complete when the setup docs, Program, and this plan have been read.",
					"Boot is complete when dependencies are installed and local env examples are in place without live provider secrets.",
					"Baseline proof is complete when agentic checks, Codebase contract, and app typecheck pass.",
				],
				concreteSteps: [
					"Run `bun install` from the repo root.",
					"Run `bun run agentic:check` and repair only generated operating-pack drift.",
					"Run `bun run codebase:contract` and repair only missing generated contract files or scripts.",
					"Run `bun run --cwd apps/web typecheck` to prove the app shell stays no-provider safe.",
					"Update this plan with validation evidence and the next recommendation.",
				],
				validation:
					"Core Boot is acceptable when the generated repo installs with Bun, operating-pack validation passes, Codebase contract passes, and the app typechecks without Clerk, Convex, or Stripe credentials.",
				testCommands: [
					"bun install",
					"bun run agentic:check",
					"bun run codebase:contract",
					"bun run --cwd apps/web typecheck",
					"bun run --cwd apps/web dev -- --help",
				],
				recovery:
					"If a check fails, fix the smallest generated contract or setup file that owns the failure and rerun the failing command before continuing. Do not add fake provider values to make no-provider checks pass.",
				artifacts: `The owning Program is \`${paths.activeProgramPath}\`. The next plan after Core Boot is \`${clerkPlan.path}\`.`,
				dependencies:
					"This plan depends on Bun, the generated root package scripts, `scripts/agentic/`, the generated app under `apps/web/`, and no live provider accounts.",
			};

		case "clerk-setup":
			return {
				summary: `Configure Clerk for ${facts.product_name} after Core Boot passes.`,
				readWhen: [
					"Starting Clerk auth setup.",
					"Adding Clerk environment variables.",
					"Debugging sign-in or sign-up setup state.",
				],
				purpose: `${facts.product_name} needs real authentication before protected product work can be trusted. This plan configures Clerk after the no-provider baseline is proven, without changing Convex or billing behavior prematurely.`,
				progress: [
					`[x] ${date}: Generated this Clerk Setup ExecPlan from the Codebase operating pack.`,
					`[ ] Confirm \`${coreBootPlan.path}\` is complete.`,
					"[ ] Configure Clerk environment values and verify auth routes.",
				],
				decision: "Decision: Configure Clerk before Convex auth integration.",
				rationale:
					"Rationale: Convex auth depends on a stable Clerk issuer and application configuration. Clerk should be proven first so later setup failures have a narrow source.",
				context:
					"Read `START-HERE.md`, `.agents/skills/starter-auth-setup/SKILL.md`, and the app auth docs before editing. Use Clerk dashboard values only from the customer-owned Clerk project for this generated repo.",
				inScope: [
					"Create or identify the Clerk application for this product.",
					"Set required Clerk environment variables in `apps/web/.env.local` and deployment env.",
					"Verify sign-in and sign-up routes render with real Clerk configuration.",
					"Keep protected product routes setup-gated until Convex setup is complete.",
					"Record the Clerk application name, callback URLs, and validation evidence without committing secrets.",
				],
				outOfScope: [
					"Configuring hosted Convex auth providers.",
					"Setting up Stripe checkout or webhooks.",
					"Changing product feature behavior beyond auth setup states.",
				],
				planOfWork:
					"Use `$starter-auth-setup`, complete the Clerk dashboard and env setup, verify auth entry routes, and update this plan before starting Convex setup.",
				milestones: [
					"Prerequisite proof is complete when Core Boot validation is recorded.",
					"Clerk configuration is complete when publishable and secret keys are present only in local or deployment env.",
					"Route proof is complete when sign-in and sign-up render against the configured Clerk app.",
				],
				concreteSteps: [
					`Confirm \`${coreBootPlan.path}\` is complete and no-provider checks passed.`,
					"Create or select the Clerk app for this generated repo.",
					"Configure allowed origins and callback URLs for local and deployment environments.",
					"Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and related Clerk env values outside source control.",
					"Run validation, then update this plan with the Clerk project name, URLs used, and proof.",
				],
				validation:
					"Clerk setup is acceptable when Core Boot proof exists, Clerk routes work with real env configuration, no secrets are committed, and the next recommendation points to Convex Setup.",
				testCommands: [
					"bun run agentic:check",
					"bun run codebase:contract",
					"bun run --cwd apps/web typecheck",
					"bun run --cwd apps/web dev -- --help",
				],
				recovery:
					"If auth routes fail, verify env variable names, allowed origins, and callback URLs before changing application code. Remove any accidental secrets from tracked files immediately.",
				artifacts: `The owning Program is \`${paths.activeProgramPath}\`. This plan is blocked by \`${coreBootPlan.path}\` and unblocks \`${convexPlan.path}\`.`,
				dependencies:
					"This plan depends on a customer-owned Clerk application, generated auth routes under `apps/web/`, local or deployment environment storage, and the Core Boot baseline.",
			};

		case "convex-setup":
			return {
				summary: `Connect hosted Convex for ${facts.product_name} after Clerk setup is stable.`,
				readWhen: [
					"Starting Convex setup.",
					"Connecting Clerk auth to Convex.",
					"Debugging protected data setup states.",
				],
				purpose: `${facts.product_name} needs a hosted Convex backend for protected product state. This plan connects Convex after Clerk is configured so identity, auth providers, and backend proof move together.`,
				progress: [
					`[x] ${date}: Generated this Convex Setup ExecPlan from the Codebase operating pack.`,
					`[ ] Confirm \`${clerkPlan.path}\` is complete.`,
					"[ ] Configure hosted Convex and verify authenticated backend access.",
				],
				decision: "Decision: Use hosted Convex setup only.",
				rationale:
					"Rationale: The generated repo should follow the shipped Convex contract and avoid local Convex mode drift. Authenticated backend behavior should be proven against the hosted development deployment.",
				context:
					"Use the copied app template source, `README.md`, `$starter-convex-in-this-repo`, and `$starter-auth-setup` for Clerk-to-Convex auth decisions. Keep Convex setup recorded in this plan instead of relying on generated framework docs.",
				inScope: [
					"Create or connect the hosted Convex development deployment.",
					"Set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` outside source control.",
					"Configure Convex auth provider settings from the proven Clerk issuer.",
					"Verify protected app state can read authenticated identity after sign-in.",
					"Record deployment names, env locations, and validation evidence without secrets.",
				],
				outOfScope: [
					"Using Convex local mode.",
					"Rewriting schema or product data models unrelated to setup.",
					"Configuring Stripe checkout or billing webhooks.",
				],
				planOfWork:
					"Use `$starter-convex-in-this-repo`, complete hosted Convex setup, connect Clerk auth, prove authenticated backend access, and update this plan before Stripe setup.",
				milestones: [
					"Prerequisite proof is complete when Clerk setup validation is recorded.",
					"Deployment setup is complete when Convex env values exist outside source control.",
					"Auth integration is complete when signed-in access reaches Convex without setup-state failures.",
				],
				concreteSteps: [
					`Confirm \`${clerkPlan.path}\` is complete and Clerk routes work.`,
					"Create or connect the hosted Convex development deployment.",
					"Set Convex environment values in local and deployment env stores.",
					"Configure Convex auth provider settings with the Clerk issuer from the Clerk plan.",
					"Run validation, then update this plan with deployment names, env locations, and proof.",
				],
				validation:
					"Convex setup is acceptable when hosted Convex is connected, Clerk-authenticated access works against the backend, no secrets are committed, and the next recommendation points to Stripe Setup.",
				testCommands: [
					"bun run agentic:check",
					"bun run codebase:contract",
					"bun run --cwd apps/web typecheck",
					"bun run --cwd apps/web dev -- --help",
				],
				recovery:
					"If Convex proof fails, verify Clerk issuer configuration, Convex deployment env, and generated Convex guidance before editing schema or auth code. Do not switch to Convex local mode.",
				artifacts: `The owning Program is \`${paths.activeProgramPath}\`. This plan is blocked by \`${clerkPlan.path}\` and unblocks \`${stripePlan.path}\`.`,
				dependencies:
					"This plan depends on hosted Convex, the Clerk application configured in the prior plan, generated Convex code under `apps/web/convex/`, and env values stored outside source control.",
			};

		case "stripe-setup":
			return {
				summary: `Configure Stripe billing for ${facts.product_name} after auth and Convex proof pass.`,
				readWhen: [
					"Starting Stripe setup.",
					"Configuring checkout, customer portal, or webhooks.",
					"Debugging paid access setup states.",
				],
				purpose: `${facts.product_name} needs a trustworthy paid-access path after identity and backend state are stable. This plan configures Stripe without weakening the generated no-provider baseline or rewriting billing contracts ad hoc.`,
				progress: [
					`[x] ${date}: Generated this Stripe Setup ExecPlan from the Codebase operating pack.`,
					`[ ] Confirm \`${convexPlan.path}\` is complete.`,
					"[ ] Configure Stripe products, env, and webhook proof.",
				],
				decision:
					"Decision: Configure Stripe after authenticated backend proof.",
				rationale:
					"Rationale: Billing proof needs stable user identity and persistent entitlement state. Stripe should not be debugged before Clerk and Convex are known-good.",
				context:
					"Read `.agents/skills/starter-billing-setup/SKILL.md`, `README.md`, and this plan before editing checkout or webhook code. Use `$stripe-best-practices` if external skills are installed and a Stripe-specific decision is needed.",
				inScope: [
					"Create or identify Stripe product and price records for this generated product.",
					"Set Stripe keys, price ids, webhook secrets, and billing-related app env outside source control.",
					"Verify checkout, webhook handling, entitlement sync, and customer portal setup in the supported environment.",
					"Document product ids, price ids, webhook event types, and env locations without secrets.",
					"Keep generated checkout and webhook contracts intact unless validation proves a code bug.",
				],
				outOfScope: [
					"Changing product pricing strategy or package tiers beyond setup values.",
					"Rewriting auth, Convex identity, or protected route contracts.",
					"Adding usage billing, Connect, or custom metering unless a new plan names that scope.",
				],
				planOfWork:
					"Use `$starter-billing-setup`, configure Stripe resources and env, verify checkout-to-entitlement behavior, and update this plan before product work begins.",
				milestones: [
					"Prerequisite proof is complete when Convex setup validation is recorded.",
					"Stripe resource setup is complete when product, price, and webhook configuration are recorded without secrets.",
					"Billing proof is complete when checkout and entitlement state can be verified end to end.",
				],
				concreteSteps: [
					`Confirm \`${convexPlan.path}\` is complete and authenticated backend access works.`,
					"Create or select Stripe product and price records for the paid offer.",
					"Configure webhook endpoints and event types required by the app.",
					"Set Stripe and billing env values outside source control.",
					"Run validation, then update this plan with product ids, price ids, webhook event types, env locations, and proof.",
				],
				validation:
					"Stripe setup is acceptable when checkout, webhook handling, entitlement sync, and customer portal behavior are proven with real Stripe configuration, no secrets are committed, and the next recommendation points to First Product Slice.",
				testCommands: [
					"bun run agentic:check",
					"bun run codebase:contract",
					"bun run --cwd apps/web typecheck",
					"bun run --cwd apps/web dev -- --help",
				],
				recovery:
					"If billing proof fails, verify env values, webhook event delivery, price ids, and entitlement records before editing checkout code. Roll back any accidental provider-secret file edits.",
				artifacts: `The owning Program is \`${paths.activeProgramPath}\`. This plan is blocked by \`${convexPlan.path}\` and unblocks \`${getActiveExecPlan(paths, "first-product-slice").path}\`.`,
				dependencies:
					"This plan depends on Stripe, the hosted Convex deployment, Clerk-authenticated users, generated billing routes, webhook configuration, and env values stored outside source control.",
			};

		case "first-product-slice":
			return {
				summary: `Implement the first customer-visible product improvement for ${facts.product_name} after setup proof is complete.`,
				readWhen: [
					"Starting the first real product implementation slice.",
					"Replacing generated identity or homepage behavior.",
					"Validating the first product handoff.",
				],
				purpose: `${facts.product_name} needs one focused product improvement after setup is stable. The first slice should make the product feel less like a generated starter and more like the promised outcome: ${facts.outcome_statement}`,
				progress: [
					`[x] ${date}: Generated this First Product Slice ExecPlan from the Codebase operating pack.`,
					`[ ] Confirm \`${stripePlan.path}\` is complete or deliberately revise this plan if product work can start earlier.`,
					"[ ] Inspect the app, product facts, design system, and Build Pack before editing.",
					"[ ] Implement the smallest customer-visible slice.",
					"[ ] Run focused validation and update this plan.",
				],
				decision:
					"Decision: Preserve setup stability while implementing the first product slice.",
				rationale:
					"Rationale: The generated repo already includes auth, billing, provider, and design-system contracts. The first product slice should create visible value without destabilizing setup.",
				context:
					"Read `START-HERE.md`, `DESIGN.md`, `docs/facts/project-definition.json`, `docs/build/docs/readiness.md`, and `docs/build/docs/prompt.md` before editing. The main app lives under `apps/web/`.",
				inScope: [
					"Product identity, homepage copy, visible product content, and docs that explain changed behavior.",
					"The smallest customer-visible behavior that proves the product promise.",
					"Focused tests or browser proof for the files actually changed.",
				],
				outOfScope: [
					"Rewriting auth, billing, provider setup, database schema, or generated design tokens unless this plan is revised first.",
					"Adding a ChatGPT app implementation unless a later Program or ExecPlan explicitly names that scope.",
				],
				planOfWork:
					"Use `$starter-first-slice`, inspect the product facts and Build Pack, choose the smallest visible change, edit the owning files, update docs if behavior changes, and run narrow validation before broader checks.",
				milestones: [
					"Source inspection is complete when the current app and generated product facts have been read and the exact target files are named in Progress.",
					"Implementation is complete when the visible product improvement exists in the app.",
					"Validation and handoff are complete when tests or checks pass, docs are current, and this plan records the outcome.",
				],
				concreteSteps: [
					`Confirm \`${stripePlan.path}\` is complete, or record why product work is intentionally starting before billing proof.`,
					"Run baseline operating-pack checks before editing.",
					"Name the exact product surface and files this slice will change.",
					"Implement the smallest customer-visible improvement.",
					"Run focused validation, update docs where behavior changed, and record the result in this plan.",
				],
				validation:
					"The slice is acceptable when the customer-visible change works, source truth is updated, setup contracts are preserved, and validation evidence is recorded in this plan.",
				testCommands: [
					"bun run agentic:check",
					"bun run codebase:contract",
					"bun run --cwd apps/web typecheck",
				],
				recovery:
					"Keep edits scoped. If validation fails, fix the failing surface and rerun the narrow command before broad checks. Revert only edits made for this slice.",
				artifacts: `The owning Program is \`${paths.activeProgramPath}\`. This plan is blocked by \`${stripePlan.path}\` unless the Program records a deliberate order change.`,
				dependencies:
					"This plan depends on the generated app, product facts, design system, Build Pack docs, starter skills, and package scripts in this repo.",
			};
	}
}

function renderSetupExecPlan(
	projectDefinition: CanonicalProjectDefinition,
	paths: OperatingPackPaths,
	plan: OperatingPackPlanPath,
	date: string,
) {
	const details = buildExecPlanDetails(projectDefinition, paths, plan, date);

	return [
		"---",
		`title: ${plan.title}`,
		"status: active",
		`created_at: ${date}`,
		"completed_at: null",
		`summary: ${details.summary}`,
		"post_build_recap: null",
		`program_id: ${paths.programId}`,
		`planning_brief: ${paths.planningBriefPath}`,
		"read_when:",
		...details.readWhen.map((entry) => `  - ${entry}`),
		"---",
		"",
		`# ${plan.title}`,
		"",
		`This is a living execution plan for ${plan.title} in this generated Codebase.`,
		"",
		"This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		details.purpose,
		"",
		"## Progress",
		"",
		...renderBulletList(details.progress),
		"",
		"## Surprises & Discoveries",
		"",
		"No implementation discoveries have been recorded yet.",
		"",
		"## Decision Log",
		"",
		details.decision,
		details.rationale,
		`Date: ${date}`,
		"",
		"## Outcomes & Retrospective",
		"",
		"This plan is active. Fill this section after implementation with what changed, what validation passed, and the next recommended slice.",
		"",
		"## Context and Orientation",
		"",
		details.context,
		"",
		"### In Scope",
		"",
		...renderBulletList(details.inScope),
		"",
		"### Out Of Scope",
		"",
		...renderBulletList(details.outOfScope),
		"",
		"## Plan of Work",
		"",
		details.planOfWork,
		"",
		"## Milestones",
		"",
		...renderBulletList(details.milestones),
		"",
		"## Concrete Steps",
		"",
		"Work from the repo root:",
		"",
		...renderBulletList(details.concreteSteps),
		"",
		"## Validation and Acceptance",
		"",
		details.validation,
		"",
		"### Test Commands",
		"",
		"Run these commands when this plan reaches its validation step:",
		"",
		...renderIndentedCommands(details.testCommands),
		"",
		"## Idempotence and Recovery",
		"",
		details.recovery,
		"",
		"## Artifacts and Notes",
		"",
		details.artifacts,
		"",
		"## Interfaces and Dependencies",
		"",
		details.dependencies,
	].join("\n");
}

function renderProgramsLintScript(paths: OperatingPackPaths) {
	return [
		"#!/usr/bin/env bun",
		"import { existsSync, readFileSync, readdirSync } from 'node:fs';",
		"import path from 'node:path';",
		"",
		renderJavaScriptConst("expectedProgramPath", paths.activeProgramPath),
		renderJavaScriptConst("expectedPlanningBriefPath", paths.planningBriefPath),
		renderJavaScriptConst(
			"expectedCurrentPlanningBriefPath",
			paths.currentPlanningBriefPath,
		),
		renderJavaScriptConst("expectedNextExecPlanPath", paths.nextExecPlanPath),
		renderJavaScriptConst("expectedActiveExecPlans", paths.activeExecPlans),
		"const expectedActivePlanPaths = expectedActiveExecPlans.map((plan) => plan.path);",
		"",
		"const requiredHeadings = [",
		"  '## Purpose / Big Picture',",
		"  '## Program Inputs',",
		"  '## Current State',",
		"  '## Progress',",
		"  '## Decision Log',",
		"  '## Slice Ledger',",
		"  '## Next Slice',",
		"  '## Risks and Watchpoints',",
		"  '## Outcomes & Retrospective',",
		"  '## Validation and Acceptance',",
		"  '## Artifacts and Notes',",
		"  '## Interfaces and Dependencies',",
		"];",
		"",
		"function fail(message) {",
		"  console.error(message);",
		"  process.exitCode = 1;",
		"}",
		"",
		"function assertIncludes(content, needle, filePath) {",
		"  if (!content.includes(needle)) fail(`${filePath} missing ${needle}`);",
		"}",
		"",
		"function activeExecPlanPaths(content) {",
		"  return Array.from(content.matchAll(/`(docs\\/exec-plans\\/active\\/[^`]+\\.md)`/g)).map((match) => match[1]);",
		"}",
		"",
		"function unique(values) {",
		"  return Array.from(new Set(values));",
		"}",
		"",
		"function sameSet(left, right) {",
		"  return left.length === right.length && left.every((value) => right.includes(value));",
		"}",
		"",
		"function sectionContent(content, heading) {",
		"  const start = content.indexOf(heading);",
		"  if (start === -1) return '';",
		"  const sectionStart = start + heading.length;",
		"  const nextHeading = content.indexOf('\\n## ', sectionStart);",
		"  return nextHeading === -1 ? content.slice(sectionStart) : content.slice(sectionStart, nextHeading);",
		"}",
		"",
		"function assertOrderedPlanLedger(content, filePath) {",
		"  const ledger = sectionContent(content, '## Slice Ledger');",
		"  let cursor = -1;",
		"  for (const plan of expectedActiveExecPlans) {",
		"    const entry = `\\`${plan.path}\\` - ${plan.title}`;",
		"    const index = ledger.indexOf(entry, cursor + 1);",
		"    if (index === -1) fail(`${filePath} missing ordered child plan ledger entry: ${entry}`);",
		"    cursor = index;",
		"  }",
		"}",
		"",
		"const activeRoot = 'docs/programs/active';",
		"if (!existsSync('docs/programs/PROGRAMS.md')) fail('Missing docs/programs/PROGRAMS.md');",
		"if (!existsSync(activeRoot)) fail('Missing docs/programs/active');",
		"if (!existsSync(expectedProgramPath)) fail(`Missing generated Program: ${expectedProgramPath}`);",
		"if (!existsSync(expectedPlanningBriefPath)) fail(`Missing generated planning brief: ${expectedPlanningBriefPath}`);",
		"if (!existsSync(expectedCurrentPlanningBriefPath)) {",
		"  fail(`Missing generated planning brief pointer: ${expectedCurrentPlanningBriefPath}`);",
		"} else {",
		"  const pointer = readFileSync(expectedCurrentPlanningBriefPath, 'utf8').trim();",
		"  const expectedPointer = path.basename(expectedPlanningBriefPath);",
		"  if (pointer !== expectedPointer) fail(`${expectedCurrentPlanningBriefPath} points at ${pointer || '<empty>'}, expected ${expectedPointer}`);",
		"}",
		"for (const planPath of expectedActivePlanPaths) {",
		"  if (!existsSync(planPath)) fail(`Missing generated active ExecPlan: ${planPath}`);",
		"}",
		"",
		"for (const entry of readdirSync(activeRoot, { withFileTypes: true })) {",
		"  if (!entry.isDirectory()) continue;",
		"  const programPath = `${activeRoot}/${entry.name}/program.md`;",
		"  if (!existsSync(programPath)) {",
		"    fail(`Missing ${programPath}`);",
		"    continue;",
		"  }",
		"  const content = readFileSync(programPath, 'utf8');",
		"  for (const heading of requiredHeadings) assertIncludes(content, heading, programPath);",
		"  assertIncludes(content, 'program_id:', programPath);",
		"  assertIncludes(content, 'status: active', programPath);",
		"  const childPlanPaths = unique(activeExecPlanPaths(content));",
		"  if (childPlanPaths.length === 0) fail(`${programPath} has no active child ExecPlans`);",
		"  for (const childPlanPath of childPlanPaths) {",
		"    if (!existsSync(childPlanPath)) fail(`${programPath} references missing ${childPlanPath}`);",
		"  }",
		"  if (programPath === expectedProgramPath) {",
		"    if (!sameSet(childPlanPaths, expectedActivePlanPaths)) {",
		"      fail(`${programPath} does not reference the exact generated active ExecPlan set`);",
		"    }",
		"    assertOrderedPlanLedger(content, programPath);",
		"    const nextSlice = sectionContent(content, '## Next Slice');",
		"    if (!nextSlice.includes(`\\`${expectedNextExecPlanPath}\\``)) {",
		"      fail(`${programPath} Next Slice does not point at ${expectedNextExecPlanPath}`);",
		"    }",
		"    assertIncludes(content, expectedPlanningBriefPath, programPath);",
		"    assertIncludes(content, expectedCurrentPlanningBriefPath, programPath);",
		"  }",
		"}",
		"",
		"if (process.exitCode) process.exit(process.exitCode);",
		"console.log('Program packet ok');",
	].join("\n");
}

function renderExecPlansLintScript(paths: OperatingPackPaths) {
	return [
		"#!/usr/bin/env bun",
		"import { existsSync, readFileSync, readdirSync } from 'node:fs';",
		"import path from 'node:path';",
		"",
		renderJavaScriptConst("expectedProgramId", paths.programId),
		renderJavaScriptConst("expectedPlanningBriefPath", paths.planningBriefPath),
		renderJavaScriptConst("expectedActiveExecPlans", paths.activeExecPlans),
		"const expectedActivePlanPaths = expectedActiveExecPlans.map((plan) => plan.path);",
		"",
		"const requiredHeadings = [",
		"  '## Purpose / Big Picture',",
		"  '## Progress',",
		"  '## Surprises & Discoveries',",
		"  '## Decision Log',",
		"  '## Outcomes & Retrospective',",
		"  '## Context and Orientation',",
		"  '### In Scope',",
		"  '### Out Of Scope',",
		"  '## Plan of Work',",
		"  '## Milestones',",
		"  '## Concrete Steps',",
		"  '## Validation and Acceptance',",
		"  '### Test Commands',",
		"  '## Idempotence and Recovery',",
		"  '## Artifacts and Notes',",
		"  '## Interfaces and Dependencies',",
		"];",
		"",
		"function fail(message) {",
		"  console.error(message);",
		"  process.exitCode = 1;",
		"}",
		"",
		"function planArgs() {",
		"  const index = process.argv.indexOf('--plan');",
		"  if (index === -1) return [];",
		"  return process.argv[index + 1] ? [process.argv[index + 1]] : [];",
		"}",
		"",
		"function activePlans() {",
		"  const activeRoot = 'docs/exec-plans/active';",
		"  if (!existsSync(activeRoot)) return [];",
		"  return readdirSync(activeRoot, { withFileTypes: true })",
		"    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md')",
		"    .map((entry) => `${activeRoot}/${entry.name}`);",
		"}",
		"",
		"function frontMatterValue(content, key) {",
		"  const match = content.match(new RegExp(`^${key}:\\\\s*(.+)$`, 'm'));",
		"  return match?.[1]?.trim() ?? null;",
		"}",
		"",
		"function checkPlan(planPath) {",
		"  if (!existsSync(planPath)) {",
		"    fail(`Missing ${planPath}`);",
		"    return;",
		"  }",
		"  const content = readFileSync(planPath, 'utf8');",
		"  for (const heading of requiredHeadings) {",
		"    if (!content.includes(heading)) fail(`${planPath} missing ${heading}`);",
		"  }",
		"  for (const key of ['title:', 'status:', 'created_at:', 'completed_at:', 'summary:', 'post_build_recap:', 'read_when:']) {",
		"    if (!content.includes(key)) fail(`${planPath} missing ${key}`);",
		"  }",
		"  const programId = frontMatterValue(content, 'program_id');",
		"  const planningBrief = frontMatterValue(content, 'planning_brief');",
		"  if (programId && !planningBrief) {",
		"    fail(`${planPath} is program-linked but missing planning_brief:`);",
		"  }",
		"  if (planningBrief && !programId) {",
		"    fail(`${planPath} has planning_brief: but is missing program_id:`);",
		"  }",
		"  if (planningBrief) {",
		"    if (planningBrief.includes('current-planning-brief.txt')) fail(`${planPath} planning_brief points at mutable current-planning-brief.txt`);",
		"    if (!/^docs\\/programs\\/active\\/[^/]+\\/planning-brief-\\d+\\.md$/.test(planningBrief)) fail(`${planPath} planning_brief is not an immutable active planning brief path: ${planningBrief}`);",
		"    if (!existsSync(planningBrief)) fail(`${planPath} references missing planning_brief: ${planningBrief}`);",
		"  }",
		"  const expectedPlan = expectedActiveExecPlans.find((plan) => plan.path === planPath);",
		"  if (expectedPlan) {",
		"    if (programId !== expectedProgramId) fail(`${planPath} program_id is ${programId ?? '<missing>'}, expected ${expectedProgramId}`);",
		"    if (planningBrief !== expectedPlanningBriefPath) fail(`${planPath} planning_brief is ${planningBrief ?? '<missing>'}, expected ${expectedPlanningBriefPath}`);",
		"    if (!content.includes(`title: ${expectedPlan.title}`)) fail(`${planPath} title does not match ${expectedPlan.title}`);",
		"    if (!content.includes(`# ${expectedPlan.title}`)) fail(`${planPath} H1 does not match ${expectedPlan.title}`);",
		"  }",
		"}",
		"",
		"if (!existsSync('docs/exec-plans/PLANS.md')) fail('Missing docs/exec-plans/PLANS.md');",
		"const plans = planArgs().length > 0 ? planArgs() : activePlans();",
		"if (plans.length === 0) fail('No active ExecPlans found');",
		"if (planArgs().length === 0) {",
		"  for (const expectedPlanPath of expectedActivePlanPaths) {",
		"    if (!plans.includes(expectedPlanPath)) fail(`Missing generated active ExecPlan from active index: ${expectedPlanPath}`);",
		"  }",
		"}",
		"for (const planPath of plans) checkPlan(planPath);",
		"",
		"if (process.exitCode) process.exit(process.exitCode);",
		"console.log('ExecPlans ok');",
	].join("\n");
}

function renderCodebaseContractScript(paths: OperatingPackPaths) {
	const requiredFiles = [
		"README.md",
		"START-HERE.md",
		"DESIGN.md",
		"docs/index.md",
		"docs/facts/project-definition.json",
		"docs/build/docs/readiness.md",
		"docs/build/docs/prompt.md",
		"docs/build/docs/review.md",
		"docs/programs/PROGRAMS.md",
		"docs/programs/active/index.md",
		"docs/exec-plans/PLANS.md",
		"docs/exec-plans/active/index.md",
		paths.activeProgramPath,
		paths.planningBriefPath,
		paths.currentPlanningBriefPath,
		...paths.activeExecPlanPaths,
		"apps/web/package.json",
		"packages/codebase-compiler/package.json",
		"packages/codebase-compiler/src/index.ts",
		"packages/codebase-presentation/package.json",
		"packages/codebase-presentation/src/index.ts",
		"packages/telegram-chat-widget/package.json",
		"packages/telegram-chat-widget/src/index.ts",
	];

	return [
		"#!/usr/bin/env bun",
		"import { existsSync, readFileSync } from 'node:fs';",
		"",
		renderJavaScriptConst("requiredFiles", requiredFiles),
		"",
		"const requiredRootScripts = [",
		"  'codebase:contract',",
		"  'programs:lint',",
		"  'plans:lint',",
		"  'agentic:check',",
		"];",
		"",
		"const requiredWorkspaceDependencies = [",
		"  '@shipbysunday/codebase-compiler',",
		"  '@shipbysunday/codebase-presentation',",
		"  '@shipbysunday/telegram-chat-widget',",
		"];",
		"",
		"function fail(message) {",
		"  console.error(message);",
		"  process.exitCode = 1;",
		"}",
		"",
		"function readJson(filePath) {",
		"  try {",
		"    return JSON.parse(readFileSync(filePath, 'utf8'));",
		"  } catch (error) {",
		"    fail(`Cannot parse ${filePath}: ${error instanceof Error ? error.message : String(error)}`);",
		"    return {};",
		"  }",
		"}",
		"",
		"for (const filePath of requiredFiles) {",
		"  if (!existsSync(filePath)) fail(`Missing generated file: ${filePath}`);",
		"}",
		"",
		"const rootPackage = readJson('package.json');",
		"const appPackage = readJson('apps/web/package.json');",
		"const rootScripts = rootPackage.scripts ?? {};",
		"const appDependencies = {",
		"  ...(appPackage.dependencies ?? {}),",
		"  ...(appPackage.devDependencies ?? {}),",
		"};",
		"",
		"for (const scriptName of requiredRootScripts) {",
		"  if (typeof rootScripts[scriptName] !== 'string') fail(`Missing root package script: ${scriptName}`);",
		"}",
		"",
		"for (const dependencyName of requiredWorkspaceDependencies) {",
		"  if (appDependencies[dependencyName] !== 'workspace:*') {",
		"    fail(`apps/web must depend on ${dependencyName} as workspace:*`);",
		"    continue;",
		"  }",
		"  const packageName = dependencyName.replace('@shipbysunday/', '');",
		"  if (!existsSync(`packages/${packageName}/package.json`)) {",
		"    fail(`Missing workspace package for ${dependencyName}`);",
		"  }",
		"}",
		"",
		"if (process.exitCode) process.exit(process.exitCode);",
		"console.log('Generated Codebase contract ok');",
	].join("\n");
}

export function buildOperatingPackPaths(
	projectDefinition: CanonicalProjectDefinition,
): OperatingPackPaths {
	const manifest = buildRepoGenerationManifest(projectDefinition);
	const date = formatDate(projectDefinition.createdAt);
	const programId = `${manifest.repoName}-operating-system`;
	const activeProgramFolderPath = `docs/programs/active/${date}-${programId}`;
	const activeExecPlans = operatingPackPlanDefinitions.map((plan) => ({
		id: plan.id,
		path: `docs/exec-plans/active/${date}-${plan.slug}.md`,
		title: plan.title,
	}));
	const nextExecPlanPath = activeExecPlans.find(
		(plan) => plan.id === "core-boot",
	)?.path;

	if (!nextExecPlanPath) {
		throw new Error("Missing generated Core Boot ExecPlan path.");
	}

	return {
		activeExecPlanPaths: activeExecPlans.map((plan) => plan.path),
		activeExecPlans,
		activeProgramFolderPath,
		activeProgramPath: `${activeProgramFolderPath}/program.md`,
		currentPlanningBriefPath: `${activeProgramFolderPath}/current-planning-brief.txt`,
		nextExecPlanPath,
		planningBriefPath: `${activeProgramFolderPath}/planning-brief-1.md`,
		programId,
	};
}

export function renderStarterOperatingPackFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedCodebaseFile[] {
	const paths = buildOperatingPackPaths(projectDefinition);
	const date = formatDate(projectDefinition.createdAt);

	return [
		{
			path: "docs/programs/PROGRAMS.md",
			content: renderProgramContract(),
		},
		{
			path: "docs/programs/active/index.md",
			content: renderProgramIndex(paths),
		},
		{
			path: "docs/programs/completed/index.md",
			content: renderCompletedIndex("Completed Programs"),
		},
		{
			path: paths.currentPlanningBriefPath,
			content: "planning-brief-1.md\n",
		},
		{
			path: paths.planningBriefPath,
			content: renderPlanningBrief(projectDefinition, paths),
		},
		{
			path: paths.activeProgramPath,
			content: renderProgram(projectDefinition, paths, date),
		},
		{
			path: "docs/exec-plans/PLANS.md",
			content: renderExecPlanContract(),
		},
		{
			path: "docs/exec-plans/active/index.md",
			content: renderExecPlanIndex(paths),
		},
		{
			path: "docs/exec-plans/completed/index.md",
			content: renderCompletedIndex("Completed ExecPlans"),
		},
		...paths.activeExecPlans.map((plan) => ({
			path: plan.path,
			content: renderSetupExecPlan(projectDefinition, paths, plan, date),
		})),
		{
			path: "scripts/agentic/check-programs.mjs",
			content: renderProgramsLintScript(paths),
		},
		{
			path: "scripts/agentic/check-exec-plans.mjs",
			content: renderExecPlansLintScript(paths),
		},
		{
			path: "scripts/agentic/check-codebase-contract.mjs",
			content: renderCodebaseContractScript(paths),
		},
	];
}
