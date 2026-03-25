import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import { parseCsv } from "./lib/csv.mjs";
import {
	getPersonaIdsForPack,
	loadPersonaProtocol,
	repoRoot,
} from "./lib/personas.mjs";

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.replace(/^--/, "").split("=");
		options[key] = value || "1";
	}

	return options;
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const pack = options.pack ?? "default_ship";
	const slug = options.slug ?? "local-run";
	const date = new Date().toISOString().slice(0, 10);

	const journeyCsv = await readFile(path.join(repoRoot, "qa/journeys.csv"), "utf8");
	const template = await readFile(
		path.join(repoRoot, "qa/templates/run-report.md"),
		"utf8",
	);
	const personaProtocol = await loadPersonaProtocol();
	const { records } = parseCsv(journeyCsv);
	const selectedJourneys = records.filter((record) => record.scenario_pack === pack);
	const scenarioIds = selectedJourneys.map((record) => record.scenario_id).join(", ");
	const personas = getPersonaIdsForPack(personaProtocol, pack).join(", ");
	const reportContents = template
		.replace("{{date}}", date)
		.replace("{{pack}}", pack)
		.replace("{{slug}}", slug)
		.replace("{{personas}}", personas)
		.replace("{{scenario_ids}}", scenarioIds);
	const reportDirectory = path.join(repoRoot, "qa/runs/local");
	const reportPath = path.join(reportDirectory, `${date}-${slug}-${pack}.md`);

	await mkdir(reportDirectory, { recursive: true });
	await writeFile(reportPath, reportContents, "utf8");

	console.log(
		JSON.stringify(
			{
				status: "ok",
				pack,
				personas: getPersonaIdsForPack(personaProtocol, pack),
				scenarioIds: selectedJourneys.map((record) => record.scenario_id),
				reportPath: path.relative(repoRoot, reportPath),
			},
			null,
			2,
		),
	);
}

await main();
