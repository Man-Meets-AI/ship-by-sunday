import { readFileSync } from "node:fs";
import path from "node:path";

const fallbackQaPassword = "SBS_QA_Codex_8Yv2!mN4#rL7";
const qaPersonaLocalPath = path.resolve(
	__dirname,
	"../../../../qa/personas.local.json",
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
			readFileSync(qaPersonaLocalPath, "utf8"),
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

export const shouldRunSandboxAuth =
	process.env.E2E_RUN_SANDBOX === "1" &&
	typeof process.env.PLAYWRIGHT_BASE_URL === "string" &&
	process.env.PLAYWRIGHT_BASE_URL.length > 0;

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
