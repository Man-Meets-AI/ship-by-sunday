import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type PublicReadinessIssue = {
	line: number;
	message: string;
	repoPath: string;
};

const CURRENT_TRUTH_FILE_ROOTS = [
	"AGENTS.md",
	"DESIGN.md",
	"GEMINI.md",
	"README.md",
	"apps/web/AGENTS.md",
	"apps/web/convex/README.md",
	"apps/web/content/docs/",
	"docs/ARCHITECTURE.md",
	"docs/DESIGN.md",
	"docs/FRONTEND.md",
	"docs/PRODUCT_SENSE.md",
	"docs/QUALITY_SCORE.md",
	"docs/RELIABILITY.md",
	"docs/SECURITY.md",
	"docs/design-docs/",
	"docs/index.md",
] as const;

const EXCLUDED_CURRENT_TRUTH_PREFIXES = [
	"docs/archive/",
	"docs/codex/",
	"docs/exec-plans/completed/",
	"docs/generated/",
	"docs/openai/",
	"docs/programs/completed/",
	"docs/ship-by-sunday/",
] as const;

const PRIVATE_IDENTIFIER_PATTERNS = [
	{
		pattern: /\/Users\/[^/\s)]+/u,
		message: "Absolute /Users/... path is not public-ready.",
	},
	{
		pattern: /\b(?:dev\.)?man-meets-ai\.com\b/u,
		message: "Concrete private host should be a placeholder in current docs.",
	},
	{
		pattern: /\bmma-shipbysunday\b/u,
		message: "Internal Vercel project id should not appear in current docs.",
	},
	{
		pattern: /\bMan-Meets-AI\/ship-by-sunday\b/u,
		message: "Private repository slug should not appear in current docs.",
	},
	{
		pattern: /\b[a-z]+-[a-z]+-\d{3,}\b/u,
		message: "Internal deployment name should not appear in current docs.",
	},
	{
		pattern: /\b(?:dpl|prj|team)_[A-Za-z0-9]+\b/u,
		message: "Internal deployment or account id should not appear in current docs.",
	},
] as const;

const STALE_PRODUCT_VOCABULARY_PATTERNS = [
	{
		pattern: /\bShip Kit\b/u,
		message: "Use Ship by Sunday Codebase instead of stale Ship Kit vocabulary.",
	},
	{
		pattern: /\bStarter Snapshot\b/u,
		message:
			"Use Ship by Sunday Codebase instead of stale Starter Snapshot vocabulary.",
	},
	{
		pattern: /\bAgent-Ready Packs\b/u,
		message:
			"Use Ship by Sunday Codebase language instead of stale Agent-Ready Packs vocabulary.",
	},
	{
		pattern: /\bstage-pack\b/u,
		message: "Do not describe the current product as stage-pack based.",
	},
] as const;

function isMarkdownPath(repoPath: string): boolean {
	return (
		repoPath.endsWith(".md") ||
		repoPath.endsWith(".mdx") ||
		repoPath === "AGENTS.md" ||
		repoPath === "GEMINI.md" ||
		repoPath === "README.md" ||
		repoPath === "DESIGN.md"
	);
}

function isCurrentTruthPath(repoPath: string): boolean {
	if (
		EXCLUDED_CURRENT_TRUTH_PREFIXES.some((prefix) =>
			repoPath.startsWith(prefix),
		)
	) {
		return false;
	}

	return CURRENT_TRUTH_FILE_ROOTS.some((root) => {
		if (root.endsWith("/")) {
			return repoPath.startsWith(root);
		}
		return repoPath === root;
	});
}

async function listTrackedCurrentTruthFiles(repoRootDir: string): Promise<string[]> {
	const { stdout } = await execFileAsync("git", ["ls-files"], {
		cwd: repoRootDir,
	});

	return stdout
		.split("\n")
		.map((line) => line.trim())
		.filter((repoPath) => repoPath !== "")
		.filter(isMarkdownPath)
		.filter(isCurrentTruthPath)
		.sort();
}

function hasLegacyStartRouteClaim(line: string, context: string): boolean {
	if (!line.includes("`/start`")) {
		return false;
	}

	if (
		/\b(?:compatibility|legacy|redirect|redirects|forward|forwards|matcher|disallow)\b/iu.test(
			context,
		)
	) {
		return false;
	}

	return true;
}

function collectIssuesForFile(repoPath: string, text: string): PublicReadinessIssue[] {
	const issues: PublicReadinessIssue[] = [];
	const lines = text.split("\n");

	lines.forEach((line, index) => {
		const lineNumber = index + 1;
		const context = lines
			.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3))
			.join("\n");

		if (
			repoPath === "docs/design-docs/scripts.md" &&
			line.includes("public-readiness:lint")
		) {
			return;
		}

		if (line.includes("features/")) {
			issues.push({
				line: lineNumber,
				message:
					"Stale apps/web/features path claim found. Point at current app, lib, or platform ownership.",
				repoPath,
			});
		}

		if (/Start -> Product -> Design -> Marketing -> Build Plan/u.test(line)) {
			issues.push({
				line: lineNumber,
				message:
					"Old staged journey found. Current protected truth is /codebase -> /review.",
				repoPath,
			});
		}

		if (hasLegacyStartRouteClaim(line, context)) {
			issues.push({
				line: lineNumber,
				message:
					"`/start` is only a compatibility redirect. Current route guidance should use `/codebase`.",
				repoPath,
			});
		}

		for (const rule of PRIVATE_IDENTIFIER_PATTERNS) {
			if (rule.pattern.test(line)) {
				issues.push({
					line: lineNumber,
					message: rule.message,
					repoPath,
				});
			}
		}

		for (const rule of STALE_PRODUCT_VOCABULARY_PATTERNS) {
			if (rule.pattern.test(line)) {
				issues.push({
					line: lineNumber,
					message: rule.message,
					repoPath,
				});
			}
		}
	});

	return issues;
}

function formatIssues(issues: PublicReadinessIssue[]): string {
	if (issues.length === 0) {
		return "public-readiness: ok";
	}

	return issues
		.map((issue) => `${issue.repoPath}:${issue.line}: ${issue.message}`)
		.join("\n");
}

async function main(): Promise<void> {
	const repoRootDir = process.cwd();
	const repoPaths = await listTrackedCurrentTruthFiles(repoRootDir);
	const issues = (
		await Promise.all(
			repoPaths.map(async (repoPath) => {
				const text = await readTrackedFileWithinRepo(repoRootDir, repoPath);
				return collectIssuesForFile(repoPath, text);
			}),
		)
	).flat();

	console.log(formatIssues(issues));

	if (issues.length > 0) {
		process.exitCode = 1;
	}
}

async function readTrackedFileWithinRepo(repoRootDir: string, repoPath: string) {
	const fullPath = path.join(repoRootDir, repoPath);
	const stats = await lstat(fullPath);
	if (stats.isSymbolicLink()) {
		throw new Error(`public-readiness refuses to read symlink: ${repoPath}`);
	}
	const [realRootPath, realFilePath] = await Promise.all([
		realpath(repoRootDir),
		realpath(fullPath),
	]);
	const relativePath = path.relative(realRootPath, realFilePath);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		throw new Error(`public-readiness path escapes repository: ${repoPath}`);
	}
	return await readFile(fullPath, "utf8");
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
	await main();
}
