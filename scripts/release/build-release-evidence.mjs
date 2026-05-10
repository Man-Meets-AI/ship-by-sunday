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

		const separatorIndex = argument.indexOf("=");
		const key =
			separatorIndex === -1
				? argument.slice(2)
				: argument.slice(2, separatorIndex);
		const value =
			separatorIndex === -1 ? "true" : argument.slice(separatorIndex + 1);
		options[key] = value;
	}

	return options;
}

function readShaOption(options, key, fallback) {
	return options[key]?.trim() || fallback?.trim() || "unavailable";
}

function readNullableOption(options, key) {
	const value = options[key]?.trim();
	return value && value !== "null" ? value : null;
}

function proofStateFromOptions(options, key, { dryRun, fallbackNotes }) {
	const proof = proofStateFromStatus(
		options[`${key}-status`] || (dryRun ? "unavailable" : undefined),
		options[`${key}-notes`] || fallbackNotes,
	);

	return {
		...proof,
		runId: readNullableOption(options, `${key}-run-id`) ?? proof.runId,
		url: readNullableOption(options, `${key}-url`) ?? proof.url,
	};
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
		vercel: proofStateFromOptions(options, "vercel", {
			dryRun,
			fallbackNotes: "Vercel production proof was not supplied.",
		}),
		convex: proofStateFromOptions(options, "convex", {
			dryRun,
			fallbackNotes: "Convex production proof was not supplied.",
		}),
		billing: proofStateFromOptions(options, "billing", {
			dryRun,
			fallbackNotes: "Billing proof was not supplied.",
		}),
		auth: proofStateFromOptions(options, "auth", {
			dryRun,
			fallbackNotes: "Auth proof was not supplied.",
		}),
		entitlement: proofStateFromOptions(options, "entitlement", {
			dryRun,
			fallbackNotes: "Entitlement proof was not supplied.",
		}),
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
