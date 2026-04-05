import { formatWorkspaceCommand } from "./command-surface";

export type CliCommandName =
	| "apply"
	| "append"
	| "completion"
	| "export"
	| "fields"
	| "generate"
	| "help"
	| "import"
	| "init"
	| "mutate"
	| "next"
	| "remove"
	| "resume"
	| "review"
	| "schema"
	| "set"
	| "stage"
	| "stages"
	| "unset"
	| "validate"
	| "version";

export type CliHelpTopic = CliCommandName | "top-level";

export type CliCommandCatalogEntry = {
	name: Exclude<CliCommandName, "help">;
	summary: string;
	title: string;
	usage: string;
	details: string[];
};

export type CliHelpSection = {
	description: string;
	title: string;
	commandNames: Exclude<CliCommandName, "help">[];
};

export const cliCommandNames = [
	"apply",
	"append",
	"completion",
	"export",
	"fields",
	"generate",
	"import",
	"init",
	"mutate",
	"next",
	"remove",
	"resume",
	"review",
	"schema",
	"set",
	"stage",
	"stages",
	"unset",
	"validate",
	"version",
] as const satisfies readonly Exclude<CliCommandName, "help">[];

export const cliCommandCatalog: Record<
	Exclude<CliCommandName, "help">,
	CliCommandCatalogEntry
> = {
	init: {
		name: "init",
		title: "Ship by Sunday CLI initialization",
		summary:
			"Create or replace a local draft without entering the stage editor.",
		usage: formatWorkspaceCommand(
			"init [--fixture blank|complete] [--force] [--json]",
		),
		details: [
			"Use `--fixture complete` to seed a review-ready draft for demos, agents, or QA.",
			"Use `--force` when you want to replace an existing local draft.",
		],
	},
	schema: {
		name: "schema",
		title: "Ship by Sunday reduced blueprint schema",
		summary:
			"Inspect the reduced blueprint schema the CLI uses to validate the draft.",
		usage: formatWorkspaceCommand("schema [--json]"),
		details: [
			"Use `--json` when another tool needs a stable machine-readable envelope.",
		],
	},
	stages: {
		name: "stages",
		title: "Ship by Sunday reduced blueprint stages",
		summary: "List the live reduced blueprint stages and their step structure.",
		usage: formatWorkspaceCommand("stages [--json]"),
		details: [
			"Use this when you want the stage names and the order they run in.",
		],
	},
	fields: {
		name: "fields",
		title: "Ship by Sunday reduced blueprint fields",
		summary: "Inspect the fields available in the canonical blueprint intake.",
		usage: formatWorkspaceCommand("fields [--stage <stage>] [--json]"),
		details: [
			"Pass `--stage blueprint` to be explicit about the canonical editable stage.",
			"The generated preview section is compiler-owned and has no manual fields.",
		],
	},
	next: {
		name: "next",
		title: "Ship by Sunday next action",
		summary: "Show the next incomplete stage, step, and a suggested command.",
		usage: formatWorkspaceCommand("next [--json]"),
		details: [
			"Use this when you want the next action without opening the stage editor.",
		],
	},
	validate: {
		name: "validate",
		title: "Ship by Sunday draft validation",
		summary: "Check reduced blueprint readiness without changing anything.",
		usage: formatWorkspaceCommand("validate [--json]"),
		details: [
			"This returns the same reduced readiness logic the CLI review flow uses.",
		],
	},
	set: {
		name: "set",
		title: "Ship by Sunday field mutation",
		summary: "Replace a single field value from the terminal.",
		usage: formatWorkspaceCommand(
			'set <fieldKey|stage.fieldKey> "<value>" [--json]',
		),
		details: [
			"Use this for direct field edits when you already know the target key.",
		],
	},
	unset: {
		name: "unset",
		title: "Ship by Sunday field mutation",
		summary: "Remove a single field value from the draft.",
		usage: formatWorkspaceCommand("unset <fieldKey|stage.fieldKey> [--json]"),
		details: [
			"Use this when you want the reduced readiness state to recompute after a field is cleared.",
		],
	},
	append: {
		name: "append",
		title: "Ship by Sunday field mutation",
		summary: "Append one value to a list field.",
		usage: formatWorkspaceCommand(
			'append <fieldKey|stage.fieldKey> "<value>" [--json]',
		),
		details: ["This is the list-field companion to `set` and `unset`."],
	},
	remove: {
		name: "remove",
		title: "Ship by Sunday field mutation",
		summary: "Remove one value from a list field.",
		usage: formatWorkspaceCommand(
			'remove <fieldKey|stage.fieldKey> "<value>" [--json]',
		),
		details: [
			"Use this to prune list fields without rewriting the whole list.",
		],
	},
	mutate: {
		name: "mutate",
		title: "Ship by Sunday batch mutation",
		summary: "Apply a whole batch of draft mutations from a file or stdin.",
		usage: formatWorkspaceCommand("mutate --file <file|-> [--json]"),
		details: ["If one operation fails, the CLI leaves the draft unchanged."],
	},
	resume: {
		name: "resume",
		title: "Ship by Sunday resume",
		summary:
			"Continue from the first incomplete canonical stage in the local draft.",
		usage: formatWorkspaceCommand("resume"),
		details: [
			"This is the fastest interactive entry point for a human operator.",
		],
	},
	stage: {
		name: "stage",
		title: "Ship by Sunday stage editor",
		summary: "Open the canonical blueprint prompt flow.",
		usage: formatWorkspaceCommand("stage <blueprint>"),
		details: [
			"Use this when you want to revisit the full blueprint intake in order.",
		],
	},
	review: {
		name: "review",
		title: "Ship by Sunday draft review",
		summary: "Print reduced readiness and missing facts for the draft.",
		usage: formatWorkspaceCommand(
			"review [--stage <stage>] [--missing-only] [--json]",
		),
		details: [
			"Use `--stage` to focus one stage and `--missing-only` to shorten the human output.",
		],
	},
	export: {
		name: "export",
		title: "Ship by Sunday draft export",
		summary: "Write the current draft to a file or stdout.",
		usage: formatWorkspaceCommand("export --out <file|-> [--json]"),
		details: ["Use `--out -` when you want pipe-friendly stdout output."],
	},
	import: {
		name: "import",
		title: "Ship by Sunday draft import",
		summary:
			"Replace the current draft with reduced or legacy JSON from a file or stdin.",
		usage: formatWorkspaceCommand("import --file <file|-> [--json]"),
		details: ["Use `--file -` when another tool is piping JSON into the CLI."],
	},
	apply: {
		name: "apply",
		title: "Ship by Sunday stage patch apply",
		summary: "Merge a stage-scoped patch into the draft.",
		usage: formatWorkspaceCommand(
			"apply --stage <stage> --file <file|-> [--json]",
		),
		details: [
			"The patch file must only contain fields that belong to the chosen stage.",
		],
	},
	completion: {
		name: "completion",
		title: "Ship by Sunday shell completion",
		summary:
			"Print a completion script for the supported shell instead of mutating shell files.",
		usage: formatWorkspaceCommand("completion <bash|zsh>"),
		details: [
			"Supported shells are bash and zsh.",
			"Pipe the output into your shell profile or completion directory.",
		],
	},
	version: {
		name: "version",
		title: "Ship by Sunday CLI version",
		summary: "Print the CLI version string or the JSON envelope field.",
		usage: formatWorkspaceCommand("version [--json]"),
		details: [
			"Use `--json` when a script needs the structured envelope rather than the bare version string.",
		],
	},
	generate: {
		name: "generate",
		title: "Ship by Sunday Blueprint generation",
		summary:
			"Generate the Ship by Sunday Blueprint from a reduced review-ready draft.",
		usage: formatWorkspaceCommand(
			"generate [repo] --out <path> [--zip] [--force] [--json]",
		),
		details: ["Use `--dry-run` to inspect blockers without writing files."],
	},
};

