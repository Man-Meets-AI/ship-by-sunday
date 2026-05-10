const productionProofResultValues = new Set([
	"success",
	"failure",
	"cancelled",
	"skipped",
]);

function buildProofState({ notes = null, runId = null, status, url = null }) {
	return { notes, runId, status, url };
}

function isObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function runMetadataFromSummary(summary) {
	return {
		runId: typeof summary.runId === "string" ? summary.runId : null,
		url: typeof summary.runUrl === "string" ? summary.runUrl : null,
	};
}

function validateProductionReleaseProofSummaryShape(summary, expectedCommitSha) {
	const issues = [];

	if (!isObject(summary)) {
		return {
			ok: false,
			issues: ["Production release proof summary must be an object."],
		};
	}

	if (summary.schemaVersion !== "release-proof-summary.v1") {
		issues.push("Production release proof summary has an unsupported schema.");
	}

	if (summary.workflowName !== "Production Release Proof") {
		issues.push("Summary is not from the Production Release Proof workflow.");
	}

	if (summary.environment !== "production") {
		issues.push(
			`Production release proof summary environment was ${summary.environment ?? "<missing>"}, expected production.`,
		);
	}

	if (summary.commitSha !== expectedCommitSha) {
		issues.push(
			`Summary commit ${summary.commitSha ?? "<missing>"} does not match ${expectedCommitSha}.`,
		);
	}

	if (!isObject(summary.proof)) {
		issues.push("Production release proof summary proof must be an object.");
		return {
			ok: issues.length === 0,
			issues,
		};
	}

	if (typeof summary.proof.billingSensitive !== "boolean") {
		issues.push(
			"Production release proof summary proof.billingSensitive must be a boolean.",
		);
	}

	if (typeof summary.proof.convexSensitive !== "boolean") {
		issues.push(
			"Production release proof summary proof.convexSensitive must be a boolean.",
		);
	}

	for (const key of ["defaultShip", "billingIntegration"]) {
		if (!productionProofResultValues.has(summary.proof[key])) {
			issues.push(
				`Production release proof summary proof.${key} must be one of ${Array.from(productionProofResultValues).join(", ")}.`,
			);
		}
	}

	return {
		ok: issues.length === 0,
		issues,
	};
}

export function validateProductionReleaseProofSummary(
	summary,
	expectedCommitSha,
) {
	const shape = validateProductionReleaseProofSummaryShape(
		summary,
		expectedCommitSha,
	);
	if (!shape.ok) {
		return shape;
	}

	const issues = [];
	if (summary.proof.defaultShip !== "success") {
		issues.push(
			`Production default_ship proof was ${summary.proof.defaultShip}, expected success.`,
		);
	}

	if (
		summary.proof.billingSensitive === true &&
		summary.proof.billingIntegration !== "success"
	) {
		issues.push(
			`Production billing proof was ${summary.proof.billingIntegration}, expected success for a billing-sensitive release.`,
		);
	}

	if (
		summary.proof.billingSensitive === false &&
		summary.proof.billingIntegration !== "skipped"
	) {
		issues.push(
			`Production billing proof was ${summary.proof.billingIntegration}, expected skipped for a non-billing-sensitive release.`,
		);
	}

	return {
		ok: issues.length === 0,
		issues,
	};
}

export function buildProofStatesFromProductionReleaseProofSummary(
	summary,
	expectedCommitSha,
) {
	const shape = validateProductionReleaseProofSummaryShape(
		summary,
		expectedCommitSha,
	);
	if (!shape.ok) {
		return shape;
	}

	const runMetadata = runMetadataFromSummary(summary);
	const defaultShipPassed = summary.proof.defaultShip === "success";
	const defaultShipNotes = defaultShipPassed
		? "Derived from same-commit Production Release Proof default_ship."
		: `Production default_ship proof was ${summary.proof.defaultShip}.`;
	const defaultShipProof = buildProofState({
		...runMetadata,
		status: defaultShipPassed ? "passed" : "failed",
		notes: defaultShipNotes,
	});
	let billingProof;
	if (summary.proof.billingSensitive === true) {
		const billingPassed = summary.proof.billingIntegration === "success";
		billingProof = buildProofState({
			...runMetadata,
			status: billingPassed ? "passed" : "failed",
			notes: billingPassed
				? "Production proof classified the release as billing-sensitive and billing_integration passed."
				: `Production proof classified the release as billing-sensitive, but billing_integration was ${summary.proof.billingIntegration}.`,
		});
	} else {
		const billingSkipped = summary.proof.billingIntegration === "skipped";
		billingProof = buildProofState({
			...runMetadata,
			status: billingSkipped ? "not_required" : "failed",
			notes: billingSkipped
				? "Production proof classified the release as not billing-sensitive."
				: `Production proof classified the release as not billing-sensitive, but billing_integration was ${summary.proof.billingIntegration}.`,
		});
	}

	return {
		ok: true,
		issues: [],
		proof: {
			auth: defaultShipProof,
			billing: billingProof,
			convexSensitive: summary.proof.convexSensitive,
			entitlement: defaultShipProof,
			vercel: defaultShipProof,
		},
	};
}
