import {
	parseCanonicalProjectDefinition,
	type CanonicalProjectDefinition,
} from "../canonical-project-definition/project-definition";
import { GENERATED_PROJECT_DEFINITION_PATH } from "../generated-docs/generated-doc-paths";
import { renderBuildBlueprint } from "../blueprints/render-build-blueprint";
import { renderDesignBlueprint } from "../blueprints/render-design-blueprint";
import { renderMarketingBlueprint } from "../blueprints/render-marketing-blueprint";
import { renderBlueprintReadme } from "../blueprints/render-blueprint-readme";
import { renderPromptPack } from "../blueprints/render-prompt-pack";
import type { RenderedBlueprintFile } from "../blueprints/render-types";
import {
	loadOpenAiBlueprintTemplates,
	loadPromptPackSourceFiles,
} from "./template-loader";

export async function renderFullBlueprintTree(
	projectDefinition: CanonicalProjectDefinition,
) {
	const canonicalProjectDefinition =
		parseCanonicalProjectDefinition(projectDefinition);
	const [templates, promptAssets] = await Promise.all([
		loadOpenAiBlueprintTemplates(),
		loadPromptPackSourceFiles(),
	]);
	const factsJsonFile: RenderedBlueprintFile = {
		path: GENERATED_PROJECT_DEFINITION_PATH,
		content: JSON.stringify(canonicalProjectDefinition, null, 2),
	};

	return [
		renderBlueprintReadme(canonicalProjectDefinition.facts),
		factsJsonFile,
		...renderDesignBlueprint(canonicalProjectDefinition.facts, templates),
		...renderMarketingBlueprint(canonicalProjectDefinition.facts, templates),
		...renderBuildBlueprint(canonicalProjectDefinition.facts, templates),
		...renderPromptPack(promptAssets),
	];
}
