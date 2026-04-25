import process from "node:process";
import {
	collectReleaseTriageSummary,
	parseReleaseTriageArgs,
	writeReleaseTriageSummary,
} from "./lib/release-triage-source.mjs";

async function main() {
	const options = parseReleaseTriageArgs(process.argv.slice(2));
	const summary = await collectReleaseTriageSummary({
		options,
		env: process.env,
	});
	await writeReleaseTriageSummary({ options, summary });
	process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

await main();
