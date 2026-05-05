import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "../../core/bounded-process";
import {
	DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
	DOCS_SPINE_ADOPTION_WORKFLOW_ID,
	DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
} from "./manifest";
import type { DocsSpineRepoFacts, DocsSpineScannerArtifact } from "./schemas";

const MAX_PACKAGE_FIELD_NAMES = 80;
const MAX_REPO_REFS = 1_500;

type PackageMetadata = {
	scriptNames: string[];
	workspaceGlobs: string[];
	dependencyNames: string[];
};

export type DocsSpineScannerBundle = {
	repoFacts: DocsSpineRepoFacts;
	artifacts: DocsSpineScannerArtifact[];
};

type RepoInventory = {
	repositoryRoot: string;
	repoRefs: string[];
	packageManager: string;
	packageMetadata: PackageMetadata;
	createdAt: number;
};

export async function buildDocsSpineScannerBundle({
	repositoryRoot,
	now,
}: {
	repositoryRoot: string;
	now: number;
}): Promise<DocsSpineScannerBundle> {
	const repoRefs = await listTrackedRepoRefs(repositoryRoot);
	const packageMetadata = await readPackageMetadata(repositoryRoot);
	const inventory: RepoInventory = {
		repositoryRoot,
		repoRefs,
		packageManager: detectPackageManager(repositoryRoot),
		packageMetadata,
		createdAt: now,
	};
	const repoFacts = buildRepoFacts(inventory);
	const scannerArtifacts = [
		buildSourceTruthMap(inventory),
		buildCommandProofMap(inventory),
		buildDocsGapReport(inventory),
		buildArchitectureSignals(inventory),
		buildSecuritySignals(inventory),
		buildQualityScoreBaseline(inventory),
		buildInstructionSurfaceMap(inventory),
		buildSkillTriggerMap(inventory),
		buildGeneratedSurfaceMap(inventory),
		buildValidationSurfaceMap(inventory),
		buildPerformanceTimings(inventory),
	];

	return {
		repoFacts,
		artifacts: scannerArtifacts,
	};
}

function buildRepoFacts(inventory: RepoInventory): DocsSpineRepoFacts {
	const agentInstructionRefs = filterRefs(inventory, isAgentInstructionRef);
	const assistantShimRefs = filterRefs(inventory, isAssistantShimRef);
	const docsRefs = filterRefs(inventory, isDocsRef);
	const programRefs = filterRefs(inventory, (ref) =>
		ref.startsWith("docs/programs/"),
	);
	const execPlanRefs = filterRefs(inventory, (ref) =>
		ref.startsWith("docs/exec-plans/"),
	);
	const promptRefs = filterRefs(inventory, (ref) =>
		ref.startsWith("docs/prompts/"),
	);
	const specRefs = filterRefs(
		inventory,
		(ref) =>
			ref.startsWith("docs/specs/") || ref.startsWith("docs/product-specs/"),
	);
	const generatedRefs = filterRefs(inventory, (ref) =>
		ref.startsWith("docs/generated/"),
	);
	const validationRefs = filterRefs(inventory, isValidationRef);
	const ciRefs = filterRefs(inventory, isCiRef);
	const releaseRefs = filterRefs(inventory, isReleaseRef);
	const blockedFacts = [
		buildBlockedFact(
			"agent-instructions",
			agentInstructionRefs,
			"Agent instruction surfaces were not detected from tracked repo refs.",
		),
		buildBlockedFact(
			"docs-index",
			docsRefs.filter((ref) => ref === "docs/index.md"),
			"`docs/index.md` was not detected from tracked repo refs.",
		),
		buildBlockedFact(
			"validation-surface",
			validationRefs,
			"Validation surfaces were not detected from tracked repo refs.",
		),
	].filter((fact): fact is NonNullable<typeof fact> => fact !== null);

	return {
		schemaVersion: "docs-spine-repo-facts.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_SPINE_ADOPTION_WORKFLOW_VERSION,
		repositoryShape: {
			packageManager: inventory.packageManager,
			packageScripts: inventory.packageMetadata.scriptNames,
			workspaceGlobs: inventory.packageMetadata.workspaceGlobs,
			workspacePackageRefs: findWorkspacePackageRefs(inventory.repoRefs),
			dependencyNames: inventory.packageMetadata.dependencyNames,
		},
		instructionSurface: {
			agentInstructionRefs,
			assistantShimRefs,
		},
		docsSurface: {
			docsRefs,
			programRefs,
			execPlanRefs,
			promptRefs,
			specRefs,
			generatedRefs,
		},
		validationSurface: {
			validationRefs,
			ciRefs,
			releaseRefs,
		},
		blockedFacts,
		createdAt: inventory.createdAt,
	};
}

