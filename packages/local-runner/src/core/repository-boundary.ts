import { lstat, mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { Context, Effect, Layer } from "effect";

import { runLocalRunnerEffect } from "../effect/runtime";

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

type RepositoryBoundaryPathRequest = {
	repositoryRoot: string;
	repoRelativePath: string;
};

type WriteRepositoryTextFileRequest = RepositoryBoundaryPathRequest & {
	value: string;
};

export interface RepositoryBoundaryService {
	readonly assertNoSymlinkPath: (
		request: RepositoryBoundaryPathRequest,
	) => Effect.Effect<void, unknown>;
	readonly ensureDirectory: (
		request: RepositoryBoundaryPathRequest,
	) => Effect.Effect<string, unknown>;
	readonly writeTextFile: (
		request: WriteRepositoryTextFileRequest,
	) => Effect.Effect<void, unknown>;
}

export const RepositoryBoundaryService =
	Context.GenericTag<RepositoryBoundaryService>(
		"ship-by-sunday/RepositoryBoundaryService",
	);

export const NodeRepositoryBoundaryServiceLive = Layer.succeed(
	RepositoryBoundaryService,
	RepositoryBoundaryService.of({
		assertNoSymlinkPath: (request) =>
			Effect.tryPromise({
				try: () => assertNoRepositorySymlinkPathNode(request),
				catch: (error) => error,
			}),
		ensureDirectory: (request) =>
			Effect.tryPromise({
				try: () => ensureRepositoryDirectoryNode(request),
				catch: (error) => error,
			}),
		writeTextFile: (request) =>
			Effect.tryPromise({
				try: () => writeRepositoryTextFileNode(request),
				catch: (error) => error,
			}),
	}),
);

export async function assertNoRepositorySymlinkPath(
	repositoryRoot: string,
	repoRelativePath: string,
) {
	return await runLocalRunnerEffect(
		assertNoRepositorySymlinkPathEffect(repositoryRoot, repoRelativePath).pipe(
			Effect.provide(NodeRepositoryBoundaryServiceLive),
		),
	);
}

export function assertNoRepositorySymlinkPathEffect(
	repositoryRoot: string,
	repoRelativePath: string,
): Effect.Effect<void, unknown, RepositoryBoundaryService> {
	return Effect.flatMap(RepositoryBoundaryService, (service) =>
		service.assertNoSymlinkPath({ repositoryRoot, repoRelativePath }),
	);
}

async function assertNoRepositorySymlinkPathNode({
	repositoryRoot,
	repoRelativePath,
}: RepositoryBoundaryPathRequest) {
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
	return await runLocalRunnerEffect(
		ensureRepositoryDirectoryEffect(repositoryRoot, repoRelativePath).pipe(
			Effect.provide(NodeRepositoryBoundaryServiceLive),
		),
	);
}

export function ensureRepositoryDirectoryEffect(
	repositoryRoot: string,
	repoRelativePath: string,
): Effect.Effect<string, unknown, RepositoryBoundaryService> {
	return Effect.flatMap(RepositoryBoundaryService, (service) =>
		service.ensureDirectory({ repositoryRoot, repoRelativePath }),
	);
}

async function ensureRepositoryDirectoryNode({
	repositoryRoot,
	repoRelativePath,
}: RepositoryBoundaryPathRequest) {
	const directoryPath = resolveRepositoryPath(repositoryRoot, repoRelativePath);
	await mkdir(directoryPath, { recursive: true });
	await assertNoRepositorySymlinkPathNode({ repositoryRoot, repoRelativePath });
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
	return await runLocalRunnerEffect(
		writeRepositoryTextFileEffect(repositoryRoot, repoRelativePath, value).pipe(
			Effect.provide(NodeRepositoryBoundaryServiceLive),
		),
	);
}

export function writeRepositoryTextFileEffect(
	repositoryRoot: string,
	repoRelativePath: string,
	value: string,
): Effect.Effect<void, unknown, RepositoryBoundaryService> {
	return Effect.flatMap(RepositoryBoundaryService, (service) =>
		service.writeTextFile({ repositoryRoot, repoRelativePath, value }),
	);
}

async function writeRepositoryTextFileNode({
	repositoryRoot,
	repoRelativePath,
	value,
}: WriteRepositoryTextFileRequest) {
	const normalizedPath = normalizeRepositoryRelativePath(repoRelativePath);
	await ensureRepositoryDirectoryNode({
		repositoryRoot,
		repoRelativePath: path.posix.dirname(normalizedPath),
	});
	await assertNoRepositorySymlinkPathNode({
		repositoryRoot,
		repoRelativePath: normalizedPath,
	});
	await writeFile(resolveRepositoryPath(repositoryRoot, normalizedPath), value);
}
