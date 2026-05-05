import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
	createUnifiedDiffPreview,
	hasTomlTable,
	parseCodexConfigToml,
	replaceManagedTomlBlock,
} from "./codex-config-toml";

export const CODEX_CONFIG_ENV_VAR = "CODEX_HOME";
export const SBS_CODEX_BLOCK_START =
	"# >>> Ship by Sunday managed Codex profiles >>>";
export const SBS_CODEX_BLOCK_END =
	"# <<< Ship by Sunday managed Codex profiles <<<";

export type CodexConfigInspection = {
	configPath: string;
	exists: boolean;
	hasReadonlyProfile: boolean;
	hasWorkspaceWriteProfile: boolean;
	hasReadonlyPermissions: boolean;
	hasWorkspaceWritePermissions: boolean;
	hasExplicitUntrustedProject: boolean;
};

export type CodexConfigPatchPreview = {
	configPath: string;
	before: string;
	after: string;
	diff: string;
	changed: boolean;
};

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
	const normalizedRepositoryRoot = repositoryRoot
		? repositoryRoot.replace(/\\/g, "\\\\")
		: null;

	return {
		configPath,
		exists: true,
		hasReadonlyProfile:
			hasTomlTable(contents, "profiles.sbs-doctor-readonly") &&
			hasTomlAssignment(contents, "profiles.sbs-doctor-readonly", {
				key: "sandbox_mode",
				value: '"read-only"',
			}) &&
			hasTomlAssignment(contents, "profiles.sbs-doctor-readonly", {
				key: "default_permissions",
				value: '"sbs-readonly"',
			}),
		hasWorkspaceWriteProfile:
			hasTomlTable(contents, "profiles.sbs-workspace-write") &&
			hasTomlAssignment(contents, "profiles.sbs-workspace-write", {
				key: "sandbox_mode",
				value: '"workspace-write"',
			}) &&
			hasTomlAssignment(contents, "profiles.sbs-workspace-write", {
				key: "default_permissions",
				value: '"sbs-workspace-write"',
			}),
		hasReadonlyPermissions:
			hasTomlTable(
				contents,
				'permissions.sbs-readonly.filesystem.":project_roots"',
			) &&
			hasTomlTable(contents, "permissions.sbs-readonly.network") &&
			hasTomlAssignment(contents, "permissions.sbs-readonly.network", {
				key: "enabled",
				value: "false",
			}),
		hasWorkspaceWritePermissions:
			hasTomlTable(
				contents,
				'permissions.sbs-workspace-write.filesystem.":project_roots"',
			) &&
			hasTomlTable(contents, "permissions.sbs-workspace-write.network") &&
			hasTomlAssignment(contents, "permissions.sbs-workspace-write.network", {
				key: "enabled",
				value: "false",
			}),
		hasExplicitUntrustedProject: normalizedRepositoryRoot
			? contents.includes(`[projects."${normalizedRepositoryRoot}"]`) &&
				contents.includes('trust_level = "untrusted"')
			: contents.includes('trust_level = "untrusted"'),
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
	const tableHeader = `[${tableName}]`;
	const startIndex = lines.findIndex((line) => line.trim() === tableHeader);
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

export async function previewSbsCodexConfigPatch({
	env = process.env,
}: {
	env?: NodeJS.ProcessEnv;
} = {}): Promise<CodexConfigPatchPreview> {
	const configPath = resolveCodexConfigPath(env);
	const before = existsSync(configPath)
		? await readFile(configPath, "utf8")
		: "";
	const after = replaceManagedTomlBlock({
		contents: before,
		startMarker: SBS_CODEX_BLOCK_START,
		endMarker: SBS_CODEX_BLOCK_END,
		replacementBlock: renderSbsCodexConfigBlock(),
	});

	return {
		configPath,
		before,
		after,
		diff: createUnifiedDiffPreview({
			fromLabel: "config.toml",
			toLabel: "config.toml.sbs-preview",
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
	const preview = await previewSbsCodexConfigPatch({ env });
	if (!preview.changed) {
		return { ...preview, backupPath: null };
	}

	await mkdir(path.dirname(preview.configPath), { recursive: true });
	const backupPath = `${preview.configPath}.sbs-backup-${Date.now()}`;
	if (existsSync(preview.configPath)) {
		await copyFile(preview.configPath, backupPath);
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
	const configPath = resolveCodexConfigPath(env);
	if (!existsSync(backupPath)) {
		throw new Error(`Codex config backup does not exist: ${backupPath}`);
	}

	const backupContents = await readFile(backupPath, "utf8");
	parseCodexConfigToml(backupContents);
	await mkdir(path.dirname(configPath), { recursive: true });
	const rollbackBackupPath = `${configPath}.sbs-before-rollback-${Date.now()}`;
	if (existsSync(configPath)) {
		await copyFile(configPath, rollbackBackupPath);
	}
	await writeFile(configPath, backupContents);
	return {
		configPath,
		backupPath,
		rollbackBackupPath,
	};
}
