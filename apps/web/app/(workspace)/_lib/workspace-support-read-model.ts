import { routeConfig } from "@/config/product";
import type { WorkspaceFindingDocument } from "./workspace-findings-read-model";

export type WorkspaceDoctorPassRunDocument = {
	_id: string;
	localRunId?: string;
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
	runnerMode: "daemon" | "one_shot";
	currentStage?:
		| "runner_connected"
		| "machine_setup_checked"
		| "project_setup_checked"
		| "passive_probes_running"
		| "codex_interpretation_running"
		| "sync_preview_ready"
		| "findings_ready";
	syncPreviewStatus:
		| "not_ready"
		| "ready"
		| "approved"
		| "rejected"
		| "expired"
		| "uploaded";
	syncPreviewDigest?: string;
	syncPreviewFindingsCount?: number;
	findingsCount?: number;
	excludedArtifactCount?: number;
	localReportRef?: string;
	blockedReason?: string;
	startedAt: number;
	completedAt?: number;
	createdAt: number;
	updatedAt: number;
	deletedAt?: number;
};

export type WorkspaceWorkflowRunDocument = {
	_id: string;
	findingDocumentId?: string;
	workflowId: string;
	workflowVersion: string;
	status:
		| "approval_requested"
		| "approved"
		| "paused"
		| "running"
		| "proof_completed"
		| "blocked"
		| "canceled"
		| "deleted";
	proofStatus: "not_started" | "passed" | "failed" | "blocked";
	deliveryStatus:
		| "not_started"
		| "local_only"
		| "pr_requested"
		| "pr_opened"
		| "blocked";
	branchName?: string;
	profileName?: string;
	writeLeaseExpiresAt?: number;
	writeLeaseDurationMinutes?: number;
	writeLeaseRenewalCount?: number;
	localWorkflowPacketRef?: string;
	localProofRef?: string;
	proofCommands?: string[];
	proofCommandResults?: Array<{
		commandName: string;
		status: "passed" | "failed" | "blocked";
	}>;
	proofSummary?: string;
	touchedFileRefs?: string[];
	createdArtifactRefs?: string[];
	nextRecommendedWorkflowId?: string;
	blockedReason?: string;
	startedAt?: number;
	completedAt?: number;
	createdAt: number;
	updatedAt: number;
	deletedAt?: number;
};

export type WorkspaceRunHistoryState = {
	doctorPassRuns: WorkspaceDoctorPassRunDocument[];
	workflowRuns: WorkspaceWorkflowRunDocument[];
};

export type WorkspaceRunsDoctorPassRow = {
	id: string;
	title: string;
	startedLabel: string;
	runnerModeLabel: string;
	statusLabel: string;
	stageLabel: string;
	syncStatusLabel: string;
	findingsCountLabel: string;
	blockedReason: string | null;
	localReportRef: string | null;
};

export type WorkspaceRunsWorkflowRow = {
	id: string;
	workflowId: string;
	workflowLabel: string;
	branchLabel: string;
	profileLabel: string;
	leaseStatusLabel: string;
	statusLabel: string;
	proofStatusLabel: string;
	deliveryStatusLabel: string;
	nextRecommendationLabel: string;
	localProofRef: string | null;
	blockedReason: string | null;
};

export type WorkspaceRunsModel = {
	doctorPassRows: WorkspaceRunsDoctorPassRow[];
	workflowRows: WorkspaceRunsWorkflowRow[];
	totalRuns: number;
	hasRuns: boolean;
};

type WorkflowCatalogDefinition = {
	id: string;
	name: string;
	category: string;
	whenUseful: string;
	requiredPermission: string;
	typicalProof: string;
	riskLevel: string;
};

export type WorkspaceLoopCatalogRow = WorkflowCatalogDefinition & {
	status: "recommended" | "available_now" | "blocked" | "future";
	statusLabel: string;
	relatedFindingCount: number;
	relatedFindingTitle: string | null;
	relatedFindingHref: string | null;
	workflowRunStatusLabel: string | null;
	actionLabel: "Review finding" | null;
};

