import { promptStage } from "./prompts/prompt-stage";
import { runCli } from "./run-cli";
import {
	createCliRenderOptions,
	formatCliText,
	paint,
} from "./theme/render-theme";
import { resolveProjectRootPath } from "./cli-paths";
import { renderEntrySurface } from "./startup/render-entry-surface";
import { shouldRenderStartupSurface } from "./startup/resolve-human-mode";
import { parseCliCommand } from "./parse-cli-command";

function shouldSuppressThemeOutput(argv: string[]) {
	try {
		const parsedCommand = parseCliCommand(argv);
		return (
			parsedCommand.kind === "version" || parsedCommand.kind === "completion"
		);
	} catch {
		return false;
	}
}

export async function executeCliProcess({ argv = process.argv.slice(2) } = {}) {
	const renderOptions = createCliRenderOptions();
	const jsonRequested = argv.includes("--json");
	const stdoutStreamRequested =
		argv[0] === "export" &&
		argv.includes("--out") &&
		argv[argv.indexOf("--out") + 1] === "-";
	const suppressThemeOutput =
		jsonRequested || stdoutStreamRequested || shouldSuppressThemeOutput(argv);

	if (
		shouldRenderStartupSurface({
			argv,
			stdinIsTTY: process.stdin.isTTY,
			stdoutIsTTY: process.stdout.isTTY,
		})
	) {
		process.stdout.write(
			`${renderEntrySurface({
				projectRootPath: resolveProjectRootPath(),
				options: renderOptions,
			})}\n`,
		);
		return 0;
	}

	return await runCli({
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
}
