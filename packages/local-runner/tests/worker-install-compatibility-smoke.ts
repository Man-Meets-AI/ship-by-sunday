import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import {
	chmod,
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	realpath,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runInstallCommand } from "../src/commands/install";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

type PackageManager = "bun" | "npm" | "pnpm";

type WorkerInstallBlocker = {
	blockerId?: string;
	reason?: string;
	targetRef?: string;
};

type WorkerProofStatus = {
	command?: string;
	status?: string;
};

type WorkerInstallJsonOutput = {
	kickoff?: { status?: string };
	outcome?: string;
	plan?: {
		blockers?: WorkerInstallBlocker[];
		packageManager?: PackageManager;
	};
	proof?: WorkerProofStatus[];
	workflowId?: string;
};

type InstallExpectation =
	| {
			expectedPackageManager: PackageManager;
			type: "installs";
	  }
	| {
			blockerId: string;
			reasonIncludes: string;
			type: "blocks";
	  };

type CompatibilityScenario = {
	assertTargetIdentity?: (
		repositoryRoot: string,
		label: string,
	) => Promise<void>;
	description: string;
	expectation: InstallExpectation;
	name: string;
	setup: (repositoryRoot: string) => Promise<void>;
};

type RepositorySnapshot = {
	gitInfoExclude: string | null;
	gitStatus: string;
	workingFiles: Record<string, string>;
};

const workerProofScripts = [
	"programs:lint",
	"plans:lint",
	"markdown:lint",
	"docs:validate",
	"worker:test",
] as const;

