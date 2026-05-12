import { spawn } from "node:child_process";

import type { JsonObject, JsonValue } from "./json-value";
import { writeLocalCodexThreadState } from "./local-project-state";

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

export async function runCodexExec({
	prompt,
	repositoryRoot,
	profileName = "sbs-doctor-readonly",
	sandboxMode = "read-only",
	outputSchemaPath,
	timeoutMs = 120_000,
	codexBinary = "codex",
	allowNonGitSmoke = false,
}: {
	prompt: string;
	repositoryRoot: string;
	profileName?: string;
	sandboxMode?: "read-only" | "workspace-write";
	outputSchemaPath?: string;
	timeoutMs?: number;
	codexBinary?: string;
	allowNonGitSmoke?: boolean;
}): Promise<CodexExecRunnerResult> {
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

	const child = spawn(codexBinary, args, {
		stdio: ["pipe", "pipe", "pipe"],
		env: buildCodexExecEnvironment(),
	});
	child.stdin.write(prompt);
	child.stdin.end();

	let stdout = "";
	let stderr = "";
	let timedOut = false;
	const timeout = setTimeout(() => {
		timedOut = true;
		child.kill("SIGTERM");
	}, timeoutMs);

	child.stdout.on("data", (chunk: Buffer) => {
		stdout += chunk.toString("utf8");
	});
	child.stderr.on("data", (chunk: Buffer) => {
		stderr += chunk.toString("utf8");
	});

	const exitCode = await new Promise<number | null>((resolve, reject) => {
		child.once("error", reject);
		child.once("close", resolve);
	}).finally(() => clearTimeout(timeout));

	const events = parseJsonlEvents(stdout);
	const threadId = findThreadId(events);
	const finalAgentMessage = findFinalAgentMessage(events);
	const structuredOutput =
		outputSchemaPath && finalAgentMessage
			? JSON.parse(finalAgentMessage)
			: null;

	if (threadId) {
		await writeLocalCodexThreadState(repositoryRoot, {
			schemaVersion: 1,
			threadId,
			profileName,
			sandboxMode,
			outputSchemaPath,
			updatedAt: Date.now(),
		});
	}

	return {
		exitCode,
		threadId,
		events,
		finalAgentMessage,
		structuredOutput,
		stderr,
		timedOut,
	};
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
