import { cliCommandNames } from "../command-catalog";
import {
	supportedCompletionShellNames,
	type SupportedCompletionShellName,
} from "../command-surface";
import type { CliIo } from "../run-cli";

function renderBashCompletionScript() {
	const commandNames = [...cliCommandNames, "help"].join(" ");
	const shellNames = supportedCompletionShellNames.join(" ");

	return [
		"# Ship by Sunday CLI completion for bash",
		"_sbs() {",
		"  local cur prev words cword",
		"  _init_completion || return",
		'  case "$prev" in',
		"    completion)",
		`      COMPREPLY=( $(compgen -W "${shellNames}" -- "$cur") )`,
		"      return",
		"      ;;",
		"  esac",
		`  COMPREPLY=( $(compgen -W "${commandNames}" -- "$cur") )`,
		"}",
		"complete -F _sbs sbs",
	].join("\n");
}

function renderZshCompletionScript() {
	const commandNames = [...cliCommandNames, "help"].join(" ");
	const shellNames = supportedCompletionShellNames.join(" ");

	return [
		"#compdef sbs",
		"",
		"_sbs() {",
		"  local -a commands shells",
		`  commands=(${commandNames})`,
		`  shells=(${shellNames})`,
		"  _arguments \\",
		"    '1:command:->command' \\",
		"    '*::arg:->args'",
		"  case $state in",
		"    command)",
		"      _describe 'command' commands",
		"      ;;",
		"    args)",
		"      if [[ $words[2] == completion ]]; then",
		"        _describe 'shell' shells",
		"      fi",
		"      ;;",
		"  esac",
		"}",
		"compdef _sbs sbs",
	].join("\n");
}

export function renderCompletionScript(
	shellName: SupportedCompletionShellName,
) {
	if (shellName === "bash") {
		return renderBashCompletionScript();
	}

	return renderZshCompletionScript();
}

export async function handleCompletionCommand({
	io,
	shellName,
}: {
	io: CliIo;
	shellName: SupportedCompletionShellName;
}) {
	io.write(renderCompletionScript(shellName));
	return 0;
}
