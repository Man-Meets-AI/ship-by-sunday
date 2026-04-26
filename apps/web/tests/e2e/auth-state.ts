import { readFileSync } from "node:fs";
import path from "node:path";

const fallbackQaPassword = "SBS_QA_Codex_8Yv2!mN4#rL7";
const releasePersonaLocalPath = path.resolve(
	__dirname,
	"../../../..",
	process.env.RELEASE_PERSONAS_LOCAL_FILE ?? "tmp/release-personas.local.json",
);

type QaPersonaLocalConfig = {
	accounts?: Record<
		string,
		{
			email?: string;
			password?: string;
		}
	>;
};

function loadQaPersonaLocalConfig() {
	try {
		return JSON.parse(
			readFileSync(releasePersonaLocalPath, "utf8"),
		) as QaPersonaLocalConfig;
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return null;
		}

		throw error;
	}
}

function readQaPersonaAccount(scope: string) {
	return qaPersonaLocalConfig?.accounts?.[scope] ?? null;
}

const qaPersonaLocalConfig = loadQaPersonaLocalConfig();
const memberWithoutAccessAccount = readQaPersonaAccount(
	"ship-by-sunday-clerk-instance",
);
const memberWithAccessAccount = readQaPersonaAccount(
	"ship-by-sunday-clerk-entitled",
);

const hasPlaywrightBaseUrl =
	typeof process.env.PLAYWRIGHT_BASE_URL === "string" &&
	process.env.PLAYWRIGHT_BASE_URL.length > 0;

export const shouldRunAuthenticatedE2E =
	hasPlaywrightBaseUrl &&
	(process.env.E2E_RUN_SANDBOX === "1" ||
		process.env.E2E_RUN_LOCAL_AUTH === "1");

export const sharedPassword =
	process.env.E2E_SHARED_PASSWORD ??
	memberWithoutAccessAccount?.password ??
	memberWithAccessAccount?.password ??
	fallbackQaPassword;
export const memberWithoutAccessEmail =
	process.env.E2E_NON_ENTITLED_EMAIL ??
	memberWithoutAccessAccount?.email ??
	"member-no-access@example.test";
export const memberWithoutAccessPassword =
	process.env.E2E_NON_ENTITLED_PASSWORD ??
	process.env.E2E_SHARED_PASSWORD ??
	memberWithoutAccessAccount?.password ??
	fallbackQaPassword;
export const memberWithAccessEmail =
	process.env.E2E_ENTITLED_EMAIL ??
	memberWithAccessAccount?.email ??
	"member-with-access@example.test";
export const memberWithAccessPassword =
	process.env.E2E_ENTITLED_PASSWORD ??
	process.env.E2E_SHARED_PASSWORD ??
	memberWithAccessAccount?.password ??
	fallbackQaPassword;

export const authStateDirectory = path.join(__dirname, ".auth");
export const memberWithoutAccessStorageStatePath = path.join(
	authStateDirectory,
	"member-without-access.json",
);
export const memberWithAccessStorageStatePath = path.join(
	authStateDirectory,
	"member-with-access.json",
);

function hasConfiguredCredential(value: string | undefined) {
	return typeof value === "string" && value.trim().length > 0;
}

export function getAuthenticatedE2EPrereqProblems() {
	const problems: string[] = [];

	if (!hasPlaywrightBaseUrl) {
		problems.push(
			"Missing PLAYWRIGHT_BASE_URL. Set it to the target app origin before running authenticated browser tests.",
		);
	}

	if (
		!hasConfiguredCredential(process.env.E2E_NON_ENTITLED_EMAIL) &&
		!memberWithoutAccessAccount?.email
	) {
		problems.push(
			"Missing non-entitled release account email. Add `ship-by-sunday-clerk-instance` to tmp/release-personas.local.json, set RELEASE_PERSONAS_LOCAL_FILE, or set E2E_NON_ENTITLED_EMAIL.",
		);
	}

	if (
		!hasConfiguredCredential(process.env.E2E_NON_ENTITLED_PASSWORD) &&
		!hasConfiguredCredential(process.env.E2E_SHARED_PASSWORD) &&
		!memberWithoutAccessAccount?.password
	) {
		problems.push(
			"Missing non-entitled release account password. Add `ship-by-sunday-clerk-instance` to tmp/release-personas.local.json, set RELEASE_PERSONAS_LOCAL_FILE, or set E2E_NON_ENTITLED_PASSWORD / E2E_SHARED_PASSWORD.",
		);
	}

	if (
		!hasConfiguredCredential(process.env.E2E_ENTITLED_EMAIL) &&
		!memberWithAccessAccount?.email
	) {
		problems.push(
			"Missing entitled release account email. Add `ship-by-sunday-clerk-entitled` to tmp/release-personas.local.json, set RELEASE_PERSONAS_LOCAL_FILE, or set E2E_ENTITLED_EMAIL.",
		);
	}

	if (
		!hasConfiguredCredential(process.env.E2E_ENTITLED_PASSWORD) &&
		!hasConfiguredCredential(process.env.E2E_SHARED_PASSWORD) &&
		!memberWithAccessAccount?.password
	) {
		problems.push(
			"Missing entitled release account password. Add `ship-by-sunday-clerk-entitled` to tmp/release-personas.local.json, set RELEASE_PERSONAS_LOCAL_FILE, or set E2E_ENTITLED_PASSWORD / E2E_SHARED_PASSWORD.",
		);
	}

	if (process.env.E2E_RUN_LOCAL_AUTH === "1") {
		problems.push(
			"Local-auth browser mode is enabled. Treat it as a convenience lane, not the canonical proof path; prefer sandbox browser proof when available.",
		);
	}

	return problems;
}
