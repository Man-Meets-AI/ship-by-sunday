#!/usr/bin/env bun
import { pathToFileURL } from "node:url";

import { runDaemonCommand } from "./commands/daemon";
import { runOneShotCommand } from "./commands/one-shot";
import { runSetupCheckCommand } from "./commands/setup-check";
import { runSetupPairCommand } from "./commands/setup-pair";

const HELP_TEXT = `
Ship by Sunday local runner

Usage:
  ship-by-sunday setup pair <token> [--repo <path>] [--api-url <url>] [--repair] [--json]
  ship-by-sunday setup check [--repo <path>] [--json]
  ship-by-sunday setup check --codex-config-preview
  ship-by-sunday setup check --apply-codex-config
  ship-by-sunday setup check --rollback-codex-config <backup>
  ship-by-sunday daemon start [--repo <path>] [--once]
  ship-by-sunday daemon status [--repo <path>] [--json]
  ship-by-sunday daemon stop [--repo <path>]
  ship-by-sunday one-shot [--repo <path>] [--json]
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

		throw new Error(`Unknown command: ${argv.join(" ")}`);
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		return 1;
	}
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
	process.exitCode = await runCli();
}
