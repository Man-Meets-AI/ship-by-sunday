export const DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID =
	"docs-operating-system-adoption";
export const DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION = "v1";
export const DOCS_OPERATING_SYSTEM_ADOPTION_PROFILE_NAME =
	"sbs-workspace-write";
export const DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE = "worker-grade";
export const DOCS_OPERATING_SYSTEM_ADOPTION_CONFIRM_SCAN_FLAG =
	"--confirm-docs-operating-system-scan";
export const DOCS_OPERATING_SYSTEM_ADOPTION_CONFIRM_TOOLING_PLAN_FLAG =
	"--confirm-docs-operating-system-tooling-plan";
export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID =
	"docs-operating-system-package-script-patching";
export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION =
	"v1";
export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROFILE_NAME =
	DOCS_OPERATING_SYSTEM_ADOPTION_PROFILE_NAME;
export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_CONFIRM_FLAG =
	"--confirm-docs-operating-system-tooling-apply";
export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID =
	"docs-operating-system-lockfile-refresh";
export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_VERSION = "v1";
export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROFILE_NAME =
	DOCS_OPERATING_SYSTEM_ADOPTION_PROFILE_NAME;
export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_CONFIRM_FLAG =
	"--confirm-docs-operating-system-lockfile-refresh";
export const DOCS_OPERATING_SYSTEM_ADOPTION_NEXT_RECOMMENDED_WORKFLOW_ID =
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID;
export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_NEXT_RECOMMENDED_WORKFLOW_ID =
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_WORKFLOW_ID;
export const DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME =
	"ship-by-sunday";
export const DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION = "0.1.0";

export const DOCS_OPERATING_SYSTEM_MODULE_IDS = [
	"docs-spine",
	"programs",
	"exec-plans",
	"prompts",
	"markdown-lint",
	"docs-validate",
	"planning-scripts",
	"proof-artifacts",
] as const;

export const DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS = [
	"programs:lint",
	"plans:lint",
	"markdown:lint",
	"docs:validate",
	"docs:refresh-quality",
	"program:write-child-plan",
] as const;

export const DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS = {
	"programs:lint": "scripts/sbs-docs/programs-lint.mjs",
	"plans:lint": "scripts/sbs-docs/exec-plans-lint.mjs",
	"markdown:lint": "scripts/sbs-docs/markdown-lint.mjs",
	"docs:validate": "scripts/sbs-docs/docs-validate.mjs",
	"docs:refresh-quality": "scripts/sbs-docs/docs-refresh-quality.mjs",
	"program:write-child-plan": "scripts/sbs-docs/write-child-plan.mjs",
} as const;

export const DOCS_OPERATING_SYSTEM_WRAPPER_PACKAGE_COMMANDS = {
	"programs:lint": ["docs-operating-system", "programs-lint"],
	"plans:lint": ["docs-operating-system", "exec-plans-lint"],
	"markdown:lint": ["docs-operating-system", "markdown-lint"],
	"docs:validate": ["docs-operating-system", "docs-validate"],
	"docs:refresh-quality": ["docs-operating-system", "docs-refresh-quality"],
	"program:write-child-plan": ["docs-operating-system", "write-child-plan"],
} as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_EXPECTED_OUTPUTS = [
	"docs operating system workflow packet",
	"repo facts and scanner summary",
	"portable docs tooling install plan",
	"local proof or blocked-proof summary",
	"sync preview metadata",
] as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_ALLOWED_TOUCH_TARGETS = [
	".sbs/runs/<workflow-run-id>/**",
	".sbs/docs-operating-system-adoption/**",
] as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_DISALLOWED_TOUCH_TARGETS = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"dependency locks",
	"database migrations",
	"provider configuration",
	"generated folders",
	"package scripts",
	"validator files",
	"wrapper files",
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"app-stack command wiring",
	"Worker-specific operating state",
	"docs spine Markdown application",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"package script bodies",
	"dependency versions",
	"local absolute paths",
	"Codex transcripts",
] as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
] as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, module states, operation statuses, and repo-relative refs sync. Local code, command output, script bodies, dependency versions, docs drafts, and Codex session history stay on the machine.";

export const DOCS_OPERATING_SYSTEM_ADOPTION_STOP_CONDITIONS = [
	"worktree is dirty before docs operating system dry-run starts",
	"write lease expires before docs operating system dry-run starts",
	"approved packet is missing installProfile: worker-grade",
	"requested work needs package mutation, lockfile mutation, docs application, validator file writes, root instruction rewrites, runtime setup, provider setup, CI, PRs, branch pushes, raw source, raw logs, script bodies, dependency versions, or Codex transcripts",
	"proof command fails",
] as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES =
	"Review the local .sbs docs operating system dry-run artifacts. Roll back by deleting the .sbs docs-operating-system-adoption artifacts and this workflow run's .sbs/runs/<workflow-run-id> directory.";

