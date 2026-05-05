import { routeConfig } from "@/config/product";

export type WorkspaceFindingStatus =
	| "ready"
	| "blocked"
	| "needs_approval"
	| "running"
	| "done"
	| "deleted";

export type WorkspaceFindingCategory =
	| "source_truth"
	| "setup"
	| "proof"
	| "revenue_path"
	| "observability"
	| "ux_conversion"
	| "broken_app"
	| "performance"
	| "security"
	| "testing"
	| "other";

export type WorkspaceFindingEvidenceRef =
	| {
			kind: "file";
			repoRelativePath: string;
			lineStart?: number;
			lineEnd?: number;
			summary?: string;
	  }
	| {
			kind: "command";
			commandName: string;
			summary?: string;
	  }
	| {
			kind: "artifact";
			artifactId: string;
			localReportRef?: string;
			summary?: string;
	  }
	| {
			kind: "package";
			packageName: string;
			summary?: string;
	  };

export type WorkspaceFindingDocument = {
	_id: string;
	findingId: string;
	rank: number;
	status: WorkspaceFindingStatus;
	title: string;
	category: WorkspaceFindingCategory;
	severity: "critical" | "high" | "medium" | "low";
	confidence: number;
	buyerImpact: string;
	blastRadius: "none" | "low" | "medium" | "high";
	proofPath: string;
	proofability: "clear" | "partial" | "blocked";
	permissionRequired:
		| "read_only"
		| "docs_write"
		| "workspace_write"
		| "network"
		| "provider_access"
		| "managed_github";
	recommendedWorkflowId: string;
	whyThisNow: string;
	evidenceRefs: WorkspaceFindingEvidenceRef[];
	blockedReason?: string;
	syncSensitivity: "low" | "medium" | "high";
	localReportRef: string;
};

export type WorkspaceFindingsFilterState = {
	category: WorkspaceFindingCategory | "all";
	status: Exclude<WorkspaceFindingStatus, "deleted"> | "all";
};

export type WorkspaceFindingsFilterOption = {
	value: string;
	label: string;
	count: number;
};

export type WorkspaceFindingLedgerRow = {
	documentId: string;
	findingId: string;
	href: string;
	rank: number;
	rankLabel: string;
	title: string;
	category: WorkspaceFindingCategory;
	categoryLabel: string;
	severityLabel: string;
	confidenceLabel: string;
	buyerImpact: string;
	proofPath: string;
	proofabilityLabel: string;
	permissionRequiredLabel: string;
	recommendedWorkflowLabel: string;
	status: Exclude<WorkspaceFindingStatus, "deleted">;
	statusLabel: string;
	recommendedFirst: boolean;
	blockedReason: string | null;
	localReportRef: string;
};

export type WorkspaceFindingsLedgerModel = {
	rows: WorkspaceFindingLedgerRow[];
	allRows: WorkspaceFindingLedgerRow[];
	totalCount: number;
	filteredCount: number;
	recommendedFirst: WorkspaceFindingLedgerRow | null;
	categoryOptions: WorkspaceFindingsFilterOption[];
	statusOptions: WorkspaceFindingsFilterOption[];
	activeFilters: WorkspaceFindingsFilterState;
};

export type WorkspaceFindingEvidenceView = {
	id: string;
	kindLabel: string;
	refLabel: string;
};

export type WorkspaceFindingDetailModel = WorkspaceFindingLedgerRow & {
	whyNow: string;
	blastRadiusLabel: string;
	syncSensitivityLabel: string;
	evidenceRefs: WorkspaceFindingEvidenceView[];
	expectedOutputs: string[];
	allowedTouchTargets: string[];
	disallowedTouchTargets: string[];
	syncPolicy: string;
	blockedConditions: string[];
	copyEvidenceRef: string;
	workflowApproval: WorkspaceWorkflowApprovalModel;
};

export type WorkspaceWorkflowApprovalModel = {
	workflowId: string;
	isSupportedByLocalRunner: boolean;
	workflowKind:
		| "source_truth"
		| "observability_debuggability"
		| "broken_app_readonly"
		| "mature_repo_adoption"
		| "docs_spine_adoption"
		| "generic";
	workflowCommandName: string;
	confirmationFlag: string;
	workflowVersion: string;
	branchName: string;
	profileName: string;
	writeLeaseDurationMinutes: number;
	dirtyStatePolicy: "require_clean_worktree";
	expectedOutputs: string[];
	allowedTouchTargets: string[];
	disallowedTouchTargets: string[];
	proofCommands: string[];
	syncPolicySummary: string;
	stopConditions: string[];
	rollbackNotes: string;
	localWorkflowPacketRef: string;
	localProofRef: string;
};

