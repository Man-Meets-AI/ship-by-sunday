export type CustomerSafeSnapshotShippingMode =
	| "ship-unchanged"
	| "ship-generalized"
	| "exclude";

export type CustomerSafeSnapshotContractEntry = {
	pathPattern: string;
	shippingMode: CustomerSafeSnapshotShippingMode;
	reason: string;
};

export const CUSTOMER_SAFE_SNAPSHOT_BASELINE = "full-tracked-repo";

export const CUSTOMER_SAFE_SNAPSHOT_REQUIRED_REPLACEMENTS = [
	"apps/web/.env.production.example",
] as const;

export const CUSTOMER_SAFE_SNAPSHOT_CONTRACT: CustomerSafeSnapshotContractEntry[] =
	[
		{
			pathPattern: "apps/web/**",
			shippingMode: "ship-unchanged",
			reason:
				"Ship the tracked starter app by default, then narrow unsafe env, build-output, and machine-local files with explicit exceptions.",
		},
		{
			pathPattern: "packages/codebase-compiler/**",
			shippingMode: "ship-unchanged",
			reason: "Ship the tracked codebase compiler as part of the starter repo.",
		},
		{
			pathPattern: "docs/prompts/execplan*.md",
			shippingMode: "ship-unchanged",
			reason:
				"Ship the ExecPlan prompt assets unchanged under repo-root docs/prompts.",
		},
		{
			pathPattern: "docs/prompts/exec-plan*.md",
			shippingMode: "ship-unchanged",
			reason:
				"Ship the current ExecPlan prompt assets unchanged under repo-root docs/prompts.",
		},
		{
			pathPattern: ".agents/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship a customer-safe starter subset instead of the raw internal agent workspace.",
		},
		{
			pathPattern: "AGENTS.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized starter guidance instead of repo-specific operator rules.",
		},
		{
			pathPattern: "CLAUDE.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized starter guidance instead of repo-specific operator rules.",
		},
		{
			pathPattern: "GEMINI.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized starter guidance instead of repo-specific operator rules.",
		},
		{
			pathPattern: "docs/testing/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized starter verification notes instead of internal test operations.",
		},
		{
			pathPattern: ".github/workflows/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship inert workflow examples instead of live repo-specific automation.",
		},
		{
			pathPattern: "apps/web/.env.local.example",
			shippingMode: "ship-unchanged",
			reason:
				"Keep the tracked local env template as a starter setup artifact.",
		},
		{
			pathPattern: "apps/web/.env.production",
			shippingMode: "exclude",
			reason:
				"Exclude the tracked production env file and replace it with a safe example template.",
		},
		{
			pathPattern: ".plans/**",
			shippingMode: "exclude",
			reason:
				"Exclude legacy archived ExecPlans and compatibility shims from the shipped starter repo.",
		},
		{
			pathPattern: "docs/codex/**",
			shippingMode: "exclude",
			reason:
				"Exclude legacy archived ExecPlans and compatibility shims from the shipped starter repo.",
		},
		{
			pathPattern: "docs/openai/**",
			shippingMode: "exclude",
			reason:
				"Exclude internal source templates from the shipped starter repo.",
		},
		{
			pathPattern: "docs/PLANS.md",
			shippingMode: "exclude",
			reason:
				"Do not ship the repo's ExecPlan routing docs inside a customer codebase snapshot.",
		},
		{
			pathPattern: "docs/exec-plans/**",
			shippingMode: "exclude",
			reason:
				"Do not ship the repo's ExecPlan contracts or active/completed plans inside a customer codebase snapshot.",
		},
		{
			pathPattern: "docs/programs/**",
			shippingMode: "exclude",
			reason:
				"Do not ship internal Program contracts or active/completed Program packets inside a customer codebase snapshot.",
		},
		{
			pathPattern: "docs/prompts/program-*.md",
			shippingMode: "exclude",
			reason:
				"Do not ship internal Program prompt assets inside a customer codebase snapshot.",
		},
		{
			pathPattern: "docs/ship-by-sunday/**",
			shippingMode: "exclude",
			reason:
				"Exclude internal product-contract docs from the shipped starter repo.",
		},
		{
			pathPattern: ".codex/**",
			shippingMode: "exclude",
			reason:
				"Exclude repo-local agent orchestration state from customer artifacts.",
		},
		{
			pathPattern: "CHANGELOG.md",
			shippingMode: "exclude",
			reason:
				"Exclude internal release history from the starter repo snapshot.",
		},
		{
			pathPattern: "docs/release-workflow.md",
			shippingMode: "exclude",
			reason:
				"Exclude internal release workflow notes from the starter repo snapshot.",
		},
		{
			pathPattern: ".impeccable.md",
			shippingMode: "exclude",
			reason:
				"Exclude internal design-ops notes from the starter repo snapshot.",
		},
		{
			pathPattern: "skills-lock.json",
			shippingMode: "exclude",
			reason:
				"Exclude local agent lock metadata from the starter repo snapshot.",
		},
		{
			pathPattern: "todo.md",
			shippingMode: "exclude",
			reason:
				"Exclude internal task-tracking notes from the starter repo snapshot.",
		},
		{
			pathPattern: "tmp-blog-article.png",
			shippingMode: "exclude",
			reason:
				"Exclude tracked temporary image artifacts from the starter repo snapshot.",
		},
		{
			pathPattern: "tmp-blog-article-mobile.png",
			shippingMode: "exclude",
			reason:
				"Exclude tracked temporary image artifacts from the starter repo snapshot.",
		},
	];
