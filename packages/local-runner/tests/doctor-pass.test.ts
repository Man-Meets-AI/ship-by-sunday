import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runDoctorPassCommand } from "../src/commands/doctor-pass";
import { writeLocalProjectState } from "../src/core/local-project-state";
import { writeRunnerCredential } from "../src/core/local-runner-home";
import { createApprovedFindingsDigest } from "../src/core/doctor-pass/approved-findings-digest";
import { createTopNineOutputSchema } from "../src/core/doctor-pass/top-nine-schema";
import { TOP_NINE_SCHEMA_VERSION } from "../src/core/doctor-pass/types";
import { resolveRepositoryRoot } from "../src/core/repository-root";
import {
	createCodexHome,
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const packageRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const repoRoot = path.resolve(packageRoot, "..", "..");
const scannerPath = path.join(
	repoRoot,
	".sbs",
	"intake-probe",
	"codebase-intake.py",
);

describe("doctor-pass command", () => {
	const originalPath = process.env.PATH;
	const originalRunnerHome = process.env.SBS_RUNNER_HOME;
	const originalCodexHome = process.env.CODEX_HOME;

	afterEach(() => {
		process.env.PATH = originalPath;
		restoreEnv("SBS_RUNNER_HOME", originalRunnerHome);
		restoreEnv("CODEX_HOME", originalCodexHome);
	});

	it("creates a Codex structured-output schema with typed property schemas", () => {
		const schema = createTopNineOutputSchema();
		expect(schema.properties.schemaVersion).toEqual({
			type: "string",
			const: TOP_NINE_SCHEMA_VERSION,
		});
		assertCodexStructuredOutputSchema(schema);
		assertNoBareConstPropertySchema(schema);
	});

	it("canonicalizes approved findings digests across key order and optional fields", () => {
		const finding = createDigestFinding();
		const reorderedFinding = {
			localReportRef:
				".sbs/reports/doctor-pass/run-digest/source-truth-agent-readiness.json",
			syncSensitivity: "low" as const,
			blockedReason: undefined,
			evidenceRefs: [
				{
					summary: "Repo instructions exist.",
					kind: "file" as const,
					repoRelativePath: "AGENTS.md",
				},
				{
					summary: "Test script exists.",
					commandName: "npm run test",
					kind: "command" as const,
				},
			],
			whyThisNow: "It improves every later workflow handoff.",
			recommendedWorkflowId: "source-truth-agent-readiness",
			permissionRequired: "docs_write" as const,
			proofability: "clear" as const,
			proofPath: "Review AGENTS.md and package scripts.",
			blastRadius: "low" as const,
			buyerImpact:
				"The repo has instructions and proof scripts that can anchor later workflows.",
			confidence: 0.9,
			severity: "high" as const,
			category: "source_truth" as const,
			title: "Source truth readiness",
			status: "ready" as const,
			rank: 1,
			findingId: "finding-source-truth-readiness",
		};

		const originalDigest = createApprovedFindingsDigest({
			runId: "run-digest",
			doctorPassRunId: "doctor-run-digest",
			findings: [finding],
		});
		const reorderedDigest = createApprovedFindingsDigest({
			runId: "run-digest",
			doctorPassRunId: "doctor-run-digest",
			findings: [reorderedFinding],
		});
		const undefinedOptionalDigest = createApprovedFindingsDigest({
			runId: "run-digest",
			doctorPassRunId: "doctor-run-digest",
			findings: [{ ...finding, blockedReason: undefined }],
		});

		expect(reorderedDigest).toBe(originalDigest);
		expect(undefinedOptionalDigest).toBe(originalDigest);
	});

	it("writes local artifacts, emits sync preview events, and uploads after approval", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-doctor-pass-");
		const runnerHome = await createTemporaryDirectory("sbs-doctor-home-");
		const codexHome = await createCodexHome();
		const fakeBinDirectory = await createDoctorPassFakeBin();
		process.env.PATH = `${fakeBinDirectory}${path.delimiter}${originalPath}`;
		process.env.SBS_RUNNER_HOME = runnerHome;
		process.env.CODEX_HOME = codexHome;

		await initializeGitRepository(repositoryRoot);
		const resolvedRepositoryRoot = (
			await resolveRepositoryRoot({ explicitRoot: repositoryRoot })
		).repositoryRoot;
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			JSON.stringify({
				scripts: {
					typecheck: "tsc --noEmit",
					test: "vitest run",
					lint: "oxlint .",
				},
				dependencies: {
					next: "latest",
				},
			}),
		);
		await writeFile(path.join(repositoryRoot, "AGENTS.md"), "# Instructions\n");
		await mkdir(path.join(repositoryRoot, "src"), { recursive: true });
		await writeFile(
			path.join(repositoryRoot, "src", "index.ts"),
			"export {};\n",
		);
		await writeLocalProjectState(resolvedRepositoryRoot, {
			schemaVersion: 1,
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerMode: "daemon",
			apiBaseUrl: "http://127.0.0.1:1",
			eventEndpoint: "/api/workspace/runner/events",
			repositoryDisplayName: "doctor-pass-test",
			machineDisplayName: "test-machine",
			runnerVersion: "0.1.0",
			pairedAt: 1,
			updatedAt: 1,
		});

		const requests: Array<{ url: string; body: unknown }> = [];
		const server = createServer(async (request, response) => {
			const body = await readRequestBody(request);
			requests.push({
				url: request.url ?? "",
				body: body ? JSON.parse(body) : null,
			});
			if (!request.headers.authorization?.startsWith("Bearer sbs_run_test")) {
				response.writeHead(401);
				response.end();
				return;
			}
			if (request.url === "/api/workspace/runner/doctor-pass/start") {
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(
					JSON.stringify({
						doctorPassRunId: "doctorPassRuns_1",
						startedAt: 10,
					}),
				);
				return;
			}
			if (request.url === "/api/workspace/runner/events") {
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(JSON.stringify({ inserted: true }));
				return;
			}
			if (request.url === "/api/workspace/runner/findings") {
				response.writeHead(200, { "Content-Type": "application/json" });
				response.end(
					JSON.stringify({
						syncedAt: 20,
						insertedCount: 1,
						patchedCount: 0,
					}),
				);
				return;
			}
			response.writeHead(404);
			response.end();
		});
		await new Promise<void>((resolve) =>
			server.listen(0, "127.0.0.1", resolve),
		);
		const address = server.address();
		if (!address || typeof address === "string") {
			throw new Error("Doctor pass test server did not expose a port.");
		}
		const apiBaseUrl = `http://127.0.0.1:${address.port}`;
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot: resolvedRepositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_test",
				apiBaseUrl,
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
		});

		try {
			await expect(
				runDoctorPassCommand([
					"run",
					"--repo",
					resolvedRepositoryRoot,
					"--run-id",
					"run-test",
					"--intake-probe",
					scannerPath,
					"--json",
				]),
			).resolves.toBe(0);
			const reportDirectory = path.join(
				resolvedRepositoryRoot,
				".sbs",
				"reports",
				"doctor-pass",
				"run-test",
			);
			const schema = JSON.parse(
				await readFile(
					path.join(reportDirectory, "repo-doctor-top-nine.schema.json"),
					"utf8",
				),
			);
			const syncPreview = JSON.parse(
				await readFile(path.join(reportDirectory, "sync-preview.json"), "utf8"),
			) as { previewDigest: string };
			const findings = JSON.parse(
				await readFile(path.join(reportDirectory, "findings.json"), "utf8"),
			) as { findings: unknown[] };

			expect(schema.properties.schemaVersion).toEqual({
				type: "string",
				const: TOP_NINE_SCHEMA_VERSION,
			});
			assertCodexStructuredOutputSchema(schema);
			assertNoBareConstPropertySchema(schema);
			expect(syncPreview.previewDigest).toMatch(/^sha256:/);
			expect(findings.findings).toHaveLength(1);
			expect(
				requests.find(
					(request) =>
						request.url === "/api/workspace/runner/doctor-pass/start",
				)?.body,
			).toMatchObject({ localRunId: "run-test" });
			expect(
				requests.some(
					(request) =>
						request.url === "/api/workspace/runner/events" &&
						(request.body as { eventType?: string }).eventType ===
							"doctor.sync_preview.ready",
				),
			).toBe(true);

			await writeFile(
				path.join(reportDirectory, "findings.json"),
				JSON.stringify(
					{
						...findings,
						findings: [
							{
								...(findings.findings[0] as Record<string, unknown>),
								permissionRequired: "provider_access",
							},
						],
					},
					null,
					2,
				),
			);
			await expect(
				runDoctorPassCommand([
					"upload",
					"--repo",
					resolvedRepositoryRoot,
					"--run-id",
					"run-test",
					"--json",
				]),
			).rejects.toThrow("approved sync preview digest");
			await writeFile(
				path.join(reportDirectory, "findings.json"),
				JSON.stringify(findings, null, 2),
			);

			await expect(
				runDoctorPassCommand([
					"upload",
					"--repo",
					resolvedRepositoryRoot,
					"--run-id",
					"run-test",
					"--json",
				]),
			).resolves.toBe(0);
			expect(
				requests.some(
					(request) => request.url === "/api/workspace/runner/findings",
				),
			).toBe(true);
		} finally {
			await new Promise<void>((resolve) => server.close(() => resolve()));
		}
	});

	it("writes blocked artifacts when Codex emits malformed JSONL", async () => {
		const repositoryRoot = await createTemporaryDirectory(
			"sbs-doctor-pass-blocked-",
		);
		const runnerHome = await createTemporaryDirectory("sbs-doctor-home-");
		const codexHome = await createCodexHome();
		process.env.SBS_RUNNER_HOME = runnerHome;
		process.env.CODEX_HOME = codexHome;

		await initializeGitRepository(repositoryRoot);
		const resolvedRepositoryRoot = (
			await resolveRepositoryRoot({ explicitRoot: repositoryRoot })
		).repositoryRoot;
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			JSON.stringify({ scripts: { test: "vitest run" } }),
		);
		await writeLocalProjectState(resolvedRepositoryRoot, {
			schemaVersion: 1,
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerMode: "one_shot",
			apiBaseUrl: "http://127.0.0.1:1",
			eventEndpoint: "/api/workspace/runner/events",
			repositoryDisplayName: "doctor-pass-blocked-test",
			machineDisplayName: "test-machine",
			runnerVersion: "0.1.0",
			pairedAt: 1,
			updatedAt: 1,
		});
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot: resolvedRepositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_test",
				apiBaseUrl: "http://127.0.0.1:1",
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
		});
		const codexPath = await createMalformedCodexBin();

		await expect(
			runDoctorPassCommand([
				"run",
				"--repo",
				resolvedRepositoryRoot,
				"--run-id",
				"run-blocked",
				"--intake-probe",
				scannerPath,
				"--codex-binary",
				codexPath,
				"--local-only",
				"--json",
			]),
		).resolves.toBe(0);

		const reportDirectory = path.join(
			resolvedRepositoryRoot,
			".sbs",
			"reports",
			"doctor-pass",
			"run-blocked",
		);
		const output = JSON.parse(
			await readFile(
				path.join(reportDirectory, "repo-doctor-top-nine.output.json"),
				"utf8",
			),
		) as { findings: Array<{ status: string; blockedReason?: string }> };
		const syncPreview = JSON.parse(
			await readFile(path.join(reportDirectory, "sync-preview.json"), "utf8"),
		) as { previewDigest: string };

		expect(output.findings[0]).toMatchObject({
			status: "blocked",
		});
		expect(output.findings[0]?.blockedReason).toContain("Codex");
		expect(syncPreview.previewDigest).toMatch(/^sha256:/);
	});

	it("marks codebase-intake blocked before evidence and reports when scanner JSON is malformed", async () => {
		const repositoryRoot = await createTemporaryDirectory(
			"sbs-doctor-pass-bad-scanner-",
		);
		const runnerHome = await createTemporaryDirectory("sbs-doctor-home-");
		const codexHome = await createCodexHome();
		const fakeBinDirectory = await createDoctorPassFakeBin();
		const malformedScannerPath = await createMalformedScannerScript();
		process.env.PATH = `${fakeBinDirectory}${path.delimiter}${originalPath}`;
		process.env.SBS_RUNNER_HOME = runnerHome;
		process.env.CODEX_HOME = codexHome;

		await initializeGitRepository(repositoryRoot);
		const resolvedRepositoryRoot = (
			await resolveRepositoryRoot({ explicitRoot: repositoryRoot })
		).repositoryRoot;
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			JSON.stringify({ scripts: { test: "vitest run" } }),
		);
		await writeLocalProjectState(resolvedRepositoryRoot, {
			schemaVersion: 1,
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			runnerMode: "one_shot",
			apiBaseUrl: "http://127.0.0.1:1",
			eventEndpoint: "/api/workspace/runner/events",
			repositoryDisplayName: "doctor-pass-bad-scanner-test",
			machineDisplayName: "test-machine",
			runnerVersion: "0.1.0",
			pairedAt: 1,
			updatedAt: 1,
		});
		await writeRunnerCredential({
			runnerHome,
			repositoryRoot: resolvedRepositoryRoot,
			credential: {
				projectId: "workspaceProjects_1",
				runnerId: "workspaceRunnerBindings_1",
				runnerToken: "sbs_run_test",
				apiBaseUrl: "http://127.0.0.1:1",
				eventEndpoint: "/api/workspace/runner/events",
				updatedAt: 1,
			},
		});

		await expect(
			runDoctorPassCommand([
				"run",
				"--repo",
				resolvedRepositoryRoot,
				"--run-id",
				"run-bad-scanner",
				"--intake-probe",
				malformedScannerPath,
				"--local-only",
				"--json",
			]),
		).resolves.toBe(0);

		const reportDirectory = path.join(
			resolvedRepositoryRoot,
			".sbs",
			"reports",
			"doctor-pass",
			"run-bad-scanner",
		);
		const evidencePacket = JSON.parse(
			await readFile(
				path.join(reportDirectory, "evidence-packet.json"),
				"utf8",
			),
		) as { probes: Array<{ probeId: string; status: string }> };
		const doctorPassReport = await readFile(
			path.join(reportDirectory, "doctor-pass.md"),
			"utf8",
		);

		expect(evidencePacket.probes).toContainEqual(
			expect.objectContaining({
				probeId: "codebase-intake",
				status: "blocked",
			}),
		);
		expect(doctorPassReport).toContain("`codebase-intake`: blocked");
	});
});

