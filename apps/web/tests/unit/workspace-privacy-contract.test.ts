import { afterEach, describe, expect, it, vi } from "vitest";

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

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

async function createApprovedDoctorPassRun() {
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
			runnerMode: "daemon",
		},
	);

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
			previewDigest: "sha256:approved-preview",
			findingsCount: 1,
			excludedArtifactCount: 2,
			localReportRef: ".sbs/reports/doctor-pass/run-1/sync-preview.json",
		},
	});
	await approveWorkspaceSyncPreview._handler(testContext.ctx as never, {
		projectId: projectResult.project._id,
		doctorPassRunId: doctorPassRun._id,
		previewDigest: "sha256:approved-preview",
	});

	return {
		...testContext,
		project: projectResult.project,
		doctorPassRun,
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

	it("syncs only approved structured findings and supports deletion markers", async () => {
		const { ctx, project, doctorPassRun, tables } =
			await createApprovedDoctorPassRun();

		const syncResult = await syncApprovedCodebaseFindings._handler(
			ctx as never,
			{
				projectId: project._id,
				doctorPassRunId: doctorPassRun._id,
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
		const { ctx, project, doctorPassRun } = await createApprovedDoctorPassRun();

		await expect(
			syncApprovedCodebaseFindings._handler(
				ctx as never,
				{
					projectId: project._id,
					doctorPassRunId: doctorPassRun._id,
					findings: [
						{
							...syncSafeFinding,
							findingId: "finding-raw-source",
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
					findings: [
						{
							...syncSafeFinding,
							findingId: "finding-markdown-report",
							markdownReport: "# Full local report\n\nDo not sync this.",
						},
					],
				} as never,
			),
		).rejects.toThrow("markdownReport");

		await expect(
			syncApprovedCodebaseFindings._handler(ctx as never, {
				projectId: project._id,
				doctorPassRunId: doctorPassRun._id,
				findings: [
					{
						...syncSafeFinding,
						findingId: "finding-local-path",
						evidenceRefs: [
							{
								kind: "file",
								repoRelativePath: "/Users/customer/app/page.tsx",
							},
						],
					},
				],
			}),
		).rejects.toThrow("local absolute path");

		await expect(
			syncApprovedCodebaseFindings._handler(ctx as never, {
				projectId: project._id,
				doctorPassRunId: doctorPassRun._id,
				findings: [
					{
						...syncSafeFinding,
						findingId: "finding-embedded-local-path",
						buyerImpact:
							"Probe failed at /Users/customer/app/src/page.tsx during setup.",
					},
				],
			}),
		).rejects.toThrow("local absolute path");
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
