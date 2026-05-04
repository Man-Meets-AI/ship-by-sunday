import {
	parseCanonicalProjectDefinition,
	type CanonicalProjectDefinition,
} from "../canonical-project-definition/project-definition";
import { GENERATED_PROJECT_DEFINITION_PATH } from "../generated-docs/generated-doc-paths";
import { renderBuildCodebase } from "../codebases/render-build-codebase";
import { renderDesignCodebase } from "../codebases/render-design-codebase";
import { renderMarketingCodebase } from "../codebases/render-marketing-codebase";
import { renderCodebaseReadme } from "../codebases/render-codebase-readme";
import { renderPromptPack } from "../codebases/render-prompt-pack";
import type { RenderedCodebaseFile } from "../codebases/render-types";
import {
	loadOpenAiCodebaseTemplates,
	loadPromptPackSourceFiles,
} from "./template-loader";

export async function renderFullCodebaseTree(
	projectDefinition: CanonicalProjectDefinition,
) {
	const canonicalProjectDefinition =
		parseCanonicalProjectDefinition(projectDefinition);
	const [templates, promptAssets] = await Promise.all([
		loadOpenAiCodebaseTemplates(),
		loadPromptPackSourceFiles(),
	]);
	const factsJsonFile: RenderedCodebaseFile = {
		path: GENERATED_PROJECT_DEFINITION_PATH,
		content: JSON.stringify(canonicalProjectDefinition, null, 2),
	};

	return [
		renderCodebaseReadme(canonicalProjectDefinition.facts),
		factsJsonFile,
		...renderDesignCodebase(canonicalProjectDefinition.facts, templates),
		...renderMarketingCodebase(canonicalProjectDefinition.facts, templates),
		...renderBuildCodebase(canonicalProjectDefinition.facts, templates),
		...renderPromptPack(promptAssets),
	];
}
