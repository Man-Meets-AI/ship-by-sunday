import "server-only";

import { Buffer } from "node:buffer";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import type { JsonValue, MutableJsonObject } from "@/lib/json-value";
import { requireServerEnv } from "@/platform/env/server";

type CalTriggerEvent =
	| "BOOKING_CREATED"
	| "BOOKING_PAYMENT_INITIATED"
	| "BOOKING_PAID"
	| "BOOKING_RESCHEDULED"
	| "BOOKING_CANCELLED";

type WorkerSealTeam6BookingStatus =
	| "created"
	| "scheduled"
	| "rescheduled"
	| "canceled";

type WorkerSealTeam6PaymentStatus =
	| "unpaid"
	| "payment_pending"
	| "paid"
	| "partially_refunded"
	| "fully_refunded";

type WorkerSealTeam6BookingSyncArgs = {
	calBookingUid: string;
	calEventTypeId?: string;
	stripeCustomerId?: string;
	stripePaymentIntentId?: string;
	status: WorkerSealTeam6BookingStatus;
	paymentStatus: WorkerSealTeam6PaymentStatus;
	refundState?: "none" | "partial_refunded" | "fully_refunded";
	fulfillmentStatus?: "not_started" | "canceled";
	attendeeEmail: string;
	attendeeName?: string;
	attendeeTimeZone?: string;
	scheduledStartAt?: number;
	scheduledEndAt?: number;
	rescheduleUrl?: string;
	cancelUrl?: string;
	calBookingUrl?: string;
	intakeAnswers?: Array<{ label: string; value: string }>;
	paidAt?: number;
	canceledAt?: number;
};

export type WorkerSealTeam6CalWebhookSyncTarget =
	| {
			kind: "booking";
			calEventId: string;
			eventType: CalTriggerEvent;
			booking: WorkerSealTeam6BookingSyncArgs;
	  }
	| {
			kind: "skipped";
			calEventId: string;
			eventType: string;
			reason: string;
			calBookingUid?: string;
	  };

export type WorkerSealTeam6CalWebhookSyncResult =
	| {
			kind: "booking_synced";
			eventId: string;
			calBookingUid: string;
			paidBookingReady: boolean;
	  }
	| {
			kind: "skipped";
			eventId: string;
			reason: string;
	  };

export class WorkerSealTeam6CalWebhookPayloadError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "WorkerSealTeam6CalWebhookPayloadError";
	}
}

type ParsedCalWebhookEnvelope = MutableJsonObject & {
	triggerEvent: string;
	id?: JsonValue;
	eventId?: JsonValue;
	createdAt?: string;
	payload?: JsonValue;
};

const supportedCalTriggerEvents = new Set<string>([
	"BOOKING_CREATED",
	"BOOKING_PAYMENT_INITIATED",
	"BOOKING_PAID",
	"BOOKING_RESCHEDULED",
	"BOOKING_CANCELLED",
]);

const hmacSha256HexPattern = /^[a-f0-9]{64}$/i;
const maxCalWebhookIntakeLabelLength = 120;
const maxCalWebhookIntakeValueLength = 2_000;

export function verifyCalWebhookSignature({
	payload,
	signature,
	secret,
}: {
	payload: string | Uint8Array;
	signature: string;
	secret: string;
}) {
	const normalizedSignature = normalizeCalWebhookSignature(signature);
	if (!normalizedSignature) {
		return false;
	}

	const hmac = createHmac("sha256", secret);
	if (typeof payload === "string") {
		hmac.update(payload, "utf8");
	} else {
		hmac.update(payload);
	}

	const expectedSignature = hmac.digest("hex");
	const expectedBuffer = Buffer.from(expectedSignature, "hex");
	const actualBuffer = Buffer.from(normalizedSignature, "hex");

	return (
		actualBuffer.length === expectedBuffer.length &&
		timingSafeEqual(actualBuffer, expectedBuffer)
	);
}

