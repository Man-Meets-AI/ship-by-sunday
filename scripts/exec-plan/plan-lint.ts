import { readFile } from "node:fs/promises";

import YAML from "yaml";

import type { JsonObject, JsonValue } from "../json-value";
import { resolvePlanFilePath } from "./cli";
import { buildExecPlanMaintenanceSentence } from "./paths";

const REQUIRED_FRONTMATTER_KEYS = [
	"title",
	"status",
	"created_at",
	"completed_at",
	"summary",
	"post_build_recap",
	"read_when",
] as const;

const OPTIONAL_FRONTMATTER_KEYS = ["program_id", "planning_brief"] as const;
const ALLOWED_FRONTMATTER_KEYS = new Set([
	...REQUIRED_FRONTMATTER_KEYS,
	...OPTIONAL_FRONTMATTER_KEYS,
]);
const ALLOWED_STATUSES = new Set(["active", "complete"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PROGRAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSIONED_PROGRAM_BRIEF_PATH_PATTERN =
	/^docs\/programs\/(active|completed)\/\d{4}-\d{2}-\d{2}-([a-z0-9]+(?:-[a-z0-9]+)*)\/planning-brief-(\d+)\.md$/;
const REQUIRED_SECTION_HEADINGS = [
	"Purpose / Big Picture",
	"Progress",
	"Surprises & Discoveries",
	"Decision Log",
	"Outcomes & Retrospective",
	"Context and Orientation",
	"Plan of Work",
	"Milestones",
	"Concrete Steps",
	"Validation and Acceptance",
	"Idempotence and Recovery",
	"Artifacts and Notes",
	"Interfaces and Dependencies",
] as const;

const KNOWN_COMMAND_STARTERS = new Set([
	"bash",
	"black",
	"bun",
	"cargo",
	"cd",
	"curl",
	"docker",
	"docker-compose",
	"git",
	"go",
	"just",
	"make",
	"node",
	"npm",
	"npx",
	"oxfmt",
	"oxlint",
	"pnpm",
	"pytest",
	"python",
	"python3",
	"ruff",
	"sh",
	"uv",
	"wget",
	"yarn",
	"zsh",
]);

export type ExecPlanLintReport = {
	planPath: string;
	issues: string[];
};

type FrontmatterParseResult =
	| {
			frontmatterSource: string;
			body: string;
	  }
	| {
			issue: string;
	  };

function parsePlanFrontmatter(text: string): FrontmatterParseResult {
	if (!text.startsWith("---\n")) {
		return {
			issue: "Missing YAML frontmatter block at the top of the plan.",
		};
	}

	const closingDelimiterIndex = text.indexOf("\n---\n", 4);
	if (closingDelimiterIndex === -1) {
		return {
			issue: "Missing closing YAML frontmatter delimiter.",
		};
	}

	return {
		frontmatterSource: text.slice(4, closingDelimiterIndex),
		body: text.slice(closingDelimiterIndex + 5).trim(),
	};
}

function parseYamlMetadata(source: string): {
	metadata: JsonObject;
	issues: string[];
} {
	const document = YAML.parseDocument(source);
	const issues = document.errors.map((error) => error.message);

	if (issues.length > 0) {
		return {
			metadata: {},
			issues,
		};
	}

	const parsedValue = document.toJS() as JsonValue;
	if (
		typeof parsedValue !== "object" ||
		parsedValue === null ||
		Array.isArray(parsedValue)
	) {
		return {
			metadata: {},
			issues: ["Frontmatter must parse to a YAML object."],
		};
	}

	return {
		metadata: parsedValue as JsonObject,
		issues: [],
	};
}

function isNonEmptyString(value: JsonValue | undefined): value is string {
	return typeof value === "string" && value.trim() !== "";
}

function extractH1(body: string): string | null {
	const match = body.match(/^# (.+)$/m);
	return match?.[1]?.trim() ?? null;
}

function extractMarkdownSection(body: string, heading: string): string | null {
	const lines = body.split("\n");
	const headingLine = `## ${heading}`;
	const startIndex = lines.findIndex((line) => line === headingLine);
	if (startIndex === -1) {
		return null;
	}

	let endIndex = lines.length;
	for (let index = startIndex + 1; index < lines.length; index += 1) {
		if (lines[index]?.startsWith("## ")) {
			endIndex = index;
			break;
		}
	}

	return lines
		.slice(startIndex + 1, endIndex)
		.join("\n")
		.trim();
}

function extractMarkdownSubsection(
	sectionBody: string,
	heading: string,
): string | null {
	const lines = sectionBody.split("\n");
	const headingLine = `### ${heading}`;
	const startIndex = lines.findIndex((line) => line === headingLine);
	if (startIndex === -1) {
		return null;
	}

	let endIndex = lines.length;
	for (let index = startIndex + 1; index < lines.length; index += 1) {
		if (lines[index]?.startsWith("### ") || lines[index]?.startsWith("## ")) {
			endIndex = index;
			break;
		}
	}

	return lines
		.slice(startIndex + 1, endIndex)
		.join("\n")
		.trim();
}

function findMarkdownSubsectionStartIndex(
	sectionBody: string,
	heading: string,
): number {
	return sectionBody.split("\n").findIndex((line) => line === `### ${heading}`);
}

function isRunnableCommandLine(line: string): boolean {
	const trimmed = line.trim().replace(/^\$\s*/, "");
	if (trimmed === "" || trimmed === "\\") {
		return false;
	}

	const withoutEnvAssignments = trimmed.replace(
		/^(?:[A-Z_][A-Z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+)*/,
		"",
	);
	const commandToken = withoutEnvAssignments.split(/\s+/)[0] ?? "";
	if (commandToken === "") {
		return false;
	}

	if (/^(?:\.\.?\/|~\/|\/)/.test(commandToken)) {
		return true;
	}

	return KNOWN_COMMAND_STARTERS.has(commandToken);
}

function hasRunnableCommand(sectionBody: string): boolean {
	const lines = sectionBody.split("\n");
	let inFence = false;

	for (const rawLine of lines) {
		const trimmed = rawLine.trim();
		if (trimmed.startsWith("```")) {
			inFence = !inFence;
			continue;
		}

		if (trimmed === "") {
			continue;
		}

		if (inFence && isRunnableCommandLine(trimmed)) {
			return true;
		}

		if (/^(?: {4}|\t)/.test(rawLine) && isRunnableCommandLine(trimmed)) {
			return true;
		}

		if (
			/^-\s+/.test(trimmed) &&
			isRunnableCommandLine(trimmed.slice(2).trim())
		) {
			return true;
		}
	}

	return false;
}

function isMeaningfulRetrospective(sectionBody: string | null): boolean {
	if (!sectionBody || sectionBody.trim() === "") {
		return false;
	}

	const normalized = sectionBody.trim();
	if (
		/^not complete yet\.?$/i.test(normalized) ||
		/^tbd\.?$/i.test(normalized)
	) {
		return false;
	}

	return true;
}

function validateStringField(
	metadata: JsonObject,
	key: (typeof REQUIRED_FRONTMATTER_KEYS)[number],
	issues: string[],
): void {
	if (!isNonEmptyString(metadata[key])) {
		issues.push(`Frontmatter ${key} must be a non-empty string.`);
	}
}

function validateDateField(
	metadata: JsonObject,
	key: "created_at" | "completed_at",
	issues: string[],
): void {
	const value = metadata[key];
	if (value === null && key === "completed_at") {
		return;
	}
	if (!isNonEmptyString(value) || !ISO_DATE_PATTERN.test(value)) {
		issues.push(
			`Frontmatter ${key} must be a YYYY-MM-DD string${
				key === "completed_at" ? " or null" : ""
			}.`,
		);
	}
}

function validateReadWhen(metadata: JsonObject, issues: string[]): void {
	const value = metadata.read_when;
	if (!Array.isArray(value) || value.length === 0) {
		issues.push("Frontmatter read_when must be a non-empty YAML list.");
		return;
	}

	value.forEach((entry, index) => {
		if (!isNonEmptyString(entry)) {
			issues.push(
				`Frontmatter read_when[${index}] must be a non-empty string.`,
			);
		}
	});
}

function validatePostBuildRecap(metadata: JsonObject, issues: string[]): void {
	const value = metadata.post_build_recap;
	if (value !== null && !isNonEmptyString(value)) {
		issues.push(
			"Frontmatter post_build_recap must be a non-empty string or null.",
		);
	}
}

function validateProgramLinkage(metadata: JsonObject, issues: string[]): void {
	const programId = metadata.program_id;
	const planningBrief = metadata.planning_brief;
	const hasProgramId = programId !== undefined;
	const hasPlanningBrief = planningBrief !== undefined;

	if (!hasProgramId && !hasPlanningBrief) {
		return;
	}

	if (!hasProgramId) {
		issues.push(
			"Frontmatter program_id is required when planning_brief is present.",
		);
	}

	if (!hasPlanningBrief) {
		issues.push(
			"Frontmatter planning_brief is required when program_id is present.",
		);
	}

	if (!hasProgramId || !hasPlanningBrief) {
		return;
	}

	if (!isNonEmptyString(programId)) {
		issues.push("Frontmatter program_id must be a non-empty string.");
	} else if (!PROGRAM_ID_PATTERN.test(programId)) {
		issues.push(
			"Frontmatter program_id must be a stable kebab-case Program id slug.",
		);
	}

	if (!isNonEmptyString(planningBrief)) {
		issues.push("Frontmatter planning_brief must be a non-empty string.");
		return;
	}

	if (
		planningBrief.startsWith("/") ||
		planningBrief.startsWith("~/") ||
		planningBrief.includes("://")
	) {
		issues.push(
			"Frontmatter planning_brief must be a repo-relative path, not an absolute path or URL.",
		);
	}

	if (planningBrief.endsWith("current-planning-brief.txt")) {
		issues.push(
			"Frontmatter planning_brief must point to an immutable versioned planning brief, not current-planning-brief.txt.",
		);
	}

	const pathMatch = planningBrief.match(VERSIONED_PROGRAM_BRIEF_PATH_PATTERN);
	if (!pathMatch) {
		issues.push(
			"Frontmatter planning_brief must live under docs/programs/(active|completed)/<YYYY-MM-DD-program-id>/planning-brief-<N>.md.",
		);
		return;
	}

	const pathProgramId = pathMatch[2];
	if (isNonEmptyString(programId) && pathProgramId !== programId) {
		issues.push(
			`Frontmatter planning_brief must live under docs/programs/(active|completed)/<YYYY-MM-DD-${programId}>/ so it matches program_id.`,
		);
	}
}

function validateRequiredSections(body: string, issues: string[]): void {
	for (const heading of REQUIRED_SECTION_HEADINGS) {
		if (extractMarkdownSection(body, heading) === null) {
			issues.push(`Missing required section: ## ${heading}.`);
		}
	}
}

function validateExactBodyContract(body: string, issues: string[]): void {
	const contextAndOrientation = extractMarkdownSection(
		body,
		"Context and Orientation",
	);
	if (contextAndOrientation !== null) {
		const inScopeStartIndex = findMarkdownSubsectionStartIndex(
			contextAndOrientation,
			"In Scope",
		);
		const inScope = extractMarkdownSubsection(
			contextAndOrientation,
			"In Scope",
		);
		if (inScope === null) {
			issues.push(
				"Section `## Context and Orientation` must include the exact subsection `### In Scope`.",
			);
		} else if (inScope === "") {
			issues.push("Subsection `### In Scope` must not be empty.");
		}

		const outOfScopeStartIndex = findMarkdownSubsectionStartIndex(
			contextAndOrientation,
			"Out Of Scope",
		);
		const outOfScope = extractMarkdownSubsection(
			contextAndOrientation,
			"Out Of Scope",
		);
		if (outOfScope === null) {
			issues.push(
				"Section `## Context and Orientation` must include the exact subsection `### Out Of Scope`.",
			);
		} else if (outOfScope === "") {
			issues.push("Subsection `### Out Of Scope` must not be empty.");
		}

		if (
			inScopeStartIndex !== -1 &&
			outOfScopeStartIndex !== -1 &&
			outOfScopeStartIndex < inScopeStartIndex
		) {
			issues.push(
				"Section `## Context and Orientation` must list `### In Scope` before `### Out Of Scope`.",
			);
		}
	}

	const validationAndAcceptance = extractMarkdownSection(
		body,
		"Validation and Acceptance",
	);
	if (validationAndAcceptance !== null) {
		const testCommands = extractMarkdownSubsection(
			validationAndAcceptance,
			"Test Commands",
		);
		if (testCommands === null) {
			issues.push(
				"Section `## Validation and Acceptance` must include the exact subsection `### Test Commands`.",
			);
		} else if (testCommands === "") {
			issues.push("Subsection `### Test Commands` must not be empty.");
		} else if (!hasRunnableCommand(testCommands)) {
			issues.push(
				"Subsection `### Test Commands` must include at least one runnable command.",
			);
		}
	}
}

function validateMaintenanceSentence(body: string, issues: string[]): void {
	const maintenanceSentence = buildExecPlanMaintenanceSentence();
	if (!body.includes(maintenanceSentence)) {
		issues.push(
			`Plan body must include the exact maintenance sentence: ${maintenanceSentence}`,
		);
	}
}

function validatePlanLaneAgainstStatus(
	planPath: string,
	metadata: JsonObject,
	issues: string[],
): void {
	const status = metadata.status;
	if (!isNonEmptyString(status)) {
		return;
	}

	if (planPath.startsWith("docs/exec-plans/active/") && status === "complete") {
		issues.push(
			"Plans under docs/exec-plans/active/ must not use status: complete. Move the file to docs/exec-plans/completed/ when the plan is finished.",
		);
	}

	if (
		planPath.startsWith("docs/exec-plans/completed/") &&
		status === "active"
	) {
		issues.push(
			"Plans under docs/exec-plans/completed/ must not use status: active. Keep unfinished plans under docs/exec-plans/active/.",
		);
	}
}

export async function lintExecPlan(params: {
	repoRootDir: string;
	planPath: string;
}): Promise<ExecPlanLintReport> {
	const fullPath = resolvePlanFilePath(params.repoRootDir, params.planPath);
	const text = await readFile(fullPath, "utf8");
	const issues: string[] = [];
	const parsedFrontmatter = parsePlanFrontmatter(text);

	if ("issue" in parsedFrontmatter) {
		return {
			planPath: params.planPath,
			issues: [parsedFrontmatter.issue],
		};
	}

	const { frontmatterSource, body } = parsedFrontmatter;
	const { metadata, issues: yamlIssues } = parseYamlMetadata(frontmatterSource);
	issues.push(...yamlIssues);

	for (const key of REQUIRED_FRONTMATTER_KEYS) {
		if (!(key in metadata)) {
			issues.push(`Missing required frontmatter key: ${key}.`);
		}
	}

	for (const key of Object.keys(metadata)) {
		if (
			!ALLOWED_FRONTMATTER_KEYS.has(
				key as (typeof REQUIRED_FRONTMATTER_KEYS)[number],
			)
		) {
			issues.push(`Unexpected frontmatter key: ${key}.`);
		}
	}

	if (yamlIssues.length > 0) {
		return {
			planPath: params.planPath,
			issues,
		};
	}

	validateStringField(metadata, "title", issues);
	validateStringField(metadata, "summary", issues);
	validateDateField(metadata, "created_at", issues);
	validateDateField(metadata, "completed_at", issues);
	validateReadWhen(metadata, issues);
	validatePostBuildRecap(metadata, issues);
	validateProgramLinkage(metadata, issues);

	const status = metadata.status;
	if (!isNonEmptyString(status) || !ALLOWED_STATUSES.has(status)) {
		issues.push("Frontmatter status must be one of: active, complete.");
	}

	const h1 = extractH1(body);
	if (!h1) {
		issues.push("Plan body must include an H1 that matches frontmatter title.");
	} else if (metadata.title !== h1) {
		issues.push(
			`Frontmatter title must match the H1 exactly. Found title "${String(metadata.title)}" and H1 "${h1}".`,
		);
	}

	validateRequiredSections(body, issues);
	validateMaintenanceSentence(body, issues);
	validateExactBodyContract(body, issues);
	validatePlanLaneAgainstStatus(params.planPath, metadata, issues);

	if (metadata.status === "active") {
		if (metadata.completed_at !== null) {
			issues.push(
				"Frontmatter completed_at must be null while status is active.",
			);
		}
	}

	if (metadata.status === "complete") {
		if (metadata.completed_at === null) {
			issues.push(
				"Frontmatter completed_at must be a real date when status is complete.",
			);
		}
		if (!isNonEmptyString(metadata.post_build_recap)) {
			issues.push(
				"Frontmatter post_build_recap must be non-empty when status is complete.",
			);
		}
		const retrospective = extractMarkdownSection(
			body,
			"Outcomes & Retrospective",
		);
		if (!isMeaningfulRetrospective(retrospective)) {
			issues.push(
				"Outcomes & Retrospective must be meaningfully filled in when status is complete.",
			);
		}
	}

	return {
		planPath: params.planPath,
		issues,
	};
}

export async function lintExecPlans(params: {
	repoRootDir: string;
	planPaths: string[];
}): Promise<ExecPlanLintReport[]> {
	return await Promise.all(
		params.planPaths.map((planPath) =>
			lintExecPlan({
				repoRootDir: params.repoRootDir,
				planPath,
			}),
		),
	);
}

export function formatExecPlanLintReports(
	reports: ExecPlanLintReport[],
): string {
	const lines: string[] = [];

	for (const report of reports) {
		if (report.issues.length === 0) {
			lines.push(`${report.planPath}: ok`);
			continue;
		}

		lines.push(report.planPath);
		for (const issue of report.issues) {
			lines.push(`- ${issue}`);
		}
	}

	return `${lines.join("\n")}\n`;
}
