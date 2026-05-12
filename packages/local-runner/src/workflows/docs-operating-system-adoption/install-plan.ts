import {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
	DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS,
	DOCS_OPERATING_SYSTEM_MODULE_IDS,
	DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION,
} from "./manifest";
import type {
	DocsOperatingSystemBlockedOperation,
	DocsOperatingSystemCanonicalScript,
	DocsOperatingSystemConflict,
	DocsOperatingSystemFileOperationStatus,
	DocsOperatingSystemInstallPlan,
	DocsOperatingSystemModuleId,
	DocsOperatingSystemModuleState,
	DocsOperatingSystemOutOfScopeDetection,
	DocsOperatingSystemScriptOperation,
} from "./schemas";
import type { DocsSpineRepoFacts } from "../docs-spine-adoption/schemas";
import type { JsonObject } from "../../core/json-value";

type RootPackageManifestFacts = {
	name?: string;
	scripts: JsonObject;
	dependencies?: JsonObject;
	devDependencies?: JsonObject;
};

export type BuildDocsOperatingSystemInstallPlanOptions = {
	repoFacts: DocsSpineRepoFacts;
	rootPackageManifest: RootPackageManifestFacts | null;
	trackedRepoRefs: string[];
	now: number;
};

const MODULE_SCRIPT_REQUIREMENTS: Record<
	DocsOperatingSystemModuleId,
	DocsOperatingSystemCanonicalScript[]
> = {
	"docs-spine": ["docs:validate"],
	programs: ["programs:lint", "program:write-child-plan"],
	"exec-plans": ["plans:lint"],
	prompts: [],
	"markdown-lint": ["markdown:lint"],
	"docs-validate": ["docs:validate", "docs:refresh-quality"],
	"planning-scripts": [
		"programs:lint",
		"plans:lint",
		"program:write-child-plan",
	],
	"proof-artifacts": [],
};

export const DOCS_OPERATING_SYSTEM_VALIDATOR_WRAPPER_TARGETS: Array<{
	targetRef: string;
	moduleIds: DocsOperatingSystemModuleId[];
}> = [
	{
		targetRef: DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS["programs:lint"],
		moduleIds: ["programs", "planning-scripts"],
	},
	{
		targetRef: DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS["plans:lint"],
		moduleIds: ["exec-plans", "planning-scripts"],
	},
	{
		targetRef: DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS["markdown:lint"],
		moduleIds: ["markdown-lint"],
	},
	{
		targetRef: DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS["docs:validate"],
		moduleIds: ["docs-spine", "docs-validate"],
	},
	{
		targetRef:
			DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS["docs:refresh-quality"],
		moduleIds: ["docs-validate"],
	},
	{
		targetRef:
			DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS["program:write-child-plan"],
		moduleIds: ["programs", "planning-scripts"],
	},
];

export function buildDocsOperatingSystemInstallPlan({
	repoFacts,
	rootPackageManifest,
	trackedRepoRefs,
	now,
}: BuildDocsOperatingSystemInstallPlanOptions): DocsOperatingSystemInstallPlan {
	const packageScriptOperations = DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS.map(
		(scriptName) =>
			buildPackageScriptOperation({
				scriptName,
				rootPackageManifest,
				packageManager: repoFacts.repositoryShape.packageManager,
			}),
	);
	const dependencyOperations = [
		{
			packageName: "ship-by-sunday" as const,
			dependencyType: "devDependency" as const,
			status: resolveShipBySundayDependencyStatus({
				repoFacts,
				rootPackageManifest,
			}),
			reason: resolveShipBySundayDependencyReason({
				repoFacts,
				rootPackageManifest,
			}),
		},
	];
	const validatorFileOperations =
		DOCS_OPERATING_SYSTEM_VALIDATOR_WRAPPER_TARGETS.map(
			({ targetRef, moduleIds }) => ({
				targetRef,
				moduleIds,
				status: resolveValidatorFileStatus(targetRef, trackedRepoRefs),
				reason: trackedRepoRefs.includes(targetRef)
					? "Wrapper file already exists."
					: "Wrapper file can be added in a later approved tooling apply slice.",
			}),
		);
	const conflicts = buildConflicts(packageScriptOperations);
	const blockedOperations = buildBlockedOperations({
		packageScriptOperations,
		dependencyStatus: dependencyOperations[0].status,
	});
	const outOfScopeDetections = buildOutOfScopeDetections({
		repoFacts,
		trackedRepoRefs,
	});

	return {
		schemaVersion: "docs-operating-system-install-plan.v1",
		workflowId: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
		workflowVersion: DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_VERSION,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		packageManager: repoFacts.repositoryShape.packageManager,
		resolvedModules: DOCS_OPERATING_SYSTEM_MODULE_IDS.map((moduleId) =>
			buildModuleState({
				moduleId,
				repoFacts,
				packageScriptOperations,
			}),
		),
		packageScriptOperations,
		dependencyOperations,
		validatorFileOperations,
		conflicts,
		blockedOperations,
		outOfScopeDetections,
		proofCommands: DOCS_OPERATING_SYSTEM_ADOPTION_PROOF_COMMANDS,
		rollbackNotes: DOCS_OPERATING_SYSTEM_ADOPTION_ROLLBACK_NOTES,
		privacyBoundary: {
			rawSourceIncluded: false,
			rawLogsIncluded: false,
			packageScriptBodiesIncluded: false,
			dependencyVersionsIncluded: false,
			localAbsolutePathsIncluded: false,
			codexTranscriptsIncluded: false,
		},
		createdAt: now,
	};
}

