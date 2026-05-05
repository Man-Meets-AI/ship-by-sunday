import { routeConfig } from "@/config/product";
import type { WorkspaceLocalNavModel } from "@/lib/workspace-navigation/build-secondary-nav-model";

export type SetupCheckStatus = "blocked" | "warning" | "ready";
export type SetupCheckScope = "machine" | "project";

export type SetupCheckActionKind =
	| "fix_in_terminal"
	| "preview_diff"
	| "retry_check"
	| "review"
	| "dismiss_for_run"
	| "fix_later";

export type SetupCheckAction = {
	kind: SetupCheckActionKind;
	label: string;
};

type SetupCheckBase = {
	id: string;
	label: string;
	scope: SetupCheckScope;
	status: SetupCheckStatus;
	localAction: string;
};

export type SetupBlockedCheck = SetupCheckBase & {
	status: "blocked";
	cause: string;
	blocksBecause: string;
	localActionButton: SetupCheckAction;
	retryAction: SetupCheckAction;
};

export type SetupWarningCheck = SetupCheckBase & {
	status: "warning";
	cause: string;
	allowsBecause: string;
	actions: SetupCheckAction[];
};

export type SetupReadyCheck = SetupCheckBase & {
	status: "ready";
	summary: string;
};

export type SetupReadinessCheck =
	| SetupBlockedCheck
	| SetupWarningCheck
	| SetupReadyCheck;

export type WorkspaceSetupSection = {
	id: SetupCheckScope;
	title: string;
	summary: string;
	status: SetupCheckStatus;
	rows: SetupReadinessCheck[];
};

type WorkspaceSetupProject = {
	_id: string;
	displayName: string;
	defaultOpenDestination: WorkspaceDefaultOpenDestination;
	machineSetupStatus: "unknown" | "blocked" | "warning" | "ready";
	projectSetupStatus: "unknown" | "blocked" | "warning" | "ready";
};

type WorkspaceSetupRunnerBinding = {
	_id: string;
	status: "pairing" | "paired" | "revoked";
	pairingStatus:
		| "waiting"
		| "runner_detected"
		| "verifying_machine"
		| "verifying_project"
		| "paired"
		| "revoked";
	runnerMode: "daemon" | "one_shot";
	runnerLabel: string;
	machineDisplayName?: string;
	runnerVersion?: string;
	machineHealthStatus: "unknown" | "blocked" | "warning" | "ready";
	projectHealthStatus: "unknown" | "blocked" | "warning" | "ready";
	lastHeartbeatAt?: number;
	lastEventAt?: number;
	pairingTokenExpiresAt?: number;
};

type WorkspaceSetupRepositoryBinding = {
	_id?: string;
	displayName: string;
	provider: "github" | "gitlab" | "bitbucket" | "other" | "unknown";
	remoteHost?: string;
	remoteOwner?: string;
	remoteName?: string;
	defaultBranch?: string;
	packageManager?: "bun" | "npm" | "pnpm" | "yarn" | "unknown";
} | null;

type WorkspaceSetupDoctorPassRun = {
	status:
		| "queued"
		| "running"
		| "sync_preview_ready"
		| "sync_approved"
		| "findings_uploaded"
		| "blocked"
		| "failed"
		| "canceled"
		| "deleted";
	syncPreviewStatus:
		| "not_ready"
		| "ready"
		| "approved"
		| "rejected"
		| "expired"
		| "uploaded";
	blockedReason?: string;
} | null;

type WorkspaceSetupEvent = {
	eventType: string;
	createdAt: number;
	payload:
		| CompletedSetupPayload
		| {
				eventType: string;
				[key: string]: unknown;
		  };
};

type CompletedSetupPayload = {
	eventType: "setup.check.completed";
	scope: SetupCheckScope;
	checkKey: string;
	status: "unknown" | "blocked" | "warning" | "ready";
	summary: string;
	remediationAction?: string;
};

export type WorkspacePairingCommand = {
	runnerId: string;
	token: string;
	tokenExpiresAt: number;
	primaryCommand: string;
	fallbackCommand: string;
} | null;

export type WorkspaceSetupState = {
	project: WorkspaceSetupProject | null;
	runnerBindings: WorkspaceSetupRunnerBinding[];
	activeRunner: WorkspaceSetupRunnerBinding | null;
	repositoryBinding: WorkspaceSetupRepositoryBinding;
	latestDoctorPassRun: WorkspaceSetupDoctorPassRun;
	setupEvents: WorkspaceSetupEvent[];
	pairingCommand: WorkspacePairingCommand;
};

