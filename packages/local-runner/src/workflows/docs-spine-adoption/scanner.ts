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
	instructionClassification: InstructionClassification;
	createdAt: number;
};

type InstructionClassification = {
	canonicalInstructionRefs: string[];
	shimInstructionRefs: string[];
	secondaryInstructionRefs: string[];
	ignoredInstructionRefs: string[];
	skillRefs: string[];
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
	const instructionClassification = await classifyInstructionRefs({
		repositoryRoot,
		repoRefs,
	});
	const inventory: RepoInventory = {
		repositoryRoot,
		repoRefs,
		packageManager: detectPackageManager(repositoryRoot),
		packageMetadata,
		instructionClassification,
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
	const agentInstructionRefs =
		inventory.instructionClassification.canonicalInstructionRefs;
	const assistantShimRefs = [
		...inventory.instructionClassification.shimInstructionRefs,
		...filterRefs(inventory, isAssistantShimRef),
	];
	const docsRefs = filterRefs(inventory, isDocumentationRef);
	const programRefs = filterRefs(inventory, isProgramDocumentationRef);
	const execPlanRefs = filterRefs(inventory, isExecPlanDocumentationRef);
	const promptRefs = filterRefs(inventory, isPromptDocumentationRef);
	const specRefs = filterRefs(
		inventory,
		(ref) =>
			isMarkdownRefUnder(ref, "docs/specs/") ||
			isMarkdownRefUnder(ref, "docs/product-specs/"),
	);
	const generatedRefs = filterRefs(inventory, isGeneratedDocumentationRef);
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
			secondaryInstructionRefs:
				inventory.instructionClassification.secondaryInstructionRefs,
			ignoredInstructionRefs:
				inventory.instructionClassification.ignoredInstructionRefs,
			skillRefs: inventory.instructionClassification.skillRefs,
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
	const architectureRefs = filterRefs(inventory, isArchitectureDocRef);
	const reliabilityRefs = filterRefs(inventory, isReliabilityDocRef);
	const securityRefs = filterRefs(inventory, isSecurityDocRef);
	const qualityScoreRefs = filterRefs(inventory, isQualityScoreDocRef);

	return artifact("sourceTruthMap", {
		schemaVersion: "docs-spine-source-truth-map.v1",
		workflowId: DOCS_SPINE_ADOPTION_WORKFLOW_ID,
		canonicalInstructionRefs:
			inventory.instructionClassification.canonicalInstructionRefs,
		assistantShimRefs: [
			...inventory.instructionClassification.shimInstructionRefs,
			...filterRefs(inventory, isAssistantShimRef),
		],
		secondaryInstructionRefs:
			inventory.instructionClassification.secondaryInstructionRefs,
		ignoredInstructionRefs:
			inventory.instructionClassification.ignoredInstructionRefs,
		instructionRouting: buildInstructionRouting(inventory),
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
			[
				"agent-instructions",
				inventory.instructionClassification.canonicalInstructionRefs,
			],
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
			(scriptName) => isNativeGateScriptName(scriptName),
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
			filterRefs(inventory, isArchitectureDocRef),
		),
		requiredSurface("reliability", filterRefs(inventory, isReliabilityDocRef)),
		requiredSurface("security", filterRefs(inventory, isSecurityDocRef)),
		requiredSurface(
			"quality-score",
			filterRefs(inventory, isQualityScoreDocRef),
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
		appRootRefs: findAppRootRefs(inventory.repoRefs),
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
		securityDocRefs: filterRefs(inventory, isSecurityDocRef),
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
	const qualityScoreRefs = filterRefs(inventory, isQualityScoreDocRef);

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
		agentInstructionRefs:
			inventory.instructionClassification.canonicalInstructionRefs,
		assistantShimRefs: [
			...inventory.instructionClassification.shimInstructionRefs,
			...filterRefs(inventory, isAssistantShimRef),
		],
		secondaryInstructionRefs:
			inventory.instructionClassification.secondaryInstructionRefs,
		ignoredInstructionRefs:
			inventory.instructionClassification.ignoredInstructionRefs,
		skillRefs: inventory.instructionClassification.skillRefs,
		instructionRouting: buildInstructionRouting(inventory),
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
		generatedDocsRefs: filterRefs(inventory, isGeneratedDocumentationRef),
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
			.filter((row) => isNativeGateScriptName(row.scriptName))
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

function isNativeGateScriptName(scriptName: string) {
	return [
		"gate",
		"check",
		"test",
		"lint",
		"typecheck",
		"build",
		"proof",
		"ci",
	].includes(scriptName);
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
		.sort(compareRepoRefPriority)
		.slice(0, MAX_REPO_REFS)
		.sort((left, right) => left.localeCompare(right));
}

async function classifyInstructionRefs({
	repositoryRoot,
	repoRefs,
}: {
	repositoryRoot: string;
	repoRefs: string[];
}): Promise<InstructionClassification> {
	const explicitInstructionRefs = repoRefs.filter(
		isExplicitAgentInstructionRef,
	);
	const skillRefs = repoRefs.filter(isSkillRef).sort();
	const hiddenInstructionRefs = repoRefs
		.filter((ref) => isHiddenInstructionNoiseRef(ref) && !isSkillRef(ref))
		.sort();
	const shimInstructionRefs: string[] = [];
	for (const ref of explicitInstructionRefs) {
		if (await isInstructionShimFile(repositoryRoot, ref)) {
			shimInstructionRefs.push(ref);
		}
	}
	const shimSet = new Set(shimInstructionRefs);
	const canonicalInstructionRefs = explicitInstructionRefs
		.filter((ref) => !shimSet.has(ref))
		.sort(compareInstructionRefPriority);
	const secondaryInstructionRefs = repoRefs
		.filter((ref) => isAssistantShimRef(ref))
		.sort();

	return {
		canonicalInstructionRefs,
		shimInstructionRefs: shimInstructionRefs.sort(),
		secondaryInstructionRefs,
		ignoredInstructionRefs: hiddenInstructionRefs,
		skillRefs,
	};
}

async function isInstructionShimFile(repositoryRoot: string, ref: string) {
	if (ref !== "AGENTS.md") {
		return false;
	}
	if (!existsSync(path.join(repositoryRoot, ".codex", "AGENTS.md"))) {
		return false;
	}
	const contents = await readFile(path.join(repositoryRoot, ref), "utf8").catch(
		() => "",
	);
	return /shim|canonical instruction|\.codex\/AGENTS\.md/i.test(contents);
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

function findAppRootRefs(repoRefs: string[]) {
	const appRoots = new Set<string>();
	for (const ref of repoRefs) {
		const match = /^(apps|packages)\/[^/]+\//.exec(ref);
		if (match) {
			appRoots.add(match[0].replace(/\/$/, ""));
		}
	}
	return [...appRoots].sort();
}

function buildInstructionRouting(inventory: RepoInventory) {
	return {
		canonicalRefs: inventory.instructionClassification.canonicalInstructionRefs,
		shimRefs: inventory.instructionClassification.shimInstructionRefs,
		secondaryRefs: inventory.instructionClassification.secondaryInstructionRefs,
		skillRefs: inventory.instructionClassification.skillRefs,
		ignoredRefsStored: false,
	};
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
	return isExplicitAgentInstructionRef(ref);
}

function isExplicitAgentInstructionRef(ref: string) {
	const name = path.basename(ref).toLowerCase();
	return (
		name === "agents.md" &&
		!isSkillRef(ref) &&
		!isHiddenInstructionNoiseRef(ref)
	);
}

function isAssistantShimRef(ref: string) {
	const name = path.basename(ref).toLowerCase();
	return name === "claude.md" || name === "gemini.md";
}

function isDocumentationRef(ref: string) {
	if (isHiddenInstructionNoiseRef(ref)) {
		return false;
	}
	const lower = ref.toLowerCase();
	if (lower.startsWith("docs/")) {
		return isMarkdownDocumentRef(lower);
	}
	if (isRootDocumentationRef(lower)) {
		return true;
	}
	return /^(apps|packages)\/[^/]+\/readme\.mdx?$/.test(lower);
}

function isArchitectureDocRef(ref: string) {
	return isTopicDocumentationRef(ref, /architecture/);
}

function isReliabilityDocRef(ref: string) {
	return isTopicDocumentationRef(ref, /reliability/);
}

function isSecurityDocRef(ref: string) {
	return isTopicDocumentationRef(ref, /security/);
}

function isQualityScoreDocRef(ref: string) {
	return isTopicDocumentationRef(ref, /quality[_-]score/);
}

function isTopicDocumentationRef(ref: string, topicPattern: RegExp) {
	if (!isDocumentationRef(ref)) {
		return false;
	}
	return topicPattern.test(ref.toLowerCase());
}

function isMarkdownDocumentRef(lowercaseRef: string) {
	return lowercaseRef.endsWith(".md") || lowercaseRef.endsWith(".mdx");
}

function isMarkdownRefUnder(ref: string, rootRef: string) {
	return ref.startsWith(rootRef) && isMarkdownDocumentRef(ref.toLowerCase());
}

function isProgramDocumentationRef(ref: string) {
	return (
		isMarkdownRefUnder(ref, "docs/programs/") ||
		(ref.startsWith("docs/programs/") &&
			path.basename(ref) === "current-planning-brief.txt")
	);
}

function isExecPlanDocumentationRef(ref: string) {
	return isMarkdownRefUnder(ref, "docs/exec-plans/");
}

function isPromptDocumentationRef(ref: string) {
	return isMarkdownRefUnder(ref, "docs/prompts/");
}

function isGeneratedDocumentationRef(ref: string) {
	return isMarkdownRefUnder(ref, "docs/generated/");
}

function isRootDocumentationRef(lowercaseRef: string) {
	return (
		!lowercaseRef.includes("/") &&
		[
			"readme.md",
			"design.md",
			"architecture.md",
			"reliability.md",
			"security.md",
			"quality_score.md",
			"quality-score.md",
			"validation.md",
			"proof.md",
			"plans.md",
		].includes(lowercaseRef)
	);
}

function isValidationRef(ref: string) {
	if (isHiddenInstructionNoiseRef(ref)) {
		return false;
	}
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

function isHiddenInstructionNoiseRef(ref: string) {
	return (
		ref.startsWith(".agents/daily-audit/") ||
		ref.startsWith(".ai/") ||
		ref.startsWith(".claude/") ||
		ref.startsWith(".codex/skills/")
	);
}

function compareRepoRefPriority(left: string, right: string) {
	return (
		getRepoRefPriority(left) - getRepoRefPriority(right) ||
		left.localeCompare(right)
	);
}

function compareInstructionRefPriority(left: string, right: string) {
	return (
		getInstructionRefPriority(left) - getInstructionRefPriority(right) ||
		left.localeCompare(right)
	);
}

function getInstructionRefPriority(ref: string) {
	if (ref === ".codex/AGENTS.md") {
		return 0;
	}
	if (ref === "AGENTS.md") {
		return 1;
	}
	if (ref.endsWith("/AGENTS.md")) {
		return 2;
	}
	return 3;
}

function getRepoRefPriority(ref: string) {
	if (/^(AGENTS|README|DESIGN|ARCHITECTURE)\.md$/i.test(ref)) {
		return 0;
	}
	if (ref === ".codex/AGENTS.md") {
		return 1;
	}
	if (ref === "package.json" || isLockfileRef(ref)) {
		return 2;
	}
	if (ref.startsWith(".github/workflows/")) {
		return 3;
	}
	if (ref.startsWith("docs/")) {
		return 4;
	}
	if (/^(apps|packages)\/[^/]+\/package\.json$/.test(ref)) {
		return 5;
	}
	if (/^(apps|packages)\//.test(ref)) {
		return 6;
	}
	if (isSkillRef(ref)) {
		return 8;
	}
	if (ref.startsWith(".")) {
		return 9;
	}
	return 7;
}

function isLockfileRef(ref: string) {
	return [
		"bun.lock",
		"bun.lockb",
		"pnpm-lock.yaml",
		"package-lock.json",
		"yarn.lock",
	].includes(ref);
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
