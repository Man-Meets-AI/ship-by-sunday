import path from "node:path";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";

import { ensureClerkTestUser } from "../../apps/web/scripts/ensure-clerk-test-user.mjs";
import {
	appsWebDirectory,
	getPersonaIdsForPack,
	getPersonaRecord,
	hasLocalCredentialPlaceholders,
	loadResolvedPersonaConfig,
	personaLocalExamplePath,
	personaLocalPath,
	repoRoot,
} from "./lib/personas.mjs";

const ENTITLED_COURSE_SLUG = "ship-by-sunday";
const authStateDirectory = path.join(repoRoot, "apps/web/tests/e2e/.auth");

function parseArgs(argv) {
	const positional = [];
	const options = {};

	for (const argument of argv) {
		if (argument.startsWith("--")) {
			const [key, value = ""] = argument.replace(/^--/, "").split("=");
			options[key] = value || "1";
			continue;
		}

		positional.push(argument);
	}

	return { positional, options };
}

async function preparePersonas(options) {
	const requestedPack = options.pack ?? "default_ship";
	const requestedPersonaIds = options.persona
		? [options.persona]
		: getPersonaIdsForPack(
				await loadResolvedPersonaConfig({ requireLocal: true }),
				requestedPack,
			);
	const config = await loadResolvedPersonaConfig({ requireLocal: true });
	const results = [];

	for (const personaId of requestedPersonaIds) {
		const persona = getPersonaRecord(config, personaId);

		if (persona.kind === "anonymous") {
			results.push({
				personaId,
				status: "ok",
				message: "Signed-out persona uses a fresh browser context and needs no provisioning.",
			});
			continue;
		}

		if (!persona.account) {
			throw new Error(`Persona ${personaId} does not have an account scope.`);
		}

		if (hasLocalCredentialPlaceholders(persona.account)) {
			throw new Error(
				`Persona ${personaId} is still using placeholder credentials. Create ${path.relative(repoRoot, personaLocalPath)} from ${path.relative(repoRoot, personaLocalExamplePath)}.`,
			);
		}

		const ensuredUser = await ensureClerkTestUser({
			account: persona.account,
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		if (
			ensuredUser.status === "blocked" ||
			ensuredUser.status === "error" ||
			!ensuredUser.clerkUserId
		) {
			throw new Error(
				`Failed to provision ${personaId}: ${ensuredUser.message ?? "unknown error"}`,
			);
		}

		if (persona.kind === "clerk_password_entitled") {
			await grantEntitlement({
				clerkUserId: ensuredUser.clerkUserId,
				courseSlug: ENTITLED_COURSE_SLUG,
			});
		}

		results.push({
			personaId,
			status: ensuredUser.status,
			email: persona.account.email,
			message:
				persona.kind === "clerk_password_entitled"
					? "Entitled persona is ready."
					: "Signed-in no-access persona is ready.",
		});
	}

	console.log(JSON.stringify({ pack: requestedPack, personas: results }, null, 2));
}

async function resetPersonas() {
	await rm(authStateDirectory, { recursive: true, force: true });
	console.log(
		JSON.stringify(
			{
				status: "ok",
				message:
					"Cleared Playwright auth state. Remote Clerk and Convex personas are intentionally left in place; rerun qa:personas:prepare to refresh them.",
			},
			null,
			2,
		),
	);
}

async function grantEntitlement({ clerkUserId, courseSlug }) {
	const args = [
		"convex",
		"run",
		"access:grantProductAccess",
		JSON.stringify({
			clerkUserId,
			source: "manual",
		}),
	];

	const result = await spawnCommand("bunx", args, {
		cwd: appsWebDirectory,
		env: {
			...process.env,
			QA_COURSE_SLUG: courseSlug,
		},
	});

	if (result.code !== 0) {
		throw new Error(
			`Failed to grant entitlement via Convex.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
		);
	}
}

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

const { positional, options } = parseArgs(process.argv.slice(2));
const mode = positional[0] ?? "prepare";

try {
	if (mode === "prepare") {
		await preparePersonas(options);
	} else if (mode === "reset") {
		await resetPersonas();
	} else {
		throw new Error(
			"Usage: node qa/scripts/personas.mjs <prepare|reset> [--pack=<pack>] [--persona=<personaId>]",
		);
	}
} catch (error) {
	console.error(
		JSON.stringify(
			{
				status: "error",
				message:
					error instanceof Error ? error.message : "Unknown persona command failure.",
			},
			null,
			2,
		),
	);
	process.exitCode = 1;
}