const statusOrder: Exclude<WorkspaceFindingStatus, "deleted">[] = [
	"ready",
	"needs_approval",
	"blocked",
	"running",
	"done",
];

const categoryLabels: Record<WorkspaceFindingCategory, string> = {
	source_truth: "Source truth",
	setup: "Setup",
	proof: "Proof",
	revenue_path: "Revenue path",
	observability: "Observability",
	ux_conversion: "UX conversion",
	broken_app: "Broken app",
	performance: "Performance",
	security: "Security",
	testing: "Testing",
	other: "Other",
};

const statusLabels: Record<
	Exclude<WorkspaceFindingStatus, "deleted">,
	string
> = {
	ready: "ready",
	blocked: "blocked",
	needs_approval: "needs approval",
	running: "running",
	done: "done",
};

const permissionLabels: Record<
	WorkspaceFindingDocument["permissionRequired"],
	string
> = {
	read_only: "Read only",
	docs_write: "Docs write",
	workspace_write: "Workspace write",
	network: "Network",
	provider_access: "Provider access",
	managed_github: "Managed GitHub",
};

const proofabilityLabels: Record<
	WorkspaceFindingDocument["proofability"],
	string
> = {
	clear: "Clear proof",
	partial: "Partial proof",
	blocked: "Blocked proof",
};

const sensitivityLabels: Record<
	WorkspaceFindingDocument["syncSensitivity"],
	string
> = {
	low: "Low sensitivity",
	medium: "Medium sensitivity",
	high: "High sensitivity",
};

const blastRadiusLabels: Record<
	WorkspaceFindingDocument["blastRadius"],
	string
> = {
	none: "No app change",
	low: "Low blast radius",
	medium: "Medium blast radius",
	high: "High blast radius",
};

const workflowLabels: Record<string, string> = {
	"source-truth-agent-readiness": "Source Truth Agent Readiness",
	"observability-debuggability": "Observability Debuggability",
	"broken-app-triage": "Broken App Triage",
	"mature-repo-adoption": "Mature Repo Adoption",
	"docs-spine-adoption": "Docs Spine Adoption",
	"revenue-path-audit": "Revenue Path Audit",
	"ux-conversion-snapshot": "UX Conversion Snapshot",
	"proof-harness": "Proof Harness",
	"test-hardening": "Test Hardening",
};

const supportedLocalRunnerWorkflowIds = [
	"source-truth-agent-readiness",
	"observability-debuggability",
	"broken-app-triage",
	"mature-repo-adoption",
	"docs-spine-adoption",
] as const;

const supportedLocalRunnerWorkflowIdSet = new Set<string>(
	supportedLocalRunnerWorkflowIds,
);

const defaultFilters: WorkspaceFindingsFilterState = {
	category: "all",
	status: "all",
};

export function buildWorkspaceFindingsLedgerModel(
	findings: WorkspaceFindingDocument[],
	filters: Partial<WorkspaceFindingsFilterState> = {},
): WorkspaceFindingsLedgerModel {
	const activeFilters = {
		...defaultFilters,
		...filters,
	};
	const allRows = findings
		.filter(
			(
				finding,
			): finding is WorkspaceFindingDocument & {
				status: Exclude<WorkspaceFindingStatus, "deleted">;
			} => finding.status !== "deleted",
		)
		.sort((left, right) => left.rank - right.rank)
		.map((finding, index) => buildLedgerRow(finding, index === 0));
	const rows = allRows.filter((row) => {
		const categoryMatches =
			activeFilters.category === "all" ||
			row.category === activeFilters.category;
		const statusMatches =
			activeFilters.status === "all" || row.status === activeFilters.status;
		return categoryMatches && statusMatches;
	});

	return {
		rows,
		allRows,
		totalCount: allRows.length,
		filteredCount: rows.length,
		recommendedFirst: allRows[0] ?? null,
		categoryOptions: buildCategoryOptions(allRows),
		statusOptions: buildStatusOptions(allRows),
		activeFilters,
	};
}

