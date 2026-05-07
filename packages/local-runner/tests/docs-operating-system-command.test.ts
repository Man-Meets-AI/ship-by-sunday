import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { runDocsOperatingSystemCommand } from "../src/commands/docs-operating-system";
import { createTemporaryDirectory } from "./test-utils";

describe("docs operating-system command", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("runs markdown lint against a target repo path", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writeRepoFile(
			repositoryRoot,
			"docs/index.md",
			[
				"---",
				"title: Docs Index",
				"summary: First-hop map for the target repository.",
				"docType: readme",
				"status: active",
				"read_when:",
				"  - Reading the target docs index.",
				"---",
				"",
				"# Docs Index",
				"",
				"Use this docs index as the first hop.",
				"",
			].join("\n"),
		);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"markdown-lint",
				"--repo",
				repositoryRoot,
				"--paths",
				"docs/index.md",
			]),
		).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain("docs/index.md: ok");
	});

	it("runs ExecPlan lint through the shared command", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		const planPath = "docs/exec-plans/active/2026-05-06-valid-command-plan.md";
		await writeRepoFile(
			repositoryRoot,
			planPath,
			buildValidExecPlan({
				createdAt: "2026-05-06",
				planPath,
				summary:
					"Validate a minimal active ExecPlan through the package command.",
				title: "Valid Command Plan",
			}),
		);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"exec-plans-lint",
				"--repo",
				repositoryRoot,
				"--plan",
				planPath,
			]),
		).resolves.toBe(0);

		expect(logSpy.mock.calls.join("\n")).toContain(`${planPath}: ok`);
	});

	it("returns a failing docs validation result for invalid docs", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writeRepoFile(
			repositoryRoot,
			"docs/index.md",
			"# Docs Index\n\nThis file is missing required frontmatter.\n",
		);
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"docs-validate",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Markdown docs");
		expect(output).toContain("Missing YAML frontmatter block");
		expect(output).toContain("Missing docs/programs.");
	});

	it("creates one Program-linked child ExecPlan and refuses overwrite", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		const programRoot = "docs/programs/active/2026-05-06-command-program";
		await writeRepoFile(
			repositoryRoot,
			`${programRoot}/planning-brief-1.md`,
			[
				"---",
				"title: Command Program Brief",
				"program_id: command-program",
				"brief_version: 1",
				"status: current",
				"summary: Brief for command Program.",
				"read_when:",
				"  - Creating child plans.",
				"---",
				"",
				"# Command Program Brief",
				"",
			].join("\n"),
		);
		await writeRepoFile(
			repositoryRoot,
			`${programRoot}/current-planning-brief.txt`,
			"planning-brief-1.md\n",
		);
		const planPath = "docs/exec-plans/active/2026-05-06-command-child-plan.md";
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"write-child-plan",
				"--repo",
				repositoryRoot,
				"--program-id",
				"command-program",
				"--plan",
				planPath,
				"--title",
				"Command Child Plan",
				"--summary",
				"Create one child plan through the shared docs command.",
			]),
		).resolves.toBe(0);

		const createdPlan = await readFile(
			path.join(repositoryRoot, planPath),
			"utf8",
		);
		expect(createdPlan).toContain("program_id: command-program");
		expect(createdPlan).toContain(
			"planning_brief: docs/programs/active/2026-05-06-command-program/planning-brief-1.md",
		);
		expect(logSpy.mock.calls.join("\n")).toContain(`Created ${planPath}`);

		await expect(
			runDocsOperatingSystemCommand([
				"exec-plans-lint",
				"--repo",
				repositoryRoot,
				"--plan",
				planPath,
			]),
		).resolves.toBe(0);

		await expect(
			runDocsOperatingSystemCommand([
				"write-child-plan",
				"--repo",
				repositoryRoot,
				"--program-id",
				"command-program",
				"--plan",
				planPath,
				"--title",
				"Command Child Plan",
				"--summary",
				"Create one child plan through the shared docs command.",
			]),
		).rejects.toThrow(`Refusing to overwrite existing ExecPlan: ${planPath}`);
	});

	it("rejects child-plan paths that traverse outside the active ExecPlan root", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		const programRoot = "docs/programs/active/2026-05-06-command-program";
		await writeRepoFile(
			repositoryRoot,
			`${programRoot}/planning-brief-1.md`,
			[
				"---",
				"title: Command Program Brief",
				"program_id: command-program",
				"brief_version: 1",
				"status: current",
				"summary: Brief for command Program.",
				"read_when:",
				"  - Creating child plans.",
				"---",
				"",
				"# Command Program Brief",
				"",
			].join("\n"),
		);
		await writeRepoFile(
			repositoryRoot,
			`${programRoot}/current-planning-brief.txt`,
			"planning-brief-1.md\n",
		);
		const maliciousPlanPath =
			"docs/exec-plans/active/2026-05-06-x/../../../../outside.md";

		await expect(
			runDocsOperatingSystemCommand([
				"write-child-plan",
				"--repo",
				repositoryRoot,
				"--program-id",
				"command-program",
				"--plan",
				maliciousPlanPath,
				"--title",
				"Escaped Plan",
				"--summary",
				"This should not be created outside the active plan root.",
			]),
		).rejects.toThrow(
			"write-child-plan requires a normalized repo-relative ExecPlan path",
		);
		await expect(
			readFile(path.join(repositoryRoot, "outside.md"), "utf8"),
		).rejects.toThrow();
	});

	it("refreshes quality score evidence and returns validation status", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"docs-refresh-quality",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const qualityScore = await readFile(
			path.join(repositoryRoot, "docs/QUALITY_SCORE.md"),
			"utf8",
		);
		expect(qualityScore).toContain("## Current Score");
		expect(qualityScore).toContain("`not scored`");
		expect(qualityScore).toContain("## QUALITY_SCORE.review");
		expect(qualityScore).toContain(
			"`ship-by-sunday docs-operating-system docs-validate`: failed",
		);
		expect(qualityScore).toContain(
			"Evidence refs: `docs/`, `docs/programs/`, `docs/exec-plans/active/`",
		);
		expect(qualityScore).toContain("Missing docs/programs.");
		expect(qualityScore).not.toContain(repositoryRoot);
		expect(logSpy.mock.calls.join("\n")).toContain(
			"Refreshed docs/QUALITY_SCORE.md.",
		);
	});

	it("preserves owner quality content and replaces the managed refresh block", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writeRepoFile(
			repositoryRoot,
			"docs/QUALITY_SCORE.md",
			[
				"---",
				"title: Quality Score",
				"summary: Owner-authored quality notes for this target repository.",
				"docType: guide",
				"status: active",
				"read_when:",
				"  - Reviewing owner quality notes.",
				"---",
				"",
				"# Quality Score",
				"",
				"Owner-authored quality note.",
				"",
				QUALITY_REFRESH_START_FIXTURE,
				"stale managed evidence",
				QUALITY_REFRESH_END_FIXTURE,
				"",
			].join("\n"),
		);
		vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"docs-refresh-quality",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);
		await expect(
			runDocsOperatingSystemCommand([
				"docs-refresh-quality",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const qualityScore = await readFile(
			path.join(repositoryRoot, "docs/QUALITY_SCORE.md"),
			"utf8",
		);
		expect(qualityScore).toContain("Owner-authored quality note.");
		expect(qualityScore).not.toContain("stale managed evidence");
		expect(qualityScore.match(/sbs-docs-quality-refresh:start/g)).toHaveLength(
			1,
		);
		expect(qualityScore.match(/sbs-docs-quality-refresh:end/g)).toHaveLength(1);
		expect(qualityScore).not.toContain(repositoryRoot);
	});

	it("runs the selected repo-native command proof", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			gate: 'node -e "if (process.env.SECRET_SCRIPT_BODY_SHOULD_NOT_SYNC) process.exit(1)"',
			lint: 'node -e "process.exit(1)"',
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(0);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: npm run gate");
		expect(output).toContain("Status: passed");
		expect(output).not.toContain("SECRET_SCRIPT_BODY_SHOULD_NOT_SYNC");
		expect(output).not.toContain(repositoryRoot);
	});

	it("classifies native setup failures as blocked proof", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			gate: "node -e \"console.error('Cannot find package happy-dom'); process.exit(1)\"",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: npm run gate");
		expect(output).toContain("Status: blocked");
		expect(output).toContain("happy-dom");
		expect(output).not.toContain(repositoryRoot);
	});

	it("classifies ordinary native command failures as failed proof", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			gate: "node -e \"console.error('assertion failed'); process.exit(1)\"",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: npm run gate");
		expect(output).toContain("Status: failed");
		expect(output).toContain("assertion failed");
	});

	it("keeps not-found assertion text as failed native proof", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			gate: "node -e \"console.error('not found: expected route'); process.exit(1)\"",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: npm run gate");
		expect(output).toContain("Status: failed");
		expect(output).toContain("not found: expected route");
	});

	it("does not print Bun native script bodies", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			gate: "node -e \"if (process.env.SECRET_BUN_SCRIPT_BODY_SHOULD_NOT_SYNC) process.exit(2); console.error('assertion failed'); process.exit(1)\"",
		});
		await writeRepoFile(repositoryRoot, "bun.lock", "");
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: bun run gate");
		expect(output).toContain("Status: failed");
		expect(output).toContain("assertion failed");
		expect(output).not.toContain("SECRET_BUN_SCRIPT_BODY_SHOULD_NOT_SYNC");
	});

	it("blocks native command proof when lifecycle hooks would run", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			pregate:
				"node -e \"require('node:fs').writeFileSync('prehook.txt', 'ran')\"",
			gate: "node -e \"require('node:fs').writeFileSync('gate.txt', 'ran')\"",
			postgate:
				"node -e \"require('node:fs').writeFileSync('posthook.txt', 'ran')\"",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: none");
		expect(output).toContain("Status: blocked");
		expect(output).toContain("pregate, postgate");
		await expect(
			readFile(path.join(repositoryRoot, "gate.txt"), "utf8"),
		).rejects.toThrow();
		await expect(
			readFile(path.join(repositoryRoot, "prehook.txt"), "utf8"),
		).rejects.toThrow();
		await expect(
			readFile(path.join(repositoryRoot, "posthook.txt"), "utf8"),
		).rejects.toThrow();
	});

	it("blocks native command proof when no recognized script exists", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-docs-command-");
		await writePackageManifest(repositoryRoot, {
			start: "node server.js",
		});
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

		await expect(
			runDocsOperatingSystemCommand([
				"native-command-proof",
				"--repo",
				repositoryRoot,
			]),
		).resolves.toBe(1);

		const output = logSpy.mock.calls.join("\n");
		expect(output).toContain("Native command: none");
		expect(output).toContain("Status: blocked");
		expect(output).toContain("No recognized native validation script");
		expect(output).not.toContain("node server.js");
	});
});