export type WorkspaceWorkflowPacketContractRow = {
	id:
		| "evidence"
		| "context"
		| "surface"
		| "codex"
		| "writes"
		| "proof"
		| "sync"
		| "revocation";
	label: string;
	statusLabel: string;
	description: string;
};

export type WorkspaceLoopsModel = {
	rows: WorkspaceLoopCatalogRow[];
	packetContractRows: WorkspaceWorkflowPacketContractRow[];
	recommendedWorkflow: WorkspaceLoopCatalogRow | null;
	findingBackedCount: number;
};

export type WorkspacePrivacySetupState = {
	project: {
		_id: string;
		displayName: string;
		defaultOpenDestination: "cursor" | "vscode" | "terminal" | "none";
		syncPolicy?: {
			rawSource: "disabled";
			rawTerminalLogs: "disabled";
			codexTranscripts: "disabled";
			screenshots: "disabled";
			structuredFindings: "approval_required";
		};
	} | null;
	activeRunner: {
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
	} | null;
	repositoryBinding: {
		_id?: string;
		displayName: string;
		provider: "github" | "gitlab" | "bitbucket" | "other" | "unknown";
		remoteHost?: string;
		remoteOwner?: string;
		remoteName?: string;
		defaultBranch?: string;
		packageManager?: "bun" | "npm" | "pnpm" | "yarn" | "unknown";
	} | null;
};

export type WorkspacePrivacySyncPreviewState = {
	doctorPassRun: WorkspaceDoctorPassRunDocument | null;
};

export type ManagedGithubConsentDocument = {
	_id: string;
	status: "requested" | "approved" | "revoked";
	repositoryBindingId: string;
	repositoryAccess: {
		provider: "github";
		remoteOwner: string;
		remoteName: string;
		defaultBranch?: string;
		accessMode: "selected_repository_only";
	};
	installationScope: {
		repositorySelection: "selected_repository_only";
		permissions: string[];
	};
	storagePolicy: {
		sourceCloneRetention: "ephemeral_until_delivery_or_revocation";
		proofArtifactRetention: "structured_metadata_only";
		secretStorage: "never_store_customer_secrets";
	};
	prAuthority: {
		branchCreation: "customer_approval_required";
		pullRequestCreation: "customer_approval_required";
		mergeAuthority: "never";
		ciRerunAuthority: "customer_approval_required";
	};
	rawSourceVisibility: {
		operatorVisibility: "assigned_concierge_only_after_consent";
		rawSourceSharing: "disabled_until_explicit_share";
		transcriptStorage: "disabled";
	};
	proofBoundary: {
		proofCommands: "customer_approved_only";
		ciCommands: "customer_approved_only";
		syncedArtifacts: "proof_metadata_and_pr_refs_only";
	};
	requestedAt: number;
	revokedAt?: number;
};

export type ManagedGithubAuditEventDocument = {
	_id: string;
	eventType: "managed_github.requested" | "managed_github.revoked";
	summary: string;
	repositoryLabel: string;
	createdAt: number;
};

export type ManagedGithubExecutionState = {
	consent: ManagedGithubConsentDocument | null;
	auditEvents: ManagedGithubAuditEventDocument[];
};

export type WorkspacePrivacySharingRow = {
	id: string;
	label: string;
	statusLabel: string;
	description: string;
};

export type WorkspaceExecutionSurfaceRow = {
	id:
		| "local_runner"
		| "codex_cloud_handoff"
		| "managed_github"
		| "generated_repo"
		| "codex_app_server";
	label: string;
	statusLabel: string;
	consentLabel: string;
	storageLabel: string;
	commandAuthorityLabel: string;
	providerAccessLabel: string;
	prAuthorityLabel: string;
	proofDeliveryLabel: string;
	syncBoundaryLabel: string;
	failureStateLabel: string;
};

export type WorkspaceManagedGithubBoundaryRow = {
	id: string;
	label: string;
	value: string;
};

export type WorkspaceManagedGithubModel = {
	statusLabel: string;
	repositoryLabel: string;
	repositoryBindingId: string | null;
	consentId: string | null;
	canRequest: boolean;
	canRevoke: boolean;
	boundaryRows: WorkspaceManagedGithubBoundaryRow[];
	auditRows: Array<{
		id: string;
		label: string;
		timestampLabel: string;
	}>;
	actionNote: string;
};

