import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const APPS_WEB_DIRECTORY = fileURLToPath(
	new URL("../..", import.meta.url),
);
const requireFromAppsWeb = createRequire(new URL("../../package.json", import.meta.url));
const convexPackageJsonPath = requireFromAppsWeb.resolve("convex/package.json");
export const CONVEX_BIN_PATH = path.join(
	path.dirname(convexPackageJsonPath),
	"bin/main.js",
);
export const MANUAL_PRODUCT_ACCESS_SOURCE = "manual";

function spawnCommand(command, args, options) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			...options,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			stdout += String(chunk);
		});
		child.stderr.on("data", (chunk) => {
			stderr += String(chunk);
		});
		child.on("close", (code) => {
			resolve({
				code: code ?? 1,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
			});
		});
	});
}

export function buildGrantProductAccessCommand({
	clerkUserId,
	source = MANUAL_PRODUCT_ACCESS_SOURCE,
}) {
	return {
		command: process.execPath,
		args: [
			CONVEX_BIN_PATH,
			"run",
			"access:grantProductAccess",
			JSON.stringify({
				clerkUserId,
				source,
			}),
		],
	};
}

export function buildResetProductAccessCommand({ clerkUserId }) {
	return {
		command: process.execPath,
		args: [
			CONVEX_BIN_PATH,
			"run",
			"access:resetProductAccess",
			JSON.stringify({
				clerkUserId,
			}),
		],
	};
}

export async function grantConvexProductAccess({
	clerkUserId,
	courseSlug,
	env = process.env,
	runCommand = spawnCommand,
}) {
	const { command, args } = buildGrantProductAccessCommand({ clerkUserId });
	return runCommand(command, args, {
		cwd: APPS_WEB_DIRECTORY,
		env: courseSlug ? { ...env, QA_COURSE_SLUG: courseSlug } : env,
	});
}

export async function resetConvexProductAccess({
	clerkUserId,
	env = process.env,
	runCommand = spawnCommand,
}) {
	const { command, args } = buildResetProductAccessCommand({ clerkUserId });
	return runCommand(command, args, {
		cwd: APPS_WEB_DIRECTORY,
		env,
	});
}
