import { spawn } from "node:child_process";

import { buildBillingIntegrationSteps } from "./lib/billing-integration-step-planner.mjs";
import { loadQaEnv } from "./lib/qa-env.mjs";

const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);

const packDefinitions = {
	default_ship: {
		requiresBillingApproval: false,
		note: null,
		steps: ({
			slug,
			personaPrepareEnv,
			authenticatedBrowserEnv,
			browserSmokeCommand,
			browserSmokeEnv,
			authenticatedDefaultShipCommand,
		}) => [
			{
				label: "Validate the QA control plane",
				command: ["bun", "run", "qa:validate"],
			},
			{
				label: "Prepare default-ship personas",
				command: [
					"bun",
					"run",
					"qa:personas:prepare",
					"--",
					"--pack=default_ship",
				],
				env: personaPrepareEnv,
			},
			{
				label: "Scaffold the default-ship report",
				command: [
					"bun",
					"run",
					"qa:ship",
					"--",
					"--pack=default_ship",
					`--slug=${slug}`,
				],
			},
			{
				label: "Run browser smoke",
				command: browserSmokeCommand,
				env: browserSmokeEnv,
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
				label: "Run the default-ship sandbox browser pack",
				command: authenticatedDefaultShipCommand,
				env: authenticatedBrowserEnv,
				requireBrowserEvidence: true,
			},
		],
	},
	extended: {
		requiresBillingApproval: false,
		note: "The extended pack does not have a dedicated browser lane yet. Use the scenario mapper plus gap reviewer to choose the relevant additional automated or manual checks.",
		steps: ({ slug }) => [
			{
				label: "Validate the QA control plane",
				command: ["bun", "run", "qa:validate"],
			},
			{
				label: "Scaffold the extended-pack report",
				command: [
					"bun",
					"run",
					"qa:ship",
					"--",
					"--pack=extended",
					`--slug=${slug}`,
				],
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
				slug: options.slug,
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

function getPackDefinition(pack, { dryRun }) {
	const definition = packDefinitions[pack];
	if (!definition) {
		throw new Error(
			`Unknown QA pack: ${pack}. Expected one of ${Object.keys(packDefinitions).join(", ")}.`,
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
	await loadQaEnv();

	const options = parseArgs(process.argv.slice(2));
	const pack = options.pack ?? "default_ship";
	const slug = options.slug ?? `${pack}-run`;
	const dryRun = options["dry-run"] === "1";
	const definition = getPackDefinition(pack, { dryRun });
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
	const browserSmokeCommand = usesLocalServer
		? ["bun", "run", "test:browser-smoke"]
		: ["bun", "run", "--cwd", "apps/web", "test:browser-smoke:hosted"];
	const browserSmokeEnv = usesLocalServer
		? { E2E_RUN_SANDBOX: "0" }
		: {
				E2E_RUN_SANDBOX: "0",
				PLAYWRIGHT_USE_LOCAL_SERVER: "0",
				PLAYWRIGHT_BASE_URL: sandboxBaseUrl,
			};
	const authenticatedDefaultShipCommand = useLocalAuthenticatedLane
		? ["bun", "run", "--cwd", "apps/web", "test:e2e:local-auth:default-ship"]
		: ["bun", "run", "--cwd", "apps/web", "test:e2e:sandbox:default-ship"];
	const isLocalBillingTarget = isLocalTarget(sandboxBaseUrl);
	const results = [];

	for (const step of definition.steps({
		slug,
		personaPrepareEnv,
		authenticatedBrowserEnv,
		browserSmokeCommand,
		browserSmokeEnv,
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
				pack,
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
						: "Unknown qa:run-pack failure.",
			},
			null,
			2,
		),
	);
	process.exitCode = 1;
}