export function buildWorkspaceFindingDetailModel(
	findings: WorkspaceFindingDocument[],
	findingRouteId: string,
	approvalTimestamp = Date.now(),
): WorkspaceFindingDetailModel | null {
	const decodedRouteId = decodeURIComponent(findingRouteId);
	const ledgerModel = buildWorkspaceFindingsLedgerModel(findings);
	const row = ledgerModel.allRows.find(
		(candidate) =>
			candidate.findingId === decodedRouteId ||
			candidate.documentId === decodedRouteId,
	);
	const finding = findings.find(
		(candidate) => candidate._id === row?.documentId,
	);

	if (!row || !finding || finding.status === "deleted") {
		return null;
	}

	const evidenceRefs = finding.evidenceRefs.map(formatEvidenceRef);
	const copyEvidenceRef =
		evidenceRefs[0]?.refLabel ?? finding.localReportRef ?? finding.findingId;
	const expectedOutputs = getExpectedOutputs(finding.recommendedWorkflowId);
	const allowedTouchTargets = getAllowedTouchTargets(
		finding.recommendedWorkflowId,
	);
	const disallowedTouchTargets = getDisallowedTouchTargets(
		finding.recommendedWorkflowId,
	);
	const syncPolicySummary = getWorkflowSyncPolicySummary(
		finding.recommendedWorkflowId,
	);

	return {
		...row,
		whyNow: finding.whyThisNow,
		blastRadiusLabel: blastRadiusLabels[finding.blastRadius],
		syncSensitivityLabel: sensitivityLabels[finding.syncSensitivity],
		evidenceRefs,
		expectedOutputs,
		allowedTouchTargets,
		disallowedTouchTargets,
		syncPolicy: syncPolicySummary,
		blockedConditions: getBlockedConditions(finding),
		copyEvidenceRef,
		workflowApproval: buildWorkflowApprovalModel({
			workflowId: finding.recommendedWorkflowId,
			approvalTimestamp,
			expectedOutputs,
			allowedTouchTargets,
			disallowedTouchTargets,
			syncPolicySummary,
		}),
	};
}

function buildLedgerRow(
	finding: WorkspaceFindingDocument & {
		status: Exclude<WorkspaceFindingStatus, "deleted">;
	},
	recommendedFirst: boolean,
): WorkspaceFindingLedgerRow {
	return {
		documentId: finding._id,
		findingId: finding.findingId,
		href: `${routeConfig.workspaceFindings}/${encodeURIComponent(
			finding.findingId,
		)}`,
		rank: finding.rank,
		rankLabel: `#${finding.rank}`,
		title: finding.title,
		category: finding.category,
		categoryLabel: categoryLabels[finding.category],
		severityLabel: toTitleCase(finding.severity),
		confidenceLabel: `${Math.round(finding.confidence * 100)}%`,
		buyerImpact: finding.buyerImpact,
		proofPath: finding.proofPath,
		proofabilityLabel: proofabilityLabels[finding.proofability],
		permissionRequiredLabel: permissionLabels[finding.permissionRequired],
		recommendedWorkflowLabel: getWorkflowLabel(finding.recommendedWorkflowId),
		status: finding.status,
		statusLabel: statusLabels[finding.status],
		recommendedFirst,
		blockedReason: finding.blockedReason ?? null,
		localReportRef: finding.localReportRef,
	};
}

function buildCategoryOptions(rows: WorkspaceFindingLedgerRow[]) {
	const counts = new Map<WorkspaceFindingCategory, number>();
	for (const row of rows) {
		counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
	}

	return [
		{ value: "all", label: "All categories", count: rows.length },
		...Array.from(counts.entries())
			.sort(([left], [right]) =>
				categoryLabels[left].localeCompare(categoryLabels[right]),
			)
			.map(([value, count]) => ({
				value,
				label: categoryLabels[value],
				count,
			})),
	];
}

function buildStatusOptions(rows: WorkspaceFindingLedgerRow[]) {
	const counts = new Map<Exclude<WorkspaceFindingStatus, "deleted">, number>();
	for (const row of rows) {
		counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
	}

	return [
		{ value: "all", label: "All statuses", count: rows.length },
		...statusOrder
			.filter((status) => counts.has(status))
			.map((value) => ({
				value,
				label: statusLabels[value],
				count: counts.get(value) ?? 0,
			})),
	];
}