export type WorkspaceDefaultOpenDestination =
	| "cursor"
	| "vscode"
	| "terminal"
	| "none";

export type WorkspaceOpenDestinationOption = {
	value: WorkspaceDefaultOpenDestination;
	label: string;
	description: string;
};

type CheckDefinition = {
	id: string;
	label: string;
	scope: SetupCheckScope;
	required: boolean;
	pendingCause: string;
	readySummary: string;
	warningCause: string;
	blocksBecause: string;
	allowsBecause: string;
	localAction: string;
	localActionButton: SetupCheckAction;
	warningActions: SetupCheckAction[];
};

const retryAction: SetupCheckAction = {
	kind: "retry_check",
	label: "Retry check",
};

const fixInTerminalAction: SetupCheckAction = {
	kind: "fix_in_terminal",
	label: "Fix in terminal",
};

const previewDiffAction: SetupCheckAction = {
	kind: "preview_diff",
	label: "Preview diff",
};

const reviewAction: SetupCheckAction = {
	kind: "review",
	label: "Review",
};

const dismissForRunAction: SetupCheckAction = {
	kind: "dismiss_for_run",
	label: "Dismiss for this run",
};

const fixLaterAction: SetupCheckAction = {
	kind: "fix_later",
	label: "Fix later",
};

const machineCheckDefinitions: CheckDefinition[] = [
	{
		id: "codex_auth",
		label: "ChatGPT/Codex auth",
		scope: "machine",
		required: true,
		pendingCause: "The local runner has not confirmed Codex auth yet.",
		readySummary: "Codex is available and authenticated on this machine.",
		warningCause: "Codex auth is present with setup warnings.",
		blocksBecause:
			"The doctor pass needs local Codex auth before it can interpret the repo privately.",
		allowsBecause:
			"Codex can still run locally, but setup quality may be degraded.",
		localAction: "Run `codex login` or finish ChatGPT/Codex sign-in locally.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "gh_auth",
		label: "gh auth",
		scope: "machine",
		required: true,
		pendingCause: "The local runner has not confirmed GitHub CLI auth yet.",
		readySummary: "`gh` is installed and authenticated.",
		warningCause: "`gh` is authenticated with setup warnings.",
		blocksBecause:
			"The setup contract requires GitHub CLI readiness before doctor-pass handoff.",
		allowsBecause:
			"Read-only diagnosis can continue, but later PR handoff may need attention.",
		localAction: "Run `gh auth status` and `gh auth login` if needed.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "sbs_profiles",
		label: "SBS execution profiles",
		scope: "machine",
		required: true,
		pendingCause:
			"The runner has not confirmed the SBS Codex profiles are installed.",
		readySummary:
			"`sbs-doctor-readonly`, `sbs-proof`, and write profiles are available.",
		warningCause: "SBS profiles are present with a drift warning.",
		blocksBecause:
			"The doctor pass must run under the narrow SBS read-only profile.",
		allowsBecause:
			"The read-only profile exists, but profile drift should be reviewed.",
		localAction:
			"Preview the SBS-managed Codex profile diff before installing it.",
		localActionButton: previewDiffAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "codex_config",
		label: "Codex config",
		scope: "machine",
		required: true,
		pendingCause: "The runner has not confirmed `~/.codex/config.toml` yet.",
		readySummary: "`~/.codex/config.toml` is readable and scoped.",
		warningCause: "Codex config is readable with hygiene warnings.",
		blocksBecause:
			"Unreadable or refused config prevents a predictable local Codex run.",
		allowsBecause:
			"The doctor pass can run, but the config warning should be reviewed.",
		localAction:
			"Fix config access in terminal or preview the SBS-managed diff.",
		localActionButton: previewDiffAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "codex_config_backup",
		label: "Private codex-config backup",
		scope: "machine",
		required: false,
		pendingCause:
			"The optional sanitized `codex-config` backup has not been prepared.",
		readySummary: "The optional sanitized config backup is ready.",
		warningCause: "The optional sanitized `codex-config` backup is skipped.",
		blocksBecause: "This optional backup does not block the doctor pass.",
		allowsBecause:
			"Raw config and credentials stay local; Crawl can continue without a backup.",
		localAction:
			"Preview the sanitized backup diff in terminal if you want it.",
		localActionButton: previewDiffAction,
		warningActions: [reviewAction, dismissForRunAction, fixLaterAction],
	},
	{
		id: "daemon_health",
		label: "Daemon health",
		scope: "machine",
		required: true,
		pendingCause: "No paired local daemon is reporting health yet.",
		readySummary: "The local runner is paired and reporting health.",
		warningCause: "The runner is paired with degraded health.",
		blocksBecause:
			"The doctor pass starts only after a paired runner can report setup state.",
		allowsBecause:
			"Setup can continue in degraded mode, or one-shot can finish the pass.",
		localAction: "Run the pairing command from this page.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, fixLaterAction],
	},
];

