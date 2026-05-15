import { spawnSync } from "node:child_process";
import { verify } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { JsonObject, JsonValue } from "../../core/json-value";
import {
	DEFAULT_ACTIVATION_TIMEOUT_MS,
	DEFAULT_WORKER_LICENSE_API_BASE_URL,
	MAX_ACTIVATION_POLL_INTERVAL_MS,
	MIN_ACTIVATION_POLL_INTERVAL_MS,
	WORKER_LICENSE_ACTIVATION_POLL_PATH,
	WORKER_LICENSE_ACTIVATION_START_PATH,
	WORKER_LICENSE_SIGNATURE_PUBLIC_KEY,
} from "./constants";
import { buildCodexKickoffEnv } from "./env";
import {
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
	WORKER_LICENSE_API_BASE_URL_ENV_VAR,
	WORKER_LICENSE_OPEN_BROWSER_ENV_VAR,
} from "./manifest";
import type {
	TargetRepoInspection,
	WorkerActivationPollResponse,
	WorkerActivationStartResponse,
	WorkerInstallContext,
	WorkerLicenseActivationResult,
	WorkerLicenseFile,
	WorkerLicenseStatus,
} from "./types";

export async function inspectWorkerLicense(context: WorkerInstallContext) {
	const licensePath = path.join(context.workerHome, "license.json");
	if (!existsSync(licensePath)) {
		return {
			status: "missing",
			reason:
				"License activation is missing. Run shipbysunday install interactively after signing in.",
		} satisfies WorkerLicenseStatus;
	}
	try {
		const validation = validateWorkerLicenseFile(
			await readFile(licensePath, "utf8"),
		);
		if (!validation.valid) {
			return {
				status: "invalid",
				reason: validation.reason,
			} satisfies WorkerLicenseStatus;
		}
		const expiresAtMs = validation.license.expires_at
			? Date.parse(validation.license.expires_at)
			: null;
		if (expiresAtMs !== null && expiresAtMs <= context.now) {
			return {
				status: "invalid",
				reason: "License activation is invalid because it has expired.",
			} satisfies WorkerLicenseStatus;
		}
		return { status: "active" } satisfies WorkerLicenseStatus;
	} catch {
		return {
			status: "invalid",
			reason:
				"License activation is invalid because license.json cannot be read.",
		} satisfies WorkerLicenseStatus;
	}
}

function validateWorkerLicenseFile(
	text: string,
):
	| { license: WorkerLicenseFile; valid: true }
	| { reason: string; valid: false } {
	const parsed = parseJsonObject(text);
	if (!parsed) {
		return {
			valid: false,
			reason:
				"License activation is invalid because license.json is not a JSON object.",
		};
	}
	if (parsed.schemaVersion !== "shipbysunday-worker-license.v1") {
		return {
			valid: false,
			reason:
				"License activation is invalid because the schema version is unsupported.",
		};
	}
	if (parsed.status !== "active") {
		return {
			valid: false,
			reason: "License activation is invalid because it is not active.",
		};
	}
	if (
		typeof parsed.machineCredential !== "string" ||
		parsed.machineCredential.trim() === ""
	) {
		return {
			valid: false,
			reason:
				"License activation is invalid because the machine credential is missing.",
		};
	}
	if (
		typeof parsed.licenseSignature !== "string" ||
		parsed.licenseSignature.trim() === ""
	) {
		return {
			valid: false,
			reason:
				"License activation is invalid because the license signature is missing.",
		};
	}
	for (const key of ["issued_at", "expires_at"] as const) {
		if (parsed[key] === undefined) {
			continue;
		}
		if (typeof parsed[key] !== "string") {
			return {
				valid: false,
				reason: `License activation is invalid because ${key} must be an ISO timestamp.`,
			};
		}
		const timestamp = Date.parse(parsed[key]);
		if (!Number.isFinite(timestamp)) {
			return {
				valid: false,
				reason: `License activation is invalid because ${key} is not a valid timestamp.`,
			};
		}
	}
	const canonicalLicense = canonicalizeWorkerLicenseFields(parsed);
	if (
		!verifyWorkerLicenseSignature(canonicalLicense, parsed.licenseSignature)
	) {
		return {
			valid: false,
			reason:
				"License activation is invalid because the license signature is not trusted.",
		};
	}
	return {
		valid: true,
		license: {
			schemaVersion: parsed.schemaVersion,
			status: parsed.status,
			machineCredential: parsed.machineCredential,
			licenseSignature: parsed.licenseSignature,
			...(typeof parsed.accountId === "string"
				? { accountId: parsed.accountId }
				: {}),
			...(typeof parsed.machineId === "string"
				? { machineId: parsed.machineId }
				: {}),
			...(typeof parsed.issued_at === "string"
				? { issued_at: parsed.issued_at }
				: {}),
			...(typeof parsed.expires_at === "string"
				? { expires_at: parsed.expires_at }
				: {}),
		},
	};
}

