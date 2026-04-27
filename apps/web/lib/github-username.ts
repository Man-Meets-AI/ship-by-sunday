export const GITHUB_USERNAME_MAX_LENGTH = 39;

const GITHUB_USERNAME_ALLOWED_REGEX = /^[A-Za-z0-9-]+$/;
const GITHUB_USERNAME_REGEX =
	/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

export function normalizeGitHubUsername(value: string) {
	return String(value ?? "")
		.trim()
		.replace(/^@/, "");
}

export function toGitHubUsernameLower(value: string) {
	return normalizeGitHubUsername(value).toLowerCase();
}

export function validateGitHubUsername(value: string) {
	const normalized = normalizeGitHubUsername(value);

	if (!normalized) {
		return {
			normalized,
			error:
				"Enter the GitHub username that should receive starter repo access.",
		};
	}

	if (normalized.length > GITHUB_USERNAME_MAX_LENGTH) {
		return {
			normalized,
			error: `GitHub usernames must be ${GITHUB_USERNAME_MAX_LENGTH} characters or fewer.`,
		};
	}

	if (!GITHUB_USERNAME_ALLOWED_REGEX.test(normalized)) {
		return {
			normalized,
			error:
				"GitHub usernames can only contain letters, numbers, or single hyphens.",
		};
	}

	if (normalized.startsWith("-") || normalized.endsWith("-")) {
		return {
			normalized,
			error: "GitHub usernames cannot start or end with a hyphen.",
		};
	}

	if (normalized.includes("--")) {
		return {
			normalized,
			error: "GitHub usernames cannot contain consecutive hyphens.",
		};
	}

	if (!GITHUB_USERNAME_REGEX.test(normalized)) {
		return {
			normalized,
			error: "Enter a valid GitHub username.",
		};
	}

	return {
		normalized,
		error: null,
	};
}
