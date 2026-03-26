import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import Stripe from "stripe";

import {
	buildStripeCliArgs,
	buildStripeCliProjectCheck,
	parseStripeCliConfigListOutput,
	STRIPE_CLI_PROJECT_NAME,
} from "./lib/stripe-cli-project.mjs";

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);
const POLL_INTERVAL_MS = 1_000;

function parseEnvFile(fileContents) {
	const entries = {};
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
			entries[key] = value;
		}
	}

	return entries;
}

function getHostedConvexDevContext(envEntries) {
	const convexUrl = envEntries.NEXT_PUBLIC_CONVEX_URL?.trim();
	const convexSiteUrl =
		envEntries.NEXT_PUBLIC_CONVEX_SITE_URL?.trim() || convexUrl;
	const deploymentName = envEntries.CONVEX_DEPLOYMENT?.trim();

	if (!convexUrl || !convexSiteUrl || !deploymentName) {
		return null;
	}

	try {
		const clientHostname = new URL(convexUrl).hostname;
		const httpHostname = new URL(convexSiteUrl).hostname;
		if (
			LOCALHOST_HOSTS.has(clientHostname) ||
			LOCALHOST_HOSTS.has(httpHostname)
		) {
			return null;
		}
	} catch {
		return null;
	}

	return { convexUrl, convexSiteUrl, deploymentName };
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
			resolve({
				code: code ?? 1,
				stdout,
				stderr,
			});
		});
	});
}

async function getStripeAccountSummary(stripeSecretKey) {
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

async function warnAboutStripeCliProject(envEntries) {
	const stripeSecretKey = envEntries.STRIPE_SECRET_KEY?.trim();
	if (!stripeSecretKey) {
		process.stderr.write(
			"[dev:stripe] WARNING Missing STRIPE_SECRET_KEY in .env.local. The Stripe listener will fail until app secrets are synced.\n",
		);
		return;
	}

	try {
		const stripeAccount = await getStripeAccountSummary(stripeSecretKey);
		const { stripeCliAvailable, projectConfig } =
			await getStripeCliProjectConfig();
		const stripeCliProjectCheck = buildStripeCliProjectCheck({
			projectConfig,
			stripeAccount,
			stripeCliAvailable,
		});

		if (stripeCliProjectCheck.passed) {
			process.stdout.write(
				`[dev:stripe] Stripe CLI project ${STRIPE_CLI_PROJECT_NAME} matches ${stripeAccount.displayName} (${stripeAccount.id})\n`,
			);
			return;
		}

		process.stderr.write(
			`[dev:stripe] WARNING ${stripeCliProjectCheck.label}: ${stripeCliProjectCheck.detail}\n`,
		);
		if (stripeCliProjectCheck.guidance) {
			process.stderr.write(
				`[dev:stripe] WARNING ${stripeCliProjectCheck.guidance}\n`,
			);
		}
	} catch (error) {
		process.stderr.write(
			`[dev:stripe] WARNING Skipping Stripe CLI project guardrail: ${error instanceof Error ? error.message : "Unknown Stripe account lookup failure."}\n`,
		);
	}
}

async function waitForHostedConvexDevContext() {
	process.stdout.write(
		"[dev:stripe] Waiting for hosted Convex dev deployment in .env.local...\n",
	);

	while (true) {
		try {
			const envFileContents = await readFile(ENV_FILE_PATH, "utf8");
			const envEntries = parseEnvFile(envFileContents);
			const hostedConvexDevContext = getHostedConvexDevContext(envEntries);

			if (hostedConvexDevContext) {
				process.stdout.write(
					`[dev:stripe] Using ${hostedConvexDevContext.deploymentName} (client ${hostedConvexDevContext.convexUrl}, http ${hostedConvexDevContext.convexSiteUrl})\n`,
				);
				return envEntries;
			}
		} catch {}

		await sleep(POLL_INTERVAL_MS);
	}
}

const envEntries = await waitForHostedConvexDevContext();
await warnAboutStripeCliProject(envEntries);

const stripeListener = spawn(
	process.execPath,
	["--env-file=.env.local", "scripts/local-stripe-webhook.mjs", "listen"],
	{
		cwd: process.cwd(),
		env: process.env,
		stdio: ["inherit", "pipe", "pipe"],
	},
);

stripeListener.stdout.pipe(process.stdout);
stripeListener.stderr.pipe(process.stderr);

const forwardSignal = (signal) => {
	if (!stripeListener.killed) {
		stripeListener.kill(signal);
	}
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

stripeListener.on("exit", (code, signal) => {
	if (signal) {
		process.exit(1);
	}

	process.exit(code ?? 1);
});