export function getWorkerSealTeam6CalWebhookSyncTarget(
	rawBody: string,
): WorkerSealTeam6CalWebhookSyncTarget {
	const envelope = parseCalWebhookEnvelope(rawBody);
	const payload = isRecord(envelope.payload) ? envelope.payload : envelope;
	const eventType = envelope.triggerEvent.trim();
	const eventCreatedAt = parseProviderTimestamp(envelope.createdAt);
	const calBookingUid = getProviderStringFromPaths(payload, [
		["uid"],
		["bookingUid"],
		["booking", "uid"],
		["bookingId"],
		["id"],
	]);
	const calEventId =
		getProviderString(envelope.id) ??
		getProviderString(envelope.eventId) ??
		createCalEventId({
			eventType,
			calBookingUid,
			rawBody,
		});

	if (!supportedCalTriggerEvents.has(eventType)) {
		return {
			kind: "skipped",
			calEventId,
			eventType,
			reason: `Unsupported Cal.com trigger event: ${eventType}.`,
			...(calBookingUid ? { calBookingUid } : {}),
		};
	}

	if (!calBookingUid) {
		return {
			kind: "skipped",
			calEventId,
			eventType,
			reason: "Cal.com webhook did not include a booking uid.",
		};
	}

	const attendee = getCalWebhookAttendee(payload);
	if (!attendee?.email) {
		return {
			kind: "skipped",
			calEventId,
			eventType,
			reason: "Cal.com webhook did not include an attendee email.",
			calBookingUid,
		};
	}

	const triggerEvent = eventType as CalTriggerEvent;
	const paymentStatus = getCalBookingPaymentStatus(triggerEvent, payload);
	const bookingStatus = getCalBookingStatus(triggerEvent);
	const paidAt = getPaidTimestamp({
		payload,
		eventCreatedAt,
		triggerEvent,
	});
	const canceledAt =
		triggerEvent === "BOOKING_CANCELLED" ? eventCreatedAt : undefined;
	const booking: WorkerSealTeam6BookingSyncArgs = {
		calBookingUid,
		status: bookingStatus,
		paymentStatus,
		attendeeEmail: attendee.email,
		...optionalField("calEventTypeId", getCalEventTypeId(payload)),
		...optionalField(
			"stripeCustomerId",
			getProviderStringFromPaths(payload, [
				["stripeCustomerId"],
				["payment", "stripeCustomerId"],
				["payment", "customer"],
				["payments", "0", "stripeCustomerId"],
			]),
		),
		...optionalField(
			"stripePaymentIntentId",
			getCalStripePaymentIntentId(payload),
		),
		...optionalField(
			"refundState",
			getRefundStateFromPaymentStatus(paymentStatus),
		),
		...optionalField(
			"fulfillmentStatus",
			triggerEvent === "BOOKING_CANCELLED" ? "canceled" : "not_started",
		),
		...optionalField("attendeeName", attendee.name),
		...optionalField("attendeeTimeZone", attendee.timeZone),
		...optionalField(
			"scheduledStartAt",
			getTimestampFromPaths(payload, [
				["startTime"],
				["start"],
				["booking", "startTime"],
			]),
		),
		...optionalField(
			"scheduledEndAt",
			getTimestampFromPaths(payload, [
				["endTime"],
				["end"],
				["booking", "endTime"],
			]),
		),
		...optionalField(
			"rescheduleUrl",
			getProviderStringFromPaths(payload, [
				["rescheduleUrl"],
				["reschedule_url"],
				["links", "reschedule"],
			]),
		),
		...optionalField(
			"cancelUrl",
			getProviderStringFromPaths(payload, [
				["cancelUrl"],
				["cancel_url"],
				["links", "cancel"],
			]),
		),
		...optionalField(
			"calBookingUrl",
			getProviderStringFromPaths(payload, [
				["calBookingUrl"],
				["bookingUrl"],
				["booking_url"],
				["links", "booking"],
			]),
		),
		...optionalField("intakeAnswers", getCalIntakeAnswers(payload)),
		...optionalField("paidAt", paidAt),
		...optionalField("canceledAt", canceledAt),
	};

	return {
		kind: "booking",
		calEventId,
		eventType: triggerEvent,
		booking,
	};
}

