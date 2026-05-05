import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

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

export function resolveLocalRunnerHome(env: NodeJS.ProcessEnv = process.env) {
	return path.resolve(
		env[RUNNER_HOME_ENV_VAR] ??
			path.join(os.homedir(), ".ship-by-sunday", "runner"),
	);
}

export async function ensureLocalRunnerHome(
	runnerHome = resolveLocalRunnerHome(),
) {
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

async function readCredentialFile(
	runnerHome: string,
): Promise<RunnerCredentialFile> {
	const filePath = credentialsFilePath(runnerHome);
	if (!existsSync(filePath)) {
		return { schemaVersion: 1, credentials: {} };
	}

	const parsed = JSON.parse(await readFile(filePath, "utf8")) as unknown;
	if (
		!parsed ||
		typeof parsed !== "object" ||
		(parsed as { schemaVersion?: unknown }).schemaVersion !== 1
	) {
		throw new Error("Runner credentials file has an unsupported schema.");
	}

	const credentials = (parsed as { credentials?: unknown }).credentials;
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
	await ensureLocalRunnerHome(runnerHome);
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
}
