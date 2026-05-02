import { productConfig } from "@/config/product";
import { formatStackSnippet } from "@/lib/observability/incident";

const TELEGRAM_MAX_LENGTH = 3_900;

type TelegramRenderableIncident = {
	product: string;
	environment: string;
	source: string;
	surface: string;
	severity: string;
	status: string;
	title: string;
	summary: string;
	occurrenceCount: number;
	firstSeenAt: number;
	lastSeenAt: number;
	requestId?: string | null;
	userId?: string | null;
	code?: string | null;
	pathname?: string | null;
	externalEventId?: string | null;
	deploymentId?: string | null;
	nativeUrl?: string | null;
	logsUrl?: string | null;
	nextAction?: string | null;
	details?: string | null;
	stack?: string | null;
};

export function renderIncidentMessage(incident: TelegramRenderableIncident) {
	const lines = [
		`[${productConfig.name}][${incident.environment.toUpperCase()}][${formatLabel(incident.source)}][${incident.severity}] ${incident.title}`,
		`surface: ${incident.surface}`,
		`status: ${incident.status}`,
		`occurrences: ${incident.occurrenceCount}`,
		`first_seen: ${new Date(incident.firstSeenAt).toISOString()}`,
		`last_seen: ${new Date(incident.lastSeenAt).toISOString()}`,
	];

	appendLine(lines, "request_id", incident.requestId);
	appendLine(lines, "user_id", incident.userId);
	appendLine(lines, "code", incident.code);
	appendLine(lines, "path", incident.pathname);
	appendLine(lines, "external_event_id", incident.externalEventId);
	appendLine(lines, "deployment_id", incident.deploymentId);

	lines.push("");
	lines.push(`summary: ${incident.summary}`);

	if (incident.details) {
		lines.push(`details: ${incident.details}`);
	}

	if (incident.nativeUrl) {
		lines.push(`native: ${incident.nativeUrl}`);
	}

	if (incident.logsUrl) {
		lines.push(`logs: ${incident.logsUrl}`);
	}

	if (incident.nextAction) {
		lines.push(`next: ${incident.nextAction}`);
	}

	lines.push("");
	lines.push("stack:");
	lines.push(formatStackSnippet(incident.stack));

	return trimTelegramMessage(lines.join("\n"));
}

function appendLine(
	lines: string[],
	label: string,
	value: string | null | undefined,
) {
	if (!value) {
		return;
	}

	lines.push(`${label}: ${value}`);
}

function formatLabel(value: string) {
	return value
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function trimTelegramMessage(message: string) {
	if (message.length <= TELEGRAM_MAX_LENGTH) {
		return message;
	}

	return `${message.slice(0, TELEGRAM_MAX_LENGTH - 17)}\n\n[TRUNCATED]`;
}