export type WorkspacePrivacyModel = {
	projectId: string | null;
	projectLabel: string;
	repositoryLabel: string;
	runnerId: string | null;
	runnerIdentityLabel: string;
	runnerModeLabel: string;
	runnerHealthLabel: string;
	lastHeartbeatLabel: string;
	lastSyncPreviewLabel: string;
	lastSyncPreviewDigest: string | null;
	localReportRef: string | null;
	structuredFindingsCountLabel: string;
	sharingRows: WorkspacePrivacySharingRow[];
	executionSurfaceRows: WorkspaceExecutionSurfaceRow[];
	canRevokeRunner: boolean;
	canDeleteSyncedFindings: boolean;
	syncedFindingIds: string[];
	managedGithub: WorkspaceManagedGithubModel;
	localReportDeletionNote: string;
};

const workflowDefinitions: WorkflowCatalogDefinition[] = [
	{
		id: "source-truth-agent-readiness",
		name: "Source Truth Agent Readiness",
		category: "Source truth",
		whenUseful:
			"Repo instructions, command maps, or proof contracts are unclear for later agents.",
		requiredPermission: "Docs write",
		typicalProof:
			"Workflow packet, command map, local proof, and next recommendation.",
		riskLevel: "Low",
	},
	{
		id: "observability-debuggability",
		name: "Observability Debuggability",
		category: "Reliability",
		whenUseful:
			"Production failures are hard to inspect or the app lacks useful traces.",
		requiredPermission: "Workspace write for local audit",
		typicalProof:
			"Sync-safe signal audit, proof artifact refs, and provider blocked-proof notes.",
		riskLevel: "Medium",
	},
	{
		id: "proof-harness",
		name: "Proof Harness",
		category: "Proof",
		whenUseful:
			"Install, lint, typecheck, test, or build commands are missing or unreliable.",
		requiredPermission: "Workspace write",
		typicalProof: "Passing command map or blocked command evidence.",
		riskLevel: "Low",
	},
	{
		id: "revenue-path-audit",
		name: "Revenue Path Audit",
		category: "Revenue path",
		whenUseful:
			"Auth, checkout, entitlement, or webhook paths exist and look risky.",
		requiredPermission: "Provider access",
		typicalProof:
			"Safe billing/auth path proof or blocked provider-access report.",
		riskLevel: "High",
	},
	{
		id: "ux-conversion-snapshot",
		name: "UX Conversion Snapshot",
		category: "UX conversion",
		whenUseful:
			"The app boots and activation, landing, or onboarding clarity is likely weak.",
		requiredPermission: "Read only",
		typicalProof: "Screenshot refs, route notes, and ranked UX changes.",
		riskLevel: "Low",
	},
	{
		id: "broken-app-triage",
		name: "Broken App Triage",
		category: "Broken app",
		whenUseful:
			"The customer arrives with a concrete error, failing route, or failing command.",
		requiredPermission: "Workspace write after approval",
		typicalProof:
			"Reproduction proof, root-cause note, patch proof, or blocked proof.",
		riskLevel: "Medium",
	},
	{
		id: "mature-repo-adoption",
		name: "Mature Repo Adoption",
		category: "Adoption",
		whenUseful:
			"An existing repo needs agent-ready source truth, validation mapping, and a first safe adoption plan without starter rewrites.",
		requiredPermission: "Workspace write for local adoption audit",
		typicalProof:
			"Sync-safe convention audit, adoption Program packet, first ExecPlan draft, and blocked-proof notes.",
		riskLevel: "Low",
	},
	{
		id: "test-hardening",
		name: "Test Hardening",
		category: "Testing",
		whenUseful:
			"A narrow high-value behavior needs regression coverage before more loops.",
		requiredPermission: "Workspace write",
		typicalProof: "Focused tests and command proof.",
		riskLevel: "Medium",
	},
];

const workflowLabels = new Map(
	workflowDefinitions.map((definition) => [definition.id, definition.name]),
);

const approvedWorkflowHistoryStatuses = new Set<
	WorkspaceWorkflowRunDocument["status"]
>(["approved", "paused", "running", "proof_completed", "blocked", "canceled"]);

