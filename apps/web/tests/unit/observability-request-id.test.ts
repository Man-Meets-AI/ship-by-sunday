import {
	createRequestId,
	getRequestIdFromHeaderRecord,
	getRequestIdFromRequest,
	jsonWithRequestId,
	withRequestId,
} from "@/platform/observability/request-id";

describe("request id helpers", () => {
	it("prefers the request header when present", () => {
		const request = new Request("https://example.test", {
			headers: {
				"x-request-id": "request_123",
			},
		});

		expect(getRequestIdFromRequest(request)).toBe("request_123");
		expect(
			getRequestIdFromHeaderRecord({
				"x-request-id": "request_456",
			}),
		).toBe("request_456");
	});

	it("falls back to the provided value or a generated id", () => {
		expect(getRequestIdFromRequest(undefined, "fallback_request")).toBe(
			"fallback_request",
		);
		expect(
			getRequestIdFromHeaderRecord(
				{
					"x-request-id": ["request_789"],
				},
				"fallback_request",
			),
		).toBe("request_789");
		expect(createRequestId()).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
		expect(
			getRequestIdFromHeaderRecord({
				"x-request-id": "   ",
			}),
		).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
	});

	it("applies the header to JSON and generic responses", async () => {
		const jsonResponse = jsonWithRequestId(
			{ ok: true },
			undefined,
			"request_json",
		);
		expect(jsonResponse.headers.get("x-request-id")).toBe("request_json");
		expect(await jsonResponse.json()).toEqual({ ok: true });

		const response = withRequestId(new Response(null), "request_response");
		expect(response.headers.get("x-request-id")).toBe("request_response");
	});
});
