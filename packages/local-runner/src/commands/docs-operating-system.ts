import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "../core/bounded-process";
import type { JsonObject, JsonValue } from "../core/json-value";
import {
	parseLintCommandArgs,
	validatePlanPath,
} from "../../../../scripts/exec-plan/cli";
import {
	formatExecPlanLintReports,
	lintExecPlans,
} from "../../../../scripts/exec-plan/plan-lint";
import {
	formatMarkdownMetadataLintReports,
	lintMarkdownMetadata,
} from "../../../../scripts/markdown-metadata/lint";
import {
	formatProgramPacketLintReports,
	lintProgramPackets,
} from "../../../../scripts/programs/frontmatter-lint";
import {
	formatProgramPromptContractReports,
	lintProgramPromptContract,
} from "../../../../scripts/programs/prompt-contract";
import { resolveCurrentPlanningBrief } from "../../../../scripts/programs/briefs";

const HELP_TEXT = `
Ship by Sunday docs operating-system commands

Usage:
  ship-by-sunday docs-operating-system programs-lint [--repo <path>]
  ship-by-sunday docs-operating-system exec-plans-lint (--plan <path> | --paths <path...>) [--repo <path>]
  ship-by-sunday docs-operating-system markdown-lint [--paths <path...>] [--format text|json] [--repo <path>]
  ship-by-sunday docs-operating-system docs-validate [--repo <path>]
  ship-by-sunday docs-operating-system docs-refresh-quality [--repo <path>]
  ship-by-sunday docs-operating-system native-command-proof [--repo <path>]
  ship-by-sunday docs-operating-system write-child-plan --program-id <id> --plan <path> --title <title> --summary <summary> [--repo <path>]
`;

type ParsedRepoArgs = {
	repoRootDir: string;
	remainingArgs: string[];
};

type ValidationResult = {
	exitCode: number;
	outputText: string;
};

type MarkdownLintOptions = {
	format: "text" | "json";
	paths: string[];
};

type WriteChildPlanOptions = {
	planPath: string;
	programId: string;
	summary: string;
	title: string;
};

const QUALITY_SCORE_REF = "docs/QUALITY_SCORE.md";
const QUALITY_REFRESH_START = "<!-- sbs-docs-quality-refresh:start -->";
const QUALITY_REFRESH_END = "<!-- sbs-docs-quality-refresh:end -->";
const QUALITY_VALIDATE_COMMAND =
	"ship-by-sunday docs-operating-system docs-validate";
const NATIVE_COMMAND_SCRIPT_PRIORITY = [
	"gate",
	"check",
	"ci",
	"proof",
	"test",
	"lint",
	"typecheck",
	"build",
] as const;

export async function runDocsOperatingSystemCommand(
	argv = process.argv.slice(2),
) {
	const [subcommand, ...subcommandArgs] = argv;
	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		console.log(HELP_TEXT.trim());
		return 0;
	}

	if (subcommand === "programs-lint") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		if (remainingArgs.includes("--help")) {
			console.log(buildProgramsLintUsage());
			return 0;
		}
		assertNoArgs(remainingArgs, buildProgramsLintUsage());
		return printValidationResult(await runProgramsLint(repoRootDir));
	}

	if (subcommand === "exec-plans-lint") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		const parseResult = parseLintCommandArgs(remainingArgs);
		if (parseResult.kind === "help") {
			console.log(parseResult.usage);
			return 0;
		}

		const result = await runExecPlansLint({
			repoRootDir,
			planPaths: parseResult.options.planPaths,
		});
		if (result.reportText !== "") {
			console.log(result.reportText);
		}
		return result.failedPlanCount > 0 ? 1 : 0;
	}

	if (subcommand === "markdown-lint") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		const parseResult = parseMarkdownLintArgs(remainingArgs);
		if (parseResult === "help") {
			console.log(buildMarkdownLintUsage());
			return 0;
		}

		const reports = await lintMarkdownMetadata({
			repoRootDir,
			requestedPaths: parseResult.paths,
		});
		if (parseResult.format === "json") {
			console.log(JSON.stringify(reports, null, 2));
		} else {
			console.log(formatMarkdownMetadataLintReports(reports));
		}
		return reports.some((report) => report.issues.length > 0) ? 1 : 0;
	}

	if (subcommand === "docs-validate") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		if (remainingArgs.includes("--help")) {
			console.log(buildDocsValidateUsage());
			return 0;
		}
		assertNoArgs(remainingArgs, buildDocsValidateUsage());
		return printValidationResult(await runDocsValidate(repoRootDir));
	}

	if (subcommand === "docs-refresh-quality") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		if (remainingArgs.includes("--help")) {
			console.log(buildDocsRefreshQualityUsage());
			return 0;
		}
		assertNoArgs(remainingArgs, buildDocsRefreshQualityUsage());
		return printValidationResult(await runDocsRefreshQuality(repoRootDir));
	}

	if (subcommand === "native-command-proof") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		if (remainingArgs.includes("--help")) {
			console.log(buildNativeCommandProofUsage());
			return 0;
		}
		assertNoArgs(remainingArgs, buildNativeCommandProofUsage());
		return printValidationResult(await runNativeCommandProof(repoRootDir));
	}

	if (subcommand === "write-child-plan") {
		const { repoRootDir, remainingArgs } = parseRepoArgs(subcommandArgs);
		if (remainingArgs.includes("--help")) {
			console.log(buildWriteChildPlanUsage());
			return 0;
		}

		const result = await writeChildExecPlan({
			repoRootDir,
			options: parseWriteChildPlanArgs(remainingArgs),
		});
		console.log(result);
		return 0;
	}

	throw new Error(`Unknown docs operating-system command: ${subcommand}`);
}