function buildPackageScriptOperation({
	scriptName,
	rootPackageManifest,
	packageManager,
}: {
	scriptName: DocsOperatingSystemCanonicalScript;
	rootPackageManifest: RootPackageManifestFacts | null;
	packageManager: string;
}): DocsOperatingSystemScriptOperation {
	const moduleIds = scriptModuleIds(scriptName);
	if (!rootPackageManifest || packageManager === "unknown") {
		return {
			scriptName,
			moduleIds,
			status: "blocked",
			currentScriptRecognized: false,
			proposedTarget: "package.json#scripts",
			reason: "No supported root package manifest was detected.",
		};
	}
	const currentScript = rootPackageManifest.scripts[scriptName];
	if (currentScript === undefined) {
		return {
			scriptName,
			moduleIds,
			status: "add",
			currentScriptRecognized: false,
			proposedTarget: "package.json#scripts",
			reason:
				"Script is missing and can be added in a later approved package-script patching slice.",
		};
	}
	if (typeof currentScript !== "string") {
		return {
			scriptName,
			moduleIds,
			status: "blocked",
			currentScriptRecognized: false,
			proposedTarget: "package.json#scripts",
			reason:
				"Existing script name has a non-string value. Fix package.json before installing portable docs tooling.",
		};
	}
	if (isRecognizedPortableDocsScript(scriptName, currentScript)) {
		return {
			scriptName,
			moduleIds,
			status: "keep",
			currentScriptRecognized: true,
			proposedTarget: "package.json#scripts",
			reason: "Existing script name is recognized as portable docs tooling.",
		};
	}
	return {
		scriptName,
		moduleIds,
		status: "blocked",
		currentScriptRecognized: false,
		proposedTarget: "package.json#scripts",
		reason:
			"Existing script name has an unrecognized body. Keep it, rename it, or approve a later explicit replacement.",
	};
}

function scriptModuleIds(
	scriptName: DocsOperatingSystemCanonicalScript,
): DocsOperatingSystemModuleId[] {
	return DOCS_OPERATING_SYSTEM_MODULE_IDS.filter((moduleId) =>
		MODULE_SCRIPT_REQUIREMENTS[moduleId].includes(scriptName),
	);
}

export function isRecognizedPortableDocsScript(
	scriptName: DocsOperatingSystemCanonicalScript,
	currentScript: string,
) {
	const normalizedScript = currentScript.replace(/\s+/g, " ").trim();
	const recognizedPatterns: Record<
		DocsOperatingSystemCanonicalScript,
		string[]
	> = {
		"programs:lint": [
			"bun scripts/programs/run-lint.ts",
			"bun scripts/sbs-docs/programs-lint.mjs",
		],
		"plans:lint": [
			"bun scripts/exec-plan/run-lint.ts",
			"bun scripts/sbs-docs/exec-plans-lint.mjs",
		],
		"markdown:lint": [
			"bun scripts/markdown-metadata/run-lint.ts",
			"bun scripts/sbs-docs/markdown-lint.mjs",
		],
		"docs:validate": [
			"bun scripts/docs-quality/validate.ts",
			"bun scripts/sbs-docs/docs-validate.mjs",
		],
		"docs:refresh-quality": [
			"bun scripts/docs-quality/refresh-quality.ts",
			"bun scripts/sbs-docs/docs-refresh-quality.mjs",
		],
		"program:write-child-plan": [
			"bun scripts/programs/write-child-plan.ts",
			"bun scripts/sbs-docs/write-child-plan.mjs",
		],
	};
	return recognizedPatterns[scriptName].includes(normalizedScript);
}

