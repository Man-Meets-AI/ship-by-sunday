import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { Context, Effect, Layer } from "effect";

import type { JsonObject, JsonValue } from "./json-value";
import { writeLocalCodexThreadState } from "./local-project-state";
import {
	normalizeLocalRunnerEffectError,
	runLocalRunnerEffect,
} from "../effect/runtime";

type JsonRecord = JsonObject;

export type CodexExecJsonEvent = JsonRecord;
export type CodexExecEventHandler = (event: CodexExecJsonEvent) => void;

export type CodexExecRunnerResult = {
	exitCode: number | null;
	threadId: string | null;
	events: JsonRecord[];
	eventLogPath?: string;
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
	eventLogPath?: string;
	onEvent?: CodexExecEventHandler;
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
	eventLogPath?: string;
	onEvent?: CodexExecEventHandler;
};

type CodexExecProcessResult = {
	events: JsonRecord[];
	exitCode: number | null;
	eventLogPath?: string;
	stderr: string;
	timedOut: boolean;
};

export interface CodexExecService {
	readonly run: (
		request: ResolvedCodexExecRequest,
	) => Effect.Effect<CodexExecRunnerResult, Error>;
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
): Effect.Effect<CodexExecRunnerResult, Error, CodexExecService> {
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
	eventLogPath,
	onEvent,
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
		eventLogPath,
		onEvent,
	};
}

function runNodeCodexExec(
	request: ResolvedCodexExecRequest,
): Effect.Effect<CodexExecRunnerResult, Error> {
	return Effect.flatMap(spawnCodexExecProcess(request), (processResult) =>
		Effect.tryPromise({
			try: async () => {
				const events = processResult.events;
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
					eventLogPath: processResult.eventLogPath,
					finalAgentMessage,
					structuredOutput,
					stderr: processResult.stderr,
					timedOut: processResult.timedOut,
				};
			},
			catch: normalizeLocalRunnerEffectError,
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
	eventLogPath,
	onEvent,
}: ResolvedCodexExecRequest): Effect.Effect<CodexExecProcessResult, Error> {
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
				const eventLogStream = eventLogPath
					? createWriteStream(eventLogPath, { flags: "a" })
					: null;

				let stdout = "";
				let stdoutBuffer = "";
				let stderr = "";
				let eventLogError: Error | null = null;
				let jsonlParseError: Error | null = null;
				let timedOut = false;
				let settled = false;
				const events: JsonRecord[] = [];

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
				const closeEventLog = (callback: () => void) => {
					if (!eventLogStream || eventLogStream.closed) {
						callback();
						return;
					}
					eventLogStream.end(callback);
				};
				const timeout = setTimeout(() => {
					timedOut = true;
					child.kill("SIGTERM");
				}, timeoutMs);

				signal.addEventListener("abort", interruptProcess, { once: true });
				eventLogStream?.once("error", (error) => {
					eventLogError = error;
					child.kill("SIGTERM");
				});

				child.stdout.on("data", (chunk: Buffer) => {
					const text = chunk.toString("utf8");
					stdout += text;
					stdoutBuffer += text;
					stdoutBuffer = consumeCompleteJsonlLines(stdoutBuffer, (line) => {
						const event = parseJsonlLine(line, stdout);
						if (event instanceof Error) {
							jsonlParseError ??= event;
							child.kill("SIGTERM");
							return;
						}
						if (!event) {
							return;
						}
						events.push(event);
						eventLogStream?.write(`${line.trim()}\n`);
						try {
							onEvent?.(event);
						} catch (error) {
							jsonlParseError ??=
								error instanceof Error
									? error
									: new Error(
											`Codex exec event handler failed: ${String(error)}`,
										);
							child.kill("SIGTERM");
						}
					});
				});
				child.stderr.on("data", (chunk: Buffer) => {
					stderr += chunk.toString("utf8");
				});
				child.once("error", (error) =>
					finish(() => {
						closeEventLog(() => reject(error));
					}),
				);
				child.once("close", (exitCode) =>
					finish(() => {
						const trailingEvent = parseTrailingJsonlLine(stdoutBuffer, stdout);
						if (trailingEvent instanceof Error) {
							jsonlParseError ??= trailingEvent;
						} else if (trailingEvent) {
							events.push(trailingEvent);
							eventLogStream?.write(`${stdoutBuffer.trim()}\n`);
							try {
								onEvent?.(trailingEvent);
							} catch (error) {
								jsonlParseError ??=
									error instanceof Error
										? error
										: new Error(
												`Codex exec event handler failed: ${String(error)}`,
											);
							}
						}
						closeEventLog(() => {
							if (eventLogError) {
								reject(eventLogError);
								return;
							}
							if (jsonlParseError) {
								reject(jsonlParseError);
								return;
							}
							resolve({
								events,
								eventLogPath,
								exitCode,
								stderr,
								timedOut,
							});
						});
					}),
				);

				child.stdin.write(prompt);
				child.stdin.end();

				if (signal.aborted) {
					interruptProcess();
				}
			}),
		catch: normalizeLocalRunnerEffectError,
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