function printValidationResult(result: ValidationResult) {
	if (result.outputText.trim() !== "") {
		console.log(result.outputText.trimEnd());
	}
	return result.exitCode;
}

function parseRepoArgs(argv: string[]): ParsedRepoArgs {
	const remainingArgs: string[] = [];
	let repoRootDir = process.cwd();

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--repo") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error("Missing value for --repo");
			}
			repoRootDir = path.resolve(value);
			index += 1;
			continue;
		}

		remainingArgs.push(argument);
	}

	return {
		repoRootDir,
		remainingArgs,
	};
}

function assertNoArgs(args: string[], usage: string) {
	if (args.length > 0) {
		throw new Error(`Unknown arguments: ${args.join(" ")}\n\n${usage}`);
	}
}

async function runProgramsLint(repoRootDir: string): Promise<ValidationResult> {
	const [docReports, packetReports, promptReports] = await Promise.all([
		lintProgramMarkdownDocs(repoRootDir),
		lintProgramPackets({ repoRootDir }),
		lintProgramPromptContract({ repoRootDir }),
	]);

	const outputBlocks: string[] = [];
	outputBlocks.push("Program docs");
	outputBlocks.push(formatProgramMarkdownReports(docReports).trimEnd());

	if (packetReports.length === 0) {
		outputBlocks.push("");
		outputBlocks.push("Program packets");
		outputBlocks.push("No program packets found.");
	} else {
		outputBlocks.push("");
		outputBlocks.push("Program packets");
		outputBlocks.push(formatProgramPacketLintReports(packetReports).trimEnd());
	}

	outputBlocks.push("");
	outputBlocks.push("Program prompts");
	outputBlocks.push(
		formatProgramPromptContractReports(promptReports).trimEnd(),
	);

	const failed =
		docReports.failed ||
		packetReports.some((report) => report.issues.length > 0) ||
		promptReports.some((report) => report.issues.length > 0);

	return {
		exitCode: failed ? 1 : 0,
		outputText: outputBlocks.join("\n"),
	};
}

async function runExecPlansLint(params: {
	planPaths: string[];
	repoRootDir: string;
}) {
	const reports = await lintExecPlans({
		repoRootDir: params.repoRootDir,
		planPaths: params.planPaths,
	});
	return {
		reportText: formatExecPlanLintReports(reports).trimEnd(),
		failedPlanCount: reports.filter((report) => report.issues.length > 0)
			.length,
	};
}

async function lintProgramMarkdownDocs(repoRootDir: string): Promise<
	| {
			failed: false;
			reports: Awaited<ReturnType<typeof lintMarkdownMetadata>>;
	  }
	| {
			failed: true;
			reports: string;
	  }
> {
	try {
		return {
			failed: false,
			reports: await lintMarkdownMetadata({
				repoRootDir,
				requestedPaths: ["docs/programs"],
			}),
		};
	} catch (error) {
		if (error instanceof Error && isMissingPathError(error)) {
			return {
				failed: true,
				reports: "Missing docs/programs.",
			};
		}
		throw error;
	}
}

function formatProgramMarkdownReports(
	docReports: Awaited<ReturnType<typeof lintProgramMarkdownDocs>>,
) {
	if (typeof docReports.reports === "string") {
		return docReports.reports;
	}
	return formatMarkdownMetadataLintReports(docReports.reports).trimEnd();
}

async function runDocsValidate(repoRootDir: string): Promise<ValidationResult> {
	const [markdownResult, programResult, activeExecPlanResult] =
		await Promise.all([
			runMarkdownDocsValidation(repoRootDir),
			runProgramsLint(repoRootDir),
			runActiveExecPlanValidation(repoRootDir),
		]);

	const outputText = [
		"Markdown docs",
		markdownResult.outputText.trimEnd(),
		"",
		"Programs",
		programResult.outputText.trimEnd(),
		"",
		"Active ExecPlans",
		activeExecPlanResult.outputText.trimEnd(),
	].join("\n");
	const exitCode =
		markdownResult.exitCode === 0 &&
		programResult.exitCode === 0 &&
		activeExecPlanResult.exitCode === 0
			? 0
			: 1;

	return {
		exitCode,
		outputText,
	};
}

