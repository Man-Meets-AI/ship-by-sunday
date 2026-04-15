import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { GENERATED_DOCS_README_PATH } from "../generated-docs/generated-doc-paths";
import type { RenderedBlueprintFile } from "../blueprints/render-types";
import { buildRepoGenerationManifest } from "./build-repo-generation-manifest";
import { renderStarterBootstrapFile } from "./render-starter-bootstrap";
import { renderStarterProjectOnboardingFiles } from "./render-starter-project-onboarding";
import { renderStarterSkillFiles } from "./render-starter-skills";

function buildStarterRootPackageJson(
	projectDefinition: CanonicalProjectDefinition,
) {
	const manifest = buildRepoGenerationManifest(projectDefinition);

	return {
		name: manifest.repoName,
		version: "0.1.0",
		private: true,
		packageManager: "bun@1.3.5",
		workspaces: ["apps/web", "packages/*"],
		scripts: {
			bootstrap: "bash ./bootstrap.sh",
			"codex:skills:install": "bash ./scripts/install-codex-skills.sh",
			dev: "bun run --cwd apps/web dev",
			"dev:core": "bun run --cwd apps/web dev:core",
			"dev:web": "bun run --cwd apps/web dev:web",
			"dev:convex": "bun run --cwd apps/web dev:convex",
			"dev:stripe": "bun run --cwd apps/web dev:stripe",
			"dev:full": "bun run --cwd apps/web dev:full",
			build: "bun run --cwd apps/web build",
			start: "bun run --cwd apps/web start",
			typecheck: "bun run --cwd apps/web typecheck",
			lint: "bun run --cwd apps/web lint",
			"lint:fix": "bun run --cwd apps/web lint:fix",
			format: "bun run --cwd apps/web format",
			"format:check": "bun run --cwd apps/web format:check",
			test: "bun run --cwd apps/web test",
			"test:contracts": "bun run --cwd apps/web test:contracts",
			"test:e2e":
				"PLAYWRIGHT_USE_LOCAL_SERVER=${PLAYWRIGHT_USE_LOCAL_SERVER:-1} bun run --cwd apps/web test:e2e",
			check:
				"bun run format && bun run lint && bun run typecheck && bun run test && bun run test:contracts && bun run build && bun run test:e2e",
		},
	};
}

export function renderTemplateOverrides(
	projectDefinition: CanonicalProjectDefinition,
): RenderedBlueprintFile[] {
	const { facts } = projectDefinition;

	return [
		renderStarterBootstrapFile(projectDefinition),
		...renderStarterProjectOnboardingFiles(projectDefinition),
		...renderStarterSkillFiles(),
		{
			path: "README.md",
			content: [
				`# ${facts.product_name}`,
				"",
				facts.product_summary,
				"",
				"## Start Here",
				"",
				"Open `START-HERE.md` first. It is the buyer-facing path from downloaded starter to real product work.",
				"",
				"Read `DESIGN.md` next. It is the generated design system and the visual source of truth for this starter.",
				"",
				`Open \`${GENERATED_DOCS_README_PATH}\` for the generated Design, Marketing, Build, and prompt materials that ship with this starter repo.`,
				"",
				"## What This Repo Contains",
				"",
				"- `apps/web/` is the runnable app.",
				"- `DESIGN.md` is the human-readable design system.",
				"- `docs/facts/design-system.json` and `apps/web/config/generated-design-system.ts` are the machine-readable design snapshots.",
				"- `docs/` contains the generated implementation packs and product facts.",
				"",
				"## Starter Overrides",
				"",
				"- `apps/web/config/product.ts` contains the generated starter product configuration.",
				"- `apps/web/features/marketing/content/home.ts` contains the generated homepage starter content.",
				"- `apps/web/config/generated-design-system.ts` contains the generated runtime design system.",
				"",
				"## First-Pass Checklist",
				"",
				"- [ ] Read `DESIGN.md` and confirm the generated design system is close enough to your intended product before changing UI code.",
				"- [ ] Replace any remaining placeholder facts, especially domain, support email, and design references, so the starter stops reading like a fixture.",
				"- [ ] Review `apps/web/config/product.ts` and `apps/web/features/marketing/content/home.ts` for product name, promise, pricing, CTA copy, and homepage content.",
				"- [ ] Decide whether you want to keep the internal blueprint and review workflow in the starter. If not, remove those routes and the supporting compiler package deliberately instead of leaving dead surfaces around.",
				"- [ ] Run the app locally and verify the generated design system feels right on the homepage, protected shell, and any route you plan to keep.",
				"- [ ] Run `bun run lint`, `bun run typecheck`, and the smallest relevant tests after your first customization pass.",
				"",
				"## Quick Start",
				"",
				"1. Run `bun run bootstrap` from the repo root.",
				"2. Run `bun run codex:skills:install` to install the vetted external Codex skills for Convex, Clerk, and Stripe.",
				"3. Restart Codex if the new skills do not appear.",
				"4. Follow `START-HERE.md` in order: `$starter-core-setup`, then `$starter-auth-setup`, then `$starter-billing-setup`.",
				"5. Run `bun run dev` from the repo root once setup is stable.",
				"",
				"`bootstrap.sh` installs dependencies, prepares `apps/web/.env.local`, opens the official provider setup pages, and can apply the generated shadcn preset in `apps/web`.",
				"The repo also ships starter-local Codex wrapper skills under `.agents/skills/` plus a one-command external skill installer.",
			].join("\n"),
		},
		{
			path: "package.json",
			content: `${JSON.stringify(
				buildStarterRootPackageJson(projectDefinition),
				null,
				2,
			)}\n`,
		},
		{
			path: "apps/web/config/product.ts",
			content: `export const generatedProductConfig = ${JSON.stringify(
				{
					name: facts.product_name,
					promise: facts.outcome_statement,
					priceDisplay: facts.price_display,
					priceUsdCents: facts.price_usd_cents,
					currency: facts.currency,
					primaryCta: facts.primary_cta,
					modules: {
						docs: true,
						course: false,
						starterRepo: false,
						observability: true,
						codex: true,
					},
				},
				null,
				2,
			)} as const;\n`,
		},
		{
			path: "apps/web/features/marketing/content/home.ts",
			content: `export const generatedHomePageContent = ${JSON.stringify(
				{
					productName: facts.product_name,
					headline: facts.outcome_statement,
					subheadline: facts.product_summary,
					primaryCta: facts.primary_cta,
					proofStrategy: facts.proof_strategy,
					sectionNarrative: facts.section_narrative,
				},
				null,
				2,
			)} as const;\n`,
		},
	];
}
