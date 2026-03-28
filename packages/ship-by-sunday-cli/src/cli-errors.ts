export type CliErrorCode =
	| "already_exists"
	| "invalid_args"
	| "invalid_input"
	| "invalid_patch"
	| "invalid_stage"
	| "invalid_state"
	| "missing_draft"
	| "not_review_ready"
	| "unknown";

export class CliError extends Error {
	readonly code: CliErrorCode;
	readonly exitCode: number;

	constructor({
		code,
		message,
		exitCode,
	}: {
		code: CliErrorCode;
		message: string;
		exitCode: number;
	}) {
		super(message);
		this.code = code;
		this.exitCode = exitCode;
	}
}

export function createCliError(
	code: CliErrorCode,
	message: string,
	exitCode = 1,
) {
	return new CliError({ code, message, exitCode });
}

export function normalizeCliError(error: unknown) {
	if (error instanceof CliError) {
		return error;
	}

	if (error instanceof SyntaxError) {
		return createCliError("invalid_input", error.message, 2);
	}

	if (error instanceof Error) {
		return createCliError("unknown", error.message, 1);
	}

	return createCliError("unknown", "Unknown CLI failure.", 1);
}
