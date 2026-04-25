import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { mkdir, open, readFile, rm } from "node:fs/promises";
import { rmSync } from "node:fs";

const appsWebDirectory = path.resolve(import.meta.dirname, "..");
const buildLockPath = path.join(appsWebDirectory, ".next-build.lock");
const lockWaitMs = 1_000;
const lockTimeoutMs = 15 * 60 * 1_000;

let ownsBuildLock = false;
let hasLoggedWait = false;

await main();

async function main() {
	await mkdir(path.dirname(buildLockPath), { recursive: true });
	await acquireBuildLock();

	try {
		const exitCode = await runNextBuild();
		process.exit(exitCode);
	} finally {
		releaseBuildLock();
	}
}

async function acquireBuildLock() {
	const startedAt = Date.now();

	while (true) {
		try {
			const handle = await open(buildLockPath, "wx");
			await handle.writeFile(
				JSON.stringify({
					pid: process.pid,
					startedAt: new Date().toISOString(),
				}),
			);
			await handle.close();
			ownsBuildLock = true;
			registerCleanupHandlers();
			return;
		} catch (error) {
			if (!isFileExistsError(error)) {
				throw error;
			}

			const clearedStaleLock = await clearStaleBuildLockIfNeeded();
			if (clearedStaleLock) {
				continue;
			}

			if (!hasLoggedWait) {
				console.log(
					"[next-build-lock] Another Next build is already running. Waiting for it to finish...",
				);
				hasLoggedWait = true;
			}

			if (Date.now() - startedAt > lockTimeoutMs) {
				throw new Error(
					"Timed out waiting for the active Next build to finish.",
				);
			}

			await sleep(lockWaitMs);
		}
	}
}

function runNextBuild() {
	return new Promise((resolve, reject) => {
		const child = spawn("bunx", ["next", "build", "--webpack"], {
			cwd: appsWebDirectory,
			env: process.env,
			stdio: "inherit",
		});

		child.on("error", reject);
		child.on("close", (code) => resolve(code ?? 1));
	});
}

async function clearStaleBuildLockIfNeeded() {
	let buildLockOwnerPid = null;

	try {
		const buildLockContents = await readFile(buildLockPath, "utf8");
		const parsedLock = JSON.parse(buildLockContents);
		buildLockOwnerPid =
			typeof parsedLock.pid === "number" ? parsedLock.pid : null;
	} catch {
		buildLockOwnerPid = null;
	}

	if (buildLockOwnerPid && isProcessRunning(buildLockOwnerPid)) {
		return false;
	}

	await rm(buildLockPath, { force: true });
	return true;
}

function isProcessRunning(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function isFileExistsError(error) {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		error.code === "EEXIST"
	);
}

function registerCleanupHandlers() {
	const cleanupAndExit = (exitCode) => {
		releaseBuildLock();
		process.exit(exitCode);
	};

	process.on("SIGINT", () => cleanupAndExit(130));
	process.on("SIGTERM", () => cleanupAndExit(143));
}

function releaseBuildLock() {
	if (!ownsBuildLock) {
		return;
	}

	ownsBuildLock = false;
	rmSync(buildLockPath, { force: true });
}

function sleep(durationMs) {
	return new Promise((resolve) => {
		setTimeout(resolve, durationMs);
	});
}