function formatEvidenceRef(
	ref: WorkspaceFindingEvidenceRef,
	index: number,
): WorkspaceFindingEvidenceView {
	switch (ref.kind) {
		case "file":
			return {
				id: `evidence-${index}`,
				kindLabel: "File ref",
				refLabel: formatFileRef(ref),
			};
		case "command":
			return {
				id: `evidence-${index}`,
				kindLabel: "Command ref",
				refLabel: ref.commandName,
			};
		case "artifact":
			return {
				id: `evidence-${index}`,
				kindLabel: "Artifact ref",
				refLabel: ref.localReportRef
					? `${ref.artifactId} -> ${ref.localReportRef}`
					: ref.artifactId,
			};
		case "package":
			return {
				id: `evidence-${index}`,
				kindLabel: "Package ref",
				refLabel: ref.packageName,
			};
	}
}

function formatFileRef(
	ref: Extract<WorkspaceFindingEvidenceRef, { kind: "file" }>,
) {
	if (!ref.lineStart) {
		return ref.repoRelativePath;
	}

	if (!ref.lineEnd || ref.lineEnd === ref.lineStart) {
		return `${ref.repoRelativePath}:${ref.lineStart}`;
	}

	return `${ref.repoRelativePath}:${ref.lineStart}-${ref.lineEnd}`;
}

function getExpectedOutputs(workflowId: string) {
	if (workflowId === "source-truth-agent-readiness") {
		return [
			"source-truth workflow packet",
			"repo instruction update after terminal confirmation",
			"command and proof map artifact",
			"local proof or blocked-proof summary",
			"next recommended workflow",
		];
	}
	if (workflowId === "broken-app-triage") {
		return [
			"read-only diagnostics packet",
			"blocked reproduction report when the failing command is not safe",
			"patch approval boundary for a later write phase",
			"local proof or blocked-proof summary",
		];
	}
	if (workflowId === "observability-debuggability") {
		return [
			"observability workflow packet",
			"sync-safe debuggability audit",
			"provider setup and dashboard access blocked-proof notes",
			"local proof or blocked-proof summary",
			"next recommended workflow",
		];
	}
	if (workflowId === "mature-repo-adoption") {
		return [
			"mature repo adoption workflow packet",
			"sync-safe repo convention audit",
			"adoption Program packet draft",
			"first child ExecPlan draft",
			"local proof or blocked-proof summary",
		];
	}
	if (workflowId === "docs-spine-adoption") {
		return [
			"docs spine adoption workflow packet",
			"docs spine adoption manifest",
			"repo facts and scanner artifacts",
			"bounded Codex synthesis packets",
			"local proof or blocked-proof summary",
			"sync preview metadata",
		];
	}

	return [
		"scoped workflow packet",
		"local diff or blocked-proof summary after approval",
		"proof command summary",
		"next recommended workflow",
	];
}

function getAllowedTouchTargets(workflowId: string) {
	if (workflowId === "source-truth-agent-readiness") {
		return [
			"root AGENTS.md when terminal confirmation is present",
			".sbs/runs/<workflow-run-id> workflow artifacts",
			".sbs/source-truth command and proof maps",
			"README or setup docs tied to agent readiness",
		];
	}
	if (workflowId === "broken-app-triage") {
		return [
			".sbs/runs/<workflow-run-id> workflow artifacts",
			".sbs/broken-app-triage diagnostics reports",
			"repo-relative proof metadata only",
		];
	}
	if (workflowId === "observability-debuggability") {
		return [
			".sbs/runs/<workflow-run-id> workflow artifacts",
			".sbs/observability debuggability audit artifacts",
			"repo-relative observability signal metadata only",
		];
	}
	if (workflowId === "mature-repo-adoption") {
		return [
			".sbs/runs/<workflow-run-id>/**",
			".sbs/mature-repo/**",
			"repo convention metadata only",
		];
	}
	if (workflowId === "docs-spine-adoption") {
		return [".sbs/runs/<workflow-run-id>/**", ".sbs/docs-spine-adoption/**"];
	}

	return [
		"finding-scoped files after approval",
		".sbs workflow artifacts",
		"proof metadata tied to the workflow packet",
	];
}