function buildSourceTruthMap(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const docsIndexRefs = refsEqual(inventory, ["docs/index.md"]);
	const rootReadmeRefs = refsEqual(inventory, ["README.md", "readme.md"]);
	const architectureRefs = filterRefs(inventory, (ref) =>
		ref.toLowerCase().includes("architecture"),
	);
	const reliabilityRefs = filterRefs(inventory, (ref) =>
		ref.toLowerCase().includes("reliability"),
	);
	const securityRefs = filterRefs(inventory, (ref) =>
		ref.toLowerCase().includes("security"),
	);
	const qualityScoreRefs = filterRefs(inventory, (ref) =>
		ref.toLowerCase().includes("quality_score"),
	);

	return artifact("sourceTruthMap", {
		schemaVersion: "docs-spine-source-truth-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		canonicalInstructionRefs: filterRefs(inventory, isAgentInstructionRef),
		assistantShimRefs: filterRefs(inventory, isAssistantShimRef),
		rootReadmeRefs,
		docsIndexRefs,
		architectureRefs,
		reliabilityRefs,
		securityRefs,
		qualityScoreRefs,
		programContractRefs: refsEqual(inventory, ["docs/programs/PROGRAMS.md"]),
		execPlanContractRefs: refsEqual(inventory, ["docs/exec-plans/PLANS.md"]),
		promptIndexRefs: refsEqual(inventory, ["docs/prompts/README.md"]),
		generatedIndexRefs: refsEqual(inventory, ["docs/generated/index.md"]),
		missingRequiredSurfaces: buildMissingSurfaceRows([
			["agent-instructions", filterRefs(inventory, isAgentInstructionRef)],
			["docs-index", docsIndexRefs],
			["architecture", architectureRefs],
			["reliability", reliabilityRefs],
			["security", securityRefs],
			["quality-score", qualityScoreRefs],
		]),
		createdAt: inventory.createdAt,
	});
}

function buildCommandProofMap(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const scriptRows = inventory.packageMetadata.scriptNames.map(
		(scriptName) => ({
			scriptName,
			proofKind: inferProofKind(scriptName),
			commandBodyStored: false,
		}),
	);

	return artifact("commandProofMap", {
		schemaVersion: "docs-spine-command-proof-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		packageManager: inventory.packageManager,
		packageScriptNames: inventory.packageMetadata.scriptNames,
		scriptRows,
		nativeGateScriptNames: inventory.packageMetadata.scriptNames.filter(
			(scriptName) => ["gate", "check", "proof", "ci"].includes(scriptName),
		),
		validationScriptNames: scriptRows
			.filter((row) => row.proofKind !== "other")
			.map((row) => row.scriptName),
		blockedProof: inventory.packageMetadata.scriptNames.length
			? []
			: [
					{
						factId: "package-scripts",
						reason: "No package scripts were detected from package metadata.",
						nextApprovalRequired: false,
					},
				],
		createdAt: inventory.createdAt,
	});
}

function buildDocsGapReport(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const surfaces = [
		requiredSurface(
			"agent-instructions",
			filterRefs(inventory, isAgentInstructionRef),
		),
		requiredSurface("docs-index", refsEqual(inventory, ["docs/index.md"])),
		requiredSurface(
			"architecture",
			filterRefs(inventory, (ref) =>
				ref.toLowerCase().includes("architecture"),
			),
		),
		requiredSurface(
			"reliability",
			filterRefs(inventory, (ref) => ref.toLowerCase().includes("reliability")),
		),
		requiredSurface(
			"security",
			filterRefs(inventory, (ref) => ref.toLowerCase().includes("security")),
		),
		requiredSurface(
			"quality-score",
			filterRefs(inventory, (ref) =>
				ref.toLowerCase().includes("quality_score"),
			),
		),
		requiredSurface(
			"program-contract",
			refsEqual(inventory, ["docs/programs/PROGRAMS.md"]),
		),
		requiredSurface(
			"exec-plan-contract",
			refsEqual(inventory, ["docs/exec-plans/PLANS.md"]),
		),
		requiredSurface(
			"prompt-index",
			refsEqual(inventory, ["docs/prompts/README.md"]),
		),
		requiredSurface(
			"generated-index",
			refsEqual(inventory, ["docs/generated/index.md"]),
		),
		requiredSurface(
			"validation-surface",
			filterRefs(inventory, isValidationRef),
		),
	];

	return artifact("docsGapReport", {
		schemaVersion: "docs-spine-docs-gap-report.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		surfaces,
		missingSurfaceCount: surfaces.filter(
			(surface) => surface.status === "missing",
		).length,
		createdAt: inventory.createdAt,
	});
}