export const DOCS_OPERATING_SYSTEM_ADOPTION_PROVIDER_ACCESS_POLICY =
	"Provider access is disabled. Runtime setup, dashboard access, dependency installs, lockfile edits, migrations, CI changes, branch pushes, pull requests, and app-stack command wiring require a later explicit workflow packet.";

export const DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_DELIVERY =
	"Proof stays local under .sbs/runs/<workflow-run-id>/** and .sbs/docs-operating-system-adoption/**. Hosted sync receives only sync-safe proof metadata and artifact refs.";

export const DOCS_OPERATING_SYSTEM_ADOPTION_REVOCATION_BEHAVIOR =
	"Runner revocation, write lease expiry, dirty worktree state, or work needing wider authority stops execution and writes blocked proof instead of escalating permissions.";

export const DOCS_OPERATING_SYSTEM_ADOPTION_PHASES = [
	"approval-packet",
	"lease-and-worktree-guard",
	"scanner-facts",
	"tooling-install-plan",
	"proof",
] as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_LOCAL_ARTIFACT_REFS = {
	workflowPacket: ".sbs/runs/<workflow-run-id>/workflow-packet.json",
	proof: ".sbs/runs/<workflow-run-id>/proof.json",
	syncPreview: ".sbs/runs/<workflow-run-id>/sync-preview.json",
	manifest: ".sbs/docs-operating-system-adoption/manifest.json",
	repoFacts: ".sbs/docs-operating-system-adoption/facts/repo-facts.json",
	scannerSummary:
		".sbs/docs-operating-system-adoption/facts/scanner-summary.json",
	installPlan:
		".sbs/docs-operating-system-adoption/tooling-plan/install-plan.json",
} as const;

export const DOCS_OPERATING_SYSTEM_ADOPTION_PERFORMANCE_BUDGETS = {
	dryRunMs: 10_000,
	gitProofMs: 10_000,
} as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_EXPECTED_OUTPUTS = [
	"docs operating system package patch workflow packet",
	"package-script and wrapper apply summary",
	"local proof or blocked-proof summary",
	"sync preview metadata",
] as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ALLOWED_TOUCH_TARGETS =
	[
		".sbs/runs/<workflow-run-id>/**",
		".sbs/docs-operating-system-adoption/tooling-apply/**",
		"package.json",
		"scripts/sbs-docs/**",
	] as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_DISALLOWED_TOUCH_TARGETS =
	[
		"runtime app code",
		"environment files",
		"dependency locks",
		"database migrations",
		"provider configuration",
		"generated folders",
		"root agent instructions",
		"CI configuration",
		"CI-affecting commands",
		"app-stack command wiring",
		"Worker-specific operating state",
		"docs spine Markdown application",
		"package-manager installs",
		"branch pushes",
		"pull requests",
		"raw logs",
		"raw source",
		"package script bodies",
		"dependency versions from the target repo",
		"local absolute paths",
		"Codex transcripts",
	] as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_COMMANDS = [
	"git status --short",
	"git diff --name-only",
	"git diff --check",
	"node --check scripts/sbs-docs/*.mjs",
] as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, touched repo-relative refs, and operation statuses sync. Package script bodies, target dependency versions, wrapper contents, raw source, raw logs, local absolute paths, and Codex session history stay on the machine.";

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_STOP_CONDITIONS = [
	"write lease expires before package-script patching starts",
	"approved packet is missing installProfile: worker-grade",
	"worktree has dirty package.json, scripts/sbs-docs, or unsafe runner artifacts before patching starts",
	"dry-run install plan is missing, invalid, blocked, or stale",
	"live package.json has an unrecognized same-name canonical docs script",
	"requested work needs lockfile mutation, package-manager installs, docs application, root instruction rewrites, runtime setup, provider setup, CI, PRs, branch pushes, raw source, raw logs, script bodies, dependency versions from the target repo, or Codex transcripts",
	"proof command fails",
] as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_ROLLBACK_NOTES =
	"Review the local package.json, scripts/sbs-docs, and .sbs tooling-apply diff. Roll back by reverting those touched refs and deleting this workflow run's .sbs/runs/<workflow-run-id> directory.";

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROVIDER_ACCESS_POLICY =
	"Provider access is disabled. Package-manager installs, lockfile edits, runtime setup, dashboard access, migrations, CI changes, branch pushes, pull requests, and app-stack command wiring require a later explicit workflow packet.";

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PROOF_DELIVERY =
	"Proof stays local under .sbs/runs/<workflow-run-id>/** and .sbs/docs-operating-system-adoption/tooling-apply/**. Hosted sync receives only sync-safe proof metadata and artifact refs.";

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_REVOCATION_BEHAVIOR =
	"Runner revocation, write lease expiry, unsafe dirty state, stale install plan, or work needing wider authority stops execution and writes blocked proof instead of escalating permissions.";

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_PHASES = [
	"approval-packet",
	"lease-and-worktree-guard",
	"install-plan-validation",
	"package-script-and-wrapper-patching",
	"proof",
] as const;

