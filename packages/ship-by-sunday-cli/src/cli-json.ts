import manifestJson from "../package.json";
import type { CliIo } from "./run-cli";
import type { CliErrorCode } from "./cli-errors";

type JsonPrimitive = boolean | number | string | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export function writeJsonResult(
	io: CliIo,
	command: string,
	payload: Record<string, JsonValue>,
) {
	io.write(
		JSON.stringify(
			{
				status: "ok",
				command,
				version: manifestJson.version,
				...payload,
			},
			null,
			2,
		),
	);
}

export function writeJsonError(
	io: CliIo,
	command: string,
	errorCode: CliErrorCode,
	message: string,
) {
	io.writeError(
		`${JSON.stringify(
			{
				status: "error",
				command,
				version: manifestJson.version,
				error_code: errorCode,
				message,
			},
			null,
			2,
		)}\n`,
	);
}
