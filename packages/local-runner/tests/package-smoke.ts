import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, mkdtemp, writeFile } from "node:fs/promises";
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
	throw new Error("dist/cli.js is missing. Run npm run build first.");
}

const runnerHome = await mkdtemp(path.join(os.tmpdir(), "sbs-smoke-home-"));
const codexHome = await createCodexHome();
const { binDirectory } = await createFakeRunnerBin();
const packageManagerBinDirectory = await createPackageManagerBinDirectory();
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
		"npm",
		[
			"pack",
			"--pack-destination",
			packagePackDirectory,
			"--ignore-scripts",
			"--silent",
		],
		{ cwd: packageRoot },
	);
	if (packagePackResult.exitCode !== 0) {
		throw new Error(
			`package pack failed with ${packagePackResult.exitCode}\nSTDOUT:\n${packagePackResult.stdout}\nSTDERR:\n${packagePackResult.stderr}`,
		);
	}
	const packageTarballPath = readPackedTarballPath(packagePackResult.stdout);
	await assertPackedTarballContents(packageTarballPath);
	const npxRepositoryRoot = await createSmokeRepository("sbs-npx-smoke-repo-");
	const docsCommandRepositoryRoot = await createDocsCommandRepository();
	const installCommandRepositoryRoot =
		await createWorkerInstallSmokeRepository();
	const installCommandWorkerHome = await createWorkerInstallWorkerHome();
	const builtInstallRepositoryRoot = await createWorkerInstallSmokeRepository(
		"sbs-built-install-smoke-repo-",
	);
	const builtPackageManagerRepositoryRoot =
		await createPackageManagerSmokeRepository();
	const builtInstallWorkerHome = await createWorkerInstallWorkerHome();

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
	await runInstalledDocsCommandSmoke({
		packageTarballPath,
		repositoryRoot: docsCommandRepositoryRoot,
	});
	await runPackedWorkerInstallCommandSmoke({
		packageTarballPath,
		repositoryRoot: installCommandRepositoryRoot,
		workerHome: installCommandWorkerHome,
	});
	await runBuiltWorkerInstallCommandSmoke({
		installRepositoryRoot: builtInstallRepositoryRoot,
		packageManagerRepositoryRoot: builtPackageManagerRepositoryRoot,
		workerHome: builtInstallWorkerHome,
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

async function createWorkerInstallSmokeRepository(
	prefix = "sbs-install-command-smoke-repo-",
) {
	const repositoryRoot = await createSmokeRepository(prefix);
	await runRequiredProcess("git", ["add", "package.json"], {
		cwd: repositoryRoot,
		label: "install smoke git add",
	});
	await runRequiredProcess("git", ["commit", "-m", "smoke fixture"], {
		cwd: repositoryRoot,
		label: "install smoke git commit",
	});
	return repositoryRoot;
}

async function createPackageManagerSmokeRepository() {
	const repositoryRoot = await mkdtemp(
		path.join(os.tmpdir(), "sbs-package-manager-pnpm-smoke-repo-"),
	);
	await initializeGitRepository(repositoryRoot);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(
			{
				name: "package-manager-pnpm-smoke",
				packageManager: "pnpm@9.12.0",
				private: true,
			},
			null,
			"\t",
		)}\n`,
	);
	await runRequiredProcess("git", ["add", "package.json"], {
		cwd: repositoryRoot,
		label: "package-manager smoke git add",
	});
	await runRequiredProcess("git", ["commit", "-m", "smoke fixture"], {
		cwd: repositoryRoot,
		label: "package-manager smoke git commit",
	});
	return repositoryRoot;
}

async function createWorkerInstallWorkerHome() {
	const workerHome = await mkdtemp(
		path.join(os.tmpdir(), "sbs-install-smoke-worker-home-"),
	);
	await writeFile(
		path.join(workerHome, "license.json"),
		`${JSON.stringify(
			{
				expires_at: "2999-01-01T00:00:00.000Z",
				issued_at: "2026-05-08T00:00:00.000Z",
				licenseSignature:
					"xyZ_Fw-aFmRO1PY4EQvEvCAR-GOwAP0Ekw5oFeN65uXb0WC_HUz99X1u0FtNgVFD2lA0RXEXq4l7XkiRRUGDBw",
				machineCredential: "sbs_machine_test_credential",
				machineId: "machine_test",
				schemaVersion: "shipbysunday-worker-license.v1",
				status: "active",
			},
			null,
			"\t",
		)}\n`,
	);
	return workerHome;
}

async function createDocsCommandRepository() {
	const repositoryRoot = await mkdtemp(
		path.join(os.tmpdir(), "sbs-docs-command-smoke-repo-"),
	);
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		'{"name":"docs-command-smoke","private":true}\n',
	);
	await mkdir(path.join(repositoryRoot, "docs"), { recursive: true });
	await writeFile(
		path.join(repositoryRoot, "docs", "index.md"),
		[
			"---",
			"title: Docs Index",
			"summary: First-hop map for package distribution smoke proof.",
			"docType: readme",
			"status: active",
			"read_when:",
			"  - Verifying package-distributed docs tooling.",
			"---",
			"",
			"# Docs Index",
			"",
			"This file proves the packed CLI can run docs operating-system commands.",
			"",
		].join("\n"),
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
			`${commandName} package smoke did not write .sbs/config.json\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
		);
	}
}

