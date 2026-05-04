import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import {
	customerSafeAppDirectoryPaths,
	customerSafeAppFilePaths,
	customerSafeCodebaseCompilerDirectoryPaths,
	customerSafeCodebaseCompilerFilePaths,
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
			...customerSafeCodebaseCompilerDirectoryPaths,
		],
		includedFiles: [
			...customerSafeRepoRootFilePaths,
			...customerSafeAppFilePaths,
			...customerSafeCodebaseCompilerFilePaths,
		],
		repoName: slugify(projectDefinition.facts.product_name),
	};
}
