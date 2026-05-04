import { readFile } from "node:fs/promises";
import path from "node:path";

import { runCodexExec } from "../src/core/codex-exec-runner";
import { readLocalCodexThreadState } from "../src/core/local-project-state";
import { createFakeRunnerBin, createTemporaryDirectory } from "./test-utils";

describe("codex exec runner", () => {
	const originalPath = process.env.PATH;
	const originalArgsFile = process.env.CODEX_ARGS_FILE;

	afterEach(() => {
		process.env.PATH = originalPath;
		if (originalArgsFile === undefined) {
			delete process.env.CODEX_ARGS_FILE;
		} else {
			process.env.CODEX_ARGS_FILE = originalArgsFile;
		}
	});

	it("uses codex exec --json and parses JSONL events", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");
		const argsFile = path.join(repositoryRoot, "args.txt");
		const { binDirectory } = await createFakeRunnerBin({
			codexArgsFile: argsFile,
		});
		process.env.PATH = `${binDirectory}${path.delimiter}${originalPath}`;
		process.env.CODEX_ARGS_FILE = argsFile;

		const result = await runCodexExec({
			prompt: "Return JSON.",
			repositoryRoot,
			outputSchemaPath: path.join(repositoryRoot, "schema.json"),
			allowNonGitSmoke: true,
		});
		const args = await readFile(argsFile, "utf8");
		const threadState = await readLocalCodexThreadState(repositoryRoot);

		expect(result.threadId).toBe("thread_test");
		expect(result.structuredOutput).toEqual({ ok: true });
		expect(threadState).toMatchObject({
			threadId: "thread_test",
			profileName: "sbs-doctor-readonly",
			sandboxMode: "read-only",
		});
		expect(args).toContain("exec\n--json\n");
		expect(args).toContain("--sandbox\nread-only\n");
		expect(args).toContain("--skip-git-repo-check\n");
		expect(args).not.toContain("dangerously");
	});
});
