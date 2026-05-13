import { spawnSync } from "node:child_process";

const GENERATED_SOURCE_FILE_PATHS = ["apps/web/next-env.d.ts"] as const;

export type GeneratedSourceFileTrackingViolation = {
	relativePath: string;
};

export function collectGeneratedSourceFileTrackingViolations(
	rootDirectory: string,
	generatedSourceFilePaths: readonly string[] = GENERATED_SOURCE_FILE_PATHS,
): GeneratedSourceFileTrackingViolation[] {
	const result = spawnSync(
		"git",
		["-C", rootDirectory, "ls-files", "--", ...generatedSourceFilePaths],
		{ encoding: "utf8" },
	);

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		throw new Error(
			`Failed to inspect tracked generated files: ${result.stderr.trim()}`,
		);
	}

	const trackedFilePaths = new Set(
		result.stdout
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean),
	);

	return generatedSourceFilePaths
		.filter((relativePath) => trackedFilePaths.has(relativePath))
		.map((relativePath) => ({ relativePath }));
}

export function formatGeneratedSourceFileTrackingViolations(
	violations: readonly GeneratedSourceFileTrackingViolation[],
) {
	const lines = [
		"Generated files must not be tracked because local tooling rewrites them.",
		"Remove each path from the index and keep it ignored.",
		"",
	];

	for (const violation of violations) {
		lines.push(`${violation.relativePath} is generated but tracked by git.`);
	}

	return lines.join("\n");
}

if (import.meta.main) {
	const violations = collectGeneratedSourceFileTrackingViolations(
		process.cwd(),
	);

	if (violations.length > 0) {
		console.error(formatGeneratedSourceFileTrackingViolations(violations));
		process.exit(1);
	}

	console.log("generated-file-tracking-lint: passed");
}
