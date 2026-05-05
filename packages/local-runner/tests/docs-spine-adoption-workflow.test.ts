import { execFile } from "node:child_process";
import {
	chmod,
	mkdir,
	readdir,
	readFile,
	symlink,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import { runDocsSpineAdoptionWorkflow } from "../src/core/docs-spine-adoption-workflow";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import { buildDocsSpineScannerBundle } from "../src/workflows/docs-spine-adoption/scanner";
import {
	DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS,
	DOCS_SPINE_ADOPTION_PROOF_COMMANDS,
	DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
	DOCS_SPINE_ADOPTION_STOP_CONDITIONS,
	DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
} from "../src/workflows/docs-spine-adoption/manifest";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);

function createState(): LocalProjectState {
	return {
		schemaVersion: 1,
		projectId: "workspaceProjects_1",
		runnerId: "workspaceRunnerBindings_1",
		runnerMode: "daemon",
		apiBaseUrl: "https://example.com/",
		eventEndpoint: "/api/workspace/runner/events",
		repositoryDisplayName: "repo",
		machineDisplayName: "Runner Test",
		runnerVersion: "0.1.0",
		pairedAt: 1,
		updatedAt: 1,
	};
}

function createCredential(): RunnerCredential {
	return {
		projectId: "workspaceProjects_1",
		runnerId: "workspaceRunnerBindings_1",
		runnerToken: "sbs_run_secret",
		apiBaseUrl: "https://example.com/",
		eventEndpoint: "/api/workspace/runner/events",
		updatedAt: 1,
	};
}

function createApprovedWorkflowRun(
	overrides: Partial<ApprovedWorkflowRunPacket> = {},
): ApprovedWorkflowRunPacket {
	return {
		workflowRunId: "workflowRuns_docs_spine",
		workflowId: "docs-spine-adoption",
		workflowVersion: "v1",
		branchName: "sbs/docs-spine-adoption-20260505-1200",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_docs_spine",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [...DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS],
		allowedTouchTargets: [...DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS],
		disallowedTouchTargets: [...DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS],
		proofCommands: [...DOCS_SPINE_ADOPTION_PROOF_COMMANDS],
		syncPolicySummary: DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY,
		stopConditions: [...DOCS_SPINE_ADOPTION_STOP_CONDITIONS],
		rollbackNotes: DOCS_SPINE_ADOPTION_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_spine/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_spine/proof.json",
		...overrides,
	};
}

async function createDocsSpineRepository() {
	const repositoryRoot = await createTemporaryDirectory("sbs-docs-spine-");
	await initializeGitRepository(repositoryRoot);
	await mkdir(path.join(repositoryRoot, "docs", "programs"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "docs", "exec-plans"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "docs", "prompts"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "docs", "generated"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, "apps", "web"), { recursive: true });
	await mkdir(path.join(repositoryRoot, "packages", "core"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, ".codex"), { recursive: true });
	await mkdir(path.join(repositoryRoot, ".codex", "skills", "review"), {
		recursive: true,
	});
	await mkdir(path.join(repositoryRoot, ".github", "workflows"), {
		recursive: true,
	});
	await writeFile(
		path.join(repositoryRoot, "package.json"),
		`${JSON.stringify(
			{
				scripts: {
					lint: "SECRET_TOKEN=never-sync eslint .",
					gate: "turbo run gate",
				},
				workspaces: ["apps/*", "packages/*"],
				dependencies: {
					"@clerk/nextjs": "1.0.0",
					convex: "1.0.0",
					next: "1.0.0",
				},
			},
			null,
			2,
		)}\n`,
	);
	await writeFile(
		path.join(repositoryRoot, ".codex", "AGENTS.md"),
		"# Agents\n",
	);
	await writeFile(path.join(repositoryRoot, "AGENTS.md"), "# Shim\n");
	await writeFile(path.join(repositoryRoot, "docs", "index.md"), "# Docs\n");
	await writeFile(
		path.join(repositoryRoot, "docs", "SECURITY.md"),
		"# Security\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "QUALITY_SCORE.md"),
		"# Quality\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "programs", "PROGRAMS.md"),
		"# Programs\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "exec-plans", "PLANS.md"),
		"# Plans\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "prompts", "README.md"),
		"# Prompts\n",
	);
	await writeFile(
		path.join(repositoryRoot, "docs", "generated", "index.md"),
		"# Generated\n",
	);
	await writeFile(
		path.join(repositoryRoot, ".codex", "skills", "review", "SKILL.md"),
		"# Review skill\n",
	);
	await writeFile(
		path.join(repositoryRoot, "apps", "web", "package.json"),
		'{"name":"web"}\n',
	);
	await writeFile(
		path.join(repositoryRoot, "packages", "core", "package.json"),
		'{"name":"core"}\n',
	);
	await writeFile(
		path.join(repositoryRoot, ".github", "workflows", "ci.yml"),
		"name: ci\n",
	);
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "Initial commit"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

async function listSbsFiles(repositoryRoot: string) {
	const sbsDirectory = path.join(repositoryRoot, ".sbs");
	const refs: string[] = [];

	async function visit(directory: string) {
		const entries = await readdir(directory, { withFileTypes: true }).catch(
			(error) => {
				if ((error as { code?: string }).code === "ENOENT") {
					return [];
				}
				throw error;
			},
		);
		for (const entry of entries) {
			const entryPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				await visit(entryPath);
				continue;
			}
			if (entry.isFile()) {
				refs.push(path.relative(repositoryRoot, entryPath));
			}
		}
	}

	await visit(sbsDirectory);
	return refs.sort();
}