const scenarios: CompatibilityScenario[] = [
	{
		name: "blank-slate",
		description:
			"Empty git repository with no package.json. This is tracked as a current product gap until blank repos default to Bun.",
		expectation: {
			blockerId: "root-package-json",
			reasonIncludes: "requires a root package.json",
			type: "blocks",
		},
		setup: async () => undefined,
	},
	{
		name: "minimal-bun-package",
		description:
			"Minimal existing JavaScript repo that already declares Bun as its package manager.",
		expectation: { expectedPackageManager: "bun", type: "installs" },
		assertTargetIdentity: async (repositoryRoot, label) => {
			const packageJson = await readPackageJson(repositoryRoot);
			assertEqual(packageJson.name, "minimal-bun-package", `${label} name`);
			assertEqual(
				packageJson.packageManager,
				"bun@1.3.5",
				`${label} packageManager`,
			);
			assertEqual(packageJson.private, true, `${label} private`);
			assertEqual(
				readPackageScript(packageJson, "dev"),
				"bun --version",
				`${label} dev script`,
			);
		},
		setup: async (repositoryRoot) => {
			await writeJson(path.join(repositoryRoot, "package.json"), {
				name: "minimal-bun-package",
				packageManager: "bun@1.3.5",
				private: true,
				scripts: {
					dev: "bun --version",
				},
			});
		},
	},
	{
		name: "next-npm-single-app",
		description:
			"Single Next.js-style app repo that uses npm and already has application scripts.",
		expectation: { expectedPackageManager: "npm", type: "installs" },
		assertTargetIdentity: async (repositoryRoot, label) => {
			const packageJson = await readPackageJson(repositoryRoot);
			assertEqual(packageJson.name, "next-npm-single-app", `${label} name`);
			assertEqual(
				packageJson.packageManager,
				"npm@10.9.0",
				`${label} packageManager`,
			);
			assertEqual(
				readPackageScript(packageJson, "build"),
				"next build",
				`${label} build script`,
			);
			assertEqual(
				readPackageScript(packageJson, "dev"),
				"next dev",
				`${label} dev script`,
			);
			assertEqual(
				readPackageScript(packageJson, "lint"),
				"next lint",
				`${label} lint script`,
			);
			const packageLock = JSON.parse(
				await readFile(path.join(repositoryRoot, "package-lock.json"), "utf8"),
			) as { lockfileVersion?: number; name?: string };
			assertEqual(
				packageLock.lockfileVersion,
				3,
				`${label} package-lock version`,
			);
			assertEqual(
				packageLock.name,
				"next-npm-single-app",
				`${label} lock name`,
			);
			const webPackageJson = await readJsonObject(
				path.join(repositoryRoot, "apps", "web", "package.json"),
			);
			assertEqual(webPackageJson.name, "@fixture/web", `${label} web name`);
			assertEqual(
				readPackageScript(webPackageJson, "dev"),
				"next dev",
				`${label} web dev script`,
			);
		},
		setup: async (repositoryRoot) => {
			await writeJson(path.join(repositoryRoot, "package.json"), {
				name: "next-npm-single-app",
				packageManager: "npm@10.9.0",
				private: true,
				scripts: {
					build: "next build",
					dev: "next dev",
					lint: "next lint",
				},
			});
			await writeJson(path.join(repositoryRoot, "package-lock.json"), {
				lockfileVersion: 3,
				name: "next-npm-single-app",
				packages: {
					"": {
						name: "next-npm-single-app",
					},
				},
			});
			await mkdir(path.join(repositoryRoot, "apps", "web"), {
				recursive: true,
			});
			await writeJson(
				path.join(repositoryRoot, "apps", "web", "package.json"),
				{
					name: "@fixture/web",
					private: true,
					scripts: {
						dev: "next dev",
					},
				},
			);
		},
	},
	{
		name: "next-pnpm-monorepo",
		description:
			"Monorepo with a single Next.js-style web app and pnpm workspace metadata.",
		expectation: { expectedPackageManager: "pnpm", type: "installs" },
		assertTargetIdentity: async (repositoryRoot, label) => {
			const packageJson = await readPackageJson(repositoryRoot);
			assertEqual(packageJson.name, "next-pnpm-monorepo", `${label} name`);
			assertEqual(
				packageJson.packageManager,
				"pnpm@9.12.0",
				`${label} packageManager`,
			);
			assertJsonEqual(
				packageJson.workspaces,
				["apps/*", "packages/*"],
				`${label} workspaces`,
			);
			assertEqual(
				readPackageScript(packageJson, "build"),
				"pnpm --filter @fixture/web build",
				`${label} build script`,
			);
			assertEqual(
				readPackageScript(packageJson, "dev"),
				"pnpm --filter @fixture/web dev",
				`${label} dev script`,
			);
			assertEqual(
				await readFile(
					path.join(repositoryRoot, "pnpm-workspace.yaml"),
					"utf8",
				),
				["packages:", '  - "apps/*"', '  - "packages/*"', ""].join("\n"),
				`${label} pnpm workspace file`,
			);
			const webPackageJson = await readJsonObject(
				path.join(repositoryRoot, "apps", "web", "package.json"),
			);
			assertEqual(webPackageJson.name, "@fixture/web", `${label} web name`);
			assertEqual(
				readPackageScript(webPackageJson, "build"),
				"next build",
				`${label} web build script`,
			);
			assertEqual(
				readPackageScript(webPackageJson, "dev"),
				"next dev",
				`${label} web dev script`,
			);
		},
		setup: async (repositoryRoot) => {
			await writeJson(path.join(repositoryRoot, "package.json"), {
				name: "next-pnpm-monorepo",
				packageManager: "pnpm@9.12.0",
				private: true,
				scripts: {
					build: "pnpm --filter @fixture/web build",
					dev: "pnpm --filter @fixture/web dev",
				},
				workspaces: ["apps/*", "packages/*"],
			});
			await writeFile(
				path.join(repositoryRoot, "pnpm-workspace.yaml"),
				["packages:", '  - "apps/*"', '  - "packages/*"', ""].join("\n"),
			);
			await writeJson(
				path.join(repositoryRoot, "apps", "web", "package.json"),
				{
					name: "@fixture/web",
					private: true,
					scripts: {
						build: "next build",
						dev: "next dev",
					},
				},
			);
		},
	},
	{
		name: "bun-different-version",
		description:
			"Bun repo whose root packageManager version is different from the Worker-managed Bun target.",
		expectation: { expectedPackageManager: "bun", type: "installs" },
		assertTargetIdentity: async (repositoryRoot, label) => {
			const packageJson = await readPackageJson(repositoryRoot);
			assertEqual(packageJson.name, "bun-different-version", `${label} name`);
			assertEqual(
				packageJson.packageManager,
				"bun@1.2.0",
				`${label} packageManager`,
			);
			assertEqual(
				readPackageScript(packageJson, "build"),
				"bun --version",
				`${label} build script`,
			);
		},
		setup: async (repositoryRoot) => {
			await writeJson(path.join(repositoryRoot, "package.json"), {
				name: "bun-different-version",
				packageManager: "bun@1.2.0",
				private: true,
				scripts: {
					build: "bun --version",
				},
			});
		},
	},
];

