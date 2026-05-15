import { execFile } from "node:child_process";
import { mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { Effect, Layer } from "effect";

import { BoundedProcessService } from "../src/core/bounded-process";
import { NodeCodexExecServiceLive } from "../src/core/codex-exec-runner";
import { NodeLocalProjectStateServiceLive } from "../src/core/local-project-state";
import {
	extractProgramRunSliceProofCommands,
	runProgramRunSlice,
	runProgramRunSliceEffect,
	type ProgramRunSliceExecutor,
	type ProgramRunSliceExecutorInput,
	type ProgramRunSliceReviewResult,
} from "../src/core/program-run-slice";
import { NodeRepositoryBoundaryServiceLive } from "../src/core/repository-boundary";
import {
	createTemporaryDirectory,
	initializeGitRepository,
} from "./test-utils";

const execFileAsync = promisify(execFile);

describe("program run slice", () => {
	it("runs one child ExecPlan through execute, proof, review, docs sync, and checkpoint", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
				await writeRepoFile(repositoryRoot, "staged.txt", "staged\n");
				await execFileAsync("git", ["add", "staged.txt"], {
					cwd: repositoryRoot,
				});
			},
			reviews: [
				{
					findings: [],
					openQuestions: [],
					validationNotes: ["Focused fixture proof passed."],
				},
			],
		});

		const result = await runProgramRunSlice({
			executor,
			planPath: PLAN_PATH,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "run-happy",
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("complete");
		expect(result.fixAttempts).toBe(0);
		expect(result.proofResults).toHaveLength(1);
		expect(result.reviewFindings).toHaveLength(0);
		const reviewPrompt = await readFile(
			path.join(
				repositoryRoot,
				".sbs/program-runs/autonomous-program-execution-loop/run-happy/review-prompt.md",
			),
			"utf8",
		);
		expect(reviewPrompt).toContain("Review this completed ExecPlan slice");
		expect(reviewPrompt).toContain("<TRACKED_DIFF_AGAINST_HEAD>");
		expect(reviewPrompt).toContain("staged.txt");
		expect(reviewPrompt).toContain("+staged");
		expect(reviewPrompt).toContain("<UNTRACKED_FILE_SNAPSHOTS>");
		expect(reviewPrompt).toContain("--- implemented.txt");
		expect(reviewPrompt).toContain("done");
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/run-happy/review-prompt-1.md",
				),
				"utf8",
			),
		).resolves.toContain("Review this completed ExecPlan slice");
		const reviewSchema = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/run-happy/review-output-schema.json",
				),
				"utf8",
			),
		) as { properties: { findings: { items: { required: string[] } } } };
		expect(reviewSchema.properties.findings.items.required).toEqual(
			expect.arrayContaining(["category", "disposition"]),
		);
		await expect(
			readFile(path.join(repositoryRoot, PLAN_PATH), "utf8"),
		).resolves.toContain("Autonomous Run run-happy");
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					"docs/programs/active/2026-05-13-autonomous-program-execution-loop/program.md",
				),
				"utf8",
			),
		).resolves.toContain("Completed autonomous run `run-happy`");
		await expect(
			readFile(path.join(repositoryRoot, ".git/info/exclude"), "utf8"),
		).resolves.toContain(".sbs/");
		const gitStatus = await execFileAsync(
			"git",
			["status", "--short", "--untracked-files=all"],
			{ cwd: repositoryRoot },
		);
		expect(gitStatus.stdout).not.toContain(".sbs/");
	});

	it("supports injecting the process service through the Effect run-slice path", async () => {
		const proofCommand = envAccessCommand("implemented.txt");
		const repositoryRoot = await createProgramRunFixture({
			planText: buildFixturePlan({ testCommands: [proofCommand] }),
		});
		const processRequests: Array<{
			args: string[];
			command: string;
			cwd?: string;
			env: NodeJS.ProcessEnv;
			timeoutMs: number;
		}> = [];
		const stubBoundedProcessService = Layer.succeed(
			BoundedProcessService,
			BoundedProcessService.of({
				run: (request) => {
					processRequests.push({
						args: request.args,
						command: request.command,
						cwd: request.cwd,
						env: request.env,
						timeoutMs: request.timeoutMs,
					});
					return Effect.succeed({
						succeeded: true,
						stdout: request.command === "git" ? "" : "stubbed proof output\n",
						stderr: "",
						timedOut: false,
					});
				},
			}),
		);

		const previousAmbientProofEnv = process.env.SBS_AMBIENT_PROOF_ENV;
		process.env.SBS_AMBIENT_PROOF_ENV = "ambient";
		try {
			const result = await Effect.runPromise(
				runProgramRunSliceEffect({
					executor: createFakeExecutor({
						reviews: [
							{
								findings: [],
								openQuestions: [],
								validationNotes: ["Stubbed proof passed."],
							},
						],
					}),
					planPath: PLAN_PATH,
					programId: PROGRAM_ID,
					repoRootDir: repositoryRoot,
					runId: "run-effect-injected-process",
					timeoutMs: 15_000,
				}).pipe(
					Effect.provide(
						Layer.mergeAll(
							stubBoundedProcessService,
							NodeCodexExecServiceLive,
							NodeLocalProjectStateServiceLive,
							NodeRepositoryBoundaryServiceLive,
						),
					),
				),
			);

			expect(result.finalStatus).toBe("complete");
			expect(result.proofResults).toEqual([
				expect.objectContaining({
					command: proofCommand,
					stdoutTail: "stubbed proof output",
					succeeded: true,
				}),
			]);
			const proofRequests = processRequests.filter(
				(request) => request.command === "node",
			);
			expect(proofRequests).toHaveLength(1);
			expect(proofRequests[0]).toEqual(
				expect.objectContaining({
					args: ["-e", "require('node:fs').accessSync('implemented.txt')"],
					command: "node",
					cwd: repositoryRoot,
					timeoutMs: 15_000,
				}),
			);
			expect(proofRequests[0]?.env.SBS_AMBIENT_PROOF_ENV).toBe("ambient");
			expect(proofRequests[0]?.env.SBS_INLINE_PROOF_ENV).toBe("inline");
			expect(processRequests).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						args: ["status", "--short", "--untracked-files=all"],
						command: "git",
						cwd: repositoryRoot,
						timeoutMs: 15_000,
					}),
				]),
			);
		} finally {
			if (previousAmbientProofEnv === undefined) {
				delete process.env.SBS_AMBIENT_PROOF_ENV;
			} else {
				process.env.SBS_AMBIENT_PROOF_ENV = previousAmbientProofEnv;
			}
		}
	});

	it("fixes must-fix review findings and reruns proof and review", async () => {
		const repositoryRoot = await createProgramRunFixture();
		let fixPrompt = "";
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			onFix: async (input) => {
				fixPrompt = input.prompt;
				await writeRepoFile(repositoryRoot, "fixed.txt", "fixed\n");
				await writeRepoFile(
					repositoryRoot,
					PLAN_PATH,
					buildFixturePlan({
						testCommands: [
							accessCommand("implemented.txt"),
							accessCommand("fixed.txt"),
						],
					}),
				);
			},
			reviews: [
				{
					findings: [
						{
							category: "bug",
							disposition: "must_fix",
							impact: "The fixture still lacks the reviewed fix marker.",
							minimalFix: "Write fixed.txt.",
							mustFix: true,
							severity: "high",
							title: "Missing fix marker",
						},
					],
					openQuestions: [],
					validationNotes: [],
				},
				{
					findings: [],
					openQuestions: [],
					validationNotes: ["The fix marker exists."],
				},
			],
		});

		const result = await runProgramRunSlice({
			executor,
			maxFixAttempts: 2,
			planPath: PLAN_PATH,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "run-fix",
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("complete");
		expect(result.fixAttempts).toBe(1);
		expect(
			result.proofResults.map((proofResult) => proofResult.command),
		).toEqual([accessCommand("implemented.txt"), accessCommand("fixed.txt")]);
		await expect(
			readFile(path.join(repositoryRoot, "fixed.txt"), "utf8"),
		).resolves.toBe("fixed\n");
		expect(fixPrompt).toContain("Fix attempt: 1 of 2.");
		expect(fixPrompt).toContain("disposition is must_fix");
	});

	it("rejects unsafe program ids before creating run artifacts", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			reviews: [],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: "../autonomous-program-execution-loop",
				repoRootDir: repositoryRoot,
				runId: "run-unsafe-program",
			}),
		).rejects.toThrow("Invalid Program id");
	});

	it("rejects ExecPlans that belong to a different Program", async () => {
		const repositoryRoot = await createProgramRunFixture();
		await writeRepoFile(
			repositoryRoot,
			PLAN_PATH,
			buildFixturePlan({ programId: "other-program" }),
		);
		await execFileAsync("git", ["add", PLAN_PATH], { cwd: repositoryRoot });
		await execFileAsync("git", ["commit", "-m", "mismatch plan program"], {
			cwd: repositoryRoot,
		});
		const executor = createFakeExecutor({
			reviews: [],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-plan-mismatch",
			}),
		).rejects.toThrow("belongs to program_id other-program");
	});

	it("blocks before review when deterministic proof fails", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			reviews: [],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-proof-fails",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow("Program run slice proof failed.");

		const state = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/run-proof-fails/state.json",
				),
				"utf8",
			),
		) as { currentPhase: string; errorMessage: string };
		expect(state.currentPhase).toBe("blocked");
		expect(state.errorMessage).toContain("Program run slice proof failed.");
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/run-proof-fails/proof-summary.md",
				),
				"utf8",
			),
		).resolves.toContain("Status: failed");
	});

	it("blocks when review findings remain after capped fix attempts", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			reviews: [buildPersistentFindingReview(), buildPersistentFindingReview()],
		});

		await expect(
			runProgramRunSlice({
				executor,
				maxFixAttempts: 1,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-review-fails",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow("Review still has 1 must-fix finding");
	});

	it("runs with pre-existing dirty worktree state", async () => {
		const repositoryRoot = await createProgramRunFixture();
		await writeRepoFile(repositoryRoot, "dirty.txt", "uncommitted\n");
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			reviews: [],
		});

		const result = await runProgramRunSlice({
			executor,
			planPath: PLAN_PATH,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "run-dirty",
		});

		expect(result.finalStatus).toBe("complete");
		await expect(
			readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/run-dirty/review-prompt.md",
				),
				"utf8",
			),
		).resolves.toContain("dirty.txt");
	});

	it("extracts runnable Test Commands from indented blocks", async () => {
		const repositoryRoot = await createProgramRunFixture();

		await expect(
			extractProgramRunSliceProofCommands({
				planPath: PLAN_PATH,
				repoRootDir: repositoryRoot,
			}),
		).resolves.toEqual([
			expect.objectContaining({
				command: "node -e \"require('node:fs').accessSync('implemented.txt')\"",
				cwd: repositoryRoot,
			}),
		]);
	});

	it("extracts continued commands and skips long-running package scripts", async () => {
		const repositoryRoot = await createProgramRunFixture({
			planText: buildFixturePlan({
				testCommands: [
					"bun test packages/local-runner/tests/program-run-slice.test.ts \\",
					"  --timeout 30000",
					"bun run --cwd apps/web dev",
					"npm run start",
				],
			}),
		});

		await expect(
			extractProgramRunSliceProofCommands({
				planPath: PLAN_PATH,
				repoRootDir: repositoryRoot,
			}),
		).resolves.toEqual([
			expect.objectContaining({
				command:
					"bun test packages/local-runner/tests/program-run-slice.test.ts --timeout 30000",
				cwd: repositoryRoot,
			}),
		]);
	});

	it("rejects proof command cwd changes outside the repository", async () => {
		const repositoryRoot = await createProgramRunFixture({
			planText: buildFixturePlan({
				testCommands: ["cd /tmp", "node -e \"console.log('outside')\""],
			}),
		});
		const executor = createFakeExecutor({
			onExecute: async () => {},
			reviews: [],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-cwd-escape",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow("Proof command cd must stay inside the repository");
	});

	it("rejects proof executable paths that traverse outside the repository", async () => {
		const repositoryRoot = await createProgramRunFixture({
			planText: buildFixturePlan({
				testCommands: ["./scripts/../../outside-runner --version"],
			}),
		});
		const executor = createFakeExecutor({
			onExecute: async () => {},
			reviews: [],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-executable-path-escape",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow(
			"Proof command executable must be repo-relative or resolved from PATH",
		);
	});

	it("rejects shell operators in proof commands", async () => {
		const repositoryRoot = await createProgramRunFixture({
			planText: buildFixturePlan({
				testCommands: [
					"node -e \"console.log('unsafe')\" && node -e \"console.log('second')\"",
				],
			}),
		});
		const executor = createFakeExecutor({
			onExecute: async () => {},
			reviews: [],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-shell-operator",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow(
			"Proof commands must use one direct executable without shell operators",
		);
	});

	it("rejects malformed review schema output instead of treating it as passing", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor: ProgramRunSliceExecutor = async (input) => {
			if (input.purpose === "execute") {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
				return {
					finalMessage: "execute complete",
					structuredOutput: null,
					threadId: "thread-execute",
				};
			}
			return {
				finalMessage: "malformed review",
				structuredOutput: {
					findings: [
						{
							category: "bug",
							disposition: "must_fix",
							impact: "The schema value is not boolean.",
							minimalFix: "Return a boolean mustFix value.",
							mustFix: "true",
							severity: "high",
							title: "Malformed mustFix",
						},
					],
					openQuestions: [],
					validationNotes: [],
				},
				threadId: "thread-review",
			};
		};

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-malformed-review",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow("Review finding mustFix must be a boolean");
	});

	it("rejects high severity review findings that are not marked must-fix", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			reviews: [
				{
					findings: [
						{
							category: "regression",
							deferRationale: "The regression can wait.",
							disposition: "intentional_defer",
							followUp: "Open a follow-up slice.",
							impact: "A high severity regression would ship.",
							minimalFix: "Fix it before completing.",
							mustFix: false,
							severity: "high",
							title: "High severity deferred",
						},
					],
					openQuestions: [],
					validationNotes: [],
				},
			],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-high-deferred",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow(
			"Critical and high review findings must be marked must_fix",
		);
	});

	it("rejects intentionally deferred findings without rationale and follow-up", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			reviews: [
				{
					findings: [
						{
							category: "missing_test",
							disposition: "intentional_defer",
							impact: "A meaningful follow-up test is still missing.",
							minimalFix: "Add the missing coverage in a later slice.",
							mustFix: false,
							severity: "medium",
							title: "Deferred without follow-up",
						},
					],
					openQuestions: [],
					validationNotes: [],
				},
			],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-deferred-without-rationale",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow(
			"Intentionally deferred review findings require deferRationale and followUp",
		);
	});

	it("rejects intentionally deferred medium shipped-risk findings", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			reviews: [
				{
					findings: [
						{
							category: "security",
							deferRationale: "The security issue can wait.",
							disposition: "intentional_defer",
							followUp: "Open a follow-up slice.",
							impact: "A medium security bug would ship.",
							minimalFix: "Fix it before completing.",
							mustFix: false,
							severity: "medium",
							title: "Medium security deferred",
						},
					],
					openQuestions: [],
					validationNotes: [],
				},
			],
		});

		await expect(
			runProgramRunSlice({
				executor,
				planPath: PLAN_PATH,
				programId: PROGRAM_ID,
				repoRootDir: repositoryRoot,
				runId: "run-medium-security-deferred",
				timeoutMs: 15_000,
			}),
		).rejects.toThrow(
			"Only missing_test review findings can be intentionally deferred",
		);
	});

	it("records intentionally deferred findings without entering repair", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			onFix: async () => {
				throw new Error("Deferred findings should not trigger repair.");
			},
			reviews: [
				{
					findings: [
						{
							category: "missing_test",
							deferRationale:
								"The behavior is covered by package smoke; a narrower unit test belongs in the next hardening slice.",
							disposition: "intentional_defer",
							followUp: "Create a follow-up ExecPlan for narrow unit coverage.",
							impact:
								"The reviewed slice has less focused coverage than ideal.",
							minimalFix: "Add a narrower unit test in a follow-up slice.",
							mustFix: false,
							severity: "medium",
							title: "Deferred focused coverage",
						},
					],
					openQuestions: [],
					validationNotes: ["Proof passed."],
				},
			],
		});

		const result = await runProgramRunSlice({
			executor,
			planPath: PLAN_PATH,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "run-deferred",
			timeoutMs: 15_000,
		});

		expect(result.finalStatus).toBe("complete");
		expect(result.fixAttempts).toBe(0);
		expect(result.reviewFindings).toHaveLength(1);
		const policySummary = JSON.parse(
			await readFile(
				path.join(
					repositoryRoot,
					".sbs/program-runs/autonomous-program-execution-loop/run-deferred/review-policy-summary-1.json",
				),
				"utf8",
			),
		) as {
			intentionallyDeferredFindings: number;
			mustFixFindings: number;
		};
		expect(policySummary.mustFixFindings).toBe(0);
		expect(policySummary.intentionallyDeferredFindings).toBe(1);
		await expect(
			readFile(path.join(repositoryRoot, PLAN_PATH), "utf8"),
		).resolves.toContain("Intentionally deferred findings: 1");
	});

	it("omits untracked symlink targets from review snapshots", async () => {
		const repositoryRoot = await createProgramRunFixture();
		const outsideDirectory = await createTemporaryDirectory(
			"sbs-program-run-outside-",
		);
		const outsideSecretPath = path.join(outsideDirectory, "secret.txt");
		await writeFile(outsideSecretPath, "SECRET_DO_NOT_LEAK\n", "utf8");
		let reviewPrompt = "";
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
				await symlink(outsideSecretPath, path.join(repositoryRoot, "leak.txt"));
			},
			reviews: [
				{
					findings: [],
					openQuestions: [],
					validationNotes: [],
				},
			],
			onReview: async (input) => {
				reviewPrompt = input.prompt;
			},
		});

		await runProgramRunSlice({
			executor,
			planPath: PLAN_PATH,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "run-symlink-omitted",
			timeoutMs: 15_000,
		});

		expect(reviewPrompt).toContain("--- leak.txt");
		expect(reviewPrompt).toContain("(symlink omitted)");
		expect(reviewPrompt).not.toContain("SECRET_DO_NOT_LEAK");
	});

	it("syncs docs into real markdown headings instead of fenced decoys", async () => {
		const repositoryRoot = await createProgramRunFixture({
			planText: buildFixturePlan({ includeHeadingDecoys: true }),
			programText: buildFixtureProgram({ includeHeadingDecoys: true }),
		});
		const executor = createFakeExecutor({
			onExecute: async () => {
				await writeRepoFile(repositoryRoot, "implemented.txt", "done\n");
			},
			reviews: [
				{
					findings: [],
					openQuestions: [],
					validationNotes: [],
				},
			],
		});

		await runProgramRunSlice({
			executor,
			planPath: PLAN_PATH,
			programId: PROGRAM_ID,
			repoRootDir: repositoryRoot,
			runId: "run-heading-decoys",
			timeoutMs: 15_000,
		});

		const planText = await readFile(
			path.join(repositoryRoot, PLAN_PATH),
			"utf8",
		);
		const fencedArtifactsIndex = planText.indexOf(
			"```md\n## Artifacts and Notes",
		);
		const realArtifactsIndex = planText.indexOf(
			"## Artifacts and Notes",
			fencedArtifactsIndex + 1,
		);
		expect(
			planText.indexOf("### Autonomous Run run-heading-decoys"),
		).toBeGreaterThan(realArtifactsIndex);

		const programText = await readFile(
			path.join(
				repositoryRoot,
				"docs/programs/active/2026-05-13-autonomous-program-execution-loop/program.md",
			),
			"utf8",
		);
		const fencedProgressIndex = programText.indexOf("```md\n## Progress");
		const realProgressIndex = programText.indexOf(
			"## Progress",
			fencedProgressIndex + 1,
		);
		expect(
			programText.indexOf("Completed autonomous run `run-heading-decoys`"),
		).toBeGreaterThan(realProgressIndex);
	});
});