async function createDoctorPassFakeBin() {
	const binDirectory = await createTemporaryDirectory("sbs-doctor-bin-");
	const codexPath = path.join(binDirectory, "codex");
	const output = {
		schemaVersion: "repo-doctor-top-nine.v1",
		summary: "One source-truth finding.",
		findings: [
			{
				findingId: "finding-source-truth",
				rank: 1,
				status: "ready",
				title: "Source truth is ready for agent work",
				category: "source_truth",
				severity: "high",
				confidence: 0.9,
				buyerImpact:
					"The repo has instructions and proof scripts that can anchor later workflows.",
				blastRadius: "low",
				proofPath: "Review AGENTS.md and package scripts.",
				proofability: "clear",
				permissionRequired: "docs_write",
				recommendedWorkflowId: "source-truth-agent-readiness",
				whyThisNow: "It improves every later workflow handoff.",
				evidenceRefs: [
					{
						kind: "file",
						repoRelativePath: "AGENTS.md",
						summary: "Repo instructions exist.",
					},
					{
						kind: "command",
						commandName: "npm run test",
						summary: "Test script exists.",
					},
				],
				syncSensitivity: "low",
				localReportRef:
					".sbs/reports/doctor-pass/run-test/source-truth-agent-readiness.json",
			},
		],
	};
	const finalEventLine = JSON.stringify({
		type: "item.completed",
		item: {
			id: "item_1",
			type: "agent_message",
			text: JSON.stringify(output),
		},
	});
	await writeFile(
		codexPath,
		[
			"#!/usr/bin/env node",
			"if (process.argv[2] === '--version') { console.log('codex 1.0.0'); process.exit(0); }",
			"if (process.argv[2] === 'exec' && process.argv[3] === '--help') { console.log('exec help'); process.exit(0); }",
			"if (process.argv[2] === 'exec') {",
			"  process.stdin.resume();",
			"  process.stdin.on('end', () => {",
			"    console.log(JSON.stringify({ type: 'thread.started', thread_id: 'thread_doctor' }));",
			`    console.log(${JSON.stringify(finalEventLine)});`,
			"  });",
			"}",
			"",
		].join("\n"),
	);
	await chmod(codexPath, 0o755);
	return binDirectory;
}