function buildArchitectureSignals(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const dependencyNames = inventory.packageMetadata.dependencyNames;

	return artifact("architectureSignals", {
		schemaVersion: "docs-spine-architecture-signals.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		packageManager: inventory.packageManager,
		workspaceGlobs: inventory.packageMetadata.workspaceGlobs,
		workspacePackageRefs: findWorkspacePackageRefs(inventory.repoRefs),
		appPackageRefs: filterRefs(inventory, (ref) =>
			/^apps\/[^/]+\/package\.json$/.test(ref),
		),
		packagePackageRefs: filterRefs(inventory, (ref) =>
			/^packages\/[^/]+\/package\.json$/.test(ref),
		),
		configRefs: filterRefs(inventory, isConfigRef),
		frameworkSignals: [
			frameworkSignal("next", dependencyNames, inventory.repoRefs),
			frameworkSignal("convex", dependencyNames, inventory.repoRefs),
			frameworkSignal("react", dependencyNames, inventory.repoRefs),
			frameworkSignal("turborepo", dependencyNames, inventory.repoRefs),
		],
		createdAt: inventory.createdAt,
	});
}

function buildSecuritySignals(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const dependencyNames = inventory.packageMetadata.dependencyNames;

	return artifact("securitySignals", {
		schemaVersion: "docs-spine-security-signals.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		securityDocRefs: filterRefs(inventory, (ref) =>
			ref.toLowerCase().includes("security"),
		),
		authRefs: filterRefs(inventory, (ref) => {
			const lower = ref.toLowerCase();
			return lower.includes("auth") || lower.includes("clerk");
		}),
		middlewareRefs: filterRefs(inventory, (ref) =>
			ref.toLowerCase().includes("middleware"),
		),
		securityDependencyNames: dependencyNames.filter((name) =>
			/(auth|clerk|stripe|oauth|jwt|csrf|crypto|sentry|posthog)/i.test(name),
		),
		ciRefs: filterRefs(inventory, isCiRef),
		rawEnvFilesStored: false,
		createdAt: inventory.createdAt,
	});
}

function buildQualityScoreBaseline(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const qualityScoreRefs = filterRefs(inventory, (ref) =>
		ref.toLowerCase().includes("quality_score"),
	);

	return artifact("qualityScoreBaseline", {
		schemaVersion: "docs-spine-quality-score-baseline.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		status: "blocked_missing_evidence",
		score: null,
		evidenceRefs: qualityScoreRefs,
		blockedReason:
			"Quality score values require a later evidence-bound quality audit. This scanner records the landing surface only.",
		createdAt: inventory.createdAt,
	});
}

function buildInstructionSurfaceMap(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	return artifact("instructionSurfaceMap", {
		schemaVersion: "docs-spine-instruction-surface-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		agentInstructionRefs: filterRefs(inventory, isAgentInstructionRef),
		assistantShimRefs: filterRefs(inventory, isAssistantShimRef),
		skillRefs: filterRefs(inventory, isSkillRef),
		rootInstructionRefs: filterRefs(inventory, (ref) =>
			["AGENTS.md", "CLAUDE.md", "GEMINI.md"].includes(path.basename(ref)),
		),
		createdAt: inventory.createdAt,
	});
}

function buildSkillTriggerMap(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const skillRefs = filterRefs(inventory, isSkillRef);

	return artifact("skillTriggerMap", {
		schemaVersion: "docs-spine-skill-trigger-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		skillRefs,
		skillNames: skillRefs
			.map((ref) => {
				const segments = ref.split("/");
				const skillIndex = segments.findIndex(
					(segment) => segment === "skills",
				);
				return skillIndex >= 0 ? segments[skillIndex + 1] : null;
			})
			.filter((name): name is string => Boolean(name)),
		triggerEvidenceStored: false,
		blockedProof: skillRefs.length
			? []
			: [
					{
						factId: "skill-triggers",
						reason: "No local skill trigger files were detected.",
						nextApprovalRequired: false,
					},
				],
		createdAt: inventory.createdAt,
	});
}