export async function syncWorkerSealTeam6CalWebhookToConvex(
	rawBody: string,
): Promise<WorkerSealTeam6CalWebhookSyncResult> {
	const syncTarget = getWorkerSealTeam6CalWebhookSyncTarget(rawBody);
	if (syncTarget.kind === "skipped") {
		await recordProcessedCalEvent({
			calEventId: syncTarget.calEventId,
			eventType: syncTarget.eventType,
			status: "skipped",
			...(syncTarget.calBookingUid
				? { calBookingUid: syncTarget.calBookingUid }
				: {}),
			errorMessage: syncTarget.reason,
		});

		return {
			kind: "skipped",
			eventId: syncTarget.calEventId,
			reason: syncTarget.reason,
		};
	}

	const bookingSync = await fetchMutation(
		api.billing.syncWorkerSealTeam6BookingFromServer,
		{
			convexWebhookMutationSecret: getConvexWebhookMutationSecret(),
			...syncTarget.booking,
		},
	);
	await recordProcessedCalEvent({
		calEventId: syncTarget.calEventId,
		eventType: syncTarget.eventType,
		status: "applied",
		calBookingUid: syncTarget.booking.calBookingUid,
	});

	return {
		kind: "booking_synced",
		eventId: syncTarget.calEventId,
		calBookingUid: syncTarget.booking.calBookingUid,
		paidBookingReady: bookingSync.paidBookingReady,
	};
}

function getConvexWebhookMutationSecret() {
	return requireServerEnv("CONVEX_WEBHOOK_MUTATION_SECRET");
}

async function recordProcessedCalEvent(args: {
	calEventId: string;
	eventType: string;
	status: "applied" | "skipped" | "failed";
	calBookingUid?: string;
	errorMessage?: string;
}) {
	return await fetchMutation(api.billing.recordProcessedCalEventFromServer, {
		convexWebhookMutationSecret: getConvexWebhookMutationSecret(),
		calEventId: args.calEventId,
		eventType: args.eventType,
		status: args.status,
		...(args.calBookingUid ? { calBookingUid: args.calBookingUid } : {}),
		...(args.errorMessage ? { errorMessage: args.errorMessage } : {}),
	});
}

function normalizeCalWebhookSignature(signature: string) {
	const candidates = signature
		.split(",")
		.map((part) => part.trim())
		.flatMap((part) => [
			part,
			part.replace(/^sha256=/i, ""),
			part.replace(/^v1=/i, ""),
		]);

	return candidates.find((candidate) => hmacSha256HexPattern.test(candidate));
}

function parseCalWebhookEnvelope(rawBody: string): ParsedCalWebhookEnvelope {
	let parsedJson: JsonValue;
	try {
		parsedJson = JSON.parse(rawBody) as JsonValue;
	} catch {
		throw new WorkerSealTeam6CalWebhookPayloadError(
			"Cal.com webhook body must be valid JSON.",
		);
	}

	if (!isRecord(parsedJson)) {
		throw new WorkerSealTeam6CalWebhookPayloadError(
			"Cal.com webhook body is missing triggerEvent.",
		);
	}

	const triggerEvent = getProviderString(parsedJson.triggerEvent);
	if (!triggerEvent) {
		throw new WorkerSealTeam6CalWebhookPayloadError(
			"Cal.com webhook body is missing triggerEvent.",
		);
	}

	return {
		...parsedJson,
		triggerEvent,
		...optionalField("createdAt", getProviderString(parsedJson.createdAt)),
	} satisfies ParsedCalWebhookEnvelope;
}

function createCalEventId({
	eventType,
	calBookingUid,
	rawBody,
}: {
	eventType: string;
	calBookingUid?: string;
	rawBody: string;
}) {
	const digest = createHash("sha256").update(rawBody, "utf8").digest("hex");
	return [
		"cal",
		eventType.toLowerCase(),
		calBookingUid ?? "missing_booking",
		digest.slice(0, 24),
	].join(":");
}

