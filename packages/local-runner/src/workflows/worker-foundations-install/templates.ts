import type { ManagedFileTemplate, RootPackageManager } from "./types";
import type { WorkerFoundationsRootScript } from "./manifest";
import { WORKER_FOUNDATIONS_BUNDLE_VERSION } from "./manifest";
import {
	ROOT_AGENT_END,
	ROOT_AGENT_START,
	SHIP_BY_SUNDAY_RUNNER_PACKAGE_SPEC,
	STARTER_PROGRAM_ROOT,
	WORKER_MANIFEST_MANAGED_REFS,
} from "./constants";
import { buildPrivacyBoundary } from "./privacy";

export function buildManagedFiles(
	packageManager: RootPackageManager,
): ManagedFileTemplate[] {
	return [
		{
			targetRef: "scripts/run-worker.sh",
			content: runWorkerShellScript(),
			executable: true,
		},
		{ targetRef: "apps/worker/package.json", content: workerPackageJson() },
		{
			targetRef: "apps/worker/worker-manifest.json",
			content: workerManifestJson(),
		},
		{ targetRef: "apps/worker/src/worker-cli.mjs", content: workerCliSource() },
		{
			targetRef: "apps/worker/tests/smoke.test.mjs",
			content: workerSmokeTestSource(),
		},
		{
			targetRef: "README.md",
			content: rootReadmeMd(packageManager),
			managedSection: true,
		},
		{
			targetRef: "AGENTS.md",
			content: rootAgentsMd(packageManager),
			managedSection: true,
		},
		{ targetRef: "docs/programs/AGENTS.md", content: programsAgentsMd() },
		{ targetRef: "docs/exec-plans/AGENTS.md", content: execPlansAgentsMd() },
		{ targetRef: "docs/prompts/AGENTS.md", content: promptsAgentsMd() },
		{
			targetRef: "docs/programs/PROGRAMS.md",
			content: programsContractMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/exec-plans/PLANS.md",
			content: execPlansContractMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/prompts/README.md",
			content: promptsReadmeMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/programs/active/index.md",
			content: activeProgramsIndexMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/programs/completed/index.md",
			content: completedProgramsIndexMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/exec-plans/active/index.md",
			content: activeExecPlansIndexMd(),
			preserveIfExists: true,
		},
		{
			targetRef: "docs/exec-plans/completed/index.md",
			content: completedExecPlansIndexMd(),
			preserveIfExists: true,
		},
		{ targetRef: ".worker/.gitignore", content: "*\n!.gitignore\n" },
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/program.md`,
			content: starterProgramMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/research-pass-worker-foundations.md`,
			content: starterResearchPassMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/normalized-pass-worker-foundations.md`,
			content: starterNormalizedPassMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/converged-decision-packet.md`,
			content: starterDecisionPacketMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/dependency-graph.md`,
			content: starterDependencyGraphMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/plan-split-recommendation.md`,
			content: starterPlanSplitMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/cross-repo-review.md`,
			content: starterCrossRepoReviewMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/planning-brief-1.md`,
			content: starterPlanningBriefMd(),
		},
		{
			targetRef: `${STARTER_PROGRAM_ROOT}/current-planning-brief.txt`,
			content: "planning-brief-1.md\n",
		},
	];
}

export function requiredManagedFileRefs(
	packageManager: RootPackageManager,
): string[] {
	return buildManagedFiles(packageManager).map((file) => file.targetRef);
}

export function expectedScriptCommand(scriptName: WorkerFoundationsRootScript) {
	const workerScript = scriptName === "worker:test" ? "test" : scriptName;
	return `./scripts/run-worker.sh ${workerScript}`;
}

export function packageRunCommand(
	packageManager: RootPackageManager,
	scriptName: WorkerFoundationsRootScript,
) {
	return `${packageManager} run ${scriptName}`;
}

export function recognizeWorkerScriptCommand(
	scriptName: WorkerFoundationsRootScript,
	currentScript: string,
) {
	const normalizedScript = normalizeScriptCommand(currentScript);
	if (normalizedScript === expectedScriptCommand(scriptName)) {
		return "keep" as const;
	}
	if (scriptName === "worker:test") {
		return "blocked" as const;
	}
	const legacyRuntimeScript = `./scripts/run-runtime.sh ${scriptName}`;
	if (
		normalizedScript === legacyRuntimeScript ||
		normalizedScript === legacyRuntimeScript.slice(2)
	) {
		return "update-managed" as const;
	}
	return "blocked" as const;
}

