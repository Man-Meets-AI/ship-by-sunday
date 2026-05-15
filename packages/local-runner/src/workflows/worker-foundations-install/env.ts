import { WORKER_MACHINE_HOME_ENV_VAR } from "./manifest";
import type { WorkerInstallContext } from "./types";
import os from "node:os";
import path from "node:path";

export function resolveWorkerHome(env: NodeJS.ProcessEnv) {
	return path.resolve(
		env[WORKER_MACHINE_HOME_ENV_VAR] ?? path.join(os.homedir(), ".worker"),
	);
}

export function buildWorkerProcessEnv(
	context: WorkerInstallContext,
): NodeJS.ProcessEnv {
	return {
		...context.env,
		[WORKER_MACHINE_HOME_ENV_VAR]: context.workerHome,
	};
}

export function buildCodexKickoffEnv(
	context: WorkerInstallContext,
): NodeJS.ProcessEnv {
	const allowedKeys = [
		"CODEX_HOME",
		"HOME",
		"LANG",
		"LC_ALL",
		"LOGNAME",
		"PATH",
		"SHELL",
		"TERM",
		"TMPDIR",
		"USER",
		"XDG_CONFIG_HOME",
		"XDG_DATA_HOME",
	] as const;
	const nextEnv: NodeJS.ProcessEnv = {};
	for (const key of allowedKeys) {
		const value = context.env[key];
		if (value) {
			nextEnv[key] = value;
		}
	}
	nextEnv[WORKER_MACHINE_HOME_ENV_VAR] = context.workerHome;
	return nextEnv;
}