const PROGRAM_ID = "autonomous-program-execution-loop";
const PLAN_PATH = "docs/exec-plans/active/2026-05-13-fixture-plan.md";

async function createProgramRunFixture(
	options: {
		planText?: string;
		programText?: string;
	} = {},
) {
	const repositoryRoot = await createTemporaryDirectory("sbs-program-run-");
	await initializeGitRepository(repositoryRoot);
	await writeRepoFile(repositoryRoot, "AGENTS.md", "# Test Agents\n");
	await writeRepoFile(
		repositoryRoot,
		"docs/programs/active/2026-05-13-autonomous-program-execution-loop/current-planning-brief.txt",
		"planning-brief-1.md\n",
	);
	await writeRepoFile(
		repositoryRoot,
		"docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-1.md",
		[
			"---",
			"title: Fixture Brief",
			"program_id: autonomous-program-execution-loop",
			"brief_version: 1",
			"status: current",
			"summary: Fixture brief.",
			"read_when:",
			"  - Testing.",
			"---",
			"",
			"# Fixture Brief",
			"",
		].join("\n"),
	);
	await writeRepoFile(
		repositoryRoot,
		"docs/programs/active/2026-05-13-autonomous-program-execution-loop/program.md",
		options.programText ?? buildFixtureProgram(),
	);
	await writeRepoFile(
		repositoryRoot,
		PLAN_PATH,
		options.planText ?? buildFixturePlan(),
	);
	await execFileAsync("git", ["add", "."], { cwd: repositoryRoot });
	await execFileAsync("git", ["commit", "-m", "initial fixture"], {
		cwd: repositoryRoot,
	});
	return repositoryRoot;
}