function normalizeScriptCommand(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

function runWorkerShellScript() {
	return [
		"#!/bin/sh",
		"set -eu",
		'SCRIPT_DIR="${0%/*}"',
		'if [ "$SCRIPT_DIR" = "$0" ]; then',
		'  SCRIPT_DIR="."',
		"fi",
		'REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"',
		'NODE_BIN="${NODE:-node}"',
		'if ! command -v "$NODE_BIN" >/dev/null 2>&1; then',
		'  echo "Shipbysunday Worker requires Node on PATH." >&2',
		"  exit 127",
		"fi",
		'case "$NODE_BIN" in',
		'  */*) NODE_DIR="${NODE_BIN%/*}"; PATH="${PATH:+$PATH:}$NODE_DIR"; export PATH ;;',
		"esac",
		'cd "$REPO_ROOT/apps/worker"',
		'case "${1:-}" in',
		'  ""|--help|-h)',
		'    exec "$NODE_BIN" src/worker-cli.mjs --help',
		"    ;;",
		"esac",
		'if [ "${1:-}" = "worker:test" ] || [ "${1:-}" = "test" ]; then',
		"  shift",
		'  exec "$NODE_BIN" --test tests/*.mjs "$@"',
		"fi",
		'exec "$NODE_BIN" src/worker-cli.mjs "$@"',
		"",
	].join("\n");
}

function workerPackageJson() {
	return `${JSON.stringify(
		{
			name: "@shipbysunday/worker",
			version: WORKER_FOUNDATIONS_BUNDLE_VERSION,
			private: true,
			type: "module",
			scripts: {
				"programs:lint": "node src/worker-cli.mjs programs:lint",
				"plans:lint": "node src/worker-cli.mjs plans:lint",
				"markdown:lint": "node src/worker-cli.mjs markdown:lint",
				"docs:validate": "node src/worker-cli.mjs docs:validate",
				"program:write-child-plan":
					"node src/worker-cli.mjs program:write-child-plan",
				"execplan:write": "node src/worker-cli.mjs execplan:write",
				"execplan:grill": "node src/worker-cli.mjs execplan:grill",
				"execplan:build": "node src/worker-cli.mjs execplan:build",
				"execplan:validate": "node src/worker-cli.mjs execplan:validate",
				"worker:test": "node --test tests/*.mjs",
				test: "node --test tests/*.mjs",
			},
		},
		null,
		"\t",
	)}\n`;
}

function workerManifestJson(): string {
	return `${JSON.stringify(
		{
			schemaVersion: "shipbysunday-worker-manifest.v1",
			workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
			managedRefs: WORKER_MANIFEST_MANAGED_REFS,
			privacyBoundary: buildPrivacyBoundary(),
		},
		null,
		"\t",
	)}\n`;
}

function workerCliSource() {
	return String.raw`import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const command = process.argv[2];
const commandArgs = process.argv.slice(3);
const shipBySundayPackageSpec = process.env.SHIPBYSUNDAY_PACKAGE_SPEC || ${JSON.stringify(SHIP_BY_SUNDAY_RUNNER_PACKAGE_SPEC)};

if (!command || command === "--help" || command === "-h") {
	console.log(renderWorkerHelp());
	process.exit(0);
}

if (command === "programs:lint") {
	exitFromReports(await lintPrograms());
} else if (command === "plans:lint" || command === "execplan:validate") {
	exitFromReports(await lintExecPlans(commandArgs));
} else if (command === "markdown:lint") {
	exitFromReports(await lintMarkdown(commandArgs));
} else if (command === "docs:validate") {
	exitFromReports([
		...(await lintMarkdown([])),
		...(await lintPrograms()),
		...(await lintExecPlans([])),
	]);
} else if (command === "program:write-child-plan") {
	await writeChildPlan(commandArgs);
} else if (command === "execplan:build") {
	await runExecPlanBuild(commandArgs);
} else if (command === "execplan:write" || command === "execplan:grill") {
	console.log(command + " is installed. Use Program-linked ExecPlans as the source of truth.");
} else {
	throw new Error("Unknown Worker command: " + command);
}

async function runExecPlanBuild(args) {
	const runner = resolveShipBySundayRunner();
	if (!runner) {
		throw new Error("execplan:build requires the Ship by Sunday local runner CLI. Install or expose ship-by-sunday, set SHIPBYSUNDAY_CLI, or make npx/npm available so the Worker can run " + shipBySundayPackageSpec + ".");
	}
	const forwardedArgs = [...runner.args, "execplan", "build", ...withRepoArg(args)];
	const exitCode = await runInheritedProcess(runner.command, forwardedArgs);
	if (exitCode !== 0) process.exitCode = exitCode;
}

function withRepoArg(args) {
	return args.includes("--repo") ? args : ["--repo", repoRoot, ...args];
}

function resolveShipBySundayRunner() {
	if (process.env.SHIPBYSUNDAY_CLI) {
		return { command: process.env.SHIPBYSUNDAY_CLI, args: [] };
	}
	for (const candidate of ["ship-by-sunday", "shipbysunday"]) {
		const found = findExecutableOnPath(candidate);
		if (found) return { command: found, args: [] };
	}
	const npx = findExecutableOnPath("npx");
	if (npx) {
		return {
			command: npx,
			args: ["--yes", "--package", shipBySundayPackageSpec, "ship-by-sunday"],
		};
	}
	const npm = findExecutableOnPath("npm");
	if (npm) {
		return {
			command: npm,
			args: ["exec", "--yes", "--package", shipBySundayPackageSpec, "--", "ship-by-sunday"],
		};
	}
	return null;
}

function findExecutableOnPath(commandName) {
	const pathValue = process.env.PATH || "";
	const suffixes = process.platform === "win32" ? ["", ".cmd", ".exe"] : [""];
	for (const dir of pathValue.split(path.delimiter)) {
		if (!dir) continue;
		for (const suffix of suffixes) {
			const candidate = path.join(dir, commandName + suffix);
			if (existsSync(candidate)) return candidate;
		}
	}
	return null;
}

async function runInheritedProcess(commandName, args) {
	const invocation = buildProcessInvocation(commandName, args);
	const child = spawn(invocation.command, invocation.args, {
		cwd: repoRoot,
		env: process.env,
		stdio: "inherit",
	});
	return await new Promise((resolve, reject) => {
		child.once("error", reject);
		child.once("close", (exitCode) => resolve(exitCode ?? 1));
	});
}

function buildProcessInvocation(commandName, args) {
	if (process.platform === "win32" && isWindowsCommandScript(commandName)) {
		return {
			command: "cmd.exe",
			args: ["/d", "/s", "/c", quoteWindowsCommandLine([commandName, ...args])],
		};
	}
	return { command: commandName, args };
}

function isWindowsCommandScript(commandName) {
	const extension = path.extname(commandName).toLowerCase();
	return extension === ".cmd" || extension === ".bat";
}

function quoteWindowsCommandLine(args) {
	return args.map(quoteWindowsCommandArgument).join(" ");
}

function quoteWindowsCommandArgument(value) {
	if (value === "") return "\"\"";
	const escaped = value
		.replace(/(\\*)"/g, "$1$1\\\"")
		.replace(/(\\+)$/g, "$1$1");
	return /[\s"&|<>^()%!]/.test(value) ? "\"" + escaped + "\"" : escaped;
}

function renderWorkerHelp() {
	return [
		"Shipbysunday Worker",
		"",
		"Usage: ./scripts/run-worker.sh <command> [args]",
		"",
		"Commands:",
		"  programs:lint              Validate Worker Program packets.",
		"  plans:lint                 Validate Worker ExecPlans.",
		"  markdown:lint              Validate Worker markdown metadata.",
		"  docs:validate              Run markdown, Program, and ExecPlan validation.",
		"  program:write-child-plan   Create a Program-linked child ExecPlan.",
		"  execplan:build             Run Program-linked ExecPlans through the Ship by Sunday autonomous runner.",
		"  execplan:validate          Validate one ExecPlan with --plan <path>.",
		"  worker:test                Run the installed Worker tests through the root package script.",
		"  test                       Run the installed Worker tests directly.",
		"",
		"Start with README.md and docs/worker/install-report.md.",
	].join("\n");
}

async function lintPrograms() {
	const reports = [];
	for (const root of ["docs/programs/active", "docs/programs/completed"]) {
		for (const dir of await listDirs(root)) {
			if (!/^\d{4}-\d{2}-\d{2}-.+/.test(path.basename(dir))) continue;
			const ref = toRef(dir);
			const issues = [];
			for (const required of [
				"program.md",
				"converged-decision-packet.md",
				"dependency-graph.md",
				"plan-split-recommendation.md",
				"cross-repo-review.md",
				"current-planning-brief.txt",
				]) {
					if (!existsSync(path.join(dir, required))) issues.push("Missing " + required + ".");
				}
				const files = await safeReaddir(dir);
				if (!files.some((file) => /^planning-brief-\d+\.md$/.test(file))) issues.push("Missing versioned planning brief.");
				if (!files.some((file) => /^research-pass-.+\.md$/.test(file) || /^track-\d+-.+\.md$/.test(file))) issues.push("Missing research pass.");
				if (!files.some((file) => /^normalized-pass-.+\.md$/.test(file) || /^normalized-track-\d+\.md$/.test(file))) issues.push("Missing normalized pass.");
				const programPath = path.join(dir, "program.md");
				if (existsSync(programPath)) {
					const parsed = parseFrontmatter(await readFile(programPath, "utf8"));
					if (!parsed) {
						issues.push("program.md is missing YAML frontmatter.");
					} else {
						for (const key of ["program_id", "title", "status", "created_at", "completed_at", "summary", "post_build_recap", "read_when"]) {
							if (!parsed.metadata.has(key)) issues.push("program.md missing frontmatter " + key + ".");
						}
						for (const heading of ["## Purpose / Big Picture", "## Program Inputs", "## Current State", "## Progress", "## Decision Log", "## Slice Ledger", "## Next Slice", "## Risks and Watchpoints", "## Outcomes & Retrospective", "## Validation and Acceptance", "## Artifacts and Notes", "## Interfaces and Dependencies"]) {
							if (!parsed.body.includes(heading)) issues.push("program.md missing " + heading + ".");
						}
					}
				}
				reports.push({ ref, issues });
			}
		}
	if (reports.length === 0) reports.push({ ref: "docs/programs", issues: ["No Program packets found."] });
	return reports;
}

async function lintExecPlans(args) {
	const requestedPlan = readArg(args, "--plan");
	const refs = requestedPlan ? [requestedPlan] : await listMarkdownRefs(["docs/exec-plans/active", "docs/exec-plans/completed"]);
	const reports = [];
	for (const ref of refs) {
		if (ref.endsWith("/index.md")) continue;
		const absolutePath = path.join(repoRoot, ref);
		const issues = [];
		if (!existsSync(absolutePath)) {
			issues.push("ExecPlan does not exist.");
			reports.push({ ref, issues });
			continue;
		}
		const parsed = parseFrontmatter(await readFile(absolutePath, "utf8"));
		if (!parsed) {
			issues.push("Missing YAML frontmatter block.");
			} else {
				for (const key of ["title", "status", "created_at", "completed_at", "summary", "post_build_recap", "read_when"]) {
					if (!parsed.metadata.has(key)) issues.push("Missing frontmatter " + key + ".");
				}
				const status = parsed.metadata.get("status");
				if (ref.includes("/active/") && status !== "active") issues.push("Active ExecPlan path must use status: active.");
				if (ref.includes("/completed/") && status !== "complete") issues.push("Completed ExecPlan path must use status: complete.");
				const planningBrief = parsed.metadata.get("planning_brief");
				if (typeof planningBrief === "string" && planningBrief.endsWith("current-planning-brief.txt")) {
					issues.push("planning_brief must point at an immutable planning-brief-N.md file.");
				}
				for (const heading of ["## Purpose / Big Picture", "## Progress", "## Surprises & Discoveries", "## Decision Log", "## Outcomes & Retrospective", "## Context and Orientation", "### In Scope", "### Out Of Scope", "## Plan of Work", "## Milestones", "## Concrete Steps", "## Validation and Acceptance", "### Test Commands", "## Idempotence and Recovery", "## Artifacts and Notes", "## Interfaces and Dependencies"]) {
					if (!parsed.body.includes(heading)) issues.push("Missing " + heading + ".");
				}
			}
		reports.push({ ref, issues });
	}
	return reports;
}

async function lintMarkdown(args) {
	const requestedPaths = readPathArgs(args);
	const roots = requestedPaths.length > 0 ? requestedPaths : ["docs/programs", "docs/exec-plans", "docs/prompts", "docs/worker"];
	const refs = await listMarkdownRefs(roots);
	const reports = [];
	for (const ref of refs) {
		const text = await readFile(path.join(repoRoot, ref), "utf8");
		const issues = [];
		if (text.includes("\r\n")) issues.push("File must use LF line endings.");
		if (!parseFrontmatter(text)) issues.push("Missing YAML frontmatter block.");
		reports.push({ ref, issues });
	}
	return reports;
}

async function writeChildPlan(args) {
	const programId = requireArg(args, "--program-id");
	const planRef = requireArg(args, "--plan");
	const title = requireArg(args, "--title");
	const summary = requireArg(args, "--summary");
	if (!planRef.startsWith("docs/exec-plans/active/") || path.normalize(planRef) !== planRef || planRef.includes("..")) {
		throw new Error("write-child-plan requires a normalized active ExecPlan path.");
	}
	const programDir = await findProgramDir(programId);
	const pointerRef = path.join(programDir, "current-planning-brief.txt");
	const briefName = (await readFile(path.join(repoRoot, pointerRef), "utf8")).trim();
	if (!/^planning-brief-\d+\.md$/.test(briefName)) throw new Error("current-planning-brief.txt must point at planning-brief-N.md.");
	const briefRef = path.join(programDir, briefName);
	const absolutePlanPath = path.join(repoRoot, planRef);
	if (existsSync(absolutePlanPath)) throw new Error("Refusing to overwrite existing ExecPlan: " + planRef);
	await mkdir(path.dirname(absolutePlanPath), { recursive: true });
	await writeFile(absolutePlanPath, renderChildPlan({ title, summary, programId, briefRef }));
	console.log("Created " + planRef);
}

function renderChildPlan(input) {
	return [
		"---",
		"title: " + input.title,
		"status: active",
		"created_at: 2026-05-08",
		"completed_at: null",
		"summary: " + input.summary,
		"post_build_recap: null",
		"program_id: " + input.programId,
		"planning_brief: " + input.briefRef,
		"read_when:",
		"  - Continuing the installed Worker Foundations loop.",
		"---",
		"",
		"# " + input.title,
		"",
		"This is a living execution plan for continuing the installed Worker Foundations loop.",
		"",
		"This ExecPlan must be maintained in accordance with docs/exec-plans/PLANS.md.",
		"",
		"## Purpose / Big Picture",
		"",
		input.summary,
		"",
		"## Progress",
		"",
		"- [ ] Continue from the installed Worker Foundations handoff.",
		"",
		"## Surprises & Discoveries",
		"",
		"No surprises have been recorded yet.",
		"",
		"## Decision Log",
		"",
		"Decision: Continue through the installed Worker Program and ExecPlan surfaces.",
		"Rationale: The installer proved that the target repo can create Program-linked child plans from local source.",
		"Date: 2026-05-08",
		"",
		"## Outcomes & Retrospective",
		"",
		"This plan is active. Record the final outcome here before moving it to completed.",
		"",
		"## Context and Orientation",
		"",
		"Follow the linked Program packet and keep proof in checked-in docs plus ignored .worker runs.",
		"",
		"### In Scope",
		"",
		"- Continue the Worker Foundations adoption loop.",
		"",
		"### Out Of Scope",
		"",
		"- Do not configure external providers without a separate plan.",
		"",
		"## Plan of Work",
		"",
		"Read the linked Program, inspect the current target repo, make the smallest safe change, and update this plan as work proceeds.",
		"",
		"## Milestones",
		"",
		"Milestone 1 keeps the Worker Foundations loop current by choosing one bounded next slice and validating it with installed commands.",
		"",
		"## Concrete Steps",
		"",
		"From the repo root, inspect docs/worker/install-report.md, this ExecPlan, and the owning Program packet. Then run the commands listed below after each meaningful change.",
		"",
		"## Validation and Acceptance",
		"",
		"Acceptance requires this plan to remain linked to an immutable planning brief and for installed Worker validation to pass before completion.",
		"",
		"### Test Commands",
		"",
		"- ./scripts/run-worker.sh docs:validate",
		"",
		"## Idempotence and Recovery",
		"",
		"Rerun installed validation after edits. If a step fails, keep the worktree reviewable and update this plan with the recovery path.",
		"",
		"## Artifacts and Notes",
		"",
		"- Planning brief: " + input.briefRef,
		"",
		"## Interfaces and Dependencies",
		"",
		"This plan depends on the installed Worker command surface, the owning Program packet, and the local package scripts installed by Shipbysunday Worker Foundations.",
		"",
	].join("\n");
}

function exitFromReports(reports) {
	for (const report of reports) {
		if (report.issues.length === 0) console.log(report.ref + ": ok");
		else console.log(report.ref + ":\n" + report.issues.map((issue) => "  - " + issue).join("\n"));
	}
	if (reports.some((report) => report.issues.length > 0)) process.exitCode = 1;
}

async function listDirs(rootRef) {
	const absoluteRoot = path.join(repoRoot, rootRef);
	const entries = await safeReaddirWithTypes(absoluteRoot);
	return entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(absoluteRoot, entry.name));
}

async function listMarkdownRefs(rootRefs) {
	const refs = [];
	for (const rootRef of rootRefs) await collectMarkdownRefs(path.join(repoRoot, rootRef), refs);
	return refs.sort();
}

async function collectMarkdownRefs(absolutePath, refs) {
	const entries = await safeReaddirWithTypes(absolutePath);
	for (const entry of entries) {
		const childPath = path.join(absolutePath, entry.name);
		if (entry.isDirectory()) await collectMarkdownRefs(childPath, refs);
		else if (entry.isFile() && entry.name.endsWith(".md")) refs.push(toRef(childPath));
	}
}

async function safeReaddir(absolutePath) {
	try {
		return await readdir(absolutePath);
	} catch {
		return [];
	}
}

async function safeReaddirWithTypes(absolutePath) {
	try {
		return await readdir(absolutePath, { withFileTypes: true });
	} catch {
		return [];
	}
}

function parseFrontmatter(text) {
	const normalized = text.replaceAll("\r\n", "\n");
	if (!normalized.startsWith("---\n")) return null;
	const end = normalized.indexOf("\n---\n", 4);
	if (end === -1) return null;
	const metadata = new Map();
	for (const line of normalized.slice(4, end).split("\n")) {
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (match) metadata.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
	}
	return { metadata, body: normalized.slice(end + 5) };
}

async function findProgramDir(programId) {
	for (const root of ["docs/programs/active", "docs/programs/completed"]) {
		for (const dir of await listDirs(root)) {
			if (path.basename(dir).endsWith("-" + programId)) return toRef(dir);
		}
	}
	throw new Error("No Program packet found for program_id: " + programId);
}

function readArg(args, name) {
	const index = args.indexOf(name);
	return index === -1 ? null : args[index + 1] ?? null;
}

function requireArg(args, name) {
	const value = readArg(args, name);
	if (!value || value.startsWith("--")) throw new Error("Missing value for " + name);
	return value;
}

function readPathArgs(args) {
	const paths = [];
	const index = args.indexOf("--paths");
	if (index === -1) return paths;
	for (const value of args.slice(index + 1)) {
		if (value.startsWith("--")) break;
		paths.push(value);
	}
	return paths;
}

function toRef(absolutePath) {
	return path.relative(repoRoot, absolutePath).replace(/\\/g, "/");
}
`;
}

function workerSmokeTestSource() {
	return [
		'import assert from "node:assert/strict";',
		'import { existsSync } from "node:fs";',
		'import path from "node:path";',
		'import { test } from "node:test";',
		'import { fileURLToPath } from "node:url";',
		"",
		'const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");',
		"",
		'test("Worker Foundations install includes the Worker manifest", () => {',
		'\tassert.equal(existsSync(path.join(repoRoot, "apps/worker/worker-manifest.json")), true);',
		"});",
		"",
	].join("\n");
}

function rootReadmeMd(packageManager: RootPackageManager) {
	const docsValidateCommand = packageRunCommand(
		packageManager,
		"docs:validate",
	);
	const workerTestCommand = packageRunCommand(packageManager, "worker:test");
	const programsLintCommand = packageRunCommand(
		packageManager,
		"programs:lint",
	);
	const plansLintCommand = packageRunCommand(packageManager, "plans:lint");
	const execPlanBuildCommand = packageRunCommand(
		packageManager,
		"execplan:build",
	);
	return [
		"# Shipbysunday Worker",
		"",
		ROOT_AGENT_START,
		"## Shipbysunday Worker",
		"",
		"This repository has the Shipbysunday Worker Foundations operating system installed.",
		"",
		"### Quick Start",
		"",
		`- Validate Worker docs and plans: \`${docsValidateCommand}\``,
		`- Run the autonomous ExecPlan loop: \`${execPlanBuildCommand} -- --program-id worker-foundations-adoption\``,
		`- Run Worker tests: \`${workerTestCommand}\``,
		"- Show direct Worker commands: `./scripts/run-worker.sh --help`",
		"- Direct fallback for any Worker command: `./scripts/run-worker.sh <command>`",
		"",
		"### Command Surface",
		"",
		`- Programs: \`${programsLintCommand}\``,
		`- ExecPlans: \`${plansLintCommand}\``,
		`- Autonomous ExecPlan build: \`${execPlanBuildCommand} -- --program-id <program-id>\``,
		"- Runner resolution: `execplan:build` uses `SHIPBYSUNDAY_CLI`, a local `ship-by-sunday`/`shipbysunday` binary, or an `npx`/`npm exec` package fallback.",
		"- Package override: set `SHIPBYSUNDAY_PACKAGE_SPEC` to a tarball, folder, or package spec when the default `ship-by-sunday` package source is unavailable.",
		`- Full Worker validation: \`${docsValidateCommand}\``,
		`- Worker tests: \`${workerTestCommand}\``,
		"",
		"### Handoff",
		"",
		"- Install report: `docs/worker/install-report.md`",
		"- Active Programs: `docs/programs/active/`",
		"- Active ExecPlans: `docs/exec-plans/active/`",
		"- Local Worker proof and run state live under `.worker/` and should stay out of commits.",
		ROOT_AGENT_END,
		"",
	].join("\n");
}

function rootAgentsMd(packageManager: RootPackageManager) {
	return [
		"# AGENTS.md",
		"",
		ROOT_AGENT_START,
		"## Shipbysunday Worker",
		"- Stay inside this repository unless the user explicitly names another path.",
		"- Read `README.md`, `docs/worker/install-report.md`, the active Program, and the active ExecPlan before continuing Worker work.",
		"- Use `docs/worker/install-report.md` as the current Worker install handoff.",
		`- Prefer repo-native Worker commands such as \`${packageRunCommand(packageManager, "execplan:build")} -- --program-id <program-id>\`, \`${packageRunCommand(packageManager, "docs:validate")}\`, and \`${packageRunCommand(packageManager, "worker:test")}\`.`,
		"- Use `./scripts/run-worker.sh <command>` as the direct fallback when package-manager context is unclear.",
		"- Run `./scripts/run-worker.sh --help` to inspect the installed Worker command surface.",
		"- Use Program packets in `docs/programs/active/` for multi-slice initiatives.",
		"- Use ExecPlans in `docs/exec-plans/active/` for concrete implementation work.",
		"- Keep `.worker/` local and out of commits.",
		"- Do not store secrets, raw logs, Codex transcripts, or local absolute paths in checked-in Worker proof.",
		ROOT_AGENT_END,
		"",
	].join("\n");
}

function programsAgentsMd() {
	return agentsDoc({
		title: "Program Instructions",
		summary: "Local instructions for editing Worker Program packets.",
		lines: [
			"Program packets preserve initiative state. Keep `current-planning-brief.txt` pointed at a versioned planning brief and keep indexes current.",
		],
	});
}

function execPlansAgentsMd() {
	return agentsDoc({
		title: "ExecPlan Instructions",
		summary: "Local instructions for editing Worker ExecPlans.",
		lines: [
			"ExecPlans must record `program_id` and an immutable `planning_brief` path when they belong to a Program.",
		],
	});
}

function promptsAgentsMd() {
	return agentsDoc({
		title: "Prompt Instructions",
		summary: "Local instructions for editing Worker prompt contracts.",
		lines: [
			"Prompt contracts are product behavior. Keep them concise, inspectable, and aligned with local commands.",
		],
	});
}

function programsContractMd() {
	return frontmatterDoc({
		title: "Programs",
		summary: "Contract for Worker Program packets.",
		body: [
			"# Programs",
			"",
			"A Program packet lives under `docs/programs/active/<date>-<program-id>/` or `docs/programs/completed/<date>-<program-id>/`.",
			"",
			"Required files: `program.md`, research pass, normalized pass, `converged-decision-packet.md`, `dependency-graph.md`, `plan-split-recommendation.md`, `cross-repo-review.md`, `planning-brief-N.md`, and `current-planning-brief.txt`.",
			"",
		],
	});
}

function execPlansContractMd() {
	return frontmatterDoc({
		title: "ExecPlans",
		summary: "Contract for Worker ExecPlans.",
		body: [
			"# ExecPlans",
			"",
			"ExecPlans live under `docs/exec-plans/active/` or `docs/exec-plans/completed/` and must keep status aligned with their path.",
			"",
			"Program-linked ExecPlans must point `planning_brief` at `planning-brief-N.md`, never `current-planning-brief.txt`.",
			"",
		],
	});
}

function promptsReadmeMd() {
	return frontmatterDoc({
		title: "Prompt Contracts",
		summary: "Prompt inventory for the installed Worker operating system.",
		body: [
			"# Prompt Contracts",
			"",
			"Prompts should be explicit, local, and reviewable.",
			"",
		],
	});
}

function activeProgramsIndexMd() {
	return indexDoc("Active Programs", "Index of active Worker Programs.");
}

function completedProgramsIndexMd() {
	return indexDoc("Completed Programs", "Index of completed Worker Programs.");
}

function activeExecPlansIndexMd() {
	return indexDoc("Active ExecPlans", "Index of active Worker ExecPlans.");
}

function completedExecPlansIndexMd() {
	return indexDoc(
		"Completed ExecPlans",
		"Index of completed Worker ExecPlans.",
	);
}

function starterProgramMd() {
	return [
		"---",
		"program_id: worker-foundations-adoption",
		"title: Worker Foundations Adoption",
		"status: active",
		"created_at: 2026-05-08",
		"completed_at: null",
		"summary: Adopt the installed Shipbysunday Worker Foundations operating system.",
		"post_build_recap: null",
		"read_when:",
		"  - Continuing from the initial Worker Foundations install.",
		"---",
		"",
		"# Worker Foundations Adoption",
		"",
		"This Program is a living initiative document for continuing the installed Worker Foundations operating system.",
		"",
		"This Program must be maintained in accordance with `docs/programs/PROGRAMS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		"This Program dogfoods the installed Worker Foundations operating system in this repository.",
		"",
		"## Program Inputs",
		"",
		"The initial Program packet was created by `shipbysunday install` and is driven by `planning-brief-1.md`.",
		"",
		"## Current State",
		"",
		"Worker Foundations source, scripts, local proof, and this Program packet are installed in the target repo.",
		"",
		"## Progress",
		"",
		"- [x] Worker Foundations installer created the starter Program packet.",
		"- [ ] Continue implementation through child ExecPlans.",
		"",
		"## Decision Log",
		"",
		"Decision: Continue future work through Program-linked ExecPlans.",
		"Rationale: The installer proved that child plans can record immutable planning brief provenance.",
		"Date: 2026-05-08",
		"",
		"## Slice Ledger",
		"",
		"The first child ExecPlan is `docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md`.",
		"",
		"## Next Slice",
		"",
		"Continue from the active child ExecPlan and keep the installed validation commands passing.",
		"",
		"## Risks and Watchpoints",
		"",
		"Do not store secrets, raw logs, Codex transcripts, or local absolute paths in checked-in Worker proof.",
		"",
		"## Outcomes & Retrospective",
		"",
		"This Program is active. Record outcomes here when the adoption loop is complete.",
		"",
		"## Validation and Acceptance",
		"",
		"The installed Worker command surface should pass `docs:validate` and `worker:test` before this Program is considered healthy.",
		"",
		"## Artifacts and Notes",
		"",
		"- Install report: `docs/worker/install-report.md`",
		"- Local proof root: `.worker/`",
		"",
		"## Interfaces and Dependencies",
		"",
		"This Program depends on `scripts/run-worker.sh`, `apps/worker`, root package scripts, and the installed Worker planning brief.",
		"",
	].join("\n");
}

function starterResearchPassMd() {
	return packetDoc(
		"Worker Foundations Research Pass",
		"The installer added local Worker source, command forwarding, and Program/ExecPlan contracts.",
	);
}

function starterNormalizedPassMd() {
	return packetDoc(
		"Worker Foundations Normalized Pass",
		"Use the installed Worker commands as the local planning operating system.",
	);
}

function starterDecisionPacketMd() {
	return packetDoc(
		"Worker Foundations Decision Packet",
		"Continue work through Program-linked ExecPlans and keep proof sync-safe.",
	);
}

function starterDependencyGraphMd() {
	return packetDoc(
		"Worker Foundations Dependency Graph",
		"Validate the installed commands before widening into app-specific automation.",
	);
}

function starterPlanSplitMd() {
	return packetDoc(
		"Worker Foundations Plan Split",
		"Start with one child ExecPlan created through `program:write-child-plan`.",
	);
}

function starterCrossRepoReviewMd() {
	return packetDoc(
		"Worker Foundations Cross-Repo Review",
		"Avoid provider setup, app process assumptions, and raw local proof in tracked docs.",
	);
}

function starterPlanningBriefMd() {
	return [
		"---",
		"title: Worker Foundations Planning Brief",
		"program_id: worker-foundations-adoption",
		"brief_version: 1",
		"status: current",
		"summary: First planning brief for the installed Worker Foundations Program.",
		"read_when:",
		"  - Writing the first child ExecPlan after install.",
		"---",
		"",
		"# Worker Foundations Planning Brief",
		"",
		"Create the first child ExecPlan through the installed `program:write-child-plan` command and continue from checked-in repo context.",
		"",
	].join("\n");
}

function packetDoc(title: string, summary: string) {
	return frontmatterDoc({
		title,
		summary,
		body: ["# " + title, "", summary, ""],
	});
}

function indexDoc(title: string, summary: string) {
	return frontmatterDoc({
		title,
		summary,
		body: [
			"# " + title,
			"",
			"This index is maintained by the Worker operating system.",
			"",
		],
	});
}

function frontmatterDoc({
	title,
	summary,
	body,
}: {
	title: string;
	summary: string;
	body: string[];
}) {
	return [
		"---",
		"title: " + title,
		"summary: " + summary,
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Working with the installed Worker operating system.",
		"---",
		"",
		...body,
	].join("\n");
}

function agentsDoc({
	title,
	summary,
	lines,
}: {
	title: string;
	summary: string;
	lines: string[];
}) {
	return frontmatterDoc({
		title,
		summary,
		body: [
			"# " + title,
			"",
			ROOT_AGENT_START,
			"## Shipbysunday Worker",
			...lines.map((line) => "- " + line),
			ROOT_AGENT_END,
			"",
		],
	});
}
