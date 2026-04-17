import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { lintExecPlan } from "../exec-plan/plan-lint";
import { extractMarkdownH1, parseMarkdownFrontmatter } from "./frontmatter";
import { FAMILY_RULES, resolveMarkdownMetadataFamily } from "./families";

const execFileAsync = promisify(execFile);
const COMPLETED_EXECPLAN_PREFIX = "docs/exec-plans/completed/";
const BLOG_MEDIA_KINDS = new Set(["image", "video"]);
export type MarkdownMetadataLintReport = {
	family: string | null;
	issues: string[];
	repoPath: string;
};

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim() !== "";
}

function validateReadWhen(value: unknown, issues: string[]): void {
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

function validateRepoDocMetadata(
	metadata: Record<string, unknown>,
	issues: string[],
): void {
	if (!isNonEmptyString(metadata.title)) {
		issues.push("Frontmatter title must be a non-empty string.");
	}
	if (!isNonEmptyString(metadata.summary)) {
		issues.push("Frontmatter summary must be a non-empty string.");
	}
	if (!isNonEmptyString(metadata.docType)) {
		issues.push("Frontmatter docType must be a non-empty string.");
	}
	if (
		!isNonEmptyString(metadata.status) ||
		(metadata.status !== "active" && metadata.status !== "complete")
	) {
		issues.push("Frontmatter status must be one of: active, complete.");
	}
	validateReadWhen(metadata.read_when, issues);
}

function validateWebDocsPageMetadata(
	metadata: Record<string, unknown>,
	issues: string[],
): void {
	if (!isNonEmptyString(metadata.title)) {
		issues.push("Frontmatter title must be a non-empty string.");
	}
	if (!isNonEmptyString(metadata.description)) {
		issues.push("Frontmatter description must be a non-empty string.");
	}
}

function validateBlogPostMetadata(
	metadata: Record<string, unknown>,
	issues: string[],
): void {
	if (!isNonEmptyString(metadata.title)) {
		issues.push("Frontmatter title must be a non-empty string.");
	}
	if (!isNonEmptyString(metadata.description)) {
		issues.push("Frontmatter description must be a non-empty string.");
	}
	if (!isNonEmptyString(metadata.summary)) {
		issues.push("Frontmatter summary must be a non-empty string.");
	}
	if (
		!isNonEmptyString(metadata.publishedAt) ||
		Number.isNaN(Date.parse(metadata.publishedAt))
	) {
		issues.push("Frontmatter publishedAt must be a valid ISO date string.");
	}
	if (!isNonEmptyString(metadata.authorName)) {
		issues.push("Frontmatter authorName must be a non-empty string.");
	}
	if (!isNonEmptyString(metadata.authorRole)) {
		issues.push("Frontmatter authorRole must be a non-empty string.");
	}
	if (
		!isNonEmptyString(metadata.heroMediaKind) ||
		!BLOG_MEDIA_KINDS.has(metadata.heroMediaKind)
	) {
		issues.push("Frontmatter heroMediaKind must be one of: image, video.");
	}
	if (!isNonEmptyString(metadata.heroMediaSrc)) {
		issues.push("Frontmatter heroMediaSrc must be a non-empty string.");
	}
	if (
		"featured" in metadata &&
		metadata.featured !== undefined &&
		typeof metadata.featured !== "boolean"
	) {
		issues.push("Frontmatter featured must be a boolean when present.");
	}
	if (
		"draft" in metadata &&
		metadata.draft !== undefined &&
		typeof metadata.draft !== "boolean"
	) {
		issues.push("Frontmatter draft must be a boolean when present.");
	}
	if (
		metadata.heroMediaKind === "video" &&
		!isNonEmptyString(metadata.heroPosterSrc)
	) {
		issues.push(
			"Frontmatter heroPosterSrc is required when heroMediaKind is video.",
		);
	}
}

function validateMetadataForFamily(
	family: Exclude<
		ReturnType<typeof resolveMarkdownMetadataFamily>,
		null | "exec_plan"
	>,
	metadata: Record<string, unknown>,
	issues: string[],
): void {
	switch (family) {
		case "repo_doc":
			validateRepoDocMetadata(metadata, issues);
			return;
		case "web_docs_page":
			validateWebDocsPageMetadata(metadata, issues);
			return;
		case "blog_post":
			validateBlogPostMetadata(metadata, issues);
			return;
	}
}

export async function lintMarkdownMetadataFile(params: {
	repoPath: string;
	repoRootDir: string;
}): Promise<MarkdownMetadataLintReport> {
	const family = resolveMarkdownMetadataFamily(params.repoPath);
	if (!family) {
		return {
			family: null,
			issues: [],
			repoPath: params.repoPath,
		};
	}

	if (family === "exec_plan") {
		const report = await lintExecPlan({
			repoRootDir: params.repoRootDir,
			planPath: params.repoPath,
		});

		return {
			family,
			issues: report.issues,
			repoPath: params.repoPath,
		};
	}

	const rule = FAMILY_RULES[family];
	const fullPath = path.join(params.repoRootDir, params.repoPath);
	const text = await readFile(fullPath, "utf8");
	const parsed = parseMarkdownFrontmatter(text);
	if ("issue" in parsed) {
		return {
			family,
			issues: [parsed.issue],
			repoPath: params.repoPath,
		};
	}

	const issues: string[] = [];
	const metadata = parsed.metadata;

	for (const key of rule.requiredKeys) {
		if (!(key in metadata)) {
			issues.push(`Missing required frontmatter key: ${key}.`);
		}
	}

	if (!rule.allowUnknownKeys) {
		const allowedKeys = new Set([
			...rule.requiredKeys,
			...(rule.optionalKeys ?? []),
		]);
		for (const key of Object.keys(metadata)) {
			if (!allowedKeys.has(key)) {
				issues.push(`Unexpected frontmatter key: ${key}.`);
			}
		}
	}

	validateMetadataForFamily(family, metadata, issues);

	if (rule.requireH1TitleMatch) {
		const h1 = extractMarkdownH1(parsed.body);
		if (!h1) {
			issues.push(
				"Doc body must include an H1 that matches frontmatter title.",
			);
		} else if (metadata.title !== h1) {
			issues.push(
				`Frontmatter title must match the H1 exactly. Found title "${String(metadata.title)}" and H1 "${h1}".`,
			);
		}
	}

	return {
		family,
		issues,
		repoPath: params.repoPath,
	};
}

async function listTrackedMarkdownFiles(
	repoRootDir: string,
): Promise<string[]> {
	const { stdout } = await execFileAsync("git", ["ls-files"], {
		cwd: repoRootDir,
	});

	return stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(
			(line) => line !== "" && (line.endsWith(".md") || line.endsWith(".mdx")),
		);
}

async function collectMarkdownFilesFromPath(params: {
	repoRootDir: string;
	requestedPath: string;
}): Promise<string[]> {
	const normalizedRequestedPath = params.requestedPath
		.replaceAll("\\", "/")
		.replace(/\/+$/, "");
	const absolutePath = path.join(params.repoRootDir, normalizedRequestedPath);
	const fileStat = await stat(absolutePath);

	if (fileStat.isFile()) {
		return normalizedRequestedPath.endsWith(".md") ||
			normalizedRequestedPath.endsWith(".mdx")
			? [normalizedRequestedPath]
			: [];
	}

	const entries = await readdir(absolutePath, { withFileTypes: true });
	const collected: string[] = [];
	for (const entry of entries) {
		const childRequestedPath = path.posix.join(
			normalizedRequestedPath,
			entry.name,
		);
		if (entry.isDirectory()) {
			collected.push(
				...(await collectMarkdownFilesFromPath({
					repoRootDir: params.repoRootDir,
					requestedPath: childRequestedPath,
				})),
			);
			continue;
		}

		if (
			entry.isFile() &&
			(childRequestedPath.endsWith(".md") ||
				childRequestedPath.endsWith(".mdx"))
		) {
			collected.push(childRequestedPath);
		}
	}

	return collected;
}

function normalizeRequestedPath(requestedPath: string): string {
	return requestedPath.replaceAll("\\", "/").replace(/\/+$/, "");
}

function shouldIncludeCompletedExecPlans(requestedPaths?: string[]): boolean {
	if (!requestedPaths || requestedPaths.length === 0) {
		return false;
	}

	return requestedPaths.some((requestedPath) => {
		const normalizedRequestedPath = normalizeRequestedPath(requestedPath);
		return (
			normalizedRequestedPath === "docs/exec-plans/completed" ||
			normalizedRequestedPath.startsWith(COMPLETED_EXECPLAN_PREFIX)
		);
	});
}

export async function resolveMarkdownLintTargets(params: {
	repoRootDir: string;
	requestedPaths?: string[];
}): Promise<string[]> {
	const includeCompletedExecPlans = shouldIncludeCompletedExecPlans(
		params.requestedPaths,
	);

	if (!params.requestedPaths || params.requestedPaths.length === 0) {
		const trackedMarkdownFiles = await listTrackedMarkdownFiles(
			params.repoRootDir,
		);
		return trackedMarkdownFiles
			.filter((repoPath) => {
				if (
					!includeCompletedExecPlans &&
					repoPath.startsWith(COMPLETED_EXECPLAN_PREFIX)
				) {
					return false;
				}
				return resolveMarkdownMetadataFamily(repoPath) !== null;
			})
			.sort();
	}

	const collected = await Promise.all(
		params.requestedPaths.map((requestedPath) =>
			collectMarkdownFilesFromPath({
				repoRootDir: params.repoRootDir,
				requestedPath,
			}),
		),
	);

	return [...new Set(collected.flat())]
		.filter((repoPath) => {
			if (
				!includeCompletedExecPlans &&
				repoPath.startsWith(COMPLETED_EXECPLAN_PREFIX)
			) {
				return false;
			}
			return resolveMarkdownMetadataFamily(repoPath) !== null;
		})
		.sort();
}

export async function lintMarkdownMetadata(params: {
	repoRootDir?: string;
	requestedPaths?: string[];
}): Promise<MarkdownMetadataLintReport[]> {
	const repoRootDir = params.repoRootDir ?? process.cwd();
	const targets = await resolveMarkdownLintTargets({
		repoRootDir,
		requestedPaths: params.requestedPaths,
	});

	return Promise.all(
		targets.map((repoPath) =>
			lintMarkdownMetadataFile({
				repoPath,
				repoRootDir,
			}),
		),
	);
}

export function formatMarkdownMetadataLintReports(
	reports: MarkdownMetadataLintReport[],
): string {
	return reports
		.map((report) => {
			if (report.issues.length === 0) {
				return `${report.repoPath}: ok`;
			}

			const issueLines = report.issues.map((issue) => `  - ${issue}`);
			return [report.repoPath, ...issueLines].join("\n");
		})
		.join("\n");
}