function resolveShipBySundayDependencyStatus({
	repoFacts,
	rootPackageManifest,
}: {
	repoFacts: DocsSpineRepoFacts;
	rootPackageManifest: RootPackageManifestFacts | null;
}) {
	if (rootPackageManifest?.name === "ship-by-sunday") {
		return "already-present" as const;
	}
	if (
		rootPackageManifest &&
		hasPinnedSharedToolingDependency(rootPackageManifest)
	) {
		return "already-present" as const;
	}
	if (repoFacts.repositoryShape.dependencyNames.includes("ship-by-sunday")) {
		return "blocked" as const;
	}
	if (repoFacts.repositoryShape.packageManager === "unknown") {
		return "blocked" as const;
	}
	return "installable" as const;
}

function resolveShipBySundayDependencyReason({
	repoFacts,
	rootPackageManifest,
}: {
	repoFacts: DocsSpineRepoFacts;
	rootPackageManifest: RootPackageManifestFacts | null;
}) {
	if (rootPackageManifest?.name === "ship-by-sunday") {
		return "The target repo is the Ship by Sunday package itself.";
	}
	if (
		rootPackageManifest &&
		hasPinnedSharedToolingDependency(rootPackageManifest)
	) {
		return "The shared tooling package is already listed at the exact pinned version.";
	}
	if (repoFacts.repositoryShape.dependencyNames.includes("ship-by-sunday")) {
		return "The shared tooling package is present but not verified at the exact pinned version.";
	}
	if (repoFacts.repositoryShape.packageManager === "unknown") {
		return "No supported package manager was detected for dependency planning.";
	}
	return "The shared tooling package can be added in a later approved dependency patching slice.";
}

function hasPinnedSharedToolingDependency(
	rootPackageManifest: RootPackageManifestFacts,
) {
	return (
		rootPackageManifest.dependencies?.[
			DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME
		] === DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION ||
		rootPackageManifest.devDependencies?.[
			DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME
		] === DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION
	);
}

function resolveValidatorFileStatus(
	targetRef: string,
	trackedRepoRefs: string[],
): DocsOperatingSystemFileOperationStatus {
	return trackedRepoRefs.includes(targetRef)
		? "already-present"
		: "installable";
}

function buildConflicts(
	packageScriptOperations: DocsOperatingSystemScriptOperation[],
): DocsOperatingSystemConflict[] {
	return packageScriptOperations
		.filter((operation) => operation.status === "blocked")
		.map((operation) => ({
			conflictId: `package-script:${operation.scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${operation.scriptName}`,
			reason: operation.reason,
			nextApprovalRequired: true,
		}));
}

function buildBlockedOperations({
	packageScriptOperations,
	dependencyStatus,
}: {
	packageScriptOperations: DocsOperatingSystemScriptOperation[];
	dependencyStatus: "already-present" | "installable" | "blocked";
}): DocsOperatingSystemBlockedOperation[] {
	const blockedScriptOperations = packageScriptOperations
		.filter((operation) => operation.status === "blocked")
		.map((operation) => ({
			operationId: `package-script:${operation.scriptName}`,
			surface: "package-script" as const,
			targetRef: `package.json#scripts.${operation.scriptName}`,
			reason: operation.reason,
			nextApprovalRequired: true,
		}));
	const blockedDependencyOperations =
		dependencyStatus === "blocked"
			? [
					{
						operationId: "dependency:ship-by-sunday",
						surface: "dependency" as const,
						targetRef: "package.json#devDependencies.ship-by-sunday",
						reason:
							"No supported package manager was detected for dependency planning.",
						nextApprovalRequired: true,
					},
				]
			: [];
	return [...blockedScriptOperations, ...blockedDependencyOperations];
}

function buildModuleState({
	moduleId,
	repoFacts,
	packageScriptOperations,
}: {
	moduleId: DocsOperatingSystemModuleId;
	repoFacts: DocsSpineRepoFacts;
	packageScriptOperations: DocsOperatingSystemScriptOperation[];
}): DocsOperatingSystemModuleState {
	const requiredScriptNames = MODULE_SCRIPT_REQUIREMENTS[moduleId];
	const relevantScriptOperations = packageScriptOperations.filter((operation) =>
		requiredScriptNames.includes(operation.scriptName),
	);
	const evidenceRefs = moduleEvidenceRefs(moduleId, repoFacts);
	if (
		relevantScriptOperations.some(
			(operation) =>
				operation.status === "blocked" || operation.status === "conflict",
		)
	) {
		return {
			moduleId,
			status: "conflict",
			evidenceRefs,
			requiredScriptNames,
			reason: "One or more required package script names are blocked.",
		};
	}
	if (
		evidenceRefs.length > 0 &&
		relevantScriptOperations.every((operation) => operation.status === "keep")
	) {
		return {
			moduleId,
			status: "already-present",
			evidenceRefs,
			requiredScriptNames,
			reason: "Docs surface and required scripts are already present.",
		};
	}
	if (moduleId === "proof-artifacts") {
		return {
			moduleId,
			status: "selected",
			evidenceRefs: [".sbs/runs/<workflow-run-id>/proof.json"],
			requiredScriptNames,
			reason: "Proof artifacts are selected for this dry-run workflow.",
		};
	}
	return {
		moduleId,
		status: "installable",
		evidenceRefs,
		requiredScriptNames,
		reason:
			"Portable docs tooling can be installed in a later approved apply slice.",
	};
}