function buildGeneratedSurfaceMap(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	return artifact("generatedSurfaceMap", {
		schemaVersion: "docs-spine-generated-surface-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		generatedDocsRefs: filterRefs(inventory, (ref) =>
			ref.startsWith("docs/generated/"),
		),
		generatorRefs: filterRefs(inventory, (ref) => {
			const lower = ref.toLowerCase();
			return lower.includes("generate") || lower.includes("compiler");
		}),
		generatedOutputRefsStored: false,
		createdAt: inventory.createdAt,
	});
}

function buildValidationSurfaceMap(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	const scriptRows = inventory.packageMetadata.scriptNames.map(
		(scriptName) => ({
			scriptName,
			proofKind: inferProofKind(scriptName),
			commandBodyStored: false,
		}),
	);

	return artifact("validationSurfaceMap", {
		schemaVersion: "docs-spine-validation-surface-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		validationRefs: filterRefs(inventory, isValidationRef),
		ciRefs: filterRefs(inventory, isCiRef),
		releaseRefs: filterRefs(inventory, isReleaseRef),
		packageScriptRows: scriptRows,
		nativeGateScriptNames: scriptRows
			.filter((row) =>
				["gate", "check", "proof", "ci"].includes(row.scriptName),
			)
			.map((row) => row.scriptName),
		createdAt: inventory.createdAt,
	});
}

function buildPerformanceTimings(
	inventory: RepoInventory,
): DocsSpineScannerArtifact {
	return artifact("performanceTimings", {
		schemaVersion: "docs-spine-performance-timings.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		repoRefCount: inventory.repoRefs.length,
		artifactCount: 11,
		scannerDurationMs: 0,
		perArtifactDurationsStored: false,
		createdAt: inventory.createdAt,
	});
}

function artifact(
	key: Exclude<
		keyof typeof DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS,
		| "workflowPacket"
		| "proof"
		| "syncPreview"
		| "manifest"
		| "repoFacts"
		| "parityChecklist"
	>,
	value: unknown,
): DocsSpineScannerArtifact {
	return {
		repoRelativePath: DOCS_SPINE_ADOPTION_LOCAL_ARTIFACT_REFS[key],
		value,
	};
}

function buildBlockedFact(
	factId: string,
	evidenceRefs: string[],
	reason: string,
) {
	if (evidenceRefs.length > 0) {
		return null;
	}
	return {
		factId,
		reason,
		nextApprovalRequired: false,
	};
}

function buildMissingSurfaceRows(surfaces: Array<[string, string[]]>) {
	return surfaces
		.filter(([, evidenceRefs]) => evidenceRefs.length === 0)
		.map(([surfaceId]) => surfaceId);
}

function requiredSurface(surfaceId: string, evidenceRefs: string[]) {
	return {
		surfaceId,
		status: evidenceRefs.length > 0 ? "present" : "missing",
		evidenceRefs,
	};
}

function inferProofKind(scriptName: string) {
	if (/^(lint|format|check:fast)$/.test(scriptName)) {
		return "static";
	}
	if (/type(check)?/.test(scriptName)) {
		return "typecheck";
	}
	if (/test|spec/.test(scriptName)) {
		return "test";
	}
	if (/build|compile/.test(scriptName)) {
		return "build";
	}
	if (/proof|gate|ci|check$/.test(scriptName)) {
		return "gate";
	}
	if (/docs|markdown|programs|plans/.test(scriptName)) {
		return "docs";
	}
	return "other";
}

function frameworkSignal(
	frameworkName: string,
	dependencyNames: string[],
	repoRefs: string[],
) {
	return {
		frameworkName,
		detected:
			dependencyNames.some((name) => name.includes(frameworkName)) ||
			repoRefs.some((ref) => ref.toLowerCase().includes(frameworkName)),
	};
}

async function listTrackedRepoRefs(repositoryRoot: string) {
	const result = await runGit(repositoryRoot, ["ls-files"]);
	if (!result.succeeded) {
		return [];
	}
	return result.stdout
		.split(/\r?\n/)
		.map((ref) => ref.trim())
		.filter(Boolean)
		.filter((ref) => !shouldSkipRef(ref))
		.slice(0, MAX_REPO_REFS)
		.sort();
}