export function buildWorkspaceRunsModel(
	runHistory: WorkspaceRunHistoryState,
	now = Date.now(),
): WorkspaceRunsModel {
	const doctorPassRows = runHistory.doctorPassRuns
		.filter((run) => run.status !== "deleted")
		.map((run) => ({
			id: run._id,
			title: run.localRunId ? `Doctor pass ${run.localRunId}` : "Doctor pass",
			startedLabel: formatTimestamp(run.startedAt),
			runnerModeLabel: formatRunnerMode(run.runnerMode),
			statusLabel: formatStatus(run.status),
			stageLabel: run.currentStage
				? formatStatus(run.currentStage)
				: "Not reported",
			syncStatusLabel: formatStatus(run.syncPreviewStatus),
			findingsCountLabel: String(
				run.findingsCount ?? run.syncPreviewFindingsCount ?? 0,
			),
			blockedReason: run.blockedReason ?? null,
			localReportRef: formatLocalArtifactRef(run.localReportRef),
		}));

	const workflowRows = runHistory.workflowRuns
		.filter((run) => approvedWorkflowHistoryStatuses.has(run.status))
		.map((run) => buildWorkflowRunRow(run, now));

	return {
		doctorPassRows,
		workflowRows,
		totalRuns: doctorPassRows.length + workflowRows.length,
		hasRuns: doctorPassRows.length + workflowRows.length > 0,
	};
}

function buildWorkflowRunRow(
	run: WorkspaceWorkflowRunDocument,
	now: number,
): WorkspaceRunsWorkflowRow {
	return {
		id: run._id,
		workflowId: run.workflowId,
		workflowLabel: getWorkflowLabel(run.workflowId),
		branchLabel: run.branchName ?? "Not created",
		profileLabel: run.profileName ?? "Not selected",
		leaseStatusLabel: formatLeaseStatus(run.writeLeaseExpiresAt, now),
		statusLabel: formatStatus(run.status),
		proofStatusLabel: formatStatus(run.proofStatus),
		deliveryStatusLabel: formatStatus(run.deliveryStatus),
		nextRecommendationLabel: run.nextRecommendedWorkflowId
			? getWorkflowLabel(run.nextRecommendedWorkflowId)
			: "Not set",
		localProofRef: formatLocalArtifactRef(run.localProofRef),
		blockedReason: run.blockedReason ?? null,
	};
}

export function buildWorkspaceLoopsModel({
	findings,
	workflowRuns,
}: {
	findings: WorkspaceFindingDocument[];
	workflowRuns: WorkspaceWorkflowRunDocument[];
}): WorkspaceLoopsModel {
	const visibleFindings = findings
		.filter((finding) => finding.status !== "deleted")
		.sort((left, right) => left.rank - right.rank);
	const recommendedFirst = visibleFindings[0] ?? null;
	const workflowRunsByWorkflowId = groupWorkflowRunsByWorkflowId(workflowRuns);

	const rows = workflowDefinitions.map((definition) => {
		const relatedFindings = visibleFindings.filter(
			(finding) => finding.recommendedWorkflowId === definition.id,
		);
		const firstFinding = relatedFindings[0] ?? null;
		const matchingRuns = workflowRunsByWorkflowId.get(definition.id) ?? [];
		const activeRun = matchingRuns.find(
			(run) => run.status !== "deleted" && run.status !== "canceled",
		);
		const status = getLoopStatus({
			definition,
			relatedFindings,
			recommendedFirst,
		});

		return {
			...definition,
			status,
			statusLabel: getLoopStatusLabel(status),
			relatedFindingCount: relatedFindings.length,
			relatedFindingTitle: firstFinding?.title ?? null,
			relatedFindingHref: firstFinding
				? `${routeConfig.workspaceFindings}/${encodeURIComponent(
						firstFinding.findingId,
					)}`
				: null,
			workflowRunStatusLabel: activeRun
				? `Workflow ${formatStatus(activeRun.status)}`
				: null,
			actionLabel: firstFinding ? ("Review finding" as const) : null,
		};
	});

	return {
		rows,
		packetContractRows: buildWorkflowPacketContractRows(),
		recommendedWorkflow:
			rows.find((row) => row.status === "recommended") ?? null,
		findingBackedCount: rows.filter((row) => row.relatedFindingCount > 0)
			.length,
	};
}

