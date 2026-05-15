import { WORKER_FOUNDATIONS_BUNDLE_VERSION } from "./manifest";

export const INSTALL_REPORT_REF = "docs/worker/install-report.md";
export const ROOT_AGENT_START = "<!-- shipbysunday-worker:start -->";
export const ROOT_AGENT_END = "<!-- shipbysunday-worker:end -->";
export const STARTER_PROGRAM_ID = "worker-foundations-adoption";
export const STARTER_PROGRAM_ROOT =
	"docs/programs/active/2026-05-08-worker-foundations-adoption";
export const STARTER_CHILD_PLAN_REF =
	"docs/exec-plans/active/2026-05-08-worker-foundations-first-plan.md";
export const WORKER_MANIFEST_MANAGED_REFS = [
	"scripts/run-worker.sh",
	"apps/worker/package.json",
	"apps/worker/worker-manifest.json",
	"apps/worker/src/worker-cli.mjs",
	"apps/worker/tests/smoke.test.mjs",
] as const;

export const DEFAULT_WORKER_LICENSE_API_BASE_URL =
	"https://www.man-meets-ai.com";
export const WORKER_LICENSE_ACTIVATION_START_PATH =
	"/api/worker/license/device/start";
export const WORKER_LICENSE_ACTIVATION_POLL_PATH =
	"/api/worker/license/device/poll";
export const WORKER_LICENSE_SIGNATURE_PUBLIC_KEY = [
	"-----BEGIN PUBLIC KEY-----",
	"MCowBQYDK2VwAyEA7OwhZk5d2NxVCVxbAHHEigPG3/Sr3oYMXNy/SpbFmLc=",
	"-----END PUBLIC KEY-----",
].join("\n");
export const MIN_ACTIVATION_POLL_INTERVAL_MS = 1_000;
export const MAX_ACTIVATION_POLL_INTERVAL_MS = 10_000;
export const DEFAULT_ACTIVATION_TIMEOUT_MS = 5 * 60_000;
export const WORKER_DEFAULT_NPM_VERSION = "11.12.1";
export const SHIP_BY_SUNDAY_RUNNER_PACKAGE_SPEC = `ship-by-sunday@${WORKER_FOUNDATIONS_BUNDLE_VERSION}`;
export const LEGACY_WORKER_BUN_LOCK_REF = "apps/worker/bun.lock";
export const LEGACY_WORKER_BUN_LOCK_CONTENT =
	"# Worker package lockfile placeholder.\n";