function getCalWebhookAttendee(payload: MutableJsonObject) {
	const attendee =
		getFirstRecord(payload.attendees) ??
		getRecordAtPath(payload, ["attendee"]) ??
		getRecordAtPath(payload, ["booking", "attendee"]);

	if (!attendee) {
		return null;
	}

	const email = getEmailStringFromPaths(attendee, [
		["email"],
		["emailAddress"],
	]);
	if (!email) {
		return null;
	}

	return {
		email,
		name: getProviderStringFromPaths(attendee, [["name"], ["fullName"]]),
		timeZone: getProviderStringFromPaths(attendee, [
			["timeZone"],
			["timezone"],
			["time_zone"],
		]),
	};
}

function getCalEventTypeId(payload: MutableJsonObject) {
	return getProviderStringFromPaths(payload, [
		["eventTypeId"],
		["eventType", "id"],
	]);
}

function getCalBookingStatus(
	triggerEvent: CalTriggerEvent,
): WorkerSealTeam6BookingStatus {
	if (triggerEvent === "BOOKING_PAID") {
		return "scheduled";
	}
	if (triggerEvent === "BOOKING_RESCHEDULED") {
		return "rescheduled";
	}
	if (triggerEvent === "BOOKING_CANCELLED") {
		return "canceled";
	}

	return "created";
}

function getCalBookingPaymentStatus(
	triggerEvent: CalTriggerEvent,
	payload: MutableJsonObject,
): WorkerSealTeam6PaymentStatus {
	const rawPaymentStatus = getProviderStringFromPaths(payload, [
		["paymentStatus"],
		["payment", "status"],
		["payments", "0", "status"],
	])?.toLowerCase();

	if (rawPaymentStatus?.includes("partially_refunded")) {
		return "partially_refunded";
	}
	if (
		rawPaymentStatus?.includes("fully_refunded") ||
		rawPaymentStatus?.includes("refunded")
	) {
		return "fully_refunded";
	}
	if (rawPaymentStatus?.includes("pending")) {
		return "payment_pending";
	}
	if (rawPaymentStatus?.includes("unpaid")) {
		return "unpaid";
	}
	if (rawPaymentStatus?.includes("paid") || rawPaymentStatus === "complete") {
		return "paid";
	}

	if (triggerEvent === "BOOKING_CREATED") {
		return "payment_pending";
	}
	if (triggerEvent === "BOOKING_PAYMENT_INITIATED") {
		return "payment_pending";
	}

	return triggerEvent === "BOOKING_PAID" ? "paid" : "payment_pending";
}

function getRefundStateFromPaymentStatus(
	paymentStatus: WorkerSealTeam6PaymentStatus,
) {
	if (paymentStatus === "fully_refunded") {
		return "fully_refunded" as const;
	}
	if (paymentStatus === "partially_refunded") {
		return "partial_refunded" as const;
	}

	return "none" as const;
}

function getPaidTimestamp({
	payload,
	eventCreatedAt,
	triggerEvent,
}: {
	payload: MutableJsonObject;
	eventCreatedAt: number | undefined;
	triggerEvent: CalTriggerEvent;
}) {
	const paidTimestamp = getTimestampFromPaths(payload, [
		["paidAt"],
		["payment", "paidAt"],
		["payment", "createdAt"],
		["payments", "0", "paidAt"],
		["payments", "0", "createdAt"],
	]);
	if (paidTimestamp) {
		return paidTimestamp;
	}

	return triggerEvent === "BOOKING_PAID" ? eventCreatedAt : undefined;
}

function getCalStripePaymentIntentId(payload: MutableJsonObject) {
	const paymentIntentId = getProviderStringFromPaths(payload, [
		["stripePaymentIntentId"],
		["paymentIntentId"],
		["metadata", "externalId"],
		["payment", "stripePaymentIntentId"],
		["payment", "paymentIntentId"],
		["payments", "0", "paymentIntentId"],
	]);

	return paymentIntentId?.startsWith("pi_") ? paymentIntentId : undefined;
}

