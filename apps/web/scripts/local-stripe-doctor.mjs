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
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);
const DEFAULT_LOCAL_APP_BASE_URL = "http://localhost:3000";

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
	const result = await runCommand("bunx", ["convex", "env", "list"]);
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
const appBaseUrl =
	process.env.APP_BASE_URL?.trim() || DEFAULT_LOCAL_APP_BASE_URL;
const envWebhookSecret = await readEnvValue("STRIPE_WEBHOOK_SECRET");
const envStripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? null;
const envClerkSecretKey = process.env.CLERK_SECRET_KEY?.trim() ?? null;
const envCheckoutFulfillmentSecret =
	process.env.CHECKOUT_FULFILLMENT_RETRY_SECRET?.trim() ?? null;
const envConvexMutationSecret =
	process.env.CONVEX_WEBHOOK_MUTATION_SECRET?.trim() ?? null;
const convexEnv = await getConvexEnvList();
const convexStripeSecretKey = convexEnv.STRIPE_SECRET_KEY ?? null;
const convexClerkSecretKey = convexEnv.CLERK_SECRET_KEY ?? null;
const convexCheckoutFulfillmentSecret =
	convexEnv.CHECKOUT_FULFILLMENT_RETRY_SECRET ?? null;
const convexMutationSecret = convexEnv.CONVEX_WEBHOOK_MUTATION_SECRET ?? null;
const { stripeCliAvailable, projectConfig: stripeCliProjectConfig } =
	await getStripeCliProjectConfig();
const stripeCliProjectCheck = buildStripeCliProjectCheck({
	projectConfig: stripeCliProjectConfig,
	stripeAccount,
	stripeCliAvailable,
});
const webReachable = await canConnect("http://localhost:3000");
const webhookAppOriginReachable = await canConnect(appBaseUrl);
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
		envWebhookSecret ? "present" : "missing",
	),
	formatCheck(
		"Convex mutation secret parity",
		Boolean(envConvexMutationSecret) &&
			Boolean(convexMutationSecret) &&
			envConvexMutationSecret === convexMutationSecret,
		envConvexMutationSecret === convexMutationSecret ? "matched" : "mismatch",
	),
	formatCheck(
		"Checkout fulfillment secret parity",
		Boolean(envCheckoutFulfillmentSecret) &&
			Boolean(convexCheckoutFulfillmentSecret) &&
			envCheckoutFulfillmentSecret === convexCheckoutFulfillmentSecret,
		envCheckoutFulfillmentSecret === convexCheckoutFulfillmentSecret
			? "matched"
			: "mismatch",
	),
	formatCheck(
		"Stripe secret key parity",
		Boolean(envStripeSecretKey) &&
			Boolean(convexStripeSecretKey) &&
			envStripeSecretKey === convexStripeSecretKey,
		envStripeSecretKey === convexStripeSecretKey ? "matched" : "mismatch",
	),
	formatCheck(
		"Clerk secret key parity",
		Boolean(envClerkSecretKey) &&
			Boolean(convexClerkSecretKey) &&
			envClerkSecretKey === convexClerkSecretKey,
		envClerkSecretKey === convexClerkSecretKey ? "matched" : "mismatch",
	),
	formatCheck(
		"Web app",
		webReachable,
		webReachable ? "localhost:3000 reachable" : "localhost:3000 unreachable",
	),
	formatCheck(
		"Stripe webhook app origin",
		webhookAppOriginReachable,
		webhookAppOriginReachable
			? `${appBaseUrl}/api/stripe/webhook reachable`
			: `${appBaseUrl}/api/stripe/webhook unreachable`,
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
			listenerSecret === envWebhookSecret,
			listenerSecret === envWebhookSecret
				? "matched"
				: "listener secret differs from app env",
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
