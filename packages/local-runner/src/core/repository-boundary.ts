import { lstat, mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

export function normalizeRepositoryRelativePath(repoRelativePath: string) {
	const normalizedPath = repoRelativePath.replaceAll("\\", "/");
	if (
		path.posix.isAbsolute(normalizedPath) ||
		normalizedPath === "" ||
		normalizedPath.split("/").includes("..")
	) {
		throw new Error(`Unsafe repository-relative path: ${repoRelativePath}`);
	}
	return path.posix.normalize(normalizedPath);
}

export function resolveRepositoryPath(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	const normalizedPath = normalizeRepositoryRelativePath(repoRelativePath);
	const targetPath = path.resolve(repositoryRoot, normalizedPath);
	const relativePath = path.relative(path.resolve(repositoryRoot), targetPath);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		throw new Error(`Path escapes repository root: ${repoRelativePath}`);
	}
	return targetPath;
}

export async function assertNoRepositorySymlinkPath(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	const normalizedPath = normalizeRepositoryRelativePath(repoRelativePath);
	const segments = normalizedPath.split("/");
	let currentPath = path.resolve(repositoryRoot);
	for (const segment of segments) {
		currentPath = path.join(currentPath, segment);
		const stats = await lstat(currentPath).catch(() => null);
		if (stats?.isSymbolicLink()) {
			throw new Error(
				`Refusing to follow repository symlink: ${normalizedPath}`,
			);
		}
	}
}

export async function ensureRepositoryDirectory(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	const directoryPath = resolveRepositoryPath(repositoryRoot, repoRelativePath);
	await mkdir(directoryPath, { recursive: true });
	await assertNoRepositorySymlinkPath(repositoryRoot, repoRelativePath);
	const [realRootPath, realDirectoryPath] = await Promise.all([
		realpath(repositoryRoot),
		realpath(directoryPath),
	]);
	const relativePath = path.relative(realRootPath, realDirectoryPath);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		throw new Error(`Directory escapes repository root: ${repoRelativePath}`);
	}
	return directoryPath;
}

export async function writeRepositoryTextFile(
	repositoryRoot: string,
	repoRelativePath: string,
	value: string,
) {
	const normalizedPath = normalizeRepositoryRelativePath(repoRelativePath);
	await ensureRepositoryDirectory(
		repositoryRoot,
		path.posix.dirname(normalizedPath),
	);
	await assertNoRepositorySymlinkPath(repositoryRoot, normalizedPath);
	await writeFile(resolveRepositoryPath(repositoryRoot, normalizedPath), value);
}
