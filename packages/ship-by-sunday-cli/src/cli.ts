#!/usr/bin/env bun

import { parseCliCommand } from "./parse-cli-command";
import { promptStage } from "./prompts/prompt-stage";
import { runCli } from "./run-cli";
import {
	createCliRenderOptions,
	formatCliText,
	paint,
} from "./theme/render-theme";
import { renderStartupBanner } from "./theme/render-banner";

const argv = process.argv.slice(2);
const renderOptions = createCliRenderOptions();
const jsonRequested = argv.includes("--json");
const stdoutStreamRequested =
	argv[0] === "export" &&
	argv.includes("--out") &&
	argv[argv.indexOf("--out") + 1] === "-";
let suppressThemeOutput = jsonRequested || stdoutStreamRequested;

try {
	parseCliCommand(argv);
} catch {
	suppressThemeOutput = jsonRequested || stdoutStreamRequested;
}

if (!suppressThemeOutput && process.stdout.isTTY) {
	process.stdout.write(`${renderStartupBanner(renderOptions)}\n\n`);
}

const exitCode = await runCli({
	argv,
	io: {
		write(message) {
			process.stdout.write(
				`${suppressThemeOutput ? message : formatCliText(message, renderOptions)}\n`,
			);
		},
		writeError(message) {
			process.stderr.write(
				suppressThemeOutput
					? message
					: `${paint(message.trimEnd(), "burn", renderOptions)}\n`,
			);
		},
	},
	promptStage,
});

process.exit(exitCode);
