import {
	DEFAULT_DESIGN_PRESET_ID,
	buildDesignPresetFactSeed,
	createCanonicalProjectDefinition,
	createCompleteProjectDefinition,
} from "../src";
import { renderFullCodebaseTree } from "../src/server";

function findRenderedContent(
	renderedFiles: Awaited<ReturnType<typeof renderFullCodebaseTree>>,
	path: string,
) {
	const renderedFile = renderedFiles.find((file) => file.path === path);

	expect(renderedFile).toBeDefined();

	return renderedFile?.content ?? "";
}

function splitMarkdownTableRow(row: string) {
	return row
		.trim()
		.replace(/^\|/, "")
		.replace(/\|$/, "")
		.split("|")
		.map((cell) => cell.trim());
}

function parseMarkdownTable(content: string, firstHeader: string) {
	const lines = content.split("\n");
	const headerIndex = lines.findIndex(
		(line) =>
			line.startsWith("|") && splitMarkdownTableRow(line)[0] === firstHeader,
	);

	expect(headerIndex).toBeGreaterThanOrEqual(0);

	const headers = splitMarkdownTableRow(lines[headerIndex] ?? "");
	const rows: Record<string, string>[] = [];

	for (const line of lines.slice(headerIndex + 2)) {
		if (!line.startsWith("|")) {
			break;
		}

		const cells = splitMarkdownTableRow(line);
		rows.push(
			Object.fromEntries(
				headers.map((header, index) => [header, cells[index] ?? ""]),
			),
		);
	}

	return rows;
}

const unresolvedPlaceholderPattern =
	/\[(?! )[A-Z][^\]\n]*\]|\[[^\]\n]*\.\.\.[^\]\n]*\]/;

