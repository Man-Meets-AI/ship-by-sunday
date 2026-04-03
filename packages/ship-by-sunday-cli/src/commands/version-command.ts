import manifestJson from "../../package.json";
import { writeJsonResult } from "../cli-json";
import type { CliIo } from "../run-cli";

export async function handleVersionCommand({
	io,
	json,
}: {
	io: CliIo;
	json: boolean;
}) {
	if (json) {
		writeJsonResult(io, "version", { version: manifestJson.version });
		return 0;
	}

	io.write(manifestJson.version);
	return 0;
}
