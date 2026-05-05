import { writeFile } from "node:fs/promises";
import path from "node:path";

import { runCodexExec } from "../codex-exec-runner";
import { assertSyncSafeValue } from "../redaction";
import { getDoctorPassLocalReportRef, writeJsonArtifact } from "./artifacts";
import { createTopNineOutputSchema } from "./top-nine-schema";
import {
	TOP_NINE_SCHEMA_VERSION,
	type DoctorFinding,
	type DoctorProbeResult,
	type TopNineOutput,
} from "./types";

type TopNineInput = {
	runId: string;
	repositoryRoot: string;
	reportDirectory: string;
	codebaseIntakeJson: unknown;
	commandProofMap: unknown;
	codexSetupAudit: unknown;
	sourceTruthAgentReadiness: unknown;
	codexBinary?: string;
	timeoutMs?: number;
};

export async function runRepoDoctorTopNine({
	runId,
	repositoryRoot,
	reportDirectory,
	codebaseIntakeJson,
	commandProofMap,
	codexSetupAudit,
	sourceTruthAgentReadiness,
	codexBinary,
	timeoutMs = 120_000,
}: TopNineInput): Promise<{
	output: TopNineOutput;
	probe: DoctorProbeResult;
	eventsPath: string;
	outputPath: string;
	promptPath: string;
}> {
	const startedAt = Date.now();
	const schemaPath = path.join(
		reportDirectory,
		"repo-doctor-top-nine.schema.json",
	);
	const promptPath = path.join(
		reportDirectory,
		"repo-doctor-top-nine.prompt.md",
	);
	const eventsPath = path.join(
		reportDirectory,
		"repo-doctor-top-nine.events.jsonl",
	);
	const outputPath = path.join(
		reportDirectory,
		"repo-doctor-top-nine.output.json",
	);
	await writeJsonArtifact({
		filePath: schemaPath,
		value: createTopNineOutputSchema(),
	});
	const prompt = createTopNinePrompt({
		runId,
		codebaseIntakeJson,
		commandProofMap,
		codexSetupAudit,
		sourceTruthAgentReadiness,
	});
	await writeFile(promptPath, prompt);

	let result;
	try {
		result = await runCodexExec({
			prompt,
			repositoryRoot,
			profileName: "sbs-doctor-readonly",
			sandboxMode: "read-only",
			outputSchemaPath: schemaPath,
			timeoutMs,
			codexBinary,
		});
	} catch (error) {
		await writeFile(eventsPath, "");
		return await writeBlockedTopNineResult({
			runId,
			reportDirectory,
			startedAt,
			promptPath,
			eventsPath,
			outputPath,
			reason:
				error instanceof Error
					? `Codex interpretation failed before structured output: ${error.message}`
					: "Codex interpretation failed before structured output.",
		});
	}
	await writeFile(
		eventsPath,
		result.events.map((event) => JSON.stringify(event)).join("\n") +
			(result.events.length ? "\n" : ""),
	);

	if (result.timedOut || result.exitCode !== 0 || !result.structuredOutput) {
		return await writeBlockedTopNineResult({
			runId,
			reportDirectory,
			startedAt,
			promptPath,
			eventsPath,
			outputPath,
			reason: result.timedOut
				? "Codex interpretation timed out."
				: "Codex interpretation did not return structured findings.",
		});
	}

	let output;
	try {
		output = validateTopNineOutput(result.structuredOutput);
	} catch (error) {
		return await writeBlockedTopNineResult({
			runId,
			reportDirectory,
			startedAt,
			promptPath,
			eventsPath,
			outputPath,
			reason:
				error instanceof Error
					? `Codex interpretation returned invalid structured findings: ${error.message}`
					: "Codex interpretation returned invalid structured findings.",
		});
	}
	await writeJsonArtifact({ filePath: outputPath, value: output });
	return {
		output,
		eventsPath,
		outputPath,
		promptPath,
		probe: {
			probeId: "repo-doctor-top-nine",
			status: "completed",
			durationMs: Date.now() - startedAt,
			sensitivity: "local_only",
			summary: `Codex returned ${output.findings.length} finding(s).`,
			artifactRefs: [promptPath, eventsPath, outputPath],
		},
	};
}

async function writeBlockedTopNineResult({
	runId,
	startedAt,
	promptPath,
	eventsPath,
	outputPath,
	reason,
}: {
	runId: string;
	reportDirectory: string;
	startedAt: number;
	promptPath: string;
	eventsPath: string;
	outputPath: string;
	reason: string;
}) {
	const output = createBlockedTopNineOutput({
		runId,
		reason,
	});
	await writeJsonArtifact({ filePath: outputPath, value: output });
	return {
		output,
		eventsPath,
		outputPath,
		promptPath,
		probe: {
			probeId: "repo-doctor-top-nine",
			status: "blocked" as const,
			durationMs: Date.now() - startedAt,
			sensitivity: "local_only" as const,
			summary: output.summary,
			blockedReason: output.summary,
			artifactRefs: [promptPath, eventsPath, outputPath],
		},
	};
}

