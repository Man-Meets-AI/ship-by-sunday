import { spawn } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";

const WEBHOOK_ENV_KEY = "STRIPE_WEBHOOK_SECRET";
const STRIPE_SECRET_ENV_KEY = "STRIPE_SECRET_KEY";
const CLERK_SECRET_ENV_KEY = "CLERK_SECRET_KEY";
const CHECKOUT_FULFILLMENT_RETRY_SECRET_ENV_KEY =
	"CHECKOUT_FULFILLMENT_RETRY_SECRET";
const CONVEX_WEBHOOK_MUTATION_SECRET_ENV_KEY = "CONVEX_WEBHOOK_MUTATION_SECRET";
const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);
const ANSI_ESCAPE_PATTERN_SOURCE =
	"\\u001B(?:[@-Z\\\\-_]|\\[[0-?]*[ -/]*[@-~])";
const ANSI_ESCAPE_PATTERN = new RegExp(ANSI_ESCAPE_PATTERN_SOURCE, "g");

function stripAnsi(value) {
	return value.replaceAll(ANSI_ESCAPE_PATTERN, "");
}

function printUsage() {
	console.log(`Usage:
  bun run stripe:listen:dev
  bun run stripe:webhook:sync -- --secret whsec_...

Commands:
  listen   Start stripe listen against STRIPE_SECRET_KEY, then sync the printed webhook secret into .env.local and trusted Convex billing secrets into the active hosted Convex dev env.
  sync     Sync a provided webhook secret into .env.local and trusted Convex billing secrets into the active hosted Convex dev env without starting a listener.`);
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
			"Missing NEXT_PUBLIC_CONVEX_SITE_URL in .env.local. Set the Convex HTTP-actions origin before running Stripe webhook forwarding.",
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

function getDefaultForwardUrl() {
	const appBaseUrl =
		process.env.APP_BASE_URL?.trim() || "http://localhost:3000";
	return `${appBaseUrl.replace(/\/$/, "")}/api/stripe/webhook`;
}

function parseArgs(argv) {
	const [command = "listen", ...rest] = argv;
	let secret = null;
	let forwardTo = null;

	for (let index = 0; index < rest.length; index += 1) {
		const current = rest[index];

		if (current === "--help" || current === "-h") {
			return { command: "help", secret: null, forwardTo };
		}

		if (current?.startsWith("--secret=")) {
			secret = current.slice("--secret=".length);
			continue;
		}

		if (current === "--secret") {
			secret = rest[index + 1] ?? null;
			index += 1;
			continue;
		}

		if (current?.startsWith("--forward-to=")) {
			forwardTo = current.slice("--forward-to=".length);
			continue;
		}

		if (current === "--forward-to") {
			forwardTo = rest[index + 1] ?? forwardTo;
			index += 1;
		}
	}

	return { command, secret, forwardTo };
}

function runCommand(command, args, options = {}) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: process.cwd(),
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
			...options,
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
			resolve({
				code: code ?? 1,
				stdout,
				stderr,
			});
		});
	});
}

async function ensureStripeCliAvailable() {
	try {
		await access("/opt/homebrew/bin/stripe");
	} catch {
		const result = await runCommand("stripe", ["version"]);
		if (result.code !== 0) {
			throw new Error("Stripe CLI is not available on PATH.");
		}
	}
}

