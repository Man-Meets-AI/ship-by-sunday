export const workspaceLauncherCommand = "bun run sbs";
export const directLauncherCommand = "./bin/sbs";

export const supportedCompletionShellNames = ["bash", "zsh"] as const;
export type SupportedCompletionShellName =
	(typeof supportedCompletionShellNames)[number];

export function formatWorkspaceCommand(command: string) {
	return `${workspaceLauncherCommand} ${command}`;
}

export function formatDirectCommand(command: string) {
	return `${directLauncherCommand} ${command}`;
}

export function formatLauncherCommands(command: string) {
	return [
		formatWorkspaceCommand(command),
		formatDirectCommand(command),
	] as const;
}

export function formatSupportedCompletionShellNames() {
	return supportedCompletionShellNames.join(", ");
}

export function isSupportedCompletionShellName(
	value: string,
): value is SupportedCompletionShellName {
	return supportedCompletionShellNames.includes(
		value as SupportedCompletionShellName,
	);
}

export function formatUnsupportedCompletionShellMessage(shellName: string) {
	return `Unsupported shell "${shellName}". Expected one of ${formatSupportedCompletionShellNames()}.`;
}