function buildWorkflowPacketContractRows(): WorkspaceWorkflowPacketContractRow[] {
	return [
		{
			id: "evidence",
			label: "Evidence and probes",
			statusLabel: "Required",
			description:
				"Finding evidence, deterministic probes, and local report refs come before Codex judgment.",
		},
		{
			id: "context",
			label: "Customer bottleneck",
			statusLabel: "Bounded text",
			description:
				"Customer urgency, reported failure, or selected finding context stays structured and sync-safe.",
		},
		{
			id: "surface",
			label: "Execution surface",
			statusLabel: "Explicit",
			description:
				"Each packet names local runner, Codex cloud handoff, managed GitHub, generated repo, or app server boundaries.",
		},
		{
			id: "codex",
			label: "Codex interpretation",
			statusLabel: "Optional",
			description:
				"Codex can interpret evidence or write only inside the approved packet and transcript policy.",
		},
		{
			id: "writes",
			label: "Write authority",
			statusLabel: "Scoped",
			description:
				"Allowed and disallowed touch targets, branch target, profile, and write lease must be visible first.",
		},
		{
			id: "proof",
			label: "Proof delivery",
			statusLabel: "Required",
			description:
				"Packets name proof commands, local proof refs, blocked-proof reasons, rollback, and next recommendation.",
		},
		{
			id: "sync",
			label: "Sync policy",
			statusLabel: "Structured only",
			description:
				"Hosted state gets proof metadata, statuses, refs, and audit events, not raw source or full logs.",
		},
		{
			id: "revocation",
			label: "Revocation and stops",
			statusLabel: "Stop safely",
			description:
				"Revoked runners, expired leases, missing providers, dirty worktrees, and refused approvals block with proof.",
		},
	];
}

export function buildWorkspacePrivacyModel({
	setupState,
	syncPreviewState,
	managedGithubState = { consent: null, auditEvents: [] },
	findings,
	now = Date.now(),
}: {
	setupState: WorkspacePrivacySetupState;
	syncPreviewState: WorkspacePrivacySyncPreviewState;
	managedGithubState?: ManagedGithubExecutionState;
	findings: WorkspaceFindingDocument[];
	now?: number;
}): WorkspacePrivacyModel {
	const project = setupState.project;
	const runner = setupState.activeRunner;
	const repository = setupState.repositoryBinding;
	const doctorPassRun = syncPreviewState.doctorPassRun;
	const visibleFindings = findings.filter(
		(finding) => finding.status !== "deleted",
	);

	return {
		projectId: project?._id ?? null,
		projectLabel: project?.displayName ?? "Existing codebase workspace",
		repositoryLabel: formatRepositoryLabel(repository),
		runnerId: runner?._id ?? null,
		runnerIdentityLabel:
			runner?.machineDisplayName ?? runner?.runnerLabel ?? "No runner paired",
		runnerModeLabel: runner
			? formatRunnerMode(runner.runnerMode)
			: "Not paired",
		runnerHealthLabel: runner
			? `${formatStatus(runner.machineHealthStatus)} machine, ${formatStatus(
					runner.projectHealthStatus,
				)} project`
			: "Waiting for runner",
		lastHeartbeatLabel: runner?.lastHeartbeatAt
			? formatRelativeAge(runner.lastHeartbeatAt, now)
			: "No heartbeat yet",
		lastSyncPreviewLabel: doctorPassRun
			? formatStatus(doctorPassRun.syncPreviewStatus)
			: "No sync preview yet",
		lastSyncPreviewDigest: doctorPassRun?.syncPreviewDigest ?? null,
		localReportRef: formatLocalArtifactRef(doctorPassRun?.localReportRef),
		structuredFindingsCountLabel: String(visibleFindings.length),
		sharingRows: buildSharingRows(),
		executionSurfaceRows: buildExecutionSurfaceRows({
			runner,
			managedGithubState,
		}),
		canRevokeRunner: Boolean(
			project?._id && runner?._id && runner.status === "paired",
		),
		canDeleteSyncedFindings: Boolean(
			project?._id && visibleFindings.length > 0,
		),
		syncedFindingIds: visibleFindings.map((finding) => finding._id),
		managedGithub: buildManagedGithubModel({
			repository,
			managedGithubState,
		}),
		localReportDeletionNote:
			"Local `.sbs/` reports stay on the customer machine. The browser can hide synced findings, but it cannot delete local files.",
	};
}

