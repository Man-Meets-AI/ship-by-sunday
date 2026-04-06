import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { GENERATED_DESIGN_SYSTEM_FACT_PATH } from "../generated-docs/generated-doc-paths";
import type { RenderedBlueprintFile } from "../blueprints/render-types";
import {
	buildGeneratedDesignSystem,
	renderGeneratedDesignMarkdown,
} from "../design-system/generated-design-system";

export function renderGeneratedDesignSystemFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedBlueprintFile[] {
	const designSystem = buildGeneratedDesignSystem(projectDefinition.facts);

	return [
		{
			path: "DESIGN.md",
			content: renderGeneratedDesignMarkdown(designSystem),
		},
		{
			path: GENERATED_DESIGN_SYSTEM_FACT_PATH,
			content: JSON.stringify(designSystem, null, 2),
		},
		{
			path: "apps/web/config/generated-design-system.ts",
			content: `export const generatedDesignSystem = ${JSON.stringify(
				designSystem,
				null,
				2,
			)} as const;\n`,
		},
	];
}