async function runInstalledDocsCommandSmoke({
	packageTarballPath,
	repositoryRoot,
}: {
	packageTarballPath: string;
	repositoryRoot: string;
}) {
	const installResult = await runProcess(
		"npm",
		[
			"install",
			"--ignore-scripts",
			"--audit=false",
			"--fund=false",
			"--save-dev",
			packageTarballPath,
		],
		{ cwd: repositoryRoot },
	);
	if (installResult.exitCode !== 0) {
		throw new Error(
			`installed package smoke dependency install failed with ${installResult.exitCode}\nSTDOUT:\n${installResult.stdout}\nSTDERR:\n${installResult.stderr}`,
		);
	}

	const docsCommandResult = await runProcess(
		"npm",
		[
			"exec",
			"--",
			"ship-by-sunday",
			"docs-operating-system",
			"markdown-lint",
			"--repo",
			repositoryRoot,
			"--paths",
			"docs/index.md",
		],
		{ cwd: repositoryRoot },
	);
	if (docsCommandResult.exitCode !== 0) {
		throw new Error(
			`installed package docs command smoke failed with ${docsCommandResult.exitCode}\nSTDOUT:\n${docsCommandResult.stdout}\nSTDERR:\n${docsCommandResult.stderr}`,
		);
	}
	if (!docsCommandResult.stdout.includes("docs/index.md: ok")) {
		throw new Error(
			`installed package docs command smoke did not lint docs/index.md\nSTDOUT:\n${docsCommandResult.stdout}\nSTDERR:\n${docsCommandResult.stderr}`,
		);
	}
}

