import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { GENERATED_DOCS_README_PATH } from "../generated-docs/generated-doc-paths";
import type { RenderedCodebaseFile } from "../codebases/render-types";
import { renderStarterBootstrapFile } from "./render-starter-bootstrap";
import { renderStarterProjectOnboardingFiles } from "./render-starter-project-onboarding";
import { renderStarterSkillFiles } from "./render-starter-skills";
import { buildStarterRootPackageJson } from "./starter-root-package-json";

export function renderTemplateOverrides(
	projectDefinition: CanonicalProjectDefinition,
): RenderedCodebaseFile[] {
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
				"Open `START-HERE.md` first. It is the buyer-facing path from downloaded Codebase to real product work.",
				"",
				"Read `DESIGN.md` next. It is the generated design system and the visual source of truth for this Codebase.",
				"",
				`Open \`${GENERATED_DOCS_README_PATH}\` for the generated Design, Marketing, Build, and prompt materials that ship with this Codebase.`,
				"",
				"## What This Repo Contains",
				"",
				"- `apps/web/` is the runnable app.",
				"- `DESIGN.md` is the human-readable design system.",
				"- `docs/facts/design-system.json` and `apps/web/config/generated-design-system.ts` are the machine-readable design snapshots.",
				"- `docs/` contains the generated implementation packs and product facts.",
				"",
				"## Generated Codebase Overrides",
				"",
				"- `apps/web/config/product.ts` contains the generated Codebase product configuration.",
				"- `apps/web/app/_content/home-page.ts` contains the generated homepage Codebase content.",
				"- `apps/web/config/generated-design-system.ts` contains the generated runtime design system.",
				"",
				"## First-Pass Checklist",
				"",
				"- [ ] Read `DESIGN.md` and confirm the generated design system is close enough to your intended product before changing UI code.",
				"- [ ] Replace any remaining placeholder facts, especially domain, support email, and design references, so the Codebase stops reading like a fixture.",
				"- [ ] Review `apps/web/config/product.ts` and `apps/web/app/_content/home-page.ts` for product name, promise, pricing, CTA copy, and homepage content.",
				"- [ ] Decide whether you want to keep the internal codebase and review workflow in this Codebase. If not, remove those routes and the supporting compiler package deliberately instead of leaving dead surfaces around.",
				"- [ ] Run the app locally and verify the generated design system feels right on the homepage, protected shell, and any route you plan to keep.",
				"- [ ] Run `bun run lint`, `bun run typecheck`, and the smallest relevant tests after your first customization pass.",
				"",
				"## Quick Start",
				"",
				"1. Run `bun run bootstrap` from the repo root.",
				"2. Run `bun run codex:skills:install` to install the vetted external Codex skills for Convex, Clerk, and Stripe.",
				"3. Restart Codex if the new skills do not appear.",
				"4. If you use Linear, run `$starter-linear-workflow` before implementation so your backlog, status workflow, and issue template are clear.",
				"5. Follow `START-HERE.md` in order: `$starter-core-setup`, then `$starter-auth-setup`, then `$starter-billing-setup`.",
				"6. Run `bun run dev` from the repo root once setup is stable.",
				"",
				"`bootstrap.sh` installs dependencies, prepares `apps/web/.env.local`, opens the official provider setup pages, and can apply the generated shadcn preset in `apps/web`.",
				"The Codebase also ships local Codex wrapper skills under `.agents/skills/` plus a one-command external skill installer.",
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
						observability: true,
						codex: true,
					},
				},
				null,
				2,
			)} as const;\n`,
		},
		{
			path: "apps/web/app/_content/home-page.ts",
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
