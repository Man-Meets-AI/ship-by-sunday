import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceSetupState } from "@/app/(protected)/_lib/workspace-setup-readiness-model";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const preparePairingMock = vi.fn();
const cancelPairingMock = vi.fn();
const saveWorkspaceProjectMock = vi.fn();
const startDoctorPassRunMock = vi.fn();
const {
	reportClientErrorMock,
	routerPushMock,
	toastErrorMock,
	toastSuccessMock,
} = vi.hoisted(() => ({
	reportClientErrorMock: vi.fn(),
	routerPushMock: vi.fn(),
	toastErrorMock: vi.fn(),
	toastSuccessMock: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		workspace: {
			getWorkspaceSetupState: "getWorkspaceSetupState",
			prepareWorkspaceSetupPairing: "prepareWorkspaceSetupPairing",
			cancelWorkspaceSetupPairing: "cancelWorkspaceSetupPairing",
			createOrLoadWorkspaceProject: "createOrLoadWorkspaceProject",
			startWorkspaceDoctorPassRun: "startWorkspaceDoctorPassRun",
		},
	},
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: routerPushMock,
	}),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useMutation: (mutationRef: string) => useMutationMock(mutationRef),
	useQuery: (queryRef: string, args: unknown) => useQueryMock(queryRef, args),
}));

vi.mock("sonner", () => ({
	toast: {
		error: toastErrorMock,
		success: toastSuccessMock,
	},
}));

vi.mock("@/lib/observability/client-error-report", () => ({
	reportClientError: reportClientErrorMock,
}));

vi.mock("@/app/(protected)/_components/app-shell", () => ({
	AppShell: ({
		children,
		localNav,
	}: {
		children: React.ReactNode;
		localNav?: { desktop?: React.ReactNode };
	}) => (
		<div>
			<nav data-testid="workspace-setup-local-nav">{localNav?.desktop}</nav>
			{children}
		</div>
	),
}));

import { ExistingCodebaseSetupPage } from "@/app/(protected)/_components/existing-codebase-setup/existing-codebase-setup-page";

const renderedAt = 1_000_000;

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
				pairingTokenExpiresAt: renderedAt + 900_000,
			},
		],
		activeRunner: null,
		repositoryBinding: null,
		latestDoctorPassRun: null,
		setupEvents: [
			{
				eventType: "setup.check.completed",
				createdAt: renderedAt - 1_000,
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
		pairingCommand: {
			runnerId: "workspaceRunnerBindings_1",
			token: "sbs_pair_test_token",
			tokenExpiresAt: renderedAt + 900_000,
			primaryCommand:
				"bunx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			fallbackCommand:
				"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
		},
		...overrides,
	};
}

