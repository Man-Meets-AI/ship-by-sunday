import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context, Effect, Layer } from "effect";

import {
	createUnifiedDiffPreview,
	type ParsedCodexConfigToml,
	parseCodexConfigToml,
	replaceManagedTomlBlock,
} from "./codex-config-toml";
import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../effect/runtime";

export const CODEX_CONFIG_ENV_VAR = "CODEX_HOME";
export const SBS_CODEX_BLOCK_START =
	"# >>> Ship by Sunday managed Codex profiles >>>";
export const SBS_CODEX_BLOCK_END =
	"# <<< Ship by Sunday managed Codex profiles <<<";
export const SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START =
	"# >>> Shipbysunday Worker-managed Codex profiles >>>";
export const SHIPBYSUNDAY_WORKER_CODEX_BLOCK_END =
	"# <<< Shipbysunday Worker-managed Codex profiles <<<";
export const SHIPBYSUNDAY_WORKER_READONLY_PROFILE =
	"shipbysunday-worker-readonly";
export const SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PROFILE =
	"shipbysunday-worker-project-write";
export const SHIPBYSUNDAY_WORKER_READONLY_PERMISSIONS =
	"shipbysunday-worker-readonly";
export const SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PERMISSIONS =
	"shipbysunday-worker-project-write";
const SHIPBYSUNDAY_WORKER_SHELL_ENV_EXCLUDES =
	'["*KEY*", "*SECRET*", "*TOKEN*", "OPENAI_*", "ANTHROPIC_*", "GITHUB_TOKEN", "GH_TOKEN"]';

export type CodexConfigInspection = {
	configPath: string;
	exists: boolean;
	hasReadonlyProfile: boolean;
	hasWorkspaceWriteProfile: boolean;
	hasReadonlyPermissions: boolean;
	hasWorkspaceWritePermissions: boolean;
	hasExplicitUntrustedProject: boolean;
};

export type ShipbysundayWorkerCodexConfigInspection = {
	configPath: string;
	exists: boolean;
	hasReadonlyProfile: boolean;
	hasProjectWriteProfile: boolean;
	hasReadonlyPermissions: boolean;
	hasProjectWritePermissions: boolean;
	hasExplicitUntrustedProject: boolean;
};

export type CodexConfigPatchPreview = {
	configPath: string;
	before: string;
	after: string;
	diff: string;
	changed: boolean;
};

type ManagedCodexProfileSetInspection = {
	hasReadonlyProfile: boolean;
	hasWriteProfile: boolean;
	hasReadonlyPermissions: boolean;
	hasWritePermissions: boolean;
	hasExplicitUntrustedProject: boolean;
};

type CodexConfigPatchResult = CodexConfigPatchPreview & {
	backupPath: string | null;
};

type InspectCodexConfigRequest = {
	env: NodeJS.ProcessEnv;
	repositoryRoot?: string;
};

type CodexConfigEnvRequest = {
	env: NodeJS.ProcessEnv;
};

type RollbackCodexConfigPatchRequest = {
	backupPath: string;
	env: NodeJS.ProcessEnv;
};

export interface CodexConfigService {
	readonly inspectSbs: (
		request: InspectCodexConfigRequest,
	) => Effect.Effect<CodexConfigInspection, Error>;
	readonly inspectShipbysundayWorker: (
		request: InspectCodexConfigRequest,
	) => Effect.Effect<ShipbysundayWorkerCodexConfigInspection, Error>;
	readonly previewSbsPatch: (
		request: CodexConfigEnvRequest,
	) => Effect.Effect<CodexConfigPatchPreview, Error>;
	readonly previewShipbysundayWorkerPatch: (
		request: CodexConfigEnvRequest,
	) => Effect.Effect<CodexConfigPatchPreview, Error>;
	readonly applySbsPatch: (
		request: CodexConfigEnvRequest,
	) => Effect.Effect<CodexConfigPatchResult, Error>;
	readonly applyShipbysundayWorkerPatch: (
		request: CodexConfigEnvRequest,
	) => Effect.Effect<CodexConfigPatchResult, Error>;
	readonly rollbackSbsPatch: (
		request: RollbackCodexConfigPatchRequest,
	) => Effect.Effect<
		{ configPath: string; backupPath: string; rollbackBackupPath: string },
		Error
	>;
	readonly rollbackShipbysundayWorkerPatch: (
		request: RollbackCodexConfigPatchRequest,
	) => Effect.Effect<
		{ configPath: string; backupPath: string; rollbackBackupPath: string },
		Error
	>;
}

