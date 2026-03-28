import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
} from "@manmeetsai/packet-compiler";
import { runCli } from "../src/run-cli";
import { loadLocalDraft, saveLocalDraft } from "../src/draft/draft-store";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("agent workflows", () => {
	it("initializes a seeded draft with machine-readable output", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: ["init", "--fixture", "complete", "--json"],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "init",
			fixture: "complete",
			productName: "Ship by Sunday OS",
		});
	});

	it("returns schema and next-step introspection for agents", async () => {
		const repoRootPath = await createTemporaryRepoRoot();

		const schemaIo = createCliIo();
		const schemaExitCode = await runCli({
			argv: ["schema", "--json"],
			io: schemaIo.io,
			repoRootPath,
		});
		expect(schemaExitCode).toBe(0);
		expect(JSON.parse(schemaIo.stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "schema",
			fieldCount: expect.any(Number),
		});

		const nextIo = createCliIo();
		const nextExitCode = await runCli({
			argv: ["next", "--json"],
			io: nextIo.io,
			repoRootPath,
		});
		expect(nextExitCode).toBe(0);
		expect(JSON.parse(nextIo.stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "next",
			nextStageId: "product",
			nextStepId: "foundation",
		});
	});

	it("supports field-level set, append, remove, and unset mutations", async () => {
		const repoRootPath = await createTemporaryRepoRoot();

		const setIo = createCliIo();
		expect(
			await runCli({
				argv: ["set", "product.product_name", "Ship by Sunday CLI", "--json"],
				io: setIo.io,
				repoRootPath,
			}),
		).toBe(0);
		expect(JSON.parse(setIo.stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "set",
			fieldKey: "product_name",
			value: "Ship by Sunday CLI",
		});

		const appendIo = createCliIo();
		expect(
			await runCli({
				argv: ["append", "scope_in", "Packet intake", "--json"],
				io: appendIo.io,
				repoRootPath,
			}),
		).toBe(0);
		expect(JSON.parse(appendIo.stdout.join("\n"))).toMatchObject({
			command: "append",
			fieldKey: "scope_in",
			value: ["Packet intake"],
		});

		const removeIo = createCliIo();
		expect(
			await runCli({
				argv: ["remove", "scope_in", "Packet intake", "--json"],
				io: removeIo.io,
				repoRootPath,
			}),
		).toBe(0);
		expect(JSON.parse(removeIo.stdout.join("\n"))).toMatchObject({
			command: "remove",
			fieldKey: "scope_in",
			value: null,
		});

		const unsetIo = createCliIo();
		expect(
			await runCli({
				argv: ["unset", "product_name", "--json"],
				io: unsetIo.io,
				repoRootPath,
			}),
		).toBe(0);
		expect(JSON.parse(unsetIo.stdout.join("\n"))).toMatchObject({
			command: "unset",
			fieldKey: "product_name",
			value: null,
		});
	});

	it("supports atomic bulk mutation from a file", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const operationsFilePath = path.join(repoRootPath, "mutations.json");
		await writeFile(
			operationsFilePath,
			JSON.stringify(
				{
					operations: [
						{
							op: "set",
							field: "product.product_name",
							value: "Bulk Agent CLI",
						},
						{
							op: "append",
							field: "scope_in",
							value: "Atomic batch update",
						},
					],
				},
				null,
				2,
			),
		);

		const { io, stdout } = createCliIo();
		const exitCode = await runCli({
			argv: ["mutate", "--file", operationsFilePath, "--json"],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "mutate",
			operationCount: 2,
			fields: ["product_name", "scope_in"],
			productName: "Bulk Agent CLI",
		});
	});

	it("fails a bulk mutation atomically when one operation is invalid", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const operationsFilePath = path.join(
			repoRootPath,
			"invalid-mutations.json",
		);
		await writeFile(
			operationsFilePath,
			JSON.stringify(
				[
					{
						op: "set",
						field: "product.product_name",
						value: "Should not persist",
					},
					{
						op: "append",
						field: "product_name",
						value: "Invalid append",
					},
				],
				null,
				2,
			),
		);

		const { io, stderr } = createCliIo();
		const exitCode = await runCli({
			argv: ["mutate", "--file", operationsFilePath, "--json"],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(2);
		expect(stderr.join("")).toContain('"error_code": "invalid_args"');
		expect(
			(await loadLocalDraft(repoRootPath))?.facts.product_name,
		).toBeUndefined();
	});

	it("exports the draft to stdout for piping", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const seedFilePath = path.join(repoRootPath, "complete.json");
		await writeFile(
			seedFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);

		await runCli({
			argv: ["import", "--file", seedFilePath],
			io: createCliIo().io,
			repoRootPath,
		});

		const { io, stdout } = createCliIo();
		const exitCode = await runCli({
			argv: ["export", "--out", "-"],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			facts: {
				product_name: "Ship by Sunday OS",
			},
		});
	});

	it("filters review output by stage and missing-only mode", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(
			repoRootPath,
			createCanonicalProjectDefinitionDraft({
				clerkUserId: "local-cli-user",
				productKey: "ship-by-sunday",
				facts: {
					product_name: "Ship by Sunday OS",
					product_summary: "A packet-first CLI for starter repo generation.",
					primary_user: "Solo founder",
					why_this_matters: "The packet should exist outside the web app.",
					problem_statement:
						"Planning is vague without a stable intake contract.",
					problem_context_when: "During founder planning",
					problem_context_where: "Inside the repo root",
					problem_trigger: "Need a build-ready snapshot",
					problem_severity: "8",
					problem_urgency: "This week",
					outcome_statement: "Ship a starter snapshot from the CLI.",
					success_looks_like: "A founder gets a repo directory and zip.",
					user_benefit: "They can move directly into implementation.",
					evidence_summary: "Internal repo testing proves the flow is useful.",
					core_flow_summary:
						"Capture facts, review readiness, generate output.",
					scope_in: ["Packet intake"],
					scope_out: ["No mobile app"],
					non_goals: ["No billing wizard"],
					v1_rationale: "Packet-first scope keeps the CLI small.",
				},
			}),
		);
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: ["review", "--stage", "build-plan", "--missing-only", "--json"],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			firstIncompleteStageId: "design",
			stageStatuses: [
				{
					stageId: "build-plan",
					isComplete: false,
				},
			],
		});
	});

	it("returns machine-readable generation metadata", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const seedFilePath = path.join(repoRootPath, "complete.json");
		await writeFile(
			seedFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);

		await runCli({
			argv: ["import", "--file", seedFilePath],
			io: createCliIo().io,
			repoRootPath,
		});

		const { io, stdout } = createCliIo();
		const exitCode = await runCli({
			argv: [
				"generate",
				"--out",
				path.join(repoRootPath, "repo-output"),
				"--json",
			],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "generate",
			mode: "directory",
			repoName: "ship-by-sunday-os",
		});
	});

	it("returns a blocked dry-run payload when generation is not ready", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: [
				"generate",
				"--out",
				path.join(repoRootPath, "repo-output"),
				"--dry-run",
				"--json",
			],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "generate",
			reviewReady: false,
			mode: "directory",
			blockers: expect.any(Array),
		});
	});
});
