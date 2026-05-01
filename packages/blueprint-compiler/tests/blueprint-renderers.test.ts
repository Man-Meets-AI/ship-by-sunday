import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
	createCompleteProjectDefinition,
} from "../src";
import { renderFullBlueprintTree } from "../src/server";

function findRenderedContent(
	renderedFiles: Awaited<ReturnType<typeof renderFullBlueprintTree>>,
	path: string,
) {
	const renderedFile = renderedFiles.find((file) => file.path === path);

	expect(renderedFile).toBeDefined();

	return renderedFile?.content ?? "";
}

const unresolvedPlaceholderPattern =
	/\[(?! )[A-Z][^\]\n]*\]|\[[^\]\n]*\.\.\.[^\]\n]*\]/;

describe("blueprint renderers", () => {
	it("renders the expected blueprint tree", async () => {
		const renderedFiles = await renderFullBlueprintTree(
			createCompleteProjectDefinition(),
		);
		const renderedPaths = renderedFiles.map((file) => file.path);

		expect(renderedPaths).toEqual(
			expect.arrayContaining([
				"docs/index.md",
				"docs/facts/project-definition.json",
				"docs/design/AGENTS.md",
				"docs/marketing/README.md",
				"docs/build/docs/agent-handoff.md",
				"docs/build/docs/prompt.md",
				"docs/prompts/execplan-outline-from-session.md",
				"docs/prompts/execplan-execution-loop.md",
			]),
		);

		const readme = renderedFiles.find((file) => file.path === "docs/index.md");
		const marketingReadme = renderedFiles.find(
			(file) => file.path === "docs/marketing/README.md",
		);
		const buildPrompt = renderedFiles.find(
			(file) => file.path === "docs/build/docs/prompt.md",
		);
		const agentHandoff = renderedFiles.find(
			(file) => file.path === "docs/build/docs/agent-handoff.md",
		);
		const buildPlans = renderedFiles.find(
			(file) => file.path === "docs/build/docs/plans.md",
		);
		const buildDocumentation = renderedFiles.find(
			(file) => file.path === "docs/build/docs/documentation.md",
		);
		const buildImplement = renderedFiles.find(
			(file) => file.path === "docs/build/docs/implement.md",
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
		expect(buildPrompt?.content).toContain("## Product Fact Inputs");
		expect(buildPrompt?.content).toContain("### Scope in");
		expect(buildPrompt?.content).toContain("- Blueprint-first funnel");
		expect(buildPrompt?.content).toContain("## Authority Order");
		expect(buildPrompt?.content).toContain("## Completion Audit Checklist");
		expect(agentHandoff?.content).toContain(
			"# Ship by Sunday OS Agent Handoff",
		);
		expect(agentHandoff?.content).toContain("## Start Prompt");
		expect(buildPlans?.content).toContain("## Milestone Map");
		expect(buildPlans?.content).toContain(
			"M1 - Bootstrap the compiler and canonical schema.",
		);
		expect(buildDocumentation?.content).toContain(
			"## Requirement-To-Evidence Checklist",
		);
		expect(buildImplement?.content).toContain("## Preflight Checklist");
		expect(buildImplement?.content).toContain("## Customer Question Gate");
		expect(outlinePrompt?.content).toContain("# ExecPlan Outline From Session");
		expect(executionLoopPrompt?.content).toContain("# ExecPlan Execution Loop");
	});

	it("renders a self-contained customer build pack without critical placeholders", async () => {
		const renderedFiles = await renderFullBlueprintTree(
			createCompleteProjectDefinition(),
		);
		const criticalBuildDocs = [
			findRenderedContent(renderedFiles, "docs/build/docs/agent-handoff.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/prompt.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/plans.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/implement.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/documentation.md"),
		];
		const agentHandoff = criticalBuildDocs[0] ?? "";
		const buildPrompt = criticalBuildDocs[1] ?? "";
		const buildPlans = criticalBuildDocs[2] ?? "";
		const buildImplement = criticalBuildDocs[3] ?? "";
		const buildDocumentation = criticalBuildDocs[4] ?? "";

		for (const content of criticalBuildDocs) {
			expect(content).not.toContain("## Base Template");
			expect(content).not.toMatch(unresolvedPlaceholderPattern);
		}

		expect(buildPrompt).toContain(
			"- Task name: Bootstrap the compiler and canonical schema.",
		);
		expect(agentHandoff).toContain("## Required Source Files");
		expect(agentHandoff).toContain("## Required Completion Evidence");
		expect(agentHandoff).toContain(
			"Build M1 for Ship by Sunday OS: Bootstrap the compiler and canonical schema.",
		);
		expect(buildPrompt).toContain("## Copy-Ready Agent Prompt");
		expect(buildPrompt).toContain(
			"Build M1 for Ship by Sunday OS: Bootstrap the compiler and canonical schema.",
		);
		expect(buildPrompt).toContain(
			"- Existing checks to start from: Run compiler tests; Run app build; Run blueprint-flow integration tests",
		);
		expect(buildPrompt).toContain(
			"bun run --cwd packages/blueprint-compiler test",
		);
		expect(buildPrompt).toContain("bun run build");
		expect(buildPlans).toContain(
			"| M1 - Bootstrap the compiler and canonical schema. | A buyer can move through the funnel and download a repo zip.",
		);
		expect(buildPlans).toContain("bun run test:integration");
		expect(buildImplement).toContain("## Source Of Truth");
		expect(buildImplement).toContain("## Preflight Checklist");
		expect(buildImplement).toContain("## Suggested Validation Commands");
		expect(buildImplement).toContain(
			"Confirm M1 is active: Bootstrap the compiler and canonical schema.",
		);
		expect(buildDocumentation).toContain(
			"- Current milestone: Bootstrap the compiler and canonical schema.",
		);
		expect(buildDocumentation).toContain(
			"| Blueprint compiler | Pending first implementation diff | Not started | |",
		);
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
		const readme = renderedFiles.find((file) => file.path === "docs/index.md");

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
