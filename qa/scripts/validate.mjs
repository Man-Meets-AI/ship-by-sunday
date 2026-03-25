import path from "node:path";
import { access, readFile, readdir } from "node:fs/promises";

import { parseCsv } from "./lib/csv.mjs";
import {
	loadPersonaProtocol,
	personaLocalExamplePath,
	personaProtocolPath,
	repoRoot,
} from "./lib/personas.mjs";

const journeyHeaders = [
	"scenario_id",
	"journey_bucket",
	"start_persona",
	"end_persona",
	"lifecycle_stage",
	"journey_name",
	"preconditions",
	"entry_point",
	"plain_english_steps",
	"expected_outcome",
	"priority",
	"scenario_pack",
	"automation_status",
	"manual_status",
	"linked_tests",
	"notes",
];

const coverageHeaders = [
	"scenario_id",
	"proving_layer",
	"proving_source",
	"coverage_status",
	"confidence_state",
	"notes",
];

const inventoryHeaders = [
	"file_path",
	"test_layer",
	"scenario_ids",
	"current_value",
	"disposition",
	"replacement_path",
	"disposition_rationale",
];

const allowedPacks = new Set(["default_ship", "extended", "billing_integration"]);
const allowedCoverageStatuses = new Set([
	"mapped_existing",
	"rewrite_required",
	"gap",
]);
const allowedDispositions = new Set([
	"keep",
	"rewrite",
	"replace",
	"merge",
	"delete",
]);

async function readCsv(relativePath) {
	const resolvedPath = path.join(repoRoot, relativePath);
	const raw = await readFile(resolvedPath, "utf8");
	return parseCsv(raw);
}

function assertHeaders(actualHeaders, expectedHeaders, filePath) {
	const actual = actualHeaders.join(",");
	const expected = expectedHeaders.join(",");
	if (actual !== expected) {
		throw new Error(
			`${filePath} has unexpected headers.\nExpected: ${expected}\nActual: ${actual}`,
		);
	}
}

async function assertFileExists(relativePath, label) {
	const resolvedPath = path.join(repoRoot, relativePath);
	try {
		await access(resolvedPath);
	} catch {
		throw new Error(`${label} is missing: ${relativePath}`);
	}
}

function splitScenarioIds(value) {
	return value
		.split("|")
		.map((part) => part.trim())
		.filter(Boolean);
}

async function main() {
	await assertFileExists("qa/README.md", "QA readme");
	await assertFileExists("qa/AGENTS.md", "QA agent guide");
	await assertFileExists("qa/glossary.md", "QA glossary");
	await assertFileExists("qa/personas.example.json", "QA persona example");
	await assertFileExists("qa/templates/run-report.md", "QA run report template");
	await assertFileExists("qa/runs/README.md", "QA runs readme");
	await assertFileExists("qa/test-inventory.csv", "QA test inventory");

	const personaProtocol = await loadPersonaProtocol();
	await assertFileExists(path.relative(repoRoot, personaProtocolPath), "QA persona protocol");
	await assertFileExists(
		path.relative(repoRoot, personaLocalExamplePath),
		"QA local persona example",
	);

	const personaIds = new Set(Object.keys(personaProtocol.personas ?? {}));
	const journeys = await readCsv("qa/journeys.csv");
	const coverage = await readCsv("qa/coverage.csv");
	const inventory = await readCsv("qa/test-inventory.csv");

	assertHeaders(journeys.headers, journeyHeaders, "qa/journeys.csv");
	assertHeaders(coverage.headers, coverageHeaders, "qa/coverage.csv");
	assertHeaders(inventory.headers, inventoryHeaders, "qa/test-inventory.csv");

	const scenarioIds = new Set();
	for (const record of journeys.records) {
		if (!record.scenario_id) {
			throw new Error("qa/journeys.csv contains a row without scenario_id.");
		}
		if (scenarioIds.has(record.scenario_id)) {
			throw new Error(`Duplicate scenario_id in qa/journeys.csv: ${record.scenario_id}`);
		}
		scenarioIds.add(record.scenario_id);

		if (!allowedPacks.has(record.scenario_pack)) {
			throw new Error(
				`Unknown scenario_pack in qa/journeys.csv for ${record.scenario_id}: ${record.scenario_pack}`,
			);
		}

		if (!personaIds.has(record.start_persona)) {
			throw new Error(
				`Unknown start_persona in qa/journeys.csv for ${record.scenario_id}: ${record.start_persona}`,
			);
		}

		if (!personaIds.has(record.end_persona)) {
			throw new Error(
				`Unknown end_persona in qa/journeys.csv for ${record.scenario_id}: ${record.end_persona}`,
			);
		}

		for (const linkedTest of splitScenarioIds(record.linked_tests)) {
			if (linkedTest.startsWith("apps/") || linkedTest.startsWith("qa/")) {
				await assertFileExists(linkedTest, `Linked test for ${record.scenario_id}`);
			}
		}
	}

	for (const record of coverage.records) {
		if (!scenarioIds.has(record.scenario_id)) {
			throw new Error(
				`qa/coverage.csv references unknown scenario_id: ${record.scenario_id}`,
			);
		}

		if (!allowedCoverageStatuses.has(record.coverage_status)) {
			throw new Error(
				`qa/coverage.csv has unknown coverage_status for ${record.scenario_id}: ${record.coverage_status}`,
			);
		}

		if (
			record.coverage_status !== "gap" &&
			(record.proving_source.startsWith("apps/") ||
				record.proving_source.startsWith("qa/"))
		) {
			await assertFileExists(
				record.proving_source,
				`Coverage proving source for ${record.scenario_id}`,
			);
		}
	}

	const inventoryPaths = new Set();
	for (const record of inventory.records) {
		inventoryPaths.add(record.file_path);
		await assertFileExists(record.file_path, "Inventory file");

		if (!allowedDispositions.has(record.disposition)) {
			throw new Error(
				`qa/test-inventory.csv has unknown disposition for ${record.file_path}: ${record.disposition}`,
			);
		}

		const mappedScenarioIds = splitScenarioIds(record.scenario_ids);
		for (const scenarioId of mappedScenarioIds) {
			if (!scenarioIds.has(scenarioId)) {
				throw new Error(
					`qa/test-inventory.csv maps ${record.file_path} to unknown scenario_id ${scenarioId}`,
				);
			}
		}

		if (
			record.disposition === "keep" &&
			record.test_layer !== "support" &&
			mappedScenarioIds.length === 0
		) {
			throw new Error(
				`Kept inventory row is missing scenario_ids: ${record.file_path}`,
			);
		}
	}

	const currentTestPaths = await collectCurrentTestPaths();
	for (const currentTestPath of currentTestPaths) {
		if (!inventoryPaths.has(currentTestPath)) {
			throw new Error(
				`qa/test-inventory.csv is missing an inventory row for ${currentTestPath}`,
			);
		}
	}

	console.log(
		[
			"QA control plane is internally consistent.",
			`Journeys: ${journeys.records.length}`,
			`Coverage rows: ${coverage.records.length}`,
			`Inventory rows: ${inventory.records.length}`,
			`Personas: ${personaIds.size}`,
		].join("\n"),
	);
}

async function collectCurrentTestPaths() {
	const testsDirectory = path.join(repoRoot, "apps/web/tests");
	const filePaths = await listFiles(testsDirectory);
	return filePaths
		.filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
		.map((filePath) => path.relative(repoRoot, filePath).replaceAll(path.sep, "/"));
}

async function listFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const resolvedPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				return listFiles(resolvedPath);
			}

			return [resolvedPath];
		}),
	);

	return nested.flat();
}

await main();
