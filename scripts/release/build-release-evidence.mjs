import { writeFile } from "node:fs/promises";
import process from "node:process";

import { assertReleaseManifest, readReleaseManifest } from "./lib/release-manifest.mjs";
import {
	assertReleaseEvidence,
	buildReleaseEvidence,
	proofStateFromStatus,
} from "./lib/release-evidence.mjs";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = "true"] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function readShaOption(options, key, fallback) {
	return options[key]?.trim() || fallback?.trim() || "unavailable";
}

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	writeFileImpl = writeFile,
	writeStdout = (value) => process.stdout.write(value),
} = {}) {
	const options = parseArgs(args);
	const manifest = await readReleaseManifest({
		manifestPath: options.manifest?.trim() || "release.json",
	});
	assertReleaseManifest(manifest, {
		expectedTag: options.tag?.trim() || env.GITHUB_REF_NAME?.trim() || null,
	});

	const tagTargetSha = readShaOption(options, "tag-target-sha", env.TAG_TARGET_SHA || env.GITHUB_SHA);
	const mainSha = readShaOption(options, "main-sha", env.MAIN_SHA || tagTargetSha);
	const dryRun = options["dry-run"] === "true";
	const validatePublish = options["validate-publish"] === "true";

	const evidence = buildReleaseEvidence({
		manifest,
		tagTargetSha,
		mainSha,
		workflowRuns: [
			{
				name: "tag-release",
				runId: env.GITHUB_RUN_ID ?? null,
				url: env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
					? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
					: null,
			},
		],
		vercel: proofStateFromStatus(
			options["vercel-status"] || (dryRun ? "unavailable" : undefined),
			options["vercel-notes"] || "Vercel production proof was not supplied.",
		),
		convex: proofStateFromStatus(
			options["convex-status"] || (dryRun ? "unavailable" : undefined),
			options["convex-notes"] || "Convex production proof was not supplied.",
		),
		billing: proofStateFromStatus(
			options["billing-status"] || (dryRun ? "unavailable" : undefined),
			options["billing-notes"] || "Billing proof was not supplied.",
		),
		auth: proofStateFromStatus(
			options["auth-status"] || (dryRun ? "unavailable" : undefined),
			options["auth-notes"] || "Auth proof was not supplied.",
		),
		entitlement: proofStateFromStatus(
			options["entitlement-status"] || (dryRun ? "unavailable" : undefined),
			options["entitlement-notes"] || "Entitlement proof was not supplied.",
		),
	});

	assertReleaseEvidence(evidence, { publish: false });

	if (options.output) {
		await writeFileImpl(options.output, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
	}

	if (validatePublish) {
		assertReleaseEvidence(evidence, { publish: true });
	}

	writeStdout(`${JSON.stringify(evidence, null, 2)}\n`);
	return evidence;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await runCli();
	} catch (error) {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	}
}
