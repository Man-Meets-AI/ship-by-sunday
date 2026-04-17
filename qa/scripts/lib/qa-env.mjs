import { constants as fsConstants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const defaultQaEnvFilePath = path.join(repoRoot, "apps/web/.env.local");

async function pathExists(filePath) {
	try {
		await access(filePath, fsConstants.F_OK);
		return true;
	} catch {
		return false;
	}
}

function resolveEnvFilePath(requestedPath) {
	if (path.isAbsolute(requestedPath)) {
		return requestedPath;
	}

	return path.resolve(repoRoot, requestedPath);
}

export async function loadQaEnv() {
	const requestedEnvFile = process.env.QA_ENV_FILE?.trim();

	if (requestedEnvFile) {
		const resolvedEnvFilePath = resolveEnvFilePath(requestedEnvFile);
		if (!(await pathExists(resolvedEnvFilePath))) {
			throw new Error(
				`QA_ENV_FILE points to a missing file: ${resolvedEnvFilePath}`,
			);
		}

		process.loadEnvFile(resolvedEnvFilePath);
		return resolvedEnvFilePath;
	}

	if (await pathExists(defaultQaEnvFilePath)) {
		process.loadEnvFile(defaultQaEnvFilePath);
		return defaultQaEnvFilePath;
	}

	return null;
}