function createTopNinePrompt({
	runId,
	codebaseIntakeJson,
	commandProofMap,
	codexSetupAudit,
	sourceTruthAgentReadiness,
}: {
	runId: string;
	codebaseIntakeJson: unknown;
	commandProofMap: unknown;
	codexSetupAudit: unknown;
	sourceTruthAgentReadiness: unknown;
}) {
	return [
		"# Repo Doctor Top Nine",
		"",
		"You are reviewing sync-safe local probe artifacts for an existing customer codebase.",
		"Return only JSON matching the provided schema. Do not include raw source, raw logs, local absolute paths, secrets, screenshots, or Codex transcript text.",
		"Prefer findings that are actionable through a later read-only or docs-write workflow. Do not propose branch creation, PR delivery, managed GitHub, or mutating repair loops.",
		"If the sync-safe artifacts include a concrete failing route, command, build, checkout, auth, or runtime error, use recommendedWorkflowId broken-app-triage for that finding. Broken-app triage starts with read-only reproduction; do not propose patching until a later approval.",
		"",
		`Run id: ${runId}`,
		"",
		"## Codebase Intake JSON",
		"```json",
		JSON.stringify(codebaseIntakeJson, null, 2),
		"```",
		"",
		"## Command Proof Map",
		"```json",
		JSON.stringify(commandProofMap, null, 2),
		"```",
		"",
		"## Codex Setup Audit",
		"```json",
		JSON.stringify(codexSetupAudit, null, 2),
		"```",
		"",
		"## Source Truth Agent Readiness",
		"```json",
		JSON.stringify(sourceTruthAgentReadiness, null, 2),
		"```",
		"",
	].join("\n");
}

function validateTopNineOutput(value: unknown): TopNineOutput {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new Error("Codex output must be an object.");
	}
	const candidate = value as TopNineOutput;
	if (candidate.schemaVersion !== TOP_NINE_SCHEMA_VERSION) {
		throw new Error("Codex output schemaVersion is unsupported.");
	}
	if (!Array.isArray(candidate.findings) || candidate.findings.length > 9) {
		throw new Error("Codex output findings must be a Top 9 array.");
	}
	if (typeof candidate.summary !== "string" || candidate.summary.length === 0) {
		throw new Error("Codex output summary is required.");
	}
	const ranks = new Set<number>();
	for (const finding of candidate.findings) {
		validateFinding(finding);
		if (ranks.has(finding.rank)) {
			throw new Error(`Duplicate finding rank ${finding.rank}.`);
		}
		ranks.add(finding.rank);
		assertSyncSafeValue(finding, `doctor finding ${finding.findingId}`);
	}
	return candidate;
}

function validateFinding(finding: DoctorFinding) {
	const requiredStringFields = [
		"findingId",
		"title",
		"buyerImpact",
		"proofPath",
		"recommendedWorkflowId",
		"whyThisNow",
		"localReportRef",
	] as const;
	for (const field of requiredStringFields) {
		if (typeof finding[field] !== "string" || finding[field].length === 0) {
			throw new Error(`Finding ${field} is required.`);
		}
	}
	if (!Number.isFinite(finding.rank) || finding.rank < 1 || finding.rank > 9) {
		throw new Error(`Finding ${finding.findingId} has an invalid rank.`);
	}
	if (
		!Number.isFinite(finding.confidence) ||
		finding.confidence < 0 ||
		finding.confidence > 1
	) {
		throw new Error(`Finding ${finding.findingId} has invalid confidence.`);
	}
	if (
		!Array.isArray(finding.evidenceRefs) ||
		finding.evidenceRefs.length > 20
	) {
		throw new Error(`Finding ${finding.findingId} has invalid evidence refs.`);
	}
	if (finding.permissionRequired === "managed_github") {
		throw new Error("Doctor pass findings cannot require managed GitHub.");
	}
}

function createBlockedTopNineOutput({
	runId,
	reason,
}: {
	runId: string;
	reason: string;
}): TopNineOutput {
	return {
		schemaVersion: TOP_NINE_SCHEMA_VERSION,
		summary: reason,
		findings: [
			{
				findingId: `finding-codex-interpretation-blocked-${runId}`,
				rank: 1,
				status: "blocked",
				title: "Codex interpretation did not complete",
				category: "setup",
				severity: "medium",
				confidence: 0.6,
				buyerImpact:
					"The local doctor pass collected passive artifacts, but the Top 9 interpretation could not complete.",
				blastRadius: "low",
				proofPath: "Review the local Codex setup audit and retry doctor pass.",
				proofability: "blocked",
				permissionRequired: "read_only",
				recommendedWorkflowId: "repo-doctor-top-nine",
				whyThisNow:
					"Findings upload is intentionally blocked until local interpretation returns structured output.",
				evidenceRefs: [
					{
						kind: "artifact",
						artifactId: "codex-setup-audit",
						localReportRef: getDoctorPassLocalReportRef(
							runId,
							"codex-setup-audit.json",
						),
						summary: "Local Codex setup audit artifact.",
					},
				],
				blockedReason: reason,
				syncSensitivity: "low",
				localReportRef: getDoctorPassLocalReportRef(
					runId,
					"repo-doctor-top-nine.output.json",
				),
			},
		],
	};
}
