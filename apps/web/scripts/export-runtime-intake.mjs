import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { buildRuntimeIntakeExport } from "../lib/observability/runtime-intake.mjs";
import { loadReleaseEnv } from "../../../scripts/release/lib/release-env.mjs";

const APPS_WEB_DIRECTORY = fileURLToPath(new URL("..", import.meta.url));
const requireFromAppsWeb = createRequire(
	new URL("../package.json", import.meta.url),
);
const convexManifestPath = requireFromAppsWeb.resolve("convex/package.json");
const CONVEX_BIN_PATH = path.join(
	path.dirname(convexManifestPath),
	"bin/main.js",
);
const LOCALHOST_HOSTS = new Set(["127.0.0.1", "0.0.0.0", "localhost"]);

function parseArgs(argv) {
	const options = {
		generatedAt: null,
		outputPath: null,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const current = argv[index];

		if (current?.startsWith("--output=")) {
			options.outputPath = current.slice("--output=".length);
			continue;
		}

		if (current === "--output") {
			options.outputPath = argv[index + 1] ?? null;
			index += 1;
		}

		if (current?.startsWith("--generated-at=")) {
			options.generatedAt = current.slice("--generated-at=".length);
			continue;
		}

		if (current === "--generated-at") {
			options.generatedAt = argv[index + 1] ?? null;
			index += 1;
		}
	}

	return options;
}

function spawnCommand(command, args, options) {
	return new Promise((resolve) => {
		const child = spawn(command, args, {
			...options,
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

		child.on("close", (code) => {
			resolve({
				code: code ?? 1,
				stdout: stdout.trim(),
				stderr: stderr.trim(),
			});
		});
	});
}

function getHostedConvexRuntimeExportContext(env) {
	const convexUrl = env.NEXT_PUBLIC_CONVEX_URL?.trim();
	if (!convexUrl) {
		throw new Error(
			"Missing NEXT_PUBLIC_CONVEX_URL in the active env file. Run `bun run dev:convex` or set QA_ENV_FILE before exporting runtime intake.",
		);
	}

	const hostname = new URL(convexUrl).hostname;
	if (LOCALHOST_HOSTS.has(hostname)) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_URL must point to a hosted Convex deployment, not localhost, before runtime intake export can run.",
		);
	}

	const deploymentName = env.CONVEX_DEPLOYMENT?.trim();
	if (!deploymentName) {
		throw new Error(
			"Missing CONVEX_DEPLOYMENT in the active env file. Run `bun run dev:convex` or set QA_ENV_FILE before exporting runtime intake.",
		);
	}

	return {
		convexUrl,
		deploymentName,
	};
}

async function queryRuntimeIncidents({ env, runCommand = spawnCommand }) {
	const incidents = [];
	let cursor = null;
	let isDone = false;

	while (!isDone) {
		const result = await runCommand(
			process.execPath,
			[
				CONVEX_BIN_PATH,
				"run",
				"observability:listIncidentsForEngineeringIntake",
				JSON.stringify({
					paginationOpts: {
						cursor,
						numItems: 15,
					},
				}),
			],
			{
				cwd: APPS_WEB_DIRECTORY,
				env,
			},
		);

		if (result.code !== 0) {
			throw new Error(
				result.stderr ||
					result.stdout ||
					"Convex runtime incident query failed.",
			);
		}

		const pageResult =
			result.stdout.length === 0
				? { isDone: true, page: [] }
				: JSON.parse(result.stdout);
		incidents.push(...pageResult.page);
		cursor = pageResult.continueCursor ?? null;
		isDone = pageResult.isDone === true;
	}

	return incidents;
}

async function writeOutputFile(
	outputPath,
	document,
	writeFileImpl = writeFile,
) {
	const resolvedOutputPath = path.isAbsolute(outputPath)
		? outputPath
		: path.resolve(process.cwd(), outputPath);
	await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
	await writeFileImpl(
		resolvedOutputPath,
		`${JSON.stringify(document, null, 2)}\n`,
		"utf8",
	);
	return resolvedOutputPath;
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	loadQaEnvImpl = loadReleaseEnv,
	queryRuntimeIncidentsImpl = queryRuntimeIncidents,
	writeFileImpl = writeFile,
} = {}) {
	const { generatedAt, outputPath } = parseArgs(args);
	await loadQaEnvImpl();
	const convexContext = getHostedConvexRuntimeExportContext(env);
	const incidents = await queryRuntimeIncidentsImpl({
		env,
	});
	const document = buildRuntimeIntakeExport({
		generatedAt: generatedAt ?? new Date().toISOString(),
		incidents,
	});

	let resolvedOutputPath = null;
	if (outputPath) {
		resolvedOutputPath = await writeOutputFile(
			outputPath,
			document,
			writeFileImpl,
		);
	}

	return {
		convexDeployment: convexContext.deploymentName,
		document,
		outputPath: resolvedOutputPath,
	};
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	try {
		const { document } = await runCli();
		process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
	} catch (error) {
		console.error(
			error instanceof Error ? error.message : "Runtime export failed.",
		);
		process.exitCode = 1;
	}
}
