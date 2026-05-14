import { INSTALL_REPORT_REF } from "./constants";
import {
	WORKER_FOUNDATIONS_BUNDLE_VERSION,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
	WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
} from "./manifest";
import { buildPrivacyBoundary } from "./privacy";
import type {
	WorkerInstallContext,
	WorkerInstallPhase,
	WorkerInstallPlan,
	WorkerInstallReport,
	WorkerInstallResult,
	WorkerKickoffStatus,
	WorkerProofCommandStatus,
} from "./types";
import { uniqueRefs, writeRepoFile } from "./utils";

export async function writeTrackedInstallReport({
	context,
	result,
}: {
	context: WorkerInstallContext;
	result: WorkerInstallReport;
}) {
	await writeRepoFile(context, INSTALL_REPORT_REF, renderInstallReport(result));
}

export function buildReport({
	context,
	outcome,
	branch,
	commit,
	plan,
	proof,
	createdRefs,
	changedRefs,
	localProofRef,
	reportRef,
	kickoff,
}: {
	context: WorkerInstallContext;
	outcome: WorkerInstallResult["outcome"];
	branch: string | null;
	commit: string | null;
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	createdRefs: string[];
	changedRefs: string[];
	localProofRef: string | null;
	reportRef: string | null;
	kickoff: WorkerKickoffStatus;
}): WorkerInstallReport {
	return {
		schemaVersion: "worker-foundations-install-result.v1",
		workflowId: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_ID,
		workflowVersion: WORKER_FOUNDATIONS_INSTALL_WORKFLOW_VERSION,
		outcome,
		workerBundleVersion: WORKER_FOUNDATIONS_BUNDLE_VERSION,
		branch,
		commit,
		dryRun: context.options.dryRun,
		phases: buildPhaseSummary({ plan, proof, kickoff, outcome }),
		plan,
		proof,
		createdRefs: uniqueRefs(createdRefs),
		changedRefs: uniqueRefs(changedRefs),
		reportRef,
		localProofRef,
		kickoff,
		privacyBoundary: buildPrivacyBoundary(),
	};
}

function buildPhaseSummary({
	plan,
	proof,
	kickoff,
	outcome,
}: {
	plan: WorkerInstallPlan;
	proof: WorkerProofCommandStatus[];
	kickoff: WorkerKickoffStatus;
	outcome: WorkerInstallResult["outcome"];
}): WorkerInstallPhase[] {
	const blocked = plan.blockers.length > 0;
	return [
		{
			name: "preflight",
			status: blocked ? "blocked" : "ready",
			reason: blocked ? plan.blockers[0]?.reason : undefined,
		},
		{
			name: "apply",
			status:
				outcome === "ready"
					? "planned"
					: outcome === "blocked" || outcome === "cancelled"
						? "skipped"
						: "applied",
		},
		{
			name: "proof",
			status: proof.some((item) => item.status === "failed")
				? "failed"
				: proof.length > 0
					? "applied"
					: "skipped",
		},
		{
			name: "kickoff",
			status: kickoff.status === "started" ? "applied" : "skipped",
		},
	];
}

function renderInstallReport(result: WorkerInstallReport) {
	const proofLines =
		result.proof.length === 0
			? ["- not run"]
			: result.proof.map((proof) => `- \`${proof.command}\`: ${proof.status}`);
	return [
		"---",
		"title: Worker Install Report",
		"summary: Current Shipbysunday Worker Foundations install state.",
		"docType: guide",
		"status: active",
		"read_when:",
		"  - Checking the current Worker Foundations install.",
		"---",
		"",
		"# Worker Install Report",
		"",
		`Outcome: \`${result.outcome}\``,
		`Worker bundle version: \`${result.workerBundleVersion}\``,
		`Branch: \`${result.branch ?? "not-created"}\``,
		`Commit: \`${result.commit ? "current branch HEAD after install" : "not-created"}\``,
		`Local proof: \`${result.localProofRef ?? "not-written"}\``,
		"",
		"## Proof",
		"",
		...proofLines,
		"",
		"## Kickoff",
		"",
		`Status: \`${result.kickoff.status}\``,
		`Profile: \`${result.kickoff.codexProfile}\``,
		`Prompt ref: \`${result.kickoff.promptRef}\``,
		"",
		"## Installed Refs",
		"",
		...result.createdRefs.map((ref) => `- created \`${ref}\``),
		...result.changedRefs.map((ref) => `- changed \`${ref}\``),
		"",
	].join("\n");
}
