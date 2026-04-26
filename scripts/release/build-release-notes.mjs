import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import process from "node:process";

import { assertReleaseEvidence } from "./lib/release-evidence.mjs";
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

		const [key, value = "true"] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function trimBlankEdges(lines) {
	const nextLines = [...lines];

	while (nextLines[0]?.trim() === "") {
		nextLines.shift();
	}

	while (nextLines.at(-1)?.trim() === "") {
		nextLines.pop();
	}

	return nextLines;
}

export function extractChangelogSection({ changelogSource, heading }) {
	if (typeof heading !== "string" || heading.trim().length === 0) {
		throw new Error("release notes heading must be a non-empty string.");
	}

	const lines = changelogSource.split(/\r?\n/);
	const startIndex = lines.findIndex((line) => line.trim() === heading.trim());

	if (startIndex === -1) {
		throw new Error(`CHANGELOG.md must contain release heading ${JSON.stringify(heading)}.`);
	}

	const endIndex = lines.findIndex((line, index) =>
		index > startIndex && line.trim().startsWith("## ")
	);
	const sectionLines = trimBlankEdges(lines.slice(startIndex + 1, endIndex === -1 ? undefined : endIndex));

	if (sectionLines.length === 0) {
		throw new Error(`CHANGELOG.md release heading ${JSON.stringify(heading)} must have release notes.`);
	}

	return `${sectionLines.join("\n")}\n`;
}

function formatEvidenceSummary(evidence, evidenceArtifactName) {
	return [
		"## Release Evidence",
		"",
		`- Target commit: \`${evidence.tagTargetSha}\``,
		`- Vercel production proof: \`${evidence.vercel.status}\``,
		`- Convex production proof: \`${evidence.convex.status}\``,
		`- Auth proof: \`${evidence.auth.status}\``,
		`- Entitlement proof: \`${evidence.entitlement.status}\``,
		`- Billing proof: \`${evidence.billing.status}\``,
		`- Evidence artifact: \`${evidenceArtifactName}\``,
	].join("\n");
}

export function buildReleaseNotes({
	changelogSection,
	evidence = null,
	evidenceArtifactName = "release-evidence.publish-check.json",
}) {
	const sections = [changelogSection.trim()];

	if (evidence) {
		sections.push(formatEvidenceSummary(evidence, evidenceArtifactName));
	}

	return `${sections.join("\n\n")}\n`;
}

async function readReleaseEvidence(evidencePath, readFileImpl) {
	if (!evidencePath) {
		return null;
	}

	const source = await readFileImpl(evidencePath, "utf8");
	const evidence = JSON.parse(source);
	assertReleaseEvidence(evidence);
	return evidence;
}

export async function runCli({
	args = process.argv.slice(2),
	readFileImpl = readFile,
	writeFileImpl = writeFile,
	writeStdout = (value) => process.stdout.write(value),
} = {}) {
	const options = parseArgs(args);
	const manifestPath = options.manifest?.trim() || "release.json";
	const changelogPath = options.changelog?.trim() || "CHANGELOG.md";
	const manifest = await readReleaseManifest({ manifestPath, readFileImpl });
	const changelogSource = await readFileImpl(changelogPath, "utf8");

	assertReleaseManifest(manifest, { changelogSource });

	const changelogSection = extractChangelogSection({
		changelogSource,
		heading: manifest.changelogHeading,
	});
	const evidencePath = options.evidence?.trim();
	const evidence = await readReleaseEvidence(evidencePath, readFileImpl);
	const releaseNotes = buildReleaseNotes({
		changelogSection,
		evidence,
		evidenceArtifactName: evidencePath ? basename(evidencePath) : undefined,
	});

	if (options.output) {
		await writeFileImpl(options.output, releaseNotes, "utf8");
	}

	writeStdout(releaseNotes);
	return releaseNotes;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	try {
		await runCli();
	} catch (error) {
		process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
		process.exitCode = 1;
	}
}
