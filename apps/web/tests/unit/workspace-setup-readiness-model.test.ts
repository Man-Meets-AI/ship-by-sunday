import { describe, expect, it } from "vitest";

import {
	buildExistingCodebaseWorkspaceLocalNavModel,
	buildWorkspaceSetupReadinessModel,
	type SetupCheckScope,
	type SetupReadinessCheck,
	type WorkspaceSetupState,
} from "@/app/(app)/_lib/workspace-setup-readiness-model";
import { routeConfig } from "@/config/product";

const now = 1_000_000;

function createSetupState(
	overrides: Partial<WorkspaceSetupState> = {},
): WorkspaceSetupState {
	return {
		project: {
			_id: "workspaceProjects_1",
			displayName: "Customer repo",
			defaultOpenDestination: "cursor",
			machineSetupStatus: "unknown",
			projectSetupStatus: "unknown",
		},
		runnerBindings: [
			{
				_id: "workspaceRunnerBindings_1",
				status: "pairing",
				pairingStatus: "waiting",
				runnerMode: "daemon",
				runnerLabel: "Local daemon",
				machineHealthStatus: "unknown",
				projectHealthStatus: "unknown",
				pairingTokenExpiresAt: now + 900_000,
			},
		],
		activeRunner: null,
		repositoryBinding: null,
		latestDoctorPassRun: null,
		setupEvents: [],
		pairingCommand: {
			runnerId: "workspaceRunnerBindings_1",
			token: "sbs_pair_test_token",
			tokenExpiresAt: now + 900_000,
			primaryCommand:
				"bunx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			fallbackCommand:
				"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
		},
		...overrides,
	};
}

function findRow(
	model: ReturnType<typeof buildWorkspaceSetupReadinessModel>,
	rowId: string,
): SetupReadinessCheck {
	for (const section of model.sections) {
		const row = section.rows.find((candidate) => candidate.id === rowId);
		if (row) {
			return row;
		}
	}

	throw new Error(`Missing row ${rowId}`);
}

function completedSetupEvent({
	scope,
	checkKey,
	status = "ready",
	summary = `${checkKey} is ready.`,
	remediationAction,
}: {
	scope: SetupCheckScope;
	checkKey: string;
	status?: "blocked" | "warning" | "ready";
	summary?: string;
	remediationAction?: string;
}): WorkspaceSetupState["setupEvents"][number] {
	return {
		eventType: "setup.check.completed",
		createdAt: now - 1_000,
		payload: {
			eventType: "setup.check.completed",
			scope,
			checkKey,
			status,
			summary,
			...(remediationAction ? { remediationAction } : undefined),
		},
	};
}

function requiredReadySetupEvents() {
	return [
		completedSetupEvent({ scope: "machine", checkKey: "codex_auth" }),
		completedSetupEvent({ scope: "machine", checkKey: "gh_auth" }),
		completedSetupEvent({ scope: "machine", checkKey: "sbs_profiles" }),
		completedSetupEvent({ scope: "machine", checkKey: "codex_config" }),
		completedSetupEvent({ scope: "machine", checkKey: "daemon_health" }),
		completedSetupEvent({ scope: "project", checkKey: "repo_root" }),
		completedSetupEvent({ scope: "project", checkKey: "git_remote" }),
		completedSetupEvent({ scope: "project", checkKey: "read_only_mode" }),
	];
}

function pairedRunner() {
	return {
		_id: "workspaceRunnerBindings_1",
		status: "paired" as const,
		pairingStatus: "paired" as const,
		runnerMode: "daemon" as const,
		runnerLabel: "Local daemon",
		machineDisplayName: "Parker MacBook",
		machineHealthStatus: "ready" as const,
		projectHealthStatus: "ready" as const,
		lastHeartbeatAt: now - 10_000,
	};
}

