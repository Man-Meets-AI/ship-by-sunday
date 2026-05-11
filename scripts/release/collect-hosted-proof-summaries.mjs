import { execFileSync } from "node:child_process";
import { appendFile, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { buildConvexProductionDeployProofState } from "./lib/convex-production-deploy-summary.mjs";
import { buildProofStatesFromProductionReleaseProofSummary } from "./lib/production-release-proof-summary.mjs";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const separatorIndex = argument.indexOf("=");
		const key =
			separatorIndex === -1
				? argument.slice(2)
				: argument.slice(2, separatorIndex);
		const value =
			separatorIndex === -1 ? "" : argument.slice(separatorIndex + 1);
		options[key] = value;
	}

	return options;
}

function runGh(args) {
	return execFileSync("gh", args, {
		encoding: "utf8",
		env: process.env,
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function buildRunListArgs({ commitSha, event, repo, workflow }) {
	return [
		"run",
		"list",
		"--repo",
		repo,
		"--workflow",
		workflow,
		"--event",
		event,
		"--branch",
		"main",
		"--commit",
		commitSha,
		"--json",
		"databaseId,status,conclusion,url,headSha,createdAt,updatedAt",
		"--limit",
		"20",
	];
}

function compareRunsNewestFirst(left, right) {
	return Number(right.databaseId ?? 0) - Number(left.databaseId ?? 0);
}

export function findLatestCompletedRun({
	commitSha,
	events = ["push"],
	repo,
	requiredConclusion = "success",
	runGhImpl = runGh,
	workflow,
}) {
	const runs = events
		.flatMap((event) => {
			const raw = runGhImpl(
				buildRunListArgs({
					commitSha,
					event,
					repo,
					workflow,
				}),
			);
			return JSON.parse(raw).map((run) => ({ ...run, event }));
		})
		.filter((run) => run.headSha === commitSha)
		.sort(compareRunsNewestFirst);
	const run = runs[0];

	if (!run) {
		throw new Error(`No ${workflow} run found for commit ${commitSha}.`);
	}

	if (run.status !== "completed") {
		throw new Error(
			`${workflow} run ${run.databaseId} for commit ${commitSha} is ${run.status}, expected completed.`,
		);
	}

	if (
		typeof requiredConclusion === "string" &&
		run.conclusion !== requiredConclusion
	) {
		throw new Error(
			`${workflow} run ${run.databaseId} for commit ${commitSha} concluded ${run.conclusion ?? "<missing>"}, expected ${requiredConclusion}.`,
		);
	}

	return run;
}

async function downloadSummaryArtifact({
	artifactFileName,
	artifactName,
	repo,
	runId,
}) {
	const artifactDirectory = await mkdtemp(
		path.join(os.tmpdir(), "release-proof-summary-"),
	);

	try {
		runGh([
			"run",
			"download",
			String(runId),
			"--repo",
			repo,
			"--name",
			artifactName,
			"--dir",
			artifactDirectory,
		]);

		const summaryPath = path.join(artifactDirectory, artifactFileName);
		return JSON.parse(await readFile(summaryPath, "utf8"));
	} finally {
		await rm(artifactDirectory, { force: true, recursive: true });
	}
}

function flattenProofOutputs(prefix, proof) {
	return {
		[`${prefix}_notes`]: proof.notes ?? "",
		[`${prefix}_run_id`]: proof.runId ?? "",
		[`${prefix}_status`]: proof.status,
		[`${prefix}_url`]: proof.url ?? "",
	};
}

async function writeOutputs(outputs, outputPath) {
	if (!outputPath) {
		process.stdout.write(`${JSON.stringify(outputs, null, 2)}\n`);
		return;
	}

	const lines = Object.entries(outputs).map(([key, value]) => {
		const sanitizedValue = String(value).replace(/\r?\n/g, " ");
		return `${key}=${sanitizedValue}`;
	});
	await appendFile(outputPath, `${lines.join("\n")}\n`, "utf8");
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	writeOutputsImpl = writeOutputs,
} = {}) {
	const options = parseArgs(args);
	const commitSha = options.commit?.trim() || env.TAG_TARGET_SHA?.trim();
	const repo = options.repo?.trim() || env.GITHUB_REPOSITORY?.trim();

	if (!commitSha) {
		throw new Error(
			"collect-hosted-proof-summaries requires --commit=<sha> or TAG_TARGET_SHA.",
		);
	}

	if (!repo) {
		throw new Error(
			"collect-hosted-proof-summaries requires --repo=<owner/name> or GITHUB_REPOSITORY.",
		);
	}

	const productionRun = findLatestCompletedRun({
		commitSha,
		events: ["push", "workflow_dispatch"],
		repo,
		workflow: "production-release-proof.yml",
	});
	const productionSummary = await downloadSummaryArtifact({
		artifactFileName: "production-release-proof-summary.json",
		artifactName: "production-release-proof-summary",
		repo,
		runId: productionRun.databaseId,
	});
	const productionProof = buildProofStatesFromProductionReleaseProofSummary(
		productionSummary,
		commitSha,
	);
	if (!productionProof.ok) {
		throw new Error(productionProof.issues.join("\n"));
	}

	let convexProof;
	if (productionProof.proof.convexSensitive) {
		const convexRun = findLatestCompletedRun({
			commitSha,
			repo,
			workflow: "convex-production-deploy.yml",
		});
		const convexSummary = await downloadSummaryArtifact({
			artifactFileName: "convex-production-deploy-summary.json",
			artifactName: "convex-production-deploy-summary",
			repo,
			runId: convexRun.databaseId,
		});
		convexProof = buildConvexProductionDeployProofState(
			convexSummary,
			commitSha,
			{ required: true },
		);
		if (!convexProof.ok) {
			throw new Error(convexProof.issues.join("\n"));
		}
	} else {
		convexProof = buildConvexProductionDeployProofState(null, commitSha, {
			required: false,
		});
	}

	const outputs = {
		...flattenProofOutputs("auth", productionProof.proof.auth),
		...flattenProofOutputs("billing", productionProof.proof.billing),
		...flattenProofOutputs("convex", convexProof.proof),
		...flattenProofOutputs("entitlement", productionProof.proof.entitlement),
		...flattenProofOutputs("vercel", productionProof.proof.vercel),
	};
	await writeOutputsImpl(outputs, options.output?.trim() || env.GITHUB_OUTPUT);

	return outputs;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await runCli();
	} catch (error) {
		process.stderr.write(
			`${error instanceof Error ? error.message : String(error)}\n`,
		);
		process.exitCode = 1;
	}
}
