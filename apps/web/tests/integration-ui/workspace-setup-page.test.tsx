import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkspaceSetupState } from "@/app/(workspace)/_lib/workspace-setup-readiness-model";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const preparePairingMock = vi.fn();
const cancelPairingMock = vi.fn();
const saveWorkspaceProjectMock = vi.fn();
const startDoctorPassRunMock = vi.fn();

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

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useMutation: (mutationRef: string) => useMutationMock(mutationRef),
	useQuery: (queryRef: string, args: unknown) => useQueryMock(queryRef, args),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
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

import { ExistingCodebaseSetupPage } from "@/app/(workspace)/_components/existing-codebase-setup/existing-codebase-setup-page";

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
			primaryCommand: "bunx ship-by-sunday setup pair sbs_pair_test_token",
			fallbackCommand: "npx ship-by-sunday setup pair sbs_pair_test_token",
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
			screen.getByText("bunx ship-by-sunday setup pair sbs_pair_test_token"),
		).toBeTruthy();
		expect(
			screen.queryByText("npx ship-by-sunday setup pair sbs_pair_test_token"),
		).toBeNull();
		expect(screen.queryByText("npx fallback")).toBeNull();
		await user.click(screen.getByRole("radio", { name: "Use npm" }));
		expect(
			screen.getByText("npx ship-by-sunday setup pair sbs_pair_test_token"),
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
			screen.queryByText("bunx ship-by-sunday setup pair sbs_pair_test_token"),
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
			screen.getByText("bunx ship-by-sunday setup pair sbs_pair_test_token"),
		).toBeTruthy();
		expect(screen.queryByText("npx repair fallback")).toBeNull();
		expect(
			screen.queryByText("npx ship-by-sunday setup pair sbs_pair_test_token"),
		).toBeNull();

		await user.click(screen.getByRole("radio", { name: "Use npm" }));

		expect(
			screen.getByText("npx ship-by-sunday setup pair sbs_pair_test_token"),
		).toBeTruthy();
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
		expect(await screen.findByText("Doctor pass started.")).toBeTruthy();
	});

	it("saves the default open destination through the workspace contract", async () => {
		const user = userEvent.setup();
		renderSetupPage();

		await user.click(screen.getByRole("button", { name: /VS Code/i }));

		expect(saveWorkspaceProjectMock).toHaveBeenCalledWith({
			defaultOpenDestination: "vscode",
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
	});
});