function canonicalizeWorkerLicenseFields(license: JsonObject) {
	return JSON.stringify({
		schemaVersion: license.schemaVersion,
		status: license.status,
		machineCredential: license.machineCredential,
		...(typeof license.accountId === "string"
			? { accountId: license.accountId }
			: {}),
		...(typeof license.machineId === "string"
			? { machineId: license.machineId }
			: {}),
		...(typeof license.issued_at === "string"
			? { issued_at: license.issued_at }
			: {}),
		...(typeof license.expires_at === "string"
			? { expires_at: license.expires_at }
			: {}),
	});
}

function verifyWorkerLicenseSignature(
	canonicalLicense: string,
	licenseSignature: string,
) {
	try {
		return verify(
			null,
			Buffer.from(canonicalLicense, "utf8"),
			WORKER_LICENSE_SIGNATURE_PUBLIC_KEY,
			Buffer.from(licenseSignature, "base64url"),
		);
	} catch {
		return false;
	}
}

export function shouldAttemptInteractiveLicenseActivation(
	context: WorkerInstallContext,
	inspection: TargetRepoInspection,
) {
	return (
		inspection.licenseStatus.status === "missing" &&
		!context.options.yes &&
		!context.options.json &&
		Boolean(process.stdin.isTTY)
	);
}

export async function activateWorkerLicense(
	context: WorkerInstallContext,
): Promise<WorkerLicenseActivationResult> {
	let startResponse: WorkerActivationStartResponse;
	try {
		startResponse = await startWorkerLicenseActivation(context);
	} catch (error) {
		return {
			status: "failed",
			reason:
				error instanceof Error
					? error.message
					: "Worker license activation could not start.",
		};
	}

	const browserUrl =
		startResponse.verificationUrlComplete ?? startResponse.verificationUrl;
	process.stderr.write(
		[
			"Shipbysunday Worker license activation is required before install.",
			`Open: ${browserUrl}`,
			`Code: ${startResponse.userCode}`,
			"",
		].join("\n"),
	);
	openActivationUrl(context, browserUrl);

	const pollResult = await pollWorkerLicenseActivation({
		context,
		deviceCode: startResponse.deviceCode,
		expiresAt: startResponse.expiresAt,
		intervalMs: startResponse.intervalMs,
	});
	if (pollResult.status !== "approved") {
		return {
			status: pollResult.status === "pending" ? "failed" : "blocked",
			reason:
				pollResult.status === "pending"
					? "Worker license activation timed out before approval."
					: pollResult.reason,
		};
	}

	const serializedLicense = `${JSON.stringify(pollResult.license, null, "\t")}\n`;
	const validation = validateWorkerLicenseFile(serializedLicense);
	if (!validation.valid) {
		return {
			status: "failed",
			reason: validation.reason,
		};
	}
	await mkdir(context.workerHome, { recursive: true });
	await writeFile(
		path.join(context.workerHome, "license.json"),
		serializedLicense,
		{ mode: 0o600 },
	);
	process.stderr.write("Worker license activated on this machine.\n");
	return { status: "activated" };
}

async function startWorkerLicenseActivation(
	context: WorkerInstallContext,
): Promise<WorkerActivationStartResponse> {
	const response = await postWorkerActivationJson({
		context,
		pathname: WORKER_LICENSE_ACTIVATION_START_PATH,
		body: {
			activationKind: "worker-foundations-install",
			installerVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
			workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		},
	});
	const parsed = parseActivationStartResponse(response);
	if (!parsed) {
		throw new Error("Worker license activation start response was invalid.");
	}
	return parsed;
}

async function pollWorkerLicenseActivation({
	context,
	deviceCode,
	expiresAt,
	intervalMs,
}: {
	context: WorkerInstallContext;
	deviceCode: string;
	expiresAt: number;
	intervalMs: number;
}): Promise<WorkerActivationPollResponse> {
	const deadline = Math.min(
		expiresAt,
		context.now + DEFAULT_ACTIVATION_TIMEOUT_MS,
	);
	let nextDelayMs = intervalMs;
	while (Date.now() < deadline) {
		await delay(nextDelayMs);
		const response = await postWorkerActivationJson({
			context,
			pathname: WORKER_LICENSE_ACTIVATION_POLL_PATH,
			body: { deviceCode },
		});
		const parsed = parseActivationPollResponse(response);
		if (!parsed) {
			return {
				status: "denied",
				reason: "Worker license activation poll response was invalid.",
			};
		}
		if (parsed.status !== "pending") {
			return parsed;
		}
		nextDelayMs = Math.min(nextDelayMs + 500, MAX_ACTIVATION_POLL_INTERVAL_MS);
	}
	return { status: "pending" };
}

