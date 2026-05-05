import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
	DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
	type DoctorProbeResult,
} from "./types";
import { writeJsonArtifact } from "./artifacts";

export type SourceTruthAgentReadiness = {
	schemaVersion: typeof DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION;
	generatedAt: number;
	status: "ready" | "warning" | "blocked";
	signals: Array<{
		id: string;
		status: "present" | "missing" | "warning";
		summary: string;
		repoRelativePath?: string;
	}>;
};

export async function writeSourceTruthAgentReadiness({
	repositoryRoot,
	outputPath,
}: {
	repositoryRoot: string;
	outputPath: string;
}): Promise<{ artifact: SourceTruthAgentReadiness; probe: DoctorProbeResult }> {
	const startedAt = Date.now();
	const signals = [
		await fileSignal(
			repositoryRoot,
			"AGENTS.md",
			"Repo instructions are available.",
		),
		await packageScriptSignal(repositoryRoot),
		await fileSignal(
			repositoryRoot,
			"README.md",
			"README gives a human entry point.",
		),
		await directorySignal(
			repositoryRoot,
			".sbs/intake-probe",
			"Codebase intake probe is present.",
		),
	];
	const status = signals.some((signal) => signal.status === "missing")
		? "warning"
		: "ready";
	const artifact: SourceTruthAgentReadiness = {
		schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
		generatedAt: Date.now(),
		status,
		signals,
	};
	await writeJsonArtifact({ filePath: outputPath, value: artifact });
	return {
		artifact,
		probe: {
			probeId: "source-truth-agent-readiness",
			status: "completed",
			durationMs: Date.now() - startedAt,
			sensitivity: "sync_safe",
			summary:
				status === "ready"
					? "Source-truth entry points are ready for local agent work."
					: "Some source-truth entry points are missing.",
			artifactRefs: [outputPath],
		},
	};
}

async function fileSignal(
	repositoryRoot: string,
	repoRelativePath: string,
	presentSummary: string,
) {
	const filePath = path.join(repositoryRoot, repoRelativePath);
	return {
		id: repoRelativePath,
		status: existsSync(filePath) ? ("present" as const) : ("missing" as const),
		summary: existsSync(filePath)
			? presentSummary
			: `${repoRelativePath} was not found.`,
		repoRelativePath,
	};
}

async function directorySignal(
	repositoryRoot: string,
	repoRelativePath: string,
	presentSummary: string,
) {
	const directoryPath = path.join(repositoryRoot, repoRelativePath);
	const hasFiles = existsSync(directoryPath)
		? (await readdir(directoryPath)).length > 0
		: false;
	return {
		id: repoRelativePath,
		status: hasFiles ? ("present" as const) : ("missing" as const),
		summary: hasFiles ? presentSummary : `${repoRelativePath} was not found.`,
		repoRelativePath,
	};
}

async function packageScriptSignal(repositoryRoot: string) {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return {
			id: "package-scripts",
			status: "missing" as const,
			summary: "No package.json scripts were found.",
			repoRelativePath: "package.json",
		};
	}

	const parsed = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
		scripts?: Record<string, unknown>;
	};
	const scripts = Object.keys(parsed.scripts ?? {});
	const proofScripts = scripts.filter((scriptName) =>
		/(test|lint|typecheck|build|format)/i.test(scriptName),
	);
	return {
		id: "package-scripts",
		status:
			proofScripts.length > 0 ? ("present" as const) : ("warning" as const),
		summary:
			proofScripts.length > 0
				? `${proofScripts.length} proof-oriented package script(s) found.`
				: "package.json exists but no obvious proof scripts were found.",
		repoRelativePath: "package.json",
	};
}
