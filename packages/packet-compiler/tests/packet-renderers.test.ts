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
				"packet/README.md",
				"packet/facts/project-definition.json",
				"packet/design/AGENTS.md",
				"packet/marketing/README.md",
				"packet/build/docs/prompt.md",
				"packet/prompts/deploy.md",
			]),
		);

		const readme = renderedFiles.find(
			(file) => file.path === "packet/README.md",
		);
		const marketingReadme = renderedFiles.find(
			(file) => file.path === "packet/marketing/README.md",
		);
		const buildPrompt = renderedFiles.find(
			(file) => file.path === "packet/build/docs/prompt.md",
		);
		const deployPrompt = renderedFiles.find(
			(file) => file.path === "packet/prompts/deploy.md",
		);

		expect(readme?.content).toContain("Agent-Ready Packs");
		expect(readme?.content).toContain("Design Pack");
		expect(readme?.content).toContain("Prompt Pack");
		expect(marketingReadme?.content).toContain("Marketing Pack");
		expect(buildPrompt?.content).toContain("Build Pack");
		expect(deployPrompt?.content).toContain("Prompt Pack");
		expect(deployPrompt?.content).toContain("## Deploy Prompt");
	});
});
