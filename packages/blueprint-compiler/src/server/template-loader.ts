import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PromptPackSourceFiles } from "../blueprints/render-prompt-pack";
import type { OpenAiBlueprintTemplates } from "../blueprints/render-types";
import { resolveRepoRootPath } from "../repo-root";

let openAiBlueprintTemplatesPromise:
	| Promise<OpenAiBlueprintTemplates>
	| undefined;
let promptPackSourceFilesPromise: Promise<PromptPackSourceFiles> | undefined;

function openAiTemplateUrl(relativePath: string) {
	const repoRootPath = resolveRepoRootPath();
	return path.join(
		repoRootPath,
		"docs",
		"generated",
		"openai-blueprint",
		relativePath,
	);
}

function shippedPromptAssetUrl(fileName: string) {
	const repoRootPath = resolveRepoRootPath();
	return path.join(repoRootPath, "docs", "prompts", fileName);
}

export async function loadOpenAiBlueprintTemplates(): Promise<OpenAiBlueprintTemplates> {
	openAiBlueprintTemplatesPromise ??= Promise.all([
		readFile(
			openAiTemplateUrl("codex_long_horizon_templates/AGENTS.md"),
			"utf8",
		),
		readFile(
			openAiTemplateUrl("codex_long_horizon_templates/CHECKLIST.md"),
			"utf8",
		),
		readFile(
			openAiTemplateUrl("codex_long_horizon_templates/docs/documentation.md"),
			"utf8",
		),
		readFile(
			openAiTemplateUrl("codex_long_horizon_templates/docs/implement.md"),
			"utf8",
		),
		readFile(
			openAiTemplateUrl("codex_long_horizon_templates/docs/plans.md"),
			"utf8",
		),
		readFile(
			openAiTemplateUrl("codex_long_horizon_templates/docs/prompt.md"),
			"utf8",
		),
		readFile(openAiTemplateUrl("design-checklist/AGENTS.md"), "utf8"),
		readFile(openAiTemplateUrl("design-checklist/CHECKLIST.md"), "utf8"),
		readFile(openAiTemplateUrl("design-checklist/documentation.md"), "utf8"),
		readFile(openAiTemplateUrl("design-checklist/PLANS.md"), "utf8"),
		readFile(openAiTemplateUrl("openai-marketing-kit/AGENTS.md"), "utf8"),
		readFile(openAiTemplateUrl("openai-marketing-kit/CHECKLIST.md"), "utf8"),
		readFile(
			openAiTemplateUrl("openai-marketing-kit/documentation.md"),
			"utf8",
		),
		readFile(openAiTemplateUrl("openai-marketing-kit/PLANS.md"), "utf8"),
		readFile(openAiTemplateUrl("openai-marketing-kit/README.md"), "utf8"),
	]).then(
		([
			buildAgents,
			buildChecklist,
			buildDocumentation,
			buildImplement,
			buildPlans,
			buildPrompt,
			designAgents,
			designChecklist,
			designDocumentation,
			designPlans,
			marketingAgents,
			marketingChecklist,
			marketingDocumentation,
			marketingPlans,
			marketingReadme,
		]) => ({
			buildAgents,
			buildChecklist,
			buildDocumentation,
			buildImplement,
			buildPlans,
			buildPrompt,
			designAgents,
			designChecklist,
			designDocumentation,
			designPlans,
			marketingAgents,
			marketingChecklist,
			marketingDocumentation,
			marketingPlans,
			marketingReadme,
		}),
	);

	return openAiBlueprintTemplatesPromise;
}

export async function loadPromptPackSourceFiles(): Promise<PromptPackSourceFiles> {
	promptPackSourceFilesPromise ??= Promise.all([
		readFile(
			shippedPromptAssetUrl("exec-plan-outline-from-session.md"),
			"utf8",
		),
		readFile(shippedPromptAssetUrl("exec-plan-execute.md"), "utf8"),
		readFile(shippedPromptAssetUrl("exec-plan-grill.md"), "utf8"),
		readFile(shippedPromptAssetUrl("exec-plan-validate.md"), "utf8"),
		readFile(shippedPromptAssetUrl("exec-plan-writer.md"), "utf8"),
	]).then(([outlineFromSession, execute, grill, validate, writer]) => ({
		"exec-plan-outline-from-session.md": outlineFromSession,
		"exec-plan-execute.md": execute,
		"exec-plan-grill.md": grill,
		"exec-plan-validate.md": validate,
		"exec-plan-writer.md": writer,
	}));

	return promptPackSourceFilesPromise;
}
