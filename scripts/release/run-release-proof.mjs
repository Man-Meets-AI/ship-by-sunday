import { spawn } from "node:child_process";

import { buildBillingIntegrationSteps } from "./lib/billing-integration-step-planner.mjs";
import { loadReleaseEnv } from "./lib/release-env.mjs";

const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);

const proofDefinitions = {
	default_ship: {
		requiresBillingApproval: false,
		note: null,
		steps: ({
			authenticatedBrowserEnv,
			authenticatedDefaultShipCommand,
			personaPrepareEnv,
		}) => [
			{
				label: "Prepare default-ship release personas",
				command: [
					"bun",
					"run",
					"release:personas:prepare",
					"--",
					"--proof=default_ship",
				],
				env: personaPrepareEnv,
			},
			{
				label: "Run the blueprint integration-ui proof suite",
				command: [
					"bun",
					"run",
					"--cwd",
					"apps/web",
					"test:integration:ui",
					"--",
					"tests/integration-ui/blueprint-page.test.tsx",
					"tests/integration-ui/blueprint-review-page.test.tsx",
					"tests/integration-ui/legacy-blueprint-route-redirects.test.tsx",
				],
			},
			{
				label: "Run the default-ship authenticated browser proof",
				command: authenticatedDefaultShipCommand,
				env: authenticatedBrowserEnv,
				requireBrowserEvidence: true,
			},
		],
	},
	billing_integration: {
		requiresBillingApproval: true,
		note: null,
		steps: (options) =>
			buildBillingIntegrationSteps({
				authenticatedBrowserEnv: options.authenticatedBrowserEnv,
				isLocalBillingTarget: options.isLocalBillingTarget,
				personaPrepareEnv: options.personaPrepareEnv,
				targetUrl: options.sandboxBaseUrl,
			}),
	},
};

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = "1"] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function getProofDefinition(proof, { dryRun }) {
	const definition = proofDefinitions[proof];
	if (!definition) {
		throw new Error(
			`Unknown release proof: ${proof}. Expected one of ${Object.keys(proofDefinitions).join(", ")}.`,
		);
	}

	if (
		!dryRun &&
		definition.requiresBillingApproval &&
		process.env.QA_ALLOW_BILLING_INTEGRATION !== "1"
	) {
		throw new Error(
			"billing_integration requires QA_ALLOW_BILLING_INTEGRATION=1 so Stripe checkout is never run by accident.",
		);
	}

	return definition;
}

function isLocalTarget(urlString) {
	try {
		return LOCALHOST_HOSTS.has(new URL(urlString).hostname);
	} catch {
		return false;
	}
}

function isOnlySkippedPlaywrightRun(output) {
	return /\b\d+\s+skipped\b/.test(output) && !/\b\d+\s+passed\b/.test(output);
}

async function runStep(step, { dryRun }) {
	if (dryRun) {
		return {
			label: step.label,
			command: step.command,
			status: "planned",
			failureMode: step.warningOnFailure ? "warning" : "error",
		};
	}

	const result = await spawnCommand(
		step.command[0],
		step.command.slice(1),
		step.env,
	);
	const combinedOutput = [result.stdout, result.stderr]
		.filter(Boolean)
		.join("\n");
	if (result.code !== 0) {
		if (step.warningOnFailure) {
			return {
				label: step.label,
				command: step.command,
				status: "warning",
				warning: step.warningOnFailure,
				stdout: result.stdout,
				stderr: result.stderr,
			};
		}

		throw new Error(
			`${step.label} failed.\nCommand: ${step.command.join(" ")}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
		);
	}
	if (
		step.requireBrowserEvidence &&
		isOnlySkippedPlaywrightRun(combinedOutput)
	) {
		throw new Error(
			`${step.label} produced only skipped Playwright tests.\nCommand: ${step.command.join(" ")}\nstdout: ${result.stdout}\nstderr: ${result.stderr}\nThis is missing browser evidence, not a green pass.`,
		);
	}

	return {
		label: step.label,
		command: step.command,
		status: "completed",
	};
}

function spawnCommand(command, args, stepEnv = {}) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			env: {
				...process.env,
				...stepEnv,
			},
			stdio: ["ignore", "pipe", "pipe"],
		});
		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk) => {
			const text = String(chunk);
			stdout += text;
			process.stdout.write(text);
		});
		child.stderr.on("data", (chunk) => {
			const text = String(chunk);
			stderr += text;
			process.stderr.write(text);
		});
		child.on("close", (code) => {
			resolve({
				code: code ?? 1,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
			});
		});
	});
}

async function main() {
	await loadReleaseEnv();

	const options = parseArgs(process.argv.slice(2));
	const proof = options.proof ?? "default_ship";
	const dryRun = options["dry-run"] === "1";
	const definition = getProofDefinition(proof, { dryRun });
	const usesLocalServer =
		process.env.PLAYWRIGHT_USE_LOCAL_SERVER === "1" ||
		typeof process.env.PLAYWRIGHT_BASE_URL !== "string";
	const sandboxBaseUrl = usesLocalServer
		? (process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000")
		: process.env.PLAYWRIGHT_BASE_URL;
	const useLocalAuthenticatedLane =
		isLocalTarget(sandboxBaseUrl) && process.env.E2E_RUN_SANDBOX !== "1";
	const authenticatedBrowserEnv = {
		E2E_RUN_SANDBOX: useLocalAuthenticatedLane ? "0" : "1",
		E2E_RUN_LOCAL_AUTH: useLocalAuthenticatedLane ? "1" : "0",
		PLAYWRIGHT_USE_LOCAL_SERVER: usesLocalServer ? "1" : "0",
		PLAYWRIGHT_BASE_URL: sandboxBaseUrl,
	};
	const personaPrepareEnv = {
		PLAYWRIGHT_BASE_URL: sandboxBaseUrl,
	};
	const authenticatedDefaultShipCommand = useLocalAuthenticatedLane
		? ["bun", "run", "--cwd", "apps/web", "test:e2e:local-auth:default-ship"]
		: ["bun", "run", "--cwd", "apps/web", "test:e2e:sandbox:default-ship"];
	const isLocalBillingTarget = isLocalTarget(sandboxBaseUrl);
	const results = [];

	for (const step of definition.steps({
		personaPrepareEnv,
		authenticatedBrowserEnv,
		authenticatedDefaultShipCommand,
		isLocalBillingTarget,
		sandboxBaseUrl,
	})) {
		results.push(await runStep(step, { dryRun }));
	}

	console.log(
		JSON.stringify(
			{
				status: "ok",
				proof,
				dryRun,
				note: definition.note,
				steps: results,
			},
			null,
			2,
		),
	);
}

try {
	await main();
} catch (error) {
	console.error(
		JSON.stringify(
			{
				status: "error",
				message:
					error instanceof Error
						? error.message
						: "Unknown release proof failure.",
			},
			null,
			2,
		),
	);
	process.exitCode = 1;
}
