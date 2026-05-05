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
	intakeProbePath = process.env.SBS_INTAKE_PROBE_PATH,
	timeoutMs = 60_000,
}: {
	repositoryRoot: string;
	reportDirectory: string;
	intakeProbePath?: string;
	timeoutMs?: number;
}): Promise<CodebaseIntakeProbeResult> {
	const startedAt = Date.now();
	const markdownPath = path.join(reportDirectory, "codebase-intake.md");
	const jsonPath = path.join(reportDirectory, "codebase-intake.json");
	const scannerPath =
		intakeProbePath ??
		path.join(repositoryRoot, ".sbs", "intake-probe", "codebase-intake.py");

	if (!existsSync(scannerPath)) {
		const blockedReason =
			"Codebase intake probe was not found under .sbs/intake-probe.";
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
