import {
	inspectCodexConfig,
	resolveCodexConfigPath,
} from "../codex-config-manager";
import { runCodexReadinessChecks } from "../codex-readiness";
import {
	DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
	type DoctorProbeResult,
} from "./types";
import { writeJsonArtifact } from "./artifacts";

export type CodexSetupAudit = {
	schemaVersion: typeof DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION;
	generatedAt: number;
	configPathKnown: boolean;
	checks: Awaited<ReturnType<typeof runCodexReadinessChecks>>;
	profiles: {
		hasReadonlyProfile: boolean;
		hasWorkspaceWriteProfile: boolean;
		hasReadonlyPermissions: boolean;
		hasWorkspaceWritePermissions: boolean;
		hasExplicitUntrustedProject: boolean;
	};
};

export async function writeCodexSetupAudit({
	repositoryRoot,
	outputPath,
	env = process.env,
}: {
	repositoryRoot: string;
	outputPath: string;
	env?: NodeJS.ProcessEnv;
}): Promise<{ artifact: CodexSetupAudit; probe: DoctorProbeResult }> {
	const startedAt = Date.now();
	const [inspection, checks] = await Promise.all([
		inspectCodexConfig({ env, repositoryRoot }),
		runCodexReadinessChecks({ env, repositoryRoot }),
	]);
	const blockedCheck = checks.find((check) => check.status === "blocked");
	const artifact: CodexSetupAudit = {
		schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
		generatedAt: Date.now(),
		configPathKnown: Boolean(resolveCodexConfigPath(env)),
		checks,
		profiles: {
			hasReadonlyProfile: inspection.hasReadonlyProfile,
			hasWorkspaceWriteProfile: inspection.hasWorkspaceWriteProfile,
			hasReadonlyPermissions: inspection.hasReadonlyPermissions,
			hasWorkspaceWritePermissions: inspection.hasWorkspaceWritePermissions,
			hasExplicitUntrustedProject: inspection.hasExplicitUntrustedProject,
		},
	};
	await writeJsonArtifact({ filePath: outputPath, value: artifact });
	return {
		artifact,
		probe: {
			probeId: "codex-setup-audit",
			status: blockedCheck ? "blocked" : "completed",
			durationMs: Date.now() - startedAt,
			sensitivity: "sync_safe",
			summary: blockedCheck
				? `Codex setup blocked at ${blockedCheck.checkKey}.`
				: "Codex setup checks are usable for local interpretation.",
			blockedReason: blockedCheck?.summary,
			artifactRefs: [outputPath],
		},
	};
}
