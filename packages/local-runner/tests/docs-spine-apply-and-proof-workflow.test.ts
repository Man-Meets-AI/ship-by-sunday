import { execFile } from "node:child_process";
import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { RunnerCredential } from "../src/core/local-runner-home";
import type { LocalProjectState } from "../src/core/local-project-state";
import {
	extractApplyReadyFiles,
	runDocsSpineApplyWorkflow,
} from "../src/core/docs-spine-apply-and-proof-workflow";
import type { ApprovedWorkflowRunPacket } from "../src/core/workflow-run-api";
import {
	DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS,
	DOCS_SPINE_APPLY_EXPECTED_OUTPUTS,
	DOCS_SPINE_APPLY_PROOF_COMMANDS,
	DOCS_SPINE_APPLY_ROLLBACK_NOTES,
	DOCS_SPINE_APPLY_STOP_CONDITIONS,
	DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
} from "../src/workflows/docs-spine-apply-and-proof/manifest";
import { buildDocsSpineApplyQualityReport } from "../src/workflows/docs-spine-adoption/quality-eval";
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
		workflowRunId: "workflowRuns_docs_spine_apply",
		workflowId: "docs-spine-apply-and-proof",
		workflowVersion: "v1",
		branchName: "sbs/docs-spine-apply-20260505-1300",
		profileName: "sbs-workspace-write",
		writeLeaseId: "lease_workflowRuns_docs_spine_apply",
		writeLeaseExpiresAt: 4_102_444_800_000,
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs: [...DOCS_SPINE_APPLY_EXPECTED_OUTPUTS],
		allowedTouchTargets: [...DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS],
		disallowedTouchTargets: [...DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS],
		proofCommands: [...DOCS_SPINE_APPLY_PROOF_COMMANDS],
		syncPolicySummary: DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY,
		stopConditions: [...DOCS_SPINE_APPLY_STOP_CONDITIONS],
		rollbackNotes: DOCS_SPINE_APPLY_ROLLBACK_NOTES,
		localWorkflowPacketRef:
			".sbs/runs/workflowRuns_docs_spine_apply/workflow-packet.json",
		localProofRef: ".sbs/runs/workflowRuns_docs_spine_apply/proof.json",
		...overrides,
	};
}

async function createApplyRepository({
	checkoutApprovedBranch = true,
}: {
	checkoutApprovedBranch?: boolean;
} = {}) {
	const repositoryRoot = await createTemporaryDirectory(
		"sbs-docs-spine-apply-",
	);
	await initializeGitRepository(repositoryRoot);
	await mkdir(path.join(repositoryRoot, "docs"), { recursive: true });
	await writeFile(path.join(repositoryRoot, "README.md"), "# Repo\n");
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "Initial commit"], {
		cwd: repositoryRoot,
	});
	if (checkoutApprovedBranch) {
		await execFileAsync(
			"git",
			["checkout", "-b", "sbs/docs-spine-apply-20260505-1300"],
			{ cwd: repositoryRoot },
		);
	}
	return repositoryRoot;
}

async function writeApplyReadyDraft(repositoryRoot: string) {
	const draftDirectory = path.join(
		repositoryRoot,
		".sbs",
		"docs-spine-adoption",
		"drafts",
	);
	await mkdir(draftDirectory, { recursive: true });
	await writeFile(
		path.join(draftDirectory, "docs-index-draft.json"),
		`${JSON.stringify(
			{
				schemaVersion: "docs-spine-docs-index-draft.v1",
				proposedFiles: [
					{
						targetRef: "docs/index.md",
						markdown: buildPassingDocsIndexMarkdown(),
					},
				],
			},
			null,
			2,
		)}\n`,
	);
}

async function writeApplyRepoFacts({
	repositoryRoot,
	packageManager = "unknown-node",
	packageScripts = ["gate"],
}: {
	repositoryRoot: string;
	packageManager?: string;
	packageScripts?: string[];
}) {
	const factsDirectory = path.join(
		repositoryRoot,
		".sbs",
		"docs-spine-adoption",
		"facts",
	);
	await mkdir(factsDirectory, { recursive: true });
	await writeFile(
		path.join(factsDirectory, "repo-facts.json"),
		`${JSON.stringify(
			{
				schemaVersion: "docs-spine-repo-facts.v1",
				workflowId: "docs-spine-adoption",
				workflowVersion: "v1",
				repositoryShape: {
					packageManager,
					packageScripts,
					workspaceGlobs: [],
					workspacePackageRefs: [],
					dependencyNames: [],
				},
				instructionSurface: {
					agentInstructionRefs: ["AGENTS.md"],
					assistantShimRefs: [],
					secondaryInstructionRefs: [],
					ignoredInstructionRefs: [],
					skillRefs: [],
				},
				docsSurface: {
					docsRefs: ["docs/index.md"],
					programRefs: [],
					execPlanRefs: [],
					promptRefs: [],
					specRefs: [],
					generatedRefs: [],
				},
				validationSurface: {
					validationRefs: [],
					ciRefs: [],
					releaseRefs: [],
				},
				blockedFacts: [],
				createdAt: 1_000,
			},
			null,
			2,
		)}\n`,
	);
}

