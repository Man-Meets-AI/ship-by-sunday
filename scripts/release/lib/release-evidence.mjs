import { releaseEvidenceSchemaVersion } from "./release-manifest.mjs";

const proofStates = ["passed", "failed", "not_required", "unavailable", "skipped", "pending"];

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertObject(value, label) {
	assert(
		value !== null && typeof value === "object" && Array.isArray(value) === false,
		`${label} must be an object.`,
	);
}

function assertString(value, label) {
	assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string.`);
}

function assertNullableString(value, label) {
	assert(
		value === null || typeof value === "string",
		`${label} must be a string or null.`,
	);
}

function assertProofState(value, label) {
	assert(
		typeof value === "string" && proofStates.includes(value),
		`${label} must be one of ${proofStates.join(", ")}.`,
	);
}

function assertProofObject(value, label) {
	assertObject(value, label);
	assertProofState(value.status, `${label}.status`);
	assertNullableString(value.url ?? null, `${label}.url`);
	assertNullableString(value.runId ?? null, `${label}.runId`);
	assertNullableString(value.notes ?? null, `${label}.notes`);
}

function buildProofState({ notes = null, runId = null, status, url = null }) {
	return { notes, runId, status, url };
}

function blockerForUnavailable(label, proof) {
	if (proof.status === "passed" || proof.status === "not_required" || proof.status === "pending") {
		return null;
	}

	if (proof.status === "failed") {
		return `${label} proof failed.`;
	}

	if (proof.status === "skipped") {
		return `${label} proof was skipped.`;
	}

	return `${label} proof is unavailable.`;
}

export function buildReleaseEvidence({
	auth = buildProofState({ status: "unavailable", notes: "Auth proof was not supplied." }),
	billing = buildProofState({ status: "unavailable", notes: "Billing proof was not supplied." }),
	blockers = [],
	branchModel = "tag_attests_main",
	convex = buildProofState({ status: "unavailable", notes: "Convex production proof was not supplied." }),
	generatedAt = new Date().toISOString(),
	githubRelease = buildProofState({ status: "pending", notes: "GitHub Release publication has not run yet." }),
	mainSha,
	manifest,
	tagTargetSha,
	vercel = buildProofState({ status: "unavailable", notes: "Vercel production proof was not supplied." }),
	workflowRuns = [],
	entitlement = buildProofState({ status: "unavailable", notes: "Entitlement proof was not supplied." }),
} = {}) {
	assertObject(manifest, "release manifest");
	assertString(mainSha, "mainSha");
	assertString(tagTargetSha, "tagTargetSha");

	const proofBlockers = [
		["Vercel production", vercel],
		["Convex production", convex],
		["Billing", billing],
		["Auth", auth],
		["Entitlement", entitlement],
	]
		.map(([label, proof]) => blockerForUnavailable(label, proof))
		.filter(Boolean);

	return {
		schemaVersion: releaseEvidenceSchemaVersion,
		version: manifest.version,
		gitTag: manifest.gitTag,
		tagTargetSha,
		mainSha,
		branchModel,
		releaseChannel: manifest.channel,
		changelogHeading: manifest.changelogHeading,
		githubRelease,
		workflowRuns,
		vercel,
		convex,
		billing,
		auth,
		entitlement,
		blockers: [...blockers, ...proofBlockers],
		generatedAt,
	};
}

export function assertReleaseEvidence(document, { publish = false } = {}) {
	assertObject(document, "release evidence");
	assert(
		document.schemaVersion === releaseEvidenceSchemaVersion,
		`release evidence schemaVersion must be ${releaseEvidenceSchemaVersion}.`,
	);
	assertString(document.version, "release evidence version");
	assertString(document.gitTag, "release evidence gitTag");
	assertString(document.tagTargetSha, "release evidence tagTargetSha");
	assertString(document.mainSha, "release evidence mainSha");
	assertString(document.branchModel, "release evidence branchModel");
	assertString(document.releaseChannel, "release evidence releaseChannel");
	assertString(document.changelogHeading, "release evidence changelogHeading");
	assertString(document.generatedAt, "release evidence generatedAt");
	assert(Array.isArray(document.workflowRuns), "release evidence workflowRuns must be an array.");
	assert(Array.isArray(document.blockers), "release evidence blockers must be an array.");

	assertProofObject(document.githubRelease, "release evidence githubRelease");
	assertProofObject(document.vercel, "release evidence vercel");
	assertProofObject(document.convex, "release evidence convex");
	assertProofObject(document.billing, "release evidence billing");
	assertProofObject(document.auth, "release evidence auth");
	assertProofObject(document.entitlement, "release evidence entitlement");

	if (publish) {
		const publishBlockers = document.blockers.filter(Boolean);
		assert(
			publishBlockers.length === 0,
			`release evidence is not publishable: ${publishBlockers.join(" ")}`,
		);
	}

	return document;
}

export function proofStateFromStatus(status, notes) {
	const normalizedStatus = status?.trim() || "unavailable";

	if (normalizedStatus === "success" || normalizedStatus === "passed") {
		return buildProofState({ status: "passed", notes: notes ?? null });
	}

	if (normalizedStatus === "not_required") {
		return buildProofState({ status: "not_required", notes: notes ?? null });
	}

	if (normalizedStatus === "skipped") {
		return buildProofState({ status: "skipped", notes: notes ?? null });
	}

	if (normalizedStatus === "failure" || normalizedStatus === "failed" || normalizedStatus === "cancelled") {
		return buildProofState({ status: "failed", notes: notes ?? null });
	}

	return buildProofState({ status: "unavailable", notes: notes ?? null });
}
