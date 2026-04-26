import { readFile } from "node:fs/promises";
import process from "node:process";

import {
	assertReleaseManifest,
	readReleaseManifest,
} from "./lib/release-manifest.mjs";

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

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	readFileImpl = readFile,
	writeStdout = (value) => process.stdout.write(value),
} = {}) {
	const options = parseArgs(args);
	const manifestPath = options.manifest?.trim() || "release.json";
	const changelogPath = options.changelog?.trim() || "CHANGELOG.md";
	const manifest = await readReleaseManifest({ manifestPath, readFileImpl });
	const changelogSource = await readFileImpl(changelogPath, "utf8");

	const summary = assertReleaseManifest(manifest, {
		changelogSource,
		expectedTag: options.tag?.trim() || env.GITHUB_REF_NAME?.trim() || null,
		mainSha: options["main-sha"]?.trim() || null,
		tagTargetSha: options["tag-target-sha"]?.trim() || null,
	});

	const document = {
		ok: true,
		manifestPath,
		changelogPath,
		...summary,
	};

	writeStdout(`${JSON.stringify(document, null, 2)}\n`);
	return document;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await runCli();
	} catch (error) {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	}
}