function moduleEvidenceRefs(
	moduleId: DocsOperatingSystemModuleId,
	repoFacts: DocsSpineRepoFacts,
) {
	if (moduleId === "docs-spine") {
		return repoFacts.docsSurface.docsRefs.filter(
			(ref) => ref === "docs/index.md" || ref === "README.md",
		);
	}
	if (moduleId === "programs") {
		return repoFacts.docsSurface.programRefs;
	}
	if (moduleId === "exec-plans") {
		return repoFacts.docsSurface.execPlanRefs;
	}
	if (moduleId === "prompts") {
		return repoFacts.docsSurface.promptRefs;
	}
	if (moduleId === "markdown-lint") {
		return repoFacts.validationSurface.validationRefs.filter((ref) =>
			ref.toLowerCase().includes("markdown"),
		);
	}
	if (moduleId === "docs-validate") {
		return repoFacts.validationSurface.validationRefs.filter((ref) =>
			ref.toLowerCase().includes("docs"),
		);
	}
	if (moduleId === "planning-scripts") {
		return repoFacts.docsSurface.programRefs.concat(
			repoFacts.docsSurface.execPlanRefs,
		);
	}
	return [];
}

function buildOutOfScopeDetections({
	repoFacts,
	trackedRepoRefs,
}: {
	repoFacts: DocsSpineRepoFacts;
	trackedRepoRefs: string[];
}): DocsOperatingSystemOutOfScopeDetection[] {
	const detections = [
		outOfScopeDetection(
			"runtime",
			[
				...scriptEvidence(repoFacts, (scriptName) =>
					scriptName.startsWith("runtime:"),
				),
				...trackedRepoRefs.filter((ref) => ref.startsWith(".runtime/")),
			],
			"Runtime bootstrap, health checks, and process supervision are deferred.",
		),
		outOfScopeDetection(
			"worker-state",
			scriptEvidence(repoFacts, (scriptName) =>
				scriptName.startsWith("worker-state"),
			),
			"Worker-state commands are Worker-specific operating state.",
		),
		outOfScopeDetection(
			"topology",
			trackedRepoRefs.filter((ref) => ref === "system/topology.json"),
			"Topology files are Worker-specific operating state.",
		),
		outOfScopeDetection(
			"worker-operating-state",
			trackedRepoRefs.filter(
				(ref) =>
					ref.startsWith("workspace/notes/") ||
					ref.startsWith("workspace/goals/") ||
					ref.startsWith("workspace/projects/") ||
					ref.startsWith("worker/") ||
					ref.startsWith("docs/workers/"),
			),
			"Worker notes, goals, projects, and role docs are not portable docs core modules.",
		),
		outOfScopeDetection(
			"ci-provider-setup",
			repoFacts.validationSurface.ciRefs,
			"CI and provider setup are not installed by this docs tooling dry run.",
		),
		outOfScopeDetection(
			"app-stack-command-wiring",
			scriptEvidence(repoFacts, (scriptName) =>
				["dev", "start", "serve", "up"].includes(scriptName),
			),
			"Application stack run commands may be discovered for proof but are not installed as conventions.",
		),
		outOfScopeDetection(
			"broad-root-agent-rewrite",
			[
				...repoFacts.instructionSurface.agentInstructionRefs,
				...repoFacts.instructionSurface.assistantShimRefs,
			],
			"Root instruction rewrites are outside the tooling install authority.",
		),
	];
	return detections.filter(
		(detection): detection is DocsOperatingSystemOutOfScopeDetection =>
			detection !== null,
	);
}

function scriptEvidence(
	repoFacts: DocsSpineRepoFacts,
	predicate: (scriptName: string) => boolean,
) {
	return repoFacts.repositoryShape.packageScripts
		.filter(predicate)
		.map((scriptName) => `package.json#scripts.${scriptName}`);
}

function outOfScopeDetection(
	kind: DocsOperatingSystemOutOfScopeDetection["kind"],
	evidenceRefs: string[],
	reason: string,
) {
	const uniqueEvidenceRefs = Array.from(new Set(evidenceRefs)).sort();
	if (uniqueEvidenceRefs.length === 0) {
		return null;
	}
	return {
		kind,
		evidenceRefs: uniqueEvidenceRefs,
		reason,
	};
}