async function writePriorDocsSpineAdoptionRun(repositoryRoot: string) {
	const priorRunDirectory = path.join(
		repositoryRoot,
		".sbs",
		"runs",
		"prior-docs-spine-adoption",
	);
	await mkdir(priorRunDirectory, { recursive: true });
	await writeFile(
		path.join(priorRunDirectory, "workflow-packet.json"),
		`${JSON.stringify({
			workflowId: "docs-spine-adoption",
			workflowVersion: "v1",
		})}\n`,
	);
	await writeFile(path.join(priorRunDirectory, "proof.json"), "{}\n");
}

function buildPassingDocsIndexMarkdown() {
	return [
		"---",
		"title: Docs Index",
		"summary: First-hop documentation route map for this repository.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Starting repo work.",
		"---",
		"",
		"# Docs Index",
		"",
		"## Owns",
		"",
		"- First-hop docs routing.",
		"- [README](../README.md)",
		"",
		"## Does Not Own",
		"",
		"- Runtime implementation details.",
		"",
		"## How Codex loads repo guidance",
		"",
		"Start with root instructions, then follow nearest nested instructions.",
		"",
		"## First Hop",
		"",
		"- Architecture: `docs/ARCHITECTURE.md`",
		"- Reliability: `docs/RELIABILITY.md`",
		"- Security: `docs/SECURITY.md`",
		"- Programs: `docs/programs/PROGRAMS.md`",
		"- ExecPlans: `docs/exec-plans/PLANS.md`",
		"- Quality score: `docs/QUALITY_SCORE.md`",
		"- Native gate: `bun run gate`",
		"",
		"## Next",
		"",
		"Read the file that owns the surface you are changing.",
		"",
	].join("\n");
}

function buildPassingExistingDocsIndexMarkdown() {
	return buildPassingDocsIndexMarkdown().replace(
		"Read the file that owns the surface you are changing.",
		"Keep this owner-written section.\n\nRead the file that owns the surface you are changing.",
	);
}

