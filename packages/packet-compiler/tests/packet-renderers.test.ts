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
	});
});
