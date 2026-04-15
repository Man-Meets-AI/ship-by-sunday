const appRootPrefix = "apps/web/";

export const customerSafeRepoExcludedPathSegments = [
	".next",
	".vercel",
	"coverage",
	"node_modules",
	"scripts/vendor",
	"test-results",
] as const;

export const customerSafeRepoRootFilePaths = [
	".gitignore",
	".oxfmtrc.json",
	".oxlintrc.json",
	"bun.lock",
	"bunfig.toml",
	"package.json",
	"docs/exec-plans/PLANS.md",
] as const;

export const customerSafeAppFilePaths = [
	"apps/web/.env.local.example",
	"apps/web/.gitignore",
	"apps/web/AGENTS.md",
	"apps/web/components.json",
	"apps/web/instrumentation-client.ts",
	"apps/web/instrumentation.ts",
	"apps/web/mdx-components.tsx",
	"apps/web/next-env.d.ts",
	"apps/web/next.config.ts",
	"apps/web/package.json",
	"apps/web/playwright.config.ts",
	"apps/web/postcss.config.mjs",
	"apps/web/proxy.ts",
	"apps/web/tsconfig.json",
	"apps/web/vitest.config.ts",
] as const;

export const customerSafeAppDirectoryPaths = [
	"apps/web/app",
	"apps/web/components",
	"apps/web/config",
	"apps/web/content",
	"apps/web/convex",
	"apps/web/data",
	"apps/web/features",
	"apps/web/hooks",
	"apps/web/lib",
	"apps/web/platform",
	"apps/web/playwright",
	"apps/web/public",
	"apps/web/scripts",
	"apps/web/tests",
] as const;

export const customerSafeBlueprintCompilerFilePaths = [
	"packages/blueprint-compiler/package.json",
] as const;

export const customerSafeBlueprintCompilerDirectoryPaths = [
	"packages/blueprint-compiler/src",
] as const;

export const blueprintCompilerTemplateSourceTracePaths = [
	"../../docs/generated/openai-blueprint/**/*",
	"../../docs/prompts/**/*",
] as const;

const excludedSnapshotFileSuffixes = [
	".DS_Store",
	".env.local",
	".env.production",
	".mp4",
	".tsbuildinfo",
] as const;

const excludedSnapshotPathFragments = [
	"/.codex/",
	"/.venv/",
	"/coverage/",
	"/docs/generated/openai-blueprint/",
	"/docs/ship-by-sunday/",
	"/output/",
	"/test-results/",
] as const;

const excludedSnapshotPathSuffixes = [
	"/CHANGELOG.md",
	"/docs/release-workflow.md",
	"/.impeccable.md",
	"/skills-lock.json",
	"/tmp-blog-article-mobile.png",
	"/tmp-blog-article.png",
	"/todo.md",
] as const;

function isExcludedByPathSegment(relativePath: string) {
	return customerSafeRepoExcludedPathSegments.some(
		(segment) =>
			relativePath === segment ||
			relativePath.startsWith(`${segment}/`) ||
			relativePath.includes(`/${segment}/`),
	);
}

export function isExcludedSnapshotPath(relativePath: string) {
	return (
		isExcludedByPathSegment(relativePath) ||
		excludedSnapshotFileSuffixes.some(
			(suffix) =>
				relativePath === suffix.slice(1) || relativePath.endsWith(`/${suffix}`),
		) ||
		excludedSnapshotPathFragments.some((fragment) =>
			relativePath.includes(fragment),
		) ||
		excludedSnapshotPathSuffixes.some((suffix) => relativePath.endsWith(suffix))
	);
}

function toRepoTraceFilePath(repoRelativePath: string) {
	return `../../${repoRelativePath}`;
}

function toRepoTraceDirectoryGlob(repoRelativePath: string) {
	return `../../${repoRelativePath}/**/*`;
}

function toAppTraceFilePath(repoRelativePath: string) {
	return `./${repoRelativePath.slice(appRootPrefix.length)}`;
}

function toAppTraceDirectoryGlob(repoRelativePath: string) {
	return `./${repoRelativePath.slice(appRootPrefix.length)}/**/*`;
}

export function buildRepoDownloadTraceIncludes() {
	return [
		...customerSafeAppFilePaths.map(toAppTraceFilePath),
		...customerSafeAppDirectoryPaths.map(toAppTraceDirectoryGlob),
		...customerSafeRepoRootFilePaths.map(toRepoTraceFilePath),
		...customerSafeBlueprintCompilerFilePaths.map(toRepoTraceFilePath),
		...customerSafeBlueprintCompilerDirectoryPaths.map(
			toRepoTraceDirectoryGlob,
		),
		...blueprintCompilerTemplateSourceTracePaths,
	] as const;
}
