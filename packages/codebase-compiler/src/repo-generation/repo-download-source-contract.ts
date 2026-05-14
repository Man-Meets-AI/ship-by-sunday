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
	"bunfig.toml",
	"package.json",
] as const;

export const customerSafeAppFilePaths = [
	"apps/web/.env.local.example",
	"apps/web/.gitignore",
	"apps/web/components.json",
	"apps/web/package.json",
	"apps/web/postcss.config.mjs",
	"apps/web/scripts/run-next-build-serialized.mjs",
	"apps/web/tsconfig.json",
] as const;

export const customerSafeAppDirectoryPaths = [] as const;

export const customerSafeCodebaseCompilerFilePaths = [
	"packages/codebase-compiler/package.json",
] as const;

export const customerSafeCodebaseCompilerDirectoryPaths = [
	"packages/codebase-compiler/src",
] as const;

export const customerSafeCodebasePresentationFilePaths = [
	"packages/codebase-presentation/package.json",
] as const;

export const customerSafeCodebasePresentationDirectoryPaths = [
	"packages/codebase-presentation/src",
] as const;

export const customerSafeTelegramChatWidgetFilePaths = [
	"packages/telegram-chat-widget/package.json",
] as const;

export const customerSafeTelegramChatWidgetDirectoryPaths = [
	"packages/telegram-chat-widget/src",
] as const;

export const codebaseCompilerTemplateSourceTracePaths = [
	"../../templates/starter-app/template-source.json",
	"../../templates/starter-app/source/**/*",
	"../../docs/openai/**/*",
	"../../docs/prompts/execplan*.md",
] as const;

const excludedSnapshotFileSuffixes = [
	".DS_Store",
	".env.local",
	".env.preview",
	".env.production",
	".env.test",
	".mp4",
	".tsbuildinfo",
] as const;

const excludedSnapshotPathFragments = [
	"/.codex/",
	"/.deepsec/",
	"/.sbs/",
	"/.venv/",
	"/coverage/",
	"/docs/exec-plans/",
	"/docs/openai/",
	"/docs/programs/",
	"docs/openai/",
	"docs/exec-plans/",
	"docs/programs/",
	"docs/prompts/program-",
	"/docs/ship-by-sunday/",
	"docs/ship-by-sunday/",
	"/output/",
	"/playwright-report/",
	"/test-results/",
] as const;

export const starterSnapshotForbiddenPathPrefixes = [
	"apps/web/app/",
	"apps/web/convex/workspace/",
	"apps/web/platform/codex/",
	"packages/local-runner/",
] as const;

export const starterSnapshotForbiddenFilePaths = [
	"apps/web/convex/workspace.ts",
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

function isForbiddenStarterSnapshotPath(relativePath: string) {
	return (
		starterSnapshotForbiddenFilePaths.includes(
			relativePath as (typeof starterSnapshotForbiddenFilePaths)[number],
		) ||
		starterSnapshotForbiddenPathPrefixes.some((prefix) =>
			relativePath.startsWith(prefix),
		)
	);
}

export function isExcludedSnapshotPath(
	relativePath: string,
	allowedGeneratedPaths: ReadonlySet<string> = new Set(),
) {
	if (allowedGeneratedPaths.has(relativePath)) {
		return false;
	}

	return (
		isForbiddenStarterSnapshotPath(relativePath) ||
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
		...customerSafeCodebaseCompilerFilePaths.map(toRepoTraceFilePath),
		...customerSafeCodebaseCompilerDirectoryPaths.map(toRepoTraceDirectoryGlob),
		...customerSafeCodebasePresentationFilePaths.map(toRepoTraceFilePath),
		...customerSafeCodebasePresentationDirectoryPaths.map(
			toRepoTraceDirectoryGlob,
		),
		...customerSafeTelegramChatWidgetFilePaths.map(toRepoTraceFilePath),
		...customerSafeTelegramChatWidgetDirectoryPaths.map(
			toRepoTraceDirectoryGlob,
		),
		...codebaseCompilerTemplateSourceTracePaths,
	] as const;
}
