import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
	createCompleteProjectDefinition,
} from "../src";
import { renderFullBlueprintTree } from "../src/server";

describe("blueprint renderers", () => {
	it("renders the expected blueprint tree", async () => {
		const renderedFiles = await renderFullBlueprintTree(
			createCompleteProjectDefinition(),
		);
		const renderedPaths = renderedFiles.map((file) => file.path);

		expect(renderedPaths).toEqual(
			expect.arrayContaining([
				"docs/README.md",
				"docs/facts/project-definition.json",
				"docs/design/AGENTS.md",
				"docs/marketing/README.md",
				"docs/build/docs/prompt.md",
				"docs/prompts/execplan-outline-from-session.md",
				"docs/prompts/execplan-execution-loop.md",
			]),
		);

		const readme = renderedFiles.find((file) => file.path === "docs/README.md");
		const marketingReadme = renderedFiles.find(
			(file) => file.path === "docs/marketing/README.md",
		);
		const buildPrompt = renderedFiles.find(
			(file) => file.path === "docs/build/docs/prompt.md",
		);
		const executionLoopPrompt = renderedFiles.find(
			(file) => file.path === "docs/prompts/execplan-execution-loop.md",
		);
		const outlinePrompt = renderedFiles.find(
			(file) => file.path === "docs/prompts/execplan-outline-from-session.md",
		);

		expect(readme?.content).toContain("Agent-Ready Packs");
		expect(readme?.content).toContain("Design Pack");
		expect(readme?.content).toContain("Prompt Pack");
		expect(marketingReadme?.content).toContain("Marketing Pack");
		expect(buildPrompt?.content).toContain("Build Pack");
		expect(outlinePrompt?.content).toContain("# ExecPlan Outline From Session");
		expect(executionLoopPrompt?.content).toContain("# ExecPlan Execution Loop");
	});

	it("renders a reduced intake into the same repo output tree", async () => {
		const renderedFiles = await renderFullBlueprintTree(
			createCompleteProjectDefinition({
				facts: {
					product_name: "Ship by Sunday OS",
					product_summary: "Blueprint-first runtime",
					primary_user: "Founders",
					problem_statement: "Planning stays vague",
					problem_trigger:
						"They need a clear blueprint and repo handoff immediately.",
					problem_severity: "8",
					success_looks_like:
						"A founder downloads a working blueprint and repo zip.",
					core_flow: [
						"Capture product facts",
						"Unlock blueprints",
						"Download repo",
					],
					pricing: 29,
				},
			}),
		);
		const factsJson = renderedFiles.find(
			(file) => file.path === "docs/facts/project-definition.json",
		);
		const readme = renderedFiles.find((file) => file.path === "docs/README.md");

		expect(factsJson?.content).toContain(
			`"design_preset_id": "${DEFAULT_DESIGN_PRESET_ID}"`,
		);
		expect(factsJson?.content).toContain(
			`"theme_preset": "${buildDesignPresetFactSeed(DEFAULT_DESIGN_PRESET_ID).theme_preset}"`,
		);
		expect(factsJson?.content).toContain('"price_usd_cents": 2900');
		expect(readme?.content).toContain("Agent-Ready Packs");
		expect(readme?.content).toContain("repo zip");
	});
});
