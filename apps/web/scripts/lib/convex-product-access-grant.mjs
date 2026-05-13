import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const APPS_WEB_DIRECTORY = fileURLToPath(
	new URL("../..", import.meta.url),
);
const requireFromAppsWeb = createRequire(
	new URL("../../package.json", import.meta.url),
);
const convexManifestPath = requireFromAppsWeb.resolve("convex/package.json");
export const CONVEX_BIN_PATH = path.join(
	path.dirname(convexManifestPath),
	"bin/main.js",
);
export const MANUAL_PRODUCT_ACCESS_SOURCE = "manual";
export const MANUAL_STARTER_PRODUCT_ACCESS_CAPABILITIES = [
	"generate_codebase",
	"tutorials",
];

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
	capabilities = MANUAL_STARTER_PRODUCT_ACCESS_CAPABILITIES,
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
				capabilities,
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
	capabilities = MANUAL_STARTER_PRODUCT_ACCESS_CAPABILITIES,
	env = process.env,
	runCommand = spawnCommand,
}) {
	const { command, args } = buildGrantProductAccessCommand({
		clerkUserId,
		capabilities,
	});
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