describe("docs spine adoption workflow", () => {
	it("builds deterministic scanner timing artifacts for the same repo and timestamp", async () => {
		const repositoryRoot = await createDocsSpineRepository();

		const firstBundle = await buildDocsSpineScannerBundle({
			repositoryRoot,
			now: 1_000,
		});
		const secondBundle = await buildDocsSpineScannerBundle({
			repositoryRoot,
			now: 1_000,
		});
		const firstTimingArtifact = firstBundle.artifacts.find((artifact) =>
			artifact.repoRelativePath.endsWith("performance-timings.json"),
		);
		const secondTimingArtifact = secondBundle.artifacts.find((artifact) =>
			artifact.repoRelativePath.endsWith("performance-timings.json"),
		);

		expect(firstTimingArtifact?.value).toEqual(secondTimingArtifact?.value);
		expect(firstTimingArtifact?.value).toMatchObject({
			scannerDurationMs: 0,
			perArtifactDurationsStored: false,
		});
	});

	it("creates a local branch and writes scaffold proof artifacts", async () => {
		const repositoryRoot = await createDocsSpineRepository();
		const sentEvents: unknown[] = [];

		const result = await runDocsSpineAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineAdoption: true,
			now: 1_000,
			fetchRunnerEvent: async (_url, init) => {
				sentEvents.push(JSON.parse(String(init?.body)));
				return new Response(null, { status: 200 });
			},
		});

		const branch = (
			await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
				cwd: repositoryRoot,
			})
		).stdout.trim();
		const manifest = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"manifest.json",
				),
				"utf8",
			),
		);
		const repoFacts = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"facts",
					"repo-facts.json",
				),
				"utf8",
			),
		);
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "proof_completed",
			workflowId: "docs-spine-adoption",
			branchName: "sbs/docs-spine-adoption-20260505-1200",
			proofStatus: "passed",
		});
		expect(branch).toBe("sbs/docs-spine-adoption-20260505-1200");
		expect(manifest).toMatchObject({
			schemaVersion: "docs-spine-adoption-manifest.v1",
			workflowId: "docs-spine-adoption",
			reservedArtifactRefs: expect.objectContaining({
				semgrepOutput: ".sbs/docs-spine-adoption/scans/semgrep.json",
			}),
		});
		expect(repoFacts.repositoryShape.packageManager).toBe("unknown-node");
		expect(repoFacts.repositoryShape.packageScripts).toEqual(["lint", "gate"]);
		expect(repoFacts.repositoryShape.workspaceGlobs).toEqual([
			"apps/*",
			"packages/*",
		]);
		expect(repoFacts.repositoryShape.workspacePackageRefs).toEqual([
			"apps/web/package.json",
			"package.json",
			"packages/core/package.json",
		]);
		expect(repoFacts.repositoryShape.dependencyNames).toEqual([
			"@clerk/nextjs",
			"convex",
			"next",
		]);
		expect(repoFacts.instructionSurface.agentInstructionRefs).toEqual([
			".codex/AGENTS.md",
			".codex/skills/review/SKILL.md",
			"AGENTS.md",
		]);
		expect(repoFacts.docsSurface.programRefs).toEqual([
			"docs/programs/PROGRAMS.md",
		]);
		expect(proof.createdArtifacts).toEqual(
			expect.arrayContaining([
				".sbs/docs-spine-adoption/manifest.json",
				".sbs/docs-spine-adoption/facts/repo-facts.json",
				".sbs/docs-spine-adoption/facts/source-truth-map.json",
				".sbs/docs-spine-adoption/facts/command-proof-map.json",
				".sbs/docs-spine-adoption/facts/quality-score-baseline.json",
				".sbs/docs-spine-adoption/drafts/codex-synthesis-packet.json",
				".sbs/docs-spine-adoption/drafts/quality-score-notes.json",
			]),
		);
		await expect(listSbsFiles(repositoryRoot)).resolves.toEqual([
			".sbs/docs-spine-adoption/drafts/agent-instructions-draft.json",
			".sbs/docs-spine-adoption/drafts/codex-synthesis-packet.json",
			".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
			".sbs/docs-spine-adoption/drafts/exec-plan-draft.json",
			".sbs/docs-spine-adoption/drafts/parity-checklist-draft.json",
			".sbs/docs-spine-adoption/drafts/program-packet-draft.json",
			".sbs/docs-spine-adoption/drafts/prompt-assets-draft.json",
			".sbs/docs-spine-adoption/drafts/quality-score-notes.json",
			".sbs/docs-spine-adoption/drafts/validation-proof-notes.json",
			".sbs/docs-spine-adoption/facts/architecture-signals.json",
			".sbs/docs-spine-adoption/facts/command-proof-map.json",
			".sbs/docs-spine-adoption/facts/docs-gap-report.json",
			".sbs/docs-spine-adoption/facts/generated-surface-map.json",
			".sbs/docs-spine-adoption/facts/instruction-surface-map.json",
			".sbs/docs-spine-adoption/facts/performance-timings.json",
			".sbs/docs-spine-adoption/facts/quality-score-baseline.json",
			".sbs/docs-spine-adoption/facts/repo-facts.json",
			".sbs/docs-spine-adoption/facts/security-signals.json",
			".sbs/docs-spine-adoption/facts/skill-trigger-map.json",
			".sbs/docs-spine-adoption/facts/source-truth-map.json",
			".sbs/docs-spine-adoption/facts/validation-surface-map.json",
			".sbs/docs-spine-adoption/manifest.json",
			".sbs/runs/workflowRuns_docs_spine/proof.json",
			".sbs/runs/workflowRuns_docs_spine/sync-preview.json",
			".sbs/runs/workflowRuns_docs_spine/workflow-packet.json",
		]);
		const commandProofMap = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"facts",
					"command-proof-map.json",
				),
				"utf8",
			),
		);
		const sourceTruthMap = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"facts",
					"source-truth-map.json",
				),
				"utf8",
			),
		);
		const qualityScoreBaseline = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"facts",
					"quality-score-baseline.json",
				),
				"utf8",
			),
		);
		const codexSynthesisPacket = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"drafts",
					"codex-synthesis-packet.json",
				),
				"utf8",
			),
		);
		const qualityScoreNotes = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"drafts",
					"quality-score-notes.json",
				),
				"utf8",
			),
		);
		expect(commandProofMap.scriptRows).toEqual([
			{ scriptName: "lint", proofKind: "static", commandBodyStored: false },
			{ scriptName: "gate", proofKind: "gate", commandBodyStored: false },
		]);
		expect(sourceTruthMap.qualityScoreRefs).toEqual(["docs/QUALITY_SCORE.md"]);
		expect(qualityScoreBaseline).toMatchObject({
			status: "blocked_missing_evidence",
			score: null,
			evidenceRefs: ["docs/QUALITY_SCORE.md"],
		});
		expect(codexSynthesisPacket).toMatchObject({
			status: "ready_for_local_codex_synthesis",
			nextRecommendedWorkflowId: "docs-spine-apply-and-proof",
			privacyBoundary: {
				rawSourceIncluded: false,
				packageScriptBodiesIncluded: false,
				codexTranscriptsIncluded: false,
			},
			authorityBoundary: {
				canApplyFiles: false,
				canMutateCi: false,
				canOpenPullRequests: false,
			},
		});
		expect(qualityScoreNotes).toMatchObject({
			familyId: "quality-score",
			blockedReasons: ["quality-score-evidence-blocked"],
		});
		const localArtifactText = JSON.stringify({
			repoFacts,
			commandProofMap,
			sourceTruthMap,
			qualityScoreBaseline,
			codexSynthesisPacket,
			qualityScoreNotes,
		}).toLowerCase();
		expect(localArtifactText).not.toContain("secret_token");
		expect(localArtifactText).not.toContain("never-sync");
		expect(sentEvents).toHaveLength(2);
	});

	it("blocks without terminal docs spine confirmation", async () => {
		const repositoryRoot = await createDocsSpineRepository();
		const sentEvents: unknown[] = [];

		const result = await runDocsSpineAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_blocked",
			}),
			confirmDocsSpineAdoption: false,
			fetchRunnerEvent: async (_url, init) => {
				sentEvents.push(JSON.parse(String(init?.body)));
				return new Response(null, { status: 200 });
			},
		});
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_blocked",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"docs-spine-adoption requires --confirm-docs-spine-adoption because it creates a local branch and .sbs docs-spine proof.",
		});
		expect(proof.blockedProof).toEqual([
			expect.objectContaining({
				stage: "terminal-confirmation",
				nextApprovalRequired: true,
			}),
		]);
		expect(sentEvents).toEqual([
			expect.objectContaining({
				payload: expect.objectContaining({
					eventType: "workflow.blocked",
					blockedStage: "terminal-confirmation",
				}),
			}),
		]);
	});

	it("refuses to write docs spine artifacts through an existing .sbs symlink", async () => {
		const repositoryRoot = await createDocsSpineRepository();
		const externalSbsTarget = await createTemporaryDirectory(
			"sbs-docs-spine-external-",
		);
		await symlink(externalSbsTarget, path.join(repositoryRoot, ".sbs"), "dir");

		await expect(
			runDocsSpineAdoptionWorkflow({
				repositoryRoot,
				state: createState(),
				credential: createCredential(),
				approvedWorkflowRun: createApprovedWorkflowRun({
					workflowRunId: "workflowRuns_symlink",
					branchName: "sbs/docs-spine-adoption-20260505-1210",
					localWorkflowPacketRef:
						".sbs/runs/workflowRuns_symlink/workflow-packet.json",
					localProofRef: ".sbs/runs/workflowRuns_symlink/proof.json",
				}),
				confirmDocsSpineAdoption: true,
				fetchRunnerEvent: async () => new Response(null, { status: 200 }),
			}),
		).rejects.toThrow("symbolic link");
		await expect(readdir(externalSbsTarget)).resolves.toEqual([]);
	});

	it("fails proof when a post-checkout hook mutates runtime files", async () => {
		const repositoryRoot = await createDocsSpineRepository();
		const hookPath = path.join(
			repositoryRoot,
			".git",
			"hooks",
			"post-checkout",
		);
		await writeFile(
			hookPath,
			[
				"#!/bin/sh",
				"mkdir -p src",
				"printf 'export const unsafe = true;\\n' > src/runtime.ts",
				"",
			].join("\n"),
		);
		await chmod(hookPath, 0o755);

		const result = await runDocsSpineAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_dirty_after_checkout",
				branchName: "sbs/docs-spine-adoption-20260505-1215",
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_dirty_after_checkout/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_dirty_after_checkout/proof.json",
			}),
			confirmDocsSpineAdoption: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_dirty_after_checkout",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result).toMatchObject({
			status: "proof_completed",
			proofStatus: "failed",
			touchedFiles: ["src/runtime.ts"],
		});
		expect(proof.touchedFiles).toEqual(["src/runtime.ts"]);
	});

	it("blocks when the approved packet drifts from the docs spine contract", async () => {
		const repositoryRoot = await createDocsSpineRepository();

		const result = await runDocsSpineAdoptionWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				workflowRunId: "workflowRuns_drift",
				disallowedTouchTargets: ["runtime app code"],
				localWorkflowPacketRef:
					".sbs/runs/workflowRuns_drift/workflow-packet.json",
				localProofRef: ".sbs/runs/workflowRuns_drift/proof.json",
			}),
			confirmDocsSpineAdoption: true,
			fetchRunnerEvent: async () => new Response(null, { status: 200 }),
		});

		expect(result).toMatchObject({
			status: "blocked",
			proofStatus: "blocked",
			blockedReason:
				"Docs spine adoption disallowed touch targets are not approved.",
		});
	});
});
