import { execFile } from "node:child_process";
import { chmod, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function createTemporaryDirectory(prefix: string) {
	return await mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function initializeGitRepository(repositoryRoot: string) {
	await execFileAsync("git", ["init"], { cwd: repositoryRoot });
	await execFileAsync("git", ["config", "user.email", "runner@example.com"], {
		cwd: repositoryRoot,
	});
	await execFileAsync("git", ["config", "user.name", "Runner Test"], {
		cwd: repositoryRoot,
	});
}

export async function createFakeRunnerBin({
	codexArgsFile,
}: {
	codexArgsFile?: string;
} = {}) {
	const binDirectory = await createTemporaryDirectory("sbs-runner-bin-");
	const codexPath = path.join(binDirectory, "codex");
	const ghPath = path.join(binDirectory, "gh");
	await writeFile(
		codexPath,
		[
			"#!/bin/sh",
			'if [ "$1" = "--version" ]; then echo "codex 1.0.0"; exit 0; fi',
			'if [ "$1" = "exec" ] && [ "$2" = "--help" ]; then echo "exec help"; exit 0; fi',
			'if [ "$CODEX_ARGS_FILE" != "" ]; then printf "%s\\n" "$@" > "$CODEX_ARGS_FILE"; fi',
			'if [ "$1" = "exec" ]; then',
			"  cat >/dev/null",
			'  echo "{\\"type\\":\\"thread.started\\",\\"thread_id\\":\\"thread_test\\"}"',
			'  echo "{\\"type\\":\\"item.completed\\",\\"item\\":{\\"id\\":\\"item_1\\",\\"type\\":\\"agent_message\\",\\"text\\":\\"{\\\\\\"ok\\\\\\":true}\\"}}"',
			"  exit 0",
			"fi",
			'echo "unexpected codex args: $*" >&2',
			"exit 1",
			"",
		].join("\n"),
	);
	await writeFile(
		ghPath,
		[
			"#!/bin/sh",
			'if [ "$1" = "--version" ]; then echo "gh 1.0.0"; exit 0; fi',
			'if [ "$1" = "auth" ] && [ "$2" = "status" ]; then exit 0; fi',
			"exit 1",
			"",
		].join("\n"),
	);
	await chmod(codexPath, 0o755);
	await chmod(ghPath, 0o755);
	return {
		binDirectory,
		codexArgsFile,
	};
}

export async function createCodexHome() {
	const codexHome = await createTemporaryDirectory("sbs-codex-home-");
	await mkdir(codexHome, { recursive: true });
	await writeFile(path.join(codexHome, "auth.json"), "{}\n");
	await writeFile(
		path.join(codexHome, "config.toml"),
		[
			"[profiles.sbs-doctor-readonly]",
			'approval_policy = "never"',
			'sandbox_mode = "read-only"',
			'default_permissions = "sbs-readonly"',
			"",
			"[profiles.sbs-workspace-write]",
			'approval_policy = "on-request"',
			'sandbox_mode = "workspace-write"',
			'default_permissions = "sbs-workspace-write"',
			"",
			'[permissions.sbs-readonly.filesystem.":project_roots"]',
			'"." = "read"',
			'".env*" = "none"',
			'"**/.env*" = "none"',
			"",
			"[permissions.sbs-readonly.network]",
			"enabled = false",
			"",
			'[permissions.sbs-workspace-write.filesystem.":project_roots"]',
			'"." = "write"',
			'".env*" = "none"',
			'"**/.env*" = "none"',
			"",
			"[permissions.sbs-workspace-write.network]",
			"enabled = false",
			"",
		].join("\n"),
	);
	return codexHome;
}
