export const STARTER_REPO_OWNER = "ParkerRex";
export const STARTER_REPO_NAME = "ship-by-sunday-starter";
export const STARTER_REPO_URL = `https://github.com/${STARTER_REPO_OWNER}/${STARTER_REPO_NAME}`;
export const GITHUB_API_VERSION = "2022-11-28";

const MAX_OPERATOR_ERROR_LENGTH = 160;

function truncateOperatorError(message) {
	return String(message ?? "")
		.trim()
		.slice(0, MAX_OPERATOR_ERROR_LENGTH);
}

export function buildGitHubApiUrl(pathname) {
	return `https://api.github.com${pathname}`;
}

export function getGitHubRequestHeaders(token) {
	return {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${token}`,
		"User-Agent": "ship-by-sunday-starter-repo-tool",
		"X-GitHub-Api-Version": GITHUB_API_VERSION,
	};
}

export function getInviteOutcome({ status, body, username }) {
	if (status === 201) {
		return {
			status: "invited",
			invitationId:
				body && body.id !== undefined && body.id !== null
					? String(body.id)
					: undefined,
		};
	}

	if (status === 204) {
		return {
			status: "accepted",
		};
	}

	if (status === 404) {
		return {
			status: "failed",
			lastError: `GitHub user ${username} was not found.`,
		};
	}

	if (status === 422) {
		return {
			status: "failed",
			lastError: truncateOperatorError(
				body?.message ?? "GitHub rejected the starter repo invite.",
			),
		};
	}

	throw new Error(
		`Unexpected GitHub invite response: ${status} ${truncateOperatorError(
			body?.message ?? "Unknown GitHub response.",
		)}`,
	);
}

export function getCollaboratorSyncOutcome(status) {
	if (status === 204) {
		return "accepted";
	}

	if (status === 404) {
		return "pending";
	}

	throw new Error(`Unexpected GitHub collaborator response: ${status}`);
}
