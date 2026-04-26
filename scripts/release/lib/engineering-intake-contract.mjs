import { createHash } from "node:crypto";

export const ENGINEERING_INTAKE_SOURCE_SYSTEM = "ship_by_sunday";
export const ENGINEERING_INTAKE_SOURCE_REPOSITORY = "ship-by-sunday";
export const ENGINEERING_INTAKE_COMPATIBILITY_POLICY =
	"Within v1, additive optional fields are allowed. Any field removal, rename, or semantic redefinition must ship as v2.";

export const runtimeIntakeSchemaVersion = "runtime-intake.v1";

export const engineeringIntakeSeverityValues = [
	"medium",
	"high",
	"critical",
];

export const runtimeIntakeStatusValues = [
	"firing",
	"acked",
	"muted",
	"resolved",
	"regressed",
];

export const sourceRecordRefKindValues = [
	"convex_document",
	"incident_fingerprint_key",
];

export const evidenceRefKindValues = [
	"native_url",
	"logs_url",
	"runbook",
];

function assert(
	condition,
	message,
) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertEnumValue(value, values, label) {
	assert(
		typeof value === "string" && values.includes(value),
		`${label} must be one of ${values.join(", ")}.`,
	);
}

function assertIsoTimestamp(value, label) {
	assert(typeof value === "string" && value.length > 0, `${label} must be a string.`);
	assert(
		Number.isNaN(Date.parse(value)) === false,
		`${label} must be an ISO-8601 timestamp.`,
	);
}

function assertString(value, label) {
	assert(typeof value === "string" && value.length > 0, `${label} must be a non-empty string.`);
}

function assertNullableString(value, label) {
	assert(
		value === null || typeof value === "string",
		`${label} must be a string or null.`,
	);
}

function assertArray(value, label) {
	assert(Array.isArray(value), `${label} must be an array.`);
}

function assertObject(value, label) {
	assert(
		value !== null && typeof value === "object" && Array.isArray(value) === false,
		`${label} must be an object.`,
	);
}

function normalizeText(value) {
	return value.replaceAll(/\s+/g, " ").trim();
}

function hashIdentity(prefix, payload) {
	return createHash("sha256")
		.update(`${prefix}:${JSON.stringify(payload)}`)
		.digest("hex")
		.slice(0, 16);
}

function assertCommonFeedEnvelope(document, expectedSchemaVersion) {
	assertObject(document, "engineering intake document");
	assert(
		document.schemaVersion === expectedSchemaVersion,
		`schemaVersion must be ${expectedSchemaVersion}.`,
	);
	assertIsoTimestamp(document.generatedAt, "generatedAt");
	assert(
		document.sourceSystem === ENGINEERING_INTAKE_SOURCE_SYSTEM,
		`sourceSystem must be ${ENGINEERING_INTAKE_SOURCE_SYSTEM}.`,
	);
	assert(
		document.sourceRepository === ENGINEERING_INTAKE_SOURCE_REPOSITORY,
		`sourceRepository must be ${ENGINEERING_INTAKE_SOURCE_REPOSITORY}.`,
	);
	assertObject(document.compatibility, "compatibility");
	assert(
		document.compatibility.policy === ENGINEERING_INTAKE_COMPATIBILITY_POLICY,
		"compatibility.policy must match the v1 compatibility contract.",
	);
}

function assertOwnership(ownership, label) {
	assertObject(ownership, label);
	assertString(ownership.sourceOfTruth, `${label}.sourceOfTruth`);
	assertString(ownership.lifecycleOwner, `${label}.lifecycleOwner`);
	assertNullableString(ownership.ackOwner, `${label}.ackOwner`);
	assertNullableString(ownership.resolveOwner, `${label}.resolveOwner`);
	assertString(ownership.notes, `${label}.notes`);
}

function assertSourceRecordRefs(value, label) {
	assertArray(value, label);
	for (const [index, recordRef] of value.entries()) {
		assertObject(recordRef, `${label}[${index}]`);
		assertEnumValue(
			recordRef.kind,
			sourceRecordRefKindValues,
			`${label}[${index}].kind`,
		);
		assertString(recordRef.value, `${label}[${index}].value`);
		assertNullableString(recordRef.label ?? null, `${label}[${index}].label`);
	}
}

function assertEvidenceRefs(value, label) {
	assertArray(value, label);
	for (const [index, evidenceRef] of value.entries()) {
		assertObject(evidenceRef, `${label}[${index}]`);
		assertEnumValue(
			evidenceRef.kind,
			evidenceRefKindValues,
			`${label}[${index}].kind`,
		);
		assertString(evidenceRef.label, `${label}[${index}].label`);
		assertString(evidenceRef.url, `${label}[${index}].url`);
	}
}

