import { spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import {
	getHostedConvexDevContext,
	readEnvFileEntries,
} from "./lib/clerk-convex-dev-auth-guardrail.mjs";

const NEXT_BIN_PATH = path.join(
	process.cwd(),
	"node_modules",
	".bin",
	process.platform === "win32" ? "next.cmd" : "next",
);
const POLL_INTERVAL_MS = 1_000;
const WAIT_TIMEOUT_MS = 20_000;

async function waitForHostedConvexDevContext() {
	process.stdout.write(
		"[dev:web] Waiting for hosted Convex dev deployment in .env.local...\n",
	);

	const startedAt = Date.now();

	while (Date.now() - startedAt < WAIT_TIMEOUT_MS) {
		try {
			const envEntries = await readEnvFileEntries();
			const hostedConvexDevContext = getHostedConvexDevContext(envEntries);

			if (hostedConvexDevContext) {
				process.stdout.write(
					`[dev:web] Using ${hostedConvexDevContext.deploymentName} (${hostedConvexDevContext.convexUrl})\n`,
				);
				return;
			}
		} catch {}

		await sleep(POLL_INTERVAL_MS);
	}

	throw new Error(
		"Timed out waiting for hosted Convex dev deployment config in .env.local. Run `bun run dev:convex` in another terminal, or use `bun run dev` so Convex can sync the deployment first.",
	);
}

function runStartupAuthDoctor() {
	return new Promise((resolve, reject) => {
		const doctorProcess = spawn(
			process.execPath,
			[
				"--env-file=.env.local",
				"scripts/local-clerk-convex-auth-doctor.mjs",
				"--startup-check",
			],
			{
				cwd: process.cwd(),
				env: process.env,
				stdio: "inherit",
			},
		);

		doctorProcess.on("error", reject);
		doctorProcess.on("close", (code) => {
			resolve(code ?? 1);
		});
	});
}

function startNextDevServer() {
	const nextDevServer = spawn(NEXT_BIN_PATH, ["dev"], {
		cwd: process.cwd(),
		env: process.env,
		stdio: "inherit",
	});

	const forwardSignal = (signal) => {
		if (!nextDevServer.killed) {
			nextDevServer.kill(signal);
		}
	};

	process.on("SIGINT", () => forwardSignal("SIGINT"));
	process.on("SIGTERM", () => forwardSignal("SIGTERM"));

	nextDevServer.on("exit", (code, signal) => {
		if (signal) {
			process.exit(1);
		}

		process.exit(code ?? 1);
	});
}

try {
	await waitForHostedConvexDevContext();
	const doctorExitCode = await runStartupAuthDoctor();
	if (doctorExitCode !== 0) {
		process.exit(doctorExitCode);
	}

	startNextDevServer();
} catch (error) {
	console.error(
		error instanceof Error
			? error.message
			: "Failed to verify Clerk + Convex dev auth alignment.",
	);
	process.exit(1);
}
