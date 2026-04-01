import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { CliIo } from "../src/run-cli";

export async function createTemporaryRepoRoot() {
	return mkdtemp(path.join(os.tmpdir(), "ship-by-sunday-cli-"));
}

export function createCliIo() {
	const stdout: string[] = [];
	const stderr: string[] = [];

	const io: CliIo = {
		write(message) {
			stdout.push(message);
		},
		writeError(message) {
			stderr.push(message);
		},
	};

	return {
		io,
		stdout,
		stderr,
	};
}

export async function withMockedTerminalState<T>(
	state: { stdinIsTTY: boolean; stdoutIsTTY: boolean },
	callback: () => Promise<T> | T,
) {
	const stdinDescriptor = Object.getOwnPropertyDescriptor(
		process.stdin,
		"isTTY",
	);
	const stdoutDescriptor = Object.getOwnPropertyDescriptor(
		process.stdout,
		"isTTY",
	);

	Object.defineProperty(process.stdin, "isTTY", {
		configurable: true,
		value: state.stdinIsTTY,
	});
	Object.defineProperty(process.stdout, "isTTY", {
		configurable: true,
		value: state.stdoutIsTTY,
	});

	try {
		return await callback();
	} finally {
		if (stdinDescriptor) {
			Object.defineProperty(process.stdin, "isTTY", stdinDescriptor);
		} else {
			delete (process.stdin as { isTTY?: boolean }).isTTY;
		}

		if (stdoutDescriptor) {
			Object.defineProperty(process.stdout, "isTTY", stdoutDescriptor);
		} else {
			delete (process.stdout as { isTTY?: boolean }).isTTY;
		}
	}
}
