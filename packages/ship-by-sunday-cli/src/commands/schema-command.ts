import { listSchemaDescriptor } from "../field-contract";
import type { CliIo } from "../run-cli";
import { writeJsonResult } from "../cli-json";

export async function handleSchemaCommand({
	io,
	json,
}: {
	io: CliIo;
	json: boolean;
}) {
	const schema = listSchemaDescriptor();

	if (json) {
		writeJsonResult(io, "schema", schema);
		return 0;
	}

	io.write(
		[
			"Canonical packet schema",
			"",
			`Schema version: ${schema.schemaVersion}`,
			`Field count: ${schema.fieldCount}`,
			`Placeholder-friendly: ${schema.placeholderFriendlyFields.join(", ")}`,
		].join("\n"),
	);
	return 0;
}
