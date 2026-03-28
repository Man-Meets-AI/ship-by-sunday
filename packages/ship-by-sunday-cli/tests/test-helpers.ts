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
