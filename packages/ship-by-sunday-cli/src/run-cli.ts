import { handleApplyCommand } from "./commands/apply-command";
import { handleExportCommand } from "./commands/export-command";
import { handleFieldMutationCommand } from "./commands/mutate-field-command";
import { handleFieldsCommand } from "./commands/fields-command";
import { handleGenerateCommand } from "./commands/generate-command";
import { handleImportCommand } from "./commands/import-command";
import { handleInitCommand } from "./commands/init-command";
import { handleCompletionCommand } from "./commands/completion-command";
import { handleMutateCommand } from "./commands/mutate-command";
import { handleNextCommand } from "./commands/next-command";
import { handleResumeCommand } from "./commands/resume-command";
import { handleReviewCommand } from "./commands/review-command";
import { handleSchemaCommand } from "./commands/schema-command";
import { handleVersionCommand } from "./commands/version-command";
import {
	handleStageCommand,
	type StagePrompter,
} from "./commands/stage-command";
import { handleStagesCommand } from "./commands/stages-command";
import { handleValidateCommand } from "./commands/validate-command";
import { resolveProjectRootPath } from "./cli-paths";
import { createCliError, normalizeCliError } from "./cli-errors";
import { writeJsonError } from "./cli-json";
import { renderCommandHelp, renderTopLevelHelp } from "./help/render-help";
import { parseCliCommand } from "./parse-cli-command";

export type CliIo = {
	write(message: string): void;
	writeError(message: string): void;
};

export type RunCliOptions = {
	argv: string[];
	io: CliIo;
	promptStage?: StagePrompter;
	projectRootPath?: string;
};

export async function runCli({
	argv,
	io,
	promptStage,
	projectRootPath,
}: RunCliOptions) {
	const jsonRequested = argv.includes("--json");
	let commandName = argv[0] ?? "help";

	try {
		const command = parseCliCommand(argv);
		commandName = command.kind;
		const resolvedProjectRootPath = projectRootPath ?? resolveProjectRootPath();

		switch (command.kind) {
			case "help": {
				if (!command.topic) {
					io.write(renderTopLevelHelp());
					return 0;
				}

				const helpText = renderCommandHelp(command.topic);
				if (!helpText) {
					throw createCliError(
						"invalid_args",
						`Unknown command "${command.topic}".`,
						2,
					);
				}

				io.write(helpText);
				return 0;
			}
			case "version":
				return await handleVersionCommand({
					io,
					json: command.json,
				});
			case "completion":
				return await handleCompletionCommand({
					io,
					shellName: command.shellName,
				});
			case "init":
				return await handleInitCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
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
					projectRootPath: resolvedProjectRootPath,
					json: command.json,
				});
			case "validate":
				return await handleValidateCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					json: command.json,
				});
			case "set":
				return await handleFieldMutationCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					command: "set",
					selector: command.selector,
					value: command.value,
					json: command.json,
				});
			case "unset":
				return await handleFieldMutationCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					command: "unset",
					selector: command.selector,
					json: command.json,
				});
			case "append":
				return await handleFieldMutationCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					command: "append",
					selector: command.selector,
					value: command.value,
					json: command.json,
				});
			case "remove":
				return await handleFieldMutationCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					command: "remove",
					selector: command.selector,
					value: command.value,
					json: command.json,
				});
			case "mutate":
				return await handleMutateCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					filePath: command.filePath,
					json: command.json,
				});
			case "resume":
				return await handleResumeCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					promptStage,
				});
			case "stage":
				return await handleStageCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					stageId: command.stageId,
					promptStage,
				});
			case "review":
				return await handleReviewCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					json: command.json,
					missingOnly: command.missingOnly,
					stageId: command.stageId,
				});
			case "export":
				return await handleExportCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					outPath: command.outPath,
					json: command.json,
				});
			case "import":
				return await handleImportCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					filePath: command.filePath,
					json: command.json,
				});
			case "apply":
				return await handleApplyCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
					stageId: command.stageId,
					filePath: command.filePath,
					json: command.json,
				});
			case "generate":
				return await handleGenerateCommand({
					io,
					projectRootPath: resolvedProjectRootPath,
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