const selectedScenarioNames = new Set(
	process.argv
		.slice(2)
		.filter((arg) => !arg.startsWith("--"))
		.map((arg) => arg.trim())
		.filter(Boolean),
);

if (process.argv.includes("--list")) {
	for (const scenario of scenarios) {
		console.log(`${scenario.name}: ${scenario.description}`);
	}
	process.exit(0);
}

const selectedScenarios =
	selectedScenarioNames.size === 0
		? scenarios
		: scenarios.filter((scenario) => selectedScenarioNames.has(scenario.name));

const unknownScenarioNames = [...selectedScenarioNames].filter(
	(name) => !scenarios.some((scenario) => scenario.name === name),
);
if (unknownScenarioNames.length > 0) {
	throw new Error(
		`Unknown compatibility scenario: ${unknownScenarioNames.join(", ")}`,
	);
}

const packageManagerBinDirectory = await createPackageManagerBinDirectory();
const smokeEnv = {
	PATH: `${packageManagerBinDirectory}${path.delimiter}${process.env.PATH ?? ""}`,
};

for (const scenario of selectedScenarios) {
	await runCompatibilityScenario(scenario, smokeEnv);
}

if (selectedScenarioNames.size === 0) {
	await runKickoffProof(smokeEnv);
}

console.log(
	`worker install compatibility smoke passed (${selectedScenarios.length} scenarios)`,
);

async function runCompatibilityScenario(
	scenario: CompatibilityScenario,
	env: NodeJS.ProcessEnv,
) {
	const repositoryRoot = await createScenarioRepository(scenario);
	const workerHome = await createWorkerHome();

	const beforeDryRun = await readRepositorySnapshot(repositoryRoot);
	const dryRun = await runJsonInstall(
		["--repo", repositoryRoot, "--dry-run", "--json", "--no-kickoff"],
		workerHome,
		env,
	);
	await assertRepositorySnapshot(
		repositoryRoot,
		beforeDryRun,
		`${scenario.name} dry-run`,
	);

	const expectation = scenario.expectation;
	if (expectation.type === "blocks") {
		assertEqual(
			dryRun.exitCode,
			2,
			`${scenario.name} blocked dry-run exit code`,
		);
		assertEqual(
			dryRun.output.outcome,
			"blocked",
			`${scenario.name} dry-run outcome`,
		);
		const blockers = dryRun.output.plan?.blockers ?? [];
		const blocker = blockers.find(
			(candidate) => candidate.blockerId === expectation.blockerId,
		);
		if (!blocker?.reason?.includes(expectation.reasonIncludes)) {
			throw new Error(`${scenario.name} did not report expected blocker`);
		}
		assertMissing(
			path.join(repositoryRoot, "apps", "worker"),
			`${scenario.name} blocked dry-run must not write apps/worker`,
		);
		console.log(`${scenario.name}: expected blocker ok`);
		return;
	}

	assertEqual(dryRun.exitCode, 0, `${scenario.name} dry-run exit code`);
	assertEqual(
		dryRun.output.outcome,
		"ready",
		`${scenario.name} dry-run outcome`,
	);
	assertEqual(
		dryRun.output.plan?.packageManager,
		expectation.expectedPackageManager,
		`${scenario.name} detected package manager`,
	);
	assertMissing(
		path.join(repositoryRoot, "apps", "worker"),
		`${scenario.name} dry-run must not write apps/worker`,
	);

	const install = await runJsonInstall(
		["--repo", repositoryRoot, "--yes", "--json", "--no-kickoff"],
		workerHome,
		env,
	);
	assertEqual(install.exitCode, 0, `${scenario.name} install exit code`);
	assertEqual(
		install.output.outcome,
		"installed",
		`${scenario.name} install outcome`,
	);
	assertProofCommandsPassed(
		install.output.proof,
		expectation.expectedPackageManager,
		`${scenario.name} install result`,
	);

	await assertInstalledRepository({
		env,
		expectedPackageManager: expectation.expectedPackageManager,
		label: scenario.name,
		repositoryRoot,
	});
	if (scenario.assertTargetIdentity) {
		await scenario.assertTargetIdentity(repositoryRoot, scenario.name);
	}

	const cloneRoot = await cloneRepository(repositoryRoot, scenario.name);
	await assertInstalledRepository({
		env,
		expectedPackageManager: expectation.expectedPackageManager,
		label: `${scenario.name} fresh clone`,
		repositoryRoot: cloneRoot,
	});
	if (scenario.assertTargetIdentity) {
		await scenario.assertTargetIdentity(
			cloneRoot,
			`${scenario.name} fresh clone`,
		);
	}

	console.log(`${scenario.name}: ok`);
}

