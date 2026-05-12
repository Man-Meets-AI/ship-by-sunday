import { buildDocsOperatingSystemInstallPlan } from "../src/workflows/docs-operating-system-adoption/install-plan";
import type { DocsSpineRepoFacts } from "../src/workflows/docs-spine-adoption/schemas";

function createRepoFacts({
	packageManager = "bun",
	packageScripts = [],
	dependencyNames = [],
	docsRefs = [],
	programRefs = [],
	execPlanRefs = [],
	promptRefs = [],
	validationRefs = [],
	ciRefs = [],
	agentInstructionRefs = [],
	assistantShimRefs = [],
}: {
	packageManager?: string;
	packageScripts?: string[];
	dependencyNames?: string[];
	docsRefs?: string[];
	programRefs?: string[];
	execPlanRefs?: string[];
	promptRefs?: string[];
	validationRefs?: string[];
	ciRefs?: string[];
	agentInstructionRefs?: string[];
	assistantShimRefs?: string[];
} = {}): DocsSpineRepoFacts {
	return {
		schemaVersion: "docs-spine-repo-facts.v1",
		workflowId: "docs-spine-adoption",
		workflowVersion: "v1",
		repositoryShape: {
			packageManager,
			packageScripts,
			workspaceGlobs: [],
			workspacePackageRefs: [],
			dependencyNames,
		},
		instructionSurface: {
			agentInstructionRefs,
			assistantShimRefs,
			secondaryInstructionRefs: [],
			ignoredInstructionRefs: [],
			skillRefs: [],
		},
		docsSurface: {
			docsRefs,
			programRefs,
			execPlanRefs,
			promptRefs,
			specRefs: [],
			generatedRefs: [],
		},
		validationSurface: {
			validationRefs,
			ciRefs,
			releaseRefs: [],
		},
		blockedFacts: [],
		createdAt: 1,
	};
}