const projectCheckDefinitions: CheckDefinition[] = [
	{
		id: "repo_root",
		label: "Repo root",
		scope: "project",
		required: true,
		pendingCause: "The runner has not confirmed a Git repository root yet.",
		readySummary: "The selected project is inside a Git repository.",
		warningCause: "The repo root is detected with warnings.",
		blocksBecause:
			"The doctor pass needs a repository root for safe file refs.",
		allowsBecause:
			"Diagnosis can continue if the selected root is intentional.",
		localAction: "Run the pairing command from the repo root.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "git_remote",
		label: "Git remote",
		scope: "project",
		required: true,
		pendingCause: "The runner has not confirmed a Git remote yet.",
		readySummary: "A Git remote is available for repo identity.",
		warningCause: "A Git remote exists with setup warnings.",
		blocksBecause:
			"Workspace identity and later handoffs need a repository remote.",
		allowsBecause:
			"The doctor pass can rank findings with reduced handoff detail.",
		localAction: "Add or fix the repo remote in terminal, then retry.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "dirty_state",
		label: "Dirty state",
		scope: "project",
		required: false,
		pendingCause: "The runner has not checked the Git working tree yet.",
		readySummary: "The working tree is clean or intentionally checkpointed.",
		warningCause: "The working tree has local changes.",
		blocksBecause: "Dirty state is a Walk blocker, not a Crawl blocker.",
		allowsBecause:
			"Crawl is read-only, so dirty state stays visible but does not block.",
		localAction: "Review or checkpoint local changes before write workflows.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, dismissForRunAction, fixLaterAction],
	},
	{
		id: "package_manager",
		label: "Package manager",
		scope: "project",
		required: false,
		pendingCause: "The runner has not identified the package manager yet.",
		readySummary: "The package manager is detected.",
		warningCause: "The package manager is unclear.",
		blocksBecause:
			"Package-manager uncertainty does not block read-only Crawl.",
		allowsBecause:
			"The doctor pass can still inspect source truth and command maps.",
		localAction: "Review the detected package manager before proof commands.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, fixLaterAction],
	},
	{
		id: "command_map",
		label: "Command map",
		scope: "project",
		required: false,
		pendingCause: "The runner has not mapped proof commands yet.",
		readySummary:
			"Install, lint, typecheck, test, and build commands are mapped.",
		warningCause: "Proof commands are incomplete.",
		blocksBecause: "Missing command proof does not block read-only diagnosis.",
		allowsBecause:
			"The doctor pass can still produce findings and mark proof gaps.",
		localAction: "Review command detection and fill gaps later.",
		localActionButton: fixInTerminalAction,
		warningActions: [reviewAction, dismissForRunAction, fixLaterAction],
	},
	{
		id: "read_only_mode",
		label: "Safe read-only mode",
		scope: "project",
		required: true,
		pendingCause: "The runner has not confirmed read-only execution yet.",
		readySummary: "Read-only doctor-pass execution is available.",
		warningCause: "Read-only mode is available with sandbox warnings.",
		blocksBecause: "Crawl must stay branchless, local, and read-only.",
		allowsBecause:
			"Read-only mode exists, but sandbox defaults should be reviewed.",
		localAction: "Preview the sandbox/profile diff in terminal.",
		localActionButton: previewDiffAction,
		warningActions: [reviewAction, fixLaterAction],
	},
];

export const workspaceOpenDestinationOptions: WorkspaceOpenDestinationOption[] =
	[
		{
			value: "cursor",
			label: "Cursor",
			description: "Open local proof and diffs in Cursor when the runner can.",
		},
		{
			value: "vscode",
			label: "VS Code",
			description: "Use VS Code as the default local handoff destination.",
		},
		{
			value: "terminal",
			label: "Terminal",
			description: "Keep handoff prompts and proof refs terminal-first.",
		},
		{
			value: "none",
			label: "Ask each time",
			description: "Do not set a default destination yet.",
		},
	];