function getCalIntakeAnswers(payload: MutableJsonObject) {
	const source =
		getRecordAtPath(payload, ["responses"]) ??
		getRecordAtPath(payload, ["questionsAndAnswers"]) ??
		getRecordAtPath(payload, ["customInputs"]);
	if (!source) {
		return undefined;
	}

	const answers = Object.entries(source)
		.map(([key, value]) => {
			const answer = getIntakeAnswerValue(value);
			if (!answer) {
				return null;
			}

			return {
				label: limitCalWebhookText(
					getIntakeAnswerLabel(key, value),
					maxCalWebhookIntakeLabelLength,
				),
				value: limitCalWebhookText(answer, maxCalWebhookIntakeValueLength),
			};
		})
		.filter((answer): answer is { label: string; value: string } =>
			Boolean(answer),
		)
		.slice(0, 20);

	return answers.length > 0 ? answers : undefined;
}

function getIntakeAnswerLabel(key: string, value: JsonValue | undefined) {
	if (isRecord(value)) {
		return getProviderString(value.label) ?? key;
	}

	return key;
}

function getIntakeAnswerValue(
	value: JsonValue | undefined,
): string | undefined {
	if (typeof value === "string") {
		return trimToOptionalString(value);
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) {
		const answer = value
			.map(getIntakeAnswerValue)
			.filter((entry): entry is string => Boolean(entry))
			.join(", ");
		return trimToOptionalString(answer);
	}
	if (isRecord(value)) {
		return (
			getProviderString(value.value) ??
			getProviderString(value.answer) ??
			getProviderString(value.text)
		);
	}

	return undefined;
}

function getTimestampFromPaths(record: MutableJsonObject, paths: string[][]) {
	for (const path of paths) {
		const timestamp = parseProviderTimestamp(getPathValue(record, path));
		if (timestamp) {
			return timestamp;
		}
	}

	return undefined;
}

function parseProviderTimestamp(value: JsonValue | undefined) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value > 10_000_000_000 ? value : value * 1000;
	}
	if (typeof value !== "string") {
		return undefined;
	}

	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function getEmailStringFromPaths(record: MutableJsonObject, paths: string[][]) {
	for (const path of paths) {
		const value = getPathValue(record, path);
		if (typeof value === "string" && value.includes("@")) {
			return trimToOptionalString(value);
		}
	}

	return undefined;
}

function getProviderStringFromPaths(
	record: MutableJsonObject,
	paths: string[][],
) {
	for (const path of paths) {
		const value = getProviderString(getPathValue(record, path));
		if (value) {
			return value;
		}
	}

	return undefined;
}

function getProviderString(value: JsonValue | undefined) {
	if (typeof value === "string") {
		return trimToOptionalString(value);
	}
	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}

	return undefined;
}

function trimToOptionalString(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function limitCalWebhookText(value: string, maxLength: number) {
	return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function getFirstRecord(value: JsonValue | undefined) {
	return Array.isArray(value) ? value.find(isRecord) : undefined;
}

function getRecordAtPath(record: MutableJsonObject, path: string[]) {
	const value = getPathValue(record, path);
	return isRecord(value) ? value : undefined;
}

function getPathValue(record: MutableJsonObject, path: string[]) {
	let currentValue: JsonValue | undefined = record;
	for (const segment of path) {
		if (Array.isArray(currentValue) && /^\d+$/.test(segment)) {
			currentValue = currentValue[Number(segment)];
			continue;
		}
		if (!isRecord(currentValue)) {
			return undefined;
		}

		currentValue = currentValue[segment];
	}

	return currentValue;
}

function isRecord(value: JsonValue | undefined): value is MutableJsonObject {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalField<Key extends string, Value>(
	key: Key,
	value: Value | undefined,
) {
	return value === undefined ? {} : ({ [key]: value } as Record<Key, Value>);
}
