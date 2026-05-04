import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRootMarkers = [
	["package.json"],
	["apps", "web", "package.json"],
	["packages", "codebase-compiler", "package.json"],
	["docs", "prompts", "execplan-execution-loop.md"],
] as const;

function isRepoRoot(candidatePath: string) {
	return repoRootMarkers.every((segments) =>
		existsSync(path.join(candidatePath, ...segments)),
	);
}

const defaultSearchStartPath = path.dirname(fileURLToPath(import.meta.url));

export function resolveRepoRootPath(startPath = defaultSearchStartPath) {
	let currentPath = path.resolve(startPath);

	while (true) {
		if (isRepoRoot(currentPath)) {
			return currentPath;
		}

		const parentPath = path.dirname(currentPath);
		if (parentPath === currentPath) {
			throw new Error(
				`Could not resolve the repository root from ${startPath}.`,
			);
		}

		currentPath = parentPath;
	}
}