const QUALITY_REFRESH_START_FIXTURE = "<!-- sbs-docs-quality-refresh:start -->";
const QUALITY_REFRESH_END_FIXTURE = "<!-- sbs-docs-quality-refresh:end -->";

async function writeRepoFile(
	repositoryRoot: string,
	repoPath: string,
	content: string,
) {
	const absolutePath = path.join(repositoryRoot, repoPath);
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, content, "utf8");
}

async function writePackageManifest(
	repositoryRoot: string,
	scripts: Record<string, string>,
) {
	await writeRepoFile(
		repositoryRoot,
		"package.json",
		`${JSON.stringify({ scripts }, null, 2)}\n`,
	);
}

function buildValidExecPlan(params: {
	createdAt: string;
	planPath: string;
	summary: string;
	title: string;
}) {
	return [
		"---",
		`title: ${params.title}`,
		"status: active",
		`created_at: ${params.createdAt}`,
		"completed_at: null",
		`summary: ${params.summary}`,
		"post_build_recap: null",
		"read_when:",
		"  - Resuming implementation.",
		"---",
		"",
		`# ${params.title}`,
		"",
		"This document is a living execution plan for a focused command test.",
		"",
		"This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		params.summary,
		"",
		"## Progress",
		"",
		`- [ ] ${params.createdAt}: Created a minimal active plan for command validation.`,
		"",
		"## Surprises & Discoveries",
		"",
		"No surprises have been recorded yet.",
		"",
		"## Decision Log",
		"",
		"Decision: Keep this fixture plan minimal.",
		"Rationale: The command test only needs a contract-valid plan.",
		`Date: ${params.createdAt}`,
		"",
		"## Outcomes & Retrospective",
		"",
		"This plan is active and has no final retrospective yet.",
		"",
		"## Context and Orientation",
		"",
		"This fixture plan exists only inside a temporary command-test repository.",
		"",
		"### In Scope",
		"",
		"Validate that the shared command can lint a contract-valid active ExecPlan.",
		"",
		"### Out Of Scope",
		"",
		"Do not use this fixture for production implementation guidance.",
		"",
		"## Plan of Work",
		"",
		"Write a minimal plan, run the shared linter command, and assert the result.",
		"",
		"## Milestones",
		"",
		"Milestone one is the successful lint result for this active plan.",
		"",
		"## Concrete Steps",
		"",
		"Run the focused command from the temporary repository root.",
		"",
		`    bun run plans:lint -- --plan ${params.planPath}`,
		"",
		"## Validation and Acceptance",
		"",
		"Acceptance requires the ExecPlan linter to report this fixture as ok.",
		"",
		"### Test Commands",
		"",
		`- bun run plans:lint -- --plan ${params.planPath}`,
		"",
		"## Idempotence and Recovery",
		"",
		"The fixture can be recreated in a new temporary directory for each test run.",
		"",
		"## Artifacts and Notes",
		"",
		"The command output should contain this plan path followed by ok.",
		"",
		"## Interfaces and Dependencies",
		"",
		"This fixture depends on the shared ExecPlan lint command.",
		"",
	].join("\n");
}