describe("docs spine apply and proof workflow", () => {
	it("fails the weak Arena v1 docs-spine shape", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/index.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
					markdown:
						"# Docs\n\n## Source Truth\n\n- Agent instructions: `.agents/daily-audit/log.md`\n",
				},
				{
					targetRef: "docs/QUALITY_SCORE.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/quality-score-notes.json",
					markdown:
						"# Quality Score\n\nQuality score evidence is blocked until a separate evidence-bound quality audit runs.\n",
				},
			],
		});

		expect(report.status).toBe("failed");
		expect(report.ruleResults).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: "docs-index.owns",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "content.hidden-noise-primary-route",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "quality-score.placeholder-only",
					status: "failed",
				}),
			]),
		);
	});

	it("stamps apply quality reports with the apply workflow id", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/index.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
					markdown: buildPassingDocsIndexMarkdown(),
				},
			],
		});

		expect(report.workflowId).toBe("docs-spine-apply-and-proof");
		expect(report.workflowVersion).toBe("v1");
		expect(report.status).toBe("passed");
	});

	it("fails Program contract output that omits the Program creation prompt", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/programs/PROGRAMS.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/program-packet-draft.json",
					markdown: [
						"---",
						"title: Programs",
						"---",
						"",
						"# Programs",
						"",
					].join("\n"),
				},
			],
		});

		expect(report.status).toBe("failed");
		expect(report.ruleResults).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: "program.authoring-prompt",
					status: "failed",
				}),
			]),
		);
	});

	it("fails superficial quality-score docs that only name one scorecard token", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/QUALITY_SCORE.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/quality-score-notes.json",
					markdown: [
						"---",
						"title: Quality Score",
						"---",
						"",
						"# Quality Score",
						"",
						"## Owns",
						"",
						"- Product Domains",
						"",
					].join("\n"),
				},
			],
		});

		expect(report.status).toBe("failed");
		expect(report.ruleResults).toContainEqual(
			expect.objectContaining({
				ruleId: "quality-score.scorecard-contract",
				status: "failed",
			}),
		);
	});

	it("fails thin Program and ExecPlan contract docs below the example bar", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/programs/PROGRAMS.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/program-packet-draft.json",
					markdown: [
						"---",
						"title: Programs",
						"---",
						"",
						"# Programs",
						"",
						"## Required Structure",
						"",
						"Program packets need structure.",
						"",
						"## Prompt Contract",
						"",
						"Run `bun run programs:lint`.",
					].join("\n"),
				},
				{
					targetRef: "docs/exec-plans/PLANS.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/exec-plan-draft.json",
					markdown: [
						"---",
						"title: ExecPlans",
						"---",
						"",
						"# ExecPlans",
						"",
						"## Required Structure",
						"",
						"ExecPlans need implementation structure.",
						"",
						"## Validation and Acceptance",
						"",
						"Run `bun run plans:lint`.",
					].join("\n"),
				},
			],
		});

		expect(report.status).toBe("failed");
		expect(report.ruleResults).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: "program-contract.example-bar",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "exec-plan-contract.example-bar",
					status: "failed",
				}),
			]),
		);
	});

	it("fails Program and ExecPlan drafts that break packet linkage contracts", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/programs/active/docs-spine-adoption/program.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/program-packet-draft.json",
					markdown: [
						"---",
						"program_id: docs-spine-adoption",
						"title: Docs Spine Adoption",
						"status: active",
						"created_at: 2026-05-05",
						"completed_at: null",
						"summary: Adopt docs spine.",
						"post_build_recap: null",
						"read_when:",
						"  - Resuming docs spine.",
						"---",
						"",
						"# Docs Spine Adoption",
						"",
						"## Purpose / Big Picture",
						"## Program Inputs",
						"## Current State",
						"## Progress",
						"## Decision Log",
						"## Slice Ledger",
						"## Next Slice",
						"## Risks and Watchpoints",
						"## Outcomes & Retrospective",
						"## Validation and Acceptance",
						"## Artifacts and Notes",
						"## Interfaces and Dependencies",
					].join("\n"),
				},
				{
					targetRef:
						"docs/exec-plans/active/2026-05-05-docs-spine-adoption-first-slice.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/exec-plan-draft.json",
					markdown: [
						"---",
						"title: Adopt Docs Spine First Slice",
						"status: active",
						"created_at: 2026-05-05",
						"completed_at: null",
						"summary: Adopt docs spine.",
						"post_build_recap: null",
						"program_id: docs-spine-adoption",
						"planning_brief: docs/programs/active/docs-spine-adoption/planning-brief-1.md",
						"read_when:",
						"  - Resuming docs spine.",
						"---",
						"",
						"# Adopt Docs Spine First Slice",
						"",
						"## Purpose / Big Picture",
						"## Progress",
						"## Surprises & Discoveries",
						"## Decision Log",
						"## Outcomes & Retrospective",
						"## Context and Orientation",
						"## Plan of Work",
						"## Milestones",
						"## Concrete Steps",
						"## Validation and Acceptance",
						"## Idempotence and Recovery",
						"## Artifacts and Notes",
						"## Interfaces and Dependencies",
					].join("\n"),
				},
			],
		});

		expect(report.status).toBe("failed");
		expect(report.ruleResults).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: "program.active-packet-path",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "exec-plan.test-commands",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "exec-plan.planning-brief-link",
					status: "failed",
				}),
			]),
		);
	});

	it("requires proof-only native gates to be routed", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			repoFacts: {
				schemaVersion: "docs-spine-repo-facts.v1",
				workflowId: "docs-spine-adoption",
				workflowVersion: "v1",
				repositoryShape: {
					packageManager: "bun",
					packageScripts: ["proof"],
					workspaceGlobs: [],
					workspacePackageRefs: [],
					dependencyNames: [],
				},
				instructionSurface: {
					agentInstructionRefs: ["AGENTS.md"],
					assistantShimRefs: [],
					secondaryInstructionRefs: [],
					ignoredInstructionRefs: [],
					skillRefs: [],
				},
				docsSurface: {
					docsRefs: ["docs/index.md"],
					programRefs: [],
					execPlanRefs: [],
					promptRefs: [],
					specRefs: [],
					generatedRefs: [],
				},
				validationSurface: {
					validationRefs: [],
					ciRefs: [],
					releaseRefs: [],
				},
				blockedFacts: [],
				createdAt: 1_000,
			},
			files: [
				{
					targetRef: "docs/index.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
					markdown: buildPassingDocsIndexMarkdown().replace(
						"- Native gate: `bun run gate`",
						"- Native command: `bun run start`",
					),
				},
			],
		});

		expect(report.ruleResults).toContainEqual(
			expect.objectContaining({
				ruleId: "source-truth.native-gate-routed",
				status: "failed",
			}),
		);
	});

	it("allows Program packet artifacts that are not program.md", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef:
						"docs/programs/active/2026-05-05-docs-spine-adoption-quality-reset/planning-brief-2.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/program-packet-draft.json",
					markdown: [
						"---",
						"title: 'Planning Brief 2: Docs Spine Quality Reset'",
						"program_id: docs-spine-adoption-quality-reset",
						"brief_version: 2",
						"status: current",
						"summary: Next slice for the docs spine quality reset Program.",
						"read_when:",
						"  - Writing the next child ExecPlan.",
						"---",
						"",
						"# Planning Brief 2: Docs Spine Quality Reset",
						"",
						"Next slice.",
						"",
					].join("\n"),
				},
			],
		});

		expect(report.status).toBe("passed");
		expect(report.ruleResults).not.toContainEqual(
			expect.objectContaining({
				ruleId: "program.active-required-sections",
				status: "failed",
			}),
		);
	});

	it("flags hidden noise when it appears as an unquoted Markdown bullet", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/index.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
					markdown: `${buildPassingDocsIndexMarkdown()}- .agents/daily-audit/log.md\n`,
				},
			],
		});

		expect(report.ruleResults).toContainEqual(
			expect.objectContaining({
				ruleId: "content.hidden-noise-primary-route",
				status: "failed",
			}),
		);
	});

	it("flags source, test, asset, and local absolute paths in generated docs", () => {
		const report = buildDocsSpineApplyQualityReport({
			now: 1_000,
			files: [
				{
					targetRef: "docs/index.md",
					sourceArtifactRef:
						".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
					markdown: [
						buildPassingDocsIndexMarkdown(),
						"- Existing docs refs: `apps/api/src/rest/router.ts`, `packages/core/__tests__/gate.test.ts`, `assets/logo.png`",
						"- Local source: `/Users/customer/private/repo/docs/index.md`",
						"- Old packet: `docs/programs/active/2026-05-05-docs-spine-adoption/program.md`",
					].join("\n"),
				},
			],
		});

		expect(report.ruleResults).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: "content.source-test-asset-primary-route",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "content.no-local-absolute-paths",
					status: "failed",
				}),
				expect.objectContaining({
					ruleId: "content.no-stale-docs-spine-routes",
					status: "failed",
				}),
			]),
		);
	});

	it("extracts apply-ready Markdown files from draft packets", () => {
		expect(
			extractApplyReadyFiles(
				{
					status: "ready_for_codex_draft",
					blockedReasons: [],
					proposedFiles: [
						{ targetRef: "docs/index.md", markdown: "# Docs\n" },
						{ targetRef: "package.json", markdown: "{}" },
					],
				},
				".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
			),
		).toEqual([
			{
				targetRef: "docs/index.md",
				markdown: "# Docs\n",
				sourceArtifactRef:
					".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
				draftStatus: "ready_for_codex_draft",
				draftBlockedReasons: [],
			},
			{
				targetRef: "package.json",
				markdown: "{}",
				sourceArtifactRef:
					".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
				draftStatus: "ready_for_codex_draft",
				draftBlockedReasons: [],
			},
		]);
	});

	it("applies approved missing docs files and writes local proof", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeApplyReadyDraft(repositoryRoot);
		const events: unknown[] = [];

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async (_url, init) => {
				events.push(JSON.parse(String(init?.body)));
				return Response.json({ ok: true });
			},
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(result.touchedFiles).toContain("docs/index.md");
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).resolves.toBe(buildPassingDocsIndexMarkdown());
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"apply",
					"apply-summary.json",
				),
				"utf8",
			),
		).resolves.toContain('"status": "applied"');
		expect(events).toEqual([
			expect.objectContaining({
				payload: expect.objectContaining({
					eventType: "workflow.started",
					workflowId: "docs-spine-apply-and-proof",
				}),
			}),
			expect.objectContaining({
				payload: expect.objectContaining({
					eventType: "workflow.proof.completed",
					touchedFileRefs: ["docs/index.md"],
					createdArtifactRefs: expect.arrayContaining([
						".sbs/docs-spine-adoption/apply/quality-report.json",
						".sbs/docs-spine-adoption/apply/apply-summary.json",
					]),
				}),
			}),
		]);
	});

	it("blocks after approved writes when post-apply re-scan finds a quality regression", async () => {
		const repositoryRoot = await createApplyRepository();
		await mkdir(path.join(repositoryRoot, ".codex"), { recursive: true });
		await writeFile(
			path.join(repositoryRoot, "AGENTS.md"),
			"# Agent Shim\n\nCanonical instruction lives in `.codex/AGENTS.md`.\n",
		);
		await writeFile(
			path.join(repositoryRoot, ".codex", "AGENTS.md"),
			"# Canonical Instructions\n",
		);
		await execFileAsync("git", ["add", "AGENTS.md", ".codex/AGENTS.md"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add agent instructions"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const applySummary = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"apply",
					"apply-summary.json",
				),
				"utf8",
			),
		);
		const qualityReport = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"apply",
					"quality-report.json",
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
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);

		expect(result.status).toBe("blocked");
		expect(result.proofStatus).toBe("blocked");
		expect(result.touchedFiles).toEqual(["docs/index.md"]);
		expect(applySummary.status).toBe("blocked");
		expect(applySummary.appliedFileRefs).toEqual(["docs/index.md"]);
		expect(qualityReport.status).toBe("failed");
		expect(qualityReport.ruleResults).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					ruleId: "docs-index.instruction-shim-routing",
					status: "failed",
				}),
			]),
		);
		expect(proof.blockedProof).toContainEqual(
			expect.objectContaining({
				stage: "post-apply-quality",
			}),
		);
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).resolves.toBe(buildPassingDocsIndexMarkdown());
	});

	it("creates the approved docs spine apply branch before daemon-style writes", async () => {
		const repositoryRoot = await createApplyRepository({
			checkoutApprovedBranch: false,
		});
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const currentBranch = await execFileAsync(
			"git",
			["rev-parse", "--abbrev-ref", "HEAD"],
			{ cwd: repositoryRoot },
		);
		expect(result.status).toBe("proof_completed");
		expect(currentBranch.stdout.trim()).toBe(
			"sbs/docs-spine-apply-20260505-1300",
		);
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).resolves.toBe(buildPassingDocsIndexMarkdown());
	});

	it("can apply on the existing static docs-spine apply branch", async () => {
		const repositoryRoot = await createApplyRepository({
			checkoutApprovedBranch: false,
		});
		await execFileAsync("git", ["checkout", "-b", "sbs/docs-spine-apply"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun({
				branchName: "sbs/docs-spine-apply",
			}),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const currentBranch = await execFileAsync(
			"git",
			["branch", "--show-current"],
			{ cwd: repositoryRoot },
		);
		expect(result.status).toBe("proof_completed");
		expect(currentBranch.stdout.trim()).toBe("sbs/docs-spine-apply");
	});

	it("merges approved docs spine sections into existing docs files", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "docs", "index.md"),
			buildPassingExistingDocsIndexMarkdown(),
		);
		await execFileAsync("git", ["add", "docs/index.md"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add docs index"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const docsIndex = await readFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"utf8",
		);
		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(docsIndex).toContain("Keep this owner-written section.");
		expect(docsIndex).toContain("<!-- sbs-docs-spine:start docs-index.md -->");
		expect(docsIndex).toContain("- [README](../README.md)");
	});

	it("blocks before writing when the final merged docs index would fail quality", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"# Existing Docs\n\nKeep this owner-written section.\n",
		);
		await execFileAsync("git", ["add", "docs/index.md"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add weak docs index"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const docsIndex = await readFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"utf8",
		);
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);
		expect(result.status).toBe("blocked");
		expect(result.proofStatus).toBe("blocked");
		expect(result.blockedReason).toContain("docs-index.frontmatter");
		expect(proof.blockedProof).toContainEqual(
			expect.objectContaining({
				stage: "final-merged-quality",
			}),
		);
		expect(docsIndex).toBe(
			"# Existing Docs\n\nKeep this owner-written section.\n",
		);
		expect(docsIndex).not.toContain("sbs-docs-spine:start");
	});

	it("replaces weak untracked prior docs-spine output on approved targets", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "docs", "index.md"),
			[
				"# Docs",
				"",
				"## Source Truth",
				"",
				"- Agent instructions: `.agents/daily-audit/log.md`",
				"",
			].join("\n"),
		);
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const docsIndex = await readFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"utf8",
		);
		const qualityReport = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"docs-spine-adoption",
					"apply",
					"quality-report.json",
				),
				"utf8",
			),
		);
		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(qualityReport.status).toBe("passed");
		expect(docsIndex).toBe(buildPassingDocsIndexMarkdown());
		expect(docsIndex).not.toContain(".agents/daily-audit");
		expect(docsIndex).not.toContain("sbs-docs-spine:start");
	});

	it("replaces prior docs-spine output that routed source refs as docs", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "docs", "index.md"),
			[
				"---",
				"title: Docs Index",
				"---",
				"",
				"# Docs Index",
				"",
				"## Existing Docs",
				"",
				"- Existing docs refs: `apps/api/src/rest/router.ts`, `packages/core/__tests__/gate.test.ts`",
				"",
			].join("\n"),
		);
		await execFileAsync("git", ["add", "docs/index.md"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add weak docs index"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const docsIndex = await readFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"utf8",
		);
		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(docsIndex).toBe(buildPassingDocsIndexMarkdown());
		expect(docsIndex).not.toContain("apps/api/src");
		expect(docsIndex).not.toContain("sbs-docs-spine:start");
	});

	it("records repo-native gates as approval-required blockers without running them", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			`${JSON.stringify({
				scripts: {
					gate: "node -e \"console.error('Cannot find package happy-dom'); process.exit(1)\"",
				},
			})}\n`,
		);
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add native gate"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);
		await writeApplyRepoFacts({ repositoryRoot });
		const events: unknown[] = [];

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async (_url, init) => {
				events.push(JSON.parse(String(init?.body)));
				return Response.json({ ok: true });
			},
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);
		const nativeGateBlocker = proof.blockedProof[0];
		expect(proof.qualityReportStatus).toBe("passed");
		expect(nativeGateBlocker).toMatchObject({
			stage: "native-gate",
			commandName: "npm run gate",
			nextApprovalRequired: true,
		});
		expect(String(nativeGateBlocker.reason)).toContain(
			"does not execute repository-controlled package scripts",
		);
		expect(proof.proofCommandResults).toContainEqual(
			expect.objectContaining({
				commandName: "npm run gate",
				status: "blocked",
			}),
		);
		const syncPreview = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"sync-preview.json",
				),
				"utf8",
			),
		);
		expect(syncPreview.blockedProofCount).toBe(1);
		expect(syncPreview.proofSummary).toBe(
			"Docs spine apply wrote only approved docs and .sbs artifacts. Native gate proof is blocked; see the local proof artifact for blocker details.",
		);
		expect(syncPreview.proofSummary).not.toContain("happy-dom");
		expect(events).toContainEqual(
			expect.objectContaining({
				payload: expect.objectContaining({
					eventType: "workflow.proof.completed",
					proofSummary: syncPreview.proofSummary,
				}),
			}),
		);
	});

	it("blocks proof when the repo-native gate would report a non-setup failure", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			`${JSON.stringify({
				scripts: {
					gate: "node -e \"console.error('assertion failed'); process.exit(1)\"",
				},
			})}\n`,
		);
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add native gate"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);
		await writeApplyRepoFacts({ repositoryRoot });

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);
		expect(proof.blockedProof).toContainEqual(
			expect.objectContaining({
				stage: "native-gate",
				commandName: "npm run gate",
				nextApprovalRequired: true,
			}),
		);
		expect(String(proof.blockedProof[0].reason)).not.toContain(
			"assertion failed",
		);
		expect(proof.proofCommandResults).toContainEqual(
			expect.objectContaining({
				commandName: "npm run gate",
				status: "blocked",
			}),
		);
	});

	it("blocks proof instead of running a native gate that would report Biome failures", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			`${JSON.stringify({
				scripts: {
					gate: "node -e \"console.error('biome check found 1 error'); process.exit(1)\"",
				},
			})}\n`,
		);
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add native gate"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);
		await writeApplyRepoFacts({ repositoryRoot });

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);
		expect(proof.blockedProof).toContainEqual(
			expect.objectContaining({
				stage: "native-gate",
				commandName: "npm run gate",
				nextApprovalRequired: true,
			}),
		);
		expect(String(proof.blockedProof[0].reason)).not.toContain(
			"biome check found",
		);
		expect(proof.proofCommandResults).toContainEqual(
			expect.objectContaining({
				commandName: "npm run gate",
				status: "blocked",
			}),
		);
	});

	it("blocks proof instead of running a native gate that would write files", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeFile(
			path.join(repositoryRoot, "package.json"),
			`${JSON.stringify({
				scripts: {
					gate: "node -e \"require('node:fs').writeFileSync('native-output.txt', 'unexpected')\"",
				},
			})}\n`,
		);
		await execFileAsync("git", ["add", "package.json"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add native gate"], {
			cwd: repositoryRoot,
		});
		await writeApplyReadyDraft(repositoryRoot);
		await writeApplyRepoFacts({ repositoryRoot });

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(result.touchedFiles).not.toContain("native-output.txt");
		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);
		expect(proof.proofCommandResults).toContainEqual(
			expect.objectContaining({
				commandName: "npm run gate",
				status: "blocked",
			}),
		);
	});

	it("blocks quality proof when an approved Markdown draft has no heading", async () => {
		const repositoryRoot = await createApplyRepository();
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "docs-index-draft.json"),
			`${JSON.stringify({
				proposedFiles: [
					{ targetRef: "docs/index.md", markdown: "No heading yet.\n" },
				],
			})}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.proofStatus).toBe("blocked");
		expect(result.blockedReason).toContain("markdown.top-level-heading");
		const proof = await readFile(
			path.join(
				repositoryRoot,
				".sbs",
				"runs",
				"workflowRuns_docs_spine_apply",
				"proof.json",
			),
			"utf8",
		);
		expect(proof).toContain('"stage": "draft-validation"');
		expect(proof).toContain("markdown.top-level-heading");
		const parsedProof = JSON.parse(proof);
		expect(parsedProof).toMatchObject({
			qualityReportRef: ".sbs/docs-spine-adoption/apply/quality-report.json",
			qualityReportStatus: "failed",
			qualityFailedRuleIds: expect.arrayContaining([
				"markdown.top-level-heading",
			]),
		});
		const syncPreview = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"sync-preview.json",
				),
				"utf8",
			),
		);
		expect(syncPreview).toMatchObject({
			qualityReportRef: ".sbs/docs-spine-adoption/apply/quality-report.json",
			qualityReportStatus: "failed",
			qualityFailedRuleIds: expect.arrayContaining([
				"markdown.top-level-heading",
			]),
		});
	});

	it("blocks proposedFiles from blocked draft artifacts", async () => {
		const repositoryRoot = await createApplyRepository();
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "docs-index-draft.json"),
			`${JSON.stringify({
				status: "blocked_pending_codex_context",
				blockedReasons: ["docs-index-missing"],
				proposedFiles: [
					{
						targetRef: "docs/index.md",
						markdown: buildPassingDocsIndexMarkdown(),
					},
				],
			})}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain("blocked draft cannot be applied");
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).rejects.toThrow();
	});

	it("blocks when apply-ready drafts target unapproved paths", async () => {
		const repositoryRoot = await createApplyRepository();
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "bad-draft.json"),
			`${JSON.stringify({
				proposedFiles: [{ targetRef: "package.json", markdown: "{}" }],
			})}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain(
			"target is outside approved docs-spine apply roots",
		);
		await expect(
			readFile(path.join(repositoryRoot, "package.json"), "utf8"),
		).rejects.toThrow();
	});

	it("blocks unrelated run artifacts before apply starts", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeApplyReadyDraft(repositoryRoot);
		await mkdir(path.join(repositoryRoot, ".sbs", "runs", "other-run"), {
			recursive: true,
		});
		await writeFile(
			path.join(repositoryRoot, ".sbs", "runs", "other-run", "proof.json"),
			"{}\n",
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toBe(
			"Worktree has dirty docs-spine targets or unsafe runner artifacts before apply starts.",
		);
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).rejects.toThrow();
	});

	it("allows unrelated pre-existing dirty files outside docs-spine targets", async () => {
		const repositoryRoot = await createApplyRepository();
		const archivedSkillRef = ".codex/skill-archive/power-dialer/SKILL.md";
		await mkdir(path.dirname(path.join(repositoryRoot, archivedSkillRef)), {
			recursive: true,
		});
		await writeFile(
			path.join(repositoryRoot, archivedSkillRef),
			"# Power Dialer Skill\n",
		);
		await execFileAsync("git", ["add", archivedSkillRef], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add archived skill"], {
			cwd: repositoryRoot,
		});
		await rm(path.join(repositoryRoot, archivedSkillRef));
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		const proof = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		);
		const status = await execFileAsync("git", ["status", "--short"], {
			cwd: repositoryRoot,
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		expect(result.touchedFiles).not.toContain(archivedSkillRef);
		expect(proof.preexistingDirtyFileRefs).toEqual([archivedSkillRef]);
		expect(status.stdout).toContain(` D ${archivedSkillRef}`);
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).resolves.toBe(buildPassingDocsIndexMarkdown());
	});

	it("blocks pre-existing dirty docs-spine target files", async () => {
		const repositoryRoot = await createApplyRepository();
		await mkdir(path.join(repositoryRoot, "docs"), { recursive: true });
		await writeFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"# Owner Draft\n\nDo not overwrite yet.\n",
		);
		await execFileAsync("git", ["add", "docs/index.md"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add owner docs index"], {
			cwd: repositoryRoot,
		});
		await writeFile(
			path.join(repositoryRoot, "docs", "index.md"),
			"# Owner Draft\n\nUncommitted owner edit.\n",
		);
		await writeApplyReadyDraft(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toBe(
			"Worktree has dirty docs-spine targets or unsafe runner artifacts before apply starts.",
		);
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).resolves.toBe("# Owner Draft\n\nUncommitted owner edit.\n");
	});

	it("replaces generated dated docs-spine adoption packet files on rerun", async () => {
		const repositoryRoot = await createApplyRepository();
		const planningBriefRef =
			"docs/programs/active/2026-05-06-docs-spine-adoption/planning-brief-1.md";
		await mkdir(path.dirname(path.join(repositoryRoot, planningBriefRef)), {
			recursive: true,
		});
		await writeFile(
			path.join(repositoryRoot, planningBriefRef),
			[
				"---",
				"title: 'Planning Brief 1: Docs Spine Adoption'",
				"program_id: docs-spine-adoption",
				"brief_version: 1",
				"status: current",
				"summary: First planning brief for reviewing the installed docs spine.",
				"read_when:",
				"  - Writing the first child ExecPlan.",
				"---",
				"",
				"# Planning Brief 1: Docs Spine Adoption",
				"",
				"Install the first docs-spine slice for this repository and keep the result aligned with the repository's native instructions, docs, and validation gate.",
				"",
			].join("\n"),
		);
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "program-packet-draft.json"),
			`${JSON.stringify(
				{
					schemaVersion: "docs-spine-program-packet-draft.v1",
					proposedFiles: [
						{
							targetRef: planningBriefRef,
							markdown: [
								"---",
								"title: 'Planning Brief 1: Docs Spine Adoption'",
								"program_id: docs-spine-adoption",
								"brief_version: 1",
								"status: current",
								"summary: Updated generated planning brief.",
								"read_when:",
								"  - Writing the first child ExecPlan.",
								"---",
								"",
								"# Planning Brief 1: Docs Spine Adoption",
								"",
								"Updated generated planning brief.",
								"",
							].join("\n"),
						},
					],
				},
				null,
				2,
			)}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("proof_completed");
		await expect(
			readFile(path.join(repositoryRoot, planningBriefRef), "utf8"),
		).resolves.toBe(
			"---\ntitle: 'Planning Brief 1: Docs Spine Adoption'\nprogram_id: docs-spine-adoption\nbrief_version: 1\nstatus: current\nsummary: Updated generated planning brief.\nread_when:\n  - Writing the first child ExecPlan.\n---\n\n# Planning Brief 1: Docs Spine Adoption\n\nUpdated generated planning brief.\n",
		);
	});

	it("writes current planning brief pointer targets", async () => {
		const repositoryRoot = await createApplyRepository();
		const pointerRef =
			"docs/programs/active/2026-05-06-docs-spine-adoption/current-planning-brief.txt";
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "program-packet-draft.json"),
			`${JSON.stringify(
				{
					schemaVersion: "docs-spine-program-packet-draft.v1",
					proposedFiles: [
						{
							targetRef: pointerRef,
							markdown: "planning-brief-1.md\n",
						},
					],
				},
				null,
				2,
			)}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("proof_completed");
		await expect(
			readFile(path.join(repositoryRoot, pointerRef), "utf8"),
		).resolves.toBe("planning-brief-1.md\n");
	});

	it("allows prior docs-spine adoption run artifacts before apply starts", async () => {
		const repositoryRoot = await createApplyRepository();
		await writeApplyReadyDraft(repositoryRoot);
		await writePriorDocsSpineAdoptionRun(repositoryRoot);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("proof_completed");
		expect(result.proofStatus).toBe("passed");
		await expect(
			readFile(path.join(repositoryRoot, "docs", "index.md"), "utf8"),
		).resolves.toBe(buildPassingDocsIndexMarkdown());
	});

	it("blocks non-approved text targets under approved docs roots", async () => {
		const repositoryRoot = await createApplyRepository();
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "program-draft.json"),
			`${JSON.stringify({
				proposedFiles: [
					{
						targetRef: "docs/programs/active/program.json",
						markdown: "# Program\n",
					},
				],
			})}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain(
			"target must be an approved Markdown file or current planning brief pointer",
		);
		await expect(
			readFile(
				path.join(repositoryRoot, "docs", "programs", "active", "program.json"),
				"utf8",
			),
		).rejects.toThrow();
	});

	it("writes blocked proof when draft JSON is malformed", async () => {
		const repositoryRoot = await createApplyRepository();
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(path.join(draftDirectory, "malformed.json"), "{ invalid\n");

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain("artifact generation failed");
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs",
					"runs",
					"workflowRuns_docs_spine_apply",
					"proof.json",
				),
				"utf8",
			),
		).resolves.toContain('"stage": "artifact-generation"');
	});

	it("blocks apply targets that cross existing symlinks", async () => {
		const repositoryRoot = await createApplyRepository();
		const externalDocsTarget = await createTemporaryDirectory(
			"sbs-docs-spine-apply-external-docs-",
		);
		await symlink(
			externalDocsTarget,
			path.join(repositoryRoot, "docs", "prompts"),
		);
		await execFileAsync("git", ["add", "docs/prompts"], {
			cwd: repositoryRoot,
		});
		await execFileAsync("git", ["commit", "-m", "Add docs symlink"], {
			cwd: repositoryRoot,
		});
		const draftDirectory = path.join(
			repositoryRoot,
			".sbs",
			"docs-spine-adoption",
			"drafts",
		);
		await mkdir(draftDirectory, { recursive: true });
		await writeFile(
			path.join(draftDirectory, "prompt-draft.json"),
			`${JSON.stringify({
				proposedFiles: [
					{
						targetRef: "docs/prompts/README.md",
						markdown: "# Prompts\n",
					},
				],
			})}\n`,
		);

		const result = await runDocsSpineApplyWorkflow({
			repositoryRoot,
			state: createState(),
			credential: createCredential(),
			approvedWorkflowRun: createApprovedWorkflowRun(),
			confirmDocsSpineApply: true,
			now: 1_000,
			fetchRunnerEvent: async () => Response.json({ ok: true }),
		});

		expect(result.status).toBe("blocked");
		expect(result.blockedReason).toContain("artifact generation failed");
		await expect(
			readFile(path.join(externalDocsTarget, "README.md"), "utf8"),
		).rejects.toThrow();
	});
});
