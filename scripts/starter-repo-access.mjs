import { spawn } from "node:child_process";

import {
	buildGitHubApiUrl,
	getCollaboratorSyncOutcome,
	getGitHubRequestHeaders,
	getInviteOutcome,
	STARTER_REPO_NAME,
	STARTER_REPO_OWNER,
	STARTER_REPO_URL,
} from "./lib/starter-repo-access.mjs";

const DEFAULT_COURSE_SLUG = "ship-by-sunday";

function parseCliArgs(args) {
	const options = {
		courseSlug: DEFAULT_COURSE_SLUG,
		clerkUserId: null,
	};

	for (let index = 0; index < args.length; index += 1) {
		const current = args[index];

		if (current?.startsWith("--courseSlug=")) {
			options.courseSlug = current.slice("--courseSlug=".length);
			continue;
		}

		if (current === "--courseSlug") {
			options.courseSlug = args[index + 1] ?? "";
			index += 1;
			continue;
		}

		if (current?.startsWith("--clerkUserId=")) {
			options.clerkUserId = current.slice("--clerkUserId=".length);
			continue;
		}

		if (current === "--clerkUserId") {
			options.clerkUserId = args[index + 1] ?? "";
			index += 1;
		}
	}

	return options;
}

function runCommand(command, args) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
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

async function runConvex(functionName, payload) {
	const result = await runCommand("pnpm", [
		"exec",
		"convex",
		"run",
		functionName,
		JSON.stringify(payload),
	]);

	if (result.code !== 0) {
		throw new Error(result.stderr || result.stdout || "Convex command failed.");
	}

	if (!result.stdout) {
		return null;
	}

	return JSON.parse(result.stdout);
}

async function readJsonResponse(response) {
	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) {
		return null;
	}

	return response.json();
}

function requireGitHubToken(env) {
	const token = env.GITHUB_STARTER_REPO_TOKEN;
	if (!token) {
		throw new Error("Missing GITHUB_STARTER_REPO_TOKEN.");
	}

	return token;
}

async function listQueue(statuses, courseSlug) {
	return runConvex("course:listStarterRepoAccessQueue", {
		statuses,
		courseSlug,
	});
}

async function recordProvisioningResult(item, update) {
	return runConvex("course:recordStarterRepoProvisioningResult", {
		clerkUserId: item.clerkUserId,
		courseSlug: item.courseSlug,
		...update,
	});
}

async function inviteUser(item, token) {
	const response = await fetch(
		buildGitHubApiUrl(
			`/repos/${STARTER_REPO_OWNER}/${STARTER_REPO_NAME}/collaborators/${encodeURIComponent(item.githubUsername)}`,
		),
		{
			method: "PUT",
			headers: getGitHubRequestHeaders(token),
		},
	);
	const body = await readJsonResponse(response);
	const outcome = getInviteOutcome({
		status: response.status,
		body,
		username: item.githubUsername,
	});

	await recordProvisioningResult(item, outcome);

	return {
		clerkUserId: item.clerkUserId,
		githubUsername: item.githubUsername,
		...outcome,
	};
}

async function syncUser(item, token) {
	const response = await fetch(
		buildGitHubApiUrl(
			`/repos/${STARTER_REPO_OWNER}/${STARTER_REPO_NAME}/collaborators/${encodeURIComponent(item.githubUsername)}`,
		),
		{
			headers: getGitHubRequestHeaders(token),
		},
	);
	const syncOutcome = getCollaboratorSyncOutcome(response.status);

	if (syncOutcome === "accepted") {
		await recordProvisioningResult(item, { status: "accepted" });
	}

	return {
		clerkUserId: item.clerkUserId,
		githubUsername: item.githubUsername,
		status: syncOutcome,
	};
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
} = {}) {
	const [mode, ...rest] = args;
	const { courseSlug, clerkUserId } = parseCliArgs(rest);

	try {
		if (!mode || mode === "--help" || mode === "help") {
			return {
				exitCode: 0,
				payload: {
					status: "ok",
					message:
						"Usage: starter-repo-access.mjs <pending|invite|sync|reset> [--courseSlug ship-by-sunday] [--clerkUserId user_123]",
				},
			};
		}

		if (mode === "pending") {
			const queue = await listQueue(["requested", "failed"], courseSlug);
			return {
				exitCode: 0,
				payload: {
					status: "ok",
					repository: STARTER_REPO_URL,
					items: queue,
				},
			};
		}

		if (mode === "invite") {
			const token = requireGitHubToken(env);
			const queue = await listQueue(["requested"], courseSlug);
			const results = [];

			for (const item of queue) {
				results.push(await inviteUser(item, token));
			}

			return {
				exitCode: 0,
				payload: {
					status: "ok",
					repository: STARTER_REPO_URL,
					invitedCount: results.length,
					results,
				},
			};
		}

		if (mode === "sync") {
			const token = requireGitHubToken(env);
			const queue = await listQueue(["invited"], courseSlug);
			const results = [];

			for (const item of queue) {
				results.push(await syncUser(item, token));
			}

			return {
				exitCode: 0,
				payload: {
					status: "ok",
					repository: STARTER_REPO_URL,
					checkedCount: results.length,
					results,
				},
			};
		}

		if (mode === "reset") {
			if (!clerkUserId) {
				throw new Error("Missing --clerkUserId for reset.");
			}

			const result = await runConvex("course:resetStarterRepoAccess", {
				clerkUserId,
				courseSlug,
			});

			return {
				exitCode: 0,
				payload: {
					status: "ok",
					repository: STARTER_REPO_URL,
					result,
				},
			};
		}

		throw new Error(`Unknown mode: ${mode}`);
	} catch (error) {
		return {
			exitCode: 1,
			payload: {
				status: "error",
				message:
					error instanceof Error ? error.message : "Starter repo tool failed.",
			},
		};
	}
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	const { exitCode, payload } = await runCli();
	console.log(JSON.stringify(payload, null, 2));
	process.exitCode = exitCode;
}
