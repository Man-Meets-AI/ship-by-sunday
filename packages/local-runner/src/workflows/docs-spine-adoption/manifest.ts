export const DOCS_SPINE_ADOPTION_WORKFLOW_ID = "docs-spine-adoption";
export const DOCS_SPINE_ADOPTION_WORKFLOW_VERSION = "v1";
export const DOCS_SPINE_ADOPTION_PROFILE_NAME = "sbs-workspace-write";
export const DOCS_SPINE_ADOPTION_CONFIRMATION_FLAG =
	"--confirm-docs-spine-adoption";
export const DOCS_SPINE_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID =
	"docs-spine-apply-and-proof";

export const DOCS_SPINE_ADOPTION_EXPECTED_OUTPUTS = [
	"docs spine adoption workflow packet",
	"docs spine adoption manifest",
	"repo facts and scanner artifacts",
	"bounded Codex synthesis packets",
	"local proof or blocked-proof summary",
	"sync preview metadata",
] as const;

export const DOCS_SPINE_ADOPTION_ALLOWED_TOUCH_TARGETS = [
	".sbs/runs/<workflow-run-id>/**",
	".sbs/docs-spine-adoption/**",
] as const;

export const DOCS_SPINE_ADOPTION_DISALLOWED_TOUCH_TARGETS = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"dependency locks",
	"database migrations",
	"provider configuration",
	"generated folders",
	"package scripts",
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"docs spine Markdown application",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"Codex transcripts",
] as const;

export const DOCS_SPINE_ADOPTION_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
] as const;

export const DOCS_SPINE_ADOPTION_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Local code, command output, docs drafts, and Codex session history stay on the machine.";

export const DOCS_SPINE_ADOPTION_STOP_CONDITIONS = [
	"worktree is dirty before docs spine scaffold starts",
	"write lease expires before docs spine scaffold starts",
	"requested work needs docs application, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
	"proof command fails",
] as const;

export const DOCS_SPINE_ADOPTION_ROLLBACK_NOTES =
	"Review the local .sbs docs-spine artifacts. Roll back by deleting the .sbs docs-spine run artifacts for this workflow run.";

export const DOCS_SPINE_ADOPTION_PROVIDER_ACCESS_POLICY =
	"Provider access is disabled. Missing provider setup, dashboard access, dependency installs, migrations, CI changes, branch pushes, and pull requests require a later explicit workflow packet.";

export const DOCS_SPINE_ADOPTION_PROOF_DELIVERY =
	"Proof stays local under .sbs/runs/<workflow-run-id>/** and .sbs/docs-spine-adoption/**. Hosted sync receives only sync-safe proof metadata and artifact refs.";

export const DOCS_SPINE_ADOPTION_REVOCATION_BEHAVIOR =
	"Runner revocation, write lease expiry, dirty worktree, or work needing wider authority stops execution and writes blocked proof instead of escalating permissions.";

export const DOCS_SPINE_ADOPTION_PHASES = [
	"approval-packet",
	"lease-and-worktree-guard",
	"manifest-scaffold",
	"minimal-facts",
	"scanner-facts",
	"codex-synthesis-packets",
	"docs-spine-quality-eval",
	"proof",
] as const;

export const DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS = {
	workflowPacket: ".sbs/runs/<workflow-run-id>/workflow-packet.json",
	proof: ".sbs/runs/<workflow-run-id>/proof.json",
	syncPreview: ".sbs/runs/<workflow-run-id>/sync-preview.json",
	manifest: ".sbs/docs-spine-adoption/manifest.json",
	repoFacts: ".sbs/docs-spine-adoption/facts/repo-facts.json",
	sourceTruthMap: ".sbs/docs-spine-adoption/facts/source-truth-map.json",
	commandProofMap: ".sbs/docs-spine-adoption/facts/command-proof-map.json",
	docsGapReport: ".sbs/docs-spine-adoption/facts/docs-gap-report.json",
	architectureSignals:
		".sbs/docs-spine-adoption/facts/architecture-signals.json",
	securitySignals: ".sbs/docs-spine-adoption/facts/security-signals.json",
	qualityScoreBaseline:
		".sbs/docs-spine-adoption/facts/quality-score-baseline.json",
	instructionSurfaceMap:
		".sbs/docs-spine-adoption/facts/instruction-surface-map.json",
	skillTriggerMap: ".sbs/docs-spine-adoption/facts/skill-trigger-map.json",
	generatedSurfaceMap:
		".sbs/docs-spine-adoption/facts/generated-surface-map.json",
	validationSurfaceMap:
		".sbs/docs-spine-adoption/facts/validation-surface-map.json",
	performanceTimings: ".sbs/docs-spine-adoption/facts/performance-timings.json",
	parityChecklist: ".sbs/docs-spine-adoption/facts/parity-checklist.json",
	qualityReport: ".sbs/docs-spine-adoption/facts/quality-report.json",
	codexSynthesisPacket:
		".sbs/docs-spine-adoption/drafts/codex-synthesis-packet.json",
	docsIndexDraft: ".sbs/docs-spine-adoption/drafts/docs-index-draft.json",
	programPacketDraft:
		".sbs/docs-spine-adoption/drafts/program-packet-draft.json",
	execPlanDraft: ".sbs/docs-spine-adoption/drafts/exec-plan-draft.json",
	agentInstructionsDraft:
		".sbs/docs-spine-adoption/drafts/agent-instructions-draft.json",
	promptAssetsDraft: ".sbs/docs-spine-adoption/drafts/prompt-assets-draft.json",
	validationProofNotes:
		".sbs/docs-spine-adoption/drafts/validation-proof-notes.json",
	qualityScoreNotes: ".sbs/docs-spine-adoption/drafts/quality-score-notes.json",
	parityChecklistDraft:
		".sbs/docs-spine-adoption/drafts/parity-checklist-draft.json",
} as const;

export const DOCS_SPINE_ADOPTION_PERFORMANCE_BUDGETS = {
	scaffoldMs: 10_000,
	gitProofMs: 10_000,
} as const;
