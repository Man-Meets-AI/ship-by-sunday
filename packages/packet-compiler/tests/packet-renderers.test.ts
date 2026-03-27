import { createCompleteProjectDefinition } from "../src";
import { renderFullPacketTree } from "../src/server";

describe("packet renderers", () => {
	it("renders the expected packet tree", async () => {
		const renderedFiles = await renderFullPacketTree(
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

		expect(readme?.content).toContain("Agent-Ready Packs");
		expect(readme?.content).toContain("Design Pack");
		expect(readme?.content).toContain("Prompt Pack");
		expect(marketingReadme?.content).toContain("Marketing Pack");
		expect(buildPrompt?.content).toContain("Build Pack");
		expect(executionLoopPrompt?.content).toContain("# ExecPlan Execution Loop");
	});
});
