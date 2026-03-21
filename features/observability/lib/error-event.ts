const MAX_MESSAGE_LENGTH = 280;
const MAX_STACK_LENGTH = 2_000;
const MAX_DETAILS_LENGTH = 2_000;

export const observabilitySourceValues = [
	"next_server",
	"next_client",
	"convex",
	"stripe",
	"clerk",
	"codex",
] as const;

export const observabilitySeverityValues = [
	"medium",
	"high",
	"critical",
] as const;

export type ObservabilitySource = (typeof observabilitySourceValues)[number];
export type ObservabilitySeverity = (typeof observabilitySeverityValues)[number];

export type ObservabilityEventInput = {
	source: ObservabilitySource;
	error: unknown;
	requestId?: string | null;
	pathname?: string | null;
	userId?: string | null;
	code?: string | null;
	severity?: ObservabilitySeverity;
	details?: Record<string, unknown> | null;
};

export type NormalizedObservabilityEvent = {
	fingerprint: string;
	source: ObservabilitySource;
	message: string;
	stack: string | null;
	details: string | null;
	requestId: string | null;
	pathname: string | null;
	userId: string | null;
	code: string | null;
	severity: ObservabilitySeverity;
	environment: string;
};

export function getObservabilityEnvironment() {
	return (
		process.env.VERCEL_ENV ??
		process.env.NODE_ENV ??
		process.env.NEXT_RUNTIME ??
		"development"
	);
}

export function normalizeErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return trimToLength(error.message, MAX_MESSAGE_LENGTH);
	}

	if (typeof error === "string") {
		return trimToLength(error, MAX_MESSAGE_LENGTH);
	}

	return "Unexpected error";
}

export function normalizeErrorStack(error: unknown) {
	if (!(error instanceof Error) || typeof error.stack !== "string") {
		return null;
	}

	return trimToLength(error.stack, MAX_STACK_LENGTH);
}

export function formatErrorDetails(details: Record<string, unknown> | null | undefined) {
	if (!details) {
		return null;
	}

	try {
		return trimToLength(JSON.stringify(details), MAX_DETAILS_LENGTH);
	} catch {
		return '{"serialization":"failed"}';
	}
}

export function getErrorCode(error: unknown) {
	if (error instanceof Error && typeof error.name === "string") {
		return error.name;
	}

	return null;
}

export function isNextControlFlowError(error: unknown) {
	if (!(error instanceof Error)) {
		return false;
	}

	return (
		error.message === "NEXT_REDIRECT" ||
		error.message.startsWith("NEXT_HTTP_ERROR_FALLBACK;") ||
		error.message === "NEXT_NOT_FOUND"
	);
}

export function createErrorFingerprint({
	source,
	message,
	code,
	pathname,
}: {
	source: ObservabilitySource;
	message: string;
	code?: string | null;
	pathname?: string | null;
}) {
	const pathKey = pathname ? normalizePathname(pathname) : "no-path";
	const fingerprintBase = [source, code ?? "no-code", pathKey, message].join("|");

	return `err_${hashString(fingerprintBase)}`;
}

export function normalizeObservabilityEvent(
	input: ObservabilityEventInput,
): NormalizedObservabilityEvent {
	const message = normalizeErrorMessage(input.error);
	const code = input.code?.trim() || getErrorCode(input.error);
	const pathname = normalizeNullableText(input.pathname);

	return {
		fingerprint: createErrorFingerprint({
			source: input.source,
			message,
			code,
			pathname,
		}),
		source: input.source,
		message,
		stack: normalizeErrorStack(input.error),
		details: formatErrorDetails(input.details),
		requestId: normalizeNullableText(input.requestId),
		pathname,
		userId: normalizeNullableText(input.userId),
		code,
		severity:
			input.severity ??
			getDefaultSeverity({
				source: input.source,
				pathname,
				code,
			}),
		environment: getObservabilityEnvironment(),
	};
}

export function getDefaultSeverity({
	source,
	pathname,
	code,
}: {
	source: ObservabilitySource;
	pathname?: string | null;
	code?: string | null;
}): ObservabilitySeverity {
	if (source === "stripe") {
		return "high";
	}

	if (source === "codex") {
		return "high";
	}

	if (source === "clerk") {
		return "high";
	}

	if (pathname === "/api/stripe/checkout" || code === "stripe_webhook_failed") {
		return "high";
	}

	return "medium";
}

export function formatStackSnippet(stack: string | null | undefined) {
	if (!stack) {
		return "No stack trace available.";
	}

	const lines = stack.split("\n").slice(0, 6);
	return trimToLength(lines.join("\n"), 700);
}

function normalizePathname(pathname: string) {
	return pathname
		.replace(/\/[0-9a-f]{8,}(?=\/|$)/gi, "/:id")
		.replace(/\/\d+(?=\/|$)/g, "/:id");
}

function normalizeNullableText(value: string | null | undefined) {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = value.trim();
	return normalized.length > 0 ? normalized : null;
}

function trimToLength(value: string, maxLength: number) {
	return value.length > maxLength
		? `${value.slice(0, maxLength - 1)}…`
		: value;
}

function hashString(value: string) {
	let hash = 5381;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 33) ^ value.charCodeAt(index);
	}

	return (hash >>> 0).toString(16);
}
