import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { GENERATED_DOCS_README_PATH } from "../generated-docs/generated-doc-paths";
import type { RenderedBlueprintFile } from "../blueprints/render-types";

export function renderTemplateOverrides(
	projectDefinition: CanonicalProjectDefinition,
): RenderedBlueprintFile[] {
	const { facts } = projectDefinition;

	return [
		{
			path: "README.md",
			content: [
				`# ${facts.product_name}`,
				"",
				facts.product_summary,
				"",
				"## Start Here",
				"",
				`Open \`${GENERATED_DOCS_README_PATH}\` for the generated Design, Marketing, Build, and prompt materials that ship with this starter repo.`,
				"",
				"## Starter Overrides",
				"",
				"- `apps/web/config/product.ts` contains the generated starter product configuration.",
				"- `apps/web/features/marketing/content/home.ts` contains the generated homepage starter content.",
			].join("\n"),
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