function assertCommonItemFields(item, label) {
	assertObject(item, label);
	assertString(item.externalId, `${label}.externalId`);
	assertString(item.dedupeKey, `${label}.dedupeKey`);
	assertEnumValue(item.severity, engineeringIntakeSeverityValues, `${label}.severity`);
	assertString(item.summary, `${label}.summary`);
	assertString(item.canonicalTitle, `${label}.canonicalTitle`);
	assertString(item.canonicalNotes, `${label}.canonicalNotes`);
	assertArray(item.rawTags, `${label}.rawTags`);
	for (const [index, rawTag] of item.rawTags.entries()) {
		assertString(rawTag, `${label}.rawTags[${index}]`);
	}
	assertIsoTimestamp(item.capturedAt, `${label}.capturedAt`);
	assertObject(item.sourceContext, `${label}.sourceContext`);
	assert(
		item.sourceContext.sourceSystem === ENGINEERING_INTAKE_SOURCE_SYSTEM,
		`${label}.sourceContext.sourceSystem must be ${ENGINEERING_INTAKE_SOURCE_SYSTEM}.`,
	);
	assertString(item.sourceContext.sourceLabel, `${label}.sourceContext.sourceLabel`);
	assertSourceRecordRefs(
		item.sourceContext.sourceRecordRefs,
		`${label}.sourceContext.sourceRecordRefs`,
	);
	assertNullableString(
		item.sourceContext.projectTitle ?? null,
		`${label}.sourceContext.projectTitle`,
	);
	assertNullableString(
		item.sourceContext.areaTitle ?? null,
		`${label}.sourceContext.areaTitle`,
	);
	assertNullableString(
		item.sourceContext.locationLabel ?? null,
		`${label}.sourceContext.locationLabel`,
	);
	assertEvidenceRefs(item.evidenceRefs, `${label}.evidenceRefs`);
}

function assertRuntimeItem(item, label) {
	assertCommonItemFields(item, label);
	assertEnumValue(item.status, runtimeIntakeStatusValues, `${label}.status`);
	assertIsoTimestamp(item.firstSeenAt, `${label}.firstSeenAt`);
	assertIsoTimestamp(item.lastSeenAt, `${label}.lastSeenAt`);
	assert(
		Number.isInteger(item.occurrenceCount) && item.occurrenceCount >= 1,
		`${label}.occurrenceCount must be a positive integer.`,
	);
	assertNullableString(item.nextAction ?? null, `${label}.nextAction`);
	assertObject(item.sourceContext.runtime, `${label}.sourceContext.runtime`);
	assertEnumValue(
		item.sourceContext.runtime.environment,
		["dev", "prod"],
		`${label}.sourceContext.runtime.environment`,
	);
	assertString(
		item.sourceContext.runtime.source,
		`${label}.sourceContext.runtime.source`,
	);
	assertString(
		item.sourceContext.runtime.surface,
		`${label}.sourceContext.runtime.surface`,
	);
	assertNullableString(
		item.sourceContext.runtime.canonicalPath ?? null,
		`${label}.sourceContext.runtime.canonicalPath`,
	);
	assertNullableString(
		item.sourceContext.runtime.code ?? null,
		`${label}.sourceContext.runtime.code`,
	);
}

export function buildRuntimeIntakeIdentity({
	canonicalPath,
	code,
	environment,
	source,
	surface,
}) {
	const stablePayload = {
		canonicalPath: canonicalPath ?? null,
		code: code ?? null,
		environment,
		source,
		surface,
	};
	const digest = hashIdentity("runtime-intake", stablePayload);
	return {
		dedupeKey: `sbs:runtime:${digest}`,
		externalId: `sbs:runtime:${digest}`,
	};
}

export function buildRuntimeIntakeFeed({ generatedAt, items }) {
	return {
		schemaVersion: runtimeIntakeSchemaVersion,
		generatedAt,
		sourceSystem: ENGINEERING_INTAKE_SOURCE_SYSTEM,
		sourceRepository: ENGINEERING_INTAKE_SOURCE_REPOSITORY,
		compatibility: {
			policy: ENGINEERING_INTAKE_COMPATIBILITY_POLICY,
		},
		ownership: {
			sourceOfTruth: "ship-by-sunday observability incidents",
			lifecycleOwner: "ship-by-sunday observability incidents",
			ackOwner: "ship-by-sunday observability incident status route",
			resolveOwner: "ship-by-sunday observability incident status route",
			notes:
				"SBS owns runtime incident lifecycle and ack or mute or resolve state through the incidents ledger and status route.",
		},
		items,
	};
}

export function assertRuntimeIntakeFeed(document) {
	assertCommonFeedEnvelope(document, runtimeIntakeSchemaVersion);
	assertOwnership(document.ownership, "ownership");
	assertArray(document.items, "items");
	for (const [index, item] of document.items.entries()) {
		assertRuntimeItem(item, `items[${index}]`);
	}
	return document;
}

export function buildCanonicalTitle(value) {
	return normalizeText(value);
}

export function buildCanonicalNotes(value) {
	return normalizeText(value);
}
