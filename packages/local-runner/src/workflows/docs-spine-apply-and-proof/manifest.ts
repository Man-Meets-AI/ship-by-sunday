export const DOCS_SPINE_APPLY_WORKFLOW_ID = "docs-spine-apply-and-proof";
export const DOCS_SPINE_APPLY_WORKFLOW_VERSION = "v1";
export const DOCS_SPINE_APPLY_PROFILE_NAME = "sbs-workspace-write";
export const DOCS_SPINE_APPLY_CONFIRMATION_FLAG = "--confirm-docs-spine-apply";

export const DOCS_SPINE_APPLY_EXPECTED_OUTPUTS = [
	"docs spine apply workflow packet",
	"approved docs-spine draft application or blocked-proof summary",
	"local docs proof summary",
	"sync preview metadata",
] as const;

export const DOCS_SPINE_APPLY_ALLOWED_TOUCH_TARGETS = [
	".sbs/runs/<workflow-run-id>/**",
	".sbs/docs-spine-adoption/**",
	"docs/index.md",
	"docs/programs/**",
	"docs/exec-plans/**",
	"docs/prompts/**",
	"docs/QUALITY_SCORE.md",
	"docs/proof.md",
	"docs/validation.md",
] as const;

export const DOCS_SPINE_APPLY_DISALLOWED_TOUCH_TARGETS = [
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
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"Codex transcripts",
] as const;

export const DOCS_SPINE_APPLY_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
	"docs spine structural check",
	"repo-native gate candidate",
] as const;

export const DOCS_SPINE_APPLY_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, and repo-relative refs sync. Applied Markdown content, local code, command output, docs drafts, and Codex session history stay on the machine.";

export const DOCS_SPINE_APPLY_STOP_CONDITIONS = [
	"worktree has unexpected dirty files before docs spine apply starts",
	"unable to create or check out the approved docs spine apply branch",
	"write lease expires before docs spine apply starts",
	"approved drafts are missing, malformed, target an unapproved path, or lack apply-ready Markdown",
	"requested work needs root agent instructions, runtime code, provider setup, package installs, migrations, CI, PRs, branch pushes, raw source, raw logs, or Codex transcripts",
	"proof command fails",
] as const;

export const DOCS_SPINE_APPLY_ROLLBACK_NOTES =
	"Review the local branch diff. Roll back by reverting the applied docs files and deleting the .sbs docs-spine apply run artifacts for this workflow run.";

export const DOCS_SPINE_APPLY_NEXT_RECOMMENDED_WORKFLOW_ID = "docs-proof";

export const DOCS_SPINE_APPLY_LOCAL_ARTIFACT_REFS = {
	workflowPacket: ".sbs/runs/<workflow-run-id>/workflow-packet.json",
	proof: ".sbs/runs/<workflow-run-id>/proof.json",
	syncPreview: ".sbs/runs/<workflow-run-id>/sync-preview.json",
	applySummary: ".sbs/docs-spine-adoption/apply/apply-summary.json",
} as const;
