import { writeFile } from "node:fs/promises";
import path from "node:path";

import { assertSyncSafeValue } from "../redaction";
import {
	createRunnerEvent,
	flushRunnerEvents,
	queueRunnerEvent,
} from "../runner-events";
import type { LocalProjectState } from "../local-project-state";
import type { RunnerCredential } from "../local-runner-home";
import {
	createDoctorPassRunId,
	ensureDoctorPassReportDirectory,
	getDoctorPassLocalReportRef,
	readJsonArtifact,
	sha256Digest,
	writeJsonArtifact,
} from "./artifacts";
import {
	createApprovedFindingsDigest,
	normalizeFindingsForUpload,
} from "./approved-findings-digest";
import { runCodebaseIntakeProbe } from "./codebase-intake-probe";
import { writeCodexSetupAudit } from "./codex-setup-audit";
import { writeCommandProofMap } from "./command-proof-map";
import { writeSourceTruthAgentReadiness } from "./source-truth-readiness";
import { runRepoDoctorTopNine } from "./top-nine";
import {
	DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
	type DoctorFinding,
	type DoctorPassRunArtifacts,
	type DoctorProbeResult,
} from "./types";
import {
	startWorkspaceDoctorPassRun,
	uploadApprovedFindings,
} from "./workspace-runner-api";

export type RunDoctorPassOptions = {
	repositoryRoot: string;
	state: LocalProjectState;
	credential: RunnerCredential;
	runId?: string;
	localOnly?: boolean;
	intakeProbePath?: string;
	codexBinary?: string;
	fetchRunnerApi?: typeof fetch;
};

export async function runDoctorPass(
	options: RunDoctorPassOptions,
): Promise<DoctorPassRunArtifacts> {
	const runId = options.runId ?? createDoctorPassRunId();
	const reportDirectory = await ensureDoctorPassReportDirectory({
		repositoryRoot: options.repositoryRoot,
		runId,
	});
	const localReportRefPrefix = `.sbs/reports/doctor-pass/${runId}`;
	const workspaceRun = options.localOnly
		? null
		: await startWorkspaceDoctorPassRun({
				credential: options.credential,
				localRunId: runId,
				runnerMode: options.state.runnerMode,
				fetchRunnerApi: options.fetchRunnerApi,
			});
	const doctorPassRunId = workspaceRun?.doctorPassRunId ?? null;
	const probes: DoctorProbeResult[] = [];

	await queueDoctorStage(options, doctorPassRunId, "runner_connected");
	await flushDoctorEvents(options);
	await queueDoctorStage(options, doctorPassRunId, "passive_probes_running");

	const codebaseIntake = await runCodebaseIntakeProbe({
		repositoryRoot: options.repositoryRoot,
		reportDirectory,
		intakeProbePath: options.intakeProbePath,
	});
	const codebaseIntakeJsonRead = await readProbeJsonOrBlocked({
		filePath: codebaseIntake.jsonPath,
		probeId: "codebase-intake",
		blockedReason:
			"Codebase intake JSON could not be read, so Codex interpretation used a blocked probe summary.",
	});
	const codebaseIntakeProbe = codebaseIntakeJsonRead.blockedReason
		? {
				...codebaseIntake.probe,
				status: "blocked" as const,
				summary: codebaseIntakeJsonRead.blockedReason,
				blockedReason: codebaseIntakeJsonRead.blockedReason,
			}
		: codebaseIntake.probe;
	probes.push(codebaseIntakeProbe);
	await queueDoctorProbe(options, doctorPassRunId, codebaseIntakeProbe);

	const commandProofMapResult = await writeCommandProofMap({
		repositoryRoot: options.repositoryRoot,
		outputPath: path.join(reportDirectory, "command-proof-map.json"),
	});
	probes.push(commandProofMapResult.probe);
	await queueDoctorProbe(options, doctorPassRunId, commandProofMapResult.probe);

	const codexSetupAuditResult = await writeCodexSetupAudit({
		repositoryRoot: options.repositoryRoot,
		outputPath: path.join(reportDirectory, "codex-setup-audit.json"),
	});
	probes.push(codexSetupAuditResult.probe);
	await queueDoctorProbe(options, doctorPassRunId, codexSetupAuditResult.probe);

	const sourceTruthResult = await writeSourceTruthAgentReadiness({
		repositoryRoot: options.repositoryRoot,
		outputPath: path.join(reportDirectory, "source-truth-agent-readiness.json"),
	});
	probes.push(sourceTruthResult.probe);
	await queueDoctorProbe(options, doctorPassRunId, sourceTruthResult.probe);
	await flushDoctorEvents(options);

	await writeEvidencePacket({
		reportDirectory,
		runId,
		probes,
		codebaseIntakeJsonPath: codebaseIntake.jsonPath,
	});

	await queueDoctorStage(
		options,
		doctorPassRunId,
		"codex_interpretation_running",
	);
	const topNine = await runRepoDoctorTopNine({
		runId,
		repositoryRoot: options.repositoryRoot,
		reportDirectory,
		codebaseIntakeJson: codebaseIntakeJsonRead.value,
		commandProofMap: commandProofMapResult.artifact,
		codexSetupAudit: codexSetupAuditResult.artifact,
		sourceTruthAgentReadiness: sourceTruthResult.artifact,
		codexBinary: options.codexBinary,
	});
	probes.push(topNine.probe);
	await queueDoctorProbe(options, doctorPassRunId, topNine.probe);

	const findings = topNine.output.findings.map((finding) => ({
		...finding,
		localReportRef:
			finding.localReportRef ||
			getDoctorPassLocalReportRef(runId, "repo-doctor-top-nine.output.json"),
	}));
	assertSyncSafeValue(findings, "doctor pass findings");
	const findingsPath = path.join(reportDirectory, "findings.json");
	await writeJsonArtifact({
		filePath: findingsPath,
		value: {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			findings,
		},
	});
	const preview = createSyncPreview({
		runId,
		doctorPassRunId,
		findings,
		probes,
	});
	const syncPreviewPath = path.join(reportDirectory, "sync-preview.json");
	await writeJsonArtifact({ filePath: syncPreviewPath, value: preview });
	await writeRedactionReport({ reportDirectory, runId, probes });
	await writeDoctorPassMarkdown({
		reportDirectory,
		runId,
		doctorPassRunId,
		findings,
		probes,
		previewDigest: preview.previewDigest,
	});

	await queueDoctorStage(options, doctorPassRunId, "sync_preview_ready");
	await queueDoctorStage(options, doctorPassRunId, "findings_ready");
	if (doctorPassRunId) {
		await queueRunnerEvent(
			options.repositoryRoot,
			createRunnerEvent({
				projectId: options.state.projectId,
				runnerId: options.state.runnerId,
				doctorPassRunId,
				payload: {
					eventType: "doctor.sync_preview.ready",
					previewDigest: preview.previewDigest,
					findingsCount: findings.length,
					excludedArtifactCount: preview.excludedArtifactCount,
					localReportRef: getDoctorPassLocalReportRef(
						runId,
						"sync-preview.json",
					),
				},
			}),
		);
	}
	await flushDoctorEvents(options);

	return {
		runId,
		doctorPassRunId,
		reportDirectory,
		localReportRefPrefix,
		findings,
		previewDigest: preview.previewDigest,
		probes,
	};
}

