import { readFile } from "node:fs/promises";

export const releaseManifestSchemaVersion = "release-manifest.v1";
export const releaseEvidenceSchemaVersion = "release-evidence.v1";

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertObject(value, label) {
	assert(
		value !== null && typeof value === "object" && Array.isArray(value) === false,
		`${label} must be an object.`,
	);
}

function assertString(value, label) {
	assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string.`);
}

export function parseReleaseTag(tag) {
	assertString(tag, "release tag");

	const match = tag.match(/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/);
	assert(match, "release tag must use vMAJOR.MINOR.PATCH or a semver prerelease suffix.");

	const [, major, minor, patch, prerelease = null] = match;

	return {
		major: Number(major),
		minor: Number(minor),
		patch: Number(patch),
		prerelease,
		version: `${major}.${minor}.${patch}${prerelease ? `-${prerelease}` : ""}`,
	};
}

export function parseReleaseManifest(source) {
	let manifest;

	try {
		manifest = JSON.parse(source);
	} catch (error) {
		throw new Error(`release manifest must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
	}

	assertObject(manifest, "release manifest");
	return manifest;
}

export async function readReleaseManifest({
	manifestPath = "release.json",
	readFileImpl = readFile,
} = {}) {
	const source = await readFileImpl(manifestPath, "utf8");
	return parseReleaseManifest(source);
}

export function assertChangelogHeadingExists({ changelogSource, heading }) {
	assertString(heading, "release manifest changelogHeading");

	const headings = changelogSource
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.startsWith("## "));

	assert(
		headings.includes(heading.trim()),
		`CHANGELOG.md must contain release heading ${JSON.stringify(heading)}.`,
	);
}

export function assertReleaseManifest(manifest, {
	changelogSource = null,
	expectedTag = null,
	mainSha = null,
	tagTargetSha = null,
} = {}) {
	assertObject(manifest, "release manifest");
	assert(
		manifest.schemaVersion === releaseManifestSchemaVersion,
		`release manifest schemaVersion must be ${releaseManifestSchemaVersion}.`,
	);
	assertString(manifest.version, "release manifest version");
	assertString(manifest.channel, "release manifest channel");
	assertString(manifest.gitTag, "release manifest gitTag");
	assertString(manifest.changelogHeading, "release manifest changelogHeading");
	assert(
		manifest.releaseEvidenceSchemaVersion === releaseEvidenceSchemaVersion,
		`release manifest releaseEvidenceSchemaVersion must be ${releaseEvidenceSchemaVersion}.`,
	);

	if (manifest.notes !== undefined) {
		assert(typeof manifest.notes === "string", "release manifest notes must be a string when present.");
	}

	const parsedTag = parseReleaseTag(manifest.gitTag);
	assert(
		parsedTag.version === manifest.version,
		"release manifest gitTag must equal v${version}.",
	);

	if (parsedTag.prerelease) {
		assert(
			manifest.channel !== "stable",
			"release manifest channel must not be stable for a prerelease tag.",
		);
	} else {
		assert(
			manifest.channel === "stable",
			"release manifest channel must be stable for a non-prerelease tag.",
		);
	}

	if (expectedTag) {
		assert(
			manifest.gitTag === expectedTag,
			`release manifest gitTag ${manifest.gitTag} does not match supplied tag ${expectedTag}.`,
		);
	}

	if (changelogSource !== null) {
		assertChangelogHeadingExists({
			changelogSource,
			heading: manifest.changelogHeading,
		});
	}

	if (mainSha || tagTargetSha) {
		assertString(mainSha, "mainSha");
		assertString(tagTargetSha, "tagTargetSha");
		assert(
			mainSha === tagTargetSha,
			`release tag target ${tagTargetSha} must equal verified main SHA ${mainSha}.`,
		);
	}

	return {
		channel: manifest.channel,
		gitTag: manifest.gitTag,
		releaseEvidenceSchemaVersion: manifest.releaseEvidenceSchemaVersion,
		schemaVersion: manifest.schemaVersion,
		version: manifest.version,
	};
}
