import { existsSync } from "node:fs";
import {
	appendFile,
	lstat,
	readFile,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context, Effect, Layer } from "effect";

import type { JsonObject, JsonValue } from "./json-value";
import {
	ensureRepositoryDirectory,
	assertNoRepositorySymlinkPath,
	resolveRepositoryPath,
	writeRepositoryTextFile,
} from "./repository-boundary";
import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../effect/runtime";

export const LOCAL_STATE_DIRECTORY_NAME = ".sbs";

export type LocalProjectState = {
	schemaVersion: 1;
	projectId: string;
	runnerId: string;
	runnerMode: "daemon" | "one_shot";
	apiBaseUrl: string;
	eventEndpoint: string;
	pairingTokenDigest?: string;
	repositoryDisplayName: string;
	machineDisplayName: string;
	runnerVersion: string;
	pairedAt: number;
	updatedAt: number;
};

export type LocalDaemonStatus = {
	schemaVersion: 1;
	status: "offline" | "starting" | "online" | "stopping" | "errored";
	pid?: number;
	startedAt?: number;
	updatedAt: number;
	lastHeartbeatAt?: number;
	lastError?: string;
};

export type LocalCodexThreadState = {
	schemaVersion: 1;
	threadId: string;
	profileName: string;
	sandboxMode: "read-only" | "workspace-write";
	outputSchemaPath?: string;
	updatedAt: number;
};

type EnsureLocalProjectStateDirectoryRequest = {
	repositoryRoot: string;
	updateGitExclude: boolean;
};

type LocalProjectStateRepositoryRequest = {
	repositoryRoot: string;
};

type WriteLocalProjectStateRequest = LocalProjectStateRepositoryRequest & {
	state: LocalProjectState;
};

type WriteLocalDaemonStatusRequest = LocalProjectStateRepositoryRequest & {
	status: LocalDaemonStatus;
};

type WriteLocalCodexThreadStateRequest = LocalProjectStateRepositoryRequest & {
	threadState: LocalCodexThreadState;
};

export interface LocalProjectStateService {
	readonly ensureDirectory: (
		request: EnsureLocalProjectStateDirectoryRequest,
	) => Effect.Effect<string, Error>;
	readonly readProjectState: (
		request: LocalProjectStateRepositoryRequest,
	) => Effect.Effect<LocalProjectState | null, Error>;
	readonly writeProjectState: (
		request: WriteLocalProjectStateRequest,
	) => Effect.Effect<void, Error>;
	readonly readDaemonStatus: (
		request: LocalProjectStateRepositoryRequest,
	) => Effect.Effect<LocalDaemonStatus | null, Error>;
	readonly writeDaemonStatus: (
		request: WriteLocalDaemonStatusRequest,
	) => Effect.Effect<void, Error>;
	readonly readCodexThreadState: (
		request: LocalProjectStateRepositoryRequest,
	) => Effect.Effect<LocalCodexThreadState | null, Error>;
	readonly writeCodexThreadState: (
		request: WriteLocalCodexThreadStateRequest,
	) => Effect.Effect<void, Error>;
	readonly requestDaemonStop: (
		request: LocalProjectStateRepositoryRequest,
	) => Effect.Effect<void, Error>;
	readonly clearDaemonStop: (
		request: LocalProjectStateRepositoryRequest,
	) => Effect.Effect<void, Error>;
	readonly shouldStopDaemon: (
		request: LocalProjectStateRepositoryRequest,
	) => Effect.Effect<boolean, Error>;
}

export const LocalProjectStateService =
	Context.GenericTag<LocalProjectStateService>(
		"ship-by-sunday/LocalProjectStateService",
	);