async function runDocsRefreshQuality(
	repoRootDir: string,
): Promise<ValidationResult> {
	const qualityScorePath = path.join(repoRootDir, QUALITY_SCORE_REF);
	await mkdir(path.dirname(qualityScorePath), { recursive: true });
	const existingContent = await readQualityScoreFile(qualityScorePath);
	const baseContent = existingContent ?? buildQualityScoreScaffold();
	await writeFile(qualityScorePath, baseContent, "utf8");

	const validationResult = await runDocsValidate(repoRootDir);
	const refreshedContent = mergeQualityRefreshBlock({
		markdown: baseContent,
		refreshedAt: new Date().toISOString(),
		validationResult,
	});
	await writeFile(qualityScorePath, refreshedContent, "utf8");

	const status = validationResult.exitCode === 0 ? "passed" : "failed";
	return {
		exitCode: validationResult.exitCode,
		outputText: [
			`Refreshed ${QUALITY_SCORE_REF}.`,
			`${QUALITY_VALIDATE_COMMAND}: ${status}`,
			`Summary: ${summarizeValidationResult(validationResult)}`,
		].join("\n"),
	};
}

async function readQualityScoreFile(qualityScorePath: string) {
	try {
		return await readFile(qualityScorePath, "utf8");
	} catch (error) {
		if (error instanceof Error && isMissingPathError(error)) {
			return null;
		}
		throw error;
	}
}

function buildQualityScoreScaffold() {
	return [
		"---",
		"title: 'Quality Score'",
		"summary: 'Evidence-bound docs operating-system quality evidence for this repository.'",
		"docType: 'guide'",
		"status: 'active'",
		"read_when:",
		"  - 'Refreshing docs operating-system quality evidence.'",
		"  - 'Reviewing the latest docs validation status.'",
		"---",
		"",
		"# Quality Score",
		"",
		"This file records evidence-bound docs quality status for this repository.",
		"",
		"## Owns",
		"",
		"- repo-wide docs quality evidence refreshed by Ship by Sunday docs operating-system commands",
		"- routing from validation results to durable Program or ExecPlan follow-up",
		"",
		"## Does Not Own",
		"",
		"- invented numeric quality scores",
		"- runtime setup, provider setup, package publication, or app-stack command wiring",
		"",
		"## Next",
		"",
		"- Use the managed review block for the latest docs operating-system quality evidence.",
		"",
	].join("\n");
}

function mergeQualityRefreshBlock(params: {
	markdown: string;
	refreshedAt: string;
	validationResult: ValidationResult;
}) {
	const markdownWithoutOldBlock = stripExistingQualityRefreshBlock(
		params.markdown,
	);
	const block = buildQualityRefreshBlock({
		includeCurrentFindings: !hasMarkdownHeading(
			markdownWithoutOldBlock,
			"Current Findings",
		),
		includeCurrentScore: !hasMarkdownHeading(
			markdownWithoutOldBlock,
			"Current Score",
		),
		includeLayerSummary: !hasMarkdownHeading(
			markdownWithoutOldBlock,
			"Architectural Layers",
		),
		includeProductSummary: !hasMarkdownHeading(
			markdownWithoutOldBlock,
			"Product Domains",
		),
		includeSeverityFramework: !hasMarkdownHeading(
			markdownWithoutOldBlock,
			"Severity Framework",
		),
		refreshedAt: params.refreshedAt,
		validationResult: params.validationResult,
	});

	const normalizedBlock = `${block.trimEnd()}\n`;
	if (markdownWithoutOldBlock !== params.markdown) {
		return `${markdownWithoutOldBlock.trimEnd()}\n\n${normalizedBlock}`;
	}
	return `${params.markdown.trimEnd()}\n\n${normalizedBlock}`;
}

function stripExistingQualityRefreshBlock(markdown: string) {
	const startIndex = markdown.indexOf(QUALITY_REFRESH_START);
	if (startIndex === -1) {
		return markdown;
	}
	const endIndex = markdown.indexOf(QUALITY_REFRESH_END, startIndex);
	if (endIndex === -1) {
		return `${markdown.slice(0, startIndex).trimEnd()}\n`;
	}
	const afterEndIndex = endIndex + QUALITY_REFRESH_END.length;
	const before = markdown.slice(0, startIndex).trimEnd();
	const after = markdown.slice(afterEndIndex).trimStart();
	if (before === "") {
		return after;
	}
	if (after === "") {
		return `${before}\n`;
	}
	return `${before}\n\n${after}`;
}