async function runKickoffProof(env: NodeJS.ProcessEnv) {
	const repositoryRoot = await createScenarioRepository(
		scenarios.find((scenario) => scenario.name === "minimal-bun-package")!,
	);
	const workerHome = await createWorkerHome();
	const codexHome = await createTemporaryDirectory("worker-compat-codex-home-");
	const kickoffProbeFile = path.join(codexHome, "kickoff-probe.txt");
	const codexBinDirectory = await createSuccessfulCodexBin({
		expectedRepositoryRoot: await realpath(repositoryRoot),
		kickoffProbeFile,
	});
	const exitCode = await runInstallCommand(
		["--repo", repositoryRoot, "--yes"],
		{
			...process.env,
			...env,
			CODEX_HOME: codexHome,
			PATH: `${codexBinDirectory}${path.delimiter}${env.PATH ?? process.env.PATH ?? ""}`,
			SHIPBYSUNDAY_WORKER_HOME: workerHome,
		},
	);
	assertEqual(exitCode, 0, "fake Codex kickoff install exit code");
	const probe = await readFile(kickoffProbeFile, "utf8");
	assertEqual(probe, "present\n", "fake Codex kickoff probe");
	const installReport = await readFile(
		path.join(repositoryRoot, "docs", "worker", "install-report.md"),
		"utf8",
	);
	if (!installReport.includes("Status: `started`")) {
		throw new Error("fake Codex kickoff report did not record started status");
	}
	await assertCleanWorktree(repositoryRoot, "fake Codex kickoff");
	console.log("fake-codex-kickoff: ok");
}

async function createScenarioRepository(scenario: CompatibilityScenario) {
	const repositoryRoot = await createTemporaryDirectory(
		`sbs-worker-compat-${scenario.name}-`,
	);
	await initializeGitRepository(repositoryRoot);
	await scenario.setup(repositoryRoot);
	await runRequiredProcess("git", ["add", "."], {
		cwd: repositoryRoot,
		label: `${scenario.name} git add fixture`,
	});
	await runRequiredProcess(
		"git",
		["commit", "--allow-empty", "-m", "compatibility fixture"],
		{
			cwd: repositoryRoot,
			label: `${scenario.name} git commit fixture`,
		},
	);
	return repositoryRoot;
}