async function getStripeAccountSummary() {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

	if (!stripeSecretKey) {
		throw new Error("Missing STRIPE_SECRET_KEY in .env.local.");
	}

	const stripe = new Stripe(stripeSecretKey, {
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

async function updateEnvFile(secret) {
	const current = await readFile(ENV_FILE_PATH, "utf8");
	const nextLine = `${WEBHOOK_ENV_KEY}=${secret}`;
	const linePattern = new RegExp(`^${WEBHOOK_ENV_KEY}=.*$`, "m");
	const next = linePattern.test(current)
		? current.replace(linePattern, nextLine)
		: `${current.trimEnd()}\n${nextLine}\n`;

	if (next !== current) {
		await writeFile(ENV_FILE_PATH, next);
		return "updated";
	}

	return "unchanged";
}

async function syncConvexEnv(key, value) {
	const result = await runCommand("bunx", ["convex", "env", "set", key, value]);

	if (result.code !== 0) {
		throw new Error(
			`Failed to sync Convex env ${key}: ${stripAnsi(result.stderr || result.stdout).trim()}`,
		);
	}

	return stripAnsi(result.stdout || result.stderr).trim();
}

function requireLocalEnvValue(key) {
	const value = process.env[key]?.trim();
	if (!value) {
		throw new Error(`Missing ${key} in .env.local.`);
	}

	return value;
}

async function syncWebhookSecret(secret) {
	if (!secret?.startsWith("whsec_")) {
		throw new Error("Expected a Stripe webhook secret starting with whsec_.");
	}

	const envFileStatus = await updateEnvFile(secret);
	const convexMutationSecretStatus = await syncConvexEnv(
		CONVEX_WEBHOOK_MUTATION_SECRET_ENV_KEY,
		requireLocalEnvValue(CONVEX_WEBHOOK_MUTATION_SECRET_ENV_KEY),
	);
	const convexCheckoutFulfillmentStatus = await syncConvexEnv(
		CHECKOUT_FULFILLMENT_RETRY_SECRET_ENV_KEY,
		requireLocalEnvValue(CHECKOUT_FULFILLMENT_RETRY_SECRET_ENV_KEY),
	);
	const convexStripeSecretStatus = await syncConvexEnv(
		STRIPE_SECRET_ENV_KEY,
		requireLocalEnvValue(STRIPE_SECRET_ENV_KEY),
	);
	const convexClerkSecretStatus = await syncConvexEnv(
		CLERK_SECRET_ENV_KEY,
		requireLocalEnvValue(CLERK_SECRET_ENV_KEY),
	);

	console.log(`Synced ${WEBHOOK_ENV_KEY}:`);
	console.log(`- .env.local: ${envFileStatus}`);
	console.log(
		`- Convex dev env (${CONVEX_WEBHOOK_MUTATION_SECRET_ENV_KEY}): ${convexMutationSecretStatus}`,
	);
	console.log(
		`- Convex dev env (${CHECKOUT_FULFILLMENT_RETRY_SECRET_ENV_KEY}): ${convexCheckoutFulfillmentStatus}`,
	);
	console.log(
		`- Convex dev env (${STRIPE_SECRET_ENV_KEY}): ${convexStripeSecretStatus}`,
	);
	console.log(
		`- Convex dev env (${CLERK_SECRET_ENV_KEY}): ${convexClerkSecretStatus}`,
	);
	console.log(
		"- Restart `bun run dev` if it was already running before the secret changed.",
	);
}

async function runSyncMode(secret) {
	if (!secret) {
		throw new Error("Missing --secret for sync mode.");
	}

	const { deploymentName } = getHostedConvexDevContext();
	const account = await getStripeAccountSummary();
	console.log(`Stripe account: ${account.displayName} (${account.id})`);
	console.log(`Convex dev deployment: ${deploymentName}`);
	await syncWebhookSecret(secret);
}

async function runListenMode(forwardTo) {
	const { deploymentName } = getHostedConvexDevContext();
	await ensureStripeCliAvailable();
	const account = await getStripeAccountSummary();
	console.log(`Stripe account: ${account.displayName} (${account.id})`);
	console.log(`Convex dev deployment: ${deploymentName}`);
	console.log(`Forward target: ${forwardTo}`);

	const child = spawn(
		"stripe",
		[
			"listen",
			"--api-key",
			process.env.STRIPE_SECRET_KEY,
			"--forward-to",
			forwardTo,
		],
		{
			cwd: process.cwd(),
			env: process.env,
			stdio: ["inherit", "pipe", "pipe"],
		},
	);

	let syncedSecret = null;

	async function handleChunk(chunk) {
		const text = String(chunk);
		const cleaned = stripAnsi(text);
		process.stdout.write(text);

		if (syncedSecret) {
			return;
		}

		const match = cleaned.match(
			/webhook signing secret is (whsec_[A-Za-z0-9]+)/,
		);
		if (!match) {
			return;
		}

		syncedSecret = match[1];
		try {
			await syncWebhookSecret(syncedSecret);
		} catch (error) {
			console.error(
				error instanceof Error
					? error.message
					: "Failed to sync webhook secret.",
			);
		}
	}

	child.stdout.on("data", (chunk) => {
		void handleChunk(chunk);
	});

	child.stderr.on("data", (chunk) => {
		void handleChunk(chunk);
	});

	await new Promise((resolve, reject) => {
		child.on("error", reject);
		child.on("close", (code) => {
			if (code && code !== 130) {
				reject(new Error(`stripe listen exited with code ${code}`));
				return;
			}

			resolve();
		});
	});
}

const { command, secret, forwardTo } = parseArgs(process.argv.slice(2));

if (command === "help") {
	printUsage();
	process.exit(0);
}

if (command !== "listen" && command !== "sync") {
	printUsage();
	process.exit(1);
}

try {
	if (command === "sync") {
		await runSyncMode(secret);
	} else {
		const resolvedForwardTo = forwardTo ?? getDefaultForwardUrl();
		await runListenMode(resolvedForwardTo);
	}
} catch (error) {
	console.error(
		error instanceof Error ? error.message : "Stripe dev webhook setup failed.",
	);
	process.exit(1);
}
