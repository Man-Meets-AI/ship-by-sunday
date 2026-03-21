import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

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
	const deploymentName = envEntries.CONVEX_DEPLOYMENT?.trim();

	if (!convexUrl || !deploymentName) {
		return null;
	}

	try {
		const hostname = new URL(convexUrl).hostname;
		if (LOCALHOST_HOSTS.has(hostname)) {
			return null;
		}
	} catch {
		return null;
	}

	return { convexUrl, deploymentName };
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
					`[dev:stripe] Using ${hostedConvexDevContext.deploymentName} (${hostedConvexDevContext.convexUrl})\n`,
				);
				return;
			}
		} catch {}

		await sleep(POLL_INTERVAL_MS);
	}
}

await waitForHostedConvexDevContext();

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
