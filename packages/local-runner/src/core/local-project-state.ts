import { existsSync } from "node:fs";
import {
	appendFile,
	mkdir,
	readFile,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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
	const stateDirectory = getLocalStateDirectory(repositoryRoot);
	await mkdir(path.join(stateDirectory, "events"), { recursive: true });
	await mkdir(path.join(stateDirectory, "runs"), { recursive: true });
	await writeFile(
		path.join(stateDirectory, ".gitignore"),
		["*", "!.gitignore", ""].join("\n"),
	);
	if (options.updateGitExclude ?? true) {
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
	const statePath = localProjectStatePath(repositoryRoot);
	if (!existsSync(statePath)) {
		return null;
	}

	const parsed = JSON.parse(await readFile(statePath, "utf8")) as unknown;
	if (
		!parsed ||
		typeof parsed !== "object" ||
		(parsed as { schemaVersion?: unknown }).schemaVersion !== 1
	) {
		throw new Error("Local .sbs/config.json has an unsupported schema.");
	}

	return parsed as LocalProjectState;
}

export async function writeLocalProjectState(
	repositoryRoot: string,
	state: LocalProjectState,
) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const statePath = localProjectStatePath(repositoryRoot);
	const temporaryPath = `${statePath}.${process.pid}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
	await rename(temporaryPath, statePath);
}

export async function readLocalDaemonStatus(repositoryRoot: string) {
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
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const statusPath = localDaemonStatusPath(repositoryRoot);
	await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`);
}

export async function readLocalCodexThreadState(repositoryRoot: string) {
	const threadStatePath = localCodexThreadStatePath(repositoryRoot);
	if (!existsSync(threadStatePath)) {
		return null;
	}

	const parsed = JSON.parse(await readFile(threadStatePath, "utf8")) as unknown;
	if (
		!parsed ||
		typeof parsed !== "object" ||
		(parsed as { schemaVersion?: unknown }).schemaVersion !== 1
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
	await ensureLocalProjectStateDirectory(repositoryRoot);
	const threadStatePath = localCodexThreadStatePath(repositoryRoot);
	const temporaryPath = `${threadStatePath}.${process.pid}.tmp`;
	await writeFile(temporaryPath, `${JSON.stringify(threadState, null, 2)}\n`);
	await rename(temporaryPath, threadStatePath);
}

export async function requestLocalDaemonStop(repositoryRoot: string) {
	await ensureLocalProjectStateDirectory(repositoryRoot);
	await writeFile(localDaemonStopPath(repositoryRoot), `${Date.now()}\n`);
}

export async function clearLocalDaemonStop(repositoryRoot: string) {
	await rm(localDaemonStopPath(repositoryRoot), { force: true });
}

export function shouldStopLocalDaemon(repositoryRoot: string) {
	return existsSync(localDaemonStopPath(repositoryRoot));
}

export function getMachineDisplayName() {
	return os.hostname() || "Local machine";
}
