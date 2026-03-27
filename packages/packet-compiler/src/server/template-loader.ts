import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PromptPackSourceFiles } from "../packets/render-prompt-pack";
import type { OpenAiPacketTemplates } from "../packets/render-types";

let openAiPacketTemplatesPromise: Promise<OpenAiPacketTemplates> | undefined;
let promptPackSourceFilesPromise: Promise<PromptPackSourceFiles> | undefined;

function openAiTemplateUrl(relativePath: string) {
	const repoRootPath = path.resolve(
		/* turbopackIgnore: true */ process.cwd(),
		"..",
		"..",
	);
	return path.join(repoRootPath, "docs", "openai", relativePath);
}

function shippedPromptAssetUrl(fileName: string) {
	const repoRootPath = path.resolve(
		/* turbopackIgnore: true */ process.cwd(),
		"..",
		"..",
	);
	return path.join(repoRootPath, "docs", "prompts", fileName);
}

export async function loadOpenAiPacketTemplates(): Promise<OpenAiPacketTemplates> {
	openAiPacketTemplatesPromise ??= Promise.all([
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

	return openAiPacketTemplatesPromise;
}

export async function loadPromptPackSourceFiles(): Promise<PromptPackSourceFiles> {
	promptPackSourceFilesPromise ??= Promise.all([
		readFile(shippedPromptAssetUrl("execplan-execution-loop.md"), "utf8"),
		readFile(shippedPromptAssetUrl("execplan-grill.md"), "utf8"),
		readFile(shippedPromptAssetUrl("execplan-writer.md"), "utf8"),
	]).then(([executionLoop, grill, writer]) => ({
		"execplan-execution-loop.md": executionLoop,
		"execplan-grill.md": grill,
		"execplan-writer.md": writer,
	}));

	return promptPackSourceFilesPromise;
}