async function readPackageMetadata(
	repositoryRoot: string,
): Promise<PackageMetadata> {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return {
			scriptNames: [],
			workspaceGlobs: [],
			dependencyNames: [],
		};
	}
	const raw = await readFile(packageJsonPath, "utf8");
	const parsed = JSON.parse(raw) as {
		scripts?: Record<string, string>;
		workspaces?: string[] | { packages?: string[] };
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
		optionalDependencies?: Record<string, string>;
	};
	const workspaces = Array.isArray(parsed.workspaces)
		? parsed.workspaces
		: (parsed.workspaces?.packages ?? []);
	const dependencyNames = [
		...Object.keys(parsed.dependencies ?? {}),
		...Object.keys(parsed.devDependencies ?? {}),
		...Object.keys(parsed.optionalDependencies ?? {}),
	]
		.sort()
		.slice(0, MAX_PACKAGE_FIELD_NAMES);

	return {
		scriptNames: Object.keys(parsed.scripts ?? {}).slice(
			0,
			MAX_PACKAGE_FIELD_NAMES,
		),
		workspaceGlobs: workspaces.slice(0, MAX_PACKAGE_FIELD_NAMES),
		dependencyNames,
	};
}

function detectPackageManager(repositoryRoot: string) {
	if (existsSync(path.join(repositoryRoot, "bun.lock"))) {
		return "bun";
	}
	if (existsSync(path.join(repositoryRoot, "bun.lockb"))) {
		return "bun";
	}
	if (existsSync(path.join(repositoryRoot, "pnpm-lock.yaml"))) {
		return "pnpm";
	}
	if (existsSync(path.join(repositoryRoot, "yarn.lock"))) {
		return "yarn";
	}
	if (existsSync(path.join(repositoryRoot, "package-lock.json"))) {
		return "npm";
	}
	if (existsSync(path.join(repositoryRoot, "package.json"))) {
		return "unknown-node";
	}
	return "unknown";
}

function filterRefs(
	inventory: RepoInventory,
	predicate: (ref: string) => boolean,
) {
	return inventory.repoRefs.filter(predicate);
}

function refsEqual(inventory: RepoInventory, candidates: string[]) {
	return inventory.repoRefs.filter((ref) => candidates.includes(ref));
}

function findWorkspacePackageRefs(repoRefs: string[]) {
	return repoRefs.filter(
		(ref) =>
			ref === "package.json" ||
			/^apps\/[^/]+\/package\.json$/.test(ref) ||
			/^packages\/[^/]+\/package\.json$/.test(ref),
	);
}

function shouldSkipRef(ref: string) {
	return (
		ref.startsWith("node_modules/") ||
		ref.startsWith(".next/") ||
		ref.startsWith("dist/") ||
		ref.startsWith("build/") ||
		ref.startsWith("coverage/") ||
		ref.startsWith(".sbs/") ||
		path.basename(ref).startsWith(".env")
	);
}

function isAgentInstructionRef(ref: string) {
	const name = path.basename(ref).toLowerCase();
	return (
		name === "agents.md" ||
		ref.startsWith(".agents/") ||
		ref.startsWith(".codex/skills/")
	);
}

function isAssistantShimRef(ref: string) {
	const name = path.basename(ref).toLowerCase();
	return name === "claude.md" || name === "gemini.md";
}

function isDocsRef(ref: string) {
	const lower = ref.toLowerCase();
	return (
		lower === "readme.md" ||
		lower === "design.md" ||
		lower === "architecture.md" ||
		lower.startsWith("docs/") ||
		lower.includes("architecture") ||
		lower.includes("security") ||
		lower.includes("reliability")
	);
}

function isValidationRef(ref: string) {
	const lower = ref.toLowerCase();
	return (
		lower.includes("test") ||
		lower.includes("vitest") ||
		lower.includes("playwright") ||
		lower.includes("lint") ||
		lower.includes("typecheck") ||
		lower.includes("proof") ||
		lower.includes("gate")
	);
}

function isCiRef(ref: string) {
	return ref.startsWith(".github/workflows/") || ref.startsWith(".gitlab/");
}

function isReleaseRef(ref: string) {
	const lower = ref.toLowerCase();
	return lower.includes("release") || lower.includes("deploy");
}

function isConfigRef(ref: string) {
	const lower = ref.toLowerCase();
	return (
		lower.endsWith(".config.ts") ||
		lower.endsWith(".config.js") ||
		lower.endsWith(".config.mjs") ||
		lower.endsWith(".json") ||
		lower === "turbo.json"
	);
}

function isSkillRef(ref: string) {
	return ref.includes("/skills/") && path.basename(ref) === "SKILL.md";
}

async function runGit(repositoryRoot: string, args: string[]) {
	const result = await runBoundedProcess({
		command: "git",
		args,
		cwd: repositoryRoot,
		timeoutMs: 10_000,
	});
	return {
		succeeded: result.succeeded,
		stdout: result.stdout,
		stderr: result.stderr,
	};
}
