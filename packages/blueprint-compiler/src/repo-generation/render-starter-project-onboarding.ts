import type { RenderedBlueprintFile } from "../blueprints/render-types";
import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";

type OnboardingStep = {
	id:
		| "understand-blueprint"
		| "boot-repo"
		| "install-skills"
		| "linear-workflow"
		| "core-setup"
		| "auth-setup"
		| "billing-setup"
		| "verify-starter"
		| "shape-product"
		| "start-building";
	agentPrompt: string;
	customerAction: string[];
	internalPhase: "orientation" | "core" | "auth" | "billing" | "product";
	references?: {
		label: string;
		path: string;
	}[];
	skillTriggers: string[];
	title: string;
};

const EXTERNAL_SKILL_TRIGGERS = [
	"$convex-quickstart",
	"$convex-setup-auth",
	"$clerk",
	"$clerk-nextjs-patterns",
	"$stripe-best-practices",
] as const;

const ONBOARDING_STEPS: OnboardingStep[] = [
	{
		id: "understand-blueprint",
		title: "Understand what you downloaded",
		internalPhase: "orientation",
		customerAction: [
			"Read `README.md` for the repo overview.",
			"Read `DESIGN.md` for the generated visual system and product feel.",
			"Skim `docs/index.md` so you know what packs and setup docs are already included.",
		],
		agentPrompt:
			"Summarize this starter repo before changing code. Tell me what is product-specific, what is starter scaffolding, and what I should leave alone until setup is stable.",
		skillTriggers: ["$starter-core-setup"],
		references: [
			{ label: "README.md", path: "README.md" },
			{ label: "DESIGN.md", path: "DESIGN.md" },
			{ label: "docs/index.md", path: "docs/index.md" },
		],
	},
	{
		id: "boot-repo",
		title: "Boot the repo",
		internalPhase: "core",
		customerAction: [
			"Run `bun run bootstrap`.",
			"Let the bootstrap install dependencies and prepare `apps/web/.env.local`.",
			"If the bootstrap opens provider pages, keep those tabs for later steps instead of filling them immediately.",
		],
		agentPrompt:
			"Help me boot this starter locally without touching auth or billing yet. Follow the starter bootstrap contract and keep the diff scoped to setup only.",
		skillTriggers: ["$starter-core-setup"],
		references: [{ label: "bootstrap.sh", path: "bootstrap.sh" }],
	},
	{
		id: "install-skills",
		title: "Install the recommended Codex skills",
		internalPhase: "core",
		customerAction: [
			"If Node.js and `npx` are installed, run `bun run codex:skills:install`.",
			"If that command says Node.js or `npx` is missing, skip it for now and come back after installing Node.js tooling.",
			"Restart Codex if the new skills do not appear right away.",
			"Use the local wrapper skills first. Use the external skills when you need deeper domain help.",
		],
		agentPrompt:
			"Confirm which local starter skills already ship in this repo and which external skills were installed, then tell me which one I should use first.",
		skillTriggers: [
			"$starter-core-setup",
			"$starter-auth-setup",
			"$starter-billing-setup",
			...EXTERNAL_SKILL_TRIGGERS,
		],
		references: [
			{
				label: ".agents/skills/external-skills.json",
				path: ".agents/skills/external-skills.json",
			},
			{
				label: "scripts/install-codex-skills.sh",
				path: "scripts/install-codex-skills.sh",
			},
		],
	},
	{
		id: "linear-workflow",
		title: "Set up Linear as your work tracker",
		internalPhase: "core",
		customerAction: [
			"If you use Linear, create one project for this product before asking agents to build.",
			"Use Linear as the official backlog and status surface. Use GitHub for code, branches, PRs, and CI.",
			"Create issues with Problem, Outcome, Acceptance Criteria, Validation, and Source sections so agents can act without guessing.",
			"Move issues through Backlog, Ready, In Progress, In Review, Done, and Canceled deliberately.",
			"Link PRs, preview deployments, docs, and validation evidence back to the Linear issue before calling work done.",
		],
		agentPrompt:
			"Help me set up Linear for this starter. Create or identify the product project, define the default workflow, and show me the issue template agents should use before implementation starts.",
		skillTriggers: ["$starter-linear-workflow", "$starter-core-setup"],
		references: [
			{ label: "START-HERE.md", path: "START-HERE.md" },
			{
				label: "docs/build/docs/agent-handoff.md",
				path: "docs/build/docs/agent-handoff.md",
			},
			{
				label: "docs/build/docs/readiness.md",
				path: "docs/build/docs/readiness.md",
			},
		],
	},
	{
		id: "core-setup",
		title: "Run core setup",
		internalPhase: "core",
		customerAction: [
			"In Codex, run `$starter-core-setup`.",
			"Follow the local setup guidance until the homepage, docs, and app shell boot cleanly.",
			"Do not change auth, checkout, or protected access code before the starter runs locally.",
		],
		agentPrompt:
			"Run the core starter setup path for this repo. Keep auth and billing untouched until the basic local boot is stable.",
		skillTriggers: ["$starter-core-setup", "$starter-nextjs-in-this-repo"],
		references: [
			{
				label: "apps/web/content/docs/local-setup.mdx",
				path: "apps/web/content/docs/local-setup.mdx",
			},
			{
				label: "node_modules/next/dist/docs/",
				path: "node_modules/next/dist/docs/",
			},
		],
	},
	{
		id: "auth-setup",
		title: "Run auth setup",
		internalPhase: "auth",
		customerAction: [
			"In Codex, run `$starter-auth-setup`.",
			"Set up Clerk first, then connect Convex, then run the auth doctor.",
			"Keep this repo’s auth contract intact until sign-in and protected routes work end to end.",
		],
		agentPrompt:
			"Set up auth for this starter in the supported order: Clerk first, then Convex, then verification. Use the repo-local guidance before making framework changes.",
		skillTriggers: [
			"$starter-auth-setup",
			"$clerk",
			"$clerk-nextjs-patterns",
			"$convex-setup-auth",
		],
		references: [
			{
				label: "apps/web/content/docs/clerk-convex-auth.mdx",
				path: "apps/web/content/docs/clerk-convex-auth.mdx",
			},
			{
				label: "apps/web/convex/_generated/ai/guidelines.md",
				path: "apps/web/convex/_generated/ai/guidelines.md",
			},
		],
	},
	{
		id: "billing-setup",
		title: "Run billing setup",
		internalPhase: "billing",
		customerAction: [
			"In Codex, run `$starter-billing-setup`.",
			"Set up Stripe after auth is stable, then run the billing doctor and webhook verification flow.",
			"Do not rewrite checkout or webhook code until the starter’s paid-access handoff works as shipped.",
		],
		agentPrompt:
			"Set up billing for this starter after auth is stable. Keep the checkout and webhook contract intact, then verify the billing handoff before changing product flows.",
		skillTriggers: ["$starter-billing-setup", "$stripe-best-practices"],
		references: [
			{
				label: "apps/web/content/docs/stripe-checkout-webhook.mdx",
				path: "apps/web/content/docs/stripe-checkout-webhook.mdx",
			},
		],
	},
	{
		id: "verify-starter",
		title: "Verify the starter works",
		internalPhase: "billing",
		customerAction: [
			"Confirm the app boots, sign-in works, and the protected starter shell behaves correctly.",
			"Confirm the billing doctor and verification flow both pass before touching checkout or access code.",
			"Only move on once the starter is stable as shipped.",
		],
		agentPrompt:
			"Verify the shipped starter before we customize it. Run the smallest relevant checks first and call out any real setup drift before we touch product code.",
		skillTriggers: ["$testing-practices", "$starter-billing-setup"],
		references: [
			{
				label: "apps/web/content/docs/local-qa.mdx",
				path: "apps/web/content/docs/local-qa.mdx",
			},
		],
	},
	{
		id: "shape-product",
		title: "Replace the generated product identity",
		internalPhase: "product",
		customerAction: [
			"Rewrite the name, promise, pricing, and homepage copy before deeper refactors.",
			"Use the generated product config and home content as your first product seam.",
			"Keep the starter’s fragile auth and billing seams intact until the product already feels like yours.",
		],
		agentPrompt:
			"Update the generated starter identity to match my product before touching auth or billing. Start with the product config and homepage content, then tell me what still looks like starter scaffolding.",
		skillTriggers: ["$starter-first-slice", "$copywriting", "$frontend-design"],
		references: [
			{
				label: "apps/web/config/product.ts",
				path: "apps/web/config/product.ts",
			},
			{
				label: "apps/web/app/_content/home-page.ts",
				path: "apps/web/app/_content/home-page.ts",
			},
		],
	},
	{
		id: "start-building",
		title: "Start the first real slice",
		internalPhase: "product",
		customerAction: [
			"In Codex, run `$starter-first-slice`.",
			"Pick the first real customer-visible slice after the starter is stable.",
			"Use the shipped docs and wrapper skills as guardrails while the product begins to diverge from the starter.",
		],
		agentPrompt:
			"The starter is stable. Help me pick and implement the first real customer-visible slice, then keep docs and tests aligned as we move away from starter scaffolding.",
		skillTriggers: ["$starter-first-slice", "$docs", "$testing-practices"],
		references: [
			{
				label: "apps/web/content/docs/build-your-product.mdx",
				path: "apps/web/content/docs/build-your-product.mdx",
			},
		],
	},
];