describe("workspace setup readiness model", () => {
	it("derives the waiting pairing command and blocks doctor pass on blockers", () => {
		const model = buildWorkspaceSetupReadinessModel(createSetupState(), now);

		expect(model.pairing.statusLabel).toBe("waiting");
		expect(model.pairing.primaryCommand).toBe(
			"bunx ship-by-sunday setup pair sbs_pair_test_token --repo .",
		);
		expect(model.pairing.fallbackCommand).toBe(
			"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
		);
		expect(model.pairing.tokenExpiresLabel).toBe(
			"Pairing token expires in 15 min.",
		);
		expect(model.doctorPassAction.disabled).toBe(true);
		expect(model.doctorPassAction.disabledReason).toContain("blockers");
		expect(findRow(model, "codex_auth").status).toBe("blocked");
		expect(findRow(model, "codex_config_backup").status).toBe("warning");
		expect(findRow(model, "dirty_state").status).toBe("warning");
	});

	it("keeps warnings visible while allowing the doctor pass when blockers clear", () => {
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "ready" as const,
			projectHealthStatus: "ready" as const,
			lastHeartbeatAt: now - 10_000,
		};
		const model = buildWorkspaceSetupReadinessModel(
			createSetupState({
				project: {
					_id: "workspaceProjects_1",
					displayName: "Customer repo",
					defaultOpenDestination: "vscode",
					machineSetupStatus: "ready",
					projectSetupStatus: "ready",
				},
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				repositoryBinding: {
					displayName: "customer-app",
					provider: "github",
					remoteHost: "github.com",
					remoteOwner: "customer",
					remoteName: "app",
					defaultBranch: "main",
					packageManager: "bun",
				},
				setupEvents: [
					...requiredReadySetupEvents(),
					completedSetupEvent({
						scope: "project",
						checkKey: "dirty_state",
						status: "warning",
						summary: "The working tree has local changes.",
						remediationAction: "Review or checkpoint local changes.",
					}),
				],
				pairingCommand: null,
			}),
			now,
		);

		expect(model.pairing.statusLabel).toBe("paired");
		expect(model.repositoryLabel).toBe("customer/app");
		expect(model.doctorPassAction.disabled).toBe(false);
		expect(findRow(model, "dirty_state")).toMatchObject({
			status: "warning",
			cause: "The working tree has local changes.",
		});
	});

	it("uses latest runner check events by canonical check key", () => {
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "warning" as const,
			projectHealthStatus: "warning" as const,
			lastEventAt: now - 500,
		};
		const olderBlockedGithubAuth = completedSetupEvent({
			scope: "machine",
			checkKey: "github-auth",
			status: "blocked",
			summary: "GitHub CLI auth is missing.",
		});
		const newerReadyGithubAuth = completedSetupEvent({
			scope: "machine",
			checkKey: "github-auth",
			status: "ready",
			summary: "GitHub CLI auth is ready.",
		});
		newerReadyGithubAuth.createdAt = now - 100;
		const codexAuthWarning = completedSetupEvent({
			scope: "machine",
			checkKey: "codex-auth",
			status: "warning",
			summary: "Codex auth has warnings.",
		});
		codexAuthWarning.createdAt = now - 100;
		const codexConfigWarning = completedSetupEvent({
			scope: "machine",
			checkKey: "sbs-codex-config",
			status: "warning",
			summary: "Codex config has warnings.",
		});
		codexConfigWarning.createdAt = now - 100;
		const dirtyStateWarning = completedSetupEvent({
			scope: "project",
			checkKey: "git-worktree-state",
			status: "warning",
			summary: "Git worktree has local changes.",
		});
		dirtyStateWarning.createdAt = now - 100;
		const model = buildWorkspaceSetupReadinessModel(
			createSetupState({
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				setupEvents: [
					...requiredReadySetupEvents(),
					olderBlockedGithubAuth,
					newerReadyGithubAuth,
					codexAuthWarning,
					codexConfigWarning,
					completedSetupEvent({
						scope: "project",
						checkKey: "git-repository",
					}),
					completedSetupEvent({
						scope: "project",
						checkKey: "git-origin",
					}),
					dirtyStateWarning,
					completedSetupEvent({
						scope: "project",
						checkKey: "package-manager",
					}),
				],
				pairingCommand: null,
			}),
			now,
		);

		expect(findRow(model, "gh_auth")).toMatchObject({
			status: "ready",
			summary: "GitHub CLI auth is ready.",
		});
		expect(findRow(model, "codex_auth").status).toBe("warning");
		expect(findRow(model, "codex_config").status).toBe("warning");
		expect(findRow(model, "dirty_state").status).toBe("warning");
		expect(
			model.sections.find((section) => section.id === "machine")?.status,
		).toBe("warning");
		expect(
			model.sections.find((section) => section.id === "project")?.status,
		).toBe("warning");
		expect(model.doctorPassAction.disabled).toBe(false);
		expect(model.doctorPassAction.disabledReason).toBeNull();
	});

	it("does not use section-level ready fallbacks for missing required checks", () => {
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "ready" as const,
			projectHealthStatus: "ready" as const,
			lastHeartbeatAt: now - 10_000,
		};
		const model = buildWorkspaceSetupReadinessModel(
			createSetupState({
				project: {
					_id: "workspaceProjects_1",
					displayName: "Customer repo",
					defaultOpenDestination: "vscode",
					machineSetupStatus: "ready",
					projectSetupStatus: "ready",
				},
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				setupEvents: [
					completedSetupEvent({
						scope: "machine",
						checkKey: "codex_auth",
					}),
					completedSetupEvent({
						scope: "project",
						checkKey: "repo_root",
					}),
				],
				pairingCommand: null,
			}),
			now,
		);

		expect(findRow(model, "codex_auth").status).toBe("ready");
		expect(findRow(model, "repo_root").status).toBe("ready");
		expect(findRow(model, "gh_auth").status).toBe("blocked");
		expect(findRow(model, "sbs_profiles").status).toBe("blocked");
		expect(findRow(model, "read_only_mode").status).toBe("warning");
		expect(model.doctorPassAction.disabled).toBe(true);
	});

	it("keeps blocked rows concrete with cause, impact, local action, and retry", () => {
		const model = buildWorkspaceSetupReadinessModel(
			createSetupState({
				setupEvents: [
					{
						eventType: "setup.check.completed",
						createdAt: now - 1_000,
						payload: {
							eventType: "setup.check.completed",
							scope: "machine",
							checkKey: "sbs_profiles",
							status: "blocked",
							summary: "SBS Codex profiles are missing.",
							remediationAction: "Preview the SBS-managed profile diff.",
						},
					},
				],
			}),
			now,
		);
		const row = findRow(model, "sbs_profiles");

		expect(row.status).toBe("blocked");
		if (row.status !== "blocked") {
			throw new Error("Expected blocked row");
		}
		expect(row.cause).toBe("SBS Codex profiles are missing.");
		expect(row.blocksBecause).toContain("read-only profile");
		expect(row.localAction).toBe("Preview the SBS-managed profile diff.");
		expect(row.localActionButton.label).toBe("Preview diff");
		expect(row.retryAction.label).toBe("Run setup check locally");
	});

	it.each([
		["waiting", "waiting"],
		["runner_detected", "runner detected"],
		["verifying_machine", "verifying machine"],
		["verifying_project", "verifying project"],
		["paired", "paired"],
	] as const)(
		"maps pairing state %s to the expected label",
		(status, label) => {
			const model = buildWorkspaceSetupReadinessModel(
				createSetupState({
					runnerBindings: [
						{
							_id: "workspaceRunnerBindings_1",
							status: status === "paired" ? "paired" : "pairing",
							pairingStatus: status,
							runnerMode: "daemon",
							runnerLabel: "Local daemon",
							machineHealthStatus: "unknown",
							projectHealthStatus: "unknown",
							pairingTokenExpiresAt: now + 900_000,
						},
					],
					activeRunner:
						status === "paired"
							? {
									_id: "workspaceRunnerBindings_1",
									status: "paired",
									pairingStatus: "paired",
									runnerMode: "daemon",
									runnerLabel: "Local daemon",
									machineHealthStatus: "ready",
									projectHealthStatus: "ready",
								}
							: null,
				}),
				now,
			);

			expect(model.pairing.statusLabel).toBe(label);
		},
	);

	it("gates Worker install until pairing completes", () => {
		const model = buildWorkspaceSetupReadinessModel(
			createSetupState({
				setupEvents: [
					{
						eventType: "worker.install.completed",
						createdAt: now - 1_000,
						payload: {
							eventType: "worker.install.completed",
							outcome: "installed",
							status: "installed",
							summary: "Worker Foundations installed.",
							branch: "shipbysunday/install",
							commitHash: "abc1234",
							reportRef: "docs/worker/install-report.md",
							createdRefs: ["apps/worker"],
							changedRefs: ["README.md"],
							proofCommandResults: [
								{ commandLabel: "bun run worker:test", status: "passed" },
							],
						},
					},
				],
			}),
			now,
		);

		expect(model.workerInstall).toMatchObject({
			status: "waiting",
			statusLabel: "waiting on pairing",
			gated: true,
			description:
				"Pair the local runner before copying install commands. The install stage is shown now so the local Worker handoff stays visible.",
			previewCommand:
				"bunx ship-by-sunday install --repo . --dry-run --json --no-kickoff",
			installCommand:
				"bunx ship-by-sunday install --repo . --yes --json --no-kickoff",
			branchLabel: "shipbysunday/install",
			reportRef: null,
			createdRefs: [],
		});
	});

	it("marks Worker install ready after pairing before any install sync", () => {
		const runner = pairedRunner();
		const model = buildWorkspaceSetupReadinessModel(
			createSetupState({
				runnerBindings: [runner],
				activeRunner: runner,
				pairingCommand: null,
			}),
			now,
		);

		expect(model.workerInstall).toMatchObject({
			status: "ready",
			statusLabel: "ready to install",
			gated: false,
			latestSyncedLabel: "No install runner sync yet",
		});
	});

	it("derives Worker install preview, installed, and blocked states from runner events", () => {
		const runner = pairedRunner();
		const previewed = buildWorkspaceSetupReadinessModel(
			createSetupState({
				runnerBindings: [runner],
				activeRunner: runner,
				setupEvents: [
					{
						eventType: "worker.install.previewed",
						createdAt: now - 1_000,
						payload: {
							eventType: "worker.install.previewed",
							outcome: "ready",
							status: "ready",
							summary: "Worker Foundations install is ready.",
							branch: "shipbysunday/install",
							reportRef: "docs/worker/install-report.md",
							createdRefs: ["apps/worker"],
							changedRefs: ["README.md"],
							proofCommandResults: [],
						},
					},
				],
				pairingCommand: null,
			}),
			now,
		);
		const installed = buildWorkspaceSetupReadinessModel(
			createSetupState({
				runnerBindings: [runner],
				activeRunner: runner,
				setupEvents: [
					{
						eventType: "worker.install.completed",
						createdAt: now - 500,
						payload: {
							eventType: "worker.install.completed",
							outcome: "installed",
							status: "installed",
							summary: "Worker Foundations installed.",
							branch: "shipbysunday/install",
							commitHash: "abc123def456",
							reportRef: "docs/worker/install-report.md",
							createdRefs: ["apps/worker"],
							changedRefs: ["README.md", "AGENTS.md", "package.json"],
							proofCommandResults: [
								{ commandLabel: "bun run docs:validate", status: "passed" },
							],
						},
					},
				],
				pairingCommand: null,
			}),
			now,
		);
		const blocked = buildWorkspaceSetupReadinessModel(
			createSetupState({
				runnerBindings: [runner],
				activeRunner: runner,
				setupEvents: [
					{
						eventType: "worker.install.blocked",
						createdAt: now - 250,
						payload: {
							eventType: "worker.install.blocked",
							outcome: "blocked",
							status: "blocked",
							summary: "Worker Foundations install is blocked.",
							createdRefs: [],
							changedRefs: [],
							blockerIds: ["license"],
							blockerReasons: ["Worker license is missing."],
							proofCommandResults: [],
						},
					},
				],
				pairingCommand: null,
			}),
			now,
		);

		expect(previewed.workerInstall).toMatchObject({
			status: "previewed",
			statusLabel: "previewed",
			reportRef: "docs/worker/install-report.md",
			createdRefs: ["apps/worker"],
		});
		expect(installed.workerInstall).toMatchObject({
			status: "installed",
			commitHash: "abc123def456",
			proofCommandResults: [
				{ commandLabel: "bun run docs:validate", status: "passed" },
			],
		});
		expect(blocked.workerInstall).toMatchObject({
			status: "blocked",
			blockerIds: ["license"],
			blockerReasons: ["Worker license is missing."],
		});
	});

	it("builds the existing-codebase stage local navigation", () => {
		const nav = buildExistingCodebaseWorkspaceLocalNavModel("setup");
		const labels = nav.sections.flatMap((section) =>
			section.items.map((item) => item.label),
		);

		expect(labels).toEqual([
			"Setup",
			"Doctor Pass",
			"Findings",
			"Loops",
			"Runs",
			"Privacy",
		]);
		expect(nav.sections[0].items[0]).toMatchObject({
			href: routeConfig.workspaceSetup,
			state: "active",
		});
	});
});
