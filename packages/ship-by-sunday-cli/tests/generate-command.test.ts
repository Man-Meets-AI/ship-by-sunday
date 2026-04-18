import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
	buildDesignPresetFactSeed,
	createCompleteProjectDefinition,
} from "@shipbysunday/blueprint-compiler";
import {
	importDraftFromFile,
	saveLocalDraft,
	createLocalDraftDefinition,
} from "../src/draft/draft-store";
import { runCli } from "../src/run-cli";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("generate command", () => {
	it("rejects incomplete drafts", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(
			projectRootPath,
			createLocalDraftDefinition({
				product_name: "Ship by Sunday OS",
			}),
		);
		const { io, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["generate", "--out", path.join(projectRootPath, "out")],
			io,
			projectRootPath,
		});

		expect(exitCode).toBe(5);
		expect(stderr.join("")).toContain("Draft is not review-ready.");
	});

	it("writes a slugified repo directory and refuses overwrite without force", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(
			projectRootPath,
			"complete.json",
		);
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(projectRootPath, completeDefinitionFilePath);

		const { io } = createCliIo();
		const outputPath = path.join(projectRootPath, "generated");

		const firstExitCode = await runCli({
			argv: ["generate", "--out", outputPath],
			io,
			projectRootPath,
		});
		expect(firstExitCode).toBe(0);
		await expect(
			access(path.join(outputPath, "ship-by-sunday-os", "docs", "index.md")),
		).resolves.toBeUndefined();

		const secondAttemptIo = createCliIo();
		const secondExitCode = await runCli({
			argv: ["generate", "--out", outputPath],
			io: secondAttemptIo.io,
			projectRootPath,
		});
		expect(secondExitCode).toBe(3);
		expect(secondAttemptIo.stderr.join("")).toContain("already exists");
	});

	it("creates parent directories for nested directory output paths", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(
			projectRootPath,
			"complete.json",
		);
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(projectRootPath, completeDefinitionFilePath);

		const nestedOutputPath = path.join(
			projectRootPath,
			"tmp",
			"nested",
			"repo",
		);
		const { io } = createCliIo();
		const exitCode = await runCli({
			argv: ["generate", "--out", nestedOutputPath, "--force"],
			io,
			projectRootPath,
		});

		expect(exitCode).toBe(0);
		await expect(
			access(
				path.join(nestedOutputPath, "ship-by-sunday-os", "docs", "index.md"),
			),
		).resolves.toBeUndefined();
	});

	it("keeps sibling files when forcing directory generation", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(
			projectRootPath,
			"complete.json",
		);
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(projectRootPath, completeDefinitionFilePath);

		const outputPath = path.join(projectRootPath, "generated");
		await mkdir(outputPath, { recursive: true });
		await writeFile(path.join(outputPath, "keep.txt"), "keep");

		const initialGenerateIo = createCliIo();
		expect(
			await runCli({
				argv: ["generate", "--out", outputPath],
				io: initialGenerateIo.io,
				projectRootPath,
			}),
		).toBe(0);

		const forceGenerateIo = createCliIo();
		expect(
			await runCli({
				argv: ["generate", "--out", outputPath, "--force"],
				io: forceGenerateIo.io,
				projectRootPath,
			}),
		).toBe(0);

		await expect(
			access(path.join(outputPath, "keep.txt")),
		).resolves.toBeUndefined();
		await expect(
			access(path.join(outputPath, "ship-by-sunday-os", "docs", "index.md")),
		).resolves.toBeUndefined();
	});

	it("returns an invalid_state error when directory output points at a file", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(
			projectRootPath,
			"complete.json",
		);
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(projectRootPath, completeDefinitionFilePath);

		const outputPath = path.join(projectRootPath, "generated-file");
		await writeFile(outputPath, "not a directory");

		const { io, stderr } = createCliIo();
		const exitCode = await runCli({
			argv: ["generate", "--out", outputPath, "--json"],
			io,
			projectRootPath,
		});

		expect(exitCode).toBe(1);
		expect(stderr.join("")).toContain('"error_code": "invalid_state"');
		expect(stderr.join("")).toContain(outputPath);
	});

	it("returns an invalid_state error when zip output points at a directory", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(
			projectRootPath,
			"complete.json",
		);
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(projectRootPath, completeDefinitionFilePath);

		const outputPath = path.join(projectRootPath, "generated.zip");
		await mkdir(outputPath, { recursive: true });

		const { io, stderr } = createCliIo();
		const exitCode = await runCli({
			argv: ["generate", "--out", outputPath, "--zip", "--json"],
			io,
			projectRootPath,
		});

		expect(exitCode).toBe(1);
		expect(stderr.join("")).toContain('"error_code": "invalid_state"');
		expect(stderr.join("")).toContain(outputPath);
	});

	it("generates canonical design output from the selected design preset", async () => {
		const projectRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(
			projectRootPath,
			createLocalDraftDefinition({
				product_name: "Preset Test",
				product_summary: "Preset-aware CLI generation",
				primary_user: "Developers",
				problem_statement: "They need a trustworthy design starting point.",
				problem_trigger:
					"When the UI still feels generic after the first build.",
				problem_severity: "8",
				success_looks_like:
					"The repo ships with the intended design direction.",
				core_flow: ["Choose preset", "Generate repo"],
				pricing: 99,
				design_preset_id: "notion",
			}),
		);

		const { io } = createCliIo();
		const outputPath = path.join(projectRootPath, "generated");
		const exitCode = await runCli({
			argv: ["generate", "--out", outputPath, "--force"],
			io,
			projectRootPath,
		});

		expect(exitCode).toBe(0);
		const generatedProjectDefinition = JSON.parse(
			await readFile(
				path.join(
					outputPath,
					"preset-test",
					"docs",
					"facts",
					"project-definition.json",
				),
				"utf8",
			),
		);
		expect(generatedProjectDefinition.facts.design_preset_id).toBe("notion");
		expect(generatedProjectDefinition.facts.theme_preset).toBe(
			buildDesignPresetFactSeed("notion").theme_preset,
		);
		expect(generatedProjectDefinition.facts.design_references).toEqual([
			"https://getdesign.md/notion/design-md",
		]);
	});
});
