import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);
const CLERK_DEV_HOST_SUFFIX = ".clerk.accounts.dev";

export function formatCheck(check) {
	return `${check.passed ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`;
}

export function parseEnvFile(fileContents) {
	const envEntries = {};

	for (const line of fileContents.split(/\r?\n/)) {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith("#")) {
			continue;
		}

		const separatorIndex = trimmedLine.indexOf("=");
		if (separatorIndex < 0) {
			continue;
		}

		const key = trimmedLine.slice(0, separatorIndex).trim();
		const value = trimmedLine.slice(separatorIndex + 1).trim();
		if (key) {
			envEntries[key] = value;
		}
	}

	return envEntries;
}

export async function readEnvFileEntries(envFilePath = ENV_FILE_PATH) {
	const envFileContents = await readFile(envFilePath, "utf8");
	return parseEnvFile(envFileContents);
}

export function getHostedConvexDevContext(envEntries) {
	const convexUrl = envEntries.NEXT_PUBLIC_CONVEX_URL?.trim();
	const deploymentName = envEntries.CONVEX_DEPLOYMENT?.trim();

	if (!convexUrl || !deploymentName) {
		return null;
	}

	try {
		if (LOCALHOST_HOSTS.has(new URL(convexUrl).hostname)) {
			return null;
		}
	} catch {
		return null;
	}

	return { convexUrl, deploymentName };
}

export function getClerkKeyMode(key) {
	if (!key) {
		return "missing";
	}

	if (key.startsWith("pk_live_") || key.startsWith("sk_live_")) {
		return "live";
	}

	if (key.startsWith("pk_test_") || key.startsWith("sk_test_")) {
		return "test";
	}

	return "unknown";
}

export function getClerkFrontendApiMode(frontendApiUrl) {
	if (!frontendApiUrl) {
		return "missing";
	}

	try {
		const hostname = new URL(frontendApiUrl).hostname.toLowerCase();
		return hostname.endsWith(CLERK_DEV_HOST_SUFFIX) ? "test" : "live";
	} catch {
		return "invalid";
	}
}

export function summarizeClerkKey(key) {
	if (!key) {
		return "missing";
	}

	if (key.length <= 18) {
		return key;
	}

	return `${key.slice(0, 12)}...${key.slice(-6)}`;
}

function summarizeUrlOrigin(urlString) {
	if (!urlString) {
		return "missing";
	}

	try {
		return new URL(urlString).origin;
	} catch {
		return urlString;
	}
}

function describeMode(mode) {
	if (mode === "test" || mode === "live") {
		return mode;
	}

	return "unknown";
}

