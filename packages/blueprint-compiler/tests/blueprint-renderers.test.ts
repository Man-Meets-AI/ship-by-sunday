import { createCompleteProjectDefinition } from "../src";
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
});
