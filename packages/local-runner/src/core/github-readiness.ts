import { boundedProcessSucceeds } from "./bounded-process";
import type { SetupCheckStatus } from "./runner-events";

export type SetupCheckResult = {
	scope: "machine" | "project";
	checkKey: string;
	status: SetupCheckStatus;
	summary: string;
	remediationAction?: string;
};

export async function runGithubReadinessChecks(): Promise<SetupCheckResult[]> {
	const hasGitHubCli = await boundedProcessSucceeds("gh", ["--version"]);
	if (!hasGitHubCli) {
		return [
			{
				scope: "machine",
				checkKey: "github-cli",
				status: "warning",
				summary: "GitHub CLI is not available.",
				remediationAction: "Install gh and sign in before Work/Run workflows.",
			},
		];
	}

	const isAuthenticated = await boundedProcessSucceeds("gh", [
		"auth",
		"status",
	]);
	return [
		{
			scope: "machine",
			checkKey: "github-cli",
			status: "ready",
			summary: "GitHub CLI is available.",
		},
		{
			scope: "machine",
			checkKey: "github-auth",
			status: isAuthenticated ? "ready" : "warning",
			summary: isAuthenticated
				? "GitHub CLI has an authenticated account."
				: "GitHub CLI is installed but not authenticated.",
			remediationAction: isAuthenticated
				? undefined
				: "Run gh auth login before Work/Run workflows.",
		},
	];
}
