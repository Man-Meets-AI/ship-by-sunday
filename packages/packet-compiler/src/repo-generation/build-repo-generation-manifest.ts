import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";

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
		excludedPathSegments: [
			".next",
			"coverage",
			"node_modules",
			"scripts/vendor",
			"tests",
		],
		includedDirectories: ["apps/web", "packages/packet-compiler"],
		includedFiles: [
			".gitignore",
			".oxfmtrc.json",
			".oxlintrc.json",
			"bun.lock",
			"package.json",
		],
		repoName: slugify(projectDefinition.facts.product_name),
	};
}
