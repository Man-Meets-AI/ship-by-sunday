import { spawn } from "node:child_process";
import { Context, Effect, Layer } from "effect";

import type { JsonObject, JsonValue } from "./json-value";
import { writeLocalCodexThreadState } from "./local-project-state";
import { runLocalRunnerEffect } from "../effect/runtime";

type JsonRecord = JsonObject;

export type CodexExecRunnerResult = {
	exitCode: number | null;
	threadId: string | null;
	events: JsonRecord[];
	finalAgentMessage: string | null;
	structuredOutput: JsonValue;
	stderr: string;
	timedOut: boolean;
};

export type CodexExecRequest = {
	prompt: string;
	repositoryRoot: string;
	profileName?: string;
	sandboxMode?: "read-only" | "workspace-write";
	outputSchemaPath?: string;
	timeoutMs?: number;
	codexBinary?: string;
	allowNonGitSmoke?: boolean;
};

type ResolvedCodexExecRequest = {
	prompt: string;
	repositoryRoot: string;
	profileName: string;
	sandboxMode: "read-only" | "workspace-write";
	outputSchemaPath?: string;
	timeoutMs: number;
	codexBinary: string;
	allowNonGitSmoke: boolean;
};

type CodexExecProcessResult = {
	exitCode: number | null;
	stdout: string;
	stderr: string;
	timedOut: boolean;
};

export interface CodexExecService {
	readonly run: (
		request: ResolvedCodexExecRequest,
	) => Effect.Effect<CodexExecRunnerResult, unknown>;
}

export const CodexExecService = Context.GenericTag<CodexExecService>(
	"ship-by-sunday/CodexExecService",
);

export const NodeCodexExecServiceLive = Layer.succeed(
	CodexExecService,
	CodexExecService.of({
		run: runNodeCodexExec,
	}),
);

export function runCodexExecEffect(
	request: CodexExecRequest,
): Effect.Effect<CodexExecRunnerResult, unknown, CodexExecService> {
	const resolvedRequest = resolveCodexExecRequest(request);

	return Effect.flatMap(CodexExecService, (service) =>
		service.run(resolvedRequest),
	);
}

export async function runCodexExec(
	request: CodexExecRequest,
): Promise<CodexExecRunnerResult> {
	return await runLocalRunnerEffect(
		runCodexExecEffect(request).pipe(Effect.provide(NodeCodexExecServiceLive)),
	);
}

function resolveCodexExecRequest({
	prompt,
	repositoryRoot,
	profileName = "sbs-doctor-readonly",
	sandboxMode = "read-only",
	outputSchemaPath,
	timeoutMs = 120_000,
	codexBinary = "codex",
	allowNonGitSmoke = false,
}: CodexExecRequest): ResolvedCodexExecRequest {
	return {
		prompt,
		repositoryRoot,
		profileName,
		sandboxMode,
		outputSchemaPath,
		timeoutMs,
		codexBinary,
		allowNonGitSmoke,
	};
}

function runNodeCodexExec(
	request: ResolvedCodexExecRequest,
): Effect.Effect<CodexExecRunnerResult, unknown> {
	return Effect.flatMap(spawnCodexExecProcess(request), (processResult) =>
		Effect.tryPromise({
			try: async () => {
				const events = parseJsonlEvents(processResult.stdout);
				const threadId = findThreadId(events);
				const finalAgentMessage = findFinalAgentMessage(events);
				const structuredOutput =
					request.outputSchemaPath && finalAgentMessage
						? JSON.parse(finalAgentMessage)
						: null;

				if (threadId) {
					await writeLocalCodexThreadState(request.repositoryRoot, {
						schemaVersion: 1,
						threadId,
						profileName: request.profileName,
						sandboxMode: request.sandboxMode,
						outputSchemaPath: request.outputSchemaPath,
						updatedAt: Date.now(),
					});
				}

				return {
					exitCode: processResult.exitCode,
					threadId,
					events,
					finalAgentMessage,
					structuredOutput,
					stderr: processResult.stderr,
					timedOut: processResult.timedOut,
				};
			},
			catch: (error) => error,
		}),
	);
}

function spawnCodexExecProcess({
	prompt,
	repositoryRoot,
	profileName,
	sandboxMode,
	outputSchemaPath,
	timeoutMs,
	codexBinary,
	allowNonGitSmoke,
}: ResolvedCodexExecRequest): Effect.Effect<CodexExecProcessResult, unknown> {
	const args = [
		"exec",
		"--json",
		"--cd",
		repositoryRoot,
		"--profile",
		profileName,
		"--sandbox",
		sandboxMode,
	];
	if (allowNonGitSmoke) {
		args.push("--skip-git-repo-check");
	}
	if (outputSchemaPath) {
		args.push("--output-schema", outputSchemaPath);
	}

	return Effect.tryPromise({
		try: (signal) =>
			new Promise<CodexExecProcessResult>((resolve, reject) => {
				const child = spawn(codexBinary, args, {
					stdio: ["pipe", "pipe", "pipe"],
					env: buildCodexExecEnvironment(),
				});

				let stdout = "";
				let stderr = "";
				let timedOut = false;
				let settled = false;

				const finish = (callback: () => void) => {
					if (settled) {
						return;
					}
					settled = true;
					clearTimeout(timeout);
					signal.removeEventListener("abort", interruptProcess);
					callback();
				};
				const interruptProcess = () => {
					child.kill("SIGTERM");
				};
				const timeout = setTimeout(() => {
					timedOut = true;
					child.kill("SIGTERM");
				}, timeoutMs);

				signal.addEventListener("abort", interruptProcess, { once: true });

				child.stdout.on("data", (chunk: Buffer) => {
					stdout += chunk.toString("utf8");
				});
				child.stderr.on("data", (chunk: Buffer) => {
					stderr += chunk.toString("utf8");
				});
				child.once("error", (error) =>
					finish(() => {
						reject(error);
					}),
				);
				child.once("close", (exitCode) =>
					finish(() => {
						resolve({
							exitCode,
							stdout,
							stderr,
							timedOut,
						});
					}),
				);

				child.stdin.write(prompt);
				child.stdin.end();

				if (signal.aborted) {
					interruptProcess();
				}
			}),
		catch: (error) => error,
	});
}

function buildCodexExecEnvironment(): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {};
	for (const key of [
		"CODEX_HOME",
		"HOME",
		"LANG",
		"LC_ALL",
		"PATH",
		"SHELL",
		"TERM",
		"TMPDIR",
		"USER",
	] as const) {
		const value = process.env[key];
		if (value) {
			env[key] = value;
		}
	}
	return env;
}

export function parseJsonlEvents(stdout: string) {
	return stdout
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => JSON.parse(line) as JsonRecord);
}

function findThreadId(events: JsonRecord[]) {
	const event = events.find((candidate) => candidate.type === "thread.started");
	const threadId = event?.thread_id;
	return typeof threadId === "string" ? threadId : null;
}

function findFinalAgentMessage(events: JsonRecord[]) {
	let finalAgentMessage: string | null = null;
	for (const event of events) {
		if (event.type !== "item.completed") {
			continue;
		}

		const item = event.item as JsonRecord | undefined;
		if (item?.type === "agent_message" && typeof item.text === "string") {
			finalAgentMessage = item.text;
		}
	}

	return finalAgentMessage;
}