export async function uploadDoctorPassFindings({
	repositoryRoot,
	credential,
	runId,
	fetchRunnerApi,
}: {
	repositoryRoot: string;
	credential: RunnerCredential;
	runId: string;
	fetchRunnerApi?: typeof fetch;
}): Promise<DoctorPassRunArtifacts["uploaded"]> {
	const reportDirectory = await ensureDoctorPassReportDirectory({
		repositoryRoot,
		runId,
	});
	const preview = await readJsonArtifact<{
		runId: string;
		doctorPassRunId: string | null;
		previewDigest: string;
	}>(path.join(reportDirectory, "sync-preview.json"));
	const findingsArtifact = await readJsonArtifact<{
		findings: DoctorFinding[];
	}>(path.join(reportDirectory, "findings.json"));
	if (!preview.doctorPassRunId) {
		throw new Error("Local-only doctor pass runs cannot upload findings.");
	}
	if (preview.runId !== runId) {
		throw new Error("Sync preview run id does not match upload run id.");
	}
	const findings = normalizeFindingsForUpload(findingsArtifact.findings);
	const uploadDigest = createApprovedFindingsDigest({
		runId,
		doctorPassRunId: preview.doctorPassRunId,
		findings,
	});
	if (uploadDigest !== preview.previewDigest) {
		throw new Error(
			"Findings payload does not match the approved sync preview digest.",
		);
	}
	const result = await uploadApprovedFindings({
		credential,
		doctorPassRunId: preview.doctorPassRunId,
		previewDigest: preview.previewDigest,
		findings,
		fetchRunnerApi,
	});
	await writeJsonArtifact({
		filePath: path.join(reportDirectory, "upload-result.json"),
		value: {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			...result,
		},
	});
	return result;
}

async function readProbeJsonOrBlocked({
	filePath,
	probeId,
	blockedReason,
}: {
	filePath: string;
	probeId: string;
	blockedReason: string;
}) {
	try {
		return {
			value: await readJsonArtifact(filePath),
			blockedReason: null,
		};
	} catch (error) {
		const fallback = {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			probeId,
			status: "blocked",
			blockedReason,
			readError: error instanceof Error ? error.message : String(error),
		};
		await writeJsonArtifact({
			filePath,
			value: fallback,
		});
		return {
			value: fallback,
			blockedReason,
		};
	}
}

async function queueDoctorStage(
	options: RunDoctorPassOptions,
	doctorPassRunId: string | null,
	stage:
		| "runner_connected"
		| "passive_probes_running"
		| "codex_interpretation_running"
		| "sync_preview_ready"
		| "findings_ready",
) {
	if (!doctorPassRunId) {
		return;
	}
	await queueRunnerEvent(
		options.repositoryRoot,
		createRunnerEvent({
			projectId: options.state.projectId,
			runnerId: options.state.runnerId,
			doctorPassRunId,
			payload: {
				eventType: "doctor.stage.started",
				stage,
			},
		}),
	);
}

