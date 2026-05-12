import type { JsonValue } from "./json-value";

const SECRET_PATTERNS = [
	/(sbs_run_)[A-Za-z0-9_-]+/g,
	/(sbs_pair_)[A-Za-z0-9_-]+/g,
	/(sk-)[A-Za-z0-9_-]{8,}/g,
	/([A-Za-z0-9_-]*token[A-Za-z0-9_-]*=)[^\s&]+/gi,
	/([A-Za-z0-9_-]*secret[A-Za-z0-9_-]*=)[^\s&]+/gi,
];

const UNSAFE_FIELD_NAMES = new Set(
	[
		"absolutePath",
		"apiKey",
		"authJson",
		"code",
		"codeSnippet",
		"codexTranscript",
		"env",
		"environment",
		"fullLog",
		"localAbsolutePath",
		"log",
		"logs",
		"rawLog",
		"rawLogs",
		"rawSource",
		"rawSourceFile",
		"screenshot",
		"screenshots",
		"secret",
		"secrets",
		"source",
		"sourceExcerpt",
		"terminalLog",
		"terminalLogs",
		"token",
		"transcript",
	].map(normalizeFieldName),
);

const EMBEDDED_LOCAL_ABSOLUTE_PATH_PATTERNS = [
	/(^|[\s"'`([{<:=])~[\\/][^\s"'`)\]}>]+/,
	/(^|[\s"'`([{<:=])\/(?:Users|home|private|tmp|var\/folders|Volumes|workspace|workspaces|mnt|repo|repos)[\\/][^\s"'`)\]}>]*/i,
	/(^|[\s"'`([{<:=])[A-Za-z]:[\\/][^\s"'`)\]}>]+/,
	/(^|[\s"'`([{<:=])\\\\[^\\\s"'`)\]}>]+\\[^\\\s"'`)\]}>]+/,
];
const WINDOWS_ABSOLUTE_PATH_PATTERN = /[A-Za-z]:\\/;

export function redactSensitiveText(text: string) {
	return SECRET_PATTERNS.reduce(
		(redacted, pattern) => redacted.replace(pattern, "$1[redacted]"),
		text,
	);
}

export function normalizeFieldName(fieldName: string) {
	return fieldName.replace(/[_-]/g, "").toLowerCase();
}

export function assertSyncSafeValue(
	value: JsonValue | undefined,
	context: string,
) {
	const unsafeReason = findUnsafeValueReason(value);
	if (unsafeReason) {
		throw new Error(`${context} is not sync-safe: ${unsafeReason}`);
	}
}

function findUnsafeValueReason(value: JsonValue | undefined): string | null {
	if (typeof value === "string") {
		if (looksLikeLocalAbsolutePath(value)) {
			return "local absolute path";
		}
		return null;
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			const reason = findUnsafeValueReason(item);
			if (reason) {
				return reason;
			}
		}
		return null;
	}

	if (value && typeof value === "object") {
		for (const [fieldName, childValue] of Object.entries(value)) {
			if (UNSAFE_FIELD_NAMES.has(normalizeFieldName(fieldName))) {
				return `unsafe field ${fieldName}`;
			}

			const reason = findUnsafeValueReason(childValue);
			if (reason) {
				return reason;
			}
		}
	}

	return null;
}

function looksLikeLocalAbsolutePath(value: string) {
	if (
		value.startsWith("~/") ||
		value.startsWith("/") ||
		value.startsWith("\\\\")
	) {
		return true;
	}

	if (WINDOWS_ABSOLUTE_PATH_PATTERN.test(value)) {
		return true;
	}

	return EMBEDDED_LOCAL_ABSOLUTE_PATH_PATTERNS.some((pattern) =>
		pattern.test(value),
	);
}
