export {
	formatIncidentDetails as formatErrorDetails,
	formatStackSnippet,
	getDefaultIncidentSurface,
	getDefaultSeverity,
	getErrorCode,
	getIncidentEnvironment as getObservabilityEnvironment,
	incidentSeverityValues as observabilitySeverityValues,
	incidentSourceValues as observabilitySourceValues,
	isNextControlFlowError,
	normalizeErrorStack,
	normalizeErrorTitle as normalizeErrorMessage,
	normalizeIncidentEvent as normalizeObservabilityEvent,
} from "./incident";

export type {
	IncidentEventInput as ObservabilityEventInput,
	IncidentSeverity as ObservabilitySeverity,
	IncidentSource as ObservabilitySource,
	NormalizedIncidentEvent as NormalizedObservabilityEvent,
} from "./incident";

import type { IncidentSource } from "./incident";
import {
	createIncidentFingerprint,
	getDefaultIncidentSurface,
} from "./incident";

export function createErrorFingerprint({
	source,
	message,
	code,
	pathname,
}: {
	source: IncidentSource;
	message: string;
	code?: string | null;
	pathname?: string | null;
}) {
	return createIncidentFingerprint({
		source,
		surface: getDefaultIncidentSurface({
			source,
			code,
			pathname,
		}),
		title: message,
		code,
		pathname,
	});
}
