export function buildDeploymentListUrl({ projectId, teamId, target }) {
	const apiUrl = new URL("https://api.vercel.com/v6/deployments");
	apiUrl.searchParams.set("projectId", projectId);
	apiUrl.searchParams.set("state", "BUILDING,READY");
	apiUrl.searchParams.set("limit", "20");
	if (target && target !== "preview") {
		apiUrl.searchParams.set("target", target);
	}
	if (teamId) {
		apiUrl.searchParams.set("teamId", teamId);
	}
	return apiUrl;
}

export function buildDeploymentAliasesUrl({ deploymentId, teamId }) {
	const apiUrl = new URL(
		`https://api.vercel.com/v2/deployments/${deploymentId}/aliases`,
	);
	if (teamId) {
		apiUrl.searchParams.set("teamId", teamId);
	}
	return apiUrl;
}

export function buildDeploymentAliasAssignmentUrl({ deploymentId, teamId }) {
	return buildDeploymentAliasesUrl({ deploymentId, teamId });
}

export function deploymentMatchesTarget({ deployment, target }) {
	if (target === "preview") {
		return deployment.target == null;
	}

	return deployment.target === target;
}

export function findMatchingDeployments({ commitSha, deployments, target }) {
	return deployments.filter((deployment) => {
		const commitMatches = deployment.meta?.githubCommitSha === commitSha;
		if (!commitMatches) {
			return false;
		}

		const ready =
			deployment.state === "READY" || deployment.readyState === "READY";
		if (!ready || !deploymentMatchesTarget({ deployment, target })) {
			return false;
		}

		return true;
	});
}

export function extractInlineDeploymentAliases(deployment) {
	return Array.isArray(deployment.alias)
		? deployment.alias.filter((alias) => typeof alias === "string")
		: [];
}
