import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedPacketFile } from "../packets/render-types";
import { renderFullPacketTree } from "../server/rendered-packet-tree";
import {
	buildRepoGenerationManifest,
	type RepoGenerationManifest,
} from "./build-repo-generation-manifest";
import { renderTemplateOverrides } from "./render-template-overrides";

export type RepoSnapshotFile = {
	path: string;
	content: Buffer | string;
};

function repoRootPath() {
	return path.resolve(/* turbopackIgnore: true */ process.cwd(), "..", "..");
}

function shouldExcludePath(
	relativePath: string,
	manifest: RepoGenerationManifest,
) {
	return manifest.excludedPathSegments.some(
		(segment) =>
			relativePath === segment ||
			relativePath.startsWith(`${segment}/`) ||
			relativePath.includes(`/${segment}/`),
	);
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

			if (shouldExcludePath(relativePath, manifest)) {
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
	const packetFiles = await renderFullPacketTree(projectDefinition);
	const overrides = renderTemplateOverrides(projectDefinition);
	const overrideMap = new Map(overrides.map((file) => [file.path, file]));

	return [
		...includedFiles.filter((file) => !overrideMap.has(file.path)),
		...includedDirectories.flat().filter((file) => !overrideMap.has(file.path)),
		...overrides,
		...(packetFiles as RenderedPacketFile[]),
	];
}
