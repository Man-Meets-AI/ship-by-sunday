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
import {
	mapStarterTemplateOutputPathToSourcePath,
	materializeStarterTemplateSource,
	STARTER_TEMPLATE_OUTPUT_ROOT,
} from "./materialize-starter-template-source";
import { renderGeneratedDesignSystemFiles } from "./render-generated-design-system-files";
import { renderGeneratedTemplateAppFiles } from "./render-generated-template-app-files";
import { renderGeneralizedStarterFiles } from "./render-generalized-starter-files";
import { isExcludedSnapshotPath } from "./repo-download-source-contract";
import { renderTemplateOverrides } from "./render-template-overrides";
import {
	isStarterTemplateGeneratedOverlayAllowed,
	type StarterTemplateSourceVerification,
} from "./starter-template-source-contract";

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

function mergeSnapshotFiles(files: readonly RepoSnapshotFile[]) {
	const filesByPath = new Map<string, RepoSnapshotFile>();

	for (const file of files) {
		filesByPath.set(file.path, file);
	}

	return Array.from(filesByPath.values());
}

export function assertGeneratedTemplateSourceOverlaysAllowed(
	generatedFiles: readonly RepoSnapshotFile[],
	templateVerification: StarterTemplateSourceVerification,
) {
	const disallowedOverlayPaths = generatedFiles.flatMap((file) => {
		const sourcePath = mapStarterTemplateOutputPathToSourcePath(file.path);

		if (sourcePath === null) {
			return [];
		}

		if (
			isStarterTemplateGeneratedOverlayAllowed(
				sourcePath,
				templateVerification.manifest,
			)
		) {
			return [];
		}

		return [`${file.path} -> ${sourcePath}`];
	});

	if (disallowedOverlayPaths.length === 0) {
		return;
	}

	throw new Error(
		[
			"Generated Starter overlays are not allowed by the pinned template source policy:",
			...disallowedOverlayPaths,
			"Update templates/starter-app/template-source.json generatedOverlayPolicy before intentionally writing generated app overlays.",
		].join("\n"),
	);
}

function renderStarterTemplateSourceProvenanceFile(
	templateVerification: StarterTemplateSourceVerification,
	materializedFileCount: number,
): RepoSnapshotFile {
	const { manifest } = templateVerification;

	return {
		path: "docs/facts/template-source.json",
		content: `${JSON.stringify(
			{
				schemaVersion: "generated-starter-template-source-provenance.v1",
				templateId: manifest.templateId,
				templateVersion: manifest.templateVersion,
				sourceRoot: manifest.sourceRoot,
				sourceLayout: manifest.sourceLayout,
				materializedOutputRoot: STARTER_TEMPLATE_OUTPUT_ROOT,
				fileCount: templateVerification.fileCount,
				materializedFileCount,
				contentDigest: templateVerification.contentDigest,
				generatedOverlaysWin: true,
				manifestPath: "templates/starter-app/template-source.json",
				provenance: {
					originKind: manifest.provenance.originKind,
					originGitCommit: manifest.provenance.originGitCommit,
					capturedAt: manifest.provenance.capturedAt,
					capturedByProgram: manifest.provenance.capturedByProgram,
					notes: manifest.provenance.notes,
				},
			},
			null,
			2,
		)}\n`,
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
	const starterTemplateSource =
		await materializeStarterTemplateSource(rootPath);
	const starterTemplateFiles = starterTemplateSource.files;
	const codebaseFiles = await renderFullCodebaseTree(projectDefinition);
	const overrides = [
		...renderTemplateOverrides(projectDefinition),
		...renderGeneratedTemplateAppFiles(projectDefinition),
		...renderGeneratedDesignSystemFiles(projectDefinition),
		...renderGeneralizedStarterFiles(projectDefinition),
	];
	assertGeneratedTemplateSourceOverlaysAllowed(
		overrides,
		starterTemplateSource.verification,
	);
	const starterTemplateProvenanceFile =
		renderStarterTemplateSourceProvenanceFile(
			starterTemplateSource.verification,
			starterTemplateFiles.length,
		);

	return mergeSnapshotFiles([
		...includedFiles,
		...includedDirectories.flat(),
		...starterTemplateFiles,
		...overrides,
		starterTemplateProvenanceFile,
		...(codebaseFiles as RenderedCodebaseFile[]),
	]);
}
