import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { runBoundedProcess } from "../bounded-process";
import {
	DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
	type DoctorProbeResult,
} from "./types";
import { writeJsonArtifact } from "./artifacts";

export type CodebaseIntakeProbeResult = {
	probe: DoctorProbeResult;
	markdownPath: string;
	jsonPath: string;
};

export async function runCodebaseIntakeProbe({
	repositoryRoot,
	reportDirectory,
	intakeProbePath,
	allowCustomIntakeProbe = false,
	timeoutMs = 60_000,
}: {
	repositoryRoot: string;
	reportDirectory: string;
	intakeProbePath?: string;
	allowCustomIntakeProbe?: boolean;
	timeoutMs?: number;
}): Promise<CodebaseIntakeProbeResult> {
	const startedAt = Date.now();
	const markdownPath = path.join(reportDirectory, "codebase-intake.md");
	const jsonPath = path.join(reportDirectory, "codebase-intake.json");
	const scannerPath = intakeProbePath
		? path.resolve(intakeProbePath)
		: undefined;

	if (!scannerPath || !allowCustomIntakeProbe) {
		const blockedReason =
			"Codebase intake probe execution is disabled by default. Pass --intake-probe with a trusted probe path to run a custom probe.";
		await writeBlockedProbeArtifacts({
			markdownPath,
			jsonPath,
			blockedReason,
		});
		return buildBlockedProbeResult({
			startedAt,
			markdownPath,
			jsonPath,
			blockedReason,
		});
	}

	if (isPathInside(repositoryRoot, scannerPath)) {
		const blockedReason =
			"Codebase intake probe path is inside the scanned repository. Use a trusted installed probe outside the repository.";
		await writeBlockedProbeArtifacts({
			markdownPath,
			jsonPath,
			blockedReason,
		});
		return buildBlockedProbeResult({
			startedAt,
			markdownPath,
			jsonPath,
			blockedReason,
		});
	}

	if (!existsSync(scannerPath)) {
		const blockedReason =
			"Codebase intake probe was not found at the trusted custom path.";
		await writeBlockedProbeArtifacts({
			markdownPath,
			jsonPath,
			blockedReason,
		});
		return buildBlockedProbeResult({
			startedAt,
			markdownPath,
			jsonPath,
			blockedReason,
		});
	}

	const result = await runBoundedProcess({
		command: "python3",
		args: [
			scannerPath,
			"--quiet",
			"--markdown-output",
			markdownPath,
			"--json-output",
			jsonPath,
		],
		cwd: repositoryRoot,
		timeoutMs,
		env: buildProbeEnvironment(),
	});
	const failedReason = result.timedOut
		? "Codebase intake probe timed out."
		: result.succeeded
			? undefined
			: "Codebase intake probe failed.";
	if (failedReason) {
		if (!existsSync(markdownPath)) {
			await writeFile(
				markdownPath,
				["# Codebase Intake Report", "", `Failed: ${failedReason}`, ""].join(
					"\n",
				),
			);
		}
		if (!existsSync(jsonPath)) {
			await writeJsonArtifact({
				filePath: jsonPath,
				value: {
					schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
					status: "failed",
					blockedReason: failedReason,
				},
			});
		}
	}

	return {
		markdownPath,
		jsonPath,
		probe: {
			probeId: "codebase-intake",
			status: failedReason ? "failed" : "completed",
			durationMs: Date.now() - startedAt,
			sensitivity: "local_only",
			summary: failedReason ?? "Codebase intake artifacts were generated.",
			blockedReason: failedReason,
			artifactRefs: [markdownPath, jsonPath],
		},
	};
}

async function writeBlockedProbeArtifacts({
	markdownPath,
	jsonPath,
	blockedReason,
}: {
	markdownPath: string;
	jsonPath: string;
	blockedReason: string;
}) {
	await writeFile(
		markdownPath,
		["# Codebase Intake Report", "", `Blocked: ${blockedReason}`, ""].join(
			"\n",
		),
	);
	await writeJsonArtifact({
		filePath: jsonPath,
		value: {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			status: "blocked",
			blockedReason,
		},
	});
}

function buildBlockedProbeResult({
	startedAt,
	markdownPath,
	jsonPath,
	blockedReason,
}: {
	startedAt: number;
	markdownPath: string;
	jsonPath: string;
	blockedReason: string;
}): CodebaseIntakeProbeResult {
	return {
		markdownPath,
		jsonPath,
		probe: {
			probeId: "codebase-intake",
			status: "blocked",
			durationMs: Date.now() - startedAt,
			sensitivity: "local_only",
			summary: blockedReason,
			blockedReason,
			artifactRefs: [markdownPath, jsonPath],
		},
	};
}

function isPathInside(parentPath: string, childPath: string) {
	const relativePath = path.relative(path.resolve(parentPath), childPath);
	return (
		Boolean(relativePath) &&
		!relativePath.startsWith("..") &&
		!path.isAbsolute(relativePath)
	);
}

function buildProbeEnvironment(): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {};
	for (const key of [
		"HOME",
		"LANG",
		"LC_ALL",
		"PATH",
		"TMPDIR",
		"USER",
	] as const) {
		const value = process.env[key];
		if (value) {
			env[key] = value;
		}
	}
	return env;
}