async function createMalformedCodexBin() {
	const binDirectory = await createTemporaryDirectory("sbs-doctor-bad-bin-");
	const codexPath = path.join(binDirectory, "codex");
	await writeFile(
		codexPath,
		[
			"#!/usr/bin/env node",
			"if (process.argv[2] === '--version') { console.log('codex 1.0.0'); process.exit(0); }",
			"console.log('{not-json');",
			"process.exit(0);",
			"",
		].join("\n"),
	);
	await chmod(codexPath, 0o755);
	return codexPath;
}

async function createMalformedScannerScript() {
	const scannerDirectory = await createTemporaryDirectory("sbs-bad-scanner-");
	const scannerPath = path.join(scannerDirectory, "codebase-intake.py");
	await writeFile(
		scannerPath,
		[
			"#!/usr/bin/env python3",
			"import pathlib",
			"import sys",
			"markdown_path = pathlib.Path(sys.argv[sys.argv.index('--markdown-output') + 1])",
			"json_path = pathlib.Path(sys.argv[sys.argv.index('--json-output') + 1])",
			"markdown_path.write_text('# Codebase Intake\\n', encoding='utf-8')",
			"json_path.write_text('{not-json', encoding='utf-8')",
			"",
		].join("\n"),
	);
	await chmod(scannerPath, 0o755);
	return scannerPath;
}

