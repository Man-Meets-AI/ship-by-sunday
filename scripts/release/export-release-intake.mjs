import process from "node:process";

import { buildReleaseIntakeExport } from "./lib/release-intake-export.mjs";
import {
	collectReleaseTriageSummary,
	parseReleaseTriageArgs,
	writeReleaseTriageSummary,
} from "./lib/release-triage-source.mjs";

export async function runCli({
	args = process.argv.slice(2),
	env = process.env,
	collectReleaseTriageSummaryImpl = collectReleaseTriageSummary,
	writeReleaseSummaryImpl = writeReleaseTriageSummary,
} = {}) {
	const options = parseReleaseTriageArgs(args);
	const summary = await collectReleaseTriageSummaryImpl({ options, env });
	const document = buildReleaseIntakeExport({
		generatedAt: options["generated-at"]?.trim() || new Date().toISOString(),
		summary,
	});
	await writeReleaseSummaryImpl({ options, summary: document });

	return {
		document,
		summary,
	};
}

const isEntrypoint =
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isEntrypoint) {
	try {
		const { document } = await runCli();
		process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : "Release intake export failed.");
		process.exitCode = 1;
	}
}