export const NodeLocalProjectStateServiceLive = Layer.succeed(
	LocalProjectStateService,
	LocalProjectStateService.of({
		ensureDirectory: (request) =>
			Effect.tryPromise({
				try: () => ensureLocalProjectStateDirectoryNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		readProjectState: (request) =>
			Effect.tryPromise({
				try: () => readLocalProjectStateNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		writeProjectState: (request) =>
			Effect.tryPromise({
				try: () => writeLocalProjectStateNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		readDaemonStatus: (request) =>
			Effect.tryPromise({
				try: () => readLocalDaemonStatusNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		writeDaemonStatus: (request) =>
			Effect.tryPromise({
				try: () => writeLocalDaemonStatusNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		readCodexThreadState: (request) =>
			Effect.tryPromise({
				try: () => readLocalCodexThreadStateNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		writeCodexThreadState: (request) =>
			Effect.tryPromise({
				try: () => writeLocalCodexThreadStateNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		requestDaemonStop: (request) =>
			Effect.tryPromise({
				try: () => requestLocalDaemonStopNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		clearDaemonStop: (request) =>
			Effect.tryPromise({
				try: () => clearLocalDaemonStopNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		shouldStopDaemon: (request) =>
			Effect.sync(() => shouldStopLocalDaemonNode(request)),
	}),
);

export function getLocalStateDirectory(repositoryRoot: string) {
	return path.join(repositoryRoot, LOCAL_STATE_DIRECTORY_NAME);
}

function localProjectStatePath(repositoryRoot: string) {
	return path.join(getLocalStateDirectory(repositoryRoot), "config.json");
}

function localDaemonStatusPath(repositoryRoot: string) {
	return path.join(
		getLocalStateDirectory(repositoryRoot),
		"daemon-status.json",
	);
}

function localDaemonStopPath(repositoryRoot: string) {
	return path.join(getLocalStateDirectory(repositoryRoot), "daemon.stop");
}

function localCodexThreadStatePath(repositoryRoot: string) {
	return path.join(
		getLocalStateDirectory(repositoryRoot),
		"runs",
		"codex-thread.json",
	);
}

export async function ensureLocalProjectStateDirectory(
	repositoryRoot: string,
	options: { updateGitExclude?: boolean } = {},
) {
	return await runLocalRunnerEffect(
		ensureLocalProjectStateDirectoryEffect(repositoryRoot, options).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function ensureLocalProjectStateDirectoryEffect(
	repositoryRoot: string,
	options: { updateGitExclude?: boolean } = {},
): Effect.Effect<string, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.ensureDirectory({
			repositoryRoot,
			updateGitExclude: options.updateGitExclude ?? true,
		}),
	);
}

async function ensureLocalProjectStateDirectoryNode({
	repositoryRoot,
	updateGitExclude,
}: EnsureLocalProjectStateDirectoryRequest) {
	const stateDirectory = getLocalStateDirectory(repositoryRoot);
	const existingStateDirectory = await lstat(stateDirectory).catch(() => null);
	if (existingStateDirectory?.isSymbolicLink()) {
		throw new Error("Refusing to use repository .sbs symlink for local state.");
	}
	await ensureRepositoryDirectory(repositoryRoot, ".sbs/events");
	await ensureRepositoryDirectory(repositoryRoot, ".sbs/runs");
	await writeRepositoryTextFile(
		repositoryRoot,
		".sbs/.gitignore",
		["*", "!.gitignore", ""].join("\n"),
	);
	if (updateGitExclude) {
		await ensureLocalGitExcludesSbs(repositoryRoot);
	}
	return stateDirectory;
}

async function ensureLocalGitExcludesSbs(repositoryRoot: string) {
	const gitExcludePath = path.join(repositoryRoot, ".git", "info", "exclude");
	if (!existsSync(gitExcludePath)) {
		return;
	}

	const contents = await readFile(gitExcludePath, "utf8").catch(() => "");
	if (contents.split(/\r?\n/).some((line) => line.trim() === ".sbs/")) {
		return;
	}

	await appendFile(
		gitExcludePath,
		`${contents.endsWith("\n") ? "" : "\n"}.sbs/\n`,
	);
}

export async function readLocalProjectState(repositoryRoot: string) {
	return await runLocalRunnerEffect(
		readLocalProjectStateEffect(repositoryRoot).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function readLocalProjectStateEffect(
	repositoryRoot: string,
): Effect.Effect<LocalProjectState | null, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.readProjectState({ repositoryRoot }),
	);
}

async function readLocalProjectStateNode({
	repositoryRoot,
}: LocalProjectStateRepositoryRequest) {
	const statePath = localProjectStatePath(repositoryRoot);
	if (!existsSync(statePath)) {
		return null;
	}

	const parsed = JSON.parse(await readFile(statePath, "utf8")) as JsonValue;
	if (
		!parsed ||
		typeof parsed !== "object" ||
		(parsed as JsonObject).schemaVersion !== 1
	) {
		throw new Error("Local .sbs/config.json has an unsupported schema.");
	}

	return parsed as LocalProjectState;
}

export async function writeLocalProjectState(
	repositoryRoot: string,
	state: LocalProjectState,
) {
	return await runLocalRunnerEffect(
		writeLocalProjectStateEffect(repositoryRoot, state).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function writeLocalProjectStateEffect(
	repositoryRoot: string,
	state: LocalProjectState,
): Effect.Effect<void, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.writeProjectState({ repositoryRoot, state }),
	);
}

async function writeLocalProjectStateNode({
	repositoryRoot,
	state,
}: WriteLocalProjectStateRequest) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const statePath = localProjectStatePath(repositoryRoot);
	const temporaryPath = `${statePath}.${process.pid}.tmp`;
	await assertNoRepositorySymlinkPath(repositoryRoot, ".sbs/config.json");
	await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
	await rename(temporaryPath, statePath);
}

export async function readLocalDaemonStatus(repositoryRoot: string) {
	return await runLocalRunnerEffect(
		readLocalDaemonStatusEffect(repositoryRoot).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function readLocalDaemonStatusEffect(
	repositoryRoot: string,
): Effect.Effect<LocalDaemonStatus | null, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.readDaemonStatus({ repositoryRoot }),
	);
}

async function readLocalDaemonStatusNode({
	repositoryRoot,
}: LocalProjectStateRepositoryRequest) {
	const statusPath = localDaemonStatusPath(repositoryRoot);
	if (!existsSync(statusPath)) {
		return null;
	}

	return JSON.parse(await readFile(statusPath, "utf8")) as LocalDaemonStatus;
}

export async function writeLocalDaemonStatus(
	repositoryRoot: string,
	status: LocalDaemonStatus,
) {
	return await runLocalRunnerEffect(
		writeLocalDaemonStatusEffect(repositoryRoot, status).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function writeLocalDaemonStatusEffect(
	repositoryRoot: string,
	status: LocalDaemonStatus,
): Effect.Effect<void, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.writeDaemonStatus({ repositoryRoot, status }),
	);
}

async function writeLocalDaemonStatusNode({
	repositoryRoot,
	status,
}: WriteLocalDaemonStatusRequest) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const statusPath = localDaemonStatusPath(repositoryRoot);
	await assertNoRepositorySymlinkPath(
		repositoryRoot,
		".sbs/daemon-status.json",
	);
	await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`);
}

export async function readLocalCodexThreadState(repositoryRoot: string) {
	return await runLocalRunnerEffect(
		readLocalCodexThreadStateEffect(repositoryRoot).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function readLocalCodexThreadStateEffect(
	repositoryRoot: string,
): Effect.Effect<
	LocalCodexThreadState | null,
	Error,
	LocalProjectStateService
> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.readCodexThreadState({ repositoryRoot }),
	);
}

async function readLocalCodexThreadStateNode({
	repositoryRoot,
}: LocalProjectStateRepositoryRequest) {
	const threadStatePath = localCodexThreadStatePath(repositoryRoot);
	if (!existsSync(threadStatePath)) {
		return null;
	}

	const parsed = JSON.parse(
		await readFile(threadStatePath, "utf8"),
	) as JsonValue;
	if (
		!parsed ||
		typeof parsed !== "object" ||
		(parsed as JsonObject).schemaVersion !== 1
	) {
		throw new Error(
			"Local .sbs/runs/codex-thread.json has an unsupported schema.",
		);
	}

	return parsed as LocalCodexThreadState;
}

export async function writeLocalCodexThreadState(
	repositoryRoot: string,
	threadState: LocalCodexThreadState,
) {
	return await runLocalRunnerEffect(
		writeLocalCodexThreadStateEffect(repositoryRoot, threadState).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function writeLocalCodexThreadStateEffect(
	repositoryRoot: string,
	threadState: LocalCodexThreadState,
): Effect.Effect<void, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.writeCodexThreadState({ repositoryRoot, threadState }),
	);
}

async function writeLocalCodexThreadStateNode({
	repositoryRoot,
	threadState,
}: WriteLocalCodexThreadStateRequest) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const threadStatePath = localCodexThreadStatePath(repositoryRoot);
	const temporaryPath = `${threadStatePath}.${process.pid}.tmp`;
	await assertNoRepositorySymlinkPath(
		repositoryRoot,
		".sbs/runs/codex-thread.json",
	);
	await writeFile(temporaryPath, `${JSON.stringify(threadState, null, 2)}\n`);
	await rename(temporaryPath, threadStatePath);
}

export async function requestLocalDaemonStop(repositoryRoot: string) {
	return await runLocalRunnerEffect(
		requestLocalDaemonStopEffect(repositoryRoot).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function requestLocalDaemonStopEffect(
	repositoryRoot: string,
): Effect.Effect<void, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.requestDaemonStop({ repositoryRoot }),
	);
}

async function requestLocalDaemonStopNode({
	repositoryRoot,
}: LocalProjectStateRepositoryRequest) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	await writeRepositoryTextFile(
		repositoryRoot,
		".sbs/daemon.stop",
		`${Date.now()}\n`,
	);
}

export async function clearLocalDaemonStop(repositoryRoot: string) {
	return await runLocalRunnerEffect(
		clearLocalDaemonStopEffect(repositoryRoot).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function clearLocalDaemonStopEffect(
	repositoryRoot: string,
): Effect.Effect<void, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.clearDaemonStop({ repositoryRoot }),
	);
}

async function clearLocalDaemonStopNode({
	repositoryRoot,
}: LocalProjectStateRepositoryRequest) {
	await rm(resolveRepositoryPath(repositoryRoot, ".sbs/daemon.stop"), {
		force: true,
	});
}

export function shouldStopLocalDaemon(repositoryRoot: string) {
	return Effect.runSync(
		shouldStopLocalDaemonEffect(repositoryRoot).pipe(
			Effect.provide(NodeLocalProjectStateServiceLive),
		),
	);
}

export function shouldStopLocalDaemonEffect(
	repositoryRoot: string,
): Effect.Effect<boolean, Error, LocalProjectStateService> {
	return Effect.flatMap(LocalProjectStateService, (service) =>
		service.shouldStopDaemon({ repositoryRoot }),
	);
}

function shouldStopLocalDaemonNode({
	repositoryRoot,
}: LocalProjectStateRepositoryRequest) {
	return existsSync(localDaemonStopPath(repositoryRoot));
}

export function getMachineDisplayName() {
	return os.hostname() || "Local machine";
}
