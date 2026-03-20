import { spawn } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import Stripe from "stripe";

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const CONVEX_BIN_PATH = path.join(
	process.cwd(),
	"node_modules",
	"convex",
	"bin",
	"main.js",
);

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

async function getStripeCliConfig() {
	const result = await runCommand("stripe", ["config", "--list"]);
	if (result.code !== 0) {
		return null;
	}

	const values = result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.reduce((acc, line) => {
			const [key, ...rest] = line.split("=");
			acc[key.trim()] = rest.join("=").trim().replace(/^'|'$/g, "");
			return acc;
		}, {});

	return {
		accountId: values.account_id ?? null,
		displayName: values.display_name ?? null,
	};
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

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
	console.error("Missing NEXT_PUBLIC_CONVEX_URL in environment.");
	process.exit(1);
}

await access(ENV_FILE_PATH);

const stripeAccount = await getStripeAccountSummary();
const envWebhookSecret = await readEnvValue("STRIPE_WEBHOOK_SECRET");
const envStripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? null;
const convexEnv = await getConvexEnvList();
const convexWebhookSecret = convexEnv.STRIPE_WEBHOOK_SECRET ?? null;
const convexStripeSecretKey = convexEnv.STRIPE_SECRET_KEY ?? null;
const stripeCliConfig = await getStripeCliConfig();
const webReachable = await canConnect("http://localhost:3000");
const convexReachable = await canConnect(process.env.NEXT_PUBLIC_CONVEX_URL);

const checks = [
	formatCheck(
		"Stripe account",
		true,
		`${stripeAccount.displayName} (${stripeAccount.id})`,
	),
	formatCheck(
		"Stripe CLI default account",
		!stripeCliConfig ||
			!stripeCliConfig.accountId ||
			stripeCliConfig.accountId === stripeAccount.id,
		stripeCliConfig?.accountId
			? `${stripeCliConfig.displayName ?? "Stripe CLI"} (${stripeCliConfig.accountId})`
			: "not available",
	),
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
		"Convex local endpoint",
		convexReachable,
		convexReachable
			? `${process.env.NEXT_PUBLIC_CONVEX_URL} reachable`
			: `${process.env.NEXT_PUBLIC_CONVEX_URL} unreachable`,
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

console.log("Local Stripe doctor");
for (const check of checks) {
	console.log(`- ${check}`);
}

const failedCount = checks.filter((check) => check.startsWith("FAIL")).length;
console.log(`Summary: ${failedCount === 0 ? "PASS" : `FAIL (${failedCount})`}`);

if (failedCount > 0) {
	process.exitCode = 1;
}
