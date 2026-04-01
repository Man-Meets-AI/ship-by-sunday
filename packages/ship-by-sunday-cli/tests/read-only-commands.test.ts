import { access } from "node:fs/promises";
import path from "node:path";
import { runCli } from "../src/run-cli";
import { createCliIo, createTemporaryRepoRoot } from "./test-helpers";

async function expectMissingDraftCommand(command: string[]) {
	const projectRootPath = await createTemporaryRepoRoot();
	const { io, stderr } = createCliIo();

	const exitCode = await runCli({
		argv: [...command, "--json"],
		io,
		projectRootPath,
	});

	expect(exitCode).toBe(4);
	expect(JSON.parse(stderr.join("\n"))).toMatchObject({
		status: "error",
		error_code: "missing_draft",
	});
	await expect(
		access(path.join(projectRootPath, ".ship-by-sunday")),
	).rejects.toBeDefined();
}

describe("read-only commands", () => {
	it("next does not create a draft when none exists", async () => {
		await expectMissingDraftCommand(["next"]);
	});

	it("validate does not create a draft when none exists", async () => {
		await expectMissingDraftCommand(["validate"]);
	});

	it("review does not create a draft when none exists", async () => {
		await expectMissingDraftCommand(["review"]);
	});
});
