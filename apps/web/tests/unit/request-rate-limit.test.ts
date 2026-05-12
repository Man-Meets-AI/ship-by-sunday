import {
	getRateLimitedResponse,
	resetRequestRateLimitBucketsForTests,
} from "@/app/api/_lib/request-rate-limit";

describe("request rate limit", () => {
	beforeEach(() => {
		resetRequestRateLimitBucketsForTests();
	});

	it("limits requests by identity within the window", () => {
		const request = new Request("https://example.test/api/demo", {
			headers: {
				"x-forwarded-for": "203.0.113.10",
			},
		});
		const options = {
			bucket: "demo",
			identity: "user_123",
			request,
			limit: 2,
			windowMs: 60_000,
		};

		expect(getRateLimitedResponse(options)).toBeNull();
		expect(getRateLimitedResponse(options)).toBeNull();
		const response = getRateLimitedResponse(options);

		expect(response?.status).toBe(429);
		expect(response?.headers.get("retry-after")).toBe("60");
	});
});