export function buildClerkConvexDevAuthReport({
	convexUrl,
	deploymentName,
	hostedFrontendApiUrl,
	localFrontendApiUrl,
	localPublishableKey,
	localSecretKey,
}) {
	const checks = [];
	const pushCheck = (label, passed, detail) => {
		checks.push({ label, passed, detail });
	};

	pushCheck(
		"Hosted Convex dev deployment",
		Boolean(convexUrl && deploymentName),
		convexUrl && deploymentName
			? `${deploymentName} (${convexUrl})`
			: "Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_DEPLOYMENT in .env.local.",
	);

	pushCheck(
		"Local Clerk publishable key",
		Boolean(localPublishableKey),
		localPublishableKey
			? summarizeClerkKey(localPublishableKey)
			: "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local.",
	);

	pushCheck(
		"Local Clerk secret key",
		Boolean(localSecretKey),
		localSecretKey
			? summarizeClerkKey(localSecretKey)
			: "Missing CLERK_SECRET_KEY in .env.local.",
	);

	const publishableKeyMode = getClerkKeyMode(localPublishableKey);
	const secretKeyMode = getClerkKeyMode(localSecretKey);
	const localFrontendMode = getClerkFrontendApiMode(localFrontendApiUrl);
	const hostedFrontendMode = getClerkFrontendApiMode(hostedFrontendApiUrl);

	if (publishableKeyMode === "unknown") {
		pushCheck(
			"Local Clerk publishable key mode",
			false,
			`${summarizeClerkKey(localPublishableKey)} is not a Clerk pk_test_/pk_live_ key.`,
		);
	}

	if (secretKeyMode === "unknown") {
		pushCheck(
			"Local Clerk secret key mode",
			false,
			`${summarizeClerkKey(localSecretKey)} is not a Clerk sk_test_/sk_live_ key.`,
		);
	}

	if (
		(publishableKeyMode === "test" || publishableKeyMode === "live") &&
		(secretKeyMode === "test" || secretKeyMode === "live")
	) {
		pushCheck(
			"Local Clerk key mode alignment",
			publishableKeyMode === secretKeyMode,
			publishableKeyMode === secretKeyMode
				? publishableKeyMode
				: `publishable=${publishableKeyMode}, secret=${secretKeyMode}`,
		);
	}

	if (!localFrontendApiUrl) {
		pushCheck(
			"Local Clerk frontend API URL",
			false,
			"Missing CLERK_FRONTEND_API_URL in .env.local.",
		);
	} else if (localFrontendMode === "invalid") {
		pushCheck(
			"Local Clerk frontend API URL",
			false,
			`${localFrontendApiUrl} is not a valid URL.`,
		);
	} else {
		pushCheck(
			"Local Clerk frontend API URL",
			true,
			`${summarizeUrlOrigin(localFrontendApiUrl)} (${describeMode(localFrontendMode)})`,
		);
	}

	if (
		(localFrontendMode === "test" || localFrontendMode === "live") &&
		(publishableKeyMode === "test" || publishableKeyMode === "live")
	) {
		pushCheck(
			"Local Clerk issuer vs key mode",
			localFrontendMode === publishableKeyMode,
			`${summarizeUrlOrigin(localFrontendApiUrl)} implies ${localFrontendMode}, local key mode is ${publishableKeyMode}`,
		);
	}

	if (!hostedFrontendApiUrl) {
		pushCheck(
			"Hosted Convex Clerk issuer",
			false,
			`Missing CLERK_FRONTEND_API_URL on ${deploymentName ?? "the active hosted Convex deployment"}.`,
		);
	} else if (hostedFrontendMode === "invalid") {
		pushCheck(
			"Hosted Convex Clerk issuer",
			false,
			`${hostedFrontendApiUrl} is not a valid URL.`,
		);
	} else {
		pushCheck(
			"Hosted Convex Clerk issuer",
			hostedFrontendApiUrl === localFrontendApiUrl,
			hostedFrontendApiUrl === localFrontendApiUrl
				? `${deploymentName} trusts ${summarizeUrlOrigin(hostedFrontendApiUrl)}`
				: `${deploymentName} trusts ${summarizeUrlOrigin(hostedFrontendApiUrl)} but local dev uses ${summarizeUrlOrigin(localFrontendApiUrl)}`,
		);
	}

	if (
		(hostedFrontendMode === "test" || hostedFrontendMode === "live") &&
		(publishableKeyMode === "test" || publishableKeyMode === "live")
	) {
		pushCheck(
			"Hosted Convex issuer vs local key mode",
			hostedFrontendMode === publishableKeyMode,
			`${deploymentName} issuer implies ${hostedFrontendMode}, local key mode is ${publishableKeyMode}`,
		);
	}

	return {
		checks,
		hasFailure: checks.some((check) => !check.passed),
	};
}

export function buildClerkConvexDevFixSteps({ deploymentName }) {
	return [
		"Use the same Clerk instance for NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, and CLERK_FRONTEND_API_URL in apps/web/.env.local.",
		`Push that same issuer into ${deploymentName ?? "the active hosted Convex dev deployment"} with: cd apps/web && bunx convex env set CLERK_FRONTEND_API_URL "$CLERK_FRONTEND_API_URL"`,
		"Restart `bun run dev` after changing auth env values so the web server and Convex watcher both pick up the new issuer.",
		"Re-run `bun run auth:dev:doctor` until every check passes.",
	];
}

export function buildStartupSuccessMessage({
	deploymentName,
	localFrontendApiUrl,
	localPublishableKey,
}) {
	const localKeyMode = getClerkKeyMode(localPublishableKey);
	return `[auth guardrail] PASS ${deploymentName} trusts ${summarizeUrlOrigin(localFrontendApiUrl)} and matches local Clerk ${describeMode(localKeyMode)} keys.`;
}

export function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: options.cwd ?? process.cwd(),
			env: options.env ?? process.env,
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

		child.on("error", reject);
		child.on("close", (code) => {
			resolve({ code: code ?? 1, stdout, stderr });
		});
	});
}

export async function getConvexEnvEntries() {
	const result = await runCommand("bunx", ["convex", "env", "list"]);
	if (result.code !== 0) {
		throw new Error(
			result.stderr || result.stdout || "Failed to read Convex env values.",
		);
	}

	return parseEnvFile(result.stdout);
}
