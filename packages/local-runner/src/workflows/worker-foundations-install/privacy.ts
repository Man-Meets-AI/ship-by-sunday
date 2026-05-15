import type { WorkerPrivacyBoundary } from "./types";

export function buildPrivacyBoundary(): WorkerPrivacyBoundary {
	return {
		rawSourceIncluded: false,
		rawLogsIncluded: false,
		packageScriptBodiesIncluded: false,
		dependencyVersionsIncluded: false,
		localAbsolutePathsIncluded: false,
		codexTranscriptsIncluded: false,
	};
}
