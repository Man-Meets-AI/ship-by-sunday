import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveRepoRootPath } from "../repo-root";
import type { RepoSnapshotFile } from "./materialize-repo-snapshot";
import {
	type StarterTemplateSourceVerification,
	verifyStarterTemplateSourceSnapshot,
} from "./starter-template-source-contract";

export const STARTER_TEMPLATE_OUTPUT_ROOT = "apps/web";

const excludedTemplateSourceExactPaths = new Set([
	"README.md",
	"bun.lock",
	"eslint.config.mjs",
	"instrumentation-client.ts",
	"instrumentation.ts",
	"next.config.ts",
	"package.json",
	"sentry.edge.config.ts",
	"sentry.server.config.ts",
	"vitest.config.ts",
	"vitest.setup.ts",
	"src/app/global-error.tsx",
]);

const excludedTemplateSourcePathPrefixes = [
	".github/",
	"src/app/api/",
	"src/emails/",
	"src/lib/email/",
	"src/lib/sentry/",
] as const;

const excludedTemplateSourceFileSuffixes = [".test.ts", ".test.tsx"] as const;

export function isMaterializedStarterTemplateSourcePath(sourcePath: string) {
	return (
		!excludedTemplateSourceExactPaths.has(sourcePath) &&
		!excludedTemplateSourcePathPrefixes.some((prefix) =>
			sourcePath.startsWith(prefix),
		) &&
		!excludedTemplateSourceFileSuffixes.some((suffix) =>
			sourcePath.endsWith(suffix),
		)
	);
}

export function mapStarterTemplateSourcePath(sourcePath: string) {
	return `${STARTER_TEMPLATE_OUTPUT_ROOT}/${sourcePath}`;
}

export function mapStarterTemplateOutputPathToSourcePath(outputPath: string) {
	const outputRootPrefix = `${STARTER_TEMPLATE_OUTPUT_ROOT}/`;

	if (!outputPath.startsWith(outputRootPrefix)) {
		return null;
	}

	return outputPath.slice(outputRootPrefix.length);
}

export type MaterializedStarterTemplateSource = {
	files: RepoSnapshotFile[];
	verification: StarterTemplateSourceVerification;
};

export async function materializeStarterTemplateSource(
	repoRootPath = resolveRepoRootPath(),
): Promise<MaterializedStarterTemplateSource> {
	const verification = await verifyStarterTemplateSourceSnapshot(repoRootPath);
	const sourceRootPath = path.join(
		repoRootPath,
		verification.manifest.sourceRoot,
	);
	const sourceFiles = verification.files.filter(
		isMaterializedStarterTemplateSourcePath,
	);

	const files = await Promise.all(
		sourceFiles.map(async (sourcePath) => ({
			path: mapStarterTemplateSourcePath(sourcePath),
			content: await readFile(path.join(sourceRootPath, sourcePath)),
		})),
	);

	return { files, verification };
}

export async function materializeStarterTemplateSourceFiles(
	repoRootPath = resolveRepoRootPath(),
): Promise<RepoSnapshotFile[]> {
	const materializedTemplateSource =
		await materializeStarterTemplateSource(repoRootPath);

	return materializedTemplateSource.files;
}