describe("docs operating system install plan", () => {
	it("plans missing portable scripts and validator wrappers without mutating source", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				docsRefs: ["README.md", "docs/index.md"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				scripts: {},
			},
			trackedRepoRefs: [
				"README.md",
				"bun.lock",
				"docs/index.md",
				"package.json",
			],
			now: 10,
		});

		expect(
			plan.packageScriptOperations.map(({ scriptName, status }) => ({
				scriptName,
				status,
			})),
		).toEqual([
			{ scriptName: "programs:lint", status: "add" },
			{ scriptName: "plans:lint", status: "add" },
			{ scriptName: "markdown:lint", status: "add" },
			{ scriptName: "docs:validate", status: "add" },
			{ scriptName: "docs:refresh-quality", status: "add" },
			{ scriptName: "program:write-child-plan", status: "add" },
		]);
		expect(plan.dependencyOperations).toEqual([
			expect.objectContaining({
				packageName: "ship-by-sunday",
				dependencyType: "devDependency",
				status: "installable",
			}),
		]);
		expect(
			plan.validatorFileOperations.every(
				(operation) => operation.status === "installable",
			),
		).toBe(true);
		expect(plan.blockedOperations).toEqual([]);
		expect(plan.privacyBoundary).toEqual({
			rawSourceIncluded: false,
			rawLogsIncluded: false,
			packageScriptBodiesIncluded: false,
			dependencyVersionsIncluded: false,
			localAbsolutePathsIncluded: false,
			codexTranscriptsIncluded: false,
		});
	});

	it("keeps recognized existing portable script names", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				packageScripts: [
					"programs:lint",
					"plans:lint",
					"markdown:lint",
					"docs:validate",
					"docs:refresh-quality",
					"program:write-child-plan",
				],
				dependencyNames: ["ship-by-sunday"],
				programRefs: ["docs/programs/PROGRAMS.md"],
				execPlanRefs: ["docs/exec-plans/PLANS.md"],
				promptRefs: ["docs/prompts/README.md"],
				validationRefs: ["scripts/docs-quality/validate.ts"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				devDependencies: {
					"ship-by-sunday": "0.1.0",
				},
				scripts: {
					"programs:lint": "bun scripts/programs/run-lint.ts",
					"plans:lint": "bun scripts/exec-plan/run-lint.ts",
					"markdown:lint": "bun scripts/markdown-metadata/run-lint.ts",
					"docs:validate": "bun scripts/docs-quality/validate.ts",
					"docs:refresh-quality": "bun scripts/docs-quality/refresh-quality.ts",
					"program:write-child-plan":
						"bun scripts/programs/write-child-plan.ts",
				},
			},
			trackedRepoRefs: [
				"docs/exec-plans/PLANS.md",
				"docs/programs/PROGRAMS.md",
				"docs/prompts/README.md",
				"package.json",
			],
			now: 10,
		});

		expect(
			plan.packageScriptOperations.every(
				(operation) =>
					operation.status === "keep" &&
					operation.currentScriptRecognized === true,
			),
		).toBe(true);
		expect(plan.dependencyOperations[0].status).toBe("already-present");
		expect(plan.blockedOperations).toEqual([]);
	});

	it("blocks same-name scripts with unrecognized bodies without serializing the body", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				packageScripts: ["docs:validate"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				scripts: {
					"docs:validate": "echo SECRET_SHOULD_NOT_LEAK",
				},
			},
			trackedRepoRefs: ["package.json"],
			now: 10,
		});

		expect(plan.conflicts).toEqual([
			expect.objectContaining({
				conflictId: "package-script:docs:validate",
				targetRef: "package.json#scripts.docs:validate",
				nextApprovalRequired: true,
			}),
		]);
		expect(plan.blockedOperations).toEqual([
			expect.objectContaining({
				operationId: "package-script:docs:validate",
				surface: "package-script",
			}),
		]);
		expect(JSON.stringify(plan)).not.toContain("SECRET_SHOULD_NOT_LEAK");
	});

	it("does not recognize arbitrary Ship by Sunday text or runtime wrappers as portable docs scripts", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				packageScripts: ["docs:validate", "programs:lint", "markdown:lint"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				scripts: {
					"docs:validate": "echo ship-by-sunday migration pending",
					"programs:lint": "scripts/run-runtime.sh programs:lint",
					"markdown:lint":
						"echo extra && bun scripts/sbs-docs/markdown-lint.mjs",
				},
			},
			trackedRepoRefs: ["package.json"],
			now: 10,
		});

		expect(plan.packageScriptOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					scriptName: "docs:validate",
					status: "blocked",
					currentScriptRecognized: false,
				}),
				expect.objectContaining({
					scriptName: "programs:lint",
					status: "blocked",
					currentScriptRecognized: false,
				}),
				expect.objectContaining({
					scriptName: "markdown:lint",
					status: "blocked",
					currentScriptRecognized: false,
				}),
			]),
		);
		expect(plan.blockedOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					operationId: "package-script:docs:validate",
					surface: "package-script",
				}),
				expect.objectContaining({
					operationId: "package-script:programs:lint",
					surface: "package-script",
				}),
				expect.objectContaining({
					operationId: "package-script:markdown:lint",
					surface: "package-script",
				}),
			]),
		);
		expect(JSON.stringify(plan)).not.toContain("ship-by-sunday migration");
		expect(JSON.stringify(plan)).not.toContain("run-runtime.sh");
		expect(JSON.stringify(plan)).not.toContain("echo extra");
	});

	it("blocks bun run wrapper paths because package scripts can shadow them", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				packageScripts: ["docs:validate"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				scripts: {
					"docs:validate": "bun run scripts/sbs-docs/docs-validate.mjs",
				},
			},
			trackedRepoRefs: ["package.json"],
			now: 10,
		});

		expect(plan.packageScriptOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					scriptName: "docs:validate",
					status: "blocked",
					currentScriptRecognized: false,
				}),
			]),
		);
		expect(plan.blockedOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					operationId: "package-script:docs:validate",
					surface: "package-script",
				}),
			]),
		);
	});

	it("blocks non-string same-name package scripts without serializing their values", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				packageScripts: ["docs:validate"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				scripts: {
					"docs:validate": ["SECRET_NON_STRING_SCRIPT"],
				},
			},
			trackedRepoRefs: ["package.json"],
			now: 10,
		});

		expect(plan.packageScriptOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					scriptName: "docs:validate",
					status: "blocked",
					currentScriptRecognized: false,
				}),
			]),
		);
		expect(plan.blockedOperations).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					operationId: "package-script:docs:validate",
					surface: "package-script",
				}),
			]),
		);
		expect(JSON.stringify(plan)).not.toContain("SECRET_NON_STRING_SCRIPT");
	});

	it("reports runtime and worker-specific surfaces as out of scope", () => {
		const plan = buildDocsOperatingSystemInstallPlan({
			repoFacts: createRepoFacts({
				packageScripts: ["runtime:bootstrap", "worker-state:current", "dev"],
				ciRefs: [".github/workflows/ci.yml"],
				agentInstructionRefs: ["AGENTS.md"],
				assistantShimRefs: [".codex/AGENTS.md"],
			}),
			rootPackageManifest: {
				name: "customer-repo",
				scripts: {
					"runtime:bootstrap": "worker runtime",
					"worker-state:current": "worker state",
					dev: "vite",
				},
			},
			trackedRepoRefs: [
				".runtime/worktrees/main/runtime-index.json",
				"AGENTS.md",
				"system/topology.json",
				"workspace/goals/active.md",
				"worker/roles/operator.md",
			],
			now: 10,
		});

		expect(
			plan.outOfScopeDetections.map((detection) => detection.kind),
		).toEqual([
			"runtime",
			"worker-state",
			"topology",
			"worker-operating-state",
			"ci-provider-setup",
			"app-stack-command-wiring",
			"broad-root-agent-rewrite",
		]);
	});
});
