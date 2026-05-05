import type { CodebaseFindingInput } from "./types";

export const APPROVED_FINDINGS_DIGEST_SCHEMA_VERSION = "doctor-pass-local.v1";

type ApprovedFindingsDigestInput = {
	runId: string;
	doctorPassRunId: string;
	findings: CodebaseFindingInput[];
};

export async function createApprovedFindingsDigest({
	runId,
	doctorPassRunId,
	findings,
}: ApprovedFindingsDigestInput) {
	const encodedPayload = new TextEncoder().encode(
		stableStringifyApprovedFindingsPayload(
			createApprovedFindingsDigestPayload({
				runId,
				doctorPassRunId,
				findings,
			}),
		),
	);
	const digest = await crypto.subtle.digest("SHA-256", encodedPayload);
	return `sha256:${Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("")}`;
}

export function createApprovedFindingsDigestPayload({
	runId,
	doctorPassRunId,
	findings,
}: ApprovedFindingsDigestInput) {
	return {
		schemaVersion: APPROVED_FINDINGS_DIGEST_SCHEMA_VERSION,
		runId,
		doctorPassRunId,
		findings: findings.map(normalizeFindingForPreviewDigest),
	};
}

function normalizeFindingForPreviewDigest(finding: CodebaseFindingInput) {
	return {
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
	};
}

function normalizeEvidenceRefForDigest(
	evidenceRef: CodebaseFindingInput["evidenceRefs"][number],
) {
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

export function stableStringifyApprovedFindingsPayload(value: unknown): string {
	return stringifyCanonicalJson(value);
}

function stringifyCanonicalJson(value: unknown): string {
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

	const record = value as Record<string, unknown>;
	const fields = Object.keys(record)
		.filter((key) => record[key] !== undefined)
		.sort()
		.map(
			(key) => `${JSON.stringify(key)}:${stringifyCanonicalJson(record[key])}`,
		);

	return `{${fields.join(",")}}`;
}

function stringifyCanonicalArrayItem(value: unknown): string {
	if (value === undefined) {
		throw new Error(
			"Approved findings digest arrays cannot include undefined.",
		);
	}
	return stringifyCanonicalJson(value);
}