async function createWorkerHome() {
	const workerHome = await mkdtemp(
		path.join(os.tmpdir(), "sbs-worker-compat-home-"),
	);
	await writeJson(path.join(workerHome, "license.json"), {
		expires_at: "2999-01-01T00:00:00.000Z",
		issued_at: "2026-05-09T00:00:00.000Z",
		machineCredential: "sbs_machine_worker_compatibility_smoke",
		machineId: "machine_worker_compatibility_smoke",
		schemaVersion: "shipbysunday-worker-license.v1",
		status: "active",
	});
	return workerHome;
}

async function createPackageManagerBinDirectory() {
	const binDirectory = await createTemporaryDirectory("worker-compat-bin-");
	const pnpmPath = path.join(binDirectory, "pnpm");
	await writeFile(
		pnpmPath,
		["#!/bin/sh", 'exec corepack pnpm "$@"', ""].join("\n"),
	);
	await chmod(pnpmPath, 0o755);
	return binDirectory;
}

async function createSuccessfulCodexBin({
	expectedRepositoryRoot,
	kickoffProbeFile,
}: {
	expectedRepositoryRoot: string;
	kickoffProbeFile: string;
}) {
	const binDirectory = await createTemporaryDirectory(
		"worker-compat-codex-bin-",
	);
	const codexPath = path.join(binDirectory, "codex");
	const expectedPrompt = [
		"Read AGENTS.md, docs/worker/install-report.md, the active Worker Foundations Program, and the first active ExecPlan.",
		"Continue from the plan and keep all proof sync-safe.",
	].join("\n");
	await writeFile(
		codexPath,
		[
			"#!/bin/sh",
			'if [ "$1" = "--version" ]; then echo "codex 1.0.0"; exit 0; fi',
			'if [ "$1" = "login" ] && [ "$2" = "status" ]; then echo "Logged in"; exit 0; fi',
			`if [ "$PWD" != ${shellQuote(expectedRepositoryRoot)} ]; then echo "wrong cwd: $PWD" >&2; exit 1; fi`,
			'if [ "$1" != "--profile" ]; then echo "missing --profile" >&2; exit 1; fi',
			'if [ "$2" != "shipbysunday-worker-project-write" ]; then echo "wrong profile: $2" >&2; exit 1; fi',
			'if [ "$3" != "--cd" ]; then echo "missing --cd" >&2; exit 1; fi',
			`if [ "$4" != ${shellQuote(expectedRepositoryRoot)} ]; then echo "wrong --cd: $4" >&2; exit 1; fi`,
			`if [ "$5" != ${shellQuote(expectedPrompt)} ]; then echo "wrong prompt" >&2; exit 1; fi`,
			'if [ "${6:-}" != "" ]; then echo "unexpected extra args: $*" >&2; exit 1; fi',
			'if [ -f "docs/worker/install-report.md" ]; then',
			`  echo "present" > ${shellQuote(kickoffProbeFile)}`,
			"else",
			`  echo "missing" > ${shellQuote(kickoffProbeFile)}`,
			"fi",
			"exit 0",
			"",
		].join("\n"),
	);
	await chmod(codexPath, 0o755);
	return binDirectory;
}

async function runJsonInstall(
	args: string[],
	workerHome: string,
	env: NodeJS.ProcessEnv,
) {
	const logs: string[] = [];
	const originalLog = console.log;
	console.log = (...parts: unknown[]) => {
		logs.push(parts.map((part) => String(part)).join(" "));
	};
	try {
		const exitCode = await runInstallCommand(args, {
			...process.env,
			...env,
			SHIPBYSUNDAY_WORKER_HOME: workerHome,
		});
		const stdout = logs.join("\n");
		return {
			exitCode,
			output: JSON.parse(stdout) as WorkerInstallJsonOutput,
			stdout,
		};
	} finally {
		console.log = originalLog;
	}
}

