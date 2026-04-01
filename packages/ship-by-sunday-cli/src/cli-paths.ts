import path from "node:path";

export function resolveProjectRootPath() {
	return process.cwd();
}

export function resolveProjectPath(
	projectRootPath: string,
	targetPath: string,
) {
	return path.isAbsolute(targetPath)
		? targetPath
		: path.resolve(projectRootPath, targetPath);
}