function buildExecutionSurfaceRows({
	runner,
	managedGithubState,
}: {
	runner: WorkspacePrivacySetupState["activeRunner"];
	managedGithubState: ManagedGithubExecutionState;
}): WorkspaceExecutionSurfaceRow[] {
	const localRunnerStatus =
		runner?.status === "paired"
			? "Default active lane"
			: "Available after pairing";
	const managedGithubStatus = managedGithubState.consent
		? `Consent ${formatStatus(managedGithubState.consent.status).toLowerCase()}`
		: "Consent packet only";

	return [
		{
			id: "local_runner",
			label: "Local runner",
			statusLabel: localRunnerStatus,
			consentLabel: "Pairing, sync preview, and workflow approval",
			storageLabel: "Local `.sbs` artifacts; hosted structured state only",
			commandAuthorityLabel:
				"Approved workflow packets on the customer machine",
			providerAccessLabel:
				"Customer-owned local Git, Codex, gh, and provider CLIs",
			prAuthorityLabel:
				"Local branch only unless later handoff approval exists",
			proofDeliveryLabel: "Local proof plus approved proof metadata sync",
			syncBoundaryLabel:
				"Findings, proof status, repo-relative refs, and next steps",
			failureStateLabel:
				"Dirty worktree, expired lease, or missing setup blocks locally",
		},
		{
			id: "codex_cloud_handoff",
			label: "Codex cloud handoff",
			statusLabel: "Customer-owned handoff",
			consentLabel: "Customer connects Codex cloud and selected repositories",
			storageLabel: "SBS stores handoff packet and returned proof metadata",
			commandAuthorityLabel: "Customer runs Codex cloud work outside SBS",
			providerAccessLabel: "Customer-owned OpenAI and GitHub connector setup",
			prAuthorityLabel: "No SBS branch, pull request, CI, or merge authority",
			proofDeliveryLabel: "Customer returns proof links, refs, or summaries",
			syncBoundaryLabel:
				"Handoff status, checklist state, and customer-provided refs",
			failureStateLabel:
				"Missing connector, branch protection, or quota blocks handoff",
		},
		{
			id: "managed_github",
			label: "Managed GitHub",
			statusLabel: managedGithubStatus,
			consentLabel: "Premium concierge request plus later action approval",
			storageLabel: "Consent, audit, proof metadata, and approved refs only",
			commandAuthorityLabel: "No GitHub action runs from consent alone",
			providerAccessLabel: "Selected GitHub repository only after approval",
			prAuthorityLabel:
				"Branch, pull request, and CI actions need separate approval",
			proofDeliveryLabel:
				"Structured proof metadata and approved branch or PR refs",
			syncBoundaryLabel:
				"Consent state, audit events, proof state, and approved refs",
			failureStateLabel:
				"Revocation, missing install, permissions, or proof failure blocks",
		},
		{
			id: "generated_repo",
			label: "Generated repo",
			statusLabel: "Generated-codebase lane",
			consentLabel:
				"Customer enters generated-codebase review and download flow",
			storageLabel: "Product facts, generated artifacts, and review readiness",
			commandAuthorityLabel:
				"Compiler builds owned templates, not customer repo commands",
			providerAccessLabel:
				"Customer configures providers after generated handoff",
			prAuthorityLabel: "No existing customer repository authority",
			proofDeliveryLabel:
				"Review/download artifact and generated validator scripts",
			syncBoundaryLabel:
				"Generated repo files and customer-safe operating pack",
			failureStateLabel:
				"Missing entitlement or failed compiler proof blocks delivery",
		},
		{
			id: "codex_app_server",
			label: "Codex app server",
			statusLabel: "Generation bridge only",
			consentLabel: "Paid user connects ChatGPT/Codex inside the app",
			storageLabel:
				"Hashed-home Codex state, account status, and rate-limit snapshots",
			commandAuthorityLabel: "In-app generation only, not existing-repo repair",
			providerAccessLabel: "No GitHub or provider access by default",
			prAuthorityLabel: "No branch, pull request, CI, or merge authority",
			proofDeliveryLabel:
				"Connection status, health, and generated-output behavior",
			syncBoundaryLabel: "Account health and generation metadata only",
			failureStateLabel:
				"Disabled flag, startup failure, account issue, or rate limit blocks",
		},
	];
}