function renderSkillTriggerList(skillTriggers: readonly string[]) {
	return skillTriggers.map((trigger) => `- \`${trigger}\``).join("\n");
}

function renderReferenceList(
	references: OnboardingStep["references"],
	linkFormatter: (label: string, path: string) => string,
) {
	if (!references || references.length === 0) {
		return "";
	}

	return [
		"Helpful references:",
		...references.map(
			(reference) => `- ${linkFormatter(reference.label, reference.path)}`,
		),
	].join("\n");
}

function renderMarkdownLink(label: string, path: string) {
	return `\`${path}\``;
}

function renderDocsLink(label: string, path: string) {
	const docPath = path.replace(/^apps\/web\/content\/docs\//, "");
	const normalizedDocPath = docPath.replace(/\.mdx$/, "");

	if (path.startsWith("apps/web/content/docs/")) {
		return `[${label}](/docs/${normalizedDocPath})`;
	}

	return `\`${path}\``;
}

function renderOnboardingBody(
	linkFormatter: (label: string, path: string) => string,
) {
	return ONBOARDING_STEPS.map((step, index) =>
		[
			`## ${index + 1}. ${step.title}`,
			"",
			"What you do:",
			...step.customerAction.map((line) => `- ${line}`),
			"",
			"Tell Codex:",
			`> ${step.agentPrompt}`,
			"",
			"Skills to use:",
			renderSkillTriggerList(step.skillTriggers),
			"",
			renderReferenceList(step.references, linkFormatter),
		]
			.filter(Boolean)
			.join("\n"),
	).join("\n\n");
}

function renderSharedIntro(productName: string) {
	return [
		`${productName} should feel obvious on day one.`,
		"",
		"This is the recommended order for every buyer. Follow it once before you start reshaping the product:",
		"- `bun run bootstrap`",
		"- `bun run codex:skills:install` if Node.js and `npx` are available",
		"- restart Codex if the new skills do not appear",
		"- `$starter-linear-workflow` if you use Linear to run the build",
		"- `$starter-core-setup`",
		"- `$starter-auth-setup`",
		"- `$starter-billing-setup`",
		"",
		"In Codex, trigger a skill by typing `$` followed by the skill name. The local wrapper skills tell Codex how this starter wants work to be done. The Linear wrapper teaches agents how to treat issues as the backlog and status source. The installed external skills add deeper product knowledge for Clerk, Convex, and Stripe.",
		"",
		"Keep the shipped auth, billing, and protected-access paths intact until the starter is stable as shipped.",
	].join("\n");
}

export function renderStarterProjectOnboardingFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedBlueprintFile[] {
	const { product_name: productName } = projectDefinition.facts;

	return [
		{
			path: "START-HERE.md",
			content: [
				`# Start Here — ${productName}`,
				"",
				renderSharedIntro(productName),
				"",
				renderOnboardingBody(renderMarkdownLink),
			].join("\n"),
		},
		{
			path: "apps/web/content/docs/index.mdx",
			content: [
				"---",
				'title: "Start Here"',
				`description: "Boot ${productName}, install the recommended Codex skills, and follow the starter in the right order before customizing the product."`,
				"---",
				"",
				"# Start Here",
				"",
				renderSharedIntro(productName),
				"",
				renderOnboardingBody(renderDocsLink),
			].join("\n"),
		},
	];
}
