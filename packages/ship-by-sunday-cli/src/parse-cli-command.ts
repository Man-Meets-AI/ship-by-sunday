import type { PacketStageId } from "@manmeetsai/packet-compiler";
import { createCliError } from "./cli-errors";
import {
	formatUnsupportedCompletionShellMessage,
	isSupportedCompletionShellName,
	type SupportedCompletionShellName,
} from "./command-surface";

export type EditablePacketStageId = Exclude<PacketStageId, "start" | "review">;
export type ReviewablePacketStageId = Exclude<PacketStageId, "start">;
export type CliFixtureName = "blank" | "complete";

export type CliCommand =
	| { kind: "help"; topic?: string }
	| { kind: "version"; json: boolean }
	| { kind: "init"; fixture: CliFixtureName; force: boolean; json: boolean }
	| { kind: "schema"; json: boolean }
	| { kind: "stages"; json: boolean }
	| { kind: "fields"; json: boolean; stageId?: EditablePacketStageId }
	| { kind: "next"; json: boolean }
	| { kind: "validate"; json: boolean }
	| { kind: "set"; selector: string; value: string; json: boolean }
	| { kind: "unset"; selector: string; json: boolean }
	| { kind: "append"; selector: string; value: string; json: boolean }
	| { kind: "remove"; selector: string; value: string; json: boolean }
	| { kind: "mutate"; filePath: string; json: boolean }
	| { kind: "resume" }
	| { kind: "stage"; stageId: EditablePacketStageId }
	| {
			kind: "review";
			json: boolean;
			missingOnly: boolean;
			stageId?: ReviewablePacketStageId;
	  }
	| { kind: "export"; outPath: string; json: boolean }
	| { kind: "import"; filePath: string; json: boolean }
	| {
			kind: "apply";
			stageId: EditablePacketStageId;
			filePath: string;
			json: boolean;
	  }
	| {
			kind: "generate";
			outPath: string;
			zip: boolean;
			force: boolean;
			json: boolean;
			dryRun: boolean;
	  }
	| {
			kind: "completion";
			shellName: SupportedCompletionShellName;
	  };

const editableStageIds = [
	"product",
	"design",
	"marketing",
	"build-plan",
] as const satisfies readonly EditablePacketStageId[];
const reviewableStageIds = [
	"product",
	"design",
	"marketing",
	"build-plan",
	"review",
] as const satisfies readonly ReviewablePacketStageId[];

function isEditableStageId(value: string): value is EditablePacketStageId {
	return editableStageIds.includes(value as EditablePacketStageId);
}

function isReviewableStageId(value: string): value is ReviewablePacketStageId {
	return reviewableStageIds.includes(value as ReviewablePacketStageId);
}

function requireOptionValue(args: string[], index: number, optionName: string) {
	const value = args[index + 1];
	if (!value) {
		throw createCliError("invalid_args", `Missing value for ${optionName}.`, 2);
	}
	return value;
}

function stripJsonFlag(args: string[]) {
	return args.filter((arg) => arg !== "--json");
}