describe("codebase renderers", () => {
	it("renders the expected codebase tree", async () => {
		const renderedFiles = await renderFullCodebaseTree(
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
				"docs/build/docs/readiness.md",
				"docs/build/docs/review.md",
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
		const buildReadiness = renderedFiles.find(
			(file) => file.path === "docs/build/docs/readiness.md",
		);
		const buildReview = renderedFiles.find(
			(file) => file.path === "docs/build/docs/review.md",
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

		expect(readme?.content).toContain("Codebase Materials");
		expect(readme?.content).toContain("Design Pack");
		expect(readme?.content).toContain("Prompt Pack");
		expect(marketingReadme?.content).toContain("Marketing Pack");
		expect(buildPrompt?.content).toContain("Build Pack");
		expect(buildPrompt?.content).toContain("## Product Fact Inputs");
		expect(buildPrompt?.content).toContain("### Scope in");
		expect(buildPrompt?.content).toContain("- Codebase-first funnel");
		expect(buildPrompt?.content).toContain("## Authority Order");
		expect(buildPrompt?.content).toContain("## Completion Audit Checklist");
		expect(agentHandoff?.content).toContain(
			"# Ship by Sunday OS Agent Handoff",
		);
		expect(agentHandoff?.content.indexOf("## Readiness First")).toBeLessThan(
			agentHandoff?.content.indexOf("## Start Prompt") ??
				Number.MAX_SAFE_INTEGER,
		);
		expect(agentHandoff?.content).toContain("docs/build/docs/readiness.md");
		expect(agentHandoff?.content).toContain("## Start Prompt");
		expect(buildReadiness?.content).toContain(
			"# Ship by Sunday OS Build Pack Readiness",
		);
		expect(buildReadiness?.content).toContain("## Derived First Slice Plan");
		expect(buildReadiness?.content).toContain("## Starter File Reading Order");
		expect(buildReadiness?.content).toContain("docs/build/docs/review.md");
		expect(buildReadiness?.content).toContain("## Validation Manifest");
		expect(buildReadiness?.content).toContain(
			"| Run Codebase contract check | runnable | `codebase:contract` | `bun run codebase:contract` |",
		);
		expect(buildReadiness?.content).toContain(
			"| Run generated operating pack check | runnable | `agentic:check` | `bun run agentic:check` |",
		);
		expect(buildReadiness?.content).toContain("## Customer Input Work");
		expect(buildReadiness?.content).toContain("Confidence state:");
		expect(buildReview?.content).toContain(
			"# Ship by Sunday OS Review And Verification Pack",
		);
		expect(buildReview?.content).toContain("## Review Prompt");
		expect(buildReview?.content).toContain("## Verification Personas");
		expect(buildReview?.content).toContain("## Regression Checks");
		expect(buildReview?.content).toContain("## Evidence Table");
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
		const renderedFiles = await renderFullCodebaseTree(
			createCompleteProjectDefinition(),
		);
		const criticalBuildDocs = [
			findRenderedContent(renderedFiles, "docs/build/docs/agent-handoff.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/readiness.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/review.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/prompt.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/plans.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/implement.md"),
			findRenderedContent(renderedFiles, "docs/build/docs/documentation.md"),
		];
		const agentHandoff = criticalBuildDocs[0] ?? "";
		const buildReadiness = criticalBuildDocs[1] ?? "";
		const buildReview = criticalBuildDocs[2] ?? "";
		const buildPrompt = criticalBuildDocs[3] ?? "";
		const buildPlans = criticalBuildDocs[4] ?? "";
		const buildImplement = criticalBuildDocs[5] ?? "";
		const buildDocumentation = criticalBuildDocs[6] ?? "";

		for (const content of criticalBuildDocs) {
			expect(content).not.toContain("## Base Template");
			expect(content).not.toMatch(unresolvedPlaceholderPattern);
		}

		expect(buildPrompt).toContain(
			"- Task name: Bootstrap the compiler and canonical schema.",
		);
		expect(agentHandoff).toContain("## Required Source Files");
		expect(agentHandoff).toContain("## Required Completion Evidence");
		expect(agentHandoff).toContain("## Readiness First");
		expect(agentHandoff).toContain(
			"Build M1 for Ship by Sunday OS: Bootstrap the compiler and canonical schema.",
		);
		expect(buildReadiness).toContain("## Readiness Verdict");
		expect(buildReadiness).toContain("## Blockers");
		expect(buildReadiness).toContain("## Derived First Slice Plan");
		expect(buildReadiness).toContain("## Starter File Reading Order");
		expect(buildReadiness).toContain("| Domain | `domain` | placeholder |");
		expect(buildReadiness).toContain(
			"| Contact email | `contact_email` | placeholder |",
		);
		expect(buildReadiness).toContain(
			"| Support email | `support_email` | placeholder |",
		);
		expect(buildReview).toContain("## Review Prompt");
		expect(buildReview).toContain("## Verification Personas");
		expect(buildReview).toContain("docs/testing/run-report.md");
		expect(buildReview).toContain("## Expected Demo Proof");
		expect(buildReview).toContain("## Regression Checks");
		expect(buildReview).toContain("## Evidence Table");
		expect(buildPrompt).toContain("## Copy-Ready Agent Prompt");
		expect(buildPrompt).toContain(
			"Build M1 for Ship by Sunday OS: Bootstrap the compiler and canonical schema.",
		);
		expect(buildPrompt).toContain(
			"- Existing checks to start from: Run Codebase contract check; Run generated operating pack check",
		);
		expect(buildPrompt).toContain("bun run codebase:contract");
		expect(buildPrompt).toContain("bun run agentic:check");
		expect(buildPlans).toContain(
			"| M1 - Bootstrap the compiler and canonical schema. | A buyer can move through the funnel and download a Codebase zip.",
		);
		expect(buildPlans).not.toContain("bun run test:integration");
		expect(buildImplement).toContain("## Source Of Truth");
		expect(buildImplement).toContain("## Preflight Checklist");
		expect(buildImplement).toContain("## Typed Validation Manifest");
		expect(buildImplement).toContain(
			"Confirm M1 is active: Bootstrap the compiler and canonical schema.",
		);
		expect(buildDocumentation).toContain(
			"- Current milestone: Bootstrap the compiler and canonical schema.",
		);
		expect(buildDocumentation).toContain(
			"| Codebase compiler | Pending first implementation diff | Not started | |",
		);

		const validationRows = parseMarkdownTable(
			buildReadiness,
			"Source validation step",
		);
		expect(validationRows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					"Source validation step": "Run Codebase contract check",
					Type: "runnable",
					"Package script": "`codebase:contract`",
					"Proof path": "`bun run codebase:contract`",
				}),
				expect.objectContaining({
					"Source validation step": "Run generated operating pack check",
					Type: "runnable",
					"Package script": "`agentic:check`",
					"Proof path": "`bun run agentic:check`",
				}),
			]),
		);
	});

	it("renders a reduced intake into the same repo output tree", async () => {
		const renderedFiles = await renderFullCodebaseTree(
			createCompleteProjectDefinition({
				facts: {
					product_name: "Ship by Sunday OS",
					product_summary: "Codebase-first runtime",
					primary_user: "Founders",
					problem_statement: "Planning stays vague",
					problem_trigger:
						"They need a clear codebase and repo handoff immediately.",
					problem_severity: "8",
					success_looks_like: "A founder downloads a working Codebase zip.",
					core_flow: [
						"Capture product facts",
						"Unlock codebases",
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
		expect(readme?.content).toContain("Codebase Materials");
		expect(readme?.content).toContain("Codebase zip");
	});

	it("renders reduced readiness with blocked validation and visible customer-input work", async () => {
		const renderedFiles = await renderFullCodebaseTree(
			createCanonicalProjectDefinition({
				clerkUserId: "user_123",
				productKey: "ship-by-sunday",
				facts: {
					product_name: "Field Ops Portal",
					product_summary: "A dispatch workspace for field teams.",
					primary_user: "Field operators",
					problem_statement: "Dispatch notes are scattered across tools.",
					problem_trigger:
						"Operators need one place to see the next job and proof.",
					problem_severity: "7",
					success_looks_like:
						"A dispatcher sees the next job, status, and proof needs.",
					core_flow: ["Pick next job", "Update status", "Capture proof"],
					pricing: 99,
					validation_plan: ["Confirm customer proof workflow"],
					selected_next_slice: "M1",
					design_references: ["https://example.com/reference"],
					open_questions: ["Which proof source is legally required?"],
				},
				placeholdersInUse: ["domain", "contact_email", "support_email"],
				createdAt: 1,
				updatedAt: 1,
			}),
		);
		const readiness = findRenderedContent(
			renderedFiles,
			"docs/build/docs/readiness.md",
		);

		expect(readiness).toContain("- Confidence state: blocked");
		expect(readiness).toContain(
			"| Confirm customer proof workflow | blocked |",
		);
		expect(readiness).toContain("| Domain | `domain` | missing |");
		expect(readiness).toContain(
			"| Contact email | `contact_email` | missing |",
		);
		expect(readiness).toContain(
			"| Support email | `support_email` | missing |",
		);
		expect(readiness).toContain("## Weak Fact Warnings");
		expect(readiness).toContain("https://example.com/reference");
		expect(readiness).not.toContain("# Confirm customer proof workflow");
	});
});
