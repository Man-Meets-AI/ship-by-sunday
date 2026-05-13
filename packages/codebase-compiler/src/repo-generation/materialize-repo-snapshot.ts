import { readdir, readFile, realpath } from "node:fs/promises";
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
import { renderGeneratedTemplateAppFiles } from "./render-generated-template-app-files";
import { renderGeneralizedStarterFiles } from "./render-generalized-starter-files";
import { renderStarterBunLock } from "./render-starter-bun-lock";
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
	const realRootPath = await realpath(rootPath);
	const realDirectoryPath = await realpath(directoryPath);
	if (!pathIsInsideRoot(realRootPath, realDirectoryPath)) {
		throw new Error(`Snapshot directory escapes repo root: ${directoryPath}`);
	}

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
			const realFilePath = await realpath(absolutePath);
			if (!pathIsInsideRoot(realRootPath, realFilePath)) {
				throw new Error(`Snapshot file escapes repo root: ${relativePath}`);
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

function pathIsInsideRoot(rootPath: string, targetPath: string) {
	const relativePath = path.relative(rootPath, targetPath);
	return (
		relativePath === "" ||
		(!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
	);
}

function renderIncludedRepoFile(file: RepoSnapshotFile): RepoSnapshotFile {
	if (file.path !== "bun.lock") {
		return file;
	}

	return {
		...file,
		content: renderStarterBunLock(file.content.toString()),
	};
}

export async function materializeRepoSnapshot(
	projectDefinition: CanonicalProjectDefinition,
): Promise<RepoSnapshotFile[]> {
	const manifest = buildRepoGenerationManifest(projectDefinition);
	const rootPath = repoRootPath();
	const includedFiles = await Promise.all(
		manifest.includedFiles.map(async (relativePath) => {
			const absolutePath = path.join(rootPath, relativePath);
			const realRootPath = await realpath(rootPath);
			const realFilePath = await realpath(absolutePath);
			if (!pathIsInsideRoot(realRootPath, realFilePath)) {
				throw new Error(`Snapshot file escapes repo root: ${relativePath}`);
			}
			return {
				path: relativePath,
				content: await readFile(absolutePath),
			};
		}),
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
		...renderGeneratedTemplateAppFiles(projectDefinition),
		...renderGeneratedDesignSystemFiles(projectDefinition),
		...renderGeneralizedStarterFiles(projectDefinition),
	];
	const overrideMap = new Map(overrides.map((file) => [file.path, file]));

	return [
		...includedFiles
			.map(renderIncludedRepoFile)
			.filter((file) => !overrideMap.has(file.path)),
		...includedDirectories.flat().filter((file) => !overrideMap.has(file.path)),
		...overrides,
		...(codebaseFiles as RenderedCodebaseFile[]),
	];
}
