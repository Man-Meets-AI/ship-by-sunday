import path from "node:path";
import { readdir, writeFile } from "node:fs/promises";

import { stringifyCsv } from "./lib/csv.mjs";
import { repoRoot } from "./lib/personas.mjs";

const testsDirectory = path.join(repoRoot, "apps/web/tests");
const outputPath = path.join(repoRoot, "qa/test-inventory.csv");

const headers = [
	"file_path",
	"test_layer",
	"scenario_ids",
	"current_value",
	"disposition",
	"replacement_path",
	"disposition_rationale",
];

async function listFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const filePaths = await Promise.all(
		entries.map(async (entry) => {
			const resolvedPath = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				return listFiles(resolvedPath);
			}

			return [resolvedPath];
		}),
	);

	return filePaths.flat();
}

function toRepoPath(filePath) {
	return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function buildRecord(filePath) {
	const repoPath = toRepoPath(filePath);
	const [, layer = "support"] = repoPath.split("/tests/");
	const testLayer = layer.split("/")[0] ?? "support";

	if (
		repoPath.endsWith("tests/script-modules.d.ts") ||
		repoPath.endsWith("tests/vitest.d.ts") ||
		repoPath.includes("/tests/setup/") ||
		repoPath.endsWith("/tests/e2e/auth-state.ts") ||
		repoPath.endsWith("/tests/e2e/global-setup.ts")
	) {
		return {
			file_path: repoPath,
			test_layer: "support",
			scenario_ids: "",
			current_value: "Test harness support for Vitest or Playwright.",
			disposition: "keep",
			replacement_path: "",
			disposition_rationale:
				"Harness files are not direct journey assertions but still need inventory rows.",
		};
	}

	if (repoPath.endsWith("tests/browser-smoke/app-smoke.spec.ts")) {
		return {
			file_path: repoPath,
			test_layer: "browser_smoke",
			scenario_ids: "VIS-01|VIS-02|DOCS-01|ACCESS-02",
			current_value: "Public homepage, crawl surface, docs metadata, and checkout-success recovery.",
			disposition: "keep",
			replacement_path: "",
			disposition_rationale:
				"This file already proves release-critical public behavior in the current route model.",
		};
	}

	if (repoPath.endsWith("tests/e2e/auth-protection.sandbox.spec.ts")) {
		return {
			file_path: repoPath,
			test_layer: "sandbox_e2e",
			scenario_ids: "AUTH-02|ACCESS-01|PACKET-01",
			current_value: "Signed-out redirect, no-access recovery, and canonical packet-start entry.",
			disposition: "keep",
			replacement_path: "",
			disposition_rationale:
				"This sandbox spec now maps directly to the canonical packet entry routes and belongs in the default ship pack.",
		};
	}

	if (repoPath.endsWith("tests/e2e/buyer-handoff.sandbox.spec.ts")) {
		return {
			file_path: repoPath,
			test_layer: "sandbox_e2e",
			scenario_ids:
				"PACKET-01|PACKET-02|PACKET-03|PACKET-04|PACKET-05|PACKET-06|PACKET-07|SETTINGS-01|FREEPAID-02",
			current_value:
				"Canonical packet funnel, settings visibility, and paid handoff through the packet-first routes.",
			disposition: "keep",
			replacement_path: "",
			disposition_rationale:
				"This sandbox spec now carries the canonical default-ship packet flow plus the billing-integration handoff.",
		};
	}

	if (repoPath.includes("/tests/contracts/")) {
		return inventoryRecord(repoPath, testLayer, "CONTENT-01", "Packet curriculum contract.", "keep", "", "Contracts still map cleanly to the packet model.");
	}

	if (repoPath.includes("/tests/integration/observability-")) {
		return inventoryRecord(repoPath, testLayer, "OBS-01", "Observability route behavior.", "keep", "", "These tests still prove operational safety.");
	}

	if (repoPath.includes("/tests/unit/observability")) {
		return inventoryRecord(repoPath, testLayer, "OBS-01", "Observability helper and adapter behavior.", "keep", "", "Useful extended-pack proof.");
	}

	if (
		repoPath.includes("vercel-webhook") ||
		repoPath.includes("clerk-webhook") ||
		repoPath.includes("stripe-observability")
	) {
		return inventoryRecord(repoPath, testLayer, "OBS-01", "Observability adapter behavior.", "keep", "", "Useful extended-pack proof.");
	}

	if (repoPath.includes("codex")) {
		return inventoryRecord(repoPath, testLayer, "CODEX-01", "Codex routes or connection helpers.", "keep", "", "Codex remains an extended support surface.");
	}

	if (
		repoPath.includes("starter-repo") ||
		repoPath.includes("github-username") ||
		repoPath.includes("starter-selectors")
	) {
		return inventoryRecord(repoPath, testLayer, "STARTER-01|SETTINGS-02", "Starter repo access and settings add-ons.", "keep", "", "Starter repo still belongs in the extended support pack.");
	}

	if (repoPath.includes("docs-metadata")) {
		return inventoryRecord(repoPath, testLayer, "DOCS-01", "Docs metadata integrity.", "keep", "", "This is the canonical docs discovery proof.");
	}

	if (
		repoPath.includes("sign-in") ||
		repoPath.includes("sign-up") ||
		repoPath.includes("sso-callback") ||
		repoPath.includes("clerk-authorized-parties")
	) {
		return inventoryRecord(repoPath, testLayer, "AUTH-01", "Sign-in and auth redirect behavior.", "keep", "", "These tests still map cleanly to auth scenarios.");
	}

	if (repoPath.includes("access-required")) {
		return inventoryRecord(repoPath, testLayer, "ACCESS-01", "No-access recovery surface.", "keep", "", "The recovery surface is still part of the default ship contract.");
	}

	if (repoPath.includes("app-protected-layout")) {
		return inventoryRecord(repoPath, testLayer, "AUTH-02|ACCESS-01", "Protected layout redirect and access gating behavior.", "keep", "", "This helper-level proof still maps to the protected-route contract.");
	}

	if (repoPath.includes("checkout-success")) {
		return inventoryRecord(repoPath, testLayer, "ACCESS-02", "Checkout-success recovery surface.", "keep", "", "This is a release-critical recovery scenario.");
	}

	if (
		repoPath.includes("checkout-button") ||
		repoPath.includes("checkout-session") ||
		repoPath.includes("stripe-checkout-route")
	) {
		return inventoryRecord(repoPath, testLayer, "FREEPAID-01", "Checkout launch behavior.", "keep", "", "These tests still prove checkout launch without forcing a full billing run.");
	}

	if (repoPath.includes("packet-download-routes") || repoPath.includes("uploads")) {
		return inventoryRecord(repoPath, testLayer, "PACKET-06", "Review downloads and packet export behavior.", "keep", "", "Useful proof for the Review stage.");
	}

	if (
		repoPath.includes("workspace-home") ||
		repoPath.includes("course-access") ||
		repoPath.includes("course-entitlements") ||
		repoPath.includes("product-shell")
	) {
		return inventoryRecord(repoPath, testLayer, "PACKET-01|PACKET-07", "Protected workspace and access behavior.", "keep", "", "These still contribute to packet entry confidence.");
	}

	if (repoPath.includes("home-page") || repoPath.includes("robots") || repoPath.includes("manifest")) {
		return inventoryRecord(repoPath, testLayer, "VIS-01|VIS-02", "Homepage and public discovery behavior.", "keep", "", "These tests still map to visitor-first scenarios.");
	}

	if (repoPath.includes("settings-page") || repoPath.includes("/settings-")) {
		return inventoryRecord(repoPath, testLayer, "SETTINGS-01|SETTINGS-02", "Settings page surfaces.", "keep", "", "Settings stays in the QA model.");
	}

	if (
		repoPath.includes("mission-page") ||
		repoPath.includes("app-workspace-mission-page") ||
		repoPath.includes("legacy-lesson-routes")
	) {
		return inventoryRecord(repoPath, testLayer, "PACKET-07", "Legacy mission or route alias behavior.", "rewrite", "Canonical packet route coverage", "These tests still talk about legacy aliases that should not anchor the QA model.");
	}

	if (
		repoPath.includes("lesson-") ||
		repoPath.includes("stage-unlock") ||
		repoPath.includes("course-state-lifecycle") ||
		repoPath.includes("course-registry") ||
		repoPath.includes("watch-lesson") ||
		repoPath.includes("next-lesson-handoff")
	) {
		return inventoryRecord(repoPath, testLayer, "PACKET-07|CONTENT-01", "Packet funnel lesson and curriculum behavior.", "keep", "", "These are still useful but should roll up under packet scenarios.");
	}

	if (
		repoPath.includes("workbench") ||
		repoPath.includes("orientation") ||
		repoPath.includes("core-flow") ||
		repoPath.includes("core-ux") ||
		repoPath.includes("research-prompt") ||
		repoPath.includes("competitor-research-light") ||
		repoPath.includes("skill-rail") ||
		repoPath.includes("brand-kit") ||
		repoPath.includes("production-deploy-handoff") ||
		repoPath.includes("repo-map")
	) {
		return inventoryRecord(repoPath, testLayer, "CONTENT-01", "Implementation-led lesson or workbench detail.", "merge", "PACKET-07 or CONTENT-01 coverage", "These tests are useful authoring guardrails but too implementation-led to stand alone in ship reporting.");
	}

	if (
		repoPath.includes("bonus-course-card")
	) {
		return inventoryRecord(repoPath, testLayer, "CONTENT-01", "Bonus module card behavior.", "merge", "CONTENT-01 coverage", "This is secondary product content rather than a ship-critical journey.");
	}

	return inventoryRecord(
		repoPath,
		testLayer,
		"CONTENT-01",
		"General packet or support behavior.",
		"keep",
		"",
		"Defaulted into the packet content bucket pending a more specific mapping.",
	);
}

function inventoryRecord(
	filePath,
	testLayer,
	scenarioIds,
	currentValue,
	disposition,
	replacementPath,
	dispositionRationale,
) {
	return {
		file_path: filePath,
		test_layer: testLayer,
		scenario_ids: scenarioIds,
		current_value: currentValue,
		disposition,
		replacement_path: replacementPath,
		disposition_rationale: dispositionRationale,
	};
}

async function main() {
	const filePaths = await listFiles(testsDirectory);
	const records = filePaths
		.filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
		.map(buildRecord)
		.sort((left, right) => left.file_path.localeCompare(right.file_path));

	const csv = stringifyCsv({ headers, rows: records });
	await writeFile(outputPath, csv, "utf8");
	console.log(`Synced qa/test-inventory.csv with ${records.length} test files.`);
}

await main();
