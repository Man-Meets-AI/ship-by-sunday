import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedCodebaseFile } from "../codebases/render-types";
import { resolveRepoRootPath } from "../repo-root";
import { renderFullCodebaseTree } from "../server/rendered-codebase-tree";
import {
	buildRepoGenerationManifest,
	type RepoGenerationManifest,
} from "./build-repo-generation-manifest";
import { renderGeneratedDesignSystemFiles } from "./render-generated-design-system-files";
import { renderGeneralizedStarterFiles } from "./render-generalized-starter-files";
import { isExcludedSnapshotPath } from "./repo-download-source-contract";
import { renderTemplateOverrides } from "./render-template-overrides";

export type RepoSnapshotFile = {
	path: string;
	content: Buffer | string;
};

function repoRootPath() {
	return resolveRepoRootPath();
}

async function collectDirectoryFiles(
	rootPath: string,
	directoryPath: string,
	manifest: RepoGenerationManifest,
): Promise<RepoSnapshotFile[]> {
	const entries = await readdir(directoryPath, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const absolutePath = path.join(directoryPath, entry.name);
			const relativePath = path.relative(rootPath, absolutePath);

			if (
				manifest.excludedPathSegments.length > 0 &&
				isExcludedSnapshotPath(relativePath)
			) {
				return [];
			}
			// Repo snapshots should ignore local tooling symlinks instead of
			// crashing when a workstation has unresolved assistant links.
			if (entry.isSymbolicLink()) {
				return [];
			}
			if (entry.isDirectory()) {
				return collectDirectoryFiles(rootPath, absolutePath, manifest);
			}
			return [
				{
					path: relativePath,
					content: await readFile(absolutePath),
				},
			];
		}),
	);

	return files.flat();
}

export async function materializeRepoSnapshot(
	projectDefinition: CanonicalProjectDefinition,
): Promise<RepoSnapshotFile[]> {
	const manifest = buildRepoGenerationManifest(projectDefinition);
	const rootPath = repoRootPath();
	const includedFiles = await Promise.all(
		manifest.includedFiles.map(async (relativePath) => ({
			path: relativePath,
			content: await readFile(path.join(rootPath, relativePath)),
		})),
	);
	const includedDirectories = await Promise.all(
		manifest.includedDirectories.map((relativePath) =>
			collectDirectoryFiles(
				rootPath,
				path.join(rootPath, relativePath),
				manifest,
			),
		),
	);
	const codebaseFiles = await renderFullCodebaseTree(projectDefinition);
	const overrides = [
		...renderTemplateOverrides(projectDefinition),
		...renderGeneratedDesignSystemFiles(projectDefinition),
		...renderGeneralizedStarterFiles(projectDefinition),
	];
	const overrideMap = new Map(overrides.map((file) => [file.path, file]));

	return [
		...includedFiles.filter((file) => !overrideMap.has(file.path)),
		...includedDirectories.flat().filter((file) => !overrideMap.has(file.path)),
		...overrides,
		...(codebaseFiles as RenderedCodebaseFile[]),
	];
}
