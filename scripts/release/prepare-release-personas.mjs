import path from "node:path";
import { rm } from "node:fs/promises";

import { ensureClerkTestUser } from "../../apps/web/scripts/ensure-clerk-test-user.mjs";
import {
	grantConvexProductAccess,
	resetConvexProductAccess,
} from "../../apps/web/scripts/lib/convex-product-access-grant.mjs";
import { assertClerkTargetMatchesReleaseEnv } from "./lib/clerk-target.mjs";
import { loadReleaseEnv, repoRoot } from "./lib/release-env.mjs";
import {
	getPersonaIdsForReleaseProof,
	getReleasePersonaRecord,
	hasLocalCredentialPlaceholders,
	loadResolvedReleasePersonaConfig,
	releasePersonaLocalExamplePath,
	releasePersonaLocalPath,
} from "./lib/release-personas.mjs";

const ENTITLED_COURSE_SLUG = "ship-by-sunday";
const authStateDirectory = path.join(repoRoot, "apps/web/tests/e2e/.auth");
const signedInNoAccessPersonaKinds = new Set([
	"clerk_email_code",
	"clerk_password",
]);
const signedInEntitledPersonaKinds = new Set([
	"clerk_email_code_entitled",
	"clerk_password_entitled",
]);

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
	const loadedEnvFilePath = await loadReleaseEnv();
	const targetBaseUrl = options["base-url"] ?? process.env.PLAYWRIGHT_BASE_URL;

	await assertClerkTargetMatchesReleaseEnv({
		baseUrl: targetBaseUrl,
		loadedEnvFilePath,
	});

	const requestedProof = options.proof ?? "default_ship";
	const config = await loadResolvedReleasePersonaConfig({ requireLocal: true });
	const requestedPersonaIds = options.persona
		? [options.persona]
		: getPersonaIdsForReleaseProof(config, requestedProof);
	const results = [];

	for (const personaId of requestedPersonaIds) {
		const persona = getReleasePersonaRecord(config, personaId);

		if (persona.kind === "anonymous") {
			results.push({
				personaId,
				status: "ok",
				message:
					"Signed-out persona uses a fresh browser context and needs no provisioning.",
			});
			continue;
		}

		if (!persona.account) {
			throw new Error(`Persona ${personaId} does not have an account scope.`);
		}

		if (hasLocalCredentialPlaceholders(persona.account)) {
			throw new Error(
				`Persona ${personaId} is still using placeholder credentials. Create ${path.relative(repoRoot, releasePersonaLocalPath)} from ${path.relative(repoRoot, releasePersonaLocalExamplePath)}.`,
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

		if (signedInEntitledPersonaKinds.has(persona.kind)) {
			await grantConvexProductAccess({
				clerkUserId: ensuredUser.clerkUserId,
				courseSlug: ENTITLED_COURSE_SLUG,
			});
		} else if (signedInNoAccessPersonaKinds.has(persona.kind)) {
			await resetConvexProductAccess({
				clerkUserId: ensuredUser.clerkUserId,
			});
		} else {
			throw new Error(`Unsupported signed-in release persona kind: ${persona.kind}`);
		}

		results.push({
			personaId,
			status: ensuredUser.status,
			email: persona.account.email,
			message:
				signedInEntitledPersonaKinds.has(persona.kind)
					? "Entitled release persona is ready."
					: "Signed-in no-access release persona is ready.",
		});
	}

	console.log(
		JSON.stringify({ proof: requestedProof, personas: results }, null, 2),
	);
}

async function resetPersonas() {
	await rm(authStateDirectory, { recursive: true, force: true });
	console.log(
		JSON.stringify(
			{
				status: "ok",
				message:
					"Cleared Playwright auth state. Remote Clerk and Convex release personas are intentionally left in place; rerun release:personas:prepare to refresh them.",
			},
			null,
			2,
		),
	);
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
			"Usage: node scripts/release/prepare-release-personas.mjs <prepare|reset> [--proof=<proof>] [--persona=<personaId>]",
		);
	}
} catch (error) {
	console.error(
		JSON.stringify(
			{
				status: "error",
				message:
					error instanceof Error
						? error.message
						: "Unknown release persona command failure.",
			},
			null,
			2,
		),
	);
	process.exitCode = 1;
}