export const DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_LOCAL_ARTIFACT_REFS =
	{
		workflowPacket: ".sbs/runs/<workflow-run-id>/workflow-packet.json",
		proof: ".sbs/runs/<workflow-run-id>/proof.json",
		syncPreview: ".sbs/runs/<workflow-run-id>/sync-preview.json",
		manifest: ".sbs/docs-operating-system-adoption/tooling-apply/manifest.json",
		applySummary:
			".sbs/docs-operating-system-adoption/tooling-apply/package-script-patching.json",
	} as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_EXPECTED_OUTPUTS = [
	"docs operating system lockfile refresh workflow packet",
	"package-manager lockfile refresh summary",
	"local proof or blocked-proof summary",
	"sync preview metadata",
] as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ALLOWED_TOUCH_TARGETS = [
	".sbs/runs/<workflow-run-id>/**",
	".sbs/docs-operating-system-adoption/lockfile-refresh/**",
	"bun.lock",
	"bun.lockb",
	"package-lock.json",
	"npm-shrinkwrap.json",
	"pnpm-lock.yaml",
] as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_DISALLOWED_TOUCH_TARGETS = [
	"runtime app code",
	"environment files",
	"dependency manifests",
	"database migrations",
	"provider configuration",
	"generated folders",
	"root agent instructions",
	"CI configuration",
	"CI-affecting commands",
	"app-stack command wiring",
	"Worker-specific operating state",
	"docs spine Markdown application",
	"package script changes",
	"wrapper file changes",
	"full dependency install state",
	"branch pushes",
	"pull requests",
	"raw logs",
	"raw source",
	"package script bodies",
	"dependency versions from the target repo",
	"local absolute paths",
	"Codex transcripts",
] as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_COMMANDS = [
	"package-manager lockfile refresh with lifecycle scripts and repo-controlled pnpm hooks disabled",
	"git status --short",
	"git diff --name-only",
	"git diff --check",
] as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_SYNC_POLICY_SUMMARY =
	"Only approved structured workflow metadata, proof status, command names, artifact names, touched lockfile refs, and command statuses sync. Package script bodies, target dependency versions, raw package-manager output, raw source, raw logs, local absolute paths, and Codex transcripts stay on the machine.";

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_STOP_CONDITIONS = [
	"write lease expires before lockfile refresh starts",
	"approved packet is missing installProfile: worker-grade",
	"worktree has dirty lockfiles, guarded package inputs, source install/apply artifacts, or unsafe runner artifacts before lockfile refresh starts",
	"package-script apply summary is missing, invalid, blocked, or stale",
	"live package.json or wrapper files no longer match the approved package-script patch contract",
	"requested work needs package manifest mutation, package script mutation, wrapper mutation, full dependency install state, docs application, root instruction rewrites, runtime setup, provider setup, CI, PRs, branch pushes, raw source, raw logs, script bodies, dependency versions from the target repo, or Codex transcripts",
	"proof command fails",
] as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_ROLLBACK_NOTES =
	"Review the local lockfile diff and .sbs lockfile-refresh artifacts. Roll back by reverting the touched lockfile refs and deleting this workflow run's .sbs/runs/<workflow-run-id> directory.";

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROVIDER_ACCESS_POLICY =
	"Provider access is disabled. Runner distribution, runtime setup, dashboard access, migrations, CI changes, branch pushes, pull requests, and app-stack command wiring require a later explicit workflow packet.";

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PROOF_DELIVERY =
	"Proof stays local under .sbs/runs/<workflow-run-id>/** and .sbs/docs-operating-system-adoption/lockfile-refresh/**. Hosted sync receives only sync-safe proof metadata and artifact refs.";

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_REVOCATION_BEHAVIOR =
	"Runner revocation, write lease expiry, unsafe dirty state, stale package patch state, unsupported package manager, or work needing wider authority stops execution and writes blocked proof instead of escalating permissions.";

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_PHASES = [
	"approval-packet",
	"lease-and-worktree-guard",
	"prior-package-patch-validation",
	"package-manager-lockfile-refresh",
	"proof",
] as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFRESH_LOCAL_ARTIFACT_REFS = {
	workflowPacket: ".sbs/runs/<workflow-run-id>/workflow-packet.json",
	proof: ".sbs/runs/<workflow-run-id>/proof.json",
	syncPreview: ".sbs/runs/<workflow-run-id>/sync-preview.json",
	manifest:
		".sbs/docs-operating-system-adoption/lockfile-refresh/manifest.json",
	refreshSummary:
		".sbs/docs-operating-system-adoption/lockfile-refresh/lockfile-refresh.json",
} as const;

export const DOCS_OPERATING_SYSTEM_LOCKFILE_REFS = [
	"bun.lock",
	"bun.lockb",
	"package-lock.json",
	"npm-shrinkwrap.json",
	"pnpm-lock.yaml",
	"yarn.lock",
] as const;