export const setupPrivacyDefaults = [
	{
		id: "raw-source",
		label: "Raw source",
		value: "Disabled by default",
		description:
			"Repo files stay local unless you explicitly approve a later share.",
	},
	{
		id: "raw-terminal-logs",
		label: "Raw terminal logs",
		value: "Disabled by default",
		description:
			"Long command output stays in local `.sbs/` reports by default.",
	},
	{
		id: "codex-transcripts",
		label: "Codex transcripts",
		value: "Disabled by default",
		description: "Codex session history is not synced with the setup report.",
	},
	{
		id: "structured-findings",
		label: "Structured findings",
		value: "Approval required",
		description:
			"Only approved finding metadata, proof status, and repo-relative refs can sync.",
	},
] as const;

function normalizeBackendStatus(
	status: "unknown" | "blocked" | "warning" | "ready",
	definition: CheckDefinition,
): SetupCheckStatus {
	if (status === "ready" || status === "warning" || status === "blocked") {
		return status;
	}

	return definition.required ? "blocked" : "warning";
}

function latestCompletedSetupEvents(state: WorkspaceSetupState) {
	const latestEvents = new Map<string, WorkspaceSetupEvent>();

	for (const event of state.setupEvents) {
		if (!isCompletedSetupPayload(event.payload)) {
			continue;
		}

		const eventKey = `${event.payload.scope}:${event.payload.checkKey}`;
		const current = latestEvents.get(eventKey);
		if (!current || current.createdAt < event.createdAt) {
			latestEvents.set(eventKey, event);
		}
	}

	return latestEvents;
}

function isCompletedSetupPayload(
	payload: WorkspaceSetupEvent["payload"],
): payload is CompletedSetupPayload {
	return payload.eventType === "setup.check.completed";
}

function buildSetupCheck(
	definition: CheckDefinition,
	event: WorkspaceSetupEvent | undefined,
): SetupReadinessCheck {
	const completedPayload =
		event && isCompletedSetupPayload(event.payload) ? event.payload : null;
	const status = normalizeBackendStatus(
		completedPayload?.status ?? "unknown",
		definition,
	);

	if (status === "ready") {
		return {
			id: definition.id,
			label: definition.label,
			scope: definition.scope,
			status,
			summary: completedPayload?.summary ?? definition.readySummary,
			localAction: definition.localAction,
		};
	}

	if (status === "warning") {
		return {
			id: definition.id,
			label: definition.label,
			scope: definition.scope,
			status,
			cause:
				completedPayload?.summary ??
				(definition.required
					? definition.warningCause
					: definition.pendingCause),
			allowsBecause: definition.allowsBecause,
			localAction:
				completedPayload?.remediationAction ?? definition.localAction,
			actions: definition.warningActions,
		};
	}

	return {
		id: definition.id,
		label: definition.label,
		scope: definition.scope,
		status,
		cause: completedPayload?.summary ?? definition.pendingCause,
		blocksBecause: definition.blocksBecause,
		localAction: completedPayload?.remediationAction ?? definition.localAction,
		localActionButton: definition.localActionButton,
		retryAction,
	};
}

function buildSection({
	id,
	title,
	definitions,
	completedEvents,
}: {
	id: SetupCheckScope;
	title: string;
	definitions: CheckDefinition[];
	completedEvents: Map<string, WorkspaceSetupEvent>;
}): WorkspaceSetupSection {
	const rows = definitions.map((definition) =>
		buildSetupCheck(
			definition,
			completedEvents.get(`${definition.scope}:${definition.id}`),
		),
	);
	const status = rows.some((row) => row.status === "blocked")
		? "blocked"
		: rows.some((row) => row.status === "warning")
			? "warning"
			: "ready";

	return {
		id,
		title,
		status,
		rows,
		summary: getSectionSummary(title, status),
	};
}

function getSectionSummary(title: string, status: SetupCheckStatus) {
	if (status === "ready") {
		return `${title} is ready for the private doctor pass.`;
	}

	if (status === "warning") {
		return `${title} has warnings that stay visible but do not block Crawl.`;
	}

	return `${title} has blockers that must be resolved locally.`;
}

