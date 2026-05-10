export function validateConvexProductionDeploySummary(
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
