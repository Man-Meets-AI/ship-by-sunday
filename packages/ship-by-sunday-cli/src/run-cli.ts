import { writeJsonError } from "./cli-json";
import { normalizeCliError } from "./cli-errors";
import { resolveRepoRootPath } from "@manmeetsai/packet-compiler/server";
import { handleInitCommand } from "./commands/init-command";
import { handleApplyCommand } from "./commands/apply-command";
import { handleFieldsCommand } from "./commands/fields-command";
import { handleExportCommand } from "./commands/export-command";
import { handleGenerateCommand } from "./commands/generate-command";
import { handleImportCommand } from "./commands/import-command";
import { handleFieldMutationCommand } from "./commands/mutate-field-command";
import { handleMutateCommand } from "./commands/mutate-command";
import { handleNextCommand } from "./commands/next-command";
import { handleResumeCommand } from "./commands/resume-command";
import { handleReviewCommand } from "./commands/review-command";
import { handleSchemaCommand } from "./commands/schema-command";
import {
	handleStageCommand,
	type StagePrompter,
} from "./commands/stage-command";
import { handleStagesCommand } from "./commands/stages-command";
import { handleValidateCommand } from "./commands/validate-command";
import { parseCliCommand } from "./parse-cli-command";

export type CliIo = {
	write(message: string): void;
	writeError(message: string): void;
};

export type RunCliOptions = {
	argv: string[];
	io: CliIo;
	promptStage?: StagePrompter;
	repoRootPath?: string;
};

function printHelp(io: CliIo) {
	io.write(
		[
			"Ship by Sunday CLI",
			"",
			"Commands:",
			"  bun run sbs init [--fixture blank|complete] [--force] [--json]",
			"  bun run sbs schema [--json]",
			"  bun run sbs stages [--json]",
			"  bun run sbs fields [--stage <stage>] [--json]",
			"  bun run sbs next [--json]",
			"  bun run sbs validate [--json]",
			'  bun run sbs set <fieldKey|stage.fieldKey> "<value>" [--json]',
			"  bun run sbs unset <fieldKey|stage.fieldKey> [--json]",
			'  bun run sbs append <fieldKey|stage.fieldKey> "<value>" [--json]',
			'  bun run sbs remove <fieldKey|stage.fieldKey> "<value>" [--json]',
			"  bun run sbs mutate --file <file|-> [--json]",
			"  bun run sbs resume",
			"  bun run sbs stage <product|design|marketing|build-plan>",
			"  bun run sbs review [--stage <stage>] [--missing-only] [--json]",
			"  bun run sbs export --out <file|-> [--json]",
			"  bun run sbs import --file <file|-> [--json]",
			"  bun run sbs apply --stage <stage> --file <file|-> [--json]",
			"  bun run sbs generate [repo] --out <path> [--zip] [--force] [--json]",
		].join("\n"),
	);
}

export async function runCli({
	argv,
	io,
	promptStage,
	repoRootPath,
}: RunCliOptions) {
	const jsonRequested = argv.includes("--json");
	let commandName = argv[0] ?? "help";

	try {
		const command = parseCliCommand(argv);
		commandName = command.kind;
		const resolvedRepoRootPath = repoRootPath ?? resolveRepoRootPath();

		switch (command.kind) {
			case "help":
				printHelp(io);
				return 0;
			case "init":
				return await handleInitCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					fixture: command.fixture,
					force: command.force,
					json: command.json,
				});
			case "schema":
				return await handleSchemaCommand({
					io,
					json: command.json,
				});
			case "stages":
				return await handleStagesCommand({
					io,
					json: command.json,
				});
			case "fields":
				return await handleFieldsCommand({
					io,
					stageId: command.stageId,
					json: command.json,
				});
			case "next":
				return await handleNextCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					json: command.json,
				});
			case "validate":
				return await handleValidateCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					json: command.json,
				});
			case "set":
				return await handleFieldMutationCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					command: "set",
					selector: command.selector,
					value: command.value,
					json: command.json,
				});
			case "unset":
				return await handleFieldMutationCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					command: "unset",
					selector: command.selector,
					json: command.json,
				});
			case "append":
				return await handleFieldMutationCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					command: "append",
					selector: command.selector,
					value: command.value,
					json: command.json,
				});
			case "remove":
				return await handleFieldMutationCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					command: "remove",
					selector: command.selector,
					value: command.value,
					json: command.json,
				});
			case "mutate":
				return await handleMutateCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					filePath: command.filePath,
					json: command.json,
				});
			case "resume":
				return await handleResumeCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					promptStage,
				});
			case "stage":
				return await handleStageCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					stageId: command.stageId,
					promptStage,
				});
			case "review":
				return await handleReviewCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					json: command.json,
					missingOnly: command.missingOnly,
					stageId: command.stageId,
				});
			case "export":
				return await handleExportCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					outPath: command.outPath,
					json: command.json,
				});
			case "import":
				return await handleImportCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					filePath: command.filePath,
					json: command.json,
				});
			case "apply":
				return await handleApplyCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					stageId: command.stageId,
					filePath: command.filePath,
					json: command.json,
				});
			case "generate":
				return await handleGenerateCommand({
					io,
					repoRootPath: resolvedRepoRootPath,
					outPath: command.outPath,
					zip: command.zip,
					force: command.force,
					json: command.json,
					dryRun: command.dryRun,
				});
		}
	} catch (error) {
		const cliError = normalizeCliError(error);
		if (jsonRequested) {
			writeJsonError(io, commandName, cliError.code, cliError.message);
		} else {
			io.writeError(`${cliError.message}\n`);
		}
		return cliError.exitCode;
	}
}
