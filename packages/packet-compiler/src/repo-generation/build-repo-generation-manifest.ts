import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import {
	customerSafeAppDirectoryPaths,
	customerSafeAppFilePaths,
	customerSafePacketCompilerDirectoryPaths,
	customerSafePacketCompilerFilePaths,
	customerSafeRepoExcludedPathSegments,
	customerSafeRepoRootFilePaths,
} from "./repo-download-source-contract";

export type RepoGenerationManifest = {
	excludedPathSegments: readonly string[];
	includedDirectories: readonly string[];
	includedFiles: readonly string[];
	repoName: string;
};

function slugify(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function buildRepoGenerationManifest(
	projectDefinition: CanonicalProjectDefinition,
): RepoGenerationManifest {
	return {
		excludedPathSegments: customerSafeRepoExcludedPathSegments,
		includedDirectories: [
			...customerSafeAppDirectoryPaths,
			...customerSafePacketCompilerDirectoryPaths,
		],
		includedFiles: [
			...customerSafeRepoRootFilePaths,
			...customerSafeAppFilePaths,
			...customerSafePacketCompilerFilePaths,
		],
		repoName: slugify(projectDefinition.facts.product_name),
	};
}
