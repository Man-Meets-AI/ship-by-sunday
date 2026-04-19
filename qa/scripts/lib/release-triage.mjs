const SNAPSHOT_REQUIRED_MERGEABLE_STATES = new Set(["CONFLICTING"]);
const SNAPSHOT_REQUIRED_MERGE_STATE_STATUSES = new Set(["DIRTY"]);

function getCheckRunTimestamp(checkRun) {
	const timestamp =
		checkRun?.completed_at ?? checkRun?.started_at ?? checkRun?.created_at ?? null;

	if (typeof timestamp !== "string" || timestamp.length === 0) {
		return 0;
	}

	const parsed = Date.parse(timestamp);
	return Number.isNaN(parsed) ? 0 : parsed;
}

function isNewerCheckRun(nextCheckRun, currentCheckRun) {
	const nextTimestamp = getCheckRunTimestamp(nextCheckRun);
	const currentTimestamp = getCheckRunTimestamp(currentCheckRun);

	if (nextTimestamp !== currentTimestamp) {
		return nextTimestamp > currentTimestamp;
	}

	return (nextCheckRun?.id ?? 0) > (currentCheckRun?.id ?? 0);
}

export function selectLatestCheckRuns(checkRuns) {
	const latestCheckRunsByName = {};

	for (const checkRun of checkRuns) {
		if (!checkRun || typeof checkRun.name !== "string" || checkRun.name.length === 0) {
			continue;
		}

		const currentCheckRun = latestCheckRunsByName[checkRun.name];
		if (!currentCheckRun || isNewerCheckRun(checkRun, currentCheckRun)) {
			latestCheckRunsByName[checkRun.name] = checkRun;
		}
	}

	return latestCheckRunsByName;
}

function summarizeCheckRun(checkRun) {
	return {
		completed_at: checkRun.completed_at ?? null,
		conclusion: checkRun.conclusion ?? null,
		details_url: checkRun.details_url ?? null,
		html_url: checkRun.html_url ?? null,
		id: checkRun.id ?? null,
		name: checkRun.name,
		started_at: checkRun.started_at ?? null,
		status: checkRun.status ?? null,
	};
}

function buildProofSummary({ latestCheckRunsByName, releaseScope }) {
	const requiredChecks = ["release_scope", "default_ship", "release_gate"];

	if (releaseScope.billingSensitive) {
		requiredChecks.push("billing_integration");
	}

	const blockers = [];

	for (const checkName of requiredChecks) {
		const checkRun = latestCheckRunsByName[checkName];
		if (!checkRun) {
			blockers.push(
				`Missing required GitHub check run '${checkName}' on the release candidate commit.`,
			);
			continue;
		}

		if (checkRun.status !== "completed") {
			blockers.push(
				`GitHub check run '${checkName}' is still ${checkRun.status ?? "pending"}.`,
			);
			continue;
		}

		if (checkRun.conclusion !== "success") {
			blockers.push(
				`GitHub check run '${checkName}' concluded with ${checkRun.conclusion ?? "unknown"}.`,
			);
		}
	}

	return {
		blockers,
		latestCheckRunsByName: Object.fromEntries(
			Object.entries(latestCheckRunsByName).map(([checkName, checkRun]) => [
				checkName,
				summarizeCheckRun(checkRun),
			]),
		),
		ready: blockers.length === 0,
		requiredChecks,
	};
}

function buildReleasePathSummary({
	baseBranchName,
	candidate,
	headBranchName,
	metadataFailures,
	releasePullRequest,
}) {
	const blockers = [...metadataFailures];
	let state = "releasable";
	let snapshotRequired = false;

	if (releasePullRequest) {
		const prTargetsExpectedBranches =
			releasePullRequest.baseRefName === baseBranchName &&
			releasePullRequest.headRefName === headBranchName;
		const prTracksCandidateSha = releasePullRequest.headRefOid === candidate.sha;

		if (!prTargetsExpectedBranches || !prTracksCandidateSha) {
			blockers.push(
				`Release PR #${releasePullRequest.number} does not match ${candidate.ref}.`,
			);
			state = "blocked_unrelated_dev_scope";
		}

		if (
			releasePullRequest.mergeable === "UNKNOWN" ||
			releasePullRequest.mergeStateStatus === "UNKNOWN"
		) {
			blockers.push(
				`GitHub mergeability is still UNKNOWN for release PR #${releasePullRequest.number}.`,
			);
		}

		if (
			SNAPSHOT_REQUIRED_MERGEABLE_STATES.has(releasePullRequest.mergeable) ||
			SNAPSHOT_REQUIRED_MERGE_STATE_STATUSES.has(
				releasePullRequest.mergeStateStatus,
			)
		) {
			snapshotRequired = true;
			if (state === "releasable") {
				state = "snapshot_required";
			}
		}
	}

	if (blockers.length > 0 && state === "releasable") {
		state = "blocked_metadata";
	}

	return {
		blockers,
		ready: blockers.length === 0,
		snapshotRequired,
		state,
	};
}

export function buildReleaseTriageSummary({
	baseBranchName,
	candidate,
	checkRuns,
	deployment,
	headBranchName,
	metadataFailures,
	proofEnvironment,
	releasePullRequest,
	releaseScope,
}) {
	const latestCheckRunsByName = selectLatestCheckRuns(checkRuns);
	const proof = buildProofSummary({
		latestCheckRunsByName,
		releaseScope,
	});
	const releasePath = buildReleasePathSummary({
		baseBranchName,
		candidate,
		headBranchName,
		metadataFailures,
		releasePullRequest,
	});
	const readinessBlockers = [...releasePath.blockers, ...proof.blockers];

	if (!deployment?.resolved) {
		readinessBlockers.push(
			`No exact ${proofEnvironment.vercelEnvironment} deployment is bound to ${candidate.ref}.`,
		);
	}

	return {
		candidate,
		proof: {
			...proofEnvironment,
			blockers: proof.blockers,
			deployment,
			latestCheckRunsByName: proof.latestCheckRunsByName,
			ready: proof.ready,
			requiredChecks: proof.requiredChecks,
		},
		readiness: {
			blockers: readinessBlockers,
			ready:
				releasePath.state === "releasable" &&
				proof.ready &&
				deployment?.resolved === true,
		},
		releasePath,
		releasePullRequest,
		releaseScope,
	};
}