export function summarizeCodexExecJsonEvent(event: CodexExecJsonEvent) {
	const eventType = readString(event.type) ?? "codex.event";
	const item = readJsonObject(event.item);
	const itemType = readString(item?.type);
	const label = itemType ? `${eventType} ${itemType}` : eventType;
	const detail =
		readCodexThreadId(event) ??
		readString(item?.name) ??
		readString(item?.command) ??
		readString(item?.text) ??
		readString(event.message);
	if (!detail) {
		return label;
	}
	return `${label}: ${trimInlineDetail(detail, 180)}`;
}

export function readCodexThreadId(event: CodexExecJsonEvent) {
	const threadId = event.thread_id;
	return typeof threadId === "string" ? threadId : null;
}

function consumeCompleteJsonlLines(
	buffer: string,
	consumeLine: (line: string) => void,
) {
	let nextNewlineIndex = buffer.indexOf("\n");
	while (nextNewlineIndex !== -1) {
		const line = buffer.slice(0, nextNewlineIndex).replace(/\r$/, "");
		consumeLine(line);
		buffer = buffer.slice(nextNewlineIndex + 1);
		nextNewlineIndex = buffer.indexOf("\n");
	}
	return buffer;
}

function parseTrailingJsonlLine(buffer: string, stdout: string) {
	if (buffer.trim() === "") {
		return null;
	}
	return parseJsonlLine(buffer, stdout);
}

function parseJsonlLine(line: string, stdout: string) {
	const trimmedLine = line.trim();
	if (trimmedLine === "") {
		return null;
	}
	try {
		return JSON.parse(trimmedLine) as JsonRecord;
	} catch (error) {
		return new Error(
			[
				"Failed to parse Codex exec JSONL event.",
				error instanceof Error ? error.message : String(error),
				`Line: ${trimOutputTail(trimmedLine, 500)}`,
				`Stdout tail: ${trimOutputTail(stdout, 1_000)}`,
			].join("\n"),
		);
	}
}

function readJsonObject(value: JsonValue | undefined): JsonObject | null {
	return value !== null && typeof value === "object" && !Array.isArray(value)
		? (value as JsonObject)
		: null;
}

function readString(value: JsonValue | undefined) {
	return typeof value === "string" && value.trim() !== "" ? value : null;
}

function trimInlineDetail(value: string, maxLength: number) {
	const normalizedValue = value.replace(/\s+/g, " ").trim();
	if (normalizedValue.length <= maxLength) {
		return normalizedValue;
	}
	return `${normalizedValue.slice(0, maxLength - 1)}...`;
}

function trimOutputTail(value: string, maxLength: number) {
	if (value.length <= maxLength) {
		return value;
	}
	return value.slice(value.length - maxLength);
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