async function runPackedWorkerInstallCommandSmoke({
	packageTarballPath,
	repositoryRoot,
	workerHome,
}: {
	packageTarballPath: string;
	repositoryRoot: string;
	workerHome: string;
}) {
	const installCommandResult = await runProcess(
		"npx",
		[
			"--yes",
			"--package",
			packageTarballPath,
			"shipbysunday",
			"install",
			"--repo",
			repositoryRoot,
			"--dry-run",
			"--json",
			"--no-kickoff",
		],
		{
			env: {
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			},
		},
	);
	if (installCommandResult.exitCode !== 0) {
		throw new Error(
			`packed package install command smoke failed with ${installCommandResult.exitCode}\nSTDOUT:\n${installCommandResult.stdout}\nSTDERR:\n${installCommandResult.stderr}`,
		);
	}
	const parsed = JSON.parse(installCommandResult.stdout) as {
		outcome?: string;
		workflowId?: string;
	};
	if (
		parsed.outcome !== "ready" ||
		parsed.workflowId !== "worker-foundations-install"
	) {
		throw new Error(
			`packed package install command smoke returned an unexpected result\nSTDOUT:\n${installCommandResult.stdout}\nSTDERR:\n${installCommandResult.stderr}`,
		);
	}
	if (existsSync(path.join(repositoryRoot, "apps", "worker"))) {
		throw new Error("packed package install dry-run wrote apps/worker");
	}

	const mutatingInstallResult = await runProcess(
		"npx",
		[
			"--yes",
			"--package",
			packageTarballPath,
			"shipbysunday",
			"install",
			"--repo",
			repositoryRoot,
			"--yes",
			"--json",
			"--no-kickoff",
		],
		{
			env: {
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			},
		},
	);
	if (mutatingInstallResult.exitCode !== 0) {
		throw new Error(
			`packed package mutating install smoke failed with ${mutatingInstallResult.exitCode}\nSTDOUT:\n${mutatingInstallResult.stdout}\nSTDERR:\n${mutatingInstallResult.stderr}`,
		);
	}
	const mutatingInstall = JSON.parse(mutatingInstallResult.stdout) as {
		outcome?: string;
		workflowId?: string;
	};
	if (
		mutatingInstall.outcome !== "installed" ||
		mutatingInstall.workflowId !== "worker-foundations-install"
	) {
		throw new Error(
			`packed package mutating install smoke returned an unexpected result\nSTDOUT:\n${mutatingInstallResult.stdout}\nSTDERR:\n${mutatingInstallResult.stderr}`,
		);
	}
	if (
		!existsSync(
			path.join(repositoryRoot, "docs", "worker", "install-report.md"),
		)
	) {
		throw new Error(
			"packed package mutating install did not write install report",
		);
	}
	const installStatus = await runProcess("git", ["status", "--short"], {
		cwd: repositoryRoot,
	});
	if (installStatus.exitCode !== 0 || installStatus.stdout.trim() !== "") {
		throw new Error(
			`packed package mutating install left dirty worktree\nSTDOUT:\n${installStatus.stdout}\nSTDERR:\n${installStatus.stderr}`,
		);
	}
}

async function runBuiltWorkerInstallCommandSmoke({
	installRepositoryRoot,
	packageManagerRepositoryRoot,
	workerHome,
}: {
	installRepositoryRoot: string;
	packageManagerRepositoryRoot: string;
	workerHome: string;
}) {
	const builtInstallResult = await runProcess(
		"node",
		[
			builtCliPath,
			"install",
			"--repo",
			installRepositoryRoot,
			"--yes",
			"--json",
			"--no-kickoff",
		],
		{
			env: {
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			},
		},
	);
	if (builtInstallResult.exitCode !== 0) {
		throw new Error(
			`built Node install smoke failed with ${builtInstallResult.exitCode}\nSTDOUT:\n${builtInstallResult.stdout}\nSTDERR:\n${builtInstallResult.stderr}`,
		);
	}
	const builtInstall = JSON.parse(builtInstallResult.stdout) as {
		outcome?: string;
		workflowId?: string;
	};
	if (
		builtInstall.outcome !== "installed" ||
		builtInstall.workflowId !== "worker-foundations-install"
	) {
		throw new Error(
			`built Node install smoke returned an unexpected result\nSTDOUT:\n${builtInstallResult.stdout}\nSTDERR:\n${builtInstallResult.stderr}`,
		);
	}
	if (
		!existsSync(
			path.join(installRepositoryRoot, "docs", "worker", "install-report.md"),
		)
	) {
		throw new Error("built Node install smoke did not write install report");
	}
	const installStatus = await runProcess("git", ["status", "--short"], {
		cwd: installRepositoryRoot,
	});
	if (installStatus.exitCode !== 0 || installStatus.stdout.trim() !== "") {
		throw new Error(
			`built Node install smoke left dirty worktree\nSTDOUT:\n${installStatus.stdout}\nSTDERR:\n${installStatus.stderr}`,
		);
	}

	const builtDryRunResult = await runProcess(
		"node",
		[
			builtCliPath,
			"install",
			"--repo",
			packageManagerRepositoryRoot,
			"--dry-run",
			"--json",
			"--no-kickoff",
		],
		{
			env: {
				PATH: packageManagerSmokePath(),
				SHIPBYSUNDAY_WORKER_HOME: workerHome,
			},
		},
	);
	if (builtDryRunResult.exitCode !== 0) {
		throw new Error(
			`built Node package-manager dry-run smoke failed with ${builtDryRunResult.exitCode}\nSTDOUT:\n${builtDryRunResult.stdout}\nSTDERR:\n${builtDryRunResult.stderr}`,
		);
	}
	const builtDryRun = JSON.parse(builtDryRunResult.stdout) as {
		outcome?: string;
		plan?: { packageManager?: string };
	};
	if (
		builtDryRun.outcome !== "ready" ||
		builtDryRun.plan?.packageManager !== "pnpm"
	) {
		throw new Error(
			`built Node package-manager dry-run smoke returned an unexpected result\nSTDOUT:\n${builtDryRunResult.stdout}\nSTDERR:\n${builtDryRunResult.stderr}`,
		);
	}
	if (existsSync(path.join(packageManagerRepositoryRoot, "apps", "worker"))) {
		throw new Error("built Node package-manager dry-run wrote apps/worker");
	}
}

