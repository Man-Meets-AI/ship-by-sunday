import path from "node:path";

export const shouldRunSandboxAuth =
	process.env.E2E_RUN_SANDBOX === "1" &&
	typeof process.env.PLAYWRIGHT_BASE_URL === "string" &&
	process.env.PLAYWRIGHT_BASE_URL.length > 0;

export const sharedPassword =
	process.env.E2E_SHARED_PASSWORD ?? "SBS_QA_Codex_8Yv2!mN4#rL7";
export const memberWithoutAccessEmail =
	process.env.E2E_NON_ENTITLED_EMAIL ?? "Test@test.com";
export const memberWithAccessEmail =
	process.env.E2E_ENTITLED_EMAIL ?? "test-entitled@test.com";

export const authStateDirectory = path.join(__dirname, ".auth");
export const memberWithoutAccessStorageStatePath = path.join(
	authStateDirectory,
	"member-without-access.json",
);
export const memberWithAccessStorageStatePath = path.join(
	authStateDirectory,
	"member-with-access.json",
);