function getPairingStatus(
	state: WorkspaceSetupState,
	now: number,
): WorkspaceSetupRunnerBinding["pairingStatus"] {
	if (state.activeRunner?.status === "paired") {
		return state.activeRunner.pairingStatus === "revoked"
			? "revoked"
			: "paired";
	}

	const pairingRunner = state.runnerBindings.find(
		(runnerBinding) => runnerBinding.status === "pairing",
	);
	if (!pairingRunner) {
		return "waiting";
	}

	if (
		pairingRunner.pairingTokenExpiresAt &&
		pairingRunner.pairingTokenExpiresAt <= now
	) {
		return "waiting";
	}

	return pairingRunner.pairingStatus;
}

function formatTokenExpiry(tokenExpiresAt: number | null, now: number) {
	if (!tokenExpiresAt) {
		return "Generate a token to pair the runner.";
	}

	const remainingMs = tokenExpiresAt - now;
	if (remainingMs <= 0) {
		return "Pairing token expired. Regenerate before running the command.";
	}

	const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
	return `Pairing token expires in ${remainingMinutes} min.`;
}

function getPairingLabel(status: WorkspaceSetupRunnerBinding["pairingStatus"]) {
	switch (status) {
		case "waiting":
			return "waiting";
		case "runner_detected":
			return "runner detected";
		case "verifying_machine":
			return "verifying machine";
		case "verifying_project":
			return "verifying project";
		case "paired":
			return "paired";
		case "revoked":
			return "waiting";
	}
}

function getPairingDescription(
	status: WorkspaceSetupRunnerBinding["pairingStatus"],
) {
	switch (status) {
		case "waiting":
			return "Run the command from the repository root. The browser waits on backend pairing state, not a direct daemon connection.";
		case "runner_detected":
			return "The runner reached Ship by Sunday and is preparing setup checks.";
		case "verifying_machine":
			return "The runner is checking Codex auth, gh auth, profiles, config, and daemon health.";
		case "verifying_project":
			return "The runner is checking repo root, Git remote, commands, package manager, and read-only mode.";
		case "paired":
			return "The runner is paired. Warnings can remain visible while Crawl runs.";
		case "revoked":
			return "The previous pairing was canceled. Regenerate a token to pair again.";
	}
}

function getRunnerStatusLabel(
	runner: WorkspaceSetupRunnerBinding | null,
	mode: "daemon" | "one_shot",
) {
	if (!runner || runner.runnerMode !== mode) {
		return mode === "daemon" ? "daemon waiting" : "one-shot available";
	}

	if (runner.status === "revoked") {
		return mode === "daemon" ? "daemon canceled" : "one-shot disconnected";
	}

	if (mode === "one_shot" && runner.status === "paired") {
		return runner.machineHealthStatus === "ready" &&
			runner.projectHealthStatus === "ready"
			? "one-shot complete"
			: "one-shot disconnected";
	}

	if (runner.status === "paired") {
		return runner.lastHeartbeatAt ? "daemon connected" : "daemon paired";
	}

	return mode === "daemon" ? "daemon pairing" : "one-shot pairing";
}

function getRepositoryLabel(
	repositoryBinding: WorkspaceSetupRepositoryBinding,
) {
	if (!repositoryBinding) {
		return "Pending Project Setup";
	}

	const remoteName = [
		repositoryBinding.remoteOwner,
		repositoryBinding.remoteName,
	]
		.filter(Boolean)
		.join("/");

	return remoteName || repositoryBinding.displayName;
}

function getDoctorPassBlockers(
	sections: WorkspaceSetupSection[],
	state: WorkspaceSetupState,
	now: number,
) {
	const rowBlockers = sections.flatMap((section) =>
		section.rows.filter(
			(row): row is SetupBlockedCheck => row.status === "blocked",
		),
	);

	if (getPairingStatus(state, now) !== "paired") {
		return [
			{
				id: "runner_pairing",
				label: "Local runner pairing",
				scope: "machine" as const,
				status: "blocked" as const,
				cause: "The local runner is not paired yet.",
				blocksBecause:
					"The doctor pass runs on the customer's machine through the paired runner.",
				localAction: "Run the pairing command from the repository root.",
				localActionButton: fixInTerminalAction,
				retryAction,
			},
			...rowBlockers,
		];
	}

	return rowBlockers;
}

