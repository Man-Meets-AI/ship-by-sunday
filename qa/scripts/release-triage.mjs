import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

import {
	buildDeploymentAliasesUrl,
	buildDeploymentListUrl,
	extractInlineDeploymentAliases,
	findMatchingDeployments,
} from "./lib/vercel-deployments.mjs";
import { classifyReleaseScope } from "./lib/release-scope.mjs";
import { buildReleaseTriageSummary } from "./lib/release-triage.mjs";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function runCommand(command, args) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status !== 0) {
		throw new Error(
			result.stderr.trim() ||
				`${command} ${args.join(" ")} failed with status ${result.status ?? 1}.`,
		);
	}

	return result.stdout.trim();
}

function runJsonCommand(command, args) {
	const output = runCommand(command, args);
	return output.length === 0 ? null : JSON.parse(output);
}

function getChangedFiles(baseRef, headRef) {
	const output = runCommand("git", ["diff", "--name-only", `${baseRef}..${headRef}`]);
	return output
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function resolveGitHubRepo() {
	const remoteUrl = runCommand("git", ["remote", "get-url", "origin"]);
	const match = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);

	if (!match || !match[1]) {
		throw new Error(`Unable to parse a GitHub repository from origin remote ${remoteUrl}.`);
	}

	return match[1];
}

function readGitCandidate({ baseRef, headRef }) {
	const baseSha = runCommand("git", ["rev-parse", baseRef]);
	const headSha = runCommand("git", ["rev-parse", headRef]);
	const mergeBaseSha = runCommand("git", ["merge-base", baseRef, headRef]);
	const aheadBehindCounts = runCommand("git", [
		"rev-list",
		"--left-right",
		"--count",
		`${baseRef}...${headRef}`,
	]);
	const [behindCountText = "0", aheadCountText = "0"] =
		aheadBehindCounts.split("\t");
	const changedFiles = getChangedFiles(mergeBaseSha, headRef);

	return {
		aheadCount: Number.parseInt(aheadCountText, 10) || 0,
		baseRef,
		baseSha,
		behindCount: Number.parseInt(behindCountText, 10) || 0,
		changedFiles,
		changedFilesCount: changedFiles.length,
		changedFilesSample: changedFiles.slice(0, 20),
		mergeBaseSha,
		ref: headRef,
		sha: headSha,
	};
}

function readReleasePullRequest({ baseBranchName, headBranchName, repoFullName }) {
	const pullRequests =
		runJsonCommand("gh", [
			"pr",
			"list",
			"--repo",
			repoFullName,
			"--base",
			baseBranchName,
			"--head",
			headBranchName,
			"--state",
			"open",
			"--json",
			"number",
		]) ?? [];

	if (pullRequests.length === 0) {
		return null;
	}

	return runJsonCommand("gh", [
		"pr",
		"view",
		String(pullRequests[0].number),
		"--repo",
		repoFullName,
		"--json",
		[
			"baseRefName",
			"headRefName",
			"headRefOid",
			"isDraft",
			"mergeStateStatus",
			"mergeable",
			"number",
			"reviewDecision",
			"state",
			"title",
			"url",
		].join(","),
	]);
}

function readCommitCheckRuns({ candidateSha, repoFullName }) {
	const payload = runJsonCommand("gh", [
		"api",
		`repos/${repoFullName}/commits/${candidateSha}/check-runs`,
	]);

	return Array.isArray(payload?.check_runs) ? payload.check_runs : [];
}

async function readLinkedProject() {
	const candidatePaths = [
		path.join(process.cwd(), ".vercel", "project.json"),
		path.join(process.cwd(), "apps", "web", ".vercel", "project.json"),
	];

	for (const projectFilePath of candidatePaths) {
		try {
			const projectFile = await readFile(projectFilePath, "utf8");
			return JSON.parse(projectFile);
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "ENOENT"
			) {
				continue;
			}

			throw error;
		}
	}

	return null;
}

