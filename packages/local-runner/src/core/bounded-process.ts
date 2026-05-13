import { execFile } from "node:child_process";
import { Context, Effect, Layer } from "effect";

import { runLocalRunnerEffect } from "../effect/runtime";

const DEFAULT_READINESS_PROBE_TIMEOUT_MS = 5_000;

export type BoundedProcessRequest = {
	command: string;
	args: string[];
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	timeoutMs?: number;
};

type ResolvedBoundedProcessRequest = {
	command: string;
	args: string[];
	cwd?: string;
	env: NodeJS.ProcessEnv;
	timeoutMs: number;
};

export type BoundedProcessResult = {
	succeeded: boolean;
	stdout: string;
	stderr: string;
	timedOut: boolean;
	exitCode?: number;
	failureCode?: string;
};

type ProcessExecutionError = {
	code?: string | number;
	stdout?: string;
	stderr?: string;
	killed?: boolean;
	signal?: string | null;
};

export function getReadinessProbeTimeoutMs(
	env: NodeJS.ProcessEnv = process.env,
) {
	const parsed = Number(env.SBS_RUNNER_PROBE_TIMEOUT_MS);
	if (Number.isFinite(parsed) && parsed >= 100) {
		return parsed;
	}

	return DEFAULT_READINESS_PROBE_TIMEOUT_MS;
}

export interface BoundedProcessService {
	readonly run: (
		request: ResolvedBoundedProcessRequest,
	) => Effect.Effect<BoundedProcessResult>;
}

export const BoundedProcessService = Context.GenericTag<BoundedProcessService>(
	"ship-by-sunday/BoundedProcessService",
);

export const NodeBoundedProcessServiceLive = Layer.succeed(
	BoundedProcessService,
	BoundedProcessService.of({
		run: runNodeBoundedProcess,
	}),
);

export function runBoundedProcessEffect(
	request: BoundedProcessRequest,
): Effect.Effect<BoundedProcessResult, never, BoundedProcessService> {
	const resolvedRequest = resolveBoundedProcessRequest(request);

	return Effect.flatMap(BoundedProcessService, (service) =>
		service.run(resolvedRequest),
	);
}

export async function runBoundedProcess(
	request: BoundedProcessRequest,
): Promise<BoundedProcessResult> {
	return runLocalRunnerEffect(
		runBoundedProcessEffect(request).pipe(
			Effect.provide(NodeBoundedProcessServiceLive),
		),
	);
}

function resolveBoundedProcessRequest({
	command,
	args,
	cwd,
	env = process.env,
	timeoutMs = getReadinessProbeTimeoutMs(),
}: BoundedProcessRequest): ResolvedBoundedProcessRequest {
	return {
		command,
		args,
		cwd,
		env,
		timeoutMs,
	};
}

function runNodeBoundedProcess({
	command,
	args,
	cwd,
	env,
	timeoutMs,
}: ResolvedBoundedProcessRequest): Effect.Effect<BoundedProcessResult> {
	return Effect.promise(
		(signal) =>
			new Promise((resolve) => {
				const childProcess = execFile(
					command,
					args,
					{
						cwd,
						env,
						timeout: timeoutMs,
						windowsHide: true,
						maxBuffer: 1024 * 1024,
						signal,
					},
					(error, stdout, stderr) => {
						if (error) {
							resolve(
								mapProcessErrorToResult(
									error as ProcessExecutionError,
									stdout,
									stderr,
								),
							);
							return;
						}

						resolve({
							succeeded: true,
							stdout,
							stderr,
							timedOut: false,
						});
					},
				);

				if (signal.aborted) {
					childProcess.kill();
				}
			}),
	);
}

function mapProcessErrorToResult(
	processError: ProcessExecutionError,
	stdout: string | Buffer | undefined,
	stderr: string | Buffer | undefined,
): BoundedProcessResult {
	return {
		succeeded: false,
		stdout: normalizeProcessOutput(stdout, processError.stdout),
		stderr: normalizeProcessOutput(stderr, processError.stderr),
		timedOut: processError.killed === true && processError.signal === "SIGTERM",
		exitCode:
			typeof processError.code === "number" ? processError.code : undefined,
		failureCode:
			typeof processError.code === "string" ? processError.code : undefined,
	};
}

function normalizeProcessOutput(
	callbackOutput: string | Buffer | undefined,
	errorOutput: string | Buffer | undefined,
) {
	const output = callbackOutput ?? errorOutput;
	if (typeof output === "string") {
		return output;
	}

	if (Buffer.isBuffer(output)) {
		return output.toString();
	}

	return "";
}

export async function boundedProcessSucceeds(command: string, args: string[]) {
	return (await runBoundedProcess({ command, args })).succeeded;
}