async function readRequestBody(request: NodeJS.ReadableStream) {
	let body = "";
	for await (const chunk of request) {
		body += Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk);
	}
	return body;
}

function restoreEnv(name: string, value: string | undefined) {
	if (value === undefined) {
		delete process.env[name];
	} else {
		process.env[name] = value;
	}
}

function assertCodexStructuredOutputSchema(schema: unknown) {
	const unsupportedKeywords = [
		"minLength",
		"maxLength",
		"pattern",
		"format",
		"minimum",
		"maximum",
		"multipleOf",
		"minItems",
		"maxItems",
		"patternProperties",
		"allOf",
		"not",
		"dependentRequired",
		"dependentSchemas",
		"if",
		"then",
		"else",
	];
	visitSchemaNode(schema, "$", (node, pathLabel) => {
		for (const keyword of unsupportedKeywords) {
			expect(node, `${pathLabel} must not use ${keyword}`).not.toHaveProperty(
				keyword,
			);
		}
		if (node.type === "object") {
			expect(node.additionalProperties, pathLabel).toBe(false);
			const properties = readSchemaProperties(node, pathLabel);
			const propertyNames = Object.keys(properties).sort();
			expect(
				[...readRequiredProperties(node, pathLabel)].sort(),
				pathLabel,
			).toEqual(propertyNames);
		}
	});
	visitPropertySchemas(schema, "$", (propertySchema, pathLabel) => {
		expect(propertySchema.type, `${pathLabel} must declare type`).toBeDefined();
		if ("const" in propertySchema) {
			expect(
				propertySchema.type,
				`${pathLabel} const must declare type`,
			).toBeDefined();
		}
		if ("enum" in propertySchema) {
			expect(
				propertySchema.type,
				`${pathLabel} enum must declare type`,
			).toBeDefined();
		}
	});
}

