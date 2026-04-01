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
	const projectFile = await readFile(projectFilePath, "utf8");
	return JSON.parse(projectFile);
}

function buildApiUrl({ projectId, teamId }) {
	const apiUrl = new URL("https://api.vercel.com/v6/deployments");
	apiUrl.searchParams.set("projectId", projectId);
	apiUrl.searchParams.set("target", "production");
	apiUrl.searchParams.set("state", "BUILDING,READY");
	apiUrl.searchParams.set("limit", "20");
	if (teamId) {
		apiUrl.searchParams.set("teamId", teamId);
	}
	return apiUrl;
}

async function fetchDeployments({ projectId, teamId, token }) {
	const response = await fetch(buildApiUrl({ projectId, teamId }), {
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

function findMatchingDeployment({ commitSha, deployments }) {
	return deployments.find((deployment) => {
		const commitMatches = deployment.meta?.githubCommitSha === commitSha;
		if (!commitMatches) {
			return false;
		}

		const ready =
			deployment.state === "READY" || deployment.readyState === "READY";
		if (!ready || deployment.target !== "production") {
			return false;
		}

		const aliasCheckState = deployment.checks?.["deployment-alias"]?.state;
		if (aliasCheckState === "succeeded") {
			return true;
		}

		return Boolean(deployment.aliasAssigned);
	});
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const commitSha = options.commit_sha?.trim();
	const token = options.token?.trim() || process.env.VERCEL_TOKEN?.trim();

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
	const projectId = options.project_id?.trim() || linkedProject.projectId?.trim();
	const teamId = options.team_id?.trim() || linkedProject.orgId?.trim();
	if (!projectId) {
		throw new Error(
			"Unable to resolve the Vercel project ID. Pass --project_id=<id> or ensure .vercel/project.json exists.",
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
		});
		const deployment = findMatchingDeployment({
			commitSha,
			deployments,
		});
		if (deployment) {
			process.stdout.write(
				`${JSON.stringify(
					{
						ready: true,
						projectId,
						teamId: teamId ?? null,
						projectName: linkedProject.projectName ?? null,
						commitSha,
						deployment: {
							uid: deployment.uid ?? null,
							url: deployment.url ?? null,
							readySubstate: deployment.readySubstate ?? null,
							aliasAssigned: deployment.aliasAssigned ?? null,
							aliasCheckState:
								deployment.checks?.["deployment-alias"]?.state ?? null,
						},
					},
					null,
					2,
				)}\n`,
			);
			process.exit(0);
		}

		const matchingCandidates = deployments
			.filter((deployment) => deployment.meta?.githubCommitSha === commitSha)
			.map((deployment) => ({
				uid: deployment.uid ?? null,
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
				matchingCandidates,
			},
			null,
			2,
		);
		await sleep(intervalMilliseconds);
	}

	throw new Error(
		`Timed out waiting for the production Vercel deployment of commit ${commitSha} after ${timeoutMilliseconds}ms. Last observation: ${lastObservation}`,
	);
}

await main();