function buildManagedGithubModel({
	repository,
	managedGithubState,
}: {
	repository: WorkspacePrivacySetupState["repositoryBinding"];
	managedGithubState: ManagedGithubExecutionState;
}): WorkspaceManagedGithubModel {
	const consent = managedGithubState.consent;
	const isGithubRepository = repository?.provider === "github";
	const repositoryLabel = consent
		? `${consent.repositoryAccess.remoteOwner}/${consent.repositoryAccess.remoteName}`
		: formatRepositoryLabel(repository);
	const statusLabel = consent
		? formatStatus(consent.status)
		: isGithubRepository
			? "Available by concierge request"
			: "Requires a GitHub repository";

	return {
		statusLabel,
		repositoryLabel,
		repositoryBindingId: repository?._id ?? null,
		consentId: consent?._id ?? null,
		canRequest: Boolean(isGithubRepository && repository?._id && !consent),
		canRevoke: Boolean(
			consent &&
			(consent.status === "requested" || consent.status === "approved"),
		),
		boundaryRows: buildManagedGithubBoundaryRows(consent),
		auditRows: managedGithubState.auditEvents.map((event) => ({
			id: event._id,
			label: `${formatStatus(event.eventType)}: ${event.summary}`,
			timestampLabel: formatTimestamp(event.createdAt),
		})),
		actionNote:
			"Requesting concierge review records consent only. Ship by Sunday still cannot push, open a PR, rerun CI, or share raw source until a later explicit approval names that action.",
	};
}

function buildManagedGithubBoundaryRows(
	consent: ManagedGithubConsentDocument | null,
): WorkspaceManagedGithubBoundaryRow[] {
	const permissions =
		consent?.installationScope.permissions.join(", ") ??
		"metadata:read, contents:read, pull_requests:write, checks:read, actions:read, statuses:read";

	return [
		{
			id: "repo-access",
			label: "Repo access",
			value: "Selected GitHub repository only",
		},
		{
			id: "installation-scope",
			label: "Installation scope",
			value: permissions,
		},
		{
			id: "storage-policy",
			label: "Storage policy",
			value:
				"Ephemeral clone only while delivering or until revocation; hosted state stores structured metadata, proof status, and PR refs only.",
		},
		{
			id: "pr-authority",
			label: "PR authority",
			value:
				"Branch creation, PR creation, and CI reruns require separate customer approval. Merge authority is never granted.",
		},
		{
			id: "audit-log",
			label: "Audit log",
			value: "Request and revocation are recorded as workspace audit events.",
		},
		{
			id: "revocation",
			label: "Revocation",
			value:
				"Revocation stops managed GitHub eligibility and requires a new consent packet before use resumes.",
		},
		{
			id: "raw-source",
			label: "Raw-source visibility",
			value:
				"Assigned concierge operators may inspect source only after consent; raw source sharing and transcript storage remain disabled by default.",
		},
		{
			id: "proof-boundaries",
			label: "Proof boundaries",
			value:
				"Proof and CI commands are customer-approved only; synced artifacts stay to proof metadata and PR references.",
		},
	];
}

function groupWorkflowRunsByWorkflowId(
	workflowRuns: WorkspaceWorkflowRunDocument[],
) {
	const grouped = new Map<string, WorkspaceWorkflowRunDocument[]>();
	for (const workflowRun of workflowRuns) {
		const current = grouped.get(workflowRun.workflowId) ?? [];
		grouped.set(workflowRun.workflowId, [...current, workflowRun]);
	}
	return grouped;
}

