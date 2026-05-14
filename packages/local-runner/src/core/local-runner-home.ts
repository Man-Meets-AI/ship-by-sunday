import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
	chmod,
	mkdir,
	open,
	readFile,
	rename,
	unlink,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context, Effect, Layer } from "effect";

import type { JsonObject, JsonValue } from "./json-value";
import { runLocalRunnerEffect } from "../effect/runtime";

export const RUNNER_HOME_ENV_VAR = "SBS_RUNNER_HOME";

export type RunnerCredential = {
	projectId: string;
	runnerId: string;
	runnerToken: string;
	apiBaseUrl: string;
	eventEndpoint: string;
	updatedAt: number;
};

type RunnerCredentialFile = {
	schemaVersion: 1;
	credentials: Record<string, RunnerCredential>;
};

type EnsureLocalRunnerHomeRequest = {
	runnerHome: string;
};

type ReadRunnerCredentialRequest = {
	runnerHome: string;
	repositoryRoot: string;
};

type WriteRunnerCredentialRequest = ReadRunnerCredentialRequest & {
	credential: RunnerCredential;
};

export interface LocalRunnerHomeService {
	readonly ensureHome: (
		request: EnsureLocalRunnerHomeRequest,
	) => Effect.Effect<string, unknown>;
	readonly readCredential: (
		request: ReadRunnerCredentialRequest,
	) => Effect.Effect<RunnerCredential | null, unknown>;
	readonly writeCredential: (
		request: WriteRunnerCredentialRequest,
	) => Effect.Effect<void, unknown>;
}

export const LocalRunnerHomeService =
	Context.GenericTag<LocalRunnerHomeService>(
		"ship-by-sunday/LocalRunnerHomeService",
	);

export const NodeLocalRunnerHomeServiceLive = Layer.succeed(
	LocalRunnerHomeService,
	LocalRunnerHomeService.of({
		ensureHome: (request) =>
			Effect.tryPromise({
				try: () => ensureLocalRunnerHomeNode(request),
				catch: (error) => error,
			}),
		readCredential: (request) =>
			Effect.tryPromise({
				try: () => readRunnerCredentialNode(request),
				catch: (error) => error,
			}),
		writeCredential: (request) =>
			Effect.tryPromise({
				try: () => writeRunnerCredentialNode(request),
				catch: (error) => error,
			}),
	}),
);

export function resolveLocalRunnerHome(env: NodeJS.ProcessEnv = process.env) {
	const configuredRunnerHome = env[RUNNER_HOME_ENV_VAR]?.trim();
	if (configuredRunnerHome) {
		return path.resolve(configuredRunnerHome);
	}
	const homeDirectory = env.HOME?.trim() || os.homedir();
	return path.resolve(path.join(homeDirectory, ".sbs", "runner"));
}

export async function ensureLocalRunnerHome(
	runnerHome = resolveLocalRunnerHome(),
) {
	return await runLocalRunnerEffect(
		ensureLocalRunnerHomeEffect(runnerHome).pipe(
			Effect.provide(NodeLocalRunnerHomeServiceLive),
		),
	);
}

export function ensureLocalRunnerHomeEffect(
	runnerHome = resolveLocalRunnerHome(),
): Effect.Effect<string, unknown, LocalRunnerHomeService> {
	return Effect.flatMap(LocalRunnerHomeService, (service) =>
		service.ensureHome({ runnerHome }),
	);
}

async function ensureLocalRunnerHomeNode({
	runnerHome,
}: EnsureLocalRunnerHomeRequest) {
	await mkdir(runnerHome, { recursive: true, mode: 0o700 });
	await chmod(runnerHome, 0o700).catch(() => undefined);
	return runnerHome;
}

export function createRepositoryCredentialKey(repositoryRoot: string) {
	return createHash("sha256")
		.update(path.resolve(repositoryRoot))
		.digest("hex");
}

function credentialsFilePath(runnerHome: string) {
	return path.join(runnerHome, "credentials.json");
}

function credentialsLockPath(runnerHome: string) {
	return path.join(runnerHome, "credentials.lock");
}

