import { describe, expect, it } from "vitest";

import {
	buildRuntimeCanonicalPath,
	buildRuntimeIntakeExport,
	buildRuntimeIntakeItems,
} from "@/features/observability/export/runtime-intake.mjs";
import { assertRuntimeIntakeFeed } from "../../../../scripts/release/lib/engineering-intake-contract.mjs";

function buildIncident(overrides: Record<string, unknown>) {
	return {
		_id: "incident_default",
		_creationTime: 0,
		product: "ship-by-sunday",
		fingerprint: "incident_default",
		fingerprintKey: "ship-by-sunday:prod:incident_default",
		source: "stripe",
		surface: "webhook",
		severity: "high",
		status: "firing",
		title: "Stripe webhook failed",
		summary: "Stripe webhook summary",
		code: "StripeSignatureVerificationFailed",
		requestId: null,
		pathname: "/api/stripe/webhook",
		userId: null,
		externalEventId: null,
		deploymentId: null,
		nativeUrl: "https://www.man-meets-ai.com/observability/incidents/default",
		logsUrl: "https://vercel.com/acme/ship-by-sunday/logs/default",
		nextAction: "Check Stripe and replay the event after the secret matches.",
		environment: "prod",
		stack: null,
		details: null,
		occurrenceCount: 1,
		firstSeenAt: Date.parse("2026-04-19T15:00:00.000Z"),
		lastSeenAt: Date.parse("2026-04-19T15:00:00.000Z"),
		deliveryStatus: "pending",
		deliveryCount: 0,
		lastDeliveryAt: undefined,
		telegramMessageId: undefined,
		telegramThreadId: undefined,
		lastDeliveryError: undefined,
		latestOccurrenceId: undefined,
		...overrides,
	};
}

describe("runtime intake export", () => {
	it("strips query strings and volatile ids from the canonical path", () => {
		expect(
			buildRuntimeCanonicalPath("/api/stripe/webhook/12345?_rsc=abc#fragment"),
		).toBe("/api/stripe/webhook/:id");
		expect(buildRuntimeCanonicalPath("/workspace/9f3e2c1a45ab/result")).toBe(
			"/workspace/:id/result",
		);
	});

	it("groups repeated runtime incidents into one export item and ignores telegram-delivery incidents", () => {
		const items = buildRuntimeIntakeItems([
			buildIncident({
				_id: "incident_1",
				fingerprintKey: "ship-by-sunday:prod:incident_1",
				occurrenceCount: 3,
				firstSeenAt: Date.parse("2026-04-19T14:45:00.000Z"),
				lastSeenAt: Date.parse("2026-04-19T14:52:00.000Z"),
				pathname: "/api/stripe/webhook?_rsc=first",
			}),
			buildIncident({
				_id: "incident_2",
				latestOccurrenceId: "occurrence_2",
				fingerprintKey: "ship-by-sunday:prod:incident_2",
				severity: "critical",
				occurrenceCount: 4,
				firstSeenAt: Date.parse("2026-04-19T14:53:00.000Z"),
				lastSeenAt: Date.parse("2026-04-19T14:58:44.000Z"),
				pathname: "/api/stripe/webhook?_rsc=second",
			}),
			buildIncident({
				_id: "incident_telegram",
				fingerprintKey: "ship-by-sunday:prod:incident_telegram",
				source: "telegram_delivery",
				surface: "delivery",
				title: "Telegram delivery failed",
				summary: "Telegram delivery failed",
				code: "telegram_delivery_failed",
				pathname: "/api/observability/vercel",
			}),
		]);

		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			severity: "critical",
			status: "firing",
			occurrenceCount: 7,
			sourceContext: {
				runtime: {
					canonicalPath: "/api/stripe/webhook",
				},
			},
		});
		expect(items[0].sourceContext.sourceRecordRefs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: "convex_document",
					value: "incidents:incident_1",
				}),
				expect.objectContaining({
					kind: "convex_document",
					value: "incidents:incident_2",
				}),
				expect.objectContaining({
					kind: "convex_document",
					value: "incidentOccurrences:occurrence_2",
				}),
			]),
		);
		expect(items[0].evidenceRefs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: "native_url",
				}),
				expect.objectContaining({
					kind: "logs_url",
				}),
			]),
		);
	});

	it("keeps acked or resolved state only when no firing or regressed incident remains in the group", () => {
		const items = buildRuntimeIntakeItems([
			buildIncident({
				_id: "incident_acked",
				fingerprintKey: "ship-by-sunday:prod:incident_acked",
				status: "acked",
				occurrenceCount: 2,
				pathname: "/api/stripe/webhook",
			}),
			buildIncident({
				_id: "incident_resolved",
				fingerprintKey: "ship-by-sunday:prod:incident_resolved",
				status: "resolved",
				occurrenceCount: 1,
				lastSeenAt: Date.parse("2026-04-19T14:57:00.000Z"),
				pathname: "/api/stripe/webhook",
			}),
		]);

		expect(items).toHaveLength(1);
		expect(items[0].status).toBe("acked");
	});

	it("builds a contract-valid runtime feed envelope", () => {
		const exportDocument = buildRuntimeIntakeExport({
			generatedAt: "2026-04-19T15:00:00.000Z",
			incidents: [
				buildIncident({
					_id: "incident_1",
					fingerprintKey: "ship-by-sunday:prod:incident_1",
				}),
			],
		});

		expect(() => assertRuntimeIntakeFeed(exportDocument)).not.toThrow();
		expect(exportDocument.items).toHaveLength(1);
	});
});
