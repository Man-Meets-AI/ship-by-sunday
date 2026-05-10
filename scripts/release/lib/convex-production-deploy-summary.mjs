export function validateConvexProductionDeploySummaryShape(
	summary,
	expectedCommitSha,
) {
	const issues = [];

	if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
		return {
			ok: false,
			issues: ["Convex production deploy summary must be an object."],
		};
	}

	if (summary.schemaVersion !== "release-proof-summary.v1") {
		issues.push("Convex production deploy summary has an unsupported schema.");
	}

	if (summary.workflowName !== "Convex Production Deploy") {
		issues.push("Summary is not from the Convex Production Deploy workflow.");
	}

	if (summary.commitSha !== expectedCommitSha) {
		issues.push(
			`Summary commit ${summary.commitSha ?? "<missing>"} does not match ${expectedCommitSha}.`,
		);
	}

	return {
		ok: issues.length === 0,
		issues,
	};
}

export function validateConvexProductionDeploySummary(
	summary,
	expectedCommitSha,
) {
	const shape = validateConvexProductionDeploySummaryShape(
		summary,
		expectedCommitSha,
	);
	if (!shape.ok) {
		return shape;
	}

	const issues = [...shape.issues];

	if (summary.deployMode !== "deploy") {
		issues.push(
			`Convex production deploy mode was ${summary.deployMode ?? "<missing>"}, expected deploy.`,
		);
	}

	const convexProof =
		typeof summary.proof === "object" && summary.proof !== null
			? summary.proof.convex
			: undefined;
	if (convexProof !== "passed") {
		issues.push(
			`Convex production proof was ${convexProof ?? "<missing>"}, expected passed.`,
		);
	}

	return {
		ok: issues.length === 0,
		issues,
	};
}

function runMetadataFromSummary(summary) {
	return {
		runId: typeof summary?.runId === "string" ? summary.runId : null,
		url: typeof summary?.runUrl === "string" ? summary.runUrl : null,
	};
}

export function buildConvexProductionDeployProofState(
	summary,
	expectedCommitSha,
	{ required } = { required: true },
) {
	if (!required) {
		return {
			ok: true,
			issues: [],
			proof: {
				notes: "Production proof classified the release as not Convex-sensitive.",
				runId: null,
				status: "not_required",
				url: null,
			},
		};
	}

	const shape = validateConvexProductionDeploySummaryShape(
		summary,
		expectedCommitSha,
	);
	if (!shape.ok) {
		return shape;
	}

	const validation = validateConvexProductionDeploySummary(
		summary,
		expectedCommitSha,
	);
	const runMetadata = runMetadataFromSummary(summary);

	return {
		ok: true,
		issues: validation.issues,
		proof: {
			...runMetadata,
			status: validation.ok ? "passed" : "failed",
			notes: validation.ok
				? "Derived from same-commit Convex Production Deploy summary with deployMode=deploy."
				: validation.issues.join(" "),
		},
	};
}