export const CodexConfigService = Context.GenericTag<CodexConfigService>(
	"ship-by-sunday/CodexConfigService",
);

export const NodeCodexConfigServiceLive = Layer.succeed(
	CodexConfigService,
	CodexConfigService.of({
		inspectSbs: (request) =>
			Effect.tryPromise({
				try: () => inspectCodexConfigNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		inspectShipbysundayWorker: (request) =>
			Effect.tryPromise({
				try: () => inspectShipbysundayWorkerCodexConfigNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		previewSbsPatch: (request) =>
			Effect.tryPromise({
				try: () => previewSbsCodexConfigPatchNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		previewShipbysundayWorkerPatch: (request) =>
			Effect.tryPromise({
				try: () => previewShipbysundayWorkerCodexConfigPatchNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		applySbsPatch: (request) =>
			Effect.tryPromise({
				try: () => applySbsCodexConfigPatchNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		applyShipbysundayWorkerPatch: (request) =>
			Effect.tryPromise({
				try: () => applyShipbysundayWorkerCodexConfigPatchNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		rollbackSbsPatch: (request) =>
			Effect.tryPromise({
				try: () => rollbackSbsCodexConfigPatchNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
		rollbackShipbysundayWorkerPatch: (request) =>
			Effect.tryPromise({
				try: () => rollbackShipbysundayWorkerCodexConfigPatchNode(request),
				catch: normalizeLocalRunnerEffectError,
			}),
	}),
);

export function resolveCodexHome(env: NodeJS.ProcessEnv = process.env) {
	return path.resolve(
		env[CODEX_CONFIG_ENV_VAR] ?? path.join(os.homedir(), ".codex"),
	);
}

export function resolveCodexConfigPath(env: NodeJS.ProcessEnv = process.env) {
	return path.join(resolveCodexHome(env), "config.toml");
}

export async function inspectCodexConfig({
	env = process.env,
	repositoryRoot,
}: {
	env?: NodeJS.ProcessEnv;
	repositoryRoot?: string;
} = {}): Promise<CodexConfigInspection> {
	return await runLocalRunnerEffect(
		inspectCodexConfigEffect({ env, repositoryRoot }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function inspectCodexConfigEffect({
	env = process.env,
	repositoryRoot,
}: {
	env?: NodeJS.ProcessEnv;
	repositoryRoot?: string;
} = {}): Effect.Effect<CodexConfigInspection, Error, CodexConfigService> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.inspectSbs({ env, repositoryRoot }),
	);
}

async function inspectCodexConfigNode({
	env,
	repositoryRoot,
}: InspectCodexConfigRequest): Promise<CodexConfigInspection> {
	const configPath = resolveCodexConfigPath(env);
	if (!existsSync(configPath)) {
		return {
			configPath,
			exists: false,
			hasReadonlyProfile: false,
			hasWorkspaceWriteProfile: false,
			hasReadonlyPermissions: false,
			hasWorkspaceWritePermissions: false,
			hasExplicitUntrustedProject: false,
		};
	}

	const contents = await readFile(configPath, "utf8");
	const inspection = inspectManagedCodexProfileSet({
		contents,
		repositoryRoot,
		readonlyProfileName: "sbs-doctor-readonly",
		writeProfileName: "sbs-workspace-write",
		readonlyPermissionsName: "sbs-readonly",
		writePermissionsName: "sbs-workspace-write",
		requireShellEnvironmentPolicy: false,
	});

	return {
		configPath,
		exists: true,
		hasReadonlyProfile: inspection.hasReadonlyProfile,
		hasWorkspaceWriteProfile: inspection.hasWriteProfile,
		hasReadonlyPermissions: inspection.hasReadonlyPermissions,
		hasWorkspaceWritePermissions: inspection.hasWritePermissions,
		hasExplicitUntrustedProject: inspection.hasExplicitUntrustedProject,
	};
}

export async function inspectShipbysundayWorkerCodexConfig({
	env = process.env,
	repositoryRoot,
}: {
	env?: NodeJS.ProcessEnv;
	repositoryRoot?: string;
} = {}): Promise<ShipbysundayWorkerCodexConfigInspection> {
	return await runLocalRunnerEffect(
		inspectShipbysundayWorkerCodexConfigEffect({ env, repositoryRoot }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function inspectShipbysundayWorkerCodexConfigEffect({
	env = process.env,
	repositoryRoot,
}: {
	env?: NodeJS.ProcessEnv;
	repositoryRoot?: string;
} = {}): Effect.Effect<
	ShipbysundayWorkerCodexConfigInspection,
	Error,
	CodexConfigService
> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.inspectShipbysundayWorker({ env, repositoryRoot }),
	);
}

async function inspectShipbysundayWorkerCodexConfigNode({
	env,
	repositoryRoot,
}: InspectCodexConfigRequest): Promise<ShipbysundayWorkerCodexConfigInspection> {
	const configPath = resolveCodexConfigPath(env);
	if (!existsSync(configPath)) {
		return {
			configPath,
			exists: false,
			hasReadonlyProfile: false,
			hasProjectWriteProfile: false,
			hasReadonlyPermissions: false,
			hasProjectWritePermissions: false,
			hasExplicitUntrustedProject: false,
		};
	}

	const contents = await readFile(configPath, "utf8");
	const inspection = inspectManagedCodexProfileSet({
		contents,
		repositoryRoot,
		readonlyProfileName: SHIPBYSUNDAY_WORKER_READONLY_PROFILE,
		writeProfileName: SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PROFILE,
		readonlyPermissionsName: SHIPBYSUNDAY_WORKER_READONLY_PERMISSIONS,
		writePermissionsName: SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PERMISSIONS,
		requireShellEnvironmentPolicy: true,
	});

	return {
		configPath,
		exists: true,
		hasReadonlyProfile: inspection.hasReadonlyProfile,
		hasProjectWriteProfile: inspection.hasWriteProfile,
		hasReadonlyPermissions: inspection.hasReadonlyPermissions,
		hasProjectWritePermissions: inspection.hasWritePermissions,
		hasExplicitUntrustedProject: inspection.hasExplicitUntrustedProject,
	};
}

export function renderSbsCodexConfigBlock() {
	return [
		SBS_CODEX_BLOCK_START,
		"[profiles.sbs-doctor-readonly]",
		'approval_policy = "never"',
		'sandbox_mode = "read-only"',
		'default_permissions = "sbs-readonly"',
		'web_search = "disabled"',
		'model_reasoning_effort = "medium"',
		"",
		"[profiles.sbs-workspace-write]",
		'approval_policy = "on-request"',
		'sandbox_mode = "workspace-write"',
		'default_permissions = "sbs-workspace-write"',
		'web_search = "disabled"',
		'model_reasoning_effort = "medium"',
		"",
		'[permissions.sbs-readonly.filesystem.":project_roots"]',
		'"." = "read"',
		'".env*" = "none"',
		'"**/.env*" = "none"',
		"",
		"[permissions.sbs-readonly.network]",
		"enabled = false",
		"",
		'[permissions.sbs-workspace-write.filesystem.":project_roots"]',
		'"." = "write"',
		'".env*" = "none"',
		'"**/.env*" = "none"',
		"",
		"[permissions.sbs-workspace-write.network]",
		"enabled = false",
		SBS_CODEX_BLOCK_END,
	].join("\n");
}

export function renderShipbysundayWorkerCodexConfigBlock() {
	return [
		SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START,
		`[profiles.${SHIPBYSUNDAY_WORKER_READONLY_PROFILE}]`,
		'approval_policy = "never"',
		'sandbox_mode = "read-only"',
		`default_permissions = "${SHIPBYSUNDAY_WORKER_READONLY_PERMISSIONS}"`,
		'web_search = "disabled"',
		'model_reasoning_effort = "medium"',
		"",
		`[profiles.${SHIPBYSUNDAY_WORKER_READONLY_PROFILE}.shell_environment_policy]`,
		'inherit = "core"',
		`exclude = ${SHIPBYSUNDAY_WORKER_SHELL_ENV_EXCLUDES}`,
		"",
		`[profiles.${SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PROFILE}]`,
		'approval_policy = "on-request"',
		'sandbox_mode = "workspace-write"',
		`default_permissions = "${SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PERMISSIONS}"`,
		'web_search = "disabled"',
		'model_reasoning_effort = "medium"',
		"",
		`[profiles.${SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PROFILE}.shell_environment_policy]`,
		'inherit = "core"',
		`exclude = ${SHIPBYSUNDAY_WORKER_SHELL_ENV_EXCLUDES}`,
		"",
		`[permissions.${SHIPBYSUNDAY_WORKER_READONLY_PERMISSIONS}.filesystem.":project_roots"]`,
		'"." = "read"',
		'".env*" = "none"',
		'"**/.env*" = "none"',
		"",
		`[permissions.${SHIPBYSUNDAY_WORKER_READONLY_PERMISSIONS}.network]`,
		"enabled = false",
		"",
		`[permissions.${SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PERMISSIONS}.filesystem.":project_roots"]`,
		'"." = "write"',
		'".env*" = "none"',
		'"**/.env*" = "none"',
		"",
		`[permissions.${SHIPBYSUNDAY_WORKER_PROJECT_WRITE_PERMISSIONS}.network]`,
		"enabled = false",
		SHIPBYSUNDAY_WORKER_CODEX_BLOCK_END,
	].join("\n");
}

function inspectManagedCodexProfileSet({
	contents,
	repositoryRoot,
	readonlyProfileName,
	writeProfileName,
	readonlyPermissionsName,
	writePermissionsName,
	requireShellEnvironmentPolicy,
}: {
	contents: string;
	repositoryRoot?: string;
	readonlyProfileName: string;
	writeProfileName: string;
	readonlyPermissionsName: string;
	writePermissionsName: string;
	requireShellEnvironmentPolicy: boolean;
}): ManagedCodexProfileSetInspection {
	const parsedConfig = parseCodexConfigToml(contents);
	return {
		hasReadonlyProfile: hasManagedCodexProfile({
			contents,
			parsedConfig,
			profileName: readonlyProfileName,
			sandboxMode: '"read-only"',
			permissionsName: readonlyPermissionsName,
			requireShellEnvironmentPolicy,
		}),
		hasWriteProfile: hasManagedCodexProfile({
			contents,
			parsedConfig,
			profileName: writeProfileName,
			sandboxMode: '"workspace-write"',
			permissionsName: writePermissionsName,
			requireShellEnvironmentPolicy,
		}),
		hasReadonlyPermissions: hasManagedCodexPermissions({
			contents,
			parsedConfig,
			permissionsName: readonlyPermissionsName,
		}),
		hasWritePermissions: hasManagedCodexPermissions({
			contents,
			parsedConfig,
			permissionsName: writePermissionsName,
		}),
		hasExplicitUntrustedProject: hasExplicitUntrustedCodexProject({
			contents,
			parsedConfig,
			repositoryRoot,
		}),
	};
}

function hasManagedCodexProfile({
	contents,
	parsedConfig,
	profileName,
	sandboxMode,
	permissionsName,
	requireShellEnvironmentPolicy,
}: {
	contents: string;
	parsedConfig: ParsedCodexConfigToml;
	profileName: string;
	sandboxMode: string;
	permissionsName: string;
	requireShellEnvironmentPolicy: boolean;
}) {
	const profileTableName = `profiles.${profileName}`;
	const environmentPolicyTableName = `${profileTableName}.shell_environment_policy`;
	return (
		hasParsedTomlTable(parsedConfig, profileTableName) &&
		hasTomlAssignment(contents, profileTableName, {
			key: "sandbox_mode",
			value: sandboxMode,
		}) &&
		hasTomlAssignment(contents, profileTableName, {
			key: "default_permissions",
			value: `"${permissionsName}"`,
		}) &&
		(!requireShellEnvironmentPolicy ||
			(hasParsedTomlTable(parsedConfig, environmentPolicyTableName) &&
				hasTomlAssignment(contents, environmentPolicyTableName, {
					key: "inherit",
					value: '"core"',
				}) &&
				hasTomlAssignment(contents, environmentPolicyTableName, {
					key: "exclude",
					value: SHIPBYSUNDAY_WORKER_SHELL_ENV_EXCLUDES,
				})))
	);
}

function hasManagedCodexPermissions({
	contents,
	parsedConfig,
	permissionsName,
}: {
	contents: string;
	parsedConfig: ParsedCodexConfigToml;
	permissionsName: string;
}) {
	const projectRootPermissionsTableName = `permissions.${permissionsName}.filesystem.":project_roots"`;
	const networkPermissionsTableName = `permissions.${permissionsName}.network`;
	return (
		hasParsedTomlTable(parsedConfig, projectRootPermissionsTableName) &&
		hasParsedTomlTable(parsedConfig, networkPermissionsTableName) &&
		hasTomlAssignment(contents, projectRootPermissionsTableName, {
			key: '"."',
			value:
				permissionsName.includes("readonly") ||
				permissionsName.includes("read-only")
					? '"read"'
					: '"write"',
		}) &&
		hasTomlAssignment(contents, projectRootPermissionsTableName, {
			key: '".env*"',
			value: '"none"',
		}) &&
		hasTomlAssignment(contents, projectRootPermissionsTableName, {
			key: '"**/.env*"',
			value: '"none"',
		}) &&
		hasTomlAssignment(contents, networkPermissionsTableName, {
			key: "enabled",
			value: "false",
		})
	);
}

function hasExplicitUntrustedCodexProject({
	contents,
	parsedConfig,
	repositoryRoot,
}: {
	contents: string;
	parsedConfig: ParsedCodexConfigToml;
	repositoryRoot?: string;
}) {
	if (repositoryRoot) {
		const projectTableName = `projects."${escapeTomlQuotedKeySegment(
			repositoryRoot,
		)}"`;
		return (
			hasParsedTomlTable(parsedConfig, projectTableName) &&
			hasTomlAssignment(contents, projectTableName, {
				key: "trust_level",
				value: '"untrusted"',
			})
		);
	}

	return [...parsedConfig.tableNames].some((tableName) => {
		return (
			tableName.startsWith("projects.") &&
			hasTomlAssignment(contents, tableName, {
				key: "trust_level",
				value: '"untrusted"',
			})
		);
	});
}

function hasParsedTomlTable(
	parsedConfig: ParsedCodexConfigToml,
	tableName: string,
) {
	return parsedConfig.tableNames.has(tableName);
}

function hasTomlAssignment(
	contents: string,
	tableName: string,
	expected: { key: string; value: string },
) {
	const tableLines = readTomlTableLines(contents, tableName);
	return tableLines.some((line) => {
		const trimmedLine = line.trim();
		return (
			trimmedLine === `${expected.key} = ${expected.value}` ||
			trimmedLine.startsWith(`${expected.key} = ${expected.value} #`)
		);
	});
}

function readTomlTableLines(contents: string, tableName: string) {
	const lines = contents.split(/\r?\n/);
	const startIndex = lines.findIndex((line) =>
		isTomlTableHeaderFor(line, tableName),
	);
	if (startIndex === -1) {
		return [];
	}

	const tableLines: string[] = [];
	for (const line of lines.slice(startIndex + 1)) {
		if (line.trim().startsWith("[")) {
			break;
		}
		tableLines.push(line);
	}
	return tableLines;
}

function isTomlTableHeaderFor(line: string, tableName: string) {
	const trimmedLine = line.trim();
	const tableHeader = `[${tableName}]`;
	return (
		trimmedLine === tableHeader || trimmedLine.startsWith(`${tableHeader} #`)
	);
}

function escapeTomlQuotedKeySegment(value: string) {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function previewSbsCodexConfigPatch({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Promise<CodexConfigPatchPreview> {
	return await runLocalRunnerEffect(
		previewSbsCodexConfigPatchEffect({ env }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function previewSbsCodexConfigPatchEffect({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Effect.Effect<CodexConfigPatchPreview, Error, CodexConfigService> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.previewSbsPatch({ env }),
	);
}

async function previewSbsCodexConfigPatchNode({
	env,
}: CodexConfigEnvRequest): Promise<CodexConfigPatchPreview> {
	return await previewManagedCodexConfigPatch({
		env,
		startMarker: SBS_CODEX_BLOCK_START,
		endMarker: SBS_CODEX_BLOCK_END,
		replacementBlock: renderSbsCodexConfigBlock(),
		toLabel: "config.toml.sbs-preview",
	});
}

export async function previewShipbysundayWorkerCodexConfigPatch({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Promise<CodexConfigPatchPreview> {
	return await runLocalRunnerEffect(
		previewShipbysundayWorkerCodexConfigPatchEffect({ env }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function previewShipbysundayWorkerCodexConfigPatchEffect({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Effect.Effect<CodexConfigPatchPreview, Error, CodexConfigService> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.previewShipbysundayWorkerPatch({ env }),
	);
}

async function previewShipbysundayWorkerCodexConfigPatchNode({
	env,
}: CodexConfigEnvRequest): Promise<CodexConfigPatchPreview> {
	return await previewManagedCodexConfigPatch({
		env,
		startMarker: SHIPBYSUNDAY_WORKER_CODEX_BLOCK_START,
		endMarker: SHIPBYSUNDAY_WORKER_CODEX_BLOCK_END,
		replacementBlock: renderShipbysundayWorkerCodexConfigBlock(),
		toLabel: "config.toml.shipbysunday-worker-preview",
	});
}

async function previewManagedCodexConfigPatch({
	env,
	startMarker,
	endMarker,
	replacementBlock,
	toLabel,
}: {
	env: NodeJS.ProcessEnv;
	startMarker: string;
	endMarker: string;
	replacementBlock: string;
	toLabel: string;
}): Promise<CodexConfigPatchPreview> {
	const configPath = resolveCodexConfigPath(env);
	const before = existsSync(configPath)
		? await readFile(configPath, "utf8")
		: "";
	const after = replaceManagedTomlBlock({
		contents: before,
		startMarker,
		endMarker,
		replacementBlock,
	});

	return {
		configPath,
		before,
		after,
		diff: createUnifiedDiffPreview({
			fromLabel: "config.toml",
			toLabel,
			before,
			after,
		}),
		changed: before !== after,
	};
}

export async function applySbsCodexConfigPatch({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}) {
	return await runLocalRunnerEffect(
		applySbsCodexConfigPatchEffect({ env }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function applySbsCodexConfigPatchEffect({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Effect.Effect<CodexConfigPatchResult, Error, CodexConfigService> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.applySbsPatch({ env }),
	);
}

async function applySbsCodexConfigPatchNode({
	env,
}: CodexConfigEnvRequest): Promise<CodexConfigPatchResult> {
	const preview = await previewSbsCodexConfigPatchNode({ env });
	return await applyCodexConfigPatchPreview({
		preview,
		backupFileLabel: "sbs",
	});
}

export async function applyShipbysundayWorkerCodexConfigPatch({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}) {
	return await runLocalRunnerEffect(
		applyShipbysundayWorkerCodexConfigPatchEffect({ env }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function applyShipbysundayWorkerCodexConfigPatchEffect({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Effect.Effect<CodexConfigPatchResult, Error, CodexConfigService> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.applyShipbysundayWorkerPatch({ env }),
	);
}

async function applyShipbysundayWorkerCodexConfigPatchNode({
	env,
}: CodexConfigEnvRequest): Promise<CodexConfigPatchResult> {
	const preview = await previewShipbysundayWorkerCodexConfigPatchNode({ env });
	return await applyCodexConfigPatchPreview({
		preview,
		backupFileLabel: "shipbysunday-worker",
	});
}

async function applyCodexConfigPatchPreview({
	preview,
	backupFileLabel,
}: {
	preview: CodexConfigPatchPreview;
	backupFileLabel: string;
}): Promise<CodexConfigPatchResult> {
	if (!preview.changed) {
		return { ...preview, backupPath: null };
	}

	await mkdir(path.dirname(preview.configPath), { recursive: true });
	const configExists = existsSync(preview.configPath);
	const backupPath = `${preview.configPath}.${backupFileLabel}-backup-${Date.now()}${configExists ? "" : "-missing"}`;
	if (configExists) {
		await copyFile(preview.configPath, backupPath);
	} else {
		await writeFile(backupPath, "");
	}
	await writeFile(preview.configPath, preview.after);
	return { ...preview, backupPath };
}

export async function rollbackSbsCodexConfigPatch({
	backupPath,
	env = process.env,
}: {
	backupPath: string;
	env?: NodeJS.ProcessEnv;
}) {
	return await runLocalRunnerEffect(
		rollbackSbsCodexConfigPatchEffect({ backupPath, env }).pipe(
			Effect.provide(NodeCodexConfigServiceLive),
		),
	);
}

export function rollbackSbsCodexConfigPatchEffect({
	backupPath,
	env = process.env,
}: {
	backupPath: string;
	env?: NodeJS.ProcessEnv;
}): Effect.Effect<
	{ configPath: string; backupPath: string; rollbackBackupPath: string },
	Error,
	CodexConfigService
> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.rollbackSbsPatch({ backupPath, env }),
	);
}

async function rollbackSbsCodexConfigPatchNode({
	backupPath,
	env,
}: RollbackCodexConfigPatchRequest) {
	return await rollbackCodexConfigPatch({
		backupPath,
		env,
		rollbackBackupFileLabel: "sbs",
	});
}

export async function rollbackShipbysundayWorkerCodexConfigPatch({
	backupPath,
	env = process.env,
}: {
	backupPath: string;
	env?: NodeJS.ProcessEnv;
}) {
	return await runLocalRunnerEffect(
		rollbackShipbysundayWorkerCodexConfigPatchEffect({
			backupPath,
			env,
		}).pipe(Effect.provide(NodeCodexConfigServiceLive)),
	);
}

export function rollbackShipbysundayWorkerCodexConfigPatchEffect({
	backupPath,
	env = process.env,
}: {
	backupPath: string;
	env?: NodeJS.ProcessEnv;
}): Effect.Effect<
	{ configPath: string; backupPath: string; rollbackBackupPath: string },
	Error,
	CodexConfigService
> {
	return Effect.flatMap(CodexConfigService, (service) =>
		service.rollbackShipbysundayWorkerPatch({ backupPath, env }),
	);
}

async function rollbackShipbysundayWorkerCodexConfigPatchNode({
	backupPath,
	env,
}: RollbackCodexConfigPatchRequest) {
	return await rollbackCodexConfigPatch({
		backupPath,
		env,
		rollbackBackupFileLabel: "shipbysunday-worker",
	});
}

async function rollbackCodexConfigPatch({
	backupPath,
	env,
	rollbackBackupFileLabel,
}: {
	backupPath: string;
	env: NodeJS.ProcessEnv;
	rollbackBackupFileLabel: string;
}) {
	const configPath = resolveCodexConfigPath(env);
	if (!existsSync(backupPath)) {
		throw new Error(`Codex config backup does not exist: ${backupPath}`);
	}

	const backupContents = await readFile(backupPath, "utf8");
	parseCodexConfigToml(backupContents);
	await mkdir(path.dirname(configPath), { recursive: true });
	const rollbackBackupPath = `${configPath}.${rollbackBackupFileLabel}-before-rollback-${Date.now()}`;
	if (existsSync(configPath)) {
		await copyFile(configPath, rollbackBackupPath);
	}
	if (backupPath.endsWith("-missing")) {
		await rm(configPath, { force: true });
	} else {
		await writeFile(configPath, backupContents);
	}
	return {
		configPath,
		backupPath,
		rollbackBackupPath,
	};
}
