#!/usr/bin/env bun
import { pathToFileURL } from "node:url";

import { runDaemonCommand } from "./commands/daemon";
import { runDoctorPassCommand } from "./commands/doctor-pass";
import { runOneShotCommand } from "./commands/one-shot";
import { runSetupCheckCommand } from "./commands/setup-check";
import { runSetupPairCommand } from "./commands/setup-pair";
import { runWorkflowCommand } from "./commands/workflow";

const HELP_TEXT = `
Ship by Sunday local runner

Usage:
  ship-by-sunday setup pair <token> [--repo <path>] [--api-url <url>] [--repair] [--json]
  ship-by-sunday setup check [--repo <path>] [--json]
  ship-by-sunday setup check --codex-config-preview
  ship-by-sunday setup check --apply-codex-config
  ship-by-sunday setup check --rollback-codex-config <backup>
  ship-by-sunday daemon start [--repo <path>] [--once] [--work --confirm-local-writes --confirm-observability-audit --confirm-adoption-audit --confirm-docs-spine-adoption --confirm-docs-spine-apply]
  ship-by-sunday daemon status [--repo <path>] [--json]
  ship-by-sunday daemon stop [--repo <path>]
  ship-by-sunday one-shot [--repo <path>] [--json]
  ship-by-sunday doctor-pass run [--repo <path>] [--json] [--local-only]
  ship-by-sunday doctor-pass upload --run-id <id> [--repo <path>] [--json]
  ship-by-sunday workflow source-truth-readiness run --workflow-run-id <id> --confirm-local-writes [--repo <path>] [--json]
  ship-by-sunday workflow observability-debuggability run --workflow-run-id <id> --confirm-observability-audit [--repo <path>] [--json]
  ship-by-sunday workflow broken-app-triage run --workflow-run-id <id> --confirm-read-only-reproduction [--repo <path>] [--json]
  ship-by-sunday workflow mature-repo-adoption run --workflow-run-id <id> --confirm-adoption-audit [--repo <path>] [--json]
  ship-by-sunday workflow docs-spine-adoption run --workflow-run-id <id> --confirm-docs-spine-adoption [--repo <path>] [--json]
  ship-by-sunday workflow docs-spine-apply-and-proof run --workflow-run-id <id> --confirm-docs-spine-apply [--repo <path>] [--json]
`;

export async function runCli(argv = process.argv.slice(2)) {
	try {
		const [command, subcommand, ...rest] = argv;
		if (!command || command === "--help" || command === "-h") {
			console.log(HELP_TEXT.trim());
			return 0;
		}

		if (command === "setup" && subcommand === "pair") {
			return await runSetupPairCommand(rest);
		}
		if (command === "setup" && subcommand === "check") {
			return await runSetupCheckCommand(rest);
		}
		if (command === "daemon") {
			return await runDaemonCommand([subcommand, ...rest].filter(Boolean));
		}
		if (command === "one-shot") {
			return await runOneShotCommand([subcommand, ...rest].filter(Boolean));
		}
		if (command === "doctor-pass") {
			return await runDoctorPassCommand([subcommand, ...rest].filter(Boolean));
		}
		if (command === "workflow") {
			return await runWorkflowCommand([subcommand, ...rest].filter(Boolean));
		}

		throw new Error(`Unknown command: ${argv.join(" ")}`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return 1;
	}
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
	process.exitCode = await runCli();
}
