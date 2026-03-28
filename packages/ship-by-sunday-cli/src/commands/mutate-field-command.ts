import { isPacketArrayField } from "@manmeetsai/packet-compiler";
import { writeJsonResult } from "../cli-json";
import { createCliError } from "../cli-errors";
import { parseFieldSelector } from "../field-contract";
import {
	appendDraftFieldValue,
	removeDraftFieldValue,
	setDraftFieldValue,
	unsetDraftFieldValue,
} from "../draft/draft-store";
import type { CliIo } from "../run-cli";

export async function handleFieldMutationCommand({
	io,
	repoRootPath,
	command,
	selector,
	value,
	json,
}: {
	io: CliIo;
	repoRootPath: string;
	command: "set" | "unset" | "append" | "remove";
	selector: string;
	value?: string;
	json: boolean;
}) {
	const field = parseFieldSelector(selector);
	if (
		(command === "append" || command === "remove") &&
		!isPacketArrayField(field.fieldKey)
	) {
		throw createCliError(
			"invalid_args",
			`Field "${field.fieldKey}" does not support ${command}.`,
			2,
		);
	}

	const nextDraft =
		command === "set"
			? await setDraftFieldValue(repoRootPath, field.fieldKey, value ?? "")
			: command === "unset"
				? await unsetDraftFieldValue(repoRootPath, field.fieldKey)
				: command === "append"
					? await appendDraftFieldValue(
							repoRootPath,
							field.fieldKey,
							value ?? "",
						)
					: await removeDraftFieldValue(
							repoRootPath,
							field.fieldKey,
							value ?? "",
						);
	const nextValue = nextDraft.facts[field.fieldKey];

	if (json) {
		writeJsonResult(io, command, {
			fieldKey: field.fieldKey,
			stageId: field.stageId,
			stepId: field.stepId,
			value:
				nextValue === undefined
					? null
					: Array.isArray(nextValue)
						? nextValue
						: typeof nextValue === "number"
							? nextValue
							: String(nextValue),
		});
		return 0;
	}

	io.write(`${command} ${field.label}`);
	return 0;
}
