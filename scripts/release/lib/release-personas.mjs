import path from "node:path";
import { readFile } from "node:fs/promises";

import { repoRoot } from "./release-env.mjs";

export const releasePersonaProtocolPath = path.join(
	repoRoot,
	"scripts/release/personas.json",
);
export const releasePersonaLocalPath = path.resolve(
	repoRoot,
	process.env.RELEASE_PERSONAS_LOCAL_FILE?.trim() ||
		"tmp/release-personas.local.json",
);
export const releasePersonaLocalExamplePath = path.join(
	repoRoot,
	"scripts/release/personas.local.example.json",
);
export const appsWebDirectory = path.join(repoRoot, "apps/web");

export async function loadReleasePersonaProtocol() {
	const raw = await readFile(releasePersonaProtocolPath, "utf8");
	return JSON.parse(raw);
}

export async function loadReleasePersonaLocalOverrides({
	required = false,
} = {}) {
	try {
		const raw = await readFile(releasePersonaLocalPath, "utf8");
		return JSON.parse(raw);
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			error.code === "ENOENT"
		) {
			if (required) {
				throw new Error(
					`Missing release persona credentials at ${path.relative(
						repoRoot,
						releasePersonaLocalPath,
					)}. Create it from ${path.relative(
						repoRoot,
						releasePersonaLocalExamplePath,
					)} or set RELEASE_PERSONAS_LOCAL_FILE.`,
				);
			}

			return null;
		}

		throw error;
	}
}

export async function loadResolvedReleasePersonaConfig({
	requireLocal = false,
} = {}) {
	const protocol = await loadReleasePersonaProtocol();
	const localOverrides = await loadReleasePersonaLocalOverrides({
		required: requireLocal,
	});

	const resolvedAccounts = Object.fromEntries(
		Object.entries(protocol.accounts ?? {}).map(([scope, account]) => [
			scope,
			{
				...account,
				...(localOverrides?.accounts?.[scope] ?? {}),
			},
		]),
	);

	return {
		...protocol,
		accounts: resolvedAccounts,
	};
}

export function getPersonaIdsForReleaseProof(config, proof) {
	const personaIds = config.packs?.[proof];
	if (!Array.isArray(personaIds)) {
		throw new Error(`Unknown release proof persona pack: ${proof}`);
	}

	return [...new Set(personaIds)];
}

export function getReleasePersonaRecord(config, personaId) {
	const persona = config.personas?.[personaId];
	if (!persona) {
		throw new Error(`Unknown release persona: ${personaId}`);
	}

	const accountScope = persona.accountScope ?? null;
	const account = accountScope ? config.accounts?.[accountScope] ?? null : null;

	return {
		personaId,
		...persona,
		account,
	};
}

export function hasLocalCredentialPlaceholders(account) {
	if (!account) {
		return false;
	}

	return (
		account.email === "__set_in_release_personas_local__" ||
		account.password === "__set_in_release_personas_local__" ||
		account.email === "__set_in_qa_personas_local__" ||
		account.password === "__set_in_qa_personas_local__"
	);
}