function assertNoBareConstPropertySchema(schema: unknown) {
	visitPropertySchemas(schema, "$", (propertySchema, pathLabel) => {
		expect(
			Object.keys(propertySchema).sort(),
			`${pathLabel} must not be a bare const schema`,
		).not.toEqual(["const"]);
	});
}

function createDigestFinding() {
	return {
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "ready" as const,
		title: "Source truth readiness",
		category: "source_truth" as const,
		severity: "high" as const,
		confidence: 0.9,
		buyerImpact:
			"The repo has instructions and proof scripts that can anchor later workflows.",
		blastRadius: "low" as const,
		proofPath: "Review AGENTS.md and package scripts.",
		proofability: "clear" as const,
		permissionRequired: "docs_write" as const,
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later workflow handoff.",
		evidenceRefs: [
			{
				kind: "file" as const,
				repoRelativePath: "AGENTS.md",
				summary: "Repo instructions exist.",
			},
			{
				kind: "command" as const,
				commandName: "npm run test",
				summary: "Test script exists.",
			},
		],
		syncSensitivity: "low" as const,
		localReportRef:
			".sbs/reports/doctor-pass/run-digest/source-truth-agent-readiness.json",
	};
}

function visitPropertySchemas(
	schema: unknown,
	pathLabel: string,
	visit: (schema: Record<string, unknown>, pathLabel: string) => void,
) {
	visitSchemaNode(schema, pathLabel, (node, nodePathLabel) => {
		const properties = isRecord(node.properties) ? node.properties : null;
		if (!properties) {
			return;
		}
		for (const [propertyName, propertySchema] of Object.entries(properties)) {
			expect(isRecord(propertySchema), `${nodePathLabel}.${propertyName}`).toBe(
				true,
			);
			visit(
				propertySchema as Record<string, unknown>,
				`${nodePathLabel}.${propertyName}`,
			);
		}
	});
}