function buildQualityRefreshBlock(params: {
	includeCurrentFindings: boolean;
	includeCurrentScore: boolean;
	includeLayerSummary: boolean;
	includeProductSummary: boolean;
	includeSeverityFramework: boolean;
	refreshedAt: string;
	validationResult: ValidationResult;
}) {
	const status = params.validationResult.exitCode === 0 ? "passed" : "failed";
	const lines = [QUALITY_REFRESH_START];

	if (params.includeCurrentScore) {
		lines.push(
			"",
			"## Current Score",
			"",
			"`not scored` until a quality audit records evidence refs, reviewer, date, score rationale, and scoring rules.",
		);
	}

	if (params.includeProductSummary) {
		lines.push(
			"",
			"## Product Domains",
			"",
			"- Not assessed by this docs operating-system refresh.",
		);
	}

	if (params.includeLayerSummary) {
		lines.push(
			"",
			"## Architectural Layers",
			"",
			"- Not assessed by this docs operating-system refresh.",
		);
	}

	if (params.includeCurrentFindings) {
		lines.push(
			"",
			"## Current Findings",
			"",
			"- The latest managed refresh records docs validation evidence below.",
		);
	}

	if (params.includeSeverityFramework) {
		lines.push(
			"",
			"## Severity Framework",
			"",
			"- `passed`: the docs validation command returned zero.",
			"- `failed`: the docs validation command returned non-zero and needs follow-up.",
			"- `blocked`: a required docs surface or local setup was missing.",
		);
	}

	lines.push(
		"",
		"## QUALITY_SCORE.review",
		"",
		`Last refreshed: ${params.refreshedAt}`,
		"",
		"Reviewer: `ship-by-sunday docs-operating-system docs-refresh-quality`",
		"",
		"Current score: `not scored`",
		"",
		"### Evidence Commands",
		"",
		`- \`${QUALITY_VALIDATE_COMMAND}\`: ${status}`,
		"  Evidence refs: `docs/`, `docs/programs/`, `docs/exec-plans/active/`",
		`  Summary: ${summarizeValidationResult(params.validationResult)}`,
		"",
		"### Follow-Up Routing",
		"",
		status === "passed"
			? "- Keep this file refreshed after docs operating-system changes."
			: "- Run `ship-by-sunday docs-operating-system docs-validate` for full local detail, then route durable follow-up into Program or ExecPlan docs.",
		"",
		QUALITY_REFRESH_END,
	);

	return lines.join("\n");
}