async function postWorkerActivationJson({
	context,
	pathname,
	body,
}: {
	context: WorkerInstallContext;
	pathname: string;
	body: JsonObject;
}) {
	const response = await fetch(
		new URL(pathname, resolveWorkerLicenseApiBaseUrl(context.env)),
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		},
	);
	if (!response.ok) {
		throw new Error(
			`Worker license activation failed with HTTP ${response.status}.`,
		);
	}
	return (await response.json()) as JsonValue;
}

function parseActivationStartResponse(
	value: JsonValue,
): WorkerActivationStartResponse | null {
	if (!isJsonObject(value)) {
		return null;
	}
	const deviceCode = readStringValue(value, "deviceCode");
	const userCode = readStringValue(value, "userCode");
	const verificationUrl = readStringValue(value, "verificationUrl");
	const verificationUrlComplete = readOptionalStringValue(
		value,
		"verificationUrlComplete",
	);
	const expiresAtValue = value.expiresAt;
	const expiresAt =
		typeof expiresAtValue === "string"
			? Date.parse(expiresAtValue)
			: typeof expiresAtValue === "number"
				? expiresAtValue
				: Number.NaN;
	const intervalSeconds =
		typeof value.intervalSeconds === "number" ? value.intervalSeconds : 2;
	if (
		!deviceCode ||
		!userCode ||
		!verificationUrl ||
		!Number.isFinite(expiresAt)
	) {
		return null;
	}
	return {
		deviceCode,
		userCode,
		verificationUrl,
		...(verificationUrlComplete ? { verificationUrlComplete } : {}),
		expiresAt,
		intervalMs: Math.min(
			Math.max(intervalSeconds * 1_000, MIN_ACTIVATION_POLL_INTERVAL_MS),
			MAX_ACTIVATION_POLL_INTERVAL_MS,
		),
	};
}

function parseActivationPollResponse(
	value: JsonValue,
): WorkerActivationPollResponse | null {
	if (!isJsonObject(value)) {
		return null;
	}
	if (value.status === "pending") {
		return { status: "pending" };
	}
	if (value.status === "denied" || value.status === "expired") {
		return {
			status: value.status,
			reason: formatActivationPollBlockerReason(value.status),
		};
	}
	if (value.status === "approved" && isJsonObject(value.license)) {
		const licenseText = `${JSON.stringify(value.license)}\n`;
		const validation = validateWorkerLicenseFile(licenseText);
		if (!validation.valid) {
			return null;
		}
		return { status: "approved", license: validation.license };
	}
	return null;
}

function formatActivationPollBlockerReason(
	status: Extract<WorkerActivationPollResponse["status"], "denied" | "expired">,
) {
	return status === "denied"
		? "Worker license activation was denied."
		: "Worker license activation expired before approval.";
}

function readStringValue(value: JsonObject, key: string) {
	const item = value[key];
	return typeof item === "string" && item.trim() !== "" ? item : null;
}

function readOptionalStringValue(value: JsonObject, key: string) {
	const item = value[key];
	return typeof item === "string" && item.trim() !== "" ? item : null;
}

function resolveWorkerLicenseApiBaseUrl(env: NodeJS.ProcessEnv) {
	return new URL(
		env[WORKER_LICENSE_API_BASE_URL_ENV_VAR] ??
			DEFAULT_WORKER_LICENSE_API_BASE_URL,
	).toString();
}

function openActivationUrl(
	context: WorkerInstallContext,
	activationUrl: string,
) {
	if (
		context.env[WORKER_LICENSE_OPEN_BROWSER_ENV_VAR] === "0" ||
		context.env.CI === "true"
	) {
		return;
	}
	const opener =
		process.platform === "darwin"
			? { args: [activationUrl], command: "open" }
			: process.platform === "win32"
				? { args: ["/c", "start", "", activationUrl], command: "cmd" }
				: { args: [activationUrl], command: "xdg-open" };
	spawnSync(opener.command, opener.args, {
		stdio: "ignore",
		env: buildCodexKickoffEnv(context),
	});
}

async function delay(ms: number) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJsonObject(text: string): JsonObject | null {
	try {
		const value = JSON.parse(text) as JsonValue;
		return isJsonObject(value) ? value : null;
	} catch {
		return null;
	}
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