export function buildWorkspaceSetupReadinessModel(
	state: WorkspaceSetupState,
	now = Date.now(),
) {
	const completedEvents = latestCompletedSetupEvents(state);
	const sections = [
		buildSection({
			id: "machine",
			title: "Machine Setup",
			definitions: machineCheckDefinitions,
			completedEvents,
		}),
		buildSection({
			id: "project",
			title: "Project Setup",
			definitions: projectCheckDefinitions,
			completedEvents,
		}),
	];
	const pairingStatus = getPairingStatus(state, now);
	const activeRunner = state.activeRunner ?? null;
	const daemonRunner =
		state.runnerBindings.find(
			(runnerBinding) => runnerBinding.runnerMode === "daemon",
		) ?? null;
	const oneShotRunner =
		state.runnerBindings.find(
			(runnerBinding) => runnerBinding.runnerMode === "one_shot",
		) ?? null;
	const doctorPassBlockers = getDoctorPassBlockers(sections, state, now);

	return {
		title: "Setup",
		subtitle:
			"Pair the local runner, confirm readiness, and start the private doctor pass without syncing raw source.",
		projectLabel: state.project?.displayName ?? "Existing codebase workspace",
		repositoryLabel: getRepositoryLabel(state.repositoryBinding),
		pairing: {
			status: pairingStatus,
			statusLabel: getPairingLabel(pairingStatus),
			description: getPairingDescription(pairingStatus),
			primaryCommand: state.pairingCommand?.primaryCommand ?? null,
			fallbackCommand: state.pairingCommand?.fallbackCommand ?? null,
			tokenExpiresLabel: formatTokenExpiry(
				state.pairingCommand?.tokenExpiresAt ?? null,
				now,
			),
			expectedRepoRoot:
				state.repositoryBinding?.displayName ??
				"Run from the repo root you want diagnosed.",
			daemonStatusLabel: getRunnerStatusLabel(daemonRunner, "daemon"),
			oneShotStatusLabel: getRunnerStatusLabel(oneShotRunner, "one_shot"),
			activeRunnerLabel:
				activeRunner?.machineDisplayName ??
				activeRunner?.runnerLabel ??
				"No runner paired",
			activeRunnerVersion: activeRunner?.runnerVersion ?? null,
			canCancel:
				Boolean(state.pairingCommand?.runnerId) && pairingStatus !== "paired",
			cancelRunnerId: state.pairingCommand?.runnerId ?? null,
		},
		sections,
		privacyDefaults: setupPrivacyDefaults,
		openDestination: {
			value: state.project?.defaultOpenDestination ?? "cursor",
			options: workspaceOpenDestinationOptions,
		},
		doctorPassAction: {
			label: "Run doctor pass",
			disabled: doctorPassBlockers.length > 0,
			blockerCount: doctorPassBlockers.length,
			disabledReason:
				doctorPassBlockers.length > 0
					? `${doctorPassBlockers.length} blocker${
							doctorPassBlockers.length === 1 ? "" : "s"
						} must be resolved first.`
					: null,
			helperText:
				doctorPassBlockers.length > 0
					? "Warnings stay visible, but only blockers disable Crawl."
					: "Warnings can remain visible; Crawl is read-only and local-first.",
			blockers: doctorPassBlockers,
		},
		latestDoctorPassRun: state.latestDoctorPassRun,
	};
}

export function buildExistingCodebaseWorkspaceLocalNavModel(
	activeItemId = "setup",
): WorkspaceLocalNavModel {
	const item = (
		id: string,
		label: string,
		href: string,
		state: "active" | "available" | "complete" | "disabled" = "disabled",
	) => ({
		id,
		label,
		href,
		state: id === activeItemId ? ("active" as const) : state,
	});

	return {
		sections: [
			{
				id: "existing-codebase",
				label: "Existing codebase",
				description: "Setup, diagnosis, proof, and privacy.",
				items: [
					item("setup", "Setup", routeConfig.workspaceSetup, "available"),
					item(
						"doctor-pass",
						"Doctor Pass",
						routeConfig.workspaceDoctorPass,
						"available",
					),
					item(
						"findings",
						"Findings",
						routeConfig.workspaceFindings,
						"available",
					),
					item("loops", "Loops", routeConfig.workspaceLoops, "available"),
					item("runs", "Runs", routeConfig.workspaceRuns, "available"),
					item("privacy", "Privacy", routeConfig.workspacePrivacy, "available"),
				],
			},
		],
	};
}