function buildFixtureProgram(
	options: {
		includeHeadingDecoys?: boolean;
	} = {},
) {
	return [
		"---",
		"program_id: autonomous-program-execution-loop",
		"title: Autonomous Program Execution Loop",
		"status: active",
		"created_at: 2026-05-13",
		"completed_at: null",
		"summary: Fixture Program.",
		"post_build_recap: null",
		"read_when:",
		"  - Testing.",
		"---",
		"",
		"# Autonomous Program Execution Loop",
		"",
		"Fixture Program.",
		"",
		...(options.includeHeadingDecoys
			? ["```md", "## Progress", "Do not insert here.", "```", ""]
			: []),
		"## Progress",
		"",
		"- [x] Fixture created.",
		"",
		"## Artifacts and Notes",
		"",
	].join("\n");
}

function buildFixturePlan(
	options: {
		includeHeadingDecoys?: boolean;
		programId?: string;
		testCommands?: string[];
	} = {},
) {
	const testCommands = options.testCommands ?? [
		accessCommand("implemented.txt"),
	];
	return [
		"---",
		"title: Fixture Plan",
		"status: active",
		"created_at: 2026-05-13",
		"completed_at: null",
		"summary: Fixture plan.",
		"post_build_recap: null",
		`program_id: ${options.programId ?? PROGRAM_ID}`,
		"planning_brief: docs/programs/active/2026-05-13-autonomous-program-execution-loop/planning-brief-1.md",
		"read_when:",
		"  - Testing.",
		"---",
		"",
		"# Fixture Plan",
		"",
		"Fixture plan.",
		"",
		...(options.includeHeadingDecoys
			? ["```md", "## Artifacts and Notes", "Do not insert here.", "```", ""]
			: []),
		"## Validation and Acceptance",
		"",
		"### Test Commands",
		"",
		...testCommands.map((command) => `    ${command}`),
		"",
		"## Artifacts and Notes",
		"",
	].join("\n");
}

