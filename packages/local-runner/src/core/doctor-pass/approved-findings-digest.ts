import { createHash } from "node:crypto";

import type { JsonObject, JsonValue } from "../json-value";
import {
	DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
	type DoctorFinding,
	type EvidenceRef,
} from "./types";

type ApprovedFindingsDigestInput = {
	runId: string;
	doctorPassRunId: string;
	findings: DoctorFinding[];
};

export function createApprovedFindingsDigest({
	runId,
	doctorPassRunId,
	findings,
}: ApprovedFindingsDigestInput) {
	return `sha256:${createHash("sha256")
		.update(
			stableStringifyApprovedFindingsPayload(
				createApprovedFindingsDigestPayload({
					runId,
					doctorPassRunId,
					findings,
				}),
			),
		)
		.digest("hex")}`;
}

export function createApprovedFindingsDigestPayload({
	runId,
	doctorPassRunId,
	findings,
}: ApprovedFindingsDigestInput) {
	return {
		schemaVersion: DOCTOR_PASS_ARTIFACT_SCHEMA_VERSION,
		runId,
		doctorPassRunId,
		findings: normalizeFindingsForUpload(findings),
	};
}

export function normalizeFindingsForUpload(findings: DoctorFinding[]) {
	return findings.map((finding) => ({
		findingId: finding.findingId,
		rank: finding.rank,
		status: finding.status,
		title: finding.title,
		category: finding.category,
		severity: finding.severity,
		confidence: finding.confidence,
		buyerImpact: finding.buyerImpact,
		blastRadius: finding.blastRadius,
		proofPath: finding.proofPath,
		proofability: finding.proofability,
		permissionRequired: finding.permissionRequired,
		recommendedWorkflowId: finding.recommendedWorkflowId,
		whyThisNow: finding.whyThisNow,
		evidenceRefs: finding.evidenceRefs.map(normalizeEvidenceRefForDigest),
		blockedReason: finding.blockedReason,
		syncSensitivity: finding.syncSensitivity,
		localReportRef: finding.localReportRef,
	}));
}

function normalizeEvidenceRefForDigest(evidenceRef: EvidenceRef) {
	switch (evidenceRef.kind) {
		case "file":
			return {
				kind: evidenceRef.kind,
				repoRelativePath: evidenceRef.repoRelativePath,
				lineStart: evidenceRef.lineStart,
				lineEnd: evidenceRef.lineEnd,
				summary: evidenceRef.summary,
			};
		case "command":
			return {
				kind: evidenceRef.kind,
				commandName: evidenceRef.commandName,
				summary: evidenceRef.summary,
			};
		case "artifact":
			return {
				kind: evidenceRef.kind,
				artifactId: evidenceRef.artifactId,
				localReportRef: evidenceRef.localReportRef,
				summary: evidenceRef.summary,
			};
		case "package":
			return {
				kind: evidenceRef.kind,
				packageName: evidenceRef.packageName,
				summary: evidenceRef.summary,
			};
	}
}

export function stableStringifyApprovedFindingsPayload(
	value: JsonValue,
): string {
	return stringifyCanonicalJson(value);
}

function stringifyCanonicalJson(value: JsonValue | undefined): string {
	if (value === null) {
		return "null";
	}

	if (typeof value === "string") {
		return JSON.stringify(value);
	}

	if (typeof value === "number") {
		if (!Number.isFinite(value)) {
			throw new Error(
				"Approved findings digest cannot include non-finite numbers.",
			);
		}
		return JSON.stringify(value);
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	if (value === undefined) {
		throw new Error("Approved findings digest value cannot be undefined.");
	}

	if (Array.isArray(value)) {
		return `[${value.map(stringifyCanonicalArrayItem).join(",")}]`;
	}

	if (typeof value !== "object") {
		throw new Error("Approved findings digest value must be JSON-compatible.");
	}

	const record = value as JsonObject;
	const fields = Object.keys(record)
		.filter((key) => record[key] !== undefined)
		.sort()
		.map(
			(key) => `${JSON.stringify(key)}:${stringifyCanonicalJson(record[key])}`,
		);

	return `{${fields.join(",")}}`;
}

function stringifyCanonicalArrayItem(value: JsonValue | undefined): string {
	if (value === undefined) {
		throw new Error(
			"Approved findings digest arrays cannot include undefined.",
		);
	}
	return stringifyCanonicalJson(value);
}