function completedSetupEvent({
	scope,
	checkKey,
	status = "ready",
	summary = `${checkKey} is ready.`,
	remediationAction,
}: {
	scope: "machine" | "project";
	checkKey: string;
	status?: "blocked" | "warning" | "ready";
	summary?: string;
	remediationAction?: string;
}): WorkspaceSetupState["setupEvents"][number] {
	return {
		eventType: "setup.check.completed",
		createdAt: renderedAt - 1_000,
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

function renderSetupPage(initialSetupState = createSetupState()) {
	return render(
		<ExistingCodebaseSetupPage
			initialSetupState={initialSetupState}
			initialRenderedAt={renderedAt}
		/>,
	);
}

describe("ExistingCodebaseSetupPage", () => {
	beforeEach(() => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);
		preparePairingMock.mockResolvedValue(createSetupState());
		cancelPairingMock.mockResolvedValue(
			createSetupState({ pairingCommand: null }),
		);
		saveWorkspaceProjectMock.mockResolvedValue({
			project: createSetupState().project,
			created: false,
		});
		startDoctorPassRunMock.mockResolvedValue({
			_id: "doctorPassRuns_1",
			status: "running",
			syncPreviewStatus: "not_ready",
		});
		reportClientErrorMock.mockReset();
		routerPushMock.mockReset();
		toastErrorMock.mockReset();
		toastSuccessMock.mockReset();
		useMutationMock.mockImplementation((mutationRef: string) => {
			if (mutationRef === "prepareWorkspaceSetupPairing") {
				return preparePairingMock;
			}
			if (mutationRef === "cancelWorkspaceSetupPairing") {
				return cancelPairingMock;
			}
			if (mutationRef === "createOrLoadWorkspaceProject") {
				return saveWorkspaceProjectMock;
			}
			if (mutationRef === "startWorkspaceDoctorPassRun") {
				return startDoctorPassRunMock;
			}
			throw new Error(`Unexpected mutation ${mutationRef}`);
		});
	});

	it("renders the setup command, readiness sections, blockers, and privacy defaults", async () => {
		const user = userEvent.setup();

		renderSetupPage();

		expect(
			screen.getByRole("heading", { name: "Existing codebase setup" }),
		).toBeTruthy();
		expect(screen.getByText("Pending Project Setup")).toBeTruthy();
		expect(
			screen.getByText(
				"bunx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeTruthy();
		expect(
			screen.queryByText(
				"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeNull();
		expect(screen.queryByText("npx fallback")).toBeNull();
		const installSection = within(
			screen
				.getByRole("heading", { name: "Worker install" })
				.closest("section") as HTMLElement,
		);
		expect(installSection.getByText("waiting on pairing")).toBeTruthy();
		expect(
			installSection.getByText(
				"bunx ship-by-sunday install --repo . --dry-run --json --no-kickoff",
			),
		).toBeTruthy();
		expect(
			installSection.getByText(
				"bunx ship-by-sunday install --repo . --yes --json --no-kickoff",
			),
		).toBeTruthy();
		expect(
			installSection.getByText(/Install commits by default on/),
		).toBeTruthy();
		expect(
			(
				installSection.getByRole("button", {
					name: "Copy Preview install command",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		await user.click(screen.getAllByRole("radio", { name: "Use npm" })[0]);
		expect(
			screen.getByText(
				"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeTruthy();
		expect(screen.getByText("runner detected")).toBeTruthy();
		expect(screen.getByText("verifying machine")).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Machine Setup" })).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Project Setup" })).toBeTruthy();
		expect(screen.getByText("SBS Codex profiles are missing.")).toBeTruthy();
		expect(screen.getAllByText("Why it blocks").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Preview diff").length).toBeGreaterThan(0);
		expect(
			screen.getAllByText("Run setup check locally").length,
		).toBeGreaterThan(0);
		expect(screen.getByText("Raw source")).toBeTruthy();
		expect(screen.getByText("Raw terminal logs")).toBeTruthy();
		expect(screen.getByText("Codex transcripts")).toBeTruthy();
		expect(screen.getAllByText("Disabled by default").length).toBeGreaterThan(
			2,
		);
		expect(screen.getByRole("region", { name: "Setup summary" })).toBeTruthy();
		expect(screen.getByText("Resolve setup blockers")).toBeTruthy();
		expect(screen.getByText("Default open destination")).toBeTruthy();
		expect(
			(
				screen.getByRole("button", {
					name: /Run doctor pass/i,
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		expect(
			screen.getByTestId("workspace-setup-local-nav").textContent,
		).toContain("Doctor Pass");
		expect(
			screen.getByTestId("workspace-setup-local-nav").textContent,
		).toContain("Privacy");
	});

	it("keeps warning rows visible but enables Run doctor pass without blockers", () => {
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "ready" as const,
			projectHealthStatus: "ready" as const,
			lastHeartbeatAt: renderedAt - 20_000,
		};

		renderSetupPage(
			createSetupState({
				project: {
					_id: "workspaceProjects_1",
					displayName: "Customer repo",
					defaultOpenDestination: "cursor",
					machineSetupStatus: "ready",
					projectSetupStatus: "ready",
				},
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				repositoryBinding: {
					_id: "workspaceRepositoryBindings_1",
					displayName: "customer-app",
					provider: "unknown",
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
		);

		expect(
			screen.getByText("The working tree has local changes."),
		).toBeTruthy();
		expect(
			(
				screen.getByRole("button", {
					name: /Run doctor pass/i,
				}) as HTMLButtonElement
			).disabled,
		).toBe(false);
		expect(screen.getAllByText(/Warnings can remain visible/).length).toBe(2);
		expect(screen.getAllByText("customer-app").length).toBeGreaterThan(0);
		expect(
			screen.queryByText(
				"bunx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeNull();
		expect(screen.queryByText("npx fallback")).toBeNull();
		expect(screen.queryByText("Regenerate token")).toBeNull();
		expect(screen.queryByText("Use one-shot mode")).toBeNull();
		expect(screen.queryByText("Paired runner")).toBeNull();
		expect(screen.getByRole("button", { name: "Repair pairing" })).toBeTruthy();
	});

	it("shows repair commands as a single package-manager switcher", async () => {
		const user = userEvent.setup();
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "warning" as const,
			projectHealthStatus: "warning" as const,
			lastHeartbeatAt: renderedAt - 20_000,
		};

		renderSetupPage(
			createSetupState({
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				repositoryBinding: {
					_id: "workspaceRepositoryBindings_1",
					displayName: "customer-app",
					provider: "unknown",
					repositoryRoot: "/Users/parker/customer-app",
				},
				setupEvents: requiredReadySetupEvents(),
			}),
		);

		expect(screen.getByText("Repair command")).toBeTruthy();
		expect(
			screen.getByText(
				"bunx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeTruthy();
		expect(screen.queryByText("npx repair fallback")).toBeNull();
		expect(
			screen.queryByText(
				"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeNull();

		await user.click(screen.getAllByRole("radio", { name: "Use npm" })[0]);

		expect(
			screen.getByText(
				"npx ship-by-sunday setup pair sbs_pair_test_token --repo .",
			),
		).toBeTruthy();
	});

	it("shows runner sync-backed Worker install status and handoff details", async () => {
		const user = userEvent.setup();
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "ready" as const,
			projectHealthStatus: "ready" as const,
			lastHeartbeatAt: renderedAt - 20_000,
		};

		renderSetupPage(
			createSetupState({
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				repositoryBinding: {
					_id: "workspaceRepositoryBindings_1",
					displayName: "customer-app",
					provider: "github",
					remoteHost: "github.com",
					remoteOwner: "customer",
					remoteName: "app",
				},
				setupEvents: [
					...requiredReadySetupEvents(),
					{
						eventType: "worker.install.completed",
						createdAt: renderedAt - 2_000,
						payload: {
							eventType: "worker.install.completed",
							outcome: "installed",
							status: "installed",
							summary: "Worker Foundations installed.",
							branch: "shipbysunday/install",
							commitHash: "abc123def456",
							reportRef: "docs/worker/install-report.md",
							localProofRef: ".sbs/worker-install/proof.json",
							createdRefs: [
								"apps/worker",
								"apps/worker/package.json",
								"apps/worker/src/worker-cli.ts",
								"scripts/run-worker.sh",
								"docs/worker/install-report.md",
								"docs/programs/active/worker/program.md",
								"docs/exec-plans/active/worker-first-plan.md",
							],
							changedRefs: [
								"README.md",
								"AGENTS.md",
								"package.json",
								".gitignore",
								"docs/index.md",
								"docs/programs/README.md",
							],
							proofCommandResults: [
								{ commandLabel: "bun run docs:validate", status: "passed" },
								{ commandLabel: "bun run worker:test", status: "passed" },
							],
						},
					},
				],
				pairingCommand: null,
			}),
		);

		const installSection = within(
			screen
				.getByRole("heading", { name: "Worker install" })
				.closest("section") as HTMLElement,
		);

		expect(installSection.getByText("installed")).toBeTruthy();
		expect(installSection.getByText("shipbysunday/install")).toBeTruthy();
		expect(
			installSection.getByText("docs/worker/install-report.md"),
		).toBeTruthy();
		expect(
			installSection.getByText("./scripts/run-worker.sh --help"),
		).toBeTruthy();

		await user.click(
			installSection.getAllByRole("radio", { name: "Use npm" })[0],
		);

		expect(
			installSection.getByText(
				"npx ship-by-sunday install --repo . --dry-run --json --no-kickoff",
			),
		).toBeTruthy();
		expect(installSection.getByText("npm run docs:validate")).toBeTruthy();
		expect(installSection.getByText("npm run worker:test")).toBeTruthy();

		await user.click(
			installSection.getByRole("button", { name: "Runner sync details" }),
		);

		expect(installSection.getByText("abc123def456")).toBeTruthy();
		expect(installSection.getByText("and 2 more")).toBeTruthy();
		expect(installSection.getByText("and 1 more")).toBeTruthy();
		expect(installSection.getAllByText("passed").length).toBeGreaterThan(1);
	});

	it("starts a doctor pass run when readiness has no blockers", async () => {
		const user = userEvent.setup();
		const pairedRunner = {
			_id: "workspaceRunnerBindings_1",
			status: "paired" as const,
			pairingStatus: "paired" as const,
			runnerMode: "daemon" as const,
			runnerLabel: "Local daemon",
			machineDisplayName: "Parker MacBook",
			machineHealthStatus: "ready" as const,
			projectHealthStatus: "ready" as const,
			lastHeartbeatAt: renderedAt - 20_000,
		};

		renderSetupPage(
			createSetupState({
				runnerBindings: [pairedRunner],
				activeRunner: pairedRunner,
				repositoryBinding: {
					_id: "workspaceRepositoryBindings_1",
					displayName: "customer-app",
					provider: "github",
					remoteHost: "github.com",
					remoteOwner: "customer",
					remoteName: "app",
				},
				setupEvents: requiredReadySetupEvents(),
				pairingCommand: null,
			}),
		);

		await user.click(
			screen.getByRole("button", {
				name: /Run doctor pass/i,
			}),
		);

		expect(startDoctorPassRunMock).toHaveBeenCalledWith({
			projectId: "workspaceProjects_1",
			runnerId: "workspaceRunnerBindings_1",
			repositoryBindingId: "workspaceRepositoryBindings_1",
			runnerMode: "daemon",
		});
		expect(toastSuccessMock).toHaveBeenCalledWith("Doctor pass started", {
			action: expect.objectContaining({
				label: "Open Doctor Pass",
			}),
			id: "workspace-setup-doctor-pass-success",
			description: undefined,
			duration: 6000,
			position: "bottom-right",
		});
		const toastOptions = toastSuccessMock.mock.calls.find(
			([title]) => title === "Doctor pass started",
		)?.[1];
		toastOptions?.action?.onClick();
		expect(routerPushMock).toHaveBeenCalledWith("/workers/doctor-pass");
	});

	it("saves the default open destination through the workspace contract", async () => {
		const user = userEvent.setup();
		renderSetupPage();

		await user.click(screen.getByRole("button", { name: /VS Code/i }));

		expect(saveWorkspaceProjectMock).toHaveBeenCalledWith({
			defaultOpenDestination: "vscode",
		});
		expect(toastSuccessMock).toHaveBeenCalledWith("Open destination saved", {
			id: "workspace-setup-open-destination-success",
			description: "VS Code",
			duration: 1800,
			position: "bottom-right",
		});
	});

	it("toasts and reports default open destination save failures", async () => {
		const user = userEvent.setup();
		const saveError = new Error("Open destination write failed");
		saveWorkspaceProjectMock.mockRejectedValueOnce(saveError);
		renderSetupPage();

		await user.click(screen.getByRole("button", { name: /VS Code/i }));

		expect(saveWorkspaceProjectMock).toHaveBeenCalledWith({
			defaultOpenDestination: "vscode",
		});
		expect(toastErrorMock).toHaveBeenCalledWith(
			"Open destination write failed",
			{
				id: "workspace-setup-open-destination-error",
				duration: 6000,
				position: "bottom-right",
			},
		);
		expect(reportClientErrorMock).toHaveBeenCalledWith({
			error: saveError,
			pathname: "/workers/setup",
			code: "workspace_setup_open_destination_save_failed",
			severity: "medium",
			details: {
				action: "Worker setup open destination save failed",
				defaultOpenDestination: "vscode",
			},
		});
	});

	it("regenerates daemon tokens and prepares one-shot fallback through Convex", async () => {
		const user = userEvent.setup();
		renderSetupPage();

		await user.click(screen.getByRole("button", { name: /Regenerate token/i }));
		await user.click(
			screen.getByRole("button", { name: /Use one-shot mode/i }),
		);

		expect(preparePairingMock).toHaveBeenNthCalledWith(1, {
			projectId: "workspaceProjects_1",
			runnerMode: "daemon",
			regenerate: true,
		});
		expect(preparePairingMock).toHaveBeenNthCalledWith(2, {
			projectId: "workspaceProjects_1",
			runnerMode: "one_shot",
			regenerate: true,
		});
		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"One-shot pairing token ready",
				{
					id: "workspace-setup-pairing-success",
					description: undefined,
					duration: 1800,
					position: "bottom-right",
				},
			);
		});
	});
});