export function parseCliCommand(argv: string[]): CliCommand {
	const [commandName, ...rest] = argv;

	if (argv.includes("--version") || argv.includes("-v")) {
		return { kind: "version", json: argv.includes("--json") };
	}

	if (
		commandName === undefined ||
		commandName === "help" ||
		commandName === "--help" ||
		commandName === "-h"
	) {
		const topic =
			commandName === "help"
				? rest.find(
						(arg) => arg !== "--json" && arg !== "--help" && arg !== "-h",
					)
				: undefined;
		return { kind: "help", topic };
	}

	if (rest.includes("--help") || rest.includes("-h")) {
		return { kind: "help", topic: commandName };
	}

	if (commandName === "init") {
		const fixtureIndex = rest.indexOf("--fixture");
		const fixture =
			fixtureIndex === -1
				? "blank"
				: requireOptionValue(rest, fixtureIndex, "--fixture");
		if (fixture !== "blank" && fixture !== "complete") {
			throw createCliError(
				"invalid_args",
				`Unknown fixture "${fixture}". Expected one of blank, complete.`,
				2,
			);
		}
		return {
			kind: "init",
			fixture,
			force: rest.includes("--force"),
			json: rest.includes("--json"),
		};
	}

	if (commandName === "schema") {
		return { kind: "schema", json: rest.includes("--json") };
	}

	if (commandName === "version") {
		return { kind: "version", json: rest.includes("--json") };
	}

	if (commandName === "stages") {
		return { kind: "stages", json: rest.includes("--json") };
	}

	if (commandName === "fields") {
		const stageIndex = rest.indexOf("--stage");
		const stageId =
			stageIndex === -1
				? undefined
				: requireOptionValue(rest, stageIndex, "--stage");
		if (stageId && !isEditableStageId(stageId)) {
			throw createCliError(
				"invalid_stage",
				`Unknown stage "${stageId}". Expected one of ${editableStageIds.join(", ")}.`,
				2,
			);
		}
		return {
			kind: "fields",
			json: rest.includes("--json"),
			stageId: stageId as EditablePacketStageId | undefined,
		};
	}

	if (commandName === "next") {
		return { kind: "next", json: rest.includes("--json") };
	}

	if (commandName === "validate") {
		return { kind: "validate", json: rest.includes("--json") };
	}

	if (commandName === "set") {
		const positionalArgs = stripJsonFlag(rest);
		const selector = positionalArgs[0];
		const value = positionalArgs.slice(1).join(" ");
		if (!selector || !value) {
			throw createCliError(
				"invalid_args",
				'Usage: bun run sbs set <fieldKey|stage.fieldKey> "<value>"',
				2,
			);
		}
		return { kind: "set", selector, value, json: rest.includes("--json") };
	}

	if (commandName === "unset") {
		const selector = rest[0];
		if (!selector) {
			throw createCliError(
				"invalid_args",
				"Usage: bun run sbs unset <fieldKey|stage.fieldKey>",
				2,
			);
		}
		return { kind: "unset", selector, json: rest.includes("--json") };
	}

	if (commandName === "append") {
		const positionalArgs = stripJsonFlag(rest);
		const selector = positionalArgs[0];
		const value = positionalArgs.slice(1).join(" ");
		if (!selector || !value) {
			throw createCliError(
				"invalid_args",
				'Usage: bun run sbs append <fieldKey|stage.fieldKey> "<value>"',
				2,
			);
		}
		return {
			kind: "append",
			selector,
			value,
			json: rest.includes("--json"),
		};
	}

	if (commandName === "remove") {
		const positionalArgs = stripJsonFlag(rest);
		const selector = positionalArgs[0];
		const value = positionalArgs.slice(1).join(" ");
		if (!selector || !value) {
			throw createCliError(
				"invalid_args",
				'Usage: bun run sbs remove <fieldKey|stage.fieldKey> "<value>"',
				2,
			);
		}
		return {
			kind: "remove",
			selector,
			value,
			json: rest.includes("--json"),
		};
	}

	if (commandName === "mutate") {
		const fileIndex = rest.indexOf("--file");
		if (fileIndex === -1) {
			throw createCliError(
				"invalid_args",
				'Missing required "--file" for mutate.',
				2,
			);
		}
		return {
			kind: "mutate",
			filePath: requireOptionValue(rest, fileIndex, "--file"),
			json: rest.includes("--json"),
		};
	}

	if (commandName === "resume") {
		return { kind: "resume" };
	}

	if (isEditableStageId(commandName)) {
		return { kind: "stage", stageId: commandName };
	}

	if (commandName === "stage") {
		const stageId = rest[0];
		if (!stageId || !isEditableStageId(stageId)) {
			throw createCliError(
				"invalid_stage",
				`Unknown stage "${stageId ?? ""}". Expected one of ${editableStageIds.join(", ")}.`,
				2,
			);
		}
		return { kind: "stage", stageId };
	}

	if (commandName === "review") {
		const stageIndex = rest.indexOf("--stage");
		const stageId =
			stageIndex === -1
				? undefined
				: requireOptionValue(rest, stageIndex, "--stage");
		if (stageId && !isReviewableStageId(stageId)) {
			throw createCliError(
				"invalid_stage",
				`Unknown review stage "${stageId}". Expected one of ${reviewableStageIds.join(", ")}.`,
				2,
			);
		}
		return {
			kind: "review",
			json: rest.includes("--json"),
			missingOnly: rest.includes("--missing-only"),
			stageId: stageId as ReviewablePacketStageId | undefined,
		};
	}

	if (commandName === "export") {
		const outIndex = rest.indexOf("--out");
		if (outIndex === -1) {
			throw createCliError(
				"invalid_args",
				'Missing required "--out" for export.',
				2,
			);
		}
		return {
			kind: "export",
			outPath: requireOptionValue(rest, outIndex, "--out"),
			json: rest.includes("--json"),
		};
	}

	if (commandName === "import") {
		const fileIndex = rest.indexOf("--file");
		if (fileIndex === -1) {
			throw createCliError(
				"invalid_args",
				'Missing required "--file" for import.',
				2,
			);
		}
		return {
			kind: "import",
			filePath: requireOptionValue(rest, fileIndex, "--file"),
			json: rest.includes("--json"),
		};
	}

	if (commandName === "apply") {
		const stageIndex = rest.indexOf("--stage");
		const fileIndex = rest.indexOf("--file");
		if (stageIndex === -1) {
			throw createCliError(
				"invalid_args",
				'Missing required "--stage" for apply.',
				2,
			);
		}
		if (fileIndex === -1) {
			throw createCliError(
				"invalid_args",
				'Missing required "--file" for apply.',
				2,
			);
		}
		const stageId = requireOptionValue(rest, stageIndex, "--stage");
		if (!isEditableStageId(stageId)) {
			throw createCliError(
				"invalid_stage",
				`Unknown stage "${stageId}". Expected one of ${editableStageIds.join(", ")}.`,
				2,
			);
		}
		return {
			kind: "apply",
			stageId,
			filePath: requireOptionValue(rest, fileIndex, "--file"),
			json: rest.includes("--json"),
		};
	}

	if (commandName === "generate") {
		const generateArgs = rest[0] === "repo" ? rest.slice(1) : rest;
		const outIndex = generateArgs.indexOf("--out");
		if (outIndex === -1) {
			throw createCliError(
				"invalid_args",
				'Missing required "--out" for generate.',
				2,
			);
		}
		return {
			kind: "generate",
			outPath: requireOptionValue(generateArgs, outIndex, "--out"),
			zip: generateArgs.includes("--zip"),
			force: generateArgs.includes("--force"),
			json: generateArgs.includes("--json"),
			dryRun: generateArgs.includes("--dry-run"),
		};
	}

	if (commandName === "completion") {
		const shellName = rest[0];
		if (!shellName) {
			throw createCliError(
				"invalid_args",
				`Missing shell name for completion. Expected one of bash, zsh.`,
				2,
			);
		}

		if (!isSupportedCompletionShellName(shellName)) {
			throw createCliError(
				"invalid_args",
				formatUnsupportedCompletionShellMessage(shellName),
				2,
			);
		}

		return {
			kind: "completion",
			shellName,
		};
	}

	throw createCliError("invalid_args", `Unknown command "${commandName}".`, 2);
}
