import { productConfig } from "@/config/product";
import type { JsonObject } from "@/lib/json-value";

const MAX_TITLE_LENGTH = 160;
const MAX_SUMMARY_LENGTH = 320;
const MAX_STACK_LENGTH = 2_000;
const MAX_DETAILS_LENGTH = 2_000;

export const incidentEnvironmentValues = ["dev", "prod"] as const;

export const incidentSourceValues = [
	"next_runtime",
	"next_client",
	"convex",
	"stripe",
	"clerk",
	"vercel",
	"codex",
	"telegram_delivery",
] as const;

export const incidentSurfaceValues = [
	"runtime_error",
	"auth",
	"billing",
	"webhook",
	"delivery",
	"health",
	"config_drift",
	"unknown",
] as const;

export const incidentSeverityValues = ["medium", "high", "critical"] as const;

export const incidentStatusValues = [
	"firing",
	"acked",
	"muted",
	"resolved",
	"regressed",
] as const;

export const incidentControlStatusValues = [
	"acked",
	"muted",
	"resolved",
	"firing",
] as const;

export type IncidentEnvironment = (typeof incidentEnvironmentValues)[number];
export type IncidentSource = (typeof incidentSourceValues)[number];
export type IncidentSurface = (typeof incidentSurfaceValues)[number];
export type IncidentSeverity = (typeof incidentSeverityValues)[number];
export type IncidentStatus = (typeof incidentStatusValues)[number];
export type IncidentControlStatus =
	(typeof incidentControlStatusValues)[number];

export type IncidentError = Error | string | null | undefined;

export type IncidentEventInput = {
	source: IncidentSource;
	error: IncidentError;
	requestId?: string | null;
	pathname?: string | null;
	userId?: string | null;
	code?: string | null;
	severity?: IncidentSeverity;
	surface?: IncidentSurface;
	details?: JsonObject | null;
	externalEventId?: string | null;
	deploymentId?: string | null;
	nativeUrl?: string | null;
	logsUrl?: string | null;
	nextAction?: string | null;
};

export type NormalizedIncidentEvent = {
	product: string;
	environment: IncidentEnvironment;
	source: IncidentSource;
	surface: IncidentSurface;
	severity: IncidentSeverity;
	fingerprint: string;
	title: string;
	summary: string;
	code: string | null;
	requestId: string | null;
	pathname: string | null;
	userId: string | null;
	externalEventId: string | null;
	deploymentId: string | null;
	nativeUrl: string | null;
	logsUrl: string | null;
	nextAction: string | null;
	stack: string | null;
	details: string | null;
};

export function getIncidentEnvironment(): IncidentEnvironment {
	const rawEnvironment =
		process.env.VERCEL_ENV ??
		process.env.NODE_ENV ??
		process.env.NEXT_RUNTIME ??
		"development";

	return rawEnvironment === "production" ? "prod" : "dev";
}

export function normalizeErrorTitle(error: IncidentError) {
	if (error instanceof Error) {
		return trimToLength(error.message, MAX_TITLE_LENGTH);
	}

	if (typeof error === "string") {
		return trimToLength(error, MAX_TITLE_LENGTH);
	}

	return "Unexpected error";
}

export function normalizeErrorStack(error: IncidentError) {
	if (!(error instanceof Error) || typeof error.stack !== "string") {
		return null;
	}

	return trimToLength(error.stack, MAX_STACK_LENGTH);
}

export function formatIncidentDetails(details: JsonObject | null | undefined) {
	if (!details) {
		return null;
	}

	try {
		return trimToLength(JSON.stringify(details), MAX_DETAILS_LENGTH);
	} catch {
		return '{"serialization":"failed"}';
	}
}

export function getErrorCode(error: IncidentError) {
	if (error instanceof Error && typeof error.name === "string") {
		return error.name;
	}

	return null;
}

export function isNextControlFlowError(error: IncidentError) {
	if (!(error instanceof Error)) {
		return false;
	}

	return (
		error.message === "NEXT_REDIRECT" ||
		error.message.startsWith("NEXT_HTTP_ERROR_FALLBACK;") ||
		error.message === "NEXT_NOT_FOUND"
	);
}

export function createIncidentFingerprint({
	source,
	surface,
	title,
	code,
	pathname,
	externalEventId,
}: {
	source: IncidentSource;
	surface: IncidentSurface;
	title: string;
	code?: string | null;
	pathname?: string | null;
	externalEventId?: string | null;
}) {
	if (externalEventId) {
		return `incident_${hashString(`${source}|external|${externalEventId}`)}`;
	}

	const pathKey = pathname ? normalizePathname(pathname) : "no-path";
	const fingerprintBase = [
		source,
		surface,
		code ?? "no-code",
		pathKey,
		title,
	].join("|");

	return `incident_${hashString(fingerprintBase)}`;
}

