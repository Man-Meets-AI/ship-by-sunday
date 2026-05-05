import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
	createCodexHome,
	createFakeRunnerBin,
	initializeGitRepository,
} from "./test-utils";

const packageRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const builtCliPath = path.join(packageRoot, "dist", "cli.js");
if (!existsSync(builtCliPath)) {
	throw new Error("dist/cli.js is missing. Run bun run build first.");
}

const runnerHome = await mkdtemp(path.join(os.tmpdir(), "sbs-smoke-home-"));
const codexHome = await createCodexHome();
const { binDirectory } = await createFakeRunnerBin();
const packagePackDirectory = await mkdtemp(
	path.join(os.tmpdir(), "sbs-smoke-pack-"),
);
let deliveredEvents = 0;
let pairRequestCount = 0;

const server = createServer(async (request, response) => {
	if (
		request.url === "/api/workspace/runner/pair" &&
		request.method === "POST"
	) {
		await readRequestBody(request);
		pairRequestCount += 1;
		response.writeHead(200, { "Content-Type": "application/json" });
		response.end(
			JSON.stringify({
				projectId: `workspaceProjects_smoke_${pairRequestCount}`,
				runnerId: `workspaceRunnerBindings_smoke_${pairRequestCount}`,
				runnerMode: "daemon",
				pairingStatus: "paired",
				runnerToken: `sbs_run_smoke_${pairRequestCount}`,
				eventEndpoint: "/api/workspace/runner/events",
			}),
		);
		return;
	}

	if (
		request.url === "/api/workspace/runner/events" &&
		request.method === "POST"
	) {
		if (!request.headers.authorization?.startsWith("Bearer sbs_run_smoke_")) {
			response.writeHead(401);
			response.end();
			return;
		}
		deliveredEvents += 1;
		await readRequestBody(request);
		response.writeHead(200, { "Content-Type": "application/json" });
		response.end(JSON.stringify({ inserted: true }));
		return;
	}

	response.writeHead(404);
	response.end();
});

await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") {
	throw new Error("Smoke server did not expose a TCP port.");
}

try {
	const apiBaseUrl = `http://127.0.0.1:${address.port}`;
	const packagePackResult = await runProcess(
		"bun",
		[
			"pm",
			"pack",
			"--destination",
			packagePackDirectory,
			"--ignore-scripts",
			"--quiet",
		],
		{ cwd: packageRoot },
	);
	if (packagePackResult.exitCode !== 0) {
		throw new Error(
			`package pack failed with ${packagePackResult.exitCode}\nSTDOUT:\n${packagePackResult.stdout}\nSTDERR:\n${packagePackResult.stderr}`,
		);
	}
	const packageTarballPath = readPackedTarballPath(packagePackResult.stdout);
	const bunxRepositoryRoot = await createSmokeRepository(
		"sbs-bunx-smoke-repo-",
	);
	const npxRepositoryRoot = await createSmokeRepository("sbs-npx-smoke-repo-");

	await runSmokePairCommand({
		commandName: "bunx",
		command: "bunx",
		args: [
			"--bun",
			"--package",
			packageTarballPath,
			"ship-by-sunday",
			"setup",
			"pair",
			"sbs_pair_bunx_smoke",
			"--repo",
			bunxRepositoryRoot,
			"--api-url",
			apiBaseUrl,
			"--json",
		],
		repositoryRoot: bunxRepositoryRoot,
	});
	await runSmokePairCommand({
		commandName: "npx",
		command: "npx",
		args: [
			"--yes",
			"--package",
			packageTarballPath,
			"ship-by-sunday",
			"setup",
			"pair",
			"sbs_pair_npx_smoke",
			"--repo",
			npxRepositoryRoot,
			"--api-url",
			apiBaseUrl,
			"--json",
		],
		repositoryRoot: npxRepositoryRoot,
	});
	if (!existsSync(path.join(runnerHome, "credentials.json"))) {
		throw new Error("package smoke did not write runner credentials");
	}
	if (deliveredEvents === 0) {
		throw new Error("package smoke did not deliver any runner events");
	}
	console.log("package smoke passed");
} finally {
	await new Promise<void>((resolve) => server.close(() => resolve()));
}

async function createSmokeRepository(prefix: string) {
	const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), prefix));
	await initializeGitRepository(repositoryRoot);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		'{"name":"smoke"}\n',
	);
	return repositoryRoot;
}

async function runSmokePairCommand({
	commandName,
	command,
	args,
	repositoryRoot,
}: {
	commandName: string;
	command: string;
	args: string[];
	repositoryRoot: string;
}) {
	const result = await runProcess(command, args);
	if (result.exitCode !== 0) {
		throw new Error(
			`${commandName} package smoke failed with ${result.exitCode}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
		);
	}
	if (!existsSync(path.join(repositoryRoot, ".sbs", "config.json"))) {
		throw new Error(
			`${commandName} package smoke did not write .sbs/config.json`,
		);
	}
}

async function runProcess(
	command: string,
	args: string[],
	options: { cwd?: string } = {},
) {
	const child = spawn(command, args, {
		cwd: options.cwd,
		env: {
			...process.env,
			PATH: `${binDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
			CODEX_HOME: codexHome,
			SBS_RUNNER_HOME: runnerHome,
		},
	});
	let stdout = "";
	let stderr = "";
	child.stdout.on("data", (chunk: Buffer) => {
		stdout += chunk.toString("utf8");
	});
	child.stderr.on("data", (chunk: Buffer) => {
		stderr += chunk.toString("utf8");
	});
	let timedOut = false;
	const timeout = setTimeout(() => {
		timedOut = true;
		child.kill("SIGTERM");
	}, 60_000);
	const exitCode = await new Promise<number | null>((resolve, reject) => {
		child.once("error", reject);
		child.once("close", resolve);
	}).finally(() => clearTimeout(timeout));
	if (timedOut) {
		throw new Error(
			`${command} ${args.join(" ")} timed out\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
		);
	}
	return { exitCode, stdout, stderr };
}

function readPackedTarballPath(stdout: string) {
	const tarballPath = stdout
		.split(/\r?\n/)
		.map((line) => line.trim())
		.find((line) => line.endsWith(".tgz"));
	if (!tarballPath || !existsSync(tarballPath)) {
		throw new Error(`Packed tarball was not created.\nSTDOUT:\n${stdout}`);
	}
	return tarballPath;
}

async function readRequestBody(request: NodeJS.ReadableStream) {
	let body = "";
	for await (const chunk of request) {
		body += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
	}
	return body;
}