async function queueDoctorProbe(
	options: RunDoctorPassOptions,
	doctorPassRunId: string | null,
	probe: DoctorProbeResult,
) {
	if (!doctorPassRunId) {
		return;
	}
	await queueRunnerEvent(
		options.repositoryRoot,
		createRunnerEvent({
			projectId: options.state.projectId,
			runnerId: options.state.runnerId,
			doctorPassRunId,
			payload: {
				eventType: "doctor.probe.completed",
				probeId: probe.probeId,
				status: probe.status,
				durationMs: probe.durationMs,
				sensitivity: probe.sensitivity,
				summary: probe.summary,
				blockedReason: probe.blockedReason,
			},
		}),
	);
}

async function flushDoctorEvents(options: RunDoctorPassOptions) {
	if (options.localOnly) {
		return;
	}
	await flushRunnerEvents({
		repositoryRoot: options.repositoryRoot,
		credential: options.credential,
		fetchRunnerEvent: options.fetchRunnerApi,
	});
}

async function writeEvidencePacket({
	reportDirectory,
	runId,
	probes,
	codebaseIntakeJsonPath,
}: {
	reportDirectory: string;
	runId: string;
	probes: DoctorProbeResult[];
	codebaseIntakeJsonPath: string;
}) {
	await writeJsonArtifact({
		filePath: path.join(reportDirectory, "evidence-packet.json"),
		value: {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			runId,
			probes: probes.map((probe) => ({
				probeId: probe.probeId,
				status: probe.status,
				sensitivity: probe.sensitivity,
				summary: probe.summary,
				blockedReason: probe.blockedReason,
			})),
			artifactRefs: [
				getDoctorPassLocalReportRef(runId, "codebase-intake.md"),
				getDoctorPassLocalReportRef(runId, "codebase-intake.json"),
				getDoctorPassLocalReportRef(runId, "command-proof-map.json"),
				getDoctorPassLocalReportRef(runId, "codex-setup-audit.json"),
				getDoctorPassLocalReportRef(runId, "source-truth-agent-readiness.json"),
			],
			codebaseIntakeJsonAvailable: Boolean(codebaseIntakeJsonPath),
		},
	});
}

function createSyncPreview({
	runId,
	doctorPassRunId,
	findings,
	probes,
}: {
	runId: string;
	doctorPassRunId: string | null;
	findings: DoctorFinding[];
	probes: DoctorProbeResult[];
}) {
	const excludedArtifactCount = 5;
	const normalizedFindings = normalizeFindingsForUpload(findings);
	const previewDigest = doctorPassRunId
		? createApprovedFindingsDigest({
				runId,
				doctorPassRunId,
				findings: normalizedFindings,
			})
		: sha256Digest({
				schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
				runId,
				doctorPassRunId,
				findings: normalizedFindings,
			});
	const previewPayload = {
		schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
		runId,
		doctorPassRunId,
		findingsCount: findings.length,
		excludedArtifactCount,
		findings: normalizedFindings,
		probeStatuses: probes.map((probe) => ({
			probeId: probe.probeId,
			status: probe.status,
		})),
	};
	return {
		...previewPayload,
		previewDigest,
	};
}

async function writeRedactionReport({
	reportDirectory,
	runId,
	probes,
}: {
	reportDirectory: string;
	runId: string;
	probes: DoctorProbeResult[];
}) {
	await writeJsonArtifact({
		filePath: path.join(reportDirectory, "redaction-report.json"),
		value: {
			schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
			runId,
			localOnlyArtifacts: [
				"codebase-intake.md",
				"repo-doctor-top-nine.prompt.md",
				"repo-doctor-top-nine.events.jsonl",
			],
			syncedArtifactKinds: ["structured findings", "runner events"],
			probeCount: probes.length,
		},
	});
}

async function writeDoctorPassMarkdown({
	reportDirectory,
	runId,
	doctorPassRunId,
	findings,
	probes,
	previewDigest,
}: {
	reportDirectory: string;
	runId: string;
	doctorPassRunId: string | null;
	findings: DoctorFinding[];
	probes: DoctorProbeResult[];
	previewDigest: string;
}) {
	const lines = [
		"# Doctor Pass",
		"",
		`Run: \`${runId}\``,
		`Workspace run: \`${doctorPassRunId ?? "local-only"}\``,
		`Sync preview digest: \`${previewDigest}\``,
		"",
		"## Probe Status",
		"",
		...probes.map(
			(probe) => `- \`${probe.probeId}\`: ${probe.status} - ${probe.summary}`,
		),
		"",
		"## Findings",
		"",
		...findings.map(
			(finding) =>
				`${finding.rank}. ${finding.title} (${finding.severity}, ${finding.status})`,
		),
		"",
	];
	await writeFile(
		path.join(reportDirectory, "doctor-pass.md"),
		lines.join("\n"),
	);
}
