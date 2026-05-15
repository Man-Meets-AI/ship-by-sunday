import {
	buildCanonicalNotes,
	buildCanonicalTitle,
	buildRuntimeIntakeFeed,
	buildRuntimeIntakeIdentity,
} from "../../../../../scripts/release/lib/engineering-intake-contract.mjs";

const RUNTIME_STATUS_PRIORITY = {
	firing: 4,
	regressed: 4,
	acked: 3,
	muted: 2,
	resolved: 1,
};

const RUNTIME_SEVERITY_PRIORITY = {
	critical: 3,
	high: 2,
	medium: 1,
};

function toIsoTimestamp(value) {
	return new Date(value).toISOString();
}

function buildRuntimeLocationLabel() {
	return "Observability / Ship by Sunday";
}

function normalizeTagValue(value) {
	return value.replaceAll(/\s+/g, "_").toLowerCase();
}

function buildRuntimeTagSet({ code, environment, source, surface }) {
	return [environment, source, surface, code]
		.filter((value) => typeof value === "string" && value.trim().length > 0)
		.map((value) => normalizeTagValue(value))
		.sort();
}

function dedupeByUrl(items) {
	const seenUrls = new Set();
	const deduped = [];

	for (const item of items) {
		if (!item?.url || seenUrls.has(item.url)) {
			continue;
		}

		seenUrls.add(item.url);
		deduped.push(item);
	}

	return deduped;
}

function sortIncidentsByRecency(leftValue, rightValue) {
	if (rightValue.lastSeenAt !== leftValue.lastSeenAt) {
		return rightValue.lastSeenAt - leftValue.lastSeenAt;
	}

	if (rightValue.firstSeenAt !== leftValue.firstSeenAt) {
		return rightValue.firstSeenAt - leftValue.firstSeenAt;
	}

	return String(leftValue._id).localeCompare(String(rightValue._id));
}

function pickMostSevereValue(items, key, priorityMap) {
	return items.reduce((currentBest, item) => {
		if (!currentBest) {
			return item[key];
		}

		return priorityMap[item[key]] > priorityMap[currentBest]
			? item[key]
			: currentBest;
	}, null);
}

function pickGroupedStatus(incidents) {
	return pickMostSevereValue(incidents, "status", RUNTIME_STATUS_PRIORITY);
}

function pickGroupedSeverity(incidents) {
	return pickMostSevereValue(incidents, "severity", RUNTIME_SEVERITY_PRIORITY);
}

export function buildRuntimeCanonicalPath(pathname) {
	if (typeof pathname !== "string") {
		return null;
	}

	const normalizedPathname =
		pathname.split("?")[0]?.split("#")[0]?.trim() ?? "";
	if (normalizedPathname.length === 0) {
		return null;
	}

	return normalizedPathname
		.replace(/\/[0-9a-f]{8,}(?=\/|$)/gi, "/:id")
		.replace(/\/\d+(?=\/|$)/g, "/:id");
}

export function buildRuntimeGroupingKey(incident) {
	const canonicalPath = buildRuntimeCanonicalPath(incident.pathname);

	return [
		incident.environment,
		incident.source,
		incident.surface,
		incident.code ?? "no-code",
		canonicalPath ?? "no-path",
	].join("|");
}

function buildEvidenceRefs(incidents) {
	return dedupeByUrl(
		incidents.flatMap((incident) => {
			const refs = [];

			if (incident.nativeUrl) {
				refs.push({
					kind: "native_url",
					label: "SBS incident detail",
					url: incident.nativeUrl,
				});
			}

			if (incident.logsUrl) {
				refs.push({
					kind: "logs_url",
					label: "SBS runtime logs",
					url: incident.logsUrl,
				});
			}

			return refs;
		}),
	);
}

function buildSourceRecordRefs(incidents) {
	const recordRefs = [];
	const seenValues = new Set();

	for (const incident of incidents) {
		const candidateRefs = [
			{
				kind: "convex_document",
				value: `incidents:${incident._id}`,
				label: "Grouped Convex incident",
			},
			incident.latestOccurrenceId
				? {
						kind: "convex_document",
						value: `incidentOccurrences:${incident.latestOccurrenceId}`,
						label: "Latest Convex incident occurrence",
					}
				: null,
			{
				kind: "incident_fingerprint_key",
				value: incident.fingerprintKey,
				label: "Incident fingerprint key",
			},
		];

		for (const candidateRef of candidateRefs) {
			if (!candidateRef?.value || seenValues.has(candidateRef.value)) {
				continue;
			}

			seenValues.add(candidateRef.value);
			recordRefs.push(candidateRef);
		}
	}

	return recordRefs;
}

