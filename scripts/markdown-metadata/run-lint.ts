import process from "node:process";

import {
	formatMarkdownMetadataLintReports,
	lintMarkdownMetadata,
} from "./lint";

type CommandOptions = {
	format: "text" | "json";
	paths: string[];
};

function buildUsage(): string {
	return [
		"Usage: bun run markdown:lint -- [--paths <repo/path> [more paths...]] [--format text|json]",
		"",
		"Options:",
		"  --paths <...>     One or more repo-relative markdown paths or directories.",
		"  --format <value>  Output format. Allowed values: text, json. Default: text.",
		"  --help            Show this usage output.",
	].join("\n");
}

function parseArgs(argv: string[]): CommandOptions {
	const options: CommandOptions = {
		format: "text",
		paths: [],
	};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === "--help") {
			console.log(buildUsage());
			process.exit(0);
		}

		if (argument === "--paths") {
			while (argv[index + 1] && !argv[index + 1].startsWith("--")) {
				options.paths.push(argv[index + 1]);
				index += 1;
			}
			continue;
		}

		if (argument === "--format") {
			const value = argv[index + 1];
			if (!value || value.startsWith("--")) {
				throw new Error(`Missing value for --format\n\n${buildUsage()}`);
			}
			if (value !== "text" && value !== "json") {
				throw new Error(`Invalid --format value: ${value}\n\n${buildUsage()}`);
			}
			options.format = value;
			index += 1;
			continue;
		}

		throw new Error(`Unknown argument: ${argument}\n\n${buildUsage()}`);
	}

	return options;
}

async function main(): Promise<void> {
	const options = parseArgs(process.argv.slice(2));
	const reports = await lintMarkdownMetadata({
		repoRootDir: process.cwd(),
		requestedPaths: options.paths,
	});

	if (options.format === "json") {
		console.log(JSON.stringify(reports, null, 2));
	} else {
		console.log(formatMarkdownMetadataLintReports(reports));
	}

	if (reports.some((report) => report.issues.length > 0)) {
		process.exitCode = 1;
	}
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
	await main();
}
