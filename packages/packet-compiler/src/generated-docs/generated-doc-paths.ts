export const GENERATED_DOCS_ROOT = "docs";
export const GENERATED_DOCS_README_PATH = `${GENERATED_DOCS_ROOT}/README.md`;

export const GENERATED_FACTS_ROOT = `${GENERATED_DOCS_ROOT}/facts`;
export const GENERATED_PROJECT_DEFINITION_PATH = `${GENERATED_FACTS_ROOT}/project-definition.json`;

export const GENERATED_DESIGN_DOCS_ROOT = `${GENERATED_DOCS_ROOT}/design`;
export const GENERATED_MARKETING_DOCS_ROOT = `${GENERATED_DOCS_ROOT}/marketing`;
export const GENERATED_BUILD_DOCS_ROOT = `${GENERATED_DOCS_ROOT}/build`;
export const GENERATED_BUILD_DETAIL_DOCS_ROOT = `${GENERATED_BUILD_DOCS_ROOT}/docs`;
export const SHIPPED_PROMPT_ASSETS_ROOT = `${GENERATED_DOCS_ROOT}/prompts`;

export type GeneratedDesignDocFileName =
	| "AGENTS.md"
	| "CHECKLIST.md"
	| "PLANS.md"
	| "documentation.md";

export type GeneratedMarketingDocFileName =
	| "README.md"
	| "AGENTS.md"
	| "CHECKLIST.md"
	| "PLANS.md"
	| "documentation.md";

export type GeneratedBuildDocFileName = "AGENTS.md" | "CHECKLIST.md";

export type GeneratedBuildDetailDocFileName =
	| "prompt.md"
	| "plans.md"
	| "implement.md"
	| "documentation.md";

export type ShippedPromptAssetFileName =
	| "execplan-outline-from-session.md"
	| "execplan-execution-loop.md"
	| "execplan-grill.md"
	| "execplan-writer.md";

export function getGeneratedDesignDocPath(
	fileName: GeneratedDesignDocFileName,
) {
	return `${GENERATED_DESIGN_DOCS_ROOT}/${fileName}`;
}

export function getGeneratedMarketingDocPath(
	fileName: GeneratedMarketingDocFileName,
) {
	return `${GENERATED_MARKETING_DOCS_ROOT}/${fileName}`;
}

export function getGeneratedBuildDocPath(fileName: GeneratedBuildDocFileName) {
	return `${GENERATED_BUILD_DOCS_ROOT}/${fileName}`;
}

export function getGeneratedBuildDetailDocPath(
	fileName: GeneratedBuildDetailDocFileName,
) {
	return `${GENERATED_BUILD_DETAIL_DOCS_ROOT}/${fileName}`;
}

export function getShippedPromptAssetPath(
	fileName: ShippedPromptAssetFileName,
) {
	return `${SHIPPED_PROMPT_ASSETS_ROOT}/${fileName}`;
}