function getDisallowedTouchTargets(workflowId: string) {
	const disallowedTouchTargets = [
		"runtime app code",
		"environment files",
		"dependency manifests",
		"dependency locks",
		"database migrations",
		"provider configuration",
		"generated folders",
		"package scripts",
	];
	if (
		workflowId !== "mature-repo-adoption" &&
		workflowId !== "docs-spine-adoption"
	) {
		return disallowedTouchTargets;
	}
	const localRunnerDisallowedTargets = [
		...disallowedTouchTargets,
		"root agent instructions",
		"CI configuration",
		"CI-affecting commands",
		"branch pushes",
		"pull requests",
		"raw logs",
		"raw source",
		"Codex transcripts",
	];
	if (workflowId === "docs-spine-adoption") {
		return [
			...disallowedTouchTargets,
			"root agent instructions",
			"CI configuration",
			"CI-affecting commands",
			"docs spine Markdown application",
			"branch pushes",
			"pull requests",
			"raw logs",
			"raw source",
			"Codex transcripts",
		];
	}
	return localRunnerDisallowedTargets;
}

function getWorkflowSyncPolicySummary(workflowId: string) {
	if (workflowId === "docs-spine-adoption") {
		return "Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, docs drafts, and Codex session history stay on the machine.";
	}
	return "Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, and Codex session history stay on the machine.";
}

function buildWorkflowApprovalModel({
	workflowId,
	approvalTimestamp,
	expectedOutputs,
	allowedTouchTargets,
	disallowedTouchTargets,
	syncPolicySummary,
}: {
	workflowId: string;
	approvalTimestamp: number;
	expectedOutputs: string[];
	allowedTouchTargets: string[];
	disallowedTouchTargets: string[];
	syncPolicySummary: string;
}): WorkspaceWorkflowApprovalModel {
	const workflowKind = getWorkflowKind(workflowId);
	return {
		workflowId,
		isSupportedByLocalRunner: isLocalRunnerWorkflowSupported(workflowId),
		workflowKind,
		workflowCommandName: getWorkflowCommandName(workflowId),
		confirmationFlag: getWorkflowConfirmationFlag(workflowId),
		workflowVersion: "v1",
		branchName: getWorkflowBranchName(workflowId, approvalTimestamp),
		profileName:
			workflowKind === "broken_app_readonly"
				? "sbs-doctor-readonly"
				: "sbs-workspace-write",
		writeLeaseDurationMinutes: 30,
		dirtyStatePolicy: "require_clean_worktree",
		expectedOutputs,
		allowedTouchTargets,
		disallowedTouchTargets,
		proofCommands: getWorkflowProofCommands(workflowId),
		syncPolicySummary,
		stopConditions: getWorkflowStopConditions(workflowId),
		rollbackNotes: getWorkflowRollbackNotes(workflowKind),
		localWorkflowPacketRef: ".sbs/runs/<workflow-run-id>/workflow-packet.json",
		localProofRef: ".sbs/runs/<workflow-run-id>/proof.json",
	};
}

export function isLocalRunnerWorkflowSupported(workflowId: string) {
	return supportedLocalRunnerWorkflowIdSet.has(workflowId);
}

function getWorkflowKind(
	workflowId: string,
): WorkspaceWorkflowApprovalModel["workflowKind"] {
	if (workflowId === "source-truth-agent-readiness") {
		return "source_truth";
	}
	if (workflowId === "broken-app-triage") {
		return "broken_app_readonly";
	}
	if (workflowId === "observability-debuggability") {
		return "observability_debuggability";
	}
	if (workflowId === "mature-repo-adoption") {
		return "mature_repo_adoption";
	}
	if (workflowId === "docs-spine-adoption") {
		return "docs_spine_adoption";
	}
	return "generic";
}

function getWorkflowCommandName(workflowId: string) {
	if (workflowId === "source-truth-agent-readiness") {
		return "source-truth-readiness";
	}
	return workflowId;
}

function getWorkflowConfirmationFlag(workflowId: string) {
	if (workflowId === "broken-app-triage") {
		return "--confirm-read-only-reproduction";
	}
	if (workflowId === "observability-debuggability") {
		return "--confirm-observability-audit";
	}
	if (workflowId === "mature-repo-adoption") {
		return "--confirm-adoption-audit";
	}
	if (workflowId === "docs-spine-adoption") {
		return "--confirm-docs-spine-adoption";
	}
	return "--confirm-local-writes";
}

