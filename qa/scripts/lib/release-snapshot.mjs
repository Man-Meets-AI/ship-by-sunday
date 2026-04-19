function padNumber(value) {
	return String(value).padStart(2, "0");
}

export function buildReleaseSnapshotBranchName(now = new Date()) {
	return [
		"release-snapshot",
		`${now.getUTCFullYear()}${padNumber(now.getUTCMonth() + 1)}${padNumber(now.getUTCDate())}`,
		`${padNumber(now.getUTCHours())}${padNumber(now.getUTCMinutes())}${padNumber(now.getUTCSeconds())}`,
	].join("-");
}

export function evaluateReleaseSnapshotEligibility({
	baseBranchName,
	candidateSha,
	headBranchName,
	releasePullRequest,
}) {
	const blockers = [];

	if (!releasePullRequest) {
		blockers.push(
			"Snapshot release is forbidden without an open dev -> main release PR to prove the normal path is actually blocked.",
		);
		return {
			allowed: false,
			blockers,
		};
	}

	if (releasePullRequest.baseRefName !== baseBranchName) {
		blockers.push(
			`Snapshot release is forbidden because release PR #${releasePullRequest.number} targets ${releasePullRequest.baseRefName}, not ${baseBranchName}.`,
		);
	}

	if (releasePullRequest.headRefName !== headBranchName) {
		blockers.push(
			`Snapshot release is forbidden because release PR #${releasePullRequest.number} uses ${releasePullRequest.headRefName}, not ${headBranchName}.`,
		);
	}

	if (releasePullRequest.headRefOid !== candidateSha) {
		blockers.push(
			`Snapshot release is forbidden because release PR #${releasePullRequest.number} does not point at candidate ${candidateSha}.`,
		);
	}

	if (
		releasePullRequest.mergeable === "UNKNOWN" ||
		releasePullRequest.mergeStateStatus === "UNKNOWN"
	) {
		blockers.push(
			`Snapshot release is forbidden because GitHub mergeability is still UNKNOWN for release PR #${releasePullRequest.number}.`,
		);
	}

	const structurallyBlocked =
		releasePullRequest.mergeable === "CONFLICTING" ||
		releasePullRequest.mergeStateStatus === "DIRTY";

	if (!structurallyBlocked) {
		blockers.push(
			`Snapshot release is forbidden because release PR #${releasePullRequest.number} is not structurally blocked (mergeable=${releasePullRequest.mergeable}, mergeStateStatus=${releasePullRequest.mergeStateStatus}).`,
		);
	}

	return {
		allowed: blockers.length === 0,
		blockers,
	};
}

export function buildReleaseSnapshotPlan({
	branchName,
	candidateSha,
	candidateTreeSha,
	mainSha,
}) {
	const commitMessage = `chore: release snapshot ${candidateSha.slice(0, 12)}`;

	return {
		branchName,
		candidateSha,
		candidateTreeSha,
		commitMessage,
		createCommands: [
			`git commit-tree ${candidateTreeSha} -p ${mainSha}`,
			`git branch ${branchName} <snapshot-commit>`,
		],
		postMergeCleanupCommands: [
			`git branch -D ${branchName}`,
			`git push origin :${branchName}`,
		],
		prBaseBranch: "main",
		rollbackCommands: [
			`git branch -D ${branchName}`,
			`git push origin :${branchName}`,
		],
		treeIdentityCommand: `git diff --quiet ${candidateSha} ${branchName}`,
	};
}
