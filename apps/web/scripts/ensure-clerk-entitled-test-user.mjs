import { spawn } from "node:child_process";

import {
	ensureClerkTestUser,
	loadConfiguredAccount,
} from "./ensure-clerk-test-user.mjs";

const ENTITLED_SCOPE = "ship-by-sunday-clerk-entitled";
const DEFAULT_COURSE_SLUG = "ship-by-sunday";
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);

function result(status, details = {}) {
	return { status, ...details };
}

function runConvexGrant({ clerkUserId, env }) {
	return new Promise((resolve) => {
		const args = [
			"exec",
			"convex",
			"run",
			"access:grantProductAccess",
			JSON.stringify({
				clerkUserId,
				source: "manual",
			}),
		];
		const child = spawn("bunx", args, {
			env,
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

function getHostedConvexDevContext(env) {
	const convexUrl = env.NEXT_PUBLIC_CONVEX_URL?.trim();
	if (!convexUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_CONVEX_URL in .env.local. Run `bun run dev:convex` to sync your hosted Convex dev deployment.",
		);
	}

	if (LOCALHOST_HOSTS.has(new URL(convexUrl).hostname)) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_URL must point to your hosted Convex dev deployment, not localhost. Run `bun run dev:convex` to refresh .env.local.",
		);
	}

	const deploymentName = env.CONVEX_DEPLOYMENT?.trim();
	if (!deploymentName) {
		throw new Error(
			"Missing CONVEX_DEPLOYMENT in .env.local. Run `bun run dev:convex` to sync your hosted Convex dev deployment.",
		);
	}

	return { deploymentName };
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	fetchImpl = fetch,
} = {}) {
	let requestedScope = env.CLERK_TEST_USER_SCOPE ?? ENTITLED_SCOPE;
	let courseSlug = env.QA_COURSE_SLUG ?? DEFAULT_COURSE_SLUG;

	for (let i = 0; i < args.length; i += 1) {
		const current = args[i];
		if (current?.startsWith("--scope=")) {
			requestedScope = current.slice("--scope=".length);
			continue;
		}

		if (current === "--scope") {
			const next = args[i + 1];
			if (!next || next.startsWith("--")) {
				return {
					exitCode: 1,
					payload: result("error", {
						message: "Missing value for --scope.",
					}),
				};
			}
			requestedScope = next;
			i += 1;
			continue;
		}

		if (current?.startsWith("--courseSlug=")) {
			courseSlug = current.slice("--courseSlug=".length);
			continue;
		}

		if (current === "--courseSlug") {
			const next = args[i + 1];
			if (!next || next.startsWith("--")) {
				return {
					exitCode: 1,
					payload: result("error", {
						message: "Missing value for --courseSlug.",
					}),
				};
			}
			courseSlug = next;
			i += 1;
		}
	}

	let account;

	try {
		account = await loadConfiguredAccount({ scope: requestedScope });
	} catch (error) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					error instanceof Error
						? error.message
						: "Failed to load Clerk test account config.",
			}),
		};
	}

	const ensureResult = await ensureClerkTestUser({
		account,
		secretKey: env.CLERK_SECRET_KEY,
		fetchImpl,
	});

	if (
		ensureResult.status === "blocked" ||
		ensureResult.status === "error" ||
		!ensureResult.clerkUserId
	) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					"Unable to ensure Clerk test user before product access grant.",
				ensureResult,
			}),
		};
	}

	let convexDevContext;
	try {
		convexDevContext = getHostedConvexDevContext(env);
	} catch (error) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					error instanceof Error
						? error.message
						: "Missing hosted Convex dev deployment config.",
			}),
		};
	}

	const grantResult = await runConvexGrant({
		clerkUserId: ensureResult.clerkUserId,
		env,
	});

	if (grantResult.code !== 0) {
		return {
			exitCode: 1,
			payload: result("error", {
				message:
					"Convex product access grant failed. Make sure `bun run dev:convex` has synced your hosted Convex dev deployment and that `.env.local` still contains the matching NEXT_PUBLIC_CONVEX_URL and CONVEX_DEPLOYMENT values.",
				clerkUserId: ensureResult.clerkUserId,
				scope: account.scope,
				courseSlug,
				stderr: grantResult.stderr,
				stdout: grantResult.stdout,
			}),
		};
	}

	return {
		exitCode: 0,
		payload: result("ok", {
			message: "Entitled Clerk QA user is ready.",
			scope: account.scope,
			email: account.email,
			courseSlug,
			clerkUserId: ensureResult.clerkUserId,
			convexDeployment: convexDevContext.deploymentName,
			userStatus: ensureResult.status,
			grantOutput: grantResult.stdout,
		}),
	};
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	const { exitCode, payload } = await runCli();
	console.log(JSON.stringify(payload, null, 2));
	process.exitCode = exitCode;
}