function getWorkflowBranchName(workflowId: string, approvalTimestamp: number) {
	if (workflowId === "source-truth-agent-readiness") {
		return `sbs/source-truth-readiness-${formatBranchTimestamp(approvalTimestamp)}`;
	}
	if (workflowId === "broken-app-triage") {
		return `sbs/broken-app-triage-${formatBranchTimestamp(approvalTimestamp)}`;
	}
	if (workflowId === "mature-repo-adoption") {
		return `sbs/mature-repo-adoption-${formatBranchTimestamp(approvalTimestamp)}`;
	}
	if (workflowId === "docs-spine-adoption") {
		return `sbs/docs-spine-adoption-${formatBranchTimestamp(approvalTimestamp)}`;
	}
	return `sbs/${workflowId}-${formatBranchTimestamp(approvalTimestamp)}`;
}

function getWorkflowProofCommands(workflowId: string) {
	if (workflowId === "broken-app-triage") {
		return ["git status --short", "git diff --name-only"];
	}

	return ["git status --short", "git diff --name-only", "git diff --check"];
}

function getWorkflowStopConditions(workflowId: string) {
	if (workflowId === "broken-app-triage") {
		return [
			"worktree is dirty before diagnostics start",
			"write lease expires before diagnostics start",
			"no approved read-only diagnostic command is available",
			"diagnostic command times out",
			"fix requires patching before a separate patch approval exists",
		];
	}
	if (workflowId === "observability-debuggability") {
		return [
			"worktree is dirty before branch creation",
			"write lease expires before local audit starts",
			"requested work needs runtime code, provider setup, dependencies, package scripts, CI, PRs, source maps, dashboards, or deployment proof",
			"proof command fails",
		];
	}
	if (workflowId === "mature-repo-adoption") {
		return [
			"worktree is dirty before branch creation",
			"write lease expires before adoption audit starts",
			"requested work needs generated-starter rewrites, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
			"proof command fails",
		];
	}
	if (workflowId === "docs-spine-adoption") {
		return [
			"worktree is dirty before docs spine scaffold starts",
			"write lease expires before docs spine scaffold starts",
			"requested work needs docs application, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
			"proof command fails",
		];
	}

	return [
		"worktree is dirty before branch creation",
		"write lease expires before local writes finish",
		"requested edit leaves the approved docs and .sbs boundary",
		"proof command fails",
	];
}

function getWorkflowRollbackNotes(
	workflowKind: WorkspaceWorkflowApprovalModel["workflowKind"],
) {
	if (workflowKind === "broken_app_readonly") {
		return "This phase does not patch source files. Review the local diagnostics proof, then approve a separate patch workflow if the root cause is clear.";
	}
	if (workflowKind === "observability_debuggability") {
		return "Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the observability branch after reviewing local proof.";
	}
	if (workflowKind === "mature_repo_adoption") {
		return "Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the mature adoption branch after reviewing local proof.";
	}
	if (workflowKind === "docs_spine_adoption") {
		return "Review the local .sbs docs-spine artifacts. Roll back by deleting the .sbs docs-spine run artifacts for this workflow run.";
	}
	return "Keep the branch local by default. Roll back with git switch back to the base branch and git branch -D the source-truth branch after reviewing local proof.";
}

function formatBranchTimestamp(timestamp: number) {
	const date = new Date(timestamp);
	const pad = (value: number) => value.toString().padStart(2, "0");
	return [
		date.getUTCFullYear(),
		pad(date.getUTCMonth() + 1),
		pad(date.getUTCDate()),
		"-",
		pad(date.getUTCHours()),
		pad(date.getUTCMinutes()),
	].join("");
}

function getBlockedConditions(finding: WorkspaceFindingDocument) {
	const blockedConditions = [
		"local runner is not paired",
		"required permission is not approved",
		"proof command cannot be identified",
	];

	if (finding.blockedReason) {
		return [finding.blockedReason, ...blockedConditions];
	}

	if (finding.permissionRequired === "provider_access") {
		return ["provider access is missing", ...blockedConditions];
	}

	if (finding.permissionRequired === "managed_github") {
		return ["managed GitHub access is not approved", ...blockedConditions];
	}

	return blockedConditions;
}

function getWorkflowLabel(workflowId: string) {
	return (
		workflowLabels[workflowId] ?? toTitleCase(workflowId.replaceAll("-", " "))
	);
}

function toTitleCase(value: string) {
	return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
