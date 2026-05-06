import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { buildDocsOperatingSystemInstallPlan } from "../src/workflows/docs-operating-system-adoption/install-plan";
import { buildDocsSpineScannerBundle } from "../src/workflows/docs-spine-adoption/scanner";

const execFileAsync = promisify(execFile);
const REAL_REPO_EVAL_ENABLED =
	process.env.SBS_DOCS_OPERATING_SYSTEM_REAL_REPO_EVAL === "1";
const REAL_REPO_PATHS = [
	"/Users/bazelrex/Developer/worker",
	"/Users/bazelrex/Developer/ship-by-sunday",
	"/Users/bazelrex/Developer/arena-crm",
].filter((repositoryRoot) => existsSync(path.join(repositoryRoot, ".git")));

async function listTrackedRepoRefs(repositoryRoot: string) {
	const { stdout } = await execFileAsync("git", ["ls-files"], {
		cwd: repositoryRoot,
	});
	return stdout
		.split(/\r?\n/)
		.map((ref) => ref.trim())
		.filter((ref) => ref.length > 0)
		.sort();
}

async function readRootPackageManifest(repositoryRoot: string) {
	const packageJsonPath = path.join(repositoryRoot, "package.json");
	if (!existsSync(packageJsonPath)) {
		return null;
	}
	const parsed = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
		name?: unknown;
		scripts?: unknown;
	};
	const scripts =
		parsed.scripts &&
		typeof parsed.scripts === "object" &&
		!Array.isArray(parsed.scripts)
			? Object.fromEntries(
					Object.entries(parsed.scripts).filter(
						(entry): entry is [string, string] =>
							typeof entry[0] === "string" && typeof entry[1] === "string",
					),
				)
			: {};
	return {
		name: typeof parsed.name === "string" ? parsed.name : undefined,
		scripts,
	};
}

describe.skipIf(!REAL_REPO_EVAL_ENABLED)(
	"docs operating system real repo eval",
	() => {
		it("has at least one local real repo to evaluate", () => {
			expect(REAL_REPO_PATHS.length).toBeGreaterThan(0);
		});

		it.each(REAL_REPO_PATHS)(
			"builds a sync-safe dry-run install plan for %s",
			async (repositoryRoot) => {
				const scannerBundle = await buildDocsSpineScannerBundle({
					repositoryRoot,
					now: Date.UTC(2026, 4, 6, 12),
				});
				const plan = buildDocsOperatingSystemInstallPlan({
					repoFacts: scannerBundle.repoFacts,
					rootPackageManifest: await readRootPackageManifest(repositoryRoot),
					trackedRepoRefs: await listTrackedRepoRefs(repositoryRoot),
					now: Date.UTC(2026, 4, 6, 12),
				});

				expect(plan.workflowId).toBe("docs-operating-system-adoption");
				expect(plan.installProfile).toBe("worker-grade");
				expect(plan.privacyBoundary).toEqual({
					rawSourceIncluded: false,
					rawLogsIncluded: false,
					packageScriptBodiesIncluded: false,
					dependencyVersionsIncluded: false,
					localAbsolutePathsIncluded: false,
					codexTranscriptsIncluded: false,
				});
				expect(
					plan.resolvedModules.map((moduleState) => moduleState.moduleId),
				).toEqual([
					"docs-spine",
					"programs",
					"exec-plans",
					"prompts",
					"markdown-lint",
					"docs-validate",
					"planning-scripts",
					"proof-artifacts",
				]);
				const supportedOutOfScopeKinds = new Set([
					"runtime",
					"worker-operating-state",
					"worker-state",
					"topology",
					"ci-provider-setup",
					"app-stack-command-wiring",
					"broad-root-agent-rewrite",
				]);
				for (const detection of plan.outOfScopeDetections) {
					expect(supportedOutOfScopeKinds.has(detection.kind)).toBe(true);
				}
				if (repositoryRoot.endsWith("/worker")) {
					expect(
						plan.outOfScopeDetections.map((detection) => detection.kind),
					).toContain("runtime");
				}
			},
		);
	},
);