async function assertPackedTarballContents(packageTarballPath: string) {
	const listResult = await runProcess("tar", ["-tf", packageTarballPath]);
	if (listResult.exitCode !== 0) {
		throw new Error(
			`package tarball listing failed with ${listResult.exitCode}\nSTDOUT:\n${listResult.stdout}\nSTDERR:\n${listResult.stderr}`,
		);
	}
	const entries = listResult.stdout
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const requiredEntries = ["package/package.json", "package/dist/cli.js"];
	for (const requiredEntry of requiredEntries) {
		if (!entries.includes(requiredEntry)) {
			throw new Error(
				`package tarball is missing ${requiredEntry}\nEntries:\n${entries.join("\n")}`,
			);
		}
	}
	const forbiddenPrefixes = [
		"package/src/",
		"package/tests/",
		"package/node_modules/",
	];
	for (const forbiddenPrefix of forbiddenPrefixes) {
		if (entries.some((entry) => entry.startsWith(forbiddenPrefix))) {
			throw new Error(
				`package tarball included forbidden ${forbiddenPrefix} entries\nEntries:\n${entries.join("\n")}`,
			);
		}
	}
}

async function createPackageManagerBinDirectory() {
	const binDirectory = await mkdtemp(
		path.join(os.tmpdir(), "sbs-smoke-package-managers-"),
	);
	await writePnpmVersionShim(binDirectory);
	return binDirectory;
}

async function writePnpmVersionShim(binDirectory: string) {
	const pnpmPath = path.join(binDirectory, "pnpm");
	await writeFile(
		pnpmPath,
		[
			"#!/bin/sh",
			'if [ "${1:-}" = "--version" ]; then',
			"  echo 9.12.0",
			"  exit 0",
			"fi",
			'echo "fake pnpm only supports --version" >&2',
			"exit 1",
			"",
		].join("\n"),
	);
	await chmod(pnpmPath, 0o755);
}

function packageManagerSmokePath() {
	return [
		packageManagerBinDirectory,
		binDirectory,
		process.env.PATH ?? "",
	].join(path.delimiter);
}

async function runProcess(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) {
	const child = spawn(command, args, {
		cwd: options.cwd,
		env: {
			...process.env,
			PATH: `${binDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
			CODEX_HOME: codexHome,
			SBS_RUNNER_HOME: runnerHome,
			...options.env,
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

async function runRequiredProcess(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv; label: string },
) {
	const result = await runProcess(command, args, options);
	if (result.exitCode !== 0) {
		throw new Error(
			`${options.label} failed with ${result.exitCode}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`,
		);
	}
}

function readPackedTarballPath(stdout: string) {
	const tarballPathText = stdout
		.split(/\r?\n/)
		.map((line) => line.trim())
		.find((line) => line.endsWith(".tgz"));
	const tarballPath =
		tarballPathText && path.isAbsolute(tarballPathText)
			? tarballPathText
			: tarballPathText
				? path.join(packagePackDirectory, tarballPathText)
				: null;
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
