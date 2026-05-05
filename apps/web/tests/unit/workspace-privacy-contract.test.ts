import { afterEach, describe, expect, it, vi } from "vitest";

import {
	createApprovedFindingsDigest,
	stableStringifyApprovedFindingsPayload,
} from "@/convex/workspace/approved_findings_digest";
import {
	approveWorkspaceSyncPreview,
	bindWorkspaceRunner,
	createOrLoadWorkspaceProject,
	ingestWorkspaceRunnerEvent,
	listWorkspaceFindings,
	markWorkspaceFindingsDeleted,
	startWorkspaceDoctorPassRun,
	syncApprovedCodebaseFindings,
} from "@/convex/workspace";
import { createApprovedFindingsDigest as createRunnerApprovedFindingsDigest } from "../../../../packages/local-runner/src/core/doctor-pass/approved-findings-digest";

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

async function createPreviewDigest({
	runId,
	doctorPassRunId,
	findings,
}: {
	runId: string;
	doctorPassRunId: string;
	findings: Array<typeof syncSafeFinding>;
}) {
	return await createApprovedFindingsDigest({
		runId,
		doctorPassRunId,
		findings,
	});
}

async function createApprovedDoctorPassRun({
	approvedFindings = [syncSafeFinding],
	runId = "run-1",
}: {
	approvedFindings?: Array<typeof syncSafeFinding>;
	runId?: string;
} = {}) {
	const testContext = createWorkspaceTestCtx();
	const projectResult = await createOrLoadWorkspaceProject._handler(
		testContext.ctx as never,
		{},
	);
	const runner = await bindWorkspaceRunner._handler(testContext.ctx as never, {
		projectId: projectResult.project._id,
		runnerMode: "daemon",
	});
	const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
		testContext.ctx as never,
		{
			projectId: projectResult.project._id,
			runnerId: runner._id,
			localRunId: runId,
			runnerMode: "daemon",
		},
	);
	const previewDigest = await createPreviewDigest({
		runId,
		doctorPassRunId: doctorPassRun._id,
		findings: approvedFindings,
	});

	await ingestWorkspaceRunnerEvent._handler(testContext.ctx as never, {
		eventId: "evt-sync-preview-ready",
		projectId: projectResult.project._id,
		runnerId: runner._id,
		doctorPassRunId: doctorPassRun._id,
		eventType: "doctor.sync_preview.ready",
		schemaVersion: "workspace.runner-event.v1",
		createdAt: 100,
		payload: {
			eventType: "doctor.sync_preview.ready",
			previewDigest,
			findingsCount: 1,
			excludedArtifactCount: 2,
			localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
		},
	});
	await approveWorkspaceSyncPreview._handler(testContext.ctx as never, {
		projectId: projectResult.project._id,
		doctorPassRunId: doctorPassRun._id,
		previewDigest,
	});

	return {
		...testContext,
		project: projectResult.project,
		doctorPassRun,
		previewDigest,
	};
}

const syncSafeFinding = {
	findingId: "finding-source-truth-readiness",
	rank: 1,
	status: "ready" as const,
	title: "Source truth is ready for a first workflow",
	category: "source_truth" as const,
	severity: "high" as const,
	confidence: 0.91,
	buyerImpact: "Future agent work can use a clearer command and proof map.",
	blastRadius: "low" as const,
	proofPath: "Review the local source-truth readiness report.",
	proofability: "clear" as const,
	permissionRequired: "docs_write" as const,
	recommendedWorkflowId: "source-truth-agent-readiness",
	whyThisNow: "It improves every later local runner workflow.",
	evidenceRefs: [
		{
			kind: "file" as const,
			repoRelativePath: "AGENTS.md",
			lineStart: 1,
			lineEnd: 40,
			summary: "Repo instructions exist and can be audited.",
		},
		{
			kind: "command" as const,
			commandName: "bun run typecheck",
			summary: "Typecheck is a proof candidate.",
		},
	],
	syncSensitivity: "low" as const,
	localReportRef:
		".sbs/reports/doctor-pass/run-1/source-truth-agent-readiness.json",
};