async function assertInstalledRepository({
	env,
	expectedPackageManager,
	label,
	repositoryRoot,
}: {
	env: NodeJS.ProcessEnv;
	expectedPackageManager: PackageManager;
	label: string;
	repositoryRoot: string;
}) {
	assertExists(
		path.join(repositoryRoot, "apps", "worker", "src", "worker-cli.ts"),
		`${label} Worker CLI`,
	);
	assertExists(
		path.join(repositoryRoot, "docs", "worker", "install-report.md"),
		`${label} install report`,
	);
	assertExists(
		path.join(repositoryRoot, "scripts", "run-worker.sh"),
		`${label} run-worker executable`,
	);

	await runRequiredProcess("./scripts/run-worker.sh", ["docs:validate"], {
		cwd: repositoryRoot,
		env,
		label: `${label} direct Worker docs validation`,
	});
	await runRequiredProcess(expectedPackageManager, ["run", "docs:validate"], {
		cwd: repositoryRoot,
		env,
		label: `${label} root package-manager docs validation`,
	});
	await runRequiredProcess(expectedPackageManager, ["run", "worker:test"], {
		cwd: repositoryRoot,
		env,
		label: `${label} root package-manager Worker tests`,
	});

	const packageJson = JSON.parse(
		await readFile(path.join(repositoryRoot, "package.json"), "utf8"),
	) as { scripts?: Record<string, string> };
	assertEqual(
		packageJson.scripts?.["docs:validate"],
		"./scripts/run-worker.sh docs:validate",
		`${label} root docs script`,
	);
	assertEqual(
		packageJson.scripts?.["worker:test"],
		"./scripts/run-worker.sh test",
		`${label} root Worker test script`,
	);

	const report = await readFile(
		path.join(repositoryRoot, "docs", "worker", "install-report.md"),
		"utf8",
	);
	assertInstallReportProofCommandsPassed(report, expectedPackageManager, label);

	await assertCleanWorktree(repositoryRoot, label);
}

async function readRepositorySnapshot(
	repositoryRoot: string,
): Promise<RepositorySnapshot> {
	const status = await runProcess("git", ["status", "--short"], {
		cwd: repositoryRoot,
	});
	if (status.exitCode !== 0) {
		throw new Error(
			`Could not read repository status for dry-run snapshot\nSTDOUT:\n${status.stdout}\nSTDERR:\n${status.stderr}`,
		);
	}
	return {
		gitInfoExclude: await readOptionalTextFile(
			path.join(repositoryRoot, ".git", "info", "exclude"),
		),
		gitStatus: status.stdout,
		workingFiles: await readWorkingFiles(repositoryRoot, repositoryRoot),
	};
}

async function assertRepositorySnapshot(
	repositoryRoot: string,
	expectedSnapshot: RepositorySnapshot,
	label: string,
) {
	const actualSnapshot = await readRepositorySnapshot(repositoryRoot);
	assertEqual(
		actualSnapshot.gitStatus,
		expectedSnapshot.gitStatus,
		`${label} git status`,
	);
	assertEqual(
		actualSnapshot.gitInfoExclude,
		expectedSnapshot.gitInfoExclude,
		`${label} git info exclude`,
	);
	assertJsonEqual(
		actualSnapshot.workingFiles,
		expectedSnapshot.workingFiles,
		`${label} working files`,
	);
}

async function readWorkingFiles(
	repositoryRoot: string,
	currentDirectory: string,
): Promise<Record<string, string>> {
	const files: Record<string, string> = {};
	const entries = (
		await readdir(currentDirectory, { withFileTypes: true })
	).sort((left, right) => left.name.localeCompare(right.name));
	for (const entry of entries) {
		if (entry.name === ".git") {
			continue;
		}
		const absolutePath = path.join(currentDirectory, entry.name);
		const relativePath = path
			.relative(repositoryRoot, absolutePath)
			.replaceAll(path.sep, "/");
		if (entry.isDirectory()) {
			Object.assign(
				files,
				await readWorkingFiles(repositoryRoot, absolutePath),
			);
			continue;
		}
		if (entry.isFile()) {
			files[relativePath] = await readFile(absolutePath, "utf8");
		}
	}
	return files;
}

async function readOptionalTextFile(filePath: string) {
	return existsSync(filePath) ? await readFile(filePath, "utf8") : null;
}

async function readPackageJson(repositoryRoot: string) {
	return await readJsonObject(path.join(repositoryRoot, "package.json"));
}

