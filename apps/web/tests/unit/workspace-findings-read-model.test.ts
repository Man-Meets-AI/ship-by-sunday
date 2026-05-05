import { describe, expect, it } from "vitest";

import {
	buildWorkspaceFindingDetailModel,
	buildWorkspaceFindingsLedgerModel,
	type WorkspaceFindingDocument,
} from "@/app/(workspace)/_lib/workspace-findings-read-model";

function createFinding(
	overrides: Partial<WorkspaceFindingDocument> = {},
): WorkspaceFindingDocument {
	return {
		_id: "codebaseFindings_1",
		findingId: "finding-source-truth-readiness",
		rank: 1,
		status: "needs_approval",
		title: "Source truth needs the first workflow",
		category: "source_truth",
		severity: "high",
		confidence: 0.91,
		buyerImpact: "Later agent work needs a clearer command and proof map.",
		blastRadius: "low",
		proofPath: "Review the source-truth readiness artifact.",
		proofability: "clear",
		permissionRequired: "docs_write",
		recommendedWorkflowId: "source-truth-agent-readiness",
		whyThisNow: "It improves every later local workflow.",
		evidenceRefs: [
			{
				kind: "file",
				repoRelativePath: "AGENTS.md",
				lineStart: 1,
				lineEnd: 40,
				summary: 'export const runtime = "edge";',
			},
			{
				kind: "command",
				commandName: "bun run typecheck",
				summary: "Typecheck is a proof candidate.",
			},
		],
		syncSensitivity: "low",
		localReportRef:
			".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
		...overrides,
	};
}