function hasMarkdownHeading(markdown: string, heading: string) {
	const escapedHeading = escapeRegExp(heading);
	return new RegExp(`^##\\s+${escapedHeading}\\s*$`, "m").test(markdown);
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function summarizeValidationResult(result: ValidationResult) {
	if (result.exitCode === 0) {
		return "All docs operating-system validation checks passed.";
	}
	const lines = result.outputText
		.split(/\r?\n/)
		.map((line) => sanitizeEvidenceLine(line))
		.filter((line) => line !== "");
	const firstIssue = lines.find(
		(line) =>
			/(missing|failed|invalid|error|required|frontmatter|issue)/i.test(line) &&
			!/: ok$/i.test(line),
	);
	return (
		firstIssue ??
		"Docs validation failed; run the validation command locally for details."
	);
}

function sanitizeEvidenceLine(line: string) {
	return line
		.replace(/\/Users\/[^\s`'")]+/g, "<local-path>")
		.replace(/\/private\/var\/[^\s`'")]+/g, "<local-path>")
		.replace(/[A-Za-z]:\\[^\s`'")]+/g, "<local-path>")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 220);
}

async function runNativeCommandProof(
	repoRootDir: string,
): Promise<ValidationResult> {
	const packageScripts = await readNativePackageScripts(repoRootDir);
	if (packageScripts.status === "blocked") {
		return buildNativeCommandProofResult({
			commandName: "none",
			status: "blocked",
			summary: packageScripts.reason,
		});
	}
	const scriptSelection = selectNativeCommandScript(packageScripts.scripts);
	if (scriptSelection.status === "blocked") {
		return buildNativeCommandProofResult({
			commandName: "none",
			status: "blocked",
			summary: scriptSelection.reason,
		});
	}
	const lifecycleHooks = listNativeCommandLifecycleHooks(
		packageScripts.scripts,
		scriptSelection.scriptName,
	);
	if (lifecycleHooks.length > 0) {
		return buildNativeCommandProofResult({
			commandName: "none",
			status: "blocked",
			summary: `Native validation script '${scriptSelection.scriptName}' has lifecycle hooks that would run outside the selected script: ${lifecycleHooks.join(", ")}.`,
		});
	}

	const nativeCommand = buildNativePackageCommand({
		packageManager: detectNativePackageManager(repoRootDir),
		scriptName: scriptSelection.scriptName,
	});
	const result = await runBoundedProcess({
		command: nativeCommand.command,
		args: nativeCommand.args,
		cwd: repoRootDir,
		timeoutMs: 120_000,
	});
	if (result.succeeded) {
		return buildNativeCommandProofResult({
			commandName: nativeCommand.commandName,
			status: "passed",
			summary: "passed",
		});
	}

	const outputSummary = summarizeNativeCommandOutput(result);
	const blockedBySetup = isNativeCommandSetupBlocker(outputSummary);
	return buildNativeCommandProofResult({
		commandName: nativeCommand.commandName,
		status: blockedBySetup ? "blocked" : "failed",
		summary: result.timedOut
			? "command timed out"
			: outputSummary || (result.failureCode ?? "native command failed"),
	});
}

async function readNativePackageScripts(
	repoRootDir: string,
): Promise<
	| { status: "ready"; scripts: JsonObject }
	| { status: "blocked"; reason: string }
> {
	const packageJsonPath = path.join(repoRootDir, "package.json");
	let rawPackageJson: string;
	try {
		rawPackageJson = await readFile(packageJsonPath, "utf8");
	} catch (error) {
		if (error instanceof Error && isMissingPathError(error)) {
			return {
				status: "blocked",
				reason: "Root package.json was not found.",
			};
		}
		throw error;
	}

	let parsedPackageJson: JsonValue;
	try {
		parsedPackageJson = JSON.parse(rawPackageJson) as JsonValue;
	} catch {
		return {
			status: "blocked",
			reason: "Root package.json is not valid JSON.",
		};
	}

	if (!isRecord(parsedPackageJson) || !isRecord(parsedPackageJson.scripts)) {
		return {
			status: "blocked",
			reason: "Root package.json does not define scripts.",
		};
	}

	return {
		status: "ready",
		scripts: parsedPackageJson.scripts,
	};
}

function selectNativeCommandScript(
	scripts: JsonObject,
):
	| { status: "ready"; scriptName: string }
	| { status: "blocked"; reason: string } {
	const scriptName = NATIVE_COMMAND_SCRIPT_PRIORITY.find((candidate) =>
		Object.hasOwn(scripts, candidate),
	);
	if (!scriptName) {
		return {
			status: "blocked",
			reason:
				"No recognized native validation script was found. Expected one of: gate, check, ci, proof, test, lint, typecheck, build.",
		};
	}
	if (typeof scripts[scriptName] !== "string") {
		return {
			status: "blocked",
			reason: `Native validation script '${scriptName}' is not a string.`,
		};
	}
	return {
		status: "ready",
		scriptName,
	};
}

function listNativeCommandLifecycleHooks(
	scripts: JsonObject,
	scriptName: string,
) {
	return [`pre${scriptName}`, `post${scriptName}`].filter((hookName) =>
		Object.hasOwn(scripts, hookName),
	);
}

function detectNativePackageManager(repoRootDir: string) {
	if (
		existsSync(path.join(repoRootDir, "bun.lock")) ||
		existsSync(path.join(repoRootDir, "bun.lockb"))
	) {
		return "bun";
	}
	if (existsSync(path.join(repoRootDir, "pnpm-lock.yaml"))) {
		return "pnpm";
	}
	if (existsSync(path.join(repoRootDir, "yarn.lock"))) {
		return "yarn";
	}
	return "npm";
}

function buildNativePackageCommand({
	packageManager,
	scriptName,
}: {
	packageManager: string;
	scriptName: string;
}) {
	if (packageManager === "bun") {
		return {
			command: "bun",
			args: ["run", "--silent", scriptName],
			commandName: `bun run ${scriptName}`,
		};
	}
	if (packageManager === "pnpm") {
		return {
			command: "pnpm",
			args: ["run", scriptName],
			commandName: `pnpm run ${scriptName}`,
		};
	}
	if (packageManager === "yarn") {
		return {
			command: "yarn",
			args: [scriptName],
			commandName: `yarn ${scriptName}`,
		};
	}
	return {
		command: "npm",
		args: ["run", "--ignore-scripts", scriptName],
		commandName: `npm run ${scriptName}`,
	};
}

function buildNativeCommandProofResult(params: {
	commandName: string;
	status: "passed" | "failed" | "blocked";
	summary: string;
}): ValidationResult {
	return {
		exitCode: params.status === "passed" ? 0 : 1,
		outputText: [
			`Native command: ${params.commandName}`,
			`Status: ${params.status}`,
			`Summary: ${sanitizeEvidenceLine(params.summary)}`,
		].join("\n"),
	};
}

function summarizeNativeCommandOutput(result: {
	stdout: string;
	stderr: string;
	timedOut: boolean;
	exitCode?: number;
	failureCode?: string;
}) {
	if (result.timedOut) {
		return "command timed out";
	}
	const outputLines = [result.stderr, result.stdout]
		.join("\n")
		.split(/\r?\n/)
		.map((line) => sanitizeEvidenceLine(line))
		.filter(
			(line) => line !== "" && !line.startsWith(">") && !line.startsWith("$ "),
		);
	const explicitSetupBlockerLines = outputLines.filter((line) =>
		/(error: cannot find package|cannot find (module|package)|could not resolve|module not found|missing dependency|enoent|spawnsync? .*enoent|failed to run biome|happy-dom)/i.test(
			line,
		),
	);
	const setupBlockerLines = outputLines.filter(
		(line) =>
			isNativeCommandMissingLine(line) &&
			!explicitSetupBlockerLines.includes(line),
	);
	const genericFailureLines = outputLines.filter(
		(line) =>
			/(error|failed|failure|timed out|assertion)/i.test(line) &&
			!explicitSetupBlockerLines.includes(line) &&
			!setupBlockerLines.includes(line),
	);
	const classifiedOutput = [
		...explicitSetupBlockerLines.slice(0, 4),
		...setupBlockerLines.slice(0, 2),
		...genericFailureLines.slice(0, 2),
	].slice(0, 6);
	const combinedOutput = (
		classifiedOutput.length > 0 ? classifiedOutput : outputLines.slice(0, 2)
	).join(" | ");
	const exitCodeSummary =
		typeof result.exitCode === "number"
			? `exit ${result.exitCode}`
			: (result.failureCode ?? "failed");
	if (!combinedOutput) {
		return exitCodeSummary;
	}
	return `${exitCodeSummary}: ${combinedOutput}`.slice(0, 700);
}

function isNativeCommandSetupBlocker(outputSummary: string) {
	return (
		/(cannot find (module|package)|could not resolve|module not found|missing dependency|enoent|spawn .* enoent|failed to run biome)/i.test(
			outputSummary,
		) || isNativeCommandMissingLine(outputSummary)
	);
}

function isNativeCommandMissingLine(line: string) {
	return (
		/\bcommand not found\b/i.test(line) ||
		/\bnot found:\s*[^\s|]+(?:\s*\|.*)?$/i.test(line)
	);
}

function isRecord(value: JsonValue | undefined): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function runMarkdownDocsValidation(
	repoRootDir: string,
): Promise<ValidationResult> {
	try {
		const reports = await lintMarkdownMetadata({
			repoRootDir,
			requestedPaths: ["docs"],
		});
		return {
			exitCode: reports.some((report) => report.issues.length > 0) ? 1 : 0,
			outputText: formatMarkdownMetadataLintReports(reports),
		};
	} catch (error) {
		if (error instanceof Error && isMissingPathError(error)) {
			return {
				exitCode: 1,
				outputText: "Missing docs/.",
			};
		}
		throw error;
	}
}

async function runActiveExecPlanValidation(
	repoRootDir: string,
): Promise<ValidationResult> {
	const activePlanPaths = await listActiveExecPlanPaths(repoRootDir);
	if (activePlanPaths.length === 0) {
		return {
			exitCode: 0,
			outputText: "No active ExecPlans found.",
		};
	}

	const reports = await lintExecPlans({
		repoRootDir,
		planPaths: activePlanPaths,
	});
	return {
		exitCode: reports.some((report) => report.issues.length > 0) ? 1 : 0,
		outputText: formatExecPlanLintReports(reports).trimEnd(),
	};
}

async function listActiveExecPlanPaths(repoRootDir: string): Promise<string[]> {
	const activeExecPlanRoot = path.join(
		repoRootDir,
		"docs",
		"exec-plans",
		"active",
	);
	return (await listMarkdownFiles(activeExecPlanRoot, repoRootDir))
		.filter((planPath) => planPath.startsWith("docs/exec-plans/active/"))
		.sort();
}

async function listMarkdownFiles(
	absoluteRoot: string,
	repoRootDir: string,
): Promise<string[]> {
	let entries;
	try {
		entries = await readdir(absoluteRoot, { withFileTypes: true });
	} catch (error) {
		if (error instanceof Error && isMissingPathError(error)) {
			return [];
		}
		throw error;
	}

	const markdownFiles: string[] = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) {
			continue;
		}

		const childPath = path.join(absoluteRoot, entry.name);
		if (entry.isDirectory()) {
			markdownFiles.push(...(await listMarkdownFiles(childPath, repoRootDir)));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith(".md")) {
			markdownFiles.push(
				path.relative(repoRootDir, childPath).replaceAll(path.sep, "/"),
			);
		}
	}

	return markdownFiles;
}

function parseMarkdownLintArgs(argv: string[]): MarkdownLintOptions | "help" {
	const options: MarkdownLintOptions = {
		format: "text",
		paths: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--help") {
			return "help";
		}

		if (argument === "--paths") {
			while (argv[index + 1] && !argv[index + 1].startsWith("--")) {
				options.paths.push(argv[index + 1]);
				index += 1;
			}
			continue;
		}

		if (argument === "--format") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error(
					`Missing value for --format\n\n${buildMarkdownLintUsage()}`,
				);
			}
			if (value !== "text" && value !== "json") {
				throw new Error(
					`Invalid --format value: ${value}\n\n${buildMarkdownLintUsage()}`,
				);
			}
			options.format = value;
			index += 1;
			continue;
		}

		throw new Error(
			`Unknown argument: ${argument}\n\n${buildMarkdownLintUsage()}`,
		);
	}

	return options;
}

function parseWriteChildPlanArgs(argv: string[]): WriteChildPlanOptions {
	let planPath: string | null = null;
	let programId: string | null = null;
	let summary: string | null = null;
	let title: string | null = null;

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--program-id") {
			programId = resolveRequiredFlagValue(argv, index, argument);
			index += 1;
			continue;
		}
		if (argument === "--plan") {
			planPath = resolveRequiredFlagValue(argv, index, argument);
			index += 1;
			continue;
		}
		if (argument === "--title") {
			title = resolveRequiredFlagValue(argv, index, argument);
			index += 1;
			continue;
		}
		if (argument === "--summary") {
			summary = resolveRequiredFlagValue(argv, index, argument);
			index += 1;
			continue;
		}

		throw new Error(
			`Unknown argument: ${argument}\n\n${buildWriteChildPlanUsage()}`,
		);
	}

	if (!programId || !planPath || !title || !summary) {
		throw new Error(
			`Missing required arguments\n\n${buildWriteChildPlanUsage()}`,
		);
	}
	assertSingleLine("program id", programId);
	assertSingleLine("plan path", planPath);
	assertSingleLine("title", title);
	assertSingleLine("summary", summary);

	return {
		planPath,
		programId,
		summary,
		title,
	};
}

function resolveRequiredFlagValue(argv: string[], index: number, flag: string) {
	const value = argv[index + 1];
	if (!value || value.startsWith("--")) {
		throw new Error(`Missing value for ${flag}`);
	}
	return value;
}

function assertSingleLine(label: string, value: string) {
	if (value.includes("\n") || value.includes("\r")) {
		throw new Error(`Invalid ${label}: value must stay on one line.`);
	}
}

async function writeChildExecPlan(params: {
	options: WriteChildPlanOptions;
	repoRootDir: string;
}) {
	const planPath = validateActiveExecPlanPath(params.options.planPath);
	const createdAt = parseDateFromActivePlanPath(planPath);
	const currentPlanningBrief = await resolveCurrentPlanningBrief({
		repoRootDir: params.repoRootDir,
		programId: params.options.programId,
	});
	const absolutePlanPath = resolveSafeActiveExecPlanPath({
		planPath,
		repoRootDir: params.repoRootDir,
	});
	await mkdir(path.dirname(absolutePlanPath), { recursive: true });
	try {
		await writeFile(
			absolutePlanPath,
			buildChildExecPlanContent({
				createdAt,
				planPath,
				planningBriefPath: currentPlanningBrief.planningBriefPath,
				programId: params.options.programId,
				summary: params.options.summary,
				title: params.options.title,
			}),
			{ encoding: "utf8", flag: "wx" },
		);
	} catch (error) {
		if (error instanceof Error && isFileAlreadyExistsError(error)) {
			throw new Error(`Refusing to overwrite existing ExecPlan: ${planPath}`);
		}
		throw error;
	}

	return `Created ${planPath} with planning_brief ${currentPlanningBrief.planningBriefPath}.`;
}

function validateActiveExecPlanPath(rawPlanPath: string) {
	const planPath = validatePlanPath(rawPlanPath);
	if (planPath !== rawPlanPath.replaceAll("\\", "/")) {
		throw new Error(
			"write-child-plan requires a normalized repo-relative ExecPlan path.",
		);
	}
	if (path.posix.normalize(planPath) !== planPath) {
		throw new Error(
			"write-child-plan requires a normalized repo-relative ExecPlan path.",
		);
	}
	if (
		!/^docs\/exec-plans\/active\/\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(
			planPath,
		)
	) {
		throw new Error(
			"write-child-plan only creates active ExecPlans under docs/exec-plans/active/YYYY-MM-DD-slug.md.",
		);
	}
	return planPath;
}

function resolveSafeActiveExecPlanPath(params: {
	planPath: string;
	repoRootDir: string;
}) {
	const activeRootPath = path.resolve(
		params.repoRootDir,
		"docs",
		"exec-plans",
		"active",
	);
	const targetPath = path.resolve(params.repoRootDir, params.planPath);
	const activeRootRelativePath = path.relative(activeRootPath, targetPath);
	if (
		activeRootRelativePath.startsWith("..") ||
		path.isAbsolute(activeRootRelativePath)
	) {
		throw new Error(
			"write-child-plan target resolved outside docs/exec-plans/active/.",
		);
	}
	return targetPath;
}

function parseDateFromActivePlanPath(planPath: string) {
	const match = planPath.match(
		/^docs\/exec-plans\/active\/(\d{4}-\d{2}-\d{2})-.+\.md$/,
	);
	if (!match?.[1]) {
		throw new Error(
			"Active ExecPlan paths must use docs/exec-plans/active/YYYY-MM-DD-slug.md.",
		);
	}
	return match[1];
}

function buildChildExecPlanContent(params: {
	createdAt: string;
	planPath: string;
	planningBriefPath: string;
	programId: string;
	summary: string;
	title: string;
}) {
	return [
		"---",
		`title: ${JSON.stringify(params.title)}`,
		"status: active",
		`created_at: ${params.createdAt}`,
		"completed_at: null",
		`summary: ${JSON.stringify(params.summary)}`,
		"post_build_recap: null",
		`program_id: ${params.programId}`,
		`planning_brief: ${params.planningBriefPath}`,
		"read_when:",
		"  - Resuming implementation.",
		"  - Validating the completed slice.",
		"---",
		"",
		`# ${params.title}`,
		"",
		"This document is a living execution plan for a Program-linked docs operating-system slice.",
		"",
		"This ExecPlan must be maintained in accordance with `docs/exec-plans/PLANS.md`.",
		"",
		"## Purpose / Big Picture",
		"",
		params.summary,
		"",
		"## Progress",
		"",
		`- [ ] ${params.createdAt}: Created this Program-linked ExecPlan from ${params.planningBriefPath}.`,
		"",
		"## Surprises & Discoveries",
		"",
		"No surprises have been recorded yet.",
		"",
		"## Decision Log",
		"",
		"Decision: Start from the current Program planning brief.",
		"Rationale: The child plan must preserve the immutable Program context that selected this slice.",
		`Date: ${params.createdAt}`,
		"",
		"## Outcomes & Retrospective",
		"",
		"This plan is active. Record final outcomes, validation evidence, and follow-up work here before marking it complete.",
		"",
		"## Context and Orientation",
		"",
		`This plan belongs to Program \`${params.programId}\` and was created from \`${params.planningBriefPath}\`. Replace this paragraph with the repository-specific context before implementation.`,
		"",
		"### In Scope",
		"",
		"Define the concrete files, commands, and behavior that belong in this slice before implementation.",
		"",
		"### Out Of Scope",
		"",
		"Name adjacent work that must not be absorbed into this slice before implementation.",
		"",
		"## Plan of Work",
		"",
		"Describe the implementation sequence in prose before changing production code.",
		"",
		"## Milestones",
		"",
		"Milestone one should produce a small observable behavior and a focused validation command.",
		"",
		"## Concrete Steps",
		"",
		"Work from the repository root and replace these starter steps with the exact commands for this slice.",
		"",
		`    bun run plans:lint -- --plan ${params.planPath}`,
		"",
		"## Validation and Acceptance",
		"",
		"Acceptance requires the implemented behavior to be observable through focused commands and this plan to stay current.",
		"",
		"### Test Commands",
		"",
		`- bun run plans:lint -- --plan ${params.planPath}`,
		"",
		"## Idempotence and Recovery",
		"",
		"Document safe reruns, cleanup, and rollback steps before implementation changes leave the worktree.",
		"",
		"## Artifacts and Notes",
		"",
		"Record concise evidence snippets here as validation runs complete.",
		"",
		"## Interfaces and Dependencies",
		"",
		"Name the modules, commands, docs, services, or data contracts this slice depends on before implementation.",
		"",
	].join("\n");
}

function isMissingPathError(error: Error): error is NodeJS.ErrnoException {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function isFileAlreadyExistsError(
	error: Error,
): error is NodeJS.ErrnoException {
	return error instanceof Error && "code" in error && error.code === "EEXIST";
}

function buildProgramsLintUsage() {
	return "Usage: ship-by-sunday docs-operating-system programs-lint [--repo <path>]";
}

function buildDocsValidateUsage() {
	return "Usage: ship-by-sunday docs-operating-system docs-validate [--repo <path>]";
}

function buildDocsRefreshQualityUsage() {
	return "Usage: ship-by-sunday docs-operating-system docs-refresh-quality [--repo <path>]";
}

function buildNativeCommandProofUsage() {
	return "Usage: ship-by-sunday docs-operating-system native-command-proof [--repo <path>]";
}

function buildMarkdownLintUsage() {
	return [
		"Usage: ship-by-sunday docs-operating-system markdown-lint [--paths <repo/path> [more paths...]] [--format text|json] [--repo <path>]",
		"",
		"Options:",
		"  --paths <...>     One or more repo-relative markdown paths or directories.",
		"  --format <value>  Output format. Allowed values: text, json. Default: text.",
		"  --repo <path>     Target repository root. Defaults to the current directory.",
		"  --help            Show this usage output.",
	].join("\n");
}

function buildWriteChildPlanUsage() {
	return [
		"Usage: ship-by-sunday docs-operating-system write-child-plan --program-id <id> --plan <docs/exec-plans/active/YYYY-MM-DD-slice.md> --title <title> --summary <summary> [--repo <path>]",
		"",
		"Options:",
		"  --program-id <id>  Existing active Program id.",
		"  --plan <path>      New active ExecPlan path to create.",
		"  --title <title>    ExecPlan title and H1.",
		"  --summary <text>   One-sentence ExecPlan summary.",
		"  --repo <path>      Target repository root. Defaults to the current directory.",
		"  --help             Show this usage output.",
	].join("\n");
}
