import {
	DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
	DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
	DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
	DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION,
	DOCS_OPERATING_SYSTEM_WRAPPER_PACKAGE_COMMANDS,
} from "./manifest";
import {
	DOCS_OPERATING_SYSTEM_VALIDATOR_WRAPPER_TARGETS,
	isRecognizedPortableDocsScript,
} from "./install-plan";
import type {
	DocsOperatingSystemCanonicalScript,
	DocsOperatingSystemInstallPlan,
	DocsOperatingSystemPackagePatchBlockedReason,
	DocsOperatingSystemPackagePatchOperation,
} from "./schemas";

type JsonObject = Record<string, unknown>;

export type ExistingWrapperFile = {
	targetRef: string;
	content: string | null;
};

export type DocsOperatingSystemPackagePatch =
	| {
			status: "applied";
			packageJsonText: string;
			wrapperFiles: Array<{ targetRef: string; content: string }>;
			appliedOperations: DocsOperatingSystemPackagePatchOperation[];
			blockedReasons: [];
			touchedFileRefs: string[];
	  }
	| {
			status: "blocked";
			appliedOperations: [];
			blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[];
			touchedFileRefs: [];
	  };

export function buildDocsOperatingSystemPackagePatch({
	installPlan,
	packageJsonText,
	existingWrapperFiles,
}: {
	installPlan: DocsOperatingSystemInstallPlan;
	packageJsonText: string | null;
	existingWrapperFiles: ExistingWrapperFile[];
}): DocsOperatingSystemPackagePatch {
	const planBlockedReasons = validateInstallPlanForPatching(installPlan);
	if (planBlockedReasons.length > 0) {
		return blockedPatch(planBlockedReasons);
	}
	if (packageJsonText === null) {
		return blockedPatch([
			{
				stage: "package-json",
				targetRef: "package.json",
				reason: "Root package.json is required for package-script patching.",
			},
		]);
	}

	const parsedPackageJson = parsePackageJson(packageJsonText);
	if (parsedPackageJson.status === "blocked") {
		return blockedPatch(parsedPackageJson.blockedReasons);
	}

	const packageJson = parsedPackageJson.packageJson;
	const scriptsResult = ensurePackageObjectProperty(packageJson, "scripts");
	const devDependenciesResult = ensurePackageObjectProperty(
		packageJson,
		"devDependencies",
	);
	const packageShapeBlockedReasons: DocsOperatingSystemPackagePatchBlockedReason[] =
		[];
	if (scriptsResult.status === "blocked") {
		packageShapeBlockedReasons.push(scriptsResult.blockedReason);
	}
	if (devDependenciesResult.status === "blocked") {
		packageShapeBlockedReasons.push(devDependenciesResult.blockedReason);
	}
	if (packageShapeBlockedReasons.length > 0) {
		return blockedPatch(packageShapeBlockedReasons);
	}
	if (
		scriptsResult.status === "blocked" ||
		devDependenciesResult.status === "blocked"
	) {
		return blockedPatch(packageShapeBlockedReasons);
	}
	const scripts = scriptsResult.value;
	const devDependencies = devDependenciesResult.value;
	const appliedOperations: DocsOperatingSystemPackagePatchOperation[] = [];
	const blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[] = [];

	for (const scriptName of DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS) {
		const currentScript = scripts[scriptName];
		const scriptOperation = installPlan.packageScriptOperations.find(
			(operation) => operation.scriptName === scriptName,
		);
		if (!scriptOperation) {
			blockedReasons.push({
				stage: "install-plan",
				targetRef: `package.json#scripts.${scriptName}`,
				reason: `Install plan is missing operation for ${scriptName}.`,
			});
			continue;
		}
		if (scriptOperation.status !== "add" && scriptOperation.status !== "keep") {
			blockedReasons.push({
				stage: scriptOperation.status,
				targetRef: `package.json#scripts.${scriptName}`,
				reason: scriptOperation.reason,
			});
			continue;
		}
		if (typeof currentScript === "string") {
			if (isRecognizedPortableDocsScript(scriptName, currentScript)) {
				appliedOperations.push({
					operationId: `package-script:${scriptName}`,
					surface: "package-script",
					targetRef: `package.json#scripts.${scriptName}`,
					status: "kept",
					reason: "Existing script is recognized as portable docs tooling.",
				});
				continue;
			}
			blockedReasons.push({
				stage: "package-script-conflict",
				targetRef: `package.json#scripts.${scriptName}`,
				reason:
					"Live package.json has an unrecognized same-name docs script. Keep it, rename it, or approve a later explicit replacement.",
			});
			continue;
		}
		if (scriptOperation.status === "keep") {
			blockedReasons.push({
				stage: "stale-install-plan",
				targetRef: `package.json#scripts.${scriptName}`,
				reason:
					"Install plan expected an existing recognized script, but the live script is missing.",
			});
			continue;
		}
		scripts[scriptName] = packageScriptCommand(scriptName);
		appliedOperations.push({
			operationId: `package-script:${scriptName}`,
			surface: "package-script",
			targetRef: `package.json#scripts.${scriptName}`,
			status: "added",
			reason: "Added canonical portable docs script.",
		});
	}

	const dependencyOperation = installPlan.dependencyOperations[0];
	if (!dependencyOperation) {
		blockedReasons.push({
			stage: "install-plan",
			targetRef: `package.json#devDependencies.${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			reason:
				"Install plan is missing the shared tooling dependency operation.",
		});
	} else if (dependencyOperation.status === "blocked") {
		blockedReasons.push({
			stage: "dependency-blocked",
			targetRef: `package.json#devDependencies.${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			reason: dependencyOperation.reason,
		});
	} else if (hasSharedToolingDependency(packageJson)) {
		appliedOperations.push({
			operationId: `dependency:${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			surface: "dependency",
			targetRef: `package.json#devDependencies.${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			status: "kept",
			reason: "Shared tooling package is already present.",
		});
	} else if (dependencyOperation.status === "already-present") {
		blockedReasons.push({
			stage: "stale-install-plan",
			targetRef: `package.json#devDependencies.${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			reason:
				"Install plan expected the shared tooling package to be present, but live package.json does not include it.",
		});
	} else {
		devDependencies[DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME] =
			DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION;
		appliedOperations.push({
			operationId: `dependency:${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			surface: "dependency",
			targetRef: `package.json#devDependencies.${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}`,
			status: "added",
			reason: "Added exact shared tooling package devDependency metadata.",
		});
	}

	const wrapperFilesByRef = new Map(
		existingWrapperFiles.map((file) => [file.targetRef, file.content]),
	);
	const wrapperFilesToWrite: Array<{ targetRef: string; content: string }> = [];
	for (const wrapperOperation of installPlan.validatorFileOperations) {
		const expectedWrapperTarget =
			DOCS_OPERATING_SYSTEM_VALIDATOR_WRAPPER_TARGETS.some(
				(target) => target.targetRef === wrapperOperation.targetRef,
			);
		if (!expectedWrapperTarget) {
			blockedReasons.push({
				stage: "install-plan",
				targetRef: wrapperOperation.targetRef,
				reason: "Install plan contains an unapproved wrapper target.",
			});
			continue;
		}
		if (wrapperOperation.status === "blocked") {
			blockedReasons.push({
				stage: "validator-file-blocked",
				targetRef: wrapperOperation.targetRef,
				reason: wrapperOperation.reason,
			});
			continue;
		}
		const existingContent = wrapperFilesByRef.get(wrapperOperation.targetRef);
		const wrapperContent = buildWrapperFileContent(wrapperOperation.targetRef);
		if (existingContent !== null && existingContent !== undefined) {
			if (isRecognizedManagedWrapper(existingContent)) {
				appliedOperations.push({
					operationId: `validator-file:${wrapperOperation.targetRef}`,
					surface: "validator-file",
					targetRef: wrapperOperation.targetRef,
					status: "kept",
					reason: "Existing wrapper file is runner-managed.",
				});
				continue;
			}
			blockedReasons.push({
				stage: "validator-file-conflict",
				targetRef: wrapperOperation.targetRef,
				reason:
					"Wrapper target already exists and is not recognized as runner-managed.",
			});
			continue;
		}
		if (wrapperOperation.status === "already-present") {
			blockedReasons.push({
				stage: "stale-install-plan",
				targetRef: wrapperOperation.targetRef,
				reason:
					"Install plan expected a wrapper file to exist, but it is missing.",
			});
			continue;
		}
		wrapperFilesToWrite.push({
			targetRef: wrapperOperation.targetRef,
			content: wrapperContent,
		});
		appliedOperations.push({
			operationId: `validator-file:${wrapperOperation.targetRef}`,
			surface: "validator-file",
			targetRef: wrapperOperation.targetRef,
			status: "added",
			reason: "Added runner-managed wrapper file.",
		});
	}

	if (blockedReasons.length > 0) {
		return blockedPatch(blockedReasons);
	}

	return {
		status: "applied",
		packageJsonText: stringifyPackageJson(
			packageJson,
			detectJsonIndent(packageJsonText),
		),
		wrapperFiles: wrapperFilesToWrite,
		appliedOperations,
		blockedReasons: [],
		touchedFileRefs: [
			"package.json",
			...wrapperFilesToWrite.map((file) => file.targetRef),
		],
	};
}

function validateInstallPlanForPatching(
	installPlan: DocsOperatingSystemInstallPlan,
): DocsOperatingSystemPackagePatchBlockedReason[] {
	const blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[] = [];
	if (installPlan.workflowId !== DOCS_OPERATING_SYSTEM_ADOPTION_WORKFLOW_ID) {
		blockedReasons.push({
			stage: "install-plan",
			reason: "Install plan is not from docs-operating-system-adoption.",
		});
	}
	if (
		installPlan.installProfile !==
		DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE
	) {
		blockedReasons.push({
			stage: "install-plan",
			reason: "Install plan does not use installProfile: worker-grade.",
		});
	}
	for (const operation of installPlan.blockedOperations) {
		blockedReasons.push({
			stage: operation.operationId,
			targetRef: operation.targetRef,
			reason: operation.reason,
		});
	}
	return blockedReasons;
}

function parsePackageJson(packageJsonText: string):
	| { status: "ready"; packageJson: JsonObject }
	| {
			status: "blocked";
			blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[];
	  } {
	const parsed = parseJson(packageJsonText);
	if (parsed === null) {
		return {
			status: "blocked",
			blockedReasons: [
				{
					stage: "package-json",
					targetRef: "package.json",
					reason: "Root package.json could not be parsed as JSON.",
				},
			],
		};
	}
	if (!isJsonObject(parsed)) {
		return {
			status: "blocked",
			blockedReasons: [
				{
					stage: "package-json",
					targetRef: "package.json",
					reason: "Root package.json must contain a JSON object.",
				},
			],
		};
	}
	return { status: "ready", packageJson: parsed };
}

function parseJson(value: string) {
	try {
		return JSON.parse(value) as unknown;
	} catch {
		return null;
	}
}

function ensurePackageObjectProperty(
	packageJson: JsonObject,
	key: string,
):
	| { status: "ready"; value: JsonObject }
	| {
			status: "blocked";
			blockedReason: DocsOperatingSystemPackagePatchBlockedReason;
	  } {
	const currentValue = packageJson[key];
	if (isJsonObject(currentValue)) {
		return { status: "ready", value: currentValue };
	}
	if (currentValue !== undefined) {
		return {
			status: "blocked",
			blockedReason: {
				stage: "package-json",
				targetRef: `package.json#${key}`,
				reason: `Root package.json ${key} field must be an object when present.`,
			},
		};
	}
	const nextValue: JsonObject = {};
	packageJson[key] = nextValue;
	return { status: "ready", value: nextValue };
}

function hasSharedToolingDependency(packageJson: JsonObject) {
	return (
		hasPackageEntry(packageJson, "dependencies") ||
		hasPackageEntry(packageJson, "devDependencies")
	);
}

function hasPackageEntry(packageJson: JsonObject, dependencyField: string) {
	const dependencies = packageJson[dependencyField];
	return (
		isJsonObject(dependencies) &&
		typeof dependencies[DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME] ===
			"string"
	);
}

function packageScriptCommand(scriptName: DocsOperatingSystemCanonicalScript) {
	return `bun ${DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS[scriptName]}`;
}

function buildWrapperFileContent(targetRef: string) {
	const scriptName = scriptNameForWrapperTarget(targetRef);
	const packageCommand =
		DOCS_OPERATING_SYSTEM_WRAPPER_PACKAGE_COMMANDS[scriptName];
	return [
		"#!/usr/bin/env bun",
		"// Generated by Ship by Sunday docs operating-system tooling.",
		'import { spawnSync } from "node:child_process";',
		"",
		`const command = ${JSON.stringify(packageCommand)}.concat(process.argv.slice(2));`,
		`const result = spawnSync("${DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME}", command, {`,
		'\tstdio: "inherit",',
		"});",
		"",
		"if (result.error) {",
		"\tconsole.error(result.error.message);",
		"\tprocess.exit(1);",
		"}",
		"",
		"process.exit(result.status ?? 1);",
		"",
	].join("\n");
}

function scriptNameForWrapperTarget(
	targetRef: string,
): DocsOperatingSystemCanonicalScript {
	const matchingEntry = DOCS_OPERATING_SYSTEM_CANONICAL_SCRIPTS.find(
		(scriptName) =>
			DOCS_OPERATING_SYSTEM_SCRIPT_WRAPPER_TARGETS[scriptName] === targetRef,
	);
	if (!matchingEntry) {
		throw new Error(`No canonical script maps to wrapper ${targetRef}.`);
	}
	return matchingEntry;
}

function isRecognizedManagedWrapper(content: string) {
	return content.includes(
		"Generated by Ship by Sunday docs operating-system tooling.",
	);
}

function stringifyPackageJson(
	packageJson: JsonObject,
	indent: string | number,
) {
	return `${JSON.stringify(packageJson, null, indent)}\n`;
}

function detectJsonIndent(packageJsonText: string) {
	const indentMatch = packageJsonText.match(/\n([ \t]+)"/u);
	return indentMatch?.[1] ?? "\t";
}

function isJsonObject(value: unknown): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function blockedPatch(
	blockedReasons: DocsOperatingSystemPackagePatchBlockedReason[],
): DocsOperatingSystemPackagePatch {
	return {
		status: "blocked",
		appliedOperations: [],
		blockedReasons,
		touchedFileRefs: [],
	};
}

export function buildPackagePatchSummary({
	sourceInstallPlanRef,
	patch,
	now,
}: {
	sourceInstallPlanRef: string;
	patch: DocsOperatingSystemPackagePatch;
	now: number;
}) {
	return {
		schemaVersion: "docs-operating-system-package-script-patching.v1" as const,
		workflowId: DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_ID,
		workflowVersion:
			DOCS_OPERATING_SYSTEM_PACKAGE_SCRIPT_PATCHING_WORKFLOW_VERSION,
		installProfile: DOCS_OPERATING_SYSTEM_ADOPTION_INSTALL_PROFILE,
		sourceInstallPlanRef,
		status: patch.status,
		appliedOperations: patch.appliedOperations,
		blockedReasons: patch.blockedReasons,
		touchedFileRefs: patch.touchedFileRefs,
		privacyBoundary: {
			rawSourceIncluded: false,
			rawLogsIncluded: false,
			packageScriptBodiesIncluded: false,
			targetDependencyVersionsIncluded: false,
			localAbsolutePathsIncluded: false,
			codexTranscriptsIncluded: false,
		},
		createdAt: now,
	};
}