describe("workspace findings read model", () => {
	it("sorts uploaded findings, hides deleted rows, and marks one recommended first", () => {
		const model = buildWorkspaceFindingsLedgerModel([
			createFinding({
				_id: "codebaseFindings_2",
				findingId: "finding-observability",
				rank: 2,
				status: "ready",
				title: "Observability proof is thin",
				category: "observability",
				recommendedWorkflowId: "observability-debuggability",
			}),
			createFinding(),
			createFinding({
				_id: "codebaseFindings_deleted",
				findingId: "finding-deleted",
				rank: 3,
				status: "deleted",
				title: "Deleted finding",
			}),
		]);

		expect(model.totalCount).toBe(2);
		expect(model.rows.map((row) => row.findingId)).toEqual([
			"finding-source-truth-readiness",
			"finding-observability",
		]);
		expect(model.recommendedFirst?.findingId).toBe(
			"finding-source-truth-readiness",
		);
		expect(model.rows.filter((row) => row.recommendedFirst)).toHaveLength(1);
		expect(model.categoryOptions).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ value: "source_truth", count: 1 }),
				expect.objectContaining({ value: "observability", count: 1 }),
			]),
		);
	});

	it("filters by category and status without changing the underlying rows", () => {
		const findings = [
			createFinding(),
			createFinding({
				_id: "codebaseFindings_2",
				findingId: "finding-observability",
				rank: 2,
				status: "ready",
				category: "observability",
				title: "Observability proof is thin",
			}),
		];

		const model = buildWorkspaceFindingsLedgerModel(findings, {
			category: "observability",
			status: "ready",
		});

		expect(model.totalCount).toBe(2);
		expect(model.filteredCount).toBe(1);
		expect(model.rows[0]).toMatchObject({
			findingId: "finding-observability",
			categoryLabel: "Observability",
			statusLabel: "ready",
		});
	});

	it("builds a privacy-safe decision model for a finding detail route", () => {
		const detail = buildWorkspaceFindingDetailModel(
			[createFinding()],
			"finding-source-truth-readiness",
			Date.UTC(2026, 4, 4, 21, 0),
		);

		expect(detail).toMatchObject({
			title: "Source truth needs the first workflow",
			recommendedWorkflowLabel: "Source Truth Agent Readiness",
			permissionRequiredLabel: "Docs write",
			blastRadiusLabel: "Low blast radius",
			syncSensitivityLabel: "Low sensitivity",
			copyEvidenceRef: "AGENTS.md:1-40",
		});
		expect(detail?.evidenceRefs).toEqual([
			expect.objectContaining({
				kindLabel: "File ref",
				refLabel: "AGENTS.md:1-40",
			}),
			expect.objectContaining({
				kindLabel: "Command ref",
				refLabel: "bun run typecheck",
			}),
		]);
		expect(detail?.allowedTouchTargets).toContain(
			".sbs/runs/<workflow-run-id> workflow artifacts",
		);
		expect(detail?.disallowedTouchTargets).toContain("environment files");
		expect(detail?.workflowApproval).toMatchObject({
			workflowId: "source-truth-agent-readiness",
			workflowVersion: "v1",
			branchName: "sbs/source-truth-readiness-20260504-2100",
			profileName: "sbs-workspace-write",
			writeLeaseDurationMinutes: 30,
			dirtyStatePolicy: "require_clean_worktree",
		});
		expect(detail?.workflowApproval.proofCommands).toEqual([
			"git status --short",
			"git diff --name-only",
			"git diff --check",
		]);

		const renderedText = JSON.stringify(detail).toLowerCase();
		expect(renderedText).not.toContain("export const runtime");
		expect(renderedText).not.toContain("typecheck is a proof candidate");
		expect(renderedText).not.toContain("raw source");
		expect(renderedText).not.toContain("raw terminal");
		expect(renderedText).not.toContain("transcript");
	});

	it("builds broken-app triage as read-only diagnostics before patch approval", () => {
		const detail = buildWorkspaceFindingDetailModel(
			[
				createFinding({
					findingId: "finding-broken-app",
					category: "broken_app",
					title: "Checkout route is failing",
					permissionRequired: "workspace_write",
					recommendedWorkflowId: "broken-app-triage",
				}),
			],
			"finding-broken-app",
			Date.UTC(2026, 4, 4, 21, 0),
		);

		expect(detail?.workflowApproval).toMatchObject({
			workflowId: "broken-app-triage",
			workflowKind: "broken_app_readonly",
			branchName: "sbs/broken-app-triage-20260504-2100",
			profileName: "sbs-doctor-readonly",
			proofCommands: ["git status --short", "git diff --name-only"],
		});
		expect(detail?.workflowApproval.expectedOutputs).toContain(
			"patch approval boundary for a later write phase",
		);
		expect(detail?.workflowApproval.allowedTouchTargets).toEqual(
			expect.arrayContaining([
				".sbs/runs/<workflow-run-id> workflow artifacts",
			]),
		);
	});

	it("builds observability debuggability as a bounded local audit", () => {
		const detail = buildWorkspaceFindingDetailModel(
			[
				createFinding({
					findingId: "finding-observability",
					category: "observability",
					title: "Production errors are opaque",
					permissionRequired: "workspace_write",
					recommendedWorkflowId: "observability-debuggability",
				}),
			],
			"finding-observability",
			Date.UTC(2026, 4, 5, 10, 0),
		);

		expect(detail?.workflowApproval).toMatchObject({
			workflowId: "observability-debuggability",
			workflowKind: "observability_debuggability",
			workflowCommandName: "observability-debuggability",
			confirmationFlag: "--confirm-observability-audit",
			branchName: "sbs/observability-debuggability-20260505-1000",
			profileName: "sbs-workspace-write",
			proofCommands: [
				"git status --short",
				"git diff --name-only",
				"git diff --check",
			],
		});
		expect(detail?.workflowApproval.expectedOutputs).toContain(
			"sync-safe debuggability audit",
		);
		expect(detail?.workflowApproval.allowedTouchTargets).toEqual(
			expect.arrayContaining([
				".sbs/observability debuggability audit artifacts",
			]),
		);
		expect(detail?.workflowApproval.stopConditions.join(" ")).toContain(
			"provider setup",
		);
	});

	it("builds mature repo adoption as a .sbs-only adoption packet", () => {
		const detail = buildWorkspaceFindingDetailModel(
			[
				createFinding({
					findingId: "finding-mature-adoption",
					category: "other",
					title: "Mature repo needs an adoption packet",
					permissionRequired: "workspace_write",
					recommendedWorkflowId: "mature-repo-adoption",
				}),
			],
			"finding-mature-adoption",
			Date.UTC(2026, 4, 5, 11, 0),
		);

		expect(detail?.workflowApproval).toMatchObject({
			workflowId: "mature-repo-adoption",
			workflowKind: "mature_repo_adoption",
			workflowCommandName: "mature-repo-adoption",
			confirmationFlag: "--confirm-adoption-audit",
			branchName: "sbs/mature-repo-adoption-20260505-1100",
			profileName: "sbs-workspace-write",
			proofCommands: [
				"git status --short",
				"git diff --name-only",
				"git diff --check",
			],
		});
		expect(detail?.workflowApproval.expectedOutputs).toEqual(
			expect.arrayContaining([
				"sync-safe repo convention audit",
				"adoption Program packet draft",
				"first child ExecPlan draft",
			]),
		);
		expect(detail?.workflowApproval.allowedTouchTargets).toEqual(
			expect.arrayContaining([
				".sbs/runs/<workflow-run-id>/**",
				".sbs/mature-repo/**",
				"repo convention metadata only",
			]),
		);
		expect(detail?.workflowApproval.disallowedTouchTargets).toEqual(
			expect.arrayContaining([
				"branch pushes",
				"pull requests",
				"raw logs",
				"raw source",
				"Codex transcripts",
			]),
		);
		expect(detail?.workflowApproval.stopConditions.join(" ")).toContain(
			"generated-starter rewrites",
		);
	});

	it("does not build detail state for deleted or missing findings", () => {
		expect(
			buildWorkspaceFindingDetailModel(
				[createFinding({ status: "deleted" })],
				"finding-source-truth-readiness",
			),
		).toBeNull();
		expect(buildWorkspaceFindingDetailModel([createFinding()], "missing")).toBe(
			null,
		);
	});
});
