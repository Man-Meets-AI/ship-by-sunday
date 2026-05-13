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
			shippingMode: "ship-generalized",
			reason:
				"Ship an explicit generated template app instead of the tracked Man Meets AI core app route tree.",
		},
		{
			pathPattern: "apps/web/app/**",
			shippingMode: "ship-generalized",
			reason:
				"Render the generated Starter app shell from intake facts so the customer repo has a runnable app without core-app route dependencies.",
		},
		{
			pathPattern: "apps/web/app/workers/**",
			shippingMode: "exclude",
			reason:
				"Exclude the public Workers marketing page from generated Starter repos; Workers is a separate existing-repo product.",
		},
		{
			pathPattern: "apps/web/app/(protected)/workers/**",
			shippingMode: "exclude",
			reason:
				"Exclude protected Worker install, doctor-pass, finding, loop, run, and privacy surfaces from generated Starter repos.",
		},
		{
			pathPattern:
				"apps/web/app/(protected)/_components/existing-codebase-setup/**",
			shippingMode: "exclude",
			reason:
				"Exclude existing-codebase setup components because they teach local runner pairing for the Workers product.",
		},
		{
			pathPattern:
				"apps/web/app/(protected)/_components/existing-codebase-doctor-pass/**",
			shippingMode: "exclude",
			reason:
				"Exclude Worker doctor-pass components from generated Starter repos.",
		},
		{
			pathPattern:
				"apps/web/app/(protected)/_components/existing-codebase-findings/**",
			shippingMode: "exclude",
			reason:
				"Exclude Worker findings and approval components from generated Starter repos.",
		},
		{
			pathPattern:
				"apps/web/app/(protected)/_components/existing-codebase-support/**",
			shippingMode: "exclude",
			reason:
				"Exclude Worker loop, run, and privacy support components from generated Starter repos.",
		},
		{
			pathPattern: "apps/web/app/(protected)/_lib/workspace-*",
			shippingMode: "exclude",
			reason:
				"Exclude Worker workspace read models and runner readiness models from generated Starter repos.",
		},
		{
			pathPattern:
				"apps/web/app/(protected)/_components/codex-connection-card/**",
			shippingMode: "exclude",
			reason:
				"Exclude core-app Codex account connection UI from generated Starter repos; generated repos should keep AI setup guidance in docs and skills.",
		},
		{
			pathPattern: "apps/web/app/api/workspace/runner/**",
			shippingMode: "exclude",
			reason:
				"Exclude workspace runner API routes because local runner pairing and workflow claims belong to Workers, not Starter output.",
		},
		{
			pathPattern: "apps/web/app/api/codex/**",
			shippingMode: "exclude",
			reason:
				"Exclude core-app Codex bridge endpoints from generated Starter repos; they are not part of the clean template app contract.",
		},
		{
			pathPattern: "apps/web/convex/workspace.ts",
			shippingMode: "exclude",
			reason:
				"Exclude Worker workspace Convex state from generated Starter repos.",
		},
		{
			pathPattern: "apps/web/convex/workspace/**",
			shippingMode: "exclude",
			reason:
				"Exclude Worker workspace Convex models, validators, and runner state from generated Starter repos.",
		},
		{
			pathPattern: "apps/web/platform/codex/**",
			shippingMode: "exclude",
			reason:
				"Exclude core-app Codex server bridge code from generated Starter repos.",
		},
		{
			pathPattern: "packages/local-runner/**",
			shippingMode: "exclude",
			reason:
				"Exclude the Worker local runner package from generated Starter repos.",
		},
		{
			pathPattern: "packages/codebase-compiler/**",
			shippingMode: "ship-unchanged",
			reason:
				"Ship the tracked codebase compiler as part of the customer Codebase.",
		},
		{
			pathPattern: "packages/telegram-chat-widget/**",
			shippingMode: "ship-unchanged",
			reason:
				"Ship the standalone Telegram chat widget package required by the generated web app.",
		},
		{
			pathPattern: "docs/prompts/execplan*.md",
			shippingMode: "ship-unchanged",
			reason:
				"Ship the customer-facing ExecPlan prompt assets unchanged under repo-root docs/prompts. The no-hyphen execplan-* family is the generated Codebase prompt contract.",
		},
		{
			pathPattern: ".agents/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship a customer-safe Codebase subset instead of the raw internal agent workspace.",
		},
		{
			pathPattern: "AGENTS.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized Codebase guidance instead of repo-specific operator rules.",
		},
		{
			pathPattern: "CLAUDE.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized Codebase guidance instead of repo-specific operator rules.",
		},
		{
			pathPattern: "GEMINI.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized Codebase guidance instead of repo-specific operator rules.",
		},
		{
			pathPattern: "docs/testing/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship generalized Codebase verification notes instead of internal test operations.",
		},
		{
			pathPattern: ".github/workflows/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship inert workflow examples instead of live repo-specific automation.",
		},
		{
			pathPattern: "docs/programs/PROGRAMS.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship a customer-safe Program contract for generated product work.",
		},
		{
			pathPattern: "docs/programs/active/<generated-program>/**",
			shippingMode: "ship-generalized",
			reason:
				"Ship only the generated customer's active Program packet, not internal Program archives.",
		},
		{
			pathPattern: "docs/exec-plans/PLANS.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship a customer-safe ExecPlan contract for generated product work.",
		},
		{
			pathPattern: "docs/exec-plans/active/<generated-plan>.md",
			shippingMode: "ship-generalized",
			reason:
				"Ship only the generated customer's first active ExecPlan, not internal ExecPlan archives.",
		},
		{
			pathPattern: "apps/web/.env.local.example",
			shippingMode: "ship-unchanged",
			reason:
				"Keep the tracked local env template as a Codebase setup artifact.",
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
				"Exclude legacy archived ExecPlans and compatibility shims from the shipped Codebase.",
		},
		{
			pathPattern: "docs/codex/**",
			shippingMode: "exclude",
			reason:
				"Exclude legacy archived ExecPlans and compatibility shims from the shipped Codebase.",
		},
		{
			pathPattern: "docs/openai/**",
			shippingMode: "exclude",
			reason: "Exclude internal source templates from the shipped Codebase.",
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
				"Do not ship the repo's internal ExecPlan archive; generated operating-pack overrides are the only allowed customer ExecPlan files.",
		},
		{
			pathPattern: "docs/programs/**",
			shippingMode: "exclude",
			reason:
				"Do not ship the repo's internal Program archive; generated operating-pack overrides are the only allowed customer Program files.",
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
				"Exclude internal product-contract docs from the shipped Codebase.",
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
			reason: "Exclude internal release history from the Codebase snapshot.",
		},
		{
			pathPattern: "docs/release-workflow.md",
			shippingMode: "exclude",
			reason:
				"Exclude internal release workflow notes from the Codebase snapshot.",
		},
		{
			pathPattern: ".impeccable.md",
			shippingMode: "exclude",
			reason: "Exclude internal design-ops notes from the Codebase snapshot.",
		},
		{
			pathPattern: "skills-lock.json",
			shippingMode: "exclude",
			reason: "Exclude local agent lock metadata from the Codebase snapshot.",
		},
		{
			pathPattern: "todo.md",
			shippingMode: "exclude",
			reason:
				"Exclude internal task-tracking notes from the Codebase snapshot.",
		},
		{
			pathPattern: "tmp-blog-article.png",
			shippingMode: "exclude",
			reason:
				"Exclude tracked temporary image artifacts from the Codebase snapshot.",
		},
		{
			pathPattern: "tmp-blog-article-mobile.png",
			shippingMode: "exclude",
			reason:
				"Exclude tracked temporary image artifacts from the Codebase snapshot.",
		},
	];
