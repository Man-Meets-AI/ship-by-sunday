import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(currentDirectory, "../../..");
export const qaDirectory = path.join(repoRoot, "qa");
export const personaProtocolPath = path.join(qaDirectory, "personas.json");
export const personaLocalPath = path.join(qaDirectory, "personas.local.json");
export const personaLocalExamplePath = path.join(
	qaDirectory,
	"personas.local.example.json",
);
export const appsWebDirectory = path.join(repoRoot, "apps/web");

export async function loadPersonaProtocol() {
	const raw = await readFile(personaProtocolPath, "utf8");
	return JSON.parse(raw);
}

export async function loadPersonaLocalOverrides({ required = false } = {}) {
	try {
		const raw = await readFile(personaLocalPath, "utf8");
		return JSON.parse(raw);
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			error.code === "ENOENT"
		) {
			if (required) {
				throw new Error(
					`Missing qa/personas.local.json. Create it from ${path.relative(
						repoRoot,
						personaLocalExamplePath,
					)} before preparing personas.`,
				);
			}

			return null;
		}

		throw error;
	}
}

export async function loadResolvedPersonaConfig({ requireLocal = false } = {}) {
	const protocol = await loadPersonaProtocol();
	const localOverrides = await loadPersonaLocalOverrides({ required: requireLocal });

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

export function getPersonaIdsForPack(config, pack) {
	const personaIds = config.packs?.[pack];
	if (!Array.isArray(personaIds)) {
		throw new Error(`Unknown QA scenario pack: ${pack}`);
	}

	return [...new Set(personaIds)];
}

export function getPersonaRecord(config, personaId) {
	const persona = config.personas?.[personaId];
	if (!persona) {
		throw new Error(`Unknown QA persona: ${personaId}`);
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
		account.email === "__set_in_qa_personas_local__" ||
		account.password === "__set_in_qa_personas_local__"
	);
}
