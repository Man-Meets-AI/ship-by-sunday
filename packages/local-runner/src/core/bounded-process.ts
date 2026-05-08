import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const DEFAULT_READINESS_PROBE_TIMEOUT_MS = 5_000;

export type BoundedProcessResult = {
	succeeded: boolean;
	stdout: string;
	stderr: string;
	timedOut: boolean;
	exitCode?: number;
	failureCode?: string;
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

export async function runBoundedProcess({
	command,
	args,
	cwd,
	env = process.env,
	timeoutMs = getReadinessProbeTimeoutMs(),
}: {
	command: string;
	args: string[];
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	timeoutMs?: number;
}): Promise<BoundedProcessResult> {
	try {
		const { stdout, stderr } = await execFileAsync(command, args, {
			cwd,
			env,
			timeout: timeoutMs,
			windowsHide: true,
			maxBuffer: 1024 * 1024,
		});
		return {
			succeeded: true,
			stdout,
			stderr,
			timedOut: false,
		};
	} catch (error) {
		const processError = error as {
			code?: string | number;
			stdout?: string;
			stderr?: string;
			killed?: boolean;
			signal?: string | null;
		};

		return {
			succeeded: false,
			stdout:
				typeof processError.stdout === "string" ? processError.stdout : "",
			stderr:
				typeof processError.stderr === "string" ? processError.stderr : "",
			timedOut:
				processError.killed === true && processError.signal === "SIGTERM",
			exitCode:
				typeof processError.code === "number" ? processError.code : undefined,
			failureCode:
				typeof processError.code === "string" ? processError.code : undefined,
		};
	}
}

export async function boundedProcessSucceeds(command: string, args: string[]) {
	return (await runBoundedProcess({ command, args })).succeeded;
}