export function normalizeIncidentEvent(
	input: IncidentEventInput,
): NormalizedIncidentEvent {
	const title = normalizeErrorTitle(input.error);
	const code = input.code?.trim() || getErrorCode(input.error);
	const pathname = normalizeNullableText(input.pathname);
	const details = formatIncidentDetails(input.details);
	const surface =
		input.surface ??
		getDefaultIncidentSurface({
			source: input.source,
			code,
			pathname,
		});

	return {
		product: productConfig.appId,
		environment: getIncidentEnvironment(),
		source: input.source,
		surface,
		severity:
			input.severity ??
			getDefaultSeverity({
				source: input.source,
				pathname,
				code,
			}),
		fingerprint: createIncidentFingerprint({
			source: input.source,
			surface,
			title,
			code,
			pathname,
			externalEventId: input.externalEventId,
		}),
		title,
		summary: buildIncidentSummary({
			title,
			code,
			pathname,
			details,
		}),
		code,
		requestId: normalizeNullableText(input.requestId),
		pathname,
		userId: normalizeNullableText(input.userId),
		externalEventId: normalizeNullableText(input.externalEventId),
		deploymentId: normalizeNullableText(input.deploymentId),
		nativeUrl: normalizeNullableText(input.nativeUrl),
		logsUrl: normalizeNullableText(input.logsUrl),
		nextAction:
			normalizeNullableText(input.nextAction) ??
			getDefaultNextAction(input.source),
		stack: normalizeErrorStack(input.error),
		details,
	};
}

export function getDefaultSeverity({
	source,
	pathname,
	code,
}: {
	source: IncidentSource;
	pathname?: string | null;
	code?: string | null;
}): IncidentSeverity {
	if (
		source === "stripe" ||
		source === "clerk" ||
		source === "vercel" ||
		source === "codex"
	) {
		return "high";
	}

	if (pathname === "/api/stripe/checkout" || code === "stripe_webhook_failed") {
		return "high";
	}

	if (source === "telegram_delivery") {
		return "critical";
	}

	return "medium";
}

export function getDefaultIncidentSurface({
	source,
	code,
	pathname,
}: {
	source: IncidentSource;
	code?: string | null;
	pathname?: string | null;
}): IncidentSurface {
	if (source === "stripe") {
		if (code === "stripe_webhook_failed" || pathname === "/stripe/webhook") {
			return "webhook";
		}

		return "billing";
	}

	if (source === "clerk") {
		return "auth";
	}

	if (source === "vercel") {
		return "health";
	}

	if (source === "telegram_delivery") {
		return "delivery";
	}

	return "runtime_error";
}

export function formatStackSnippet(stack: string | null | undefined) {
	if (!stack) {
		return "No stack trace available.";
	}

	const lines = stack.split("\n").slice(0, 6);
	return trimToLength(lines.join("\n"), 700);
}

function buildIncidentSummary({
	title,
	code,
	pathname,
	details,
}: {
	title: string;
	code?: string | null;
	pathname?: string | null;
	details?: string | null;
}) {
	const parts = [
		code ? `code=${code}` : null,
		pathname ? `path=${pathname}` : null,
		details,
	].filter((value): value is string => Boolean(value));

	if (parts.length === 0) {
		return trimToLength(title, MAX_SUMMARY_LENGTH);
	}

	return trimToLength(parts.join(" | "), MAX_SUMMARY_LENGTH);
}

function getDefaultNextAction(source: IncidentSource) {
	switch (source) {
		case "stripe":
			return "Check the Stripe dashboard and the failing checkout or webhook path.";
		case "clerk":
			return "Check Clerk auth state and the failing proxy or webhook flow.";
		case "vercel":
			return "Check the failing Vercel deployment and the deployment event history.";
		case "codex":
			return "Check the Codex app-server process and the failing API route.";
		case "convex":
			return "Check the failing Convex function and recent deploy state.";
		case "telegram_delivery":
			return "Restore Telegram bot delivery before relying on chat alerts.";
		case "next_client":
			return "Reproduce in the browser and inspect the failing client path.";
		case "next_runtime":
			return "Check the failing request path and recent server logs.";
		default:
			return null;
	}
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
	return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function hashString(value: string) {
	let hash = 5381;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 33) ^ value.charCodeAt(index);
	}

	return (hash >>> 0).toString(16);
}
