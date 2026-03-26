import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import Stripe from "stripe";

import {
	buildStripeCliArgs,
	buildStripeCliProjectCheck,
	parseStripeCliConfigListOutput,
} from "./lib/stripe-cli-project.mjs";

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const CONVEX_BIN_PATH = path.join(
	process.cwd(),
	"node_modules",
	"convex",
	"bin",
	"main.js",
);
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);

function parseArgs(argv) {
	let listenerSecret = null;

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];
		if (current?.startsWith("--secret=")) {
			listenerSecret = current.slice("--secret=".length);
			continue;
		}

		if (current === "--secret") {
			listenerSecret = argv[index + 1] ?? null;
			index += 1;
		}
	}

	return { listenerSecret };
}

function runCommand(command, args) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
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

async function readEnvValue(key) {
	const raw = await readFile(ENV_FILE_PATH, "utf8");
	const match = raw.match(new RegExp(`^${key}=(.*)$`, "m"));
	return match ? match[1].trim() : null;
}

async function getStripeAccountSummary() {
	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: "2026-02-25.clover",
	});
	const account = await stripe.accounts.retrieve();
	return {
		id: account.id,
		displayName:
			account.settings?.dashboard?.display_name ??
			account.business_profile?.name ??
			"Unknown Stripe account",
	};
}

async function getConvexEnvList() {
	const result = await runCommand(process.execPath, [
		CONVEX_BIN_PATH,
		"env",
		"list",
	]);
	if (result.code !== 0) {
		throw new Error(
			result.stderr || result.stdout || "Failed to read Convex env.",
		);
	}

	return result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.reduce((acc, line) => {
			const [key, ...rest] = line.split("=");
			acc[key] = rest.join("=");
			return acc;
		}, {});
}

async function getStripeCliProjectConfig() {
	try {
		const result = await runCommand(
			"stripe",
			buildStripeCliArgs(["config", "--list"]),
		);
		if (result.code !== 0) {
			return { stripeCliAvailable: false, projectConfig: null };
		}

		return {
			stripeCliAvailable: true,
			projectConfig: parseStripeCliConfigListOutput(result.stdout),
		};
	} catch {
		return { stripeCliAvailable: false, projectConfig: null };
	}
}

function isLocalhostUrl(urlString) {
	return LOCALHOST_HOSTS.has(new URL(urlString).hostname);
}

function getHostedConvexDevContext() {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
	const convexSiteUrl =
		process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim() || convexUrl;
	if (!convexUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_CONVEX_URL in .env.local. Run `bun run dev:convex` to sync your hosted Convex dev deployment.",
		);
	}

	if (isLocalhostUrl(convexUrl)) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_URL must point to your hosted Convex dev deployment, not localhost. Run `bun run dev:convex` to refresh .env.local.",
		);
	}

	if (!convexSiteUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_CONVEX_SITE_URL in .env.local. Set the Convex HTTP-actions origin before testing Stripe webhooks.",
		);
	}

	if (isLocalhostUrl(convexSiteUrl)) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_SITE_URL must point to your hosted Convex HTTP-actions origin, not localhost.",
		);
	}

	const deploymentName = process.env.CONVEX_DEPLOYMENT?.trim();
	if (!deploymentName) {
		throw new Error(
			"Missing CONVEX_DEPLOYMENT in .env.local. Run `bun run dev:convex` to sync your hosted Convex dev deployment.",
		);
	}

	return { convexSiteUrl, deploymentName };
}

async function canConnect(urlString) {
	const url = new URL(urlString);
	const port =
		url.port ||
		(url.protocol === "https:" ? "443" : url.protocol === "http:" ? "80" : "");

	if (!port) {
		return false;
	}

	return new Promise((resolve) => {
		const socket = net.createConnection(
			{ host: url.hostname, port: Number(port) },
			() => {
				socket.end();
				resolve(true);
			},
		);

		socket.on("error", () => resolve(false));
		socket.setTimeout(1500, () => {
			socket.destroy();
			resolve(false);
		});
	});
}

function formatCheck(label, passed, detail) {
	return `${passed ? "PASS" : "FAIL"} ${label}: ${detail}`;
}

