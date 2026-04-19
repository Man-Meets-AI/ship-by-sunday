export function isSnapshotReleasePullRequest(releasePullRequest) {
	return (
		releasePullRequest?.base?.ref === "main" &&
		typeof releasePullRequest?.head?.ref === "string" &&
		releasePullRequest.head.ref.startsWith("release-snapshot-") &&
		typeof releasePullRequest?.merged_at === "string"
	);
}

export function buildReleaseReconcilePullRequestTitle(snapshotReleasePullRequest) {
	return `Reconcile main back into dev after snapshot release #${snapshotReleasePullRequest.number}`;
}

export function buildReleaseReconcilePullRequestBody({
	mainCommitSha,
	snapshotReleasePullRequest,
}) {
	return [
		"## Summary",
		"- reconcile the merged snapshot release on `main` back into `dev`",
		`- keep branch history aligned after snapshot release PR #${snapshotReleasePullRequest.number}`,
		"",
		"## Source",
		`- snapshot release PR: ${snapshotReleasePullRequest.html_url}`,
		`- merged main commit: \`${mainCommitSha}\``,
		`- snapshot head branch: \`${snapshotReleasePullRequest.head.ref}\``,
		"",
		"## Why this exists",
		"- snapshot releases preserve the `dev` tree on top of `main` when the normal `dev -> main` PR is structurally blocked",
		"- after that merge, `main` advances to the shipped snapshot commit and `dev` must be reconciled back to the same result",
	].join("\n");
}
