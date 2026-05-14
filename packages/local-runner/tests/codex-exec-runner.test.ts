import { chmod, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Effect, Layer } from "effect";

import {
	CodexExecService,
	NodeCodexExecServiceLive,
	runCodexExec,
	runCodexExecEffect,
} from "../src/core/codex-exec-runner";
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

	it("supports injecting the Effect Codex exec service", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");
		const stubCodexExecService = Layer.succeed(
			CodexExecService,
			CodexExecService.of({
				run: (request) =>
					Effect.succeed({
						exitCode: 0,
						threadId: "thread_injected",
						events: [],
						finalAgentMessage: null,
						structuredOutput: {
							command: request.codexBinary,
							profile: request.profileName,
							sandbox: request.sandboxMode,
							timeoutMs: request.timeoutMs,
							allowNonGitSmoke: request.allowNonGitSmoke,
						},
						stderr: "",
						timedOut: false,
					}),
			}),
		);

		const result = await Effect.runPromise(
			runCodexExecEffect({
				prompt: "Return JSON.",
				repositoryRoot,
				codexBinary: "custom-codex",
				allowNonGitSmoke: true,
			}).pipe(Effect.provide(stubCodexExecService)),
		);

		expect(result).toMatchObject({
			exitCode: 0,
			threadId: "thread_injected",
			structuredOutput: {
				command: "custom-codex",
				profile: "sbs-doctor-readonly",
				sandbox: "read-only",
				timeoutMs: 120_000,
				allowNonGitSmoke: true,
			},
			timedOut: false,
		});
	});

	it("preserves non-zero exit codes and stderr", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");
		const codexBinary = await createCodexBinary(
			repositoryRoot,
			"codex-fails",
			[
				"#!/bin/sh",
				'if [ "$1" = "exec" ]; then',
				"  cat >/dev/null",
				'  echo "codex failed" >&2',
				"  exit 7",
				"fi",
				"exit 1",
				"",
			].join("\n"),
		);

		const result = await runCodexExec({
			prompt: "Return JSON.",
			repositoryRoot,
			codexBinary,
			timeoutMs: 1_000,
		});

		expect(result).toMatchObject({
			exitCode: 7,
			threadId: null,
			events: [],
			finalAgentMessage: null,
			structuredOutput: null,
			stderr: "codex failed\n",
			timedOut: false,
		});
	});

	it("rejects when the Codex executable is missing", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");

		await expect(
			runCodexExec({
				prompt: "Return JSON.",
				repositoryRoot,
				codexBinary: path.join(repositoryRoot, "missing-codex"),
				timeoutMs: 1_000,
			}),
		).rejects.toMatchObject({ code: "ENOENT" });
	});

	it("exposes missing Codex executable errors as catchable Effect failures", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");

		const caughtError = await Effect.runPromise(
			runCodexExecEffect({
				prompt: "Return JSON.",
				repositoryRoot,
				codexBinary: path.join(repositoryRoot, "missing-codex"),
				timeoutMs: 1_000,
			}).pipe(
				Effect.provide(NodeCodexExecServiceLive),
				Effect.catchAll((error) => Effect.succeed(error)),
			),
		);

		expect(caughtError).toMatchObject({ code: "ENOENT" });
	});

	it("rejects malformed JSONL output", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");
		const codexBinary = await createCodexBinary(
			repositoryRoot,
			"codex-malformed-jsonl",
			[
				"#!/bin/sh",
				'if [ "$1" = "exec" ]; then',
				"  cat >/dev/null",
				'  echo "not-json"',
				"  exit 0",
				"fi",
				"exit 1",
				"",
			].join("\n"),
		);

		await expect(
			runCodexExec({
				prompt: "Return JSON.",
				repositoryRoot,
				codexBinary,
				timeoutMs: 1_000,
			}),
		).rejects.toBeDefined();
	});

	it("rejects malformed structured output", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");
		const codexBinary = await createCodexBinary(
			repositoryRoot,
			"codex-malformed-structured-output",
			[
				"#!/bin/sh",
				'if [ "$1" = "exec" ]; then',
				"  cat >/dev/null",
				'  echo "{\\"type\\":\\"thread.started\\",\\"thread_id\\":\\"thread_bad_json\\"}"',
				'  echo "{\\"type\\":\\"item.completed\\",\\"item\\":{\\"id\\":\\"item_1\\",\\"type\\":\\"agent_message\\",\\"text\\":\\"not-json\\"}}"',
				"  exit 0",
				"fi",
				"exit 1",
				"",
			].join("\n"),
		);

		await expect(
			runCodexExec({
				prompt: "Return JSON.",
				repositoryRoot,
				codexBinary,
				outputSchemaPath: path.join(repositoryRoot, "schema.json"),
				timeoutMs: 1_000,
			}),
		).rejects.toBeDefined();
	});

	it("stops the Codex process when the timeout expires", async () => {
		const repositoryRoot = await createTemporaryDirectory("sbs-codex-exec-");
		const markerPath = path.join(repositoryRoot, "marker.txt");
		const codexBinary = await createCodexBinary(
			repositoryRoot,
			"codex-timeout",
			[
				"#!/usr/bin/env node",
				'const fs = require("node:fs");',
				"process.stdin.resume();",
				`setTimeout(() => fs.writeFileSync(${JSON.stringify(
					markerPath,
				)}, "written"), 500);`,
				"setTimeout(() => {}, 2_000);",
				"",
			].join("\n"),
		);

		const result = await runCodexExec({
			prompt: "Return JSON.",
			repositoryRoot,
			codexBinary,
			timeoutMs: 50,
		});

		expect(result).toMatchObject({
			exitCode: null,
			timedOut: true,
		});
		await new Promise((resolve) => setTimeout(resolve, 900));
		await expect(readFile(markerPath, "utf8")).rejects.toMatchObject({
			code: "ENOENT",
		});
	});
});

async function createCodexBinary(
	repositoryRoot: string,
	fileName: string,
	contents: string,
) {
	const codexPath = path.join(repositoryRoot, fileName);
	await writeFile(codexPath, contents);
	await chmod(codexPath, 0o755);
	return codexPath;
}