function accessCommand(repoRelativePath: string) {
	return `node -e "require('node:fs').accessSync('${repoRelativePath}')"`;
}

function envAccessCommand(repoRelativePath: string) {
	return `SBS_INLINE_PROOF_ENV=inline ${accessCommand(repoRelativePath)}`;
}

function createFakeExecutor(params: {
	onExecute?: () => Promise<void>;
	onFix?: (input: ProgramRunSliceExecutorInput) => Promise<void>;
	onReview?: (input: ProgramRunSliceExecutorInput) => Promise<void>;
	reviews: ProgramRunSliceReviewResult[];
}): ProgramRunSliceExecutor {
	let reviewIndex = 0;
	return async (input) => {
		if (input.purpose === "execute") {
			await params.onExecute?.();
			return {
				finalMessage: "execute complete",
				structuredOutput: null,
				threadId: "thread-execute",
			};
		}
		if (input.purpose === "fix") {
			await params.onFix?.(input);
			return {
				finalMessage: "fix complete",
				structuredOutput: null,
				threadId: "thread-fix",
			};
		}
		await params.onReview?.(input);
		const review = params.reviews[reviewIndex] ?? {
			findings: [],
			openQuestions: [],
			validationNotes: [],
		};
		reviewIndex += 1;
		return {
			finalMessage: JSON.stringify(review),
			structuredOutput: review,
			threadId: "thread-review",
		};
	};
}

function buildPersistentFindingReview(): ProgramRunSliceReviewResult {
	return {
		findings: [
			{
				category: "bug",
				disposition: "must_fix",
				impact: "The fixture keeps returning the same must-fix finding.",
				minimalFix: "Resolve the fixture finding.",
				mustFix: true,
				severity: "high",
				title: "Persistent finding",
			},
		],
		openQuestions: [],
		validationNotes: [],
	};
}

async function writeRepoFile(
	repositoryRoot: string,
	repoPath: string,
	content: string,
) {
	const absolutePath = path.join(repositoryRoot, repoPath);
	await mkdir(path.dirname(absolutePath), { recursive: true });
	await writeFile(absolutePath, content, "utf8");
}