describe("workspace privacy contract", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("uses the same canonical approved-findings digest as the local runner", async () => {
		const runId = "run-canonical";
		const doctorPassRunId = "doctor-run-canonical";
		const reorderedFinding = {
			localReportRef:
				".sbs/reports/doctor-pass/run-canonical/source-truth-agent-readiness.json",
			syncSensitivity: "low" as const,
			blockedReason: undefined,
			evidenceRefs: [
				{
					summary: "Repo instructions exist and can be audited.",
					lineEnd: 40,
					kind: "file" as const,
					lineStart: 1,
					repoRelativePath: "AGENTS.md",
				},
				{
					summary: "Typecheck is a proof candidate.",
					commandName: "bun run typecheck",
					kind: "command" as const,
				},
			],
			whyThisNow: "It improves every later local runner workflow.",
			recommendedWorkflowId: "source-truth-agent-readiness",
			permissionRequired: "docs_write" as const,
			proofability: "clear" as const,
			proofPath: "Review the local source-truth readiness report.",
			blastRadius: "low" as const,
			buyerImpact: "Future agent work can use a clearer command and proof map.",
			confidence: 0.91,
			severity: "high" as const,
			category: "source_truth" as const,
			title: "Source truth is ready for a first workflow",
			status: "ready" as const,
			rank: 1,
			findingId: "finding-source-truth-readiness",
		};

		const backendDigest = await createApprovedFindingsDigest({
			runId,
			doctorPassRunId,
			findings: [reorderedFinding],
		});
		const runnerDigest = createRunnerApprovedFindingsDigest({
			runId,
			doctorPassRunId,
			findings: [reorderedFinding],
		});
		const missingBlockedReasonDigest = await createApprovedFindingsDigest({
			runId,
			doctorPassRunId,
			findings: [syncSafeFinding],
		});
		const undefinedBlockedReasonDigest = await createApprovedFindingsDigest({
			runId,
			doctorPassRunId,
			findings: [{ ...syncSafeFinding, blockedReason: undefined }],
		});

		expect(backendDigest).toBe(runnerDigest);
		expect(missingBlockedReasonDigest).toBe(undefinedBlockedReasonDigest);
		expect(
			stableStringifyApprovedFindingsPayload({
				z: 1,
				a: { missing: undefined, value: "kept" },
			}),
		).toBe('{"a":{"value":"kept"},"z":1}');
	});

	it("syncs only approved structured findings and supports deletion markers", async () => {
		const { ctx, project, doctorPassRun, tables, previewDigest } =
			await createApprovedDoctorPassRun();

		const syncResult = await syncApprovedCodebaseFindings._handler(
			ctx as never,
			{
				projectId: project._id,
				doctorPassRunId: doctorPassRun._id,
				previewDigest,
				findings: [syncSafeFinding],
			},
		);
		const findings = await listWorkspaceFindings._handler(ctx as never, {
			projectId: project._id,
		});
		const deleteResult = await markWorkspaceFindingsDeleted._handler(
			ctx as never,
			{
				projectId: project._id,
				findingDocumentIds: [findings[0]._id],
			},
		);

		expect(syncResult).toMatchObject({
			insertedCount: 1,
			patchedCount: 0,
		});
		expect(findings).toHaveLength(1);
		expect(findings[0]).toMatchObject({
			findingId: "finding-source-truth-readiness",
			title: "Source truth is ready for a first workflow",
			evidenceRefs: [
				expect.objectContaining({
					kind: "file",
					repoRelativePath: "AGENTS.md",
				}),
				expect.objectContaining({
					kind: "command",
					commandName: "bun run typecheck",
				}),
			],
		});
		expect(deleteResult.markedCount).toBe(1);
		expect(tables.codebaseFindings[0]).toMatchObject({
			status: "deleted",
			deletedAt: expect.any(Number),
		});
		await expect(
			listWorkspaceFindings._handler(ctx as never, {
				projectId: project._id,
			}),
		).resolves.toEqual([]);
		await expect(
			listWorkspaceFindings._handler(ctx as never, {
				projectId: project._id,
				status: "deleted",
			}),
		).resolves.toHaveLength(1);
	});

	it("rejects raw source fields, Markdown report bodies, and local absolute paths", async () => {
		const { ctx, project, doctorPassRun, previewDigest } =
			await createApprovedDoctorPassRun();

		await expect(
			syncApprovedCodebaseFindings._handler(
				ctx as never,
				{
					projectId: project._id,
					doctorPassRunId: doctorPassRun._id,
					previewDigest,
					findings: [
						{
							...syncSafeFinding,
							sourceExcerpt: "const secret = process.env.STRIPE_SECRET_KEY",
						},
					],
				} as never,
			),
		).rejects.toThrow("sourceExcerpt");

		await expect(
			syncApprovedCodebaseFindings._handler(
				ctx as never,
				{
					projectId: project._id,
					doctorPassRunId: doctorPassRun._id,
					previewDigest,
					findings: [
						{
							...syncSafeFinding,
							markdownReport: "# Full local report\n\nDo not sync this.",
						},
					],
				} as never,
			),
		).rejects.toThrow("markdownReport");

		const localPathFinding = {
			...syncSafeFinding,
			findingId: "finding-local-path",
			evidenceRefs: [
				{
					kind: "file" as const,
					repoRelativePath: "/Users/customer/app/page.tsx",
				},
			],
		};
		const localPathRun = await createApprovedDoctorPassRun({
			approvedFindings: [localPathFinding],
			runId: "run-local-path",
		});
		await expect(
			syncApprovedCodebaseFindings._handler(localPathRun.ctx as never, {
				projectId: localPathRun.project._id,
				doctorPassRunId: localPathRun.doctorPassRun._id,
				previewDigest: localPathRun.previewDigest,
				findings: [localPathFinding],
			}),
		).rejects.toThrow("local absolute path");

		const embeddedLocalPathFinding = {
			...syncSafeFinding,
			findingId: "finding-embedded-local-path",
			buyerImpact:
				"Probe failed at /Users/customer/app/src/page.tsx during setup.",
		};
		const embeddedLocalPathRun = await createApprovedDoctorPassRun({
			approvedFindings: [embeddedLocalPathFinding],
			runId: "run-embedded-local-path",
		});
		await expect(
			syncApprovedCodebaseFindings._handler(embeddedLocalPathRun.ctx as never, {
				projectId: embeddedLocalPathRun.project._id,
				doctorPassRunId: embeddedLocalPathRun.doctorPassRun._id,
				previewDigest: embeddedLocalPathRun.previewDigest,
				findings: [embeddedLocalPathFinding],
			}),
		).rejects.toThrow("local absolute path");
	});

	it("rejects public findings sync when fields differ from the approved digest", async () => {
		const { ctx, project, doctorPassRun, previewDigest } =
			await createApprovedDoctorPassRun();

		await expect(
			syncApprovedCodebaseFindings._handler(ctx as never, {
				projectId: project._id,
				doctorPassRunId: doctorPassRun._id,
				previewDigest,
				findings: [
					{
						...syncSafeFinding,
						permissionRequired: "provider_access",
					},
				],
			}),
		).rejects.toThrow("approved preview");
	});

	it("does not let another entitled viewer read a workspace project by id", async () => {
		const { project, tables } = await createApprovedDoctorPassRun();
		tables.productAccessGrants.push({
			_id: "product_access_other",
			_creationTime: 2,
			clerkUserId: "user_other_workspace",
			status: "granted",
			source: "manual",
			buyerStartingPoint: "existing_codebase",
			checkoutCtaId: "unspecified",
			fulfillmentTrack: "existing_codebase_doctor",
			grantedAt: 2,
			updatedAt: 2,
		});
		const otherViewer = createWorkspaceTestCtx({
			clerkUserId: "user_other_workspace",
			tables,
		});

		await expect(
			listWorkspaceFindings._handler(otherViewer.ctx as never, {
				projectId: project._id,
			}),
		).rejects.toThrow("Workspace project not found");
		expect(otherViewer.db.query).not.toHaveBeenCalledWith("projectDefinitions");
	});
});
