import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import {
	customerSafeAppDirectoryPaths,
	customerSafeAppFilePaths,
	customerSafeCodebaseCompilerDirectoryPaths,
	customerSafeCodebaseCompilerFilePaths,
	customerSafeCodebasePresentationDirectoryPaths,
	customerSafeCodebasePresentationFilePaths,
	customerSafeRepoExcludedPathSegments,
	customerSafeRepoRootFilePaths,
	customerSafeTelegramChatWidgetDirectoryPaths,
	customerSafeTelegramChatWidgetFilePaths,
} from "./repo-download-source-contract";

export type RepoGenerationManifest = {
	excludedPathSegments: readonly string[];
	includedDirectories: readonly string[];
	includedFiles: readonly string[];
	repoName: string;
};

const fallbackRepoName = "generated-codebase";

export function slugifyRepoName(value: string) {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || fallbackRepoName;
}

export function buildRepoGenerationManifest(
	projectDefinition: CanonicalProjectDefinition,
): RepoGenerationManifest {
	return {
		excludedPathSegments: customerSafeRepoExcludedPathSegments,
		includedDirectories: [
			...customerSafeAppDirectoryPaths,
			...customerSafeCodebaseCompilerDirectoryPaths,
			...customerSafeCodebasePresentationDirectoryPaths,
			...customerSafeTelegramChatWidgetDirectoryPaths,
		],
		includedFiles: [
			...customerSafeRepoRootFilePaths,
			...customerSafeAppFilePaths,
			...customerSafeCodebaseCompilerFilePaths,
			...customerSafeCodebasePresentationFilePaths,
			...customerSafeTelegramChatWidgetFilePaths,
		],
		repoName: slugifyRepoName(projectDefinition.facts.product_name),
	};
}
