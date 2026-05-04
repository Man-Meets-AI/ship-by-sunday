import { existsSync } from "node:fs";
import path from "node:path";

import { boundedProcessSucceeds } from "./bounded-process";
import {
	inspectCodexConfig,
	resolveCodexHome,
	type CodexConfigInspection,
} from "./codex-config-manager";
import type { SetupCheckResult } from "./github-readiness";

function getCodexConfigStatus(inspection: CodexConfigInspection) {
	if (
		inspection.hasReadonlyProfile &&
		inspection.hasWorkspaceWriteProfile &&
		inspection.hasReadonlyPermissions &&
		inspection.hasWorkspaceWritePermissions
	) {
		return {
			status: "ready" as const,
			summary: "SBS Codex profiles and permissions are present.",
		};
	}

	return {
		status: "warning" as const,
		summary: "SBS Codex profiles or permissions are missing.",
		remediationAction: "Run ship-by-sunday setup check --codex-config-preview.",
	};
}

export async function runCodexReadinessChecks({
	env = process.env,
	repositoryRoot,
}: {
	env?: NodeJS.ProcessEnv;
	repositoryRoot?: string;
} = {}): Promise<SetupCheckResult[]> {
	const hasCodexCli = await boundedProcessSucceeds("codex", ["--version"]);
	const canRunCodexExec = hasCodexCli
		? await boundedProcessSucceeds("codex", ["exec", "--help"])
		: false;
	const codexHome = resolveCodexHome(env);
	const hasCodexAuthFile = existsSync(path.join(codexHome, "auth.json"));
	const hasApiKey =
		typeof env.CODEX_API_KEY === "string" && env.CODEX_API_KEY.length > 0;
	const configInspection = await inspectCodexConfig({ env, repositoryRoot });
	const configStatus = getCodexConfigStatus(configInspection);

	return [
		{
			scope: "machine",
			checkKey: "codex-cli",
			status: hasCodexCli ? "ready" : "blocked",
			summary: hasCodexCli
				? "Codex CLI is available."
				: "Codex CLI is not available on PATH.",
			remediationAction: hasCodexCli
				? undefined
				: "Install Codex CLI and authenticate it locally.",
		},
		{
			scope: "machine",
			checkKey: "codex-exec-json",
			status: canRunCodexExec ? "ready" : "blocked",
			summary: canRunCodexExec
				? "codex exec is available for JSONL automation."
				: "codex exec help could not be loaded.",
			remediationAction: canRunCodexExec
				? undefined
				: "Upgrade Codex CLI to a version with codex exec --json.",
		},
		{
			scope: "machine",
			checkKey: "codex-auth",
			status: hasCodexAuthFile || hasApiKey ? "ready" : "warning",
			summary:
				hasCodexAuthFile || hasApiKey
					? "Codex authentication storage is present."
					: "Codex authentication storage was not found.",
			remediationAction:
				hasCodexAuthFile || hasApiKey
					? undefined
					: "Run codex login locally. The runner only checks file presence.",
		},
		{
			scope: "machine",
			checkKey: "sbs-codex-config",
			...configStatus,
		},
		{
			scope: "machine",
			checkKey: "codex-project-trust",
			status: configInspection.hasExplicitUntrustedProject
				? "blocked"
				: "ready",
			summary: configInspection.hasExplicitUntrustedProject
				? "This project is explicitly marked untrusted in Codex config."
				: "No explicit untrusted Codex project state was found.",
			remediationAction: configInspection.hasExplicitUntrustedProject
				? "Review Codex project trust manually. The runner will not change it."
				: undefined,
		},
	];
}
