const minimumReleaseAgeSeconds = 7 * 24 * 60 * 60;
const lockfilePath = "bun.lock";

export type LockedPackageVersion = {
	name: string;
	version: string;
};

type PackageRegistryMetadata = {
	time?: Record<string, string>;
};

function parseLockedPackageSpec(spec: string): LockedPackageVersion | null {
	const versionSeparatorIndex = spec.lastIndexOf("@");
	if (versionSeparatorIndex <= 0) {
		return null;
	}

	const name = spec.slice(0, versionSeparatorIndex);
	const version = spec.slice(versionSeparatorIndex + 1);
	if (!name || !version || version.startsWith("workspace:")) {
		return null;
	}

	return { name, version };
}

export function extractAddedLockedPackageVersions(diffText: string) {
	const packageVersions = new Map<string, LockedPackageVersion>();

	for (const line of diffText.split("\n")) {
		if (!line.startsWith("+") || line.startsWith("+++")) {
			continue;
		}

		const lockEntryMatch = line.match(/^\+\s*"[^"]+":\s+\["([^"]+)"/);
		if (!lockEntryMatch) {
			continue;
		}

		const packageVersion = parseLockedPackageSpec(lockEntryMatch[1]);
		if (!packageVersion) {
			continue;
		}

		packageVersions.set(
			`${packageVersion.name}@${packageVersion.version}`,
			packageVersion,
		);
	}

	return [...packageVersions.values()].sort((left, right) =>
		`${left.name}@${left.version}`.localeCompare(
			`${right.name}@${right.version}`,
		),
	);
}

async function runGit(args: string[]) {
	const process = Bun.spawn(["git", ...args], {
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process.stdout).text(),
		new Response(process.stderr).text(),
		process.exited,
	]);

	return { stdout, stderr, exitCode };
}

function getBaseRef() {
	const explicitBaseRef = Bun.argv
		.find((argument) => argument.startsWith("--base="))
		?.slice("--base=".length);
	if (explicitBaseRef) {
		return explicitBaseRef;
	}

	if (Bun.env.LOCKFILE_RELEASE_AGE_BASE) {
		return Bun.env.LOCKFILE_RELEASE_AGE_BASE;
	}

	if (Bun.env.GITHUB_BASE_REF) {
		return `origin/${Bun.env.GITHUB_BASE_REF}`;
	}

	return "HEAD~1";
}

async function getLockfileDiff(baseRef: string) {
	const tripleDotDiff = await runGit([
		"diff",
		"--unified=0",
		"--no-ext-diff",
		`${baseRef}...HEAD`,
		"--",
		lockfilePath,
	]);
	if (tripleDotDiff.exitCode === 0) {
		return tripleDotDiff.stdout;
	}

	const doubleDotDiff = await runGit([
		"diff",
		"--unified=0",
		"--no-ext-diff",
		`${baseRef}..HEAD`,
		"--",
		lockfilePath,
	]);
	if (doubleDotDiff.exitCode === 0) {
		return doubleDotDiff.stdout;
	}

	throw new Error(
		`Unable to diff ${lockfilePath} against ${baseRef}.\n${tripleDotDiff.stderr}\n${doubleDotDiff.stderr}`.trim(),
	);
}

async function getPublishedAt(packageVersion: LockedPackageVersion) {
	const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(
		packageVersion.name,
	)}`;
	const response = await fetch(registryUrl, {
		headers: { Accept: "application/json" },
	});
	if (!response.ok) {
		throw new Error(
			`npm registry returned ${response.status} for ${packageVersion.name}.`,
		);
	}

	const metadata = (await response.json()) as PackageRegistryMetadata;
	const publishedAt = metadata.time?.[packageVersion.version];
	if (!publishedAt) {
		throw new Error(
			`npm registry metadata for ${packageVersion.name} does not include ${packageVersion.version}.`,
		);
	}

	return new Date(publishedAt);
}

async function main() {
	const baseRef = getBaseRef();
	const diffText = await getLockfileDiff(baseRef);
	const packageVersions = extractAddedLockedPackageVersions(diffText);
	if (packageVersions.length === 0) {
		console.log(
			`lockfile release age: no new ${lockfilePath} package versions against ${baseRef}`,
		);
		return;
	}

	const cutoffMs = Date.now() - minimumReleaseAgeSeconds * 1000;
	const tooNewPackages: string[] = [];

	for (const packageVersion of packageVersions) {
		const publishedAt = await getPublishedAt(packageVersion);
		if (publishedAt.getTime() > cutoffMs) {
			tooNewPackages.push(
				`${packageVersion.name}@${packageVersion.version} published ${publishedAt.toISOString()}`,
			);
		}
	}

	if (tooNewPackages.length > 0) {
		throw new Error(
			[
				`New ${lockfilePath} package versions must be at least ${minimumReleaseAgeSeconds} seconds old.`,
				...tooNewPackages.map((packageName) => `- ${packageName}`),
			].join("\n"),
		);
	}

	console.log(
		`lockfile release age: verified ${packageVersions.length} new package version(s) against ${baseRef}`,
	);
}

if (import.meta.main) {
	main().catch((error) => {
		console.error(error instanceof Error ? error.message : error);
		process.exit(1);
	});
}