async function fetchDeploymentAliases({ deploymentId, teamId, token }) {
	const response = await fetch(buildDeploymentAliasesUrl({ deploymentId, teamId }), {
		headers: {
			authorization: `Bearer ${token}`,
			"user-agent": "ship-by-sunday-release-triage",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Vercel deployment aliases request failed with ${response.status} ${response.statusText}.`,
		);
	}

	const body = await response.json();
	return (body.aliases ?? [])
		.map((alias) => alias?.alias?.trim())
		.filter(Boolean);
}

async function resolveDeploymentMetadata({
	candidateSha,
	expectedAlias,
	metadataFailures,
	projectId,
	target,
	teamId,
	token,
}) {
	if (!token) {
		metadataFailures.push(
			"Vercel deployment metadata unavailable: missing VERCEL_TOKEN or --vercel-token.",
		);
		return {
			expectedAlias,
			projectId,
			resolved: false,
			target,
			teamId,
		};
	}

	if (!projectId) {
		metadataFailures.push(
			"Vercel deployment metadata unavailable: missing VERCEL_PROJECT_ID or --vercel-project-id.",
		);
		return {
			expectedAlias,
			projectId: null,
			resolved: false,
			target,
			teamId,
		};
	}

	const response = await fetch(buildDeploymentListUrl({ projectId, target, teamId }), {
		headers: {
			authorization: `Bearer ${token}`,
			"user-agent": "ship-by-sunday-release-triage",
		},
	});

	if (!response.ok) {
		metadataFailures.push(
			`Vercel deployments request failed with ${response.status} ${response.statusText}.`,
		);
		return {
			expectedAlias,
			projectId,
			resolved: false,
			target,
			teamId,
		};
	}

	const body = await response.json();
	const deployments = Array.isArray(body?.deployments) ? body.deployments : [];
	const matchingDeployments = findMatchingDeployments({
		commitSha: candidateSha,
		deployments,
		target,
	});

	if (matchingDeployments.length === 0) {
		metadataFailures.push(
			`No READY ${target} Vercel deployment was found for commit ${candidateSha}.`,
		);
		return {
			expectedAlias,
			projectId,
			resolved: false,
			target,
			teamId,
		};
	}

	for (const deployment of matchingDeployments) {
		const inlineAliases = extractInlineDeploymentAliases(deployment);
		const aliases =
			inlineAliases.length > 0
				? inlineAliases
				: await fetchDeploymentAliases({
						deploymentId: deployment.uid ?? deployment.id,
						teamId,
						token,
					});
		const aliasBound = expectedAlias ? aliases.includes(expectedAlias) : true;

		if (!aliasBound) {
			continue;
		}

		return {
			aliases,
			aliasBound,
			expectedAlias,
			projectId,
			resolved: true,
			target,
			teamId,
			url:
				typeof deployment.url === "string" && deployment.url.length > 0
					? `https://${deployment.url}`
					: null,
			uid: deployment.uid ?? deployment.id ?? null,
		};
	}

	metadataFailures.push(
		`No READY ${target} Vercel deployment for commit ${candidateSha} is currently bound to ${expectedAlias}.`,
	);
	return {
		expectedAlias,
		projectId,
		resolved: false,
		target,
		teamId,
	};
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const baseRef = options.base_ref?.trim() || "origin/main";
	const headRef = options.head_ref?.trim() || "origin/dev";
	const baseBranchName = options.base_branch?.trim() || "main";
	const headBranchName = options.head_branch?.trim() || "dev";
	const expectedAlias =
		options.alias_domain?.trim() || "dev.man-meets-ai.com";
	const vercelEnvironment =
		options.vercel_environment?.trim() || "preview";
	const proofEnvironment = {
		aliasDomain: expectedAlias,
		billingGitHubEnvironmentName:
			options.billing_github_environment?.trim() ||
			"dev-staging-billing-integration",
		githubEnvironmentName:
			options.github_environment?.trim() || "dev-staging",
		qaEnvFile: options.qa_env_file?.trim() || "apps/web/.env.local",
		vercelEnvironment,
	};
	const metadataFailures = [];
	const candidate = readGitCandidate({ baseRef, headRef });
	const releaseScope = {
		...classifyReleaseScope(candidate.changedFiles),
		baseRef: candidate.mergeBaseSha,
		billingSensitiveFilesCount: 0,
		changedFilesCount: candidate.changedFilesCount,
		headRef,
		changedFilesSample: candidate.changedFilesSample,
	};
	releaseScope.changedFiles = releaseScope.changedFiles.slice(0, 20);
	releaseScope.billingSensitiveFilesCount =
		releaseScope.billingSensitiveFiles.length;
	releaseScope.convexSensitiveFilesCount = releaseScope.convexSensitiveFiles.length;
	releaseScope.billingSensitiveFiles = releaseScope.billingSensitiveFiles.slice(0, 20);
	releaseScope.convexSensitiveFiles = releaseScope.convexSensitiveFiles.slice(0, 20);
	const summarizedCandidate = {
		...candidate,
		changedFiles: undefined,
	};
	const repoFullName = resolveGitHubRepo();

	let releasePullRequest = null;
	let checkRuns = [];

	try {
		releasePullRequest = readReleasePullRequest({
			baseBranchName,
			headBranchName,
			repoFullName,
		});
		checkRuns = readCommitCheckRuns({
			candidateSha: candidate.sha,
			repoFullName,
		});
	} catch (error) {
		metadataFailures.push(
			`GitHub release metadata unavailable: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	let linkedProject = null;
	let deployment;

	try {
		linkedProject = await readLinkedProject();
		deployment = await resolveDeploymentMetadata({
			candidateSha: candidate.sha,
			expectedAlias,
			metadataFailures,
			projectId:
				options.vercel_project_id?.trim() ||
				process.env.VERCEL_PROJECT_ID?.trim() ||
				linkedProject?.projectId?.trim() ||
				null,
			target: vercelEnvironment,
			teamId:
				options.vercel_team_id?.trim() ||
				process.env.VERCEL_TEAM_ID?.trim() ||
				process.env.VERCEL_ORG_ID?.trim() ||
				linkedProject?.orgId?.trim() ||
				null,
			token:
				options.vercel_token?.trim() || process.env.VERCEL_TOKEN?.trim() || null,
		});
	} catch (error) {
		metadataFailures.push(
			`Vercel deployment metadata unavailable: ${error instanceof Error ? error.message : String(error)}`,
		);
		deployment = {
			expectedAlias,
			projectId: null,
			resolved: false,
			target: vercelEnvironment,
			teamId: null,
		};
	}

	const summary = buildReleaseTriageSummary({
		baseBranchName,
		candidate: summarizedCandidate,
		checkRuns,
		deployment,
		headBranchName,
		metadataFailures,
		proofEnvironment,
		releasePullRequest,
		releaseScope,
	});

	if (options.output?.trim()) {
		await writeFile(options.output.trim(), `${JSON.stringify(summary, null, 2)}\n`);
	}

	process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

await main();