async function withCredentialsFileLock<T>(
	runnerHome: string,
	callback: () => Promise<T>,
): Promise<T> {
	const lockPath = credentialsLockPath(runnerHome);
	const startedAt = Date.now();
	let lockHandle;
	while (!lockHandle) {
		try {
			lockHandle = await open(lockPath, "wx", 0o600);
		} catch (error) {
			if ((error as { code?: string }).code !== "EEXIST") {
				throw error;
			}
			if (Date.now() - startedAt > 5_000) {
				throw new Error("Timed out waiting for runner credential lock.");
			}
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}

	try {
		return await callback();
	} finally {
		await lockHandle.close();
		await unlink(lockPath).catch(() => undefined);
	}
}

async function readCredentialFile(
	runnerHome: string,
): Promise<RunnerCredentialFile> {
	const filePath = credentialsFilePath(runnerHome);
	if (!existsSync(filePath)) {
		return { schemaVersion: 1, credentials: {} };
	}

	const parsed = JSON.parse(await readFile(filePath, "utf8")) as JsonValue;
	if (
		!parsed ||
		typeof parsed !== "object" ||
		(parsed as JsonObject).schemaVersion !== 1
	) {
		throw new Error("Runner credentials file has an unsupported schema.");
	}

	const credentials = (parsed as JsonObject).credentials;
	if (
		!credentials ||
		typeof credentials !== "object" ||
		Array.isArray(credentials)
	) {
		throw new Error("Runner credentials file is malformed.");
	}

	return parsed as RunnerCredentialFile;
}

export async function readRunnerCredential({
	runnerHome = resolveLocalRunnerHome(),
	repositoryRoot,
}: {
	runnerHome?: string;
	repositoryRoot: string;
}) {
	return await runLocalRunnerEffect(
		readRunnerCredentialEffect({ runnerHome, repositoryRoot }).pipe(
			Effect.provide(NodeLocalRunnerHomeServiceLive),
		),
	);
}

export function readRunnerCredentialEffect({
	runnerHome = resolveLocalRunnerHome(),
	repositoryRoot,
}: {
	runnerHome?: string;
	repositoryRoot: string;
}): Effect.Effect<RunnerCredential | null, unknown, LocalRunnerHomeService> {
	return Effect.flatMap(LocalRunnerHomeService, (service) =>
		service.readCredential({ runnerHome, repositoryRoot }),
	);
}

async function readRunnerCredentialNode({
	runnerHome,
	repositoryRoot,
}: ReadRunnerCredentialRequest) {
	const credentialFile = await readCredentialFile(runnerHome);
	return (
		credentialFile.credentials[createRepositoryCredentialKey(repositoryRoot)] ??
		null
	);
}

export async function writeRunnerCredential({
	runnerHome = resolveLocalRunnerHome(),
	repositoryRoot,
	credential,
}: {
	runnerHome?: string;
	repositoryRoot: string;
	credential: RunnerCredential;
}) {
	return await runLocalRunnerEffect(
		writeRunnerCredentialEffect({
			runnerHome,
			repositoryRoot,
			credential,
		}).pipe(Effect.provide(NodeLocalRunnerHomeServiceLive)),
	);
}

export function writeRunnerCredentialEffect({
	runnerHome = resolveLocalRunnerHome(),
	repositoryRoot,
	credential,
}: {
	runnerHome?: string;
	repositoryRoot: string;
	credential: RunnerCredential;
}): Effect.Effect<void, unknown, LocalRunnerHomeService> {
	return Effect.flatMap(LocalRunnerHomeService, (service) =>
		service.writeCredential({ runnerHome, repositoryRoot, credential }),
	);
}

async function writeRunnerCredentialNode({
	runnerHome,
	repositoryRoot,
	credential,
}: WriteRunnerCredentialRequest) {
	await ensureLocalRunnerHome(runnerHome);
	await withCredentialsFileLock(runnerHome, async () => {
		const credentialFile = await readCredentialFile(runnerHome);
		credentialFile.credentials[createRepositoryCredentialKey(repositoryRoot)] =
			credential;
		const filePath = credentialsFilePath(runnerHome);
		const temporaryPath = `${filePath}.${process.pid}.tmp`;
		await writeFile(
			temporaryPath,
			`${JSON.stringify(credentialFile, null, 2)}\n`,
			{
				mode: 0o600,
			},
		);
		await rename(temporaryPath, filePath);
		await chmod(filePath, 0o600).catch(() => undefined);
	});
}