function getLoopStatus({
	definition,
	relatedFindings,
	recommendedFirst,
}: {
	definition: WorkflowCatalogDefinition;
	relatedFindings: WorkspaceFindingDocument[];
	recommendedFirst: WorkspaceFindingDocument | null;
}): WorkspaceLoopCatalogRow["status"] {
	if (relatedFindings.length === 0) {
		return "future";
	}

	if (relatedFindings.every((finding) => finding.status === "blocked")) {
		return "blocked";
	}

	if (recommendedFirst?.recommendedWorkflowId === definition.id) {
		return "recommended";
	}

	return "available_now";
}

function getLoopStatusLabel(status: WorkspaceLoopCatalogRow["status"]) {
	switch (status) {
		case "recommended":
			return "recommended";
		case "available_now":
			return "available now";
		case "blocked":
			return "blocked";
		case "future":
			return "future";
	}
}

function buildSharingRows(): WorkspacePrivacySharingRow[] {
	return [
		{
			id: "raw-source",
			label: "Raw source sharing",
			statusLabel: "Disabled",
			description:
				"Source files and snippets stay local unless a later explicit sharing approval exists.",
		},
		{
			id: "raw-terminal-logs",
			label: "Raw terminal log sharing",
			statusLabel: "Disabled",
			description:
				"Command output and local logs stay in local reports by default.",
		},
		{
			id: "codex-transcripts",
			label: "Codex transcript sharing",
			statusLabel: "Disabled",
			description:
				"Codex JSONL streams and session history are not synced to the workspace.",
		},
		{
			id: "screenshots",
			label: "Screenshot sharing",
			statusLabel: "Disabled",
			description:
				"Screenshots require a later explicit approval before upload.",
		},
		{
			id: "structured-findings",
			label: "Structured findings",
			statusLabel: "Approval required",
			description:
				"Approved finding fields, proof status, command names, and repo-relative refs can sync.",
		},
	];
}

function formatLocalArtifactRef(ref: string | undefined) {
	if (!ref) {
		return null;
	}

	if (containsUnsafeLocalDisplayValue(ref)) {
		return "Local ref hidden";
	}

	return ref;
}

function containsUnsafeLocalDisplayValue(value: string) {
	return (
		value.startsWith("/") ||
		value.startsWith("~/") ||
		/^[A-Za-z]:[\\/]/.test(value) ||
		value.startsWith("\\\\") ||
		/(^|[\s"'`([{<:=])\/(?:Users|home|private|tmp|var\/folders|Volumes|workspace|workspaces|mnt|repo|repos)[\\/]/i.test(
			value,
		) ||
		/(sk_(live|test)_[A-Za-z0-9]{8,})/.test(value) ||
		/(gh[pousr]_[A-Za-z0-9_]{8,})/.test(value) ||
		/[A-Z0-9_]*(API_KEY|SECRET|TOKEN)=/.test(value)
	);
}

function formatRepositoryLabel(
	repository: WorkspacePrivacySetupState["repositoryBinding"],
) {
	if (!repository) {
		return "No repository binding yet";
	}

	const remoteName = [repository.remoteOwner, repository.remoteName]
		.filter(Boolean)
		.join("/");
	return remoteName || repository.displayName;
}

function formatLeaseStatus(expiresAt: number | undefined, now: number) {
	if (!expiresAt) {
		return "No active lease";
	}

	if (expiresAt <= now) {
		return "Lease expired";
	}

	const minutes = Math.max(1, Math.ceil((expiresAt - now) / 60_000));
	return `Lease active ${minutes} min`;
}

function formatRelativeAge(timestamp: number, now: number) {
	const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
	if (seconds < 60) {
		return `${seconds}s ago`;
	}

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes}m ago`;
	}

	const hours = Math.floor(minutes / 60);
	return `${hours}h ago`;
}

function formatTimestamp(timestamp: number) {
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) {
		return "Unknown";
	}

	return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function formatRunnerMode(mode: "daemon" | "one_shot") {
	return mode === "one_shot" ? "One-shot" : "Daemon";
}

function getWorkflowLabel(workflowId: string) {
	return workflowLabels.get(workflowId) ?? formatStatus(workflowId);
}

function formatStatus(status: string) {
	return status
		.replaceAll("_", " ")
		.replaceAll("-", " ")
		.replaceAll(".", " ")
		.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