export const cliHelpSections: CliHelpSection[] = [
	{
		title: "Start or resume",
		description: "Open the draft editor or create a fresh draft to begin.",
		commandNames: ["resume", "stage", "init"],
	},
	{
		title: "Inspect the draft",
		description:
			"Read the blueprint structure and readiness state without changing anything.",
		commandNames: ["schema", "stages", "fields", "next", "validate", "review"],
	},
	{
		title: "Edit facts",
		description: "Mutate one field or a batch of fields from the terminal.",
		commandNames: ["set", "unset", "append", "remove", "mutate"],
	},
	{
		title: "Version and shell integration",
		description:
			"Check the CLI version and print completion scripts for the supported shells.",
		commandNames: ["version", "completion"],
	},
	{
		title: "Move data in and out",
		description: "Import, export, patch, or generate the blueprint snapshot.",
		commandNames: ["export", "import", "apply", "generate"],
	},
];

export const recommendedStartupCommands = [
	"bun run sbs resume",
	"bun run sbs next --json",
	"bun run sbs review --json",
] as const;

export function getCommandCatalogEntry(
	commandName: string,
): CliCommandCatalogEntry | null {
	if (!isCliCommandName(commandName)) {
		return null;
	}

	return cliCommandCatalog[commandName];
}

export function isCliCommandName(
	commandName: string,
): commandName is Exclude<CliCommandName, "help"> {
	return cliCommandNames.includes(
		commandName as Exclude<CliCommandName, "help">,
	);
}

export function formatCliVersionLabel(version: string) {
	return `Ship by Sunday CLI v${version}`;
}
