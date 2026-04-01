import packageJson from "../../package.json";
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
		writeJsonResult(io, "version", { version: packageJson.version });
		return 0;
	}

	io.write(packageJson.version);
	return 0;
}