const { listenerSecret } = parseArgs(process.argv.slice(2));

if (!process.env.STRIPE_SECRET_KEY) {
	console.error("Missing STRIPE_SECRET_KEY in environment.");
	process.exit(1);
}

await access(ENV_FILE_PATH);
let convexDevContext;
try {
	convexDevContext = getHostedConvexDevContext();
} catch (error) {
	console.error(
		error instanceof Error
			? error.message
			: "Missing hosted Convex dev deployment config.",
	);
	process.exit(1);
}

const { convexSiteUrl, deploymentName } = convexDevContext;

const stripeAccount = await getStripeAccountSummary();
const envWebhookSecret = await readEnvValue("STRIPE_WEBHOOK_SECRET");
const envStripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? null;
const convexEnv = await getConvexEnvList();
const convexWebhookSecret = convexEnv.STRIPE_WEBHOOK_SECRET ?? null;
const convexStripeSecretKey = convexEnv.STRIPE_SECRET_KEY ?? null;
const { stripeCliAvailable, projectConfig: stripeCliProjectConfig } =
	await getStripeCliProjectConfig();
const stripeCliProjectCheck = buildStripeCliProjectCheck({
	projectConfig: stripeCliProjectConfig,
	stripeAccount,
	stripeCliAvailable,
});
const webReachable = await canConnect("http://localhost:3000");
const convexReachable = await canConnect(convexSiteUrl);

const checks = [
	formatCheck(
		"Stripe account",
		true,
		`${stripeAccount.displayName} (${stripeAccount.id})`,
	),
	formatCheck(
		stripeCliProjectCheck.label,
		stripeCliProjectCheck.passed,
		stripeCliProjectCheck.detail,
	),
	formatCheck("Convex dev deployment target", true, deploymentName),
	formatCheck(
		".env.local webhook secret",
		Boolean(envWebhookSecret),
		envWebhookSecret ?? "missing",
	),
	formatCheck(
		"Convex webhook secret",
		Boolean(convexWebhookSecret),
		convexWebhookSecret ?? "missing",
	),
	formatCheck(
		"Convex Stripe secret key",
		Boolean(convexStripeSecretKey),
		convexStripeSecretKey ? "present" : "missing",
	),
	formatCheck(
		"Webhook secret parity",
		Boolean(envWebhookSecret) && envWebhookSecret === convexWebhookSecret,
		envWebhookSecret === convexWebhookSecret ? "matched" : "mismatch",
	),
	formatCheck(
		"Stripe secret key parity",
		Boolean(envStripeSecretKey) &&
			Boolean(convexStripeSecretKey) &&
			envStripeSecretKey === convexStripeSecretKey,
		envStripeSecretKey === convexStripeSecretKey ? "matched" : "mismatch",
	),
	formatCheck(
		"Web app",
		webReachable,
		webReachable ? "localhost:3000 reachable" : "localhost:3000 unreachable",
	),
	formatCheck(
		"Convex HTTP endpoint",
		convexReachable,
		convexReachable
			? `${convexSiteUrl} reachable`
			: `${convexSiteUrl} unreachable`,
	),
];

if (listenerSecret) {
	checks.push(
		formatCheck(
			"Listener secret parity",
			listenerSecret === envWebhookSecret &&
				listenerSecret === convexWebhookSecret,
			listenerSecret === envWebhookSecret &&
				listenerSecret === convexWebhookSecret
				? "matched"
				: "listener secret differs from app or Convex env",
		),
	);
}

console.log("Stripe dev doctor");
for (const check of checks) {
	console.log(`- ${check}`);
}

if (stripeCliProjectCheck.guidance) {
	console.log(
		`- ACTION ${stripeCliProjectCheck.label}: ${stripeCliProjectCheck.guidance}`,
	);
}

const failedCount = checks.filter((check) => check.startsWith("FAIL")).length;
console.log(`Summary: ${failedCount === 0 ? "PASS" : `FAIL (${failedCount})`}`);

if (failedCount > 0) {
	process.exitCode = 1;
}
