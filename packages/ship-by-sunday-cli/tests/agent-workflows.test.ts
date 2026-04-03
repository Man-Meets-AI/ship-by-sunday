import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createCompleteProjectDefinition } from "@manmeetsai/blueprint-compiler";
import { runCli } from "../src/run-cli";
import {
	createLocalDraftDefinition,
	loadLocalDraft,
	saveLocalDraft,
} from "../src/draft/draft-store";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("agent workflows", () => {
	it("initializes a seeded draft with machine-readable output", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: ["init", "--fixture", "complete", "--json"],
			io,
			projectRootPath: repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "init",
			fixture: "complete",
			productName: "Ship by Sunday OS",
		});
	});

	it("returns a stable invalid_args payload for an unknown init fixture", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const { io, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["init", "--fixture", "nope", "--json"],
			io,
			projectRootPath: repoRootPath,
		});

		expect(exitCode).toBe(2);
		expect(JSON.parse(stderr.join("\n"))).toMatchObject({
			status: "error",
			command: "init",
			error_code: "invalid_args",
		});
	});

	it("returns schema and next-step introspection for agents", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(repoRootPath, createLocalDraftDefinition());

		const schemaIo = createCliIo();
		const schemaExitCode = await runCli({
			argv: ["schema", "--json"],
			io: schemaIo.io,
			projectRootPath: repoRootPath,
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
			projectRootPath: repoRootPath,
		});
		expect(nextExitCode).toBe(0);
		expect(JSON.parse(nextIo.stdout.join("\n"))).toMatchObject({
			status: "ok",
			command: "next",
			nextStageId: "blueprint",
			nextStepId: "foundation",
		});

		const fieldsIo = createCliIo();
		const fieldsExitCode = await runCli({
			argv: ["fields", "--stage", "blueprint", "--json"],
			io: fieldsIo.io,
			projectRootPath: repoRootPath,
		});
		expect(fieldsExitCode).toBe(0);
		const fieldsResult = JSON.parse(fieldsIo.stdout.join("\n"));
		expect(
			fieldsResult.fields.map((field: { fieldKey: string }) => field.fieldKey),
		).toContain("theme_hex");
		expect(
			fieldsResult.fields.map((field: { fieldKey: string }) => field.fieldKey),
		).toContain("design_references");
		expect(
			fieldsResult.fields.map((field: { fieldKey: string }) => field.fieldKey),
		).not.toContain("surface_type");

		expect(
			fieldsResult.fields.map((field: { fieldKey: string }) => field.fieldKey),
		).toContain("pricing");
		expect(
			fieldsResult.fields.map((field: { fieldKey: string }) => field.fieldKey),
		).toContain("contact_email");
	});

	it("supports field-level set, append, remove, and unset mutations", async () => {
		const repoRootPath = await createTemporaryRepoRoot();

		const setIo = createCliIo();
		expect(
			await runCli({
				argv: ["set", "blueprint.product_name", "Ship by Sunday CLI", "--json"],
				io: setIo.io,
				projectRootPath: repoRootPath,
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
				argv: ["append", "scope_in", "Blueprint intake", "--json"],
				io: appendIo.io,
				projectRootPath: repoRootPath,
			}),
		).toBe(0);
		expect(JSON.parse(appendIo.stdout.join("\n"))).toMatchObject({
			command: "append",
			fieldKey: "scope_in",
			value: ["Blueprint intake"],
		});

		const removeIo = createCliIo();
		expect(
			await runCli({
				argv: ["remove", "scope_in", "Blueprint intake", "--json"],
				io: removeIo.io,
				projectRootPath: repoRootPath,
			}),
		).toBe(0);
		expect(JSON.parse(removeIo.stdout.join("\n"))).toMatchObject({
			command: "remove",
			fieldKey: "scope_in",
			value: [],
		});

		const unsetIo = createCliIo();
		expect(
			await runCli({
				argv: ["unset", "product_name", "--json"],
				io: unsetIo.io,
				projectRootPath: repoRootPath,
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
							field: "blueprint.product_name",
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
			projectRootPath: repoRootPath,
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
						field: "blueprint.product_name",
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
			projectRootPath: repoRootPath,
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
			projectRootPath: repoRootPath,
		});

		const { io, stdout } = createCliIo();
		const exitCode = await runCli({
			argv: ["export", "--out", "-"],
			io,
			projectRootPath: repoRootPath,
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
			createLocalDraftDefinition({
				product_name: "Ship by Sunday OS",
				product_summary: "A blueprint-first CLI for starter repo generation.",
				primary_user: "Solo founder",
				problem_statement:
					"Planning is vague without a stable intake contract.",
				problem_trigger: "During founder planning",
				problem_severity: "8",
				success_looks_like: "A founder gets a repo directory and zip.",
				core_flow: ["Capture facts", "Review readiness", "Generate output"],
			}),
		);
		const { io, stdout } = createCliIo();

		const exitCode = await runCli({
			argv: ["review", "--stage", "blueprint", "--missing-only", "--json"],
			io,
			projectRootPath: repoRootPath,
		});

		expect(exitCode).toBe(0);
		expect(JSON.parse(stdout.join("\n"))).toMatchObject({
			status: "ok",
			firstIncompleteStageId: "blueprint",
			stageStatuses: [
				{
					stageId: "blueprint",
					isComplete: false,
					missingFactKeys: ["pricing"],
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
			projectRootPath: repoRootPath,
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
			projectRootPath: repoRootPath,
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
			projectRootPath: repoRootPath,
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
