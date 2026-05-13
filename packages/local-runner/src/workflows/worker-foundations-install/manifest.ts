export const WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID =
	"worker-foundations-install";
export const WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION = "v1";
export const WORKER_FOUNDATIONS_BUNDLE_VERSION = "0.1.0";
export const WORKER_FOUNDATIONS_INSTALL_BRANCH = "shipbysunday/install";
export const WORKER_FOUNDATIONS_COMMIT_MESSAGE =
	"feat(worker): install planning operating system";
export const WORKER_MACHINE_HOME_ENV_VAR = "SHIPBYSUNDAY_WORKER_HOME";
export const WORKER_LICENSE_API_BASE_URL_ENV_VAR =
	"SHIPBYSUNDAY_WORKER_API_BASE_URL";
export const WORKER_LICENSE_OPEN_BROWSER_ENV_VAR =
	"SHIPBYSUNDAY_WORKER_OPEN_BROWSER";
export const WORKER_CODEX_PROJECT_WRITE_PROFILE =
	"shipbysunday-worker-project-write";

export const WORKER_FOUNDATIONS_ROOT_SCRIPTS = [
	"programs:lint",
	"plans:lint",
	"markdown:lint",
	"docs:validate",
	"program:write-child-plan",
	"execplan:write",
	"execplan:grill",
	"execplan:build",
	"execplan:validate",
	"worker:test",
] as const;

export type WorkerFoundationsRootScript =
	(typeof WORKER_FOUNDATIONS_ROOT_SCRIPTS)[number];

export const WORKER_FOUNDATIONS_PROOF_SCRIPTS = [
	"programs:lint",
	"plans:lint",
	"markdown:lint",
	"docs:validate",
	"worker:test",
] as const;

export type WorkerFoundationsProofScript =
	(typeof WORKER_FOUNDATIONS_PROOF_SCRIPTS)[number];
