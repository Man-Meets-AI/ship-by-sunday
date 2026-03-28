import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import { createCompleteProjectDefinition } from "@manmeetsai/packet-compiler";
import {
	importDraftFromFile,
	saveLocalDraft,
	createLocalDraftDefinition,
} from "../src/draft/draft-store";
import { runCli } from "../src/run-cli";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

describe("generate command", () => {
	it("rejects incomplete drafts", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		await saveLocalDraft(
			repoRootPath,
			createLocalDraftDefinition({
				product_name: "Ship by Sunday OS",
			}),
		);
		const { io, stderr } = createCliIo();

		const exitCode = await runCli({
			argv: ["generate", "--out", path.join(repoRootPath, "out")],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(5);
		expect(stderr.join("")).toContain("Draft is not review-ready.");
	});

	it("writes a slugified repo directory and refuses overwrite without force", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(repoRootPath, "complete.json");
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(repoRootPath, completeDefinitionFilePath);

		const { io } = createCliIo();
		const outputPath = path.join(repoRootPath, "generated");

		const firstExitCode = await runCli({
			argv: ["generate", "--out", outputPath],
			io,
			repoRootPath,
		});
		expect(firstExitCode).toBe(0);
		await expect(
			access(path.join(outputPath, "ship-by-sunday-os", "docs", "README.md")),
		).resolves.toBeUndefined();

		const secondAttemptIo = createCliIo();
		const secondExitCode = await runCli({
			argv: ["generate", "--out", outputPath],
			io: secondAttemptIo.io,
			repoRootPath,
		});
		expect(secondExitCode).toBe(3);
		expect(secondAttemptIo.stderr.join("")).toContain("already exists");
	});

	it("creates parent directories for nested directory output paths", async () => {
		const repoRootPath = await createTemporaryRepoRoot();
		const completeDefinitionFilePath = path.join(repoRootPath, "complete.json");
		await writeFile(
			completeDefinitionFilePath,
			JSON.stringify(createCompleteProjectDefinition(), null, 2),
		);
		await importDraftFromFile(repoRootPath, completeDefinitionFilePath);

		const nestedOutputPath = path.join(repoRootPath, "tmp", "nested", "repo");
		const { io } = createCliIo();
		const exitCode = await runCli({
			argv: ["generate", "--out", nestedOutputPath, "--force"],
			io,
			repoRootPath,
		});

		expect(exitCode).toBe(0);
		await expect(
			access(
				path.join(nestedOutputPath, "ship-by-sunday-os", "docs", "README.md"),
			),
		).resolves.toBeUndefined();
	});
});