function visitSchemaNode(
	schema: unknown,
	pathLabel: string,
	visit: (schema: Record<string, unknown>, pathLabel: string) => void,
) {
	expect(isRecord(schema), pathLabel).toBe(true);
	const node = schema as Record<string, unknown>;
	visit(node, pathLabel);
	if (Array.isArray(node.anyOf)) {
		node.anyOf.forEach((entry, index) =>
			visitSchemaNode(entry, `${pathLabel}.anyOf[${index}]`, visit),
		);
	}
	if (isRecord(node.properties)) {
		for (const [propertyName, propertySchema] of Object.entries(
			node.properties,
		)) {
			visitSchemaNode(propertySchema, `${pathLabel}.${propertyName}`, visit);
		}
	}
	if (isRecord(node.items)) {
		visitSchemaNode(node.items, `${pathLabel}.items`, visit);
	}
}

function readSchemaProperties(
	schema: Record<string, unknown>,
	pathLabel: string,
) {
	expect(isRecord(schema.properties), `${pathLabel}.properties`).toBe(true);
	return schema.properties as Record<string, unknown>;
}

function readRequiredProperties(
	schema: Record<string, unknown>,
	pathLabel: string,
) {
	expect(Array.isArray(schema.required), `${pathLabel}.required`).toBe(true);
	return schema.required as string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