function buildCanonicalNotesForGroup({
	canonicalPath,
	code,
	groupedIncidentCount,
	totalOccurrences,
}) {
	return buildCanonicalNotes(
		[
			`Grouped ${groupedIncidentCount} SBS incident rows into one export record with ${totalOccurrences} total occurrences.`,
			code ? `Code: ${code}.` : null,
			canonicalPath ? `Canonical path: ${canonicalPath}.` : null,
			"Lifecycle state still belongs to the SBS incidents ledger and status route.",
		]
			.filter(Boolean)
			.join(" "),
	);
}

function buildRuntimeIntakeItem(incidents) {
	const sortedIncidents = [...incidents].sort(sortIncidentsByRecency);
	const latestIncident = sortedIncidents[0];
	const groupedSeverity = pickGroupedSeverity(sortedIncidents);
	const groupedStatus = pickGroupedStatus(sortedIncidents);
	const canonicalPath = buildRuntimeCanonicalPath(latestIncident.pathname);
	const totalOccurrences = sortedIncidents.reduce(
		(total, incident) => total + incident.occurrenceCount,
		0,
	);
	const firstSeenAt = Math.min(
		...sortedIncidents.map((incident) => incident.firstSeenAt),
	);
	const lastSeenAt = Math.max(
		...sortedIncidents.map((incident) => incident.lastSeenAt),
	);
	const { externalId, dedupeKey } = buildRuntimeIntakeIdentity({
		canonicalPath,
		code: latestIncident.code,
		environment: latestIncident.environment,
		source: latestIncident.source,
		surface: latestIncident.surface,
	});

	return {
		externalId,
		dedupeKey,
		severity: groupedSeverity,
		status: groupedStatus,
		summary: latestIncident.summary,
		canonicalTitle: buildCanonicalTitle(latestIncident.title),
		canonicalNotes: buildCanonicalNotesForGroup({
			canonicalPath,
			code: latestIncident.code,
			groupedIncidentCount: sortedIncidents.length,
			totalOccurrences,
		}),
		rawTags: buildRuntimeTagSet({
			code: latestIncident.code,
			environment: latestIncident.environment,
			source: latestIncident.source,
			surface: latestIncident.surface,
		}),
		capturedAt: toIsoTimestamp(lastSeenAt),
		firstSeenAt: toIsoTimestamp(firstSeenAt),
		lastSeenAt: toIsoTimestamp(lastSeenAt),
		occurrenceCount: totalOccurrences,
		nextAction: latestIncident.nextAction ?? null,
		sourceContext: {
			sourceSystem: "ship_by_sunday",
			sourceLabel: "observability/incident-group",
			sourceRecordRefs: buildSourceRecordRefs(sortedIncidents),
			projectTitle: "Ship by Sunday",
			areaTitle: "Observability",
			locationLabel: buildRuntimeLocationLabel(),
			runtime: {
				environment: latestIncident.environment,
				source: latestIncident.source,
				surface: latestIncident.surface,
				canonicalPath,
				code: latestIncident.code ?? null,
			},
		},
		evidenceRefs: buildEvidenceRefs(sortedIncidents),
	};
}

export function buildRuntimeIntakeItems(incidents) {
	const groupedIncidents = new Map();

	for (const incident of incidents) {
		if (incident.source === "telegram_delivery") {
			continue;
		}

		const groupingKey = buildRuntimeGroupingKey(incident);
		const matchingIncidents = groupedIncidents.get(groupingKey) ?? [];
		matchingIncidents.push(incident);
		groupedIncidents.set(groupingKey, matchingIncidents);
	}

	return [...groupedIncidents.values()]
		.map((group) => buildRuntimeIntakeItem(group))
		.sort((leftValue, rightValue) =>
			rightValue.lastSeenAt.localeCompare(leftValue.lastSeenAt),
		);
}

export function buildRuntimeIntakeExport({ generatedAt, incidents }) {
	return buildRuntimeIntakeFeed({
		generatedAt,
		items: buildRuntimeIntakeItems(incidents),
	});
}
