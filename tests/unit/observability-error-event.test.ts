import {
	createErrorFingerprint,
	formatStackSnippet,
	formatErrorDetails,
	getDefaultSeverity,
	isNextControlFlowError,
	normalizeErrorStack,
	normalizeObservabilityEvent,
} from "@/features/observability/lib/error-event";

describe("observability error event helpers", () => {
	it("normalizes ids in paths when building fingerprints", () => {
		const first = createErrorFingerprint({
			source: "next_server",
			message: "Lesson load failed",
			code: "next_request_error",
			pathname: "/lesson/12345",
		});
		const second = createErrorFingerprint({
			source: "next_server",
			message: "Lesson load failed",
			code: "next_request_error",
			pathname: "/lesson/67890",
		});

		expect(first).toBe(second);
	});

	it("elevates checkout and stripe errors by default", () => {
		expect(
			getDefaultSeverity({
				source: "stripe",
				pathname: "/api/stripe/checkout",
				code: "stripe_checkout_failed",
			}),
		).toBe("high");
		expect(
			getDefaultSeverity({
				source: "next_server",
				pathname: "/mission",
				code: "next_request_error",
			}),
		).toBe("medium");
	});

	it("normalizes request context into a stable event payload", () => {
		const event = normalizeObservabilityEvent({
			source: "codex",
			error: new Error("Codex failed"),
			requestId: "request_123",
			pathname: "/api/codex/generate",
			userId: "user_123",
			code: "server_error",
			details: {
				route: "generate",
			},
		});

		expect(event).toMatchObject({
			source: "codex",
			message: "Codex failed",
			requestId: "request_123",
			pathname: "/api/codex/generate",
			userId: "user_123",
			code: "server_error",
			severity: "high",
		});
		expect(event.fingerprint).toMatch(/^err_/);
		expect(event.details).toContain('"route":"generate"');
	});

	it("handles string and unknown errors without crashing", () => {
		const stringEvent = normalizeObservabilityEvent({
			source: "next_client",
			error: "Hydration failed",
			pathname: "/mission",
		});
		const unknownEvent = normalizeObservabilityEvent({
			source: "next_server",
			error: { nope: true },
			pathname: "/mission",
		});

		expect(stringEvent.message).toBe("Hydration failed");
		expect(unknownEvent.message).toBe("Unexpected error");
	});

	it("trims stack snippets to a compact Telegram-safe summary", () => {
		const stack = Array.from({ length: 20 }, (_, index) => `line ${index + 1}`).join(
			"\n",
		);

		expect(formatStackSnippet(stack).split("\n")).toHaveLength(6);
	});

	it("detects Next.js control flow errors and handles missing stack traces", () => {
		expect(isNextControlFlowError(new Error("NEXT_REDIRECT"))).toBe(true);
		expect(isNextControlFlowError(new Error("NEXT_HTTP_ERROR_FALLBACK;404"))).toBe(
			true,
		);
		expect(isNextControlFlowError("plain")).toBe(false);
		expect(normalizeErrorStack("plain")).toBeNull();
		expect(formatStackSnippet(null)).toBe("No stack trace available.");
	});

	it("falls back when error details cannot be serialized", () => {
		const circular: Record<string, unknown> = {};
		circular.self = circular;

		expect(formatErrorDetails(circular)).toBe('{"serialization":"failed"}');
	});
});
