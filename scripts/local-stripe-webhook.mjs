import { spawn } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";

const WEBHOOK_ENV_KEY = "STRIPE_WEBHOOK_SECRET";
const DEFAULT_FORWARD_URL = "localhost:3000/api/stripe/webhook";
const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const CONVEX_BIN_PATH = path.join(
	process.cwd(),
	"node_modules",
	"convex",
	"bin",
	"main.js",
);
const ANSI_ESCAPE_PATTERN_SOURCE =
	"\\u001B(?:[@-Z\\\\-_]|\\[[0-?]*[ -/]*[@-~])";
const ANSI_ESCAPE_PATTERN = new RegExp(ANSI_ESCAPE_PATTERN_SOURCE, "g");

function stripAnsi(value) {
	return value.replaceAll(ANSI_ESCAPE_PATTERN, "");
}

function printUsage() {
	console.log(`Usage:
  node --env-file=.env.local scripts/local-stripe-webhook.mjs listen
  node --env-file=.env.local scripts/local-stripe-webhook.mjs sync --secret whsec_...

Commands:
  listen   Start stripe listen against STRIPE_SECRET_KEY, then sync the printed webhook secret into .env.local and Convex env.
  sync     Sync a provided webhook secret into .env.local and Convex env without starting a listener.`);
}

function parseArgs(argv) {
	const [command = "listen", ...rest] = argv;
	let secret = null;
	let forwardTo = DEFAULT_FORWARD_URL;

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

async function syncConvexEnv(secret) {
	const result = await runCommand(process.execPath, [
		CONVEX_BIN_PATH,
		"env",
		"set",
		WEBHOOK_ENV_KEY,
		secret,
	]);

	if (result.code !== 0) {
		throw new Error(
			`Failed to sync Convex env: ${stripAnsi(result.stderr || result.stdout).trim()}`,
		);
	}

	return stripAnsi(result.stdout || result.stderr).trim();
}

async function syncWebhookSecret(secret) {
	if (!secret?.startsWith("whsec_")) {
		throw new Error("Expected a Stripe webhook secret starting with whsec_.");
	}

	const envFileStatus = await updateEnvFile(secret);
	const convexStatus = await syncConvexEnv(secret);

	console.log(`Synced ${WEBHOOK_ENV_KEY}:`);
	console.log(`- .env.local: ${envFileStatus}`);
	console.log(`- Convex env: ${convexStatus}`);
	console.log(
		"- Restart `pnpm run dev:web` if it was already running before the secret changed.",
	);
}

async function runSyncMode(secret) {
	if (!secret) {
		throw new Error("Missing --secret for sync mode.");
	}

	const account = await getStripeAccountSummary();
	console.log(`Stripe account: ${account.displayName} (${account.id})`);
	await syncWebhookSecret(secret);
}

async function runListenMode(forwardTo) {
	await ensureStripeCliAvailable();
	const account = await getStripeAccountSummary();
	console.log(`Stripe account: ${account.displayName} (${account.id})`);
	console.log(`Forward target: http://${forwardTo}`);

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
		await runListenMode(forwardTo);
	}
} catch (error) {
	console.error(
		error instanceof Error
			? error.message
			: "Stripe local webhook setup failed.",
	);
	process.exit(1);
}