async function readJsonObject(filePath: string) {
	return JSON.parse(await readFile(filePath, "utf8")) as Record<
		string,
		unknown
	>;
}

function readPackageScript(
	packageJson: Record<string, unknown>,
	scriptName: string,
) {
	const scripts = packageJson.scripts;
	if (
		typeof scripts !== "object" ||
		scripts === null ||
		Array.isArray(scripts)
	) {
		return undefined;
	}
	const script = (scripts as Record<string, unknown>)[scriptName];
	return typeof script === "string" ? script : undefined;
}

function assertProofCommandsPassed(
	proof: WorkerProofStatus[] | undefined,
	packageManager: PackageManager,
	label: string,
) {
	assertJsonEqual(
		proof,
		workerProofScripts.map((scriptName) => ({
			command: `${packageManager} run ${scriptName}`,
			status: "passed",
		})),
		`${label} proof commands`,
	);
}

function assertInstallReportProofCommandsPassed(
	report: string,
	packageManager: PackageManager,
	label: string,
) {
	for (const scriptName of workerProofScripts) {
		const expectedLine = `- \`${packageManager} run ${scriptName}\`: passed`;
		if (!report.includes(expectedLine)) {
			throw new Error(
				`${label} install report did not record proof line: ${expectedLine}`,
			);
		}
	}
}

async function cloneRepository(repositoryRoot: string, scenarioName: string) {
	const parentDirectory = await mkdtemp(
		path.join(os.tmpdir(), `sbs-worker-compat-${scenarioName}-clone-parent-`),
	);
	const cloneRoot = path.join(parentDirectory, "repo");
	await runRequiredProcess("git", ["clone", repositoryRoot, cloneRoot], {
		label: `${scenarioName} fresh clone`,
	});
	await runRequiredProcess(
		"git",
		["config", "user.email", "runner@example.com"],
		{
			cwd: cloneRoot,
			label: `${scenarioName} clone git email`,
		},
	);
	await runRequiredProcess("git", ["config", "user.name", "Runner Test"], {
		cwd: cloneRoot,
		label: `${scenarioName} clone git name`,
	});
	return cloneRoot;
}

async function assertCleanWorktree(repositoryRoot: string, label: string) {
	const status = await runProcess("git", ["status", "--short"], {
		cwd: repositoryRoot,
	});
	if (status.exitCode !== 0 || status.stdout.trim() !== "") {
		throw new Error(
			`${label} worktree is dirty\nSTDOUT:\n${status.stdout}\nSTDERR:\n${status.stderr}`,
		);
	}
}

async function writeJson(filePath: string, value: unknown) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, `${JSON.stringify(value, null, "\t")}\n`);
}

function assertExists(filePath: string, label: string) {
	if (!existsSync(filePath)) {
		throw new Error(`${label} is missing at ${filePath}`);
	}
}

function assertMissing(filePath: string, label: string) {
	if (existsSync(filePath)) {
		throw new Error(`${label}: unexpected path exists at ${filePath}`);
	}
}

function assertEqual<T>(actual: T, expected: T, label: string) {
	if (actual !== expected) {
		throw new Error(
			`${label}: expected ${String(expected)}, got ${String(actual)}`,
		);
	}
}

function assertJsonEqual(actual: unknown, expected: unknown, label: string) {
	const actualJson = JSON.stringify(actual);
	const expectedJson = JSON.stringify(expected);
	if (actualJson !== expectedJson) {
		throw new Error(
			`${label}: expected ${expectedJson ?? "undefined"}, got ${actualJson ?? "undefined"}`,
		);
	}
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

async function runProcess(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) {
	const child = spawn(command, args, {
		cwd: options.cwd,
		env: {
			...process.env,
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
	const exitCode = await new Promise<number | null>((resolve, reject) => {
		child.once("error", reject);
		child.once("close", resolve);
	});
	return { exitCode, stdout, stderr };
}

function shellQuote(value: string) {
	return `'${value.replaceAll("'", "'\"'\"'")}'`;
}
