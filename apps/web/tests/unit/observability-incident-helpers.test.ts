import { beforeEach, describe, expect, it } from "vitest";

import {
	createIncidentFingerprint,
	formatIncidentDetails,
	formatStackSnippet,
	getDefaultIncidentSurface,
	getDefaultSeverity,
	getIncidentEnvironment,
	normalizeIncidentEvent,
} from "@/lib/observability/incident";

describe("incident helpers", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	it("normalizes deployment environment and path-based fingerprints", () => {
		process.env = {
			...originalEnv,
			VERCEL_ENV: "production",
		};

		const first = createIncidentFingerprint({
			source: "next_runtime",
			surface: "runtime_error",
			title: "Lesson load failed",
			code: "next_request_error",
			pathname: "/lesson/12345",
		});
		const second = createIncidentFingerprint({
			source: "next_runtime",
			surface: "runtime_error",
			title: "Lesson load failed",
			code: "next_request_error",
			pathname: "/lesson/67890",
		});
		const external = createIncidentFingerprint({
			source: "stripe",
			surface: "webhook",
			title: "Stripe webhook failed",
			externalEventId: "evt_123",
		});

		expect(getIncidentEnvironment()).toBe("prod");
		expect(first).toBe(second);
		expect(external).toMatch(/^incident_/);
		expect(external).not.toBe(first);
	});

	it("derives default severities and surfaces for supported sources", () => {
		expect(getDefaultSeverity({ source: "stripe" })).toBe("high");
		expect(getDefaultSeverity({ source: "telegram_delivery" })).toBe(
			"critical",
		);
		expect(
			getDefaultSeverity({
				source: "next_runtime",
				pathname: "/api/stripe/checkout",
			}),
		).toBe("high");
		expect(getDefaultSeverity({ source: "convex" })).toBe("medium");

		expect(
			getDefaultIncidentSurface({
				source: "stripe",
				code: "stripe_webhook_failed",
			}),
		).toBe("webhook");
		expect(getDefaultIncidentSurface({ source: "stripe" })).toBe("billing");
		expect(getDefaultIncidentSurface({ source: "clerk" })).toBe("auth");
		expect(getDefaultIncidentSurface({ source: "vercel" })).toBe("health");
		expect(getDefaultIncidentSurface({ source: "telegram_delivery" })).toBe(
			"delivery",
		);
		expect(getDefaultIncidentSurface({ source: "convex" })).toBe(
			"runtime_error",
		);
	});

	it("normalizes incident payloads and falls back on unserializable details", () => {
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		const event = normalizeIncidentEvent({
			source: "codex",
			error: new Error("Codex failed"),
			pathname: "/api/codex/generate",
			details: circular,
		});

		expect(event).toMatchObject({
			product: "ship-by-sunday",
			environment: "dev",
			source: "codex",
			severity: "high",
			surface: "runtime_error",
			title: "Codex failed",
			code: "Error",
			nextAction:
				"Check the Codex app-server process and the failing API route.",
		});
		expect(event.details).toBe('{"serialization":"failed"}');
		expect(event.fingerprint).toMatch(/^incident_/);
		expect(event.summary).toContain("code=Error");
		expect(event.summary).toContain("path=/api/codex/generate");
	});

	it("formats stack snippets and nullable details safely", () => {
		const stack = Array.from(
			{ length: 20 },
			(_, index) => `line ${index + 1}`,
		).join("\n");

		expect(formatStackSnippet(null)).toBe("No stack trace available.");
		expect(formatStackSnippet(stack).split("\n")).toHaveLength(6);
		expect(formatIncidentDetails(null)).toBeNull();
		expect(formatIncidentDetails({ route: "generate" })).toContain(
			'"route":"generate"',
		);
	});
});
