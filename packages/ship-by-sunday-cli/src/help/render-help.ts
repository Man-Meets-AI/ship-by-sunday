import { getCommandCatalogEntry, cliHelpSections } from "../command-catalog";
import {
	directLauncherCommand,
	workspaceLauncherCommand,
	supportedCompletionShellNames,
} from "../command-surface";

function renderCommandUsageLine(commandName: string) {
	const entry = getCommandCatalogEntry(commandName);
	if (!entry) {
		return null;
	}

	return `  ${entry.usage}`;
}

export function renderTopLevelHelp() {
	const lines = [
		"Ship by Sunday CLI",
		"",
		"Run the reduced blueprint intake flow, inspect readiness, and generate the Ship by Sunday Blueprint from this repository root.",
		"",
		"Usage:",
		`  ${workspaceLauncherCommand} [command]`,
		`  ${directLauncherCommand} [command]`,
		`  ${workspaceLauncherCommand} help [command]`,
		`  ${directLauncherCommand} help [command]`,
		`  ${workspaceLauncherCommand} --version`,
		`  ${directLauncherCommand} --version`,
		`  ${workspaceLauncherCommand} completion <${supportedCompletionShellNames.join("|")}>`,
		`  ${directLauncherCommand} completion <${supportedCompletionShellNames.join("|")}>`,
		"",
		"Commands:",
	];

	for (const section of cliHelpSections) {
		lines.push("");
		lines.push(section.title);
		lines.push(`  ${section.description}`);
		for (const commandName of section.commandNames) {
			const usageLine = renderCommandUsageLine(commandName);
			if (usageLine) {
				lines.push(usageLine);
			}
		}
	}

	lines.push("");
	lines.push(
		"Use `bun run sbs help <command>` to inspect one command in detail.",
	);

	return lines.join("\n");
}

export function renderCommandHelp(commandName: string) {
	if (commandName === "top-level") {
		return renderTopLevelHelp();
	}

	const entry = getCommandCatalogEntry(commandName);
	if (!entry) {
		return null;
	}

	const lines = [
		entry.title,
		"",
		entry.summary,
		"",
		"Usage:",
		`  ${entry.usage}`,
	];

	if (entry.details.length > 0) {
		lines.push("");
		lines.push("Notes:");
		for (const detail of entry.details) {
			lines.push(`  - ${detail}`);
		}
	}

	return lines.join("\n");
}
