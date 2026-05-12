import { afterEach, describe, expect, it, vi } from "vitest";

import {
	bindWorkspaceRepository,
	bindWorkspaceRunner,
	createOrLoadWorkspaceProject,
	getWorkspaceProjectState,
	getWorkspaceSetupState,
	prepareWorkspaceSetupPairing,
	startWorkspaceDoctorPassRun,
} from "@/convex/workspace";

import { createWorkspaceTestCtx } from "./workspace-test-helpers";

describe("workspace data model", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("requires existing product access before creating workspace state", async () => {
		const { ctx } = createWorkspaceTestCtx({ hasAccess: false });

		await expect(
			createOrLoadWorkspaceProject._handler(ctx as never, {
				displayName: "Customer repo",
			}),
		).rejects.toThrow("Access required");
	});

	it("rejects grants without Worker capability from existing-codebase workspace state", async () => {
		const { ctx } = createWorkspaceTestCtx({
			capabilities: ["generate_codebase"],
		});

		await expect(
			prepareWorkspaceSetupPairing._handler(ctx as never, {
				runnerMode: "daemon",
			}),
		).rejects.toThrow("Existing codebase access required");
		await expect(
			createOrLoadWorkspaceProject._handler(ctx as never, {
				displayName: "Customer repo",
			}),
		).rejects.toThrow("Existing codebase access required");
	});

	it("creates existing-codebase workspace state without touching generated-codebase tables", async () => {
		const { ctx, tables } = createWorkspaceTestCtx();

		vi.spyOn(Date, "now").mockReturnValue(10_000);

		const result = await createOrLoadWorkspaceProject._handler(ctx as never, {
			displayName: "Customer repo",
			defaultOpenDestination: "vscode",
		});

		expect(result.created).toBe(true);
		expect(result.project).toMatchObject({
			clerkUserId: "user_workspace_123",
			displayName: "Customer repo",
			fulfillmentTrack: "existing_codebase_doctor",
			status: "active",
			defaultOpenDestination: "vscode",
			syncPolicy: {
				rawSource: "disabled",
				rawTerminalLogs: "disabled",
				codexTranscripts: "disabled",
				screenshots: "disabled",
				structuredFindings: "approval_required",
			},
		});
		expect(tables.workspaceProjects).toHaveLength(1);
		expect(tables.projectDefinitions).toHaveLength(0);
		expect(tables.codebaseWorkflowStates).toHaveLength(0);
	});

	it("loads runner, repository, and doctor-pass summaries from workspace tables", async () => {
		const { ctx } = createWorkspaceTestCtx();

		const projectResult = await createOrLoadWorkspaceProject._handler(
			ctx as never,
			{},
		);
		const runner = await bindWorkspaceRunner._handler(ctx as never, {
			projectId: projectResult.project._id,
			runnerMode: "daemon",
			runnerLabel: "MacBook runner",
			machineDisplayName: "Parker MacBook",
			runnerVersion: "0.1.0",
		});
		const repository = await bindWorkspaceRepository._handler(ctx as never, {
			projectId: projectResult.project._id,
			runnerId: runner._id,
			displayName: "ship-by-sunday",
			provider: "github",
			remoteHost: "github.com",
			remoteOwner: "Man-Meets-AI",
			remoteName: "ship-by-sunday",
			defaultBranch: "main",
			packageManager: "bun",
		});
		const doctorPassRun = await startWorkspaceDoctorPassRun._handler(
			ctx as never,
			{
				projectId: projectResult.project._id,
				runnerId: runner._id,
				repositoryBindingId: repository._id,
				runnerMode: "daemon",
			},
		);

		const state = await getWorkspaceProjectState._handler(ctx as never, {
			projectId: projectResult.project._id,
		});

		expect(state.project?._id).toBe(projectResult.project._id);
		expect(state.runnerBindings).toHaveLength(1);
		expect(state.runnerBindings[0]).toMatchObject({
			_id: runner._id,
			status: "paired",
			pairingStatus: "paired",
		});
		expect(state.repositoryBinding).toMatchObject({
			_id: repository._id,
			displayName: "ship-by-sunday",
			remoteHost: "github.com",
		});
		expect(state.latestDoctorPassRun).toMatchObject({
			_id: doctorPassRun._id,
			status: "running",
			syncPreviewStatus: "not_ready",
		});
	});

	it("prepares a durable setup pairing token and command from workspace state", async () => {
		const { ctx } = createWorkspaceTestCtx();
		vi.spyOn(Date, "now").mockReturnValue(20_000);
		vi.spyOn(crypto, "randomUUID").mockReturnValue(
			"11111111-2222-4333-8444-555555555555",
		);

		const setupState = await prepareWorkspaceSetupPairing._handler(
			ctx as never,
			{
				runnerMode: "daemon",
			},
		);

		expect(setupState.project?.displayName).toBe("Existing codebase Worker");
		expect(setupState.runnerBindings[0]).toMatchObject({
			status: "pairing",
			pairingStatus: "waiting",
			runnerMode: "daemon",
			runnerLabel: "Local daemon",
			pairingToken: "sbs_pair_111111112222_4333844455555555",
			pairingTokenExpiresAt: 1_820_000,
		});
		expect(setupState.pairingCommand).toMatchObject({
			token: "sbs_pair_111111112222_4333844455555555",
			primaryCommand:
				"bunx ship-by-sunday setup pair sbs_pair_111111112222_4333844455555555 --repo .",
			fallbackCommand:
				"npx ship-by-sunday setup pair sbs_pair_111111112222_4333844455555555 --repo .",
		});

		const loadedState = await getWorkspaceSetupState._handler(ctx as never, {
			projectId: setupState.project?._id,
		});

		expect(loadedState.pairingCommand?.primaryCommand).toBe(
			setupState.pairingCommand?.primaryCommand,
		);
	});
});
