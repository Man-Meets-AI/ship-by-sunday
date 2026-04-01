import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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

function sleep(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function readLinkedProject() {
	const projectFilePath = path.join(process.cwd(), ".vercel", "project.json");

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
			return null;
		}

		throw error;
	}
}

function buildApiUrl({ projectId, teamId, target }) {
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

async function fetchDeployments({ projectId, teamId, token, target }) {
	const response = await fetch(buildApiUrl({ projectId, teamId, target }), {
		headers: {
			authorization: `Bearer ${token}`,
			"user-agent": "ship-by-sunday-release-proof",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Vercel deployments request failed with ${response.status} ${response.statusText}.`,
		);
	}

	const body = await response.json();
	return body.deployments ?? [];
}

async function fetchDeploymentAliases({ deploymentId, teamId, token }) {
	const apiUrl = new URL(
		`https://api.vercel.com/v2/deployments/${deploymentId}/aliases`,
	);
	if (teamId) {
		apiUrl.searchParams.set("teamId", teamId);
	}

	const response = await fetch(apiUrl, {
		headers: {
			authorization: `Bearer ${token}`,
			"user-agent": "ship-by-sunday-release-proof",
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

function deploymentMatchesTarget({ deployment, target }) {
	if (target === "preview") {
		return deployment.target == null;
	}

	return deployment.target === target;
}

async function deploymentHasExpectedAlias({
	deployment,
	expectedAlias,
	teamId,
	token,
}) {
	if (!expectedAlias) {
		return true;
	}

	const deploymentAliases = Array.isArray(deployment.alias)
		? deployment.alias.filter((alias) => typeof alias === "string")
		: await fetchDeploymentAliases({
				deploymentId: deployment.uid ?? deployment.id,
				teamId,
				token,
			});

	return deploymentAliases.includes(expectedAlias);
}

function findMatchingDeployments({ commitSha, deployments, target }) {
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

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const commitSha = options.commit_sha?.trim();
	const token = options.token?.trim() || process.env.VERCEL_TOKEN?.trim();
	const target = options.target?.trim() || "production";
	const expectedAlias =
		options.alias_domain?.trim() || process.env.VERCEL_EXPECTED_ALIAS?.trim();

	if (!commitSha) {
		throw new Error(
			"wait-for-vercel-production-deployment requires --commit_sha=<sha>.",
		);
	}

	if (!token) {
		throw new Error(
			"wait-for-vercel-production-deployment requires --token=<token> or VERCEL_TOKEN.",
		);
	}

	const linkedProject = await readLinkedProject();
	const projectId =
		options.project_id?.trim() ||
		process.env.VERCEL_PROJECT_ID?.trim() ||
		linkedProject?.projectId?.trim();
	const teamId =
		options.team_id?.trim() ||
		process.env.VERCEL_TEAM_ID?.trim() ||
		linkedProject?.orgId?.trim();
	if (!projectId) {
		throw new Error(
			"Unable to resolve the Vercel project ID. Pass --project_id=<id>, set VERCEL_PROJECT_ID, or ensure .vercel/project.json exists.",
		);
	}

	const timeoutMilliseconds = Number.parseInt(options.timeout_ms || "600000", 10);
	const intervalMilliseconds = Number.parseInt(options.interval_ms || "10000", 10);
	const deadline = Date.now() + timeoutMilliseconds;
	let lastObservation =
		"No matching deployment has been observed for the requested commit yet.";

	while (Date.now() < deadline) {
		const deployments = await fetchDeployments({
			projectId,
			teamId,
			token,
			target,
		});
		const matchingDeployments = findMatchingDeployments({
			commitSha,
			deployments,
			target,
		});
		if (matchingDeployments.length > 0) {
			for (const deployment of matchingDeployments) {
				const aliasMatches = await deploymentHasExpectedAlias({
					deployment,
					expectedAlias,
					teamId,
					token,
				});
				if (!aliasMatches) {
					continue;
				}

				process.stdout.write(
					`${JSON.stringify(
						{
							ready: true,
							projectId,
							teamId: teamId ?? null,
							projectName: linkedProject?.projectName ?? null,
							commitSha,
							target,
							expectedAlias: expectedAlias ?? null,
							deployment: {
								uid: deployment.uid ?? deployment.id ?? null,
								url: deployment.url ?? null,
								readySubstate: deployment.readySubstate ?? null,
								aliasAssigned: deployment.aliasAssigned ?? null,
								aliasCheckState:
									deployment.checks?.["deployment-alias"]?.state ?? null,
								aliases: Array.isArray(deployment.alias)
									? deployment.alias
									: null,
							},
						},
						null,
						2,
					)}\n`,
				);
				process.exit(0);
			}

			lastObservation = JSON.stringify(
				{
					projectId,
					teamId: teamId ?? null,
					commitSha,
					target,
					expectedAlias: expectedAlias ?? null,
					matchingCandidates: matchingDeployments.map((deployment) => ({
						uid: deployment.uid ?? deployment.id ?? null,
						target: deployment.target ?? null,
						state: deployment.state ?? deployment.readyState ?? null,
						aliasAssigned: deployment.aliasAssigned ?? null,
						aliases: Array.isArray(deployment.alias)
							? deployment.alias
							: null,
						url: deployment.url ?? null,
					})),
				},
				null,
				2,
			);
			await sleep(intervalMilliseconds);
			continue;
		}

		const matchingCandidates = deployments
			.filter((deployment) => deployment.meta?.githubCommitSha === commitSha)
			.map((deployment) => ({
				uid: deployment.uid ?? deployment.id ?? null,
				state: deployment.state ?? deployment.readyState ?? null,
				target: deployment.target ?? null,
				readySubstate: deployment.readySubstate ?? null,
				aliasAssigned: deployment.aliasAssigned ?? null,
				aliasCheckState:
					deployment.checks?.["deployment-alias"]?.state ?? null,
				url: deployment.url ?? null,
			}));

		lastObservation = JSON.stringify(
			{
				projectId,
				teamId: teamId ?? null,
				commitSha,
				target,
				expectedAlias: expectedAlias ?? null,
				matchingCandidates,
			},
			null,
			2,
		);
		await sleep(intervalMilliseconds);
	}

	throw new Error(
		`Timed out waiting for the ${target} Vercel deployment of commit ${commitSha} after ${timeoutMilliseconds}ms. Last observation: ${lastObservation}`,
	);
}

await main();
