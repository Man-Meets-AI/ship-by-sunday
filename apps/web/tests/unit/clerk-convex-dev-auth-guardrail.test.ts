import {
	buildClerkConvexDevAuthReport,
	getClerkFrontendApiMode,
	getClerkKeyMode,
} from "@/scripts/lib/clerk-convex-dev-auth-guardrail.mjs";
import { describe, expect, it } from "vitest";

describe("clerk convex dev auth guardrail", () => {
	it("classifies Clerk test and live key modes", () => {
		expect(getClerkKeyMode("pk_test_123")).toBe("test");
		expect(getClerkKeyMode("sk_live_123")).toBe("live");
		expect(getClerkKeyMode("not-a-clerk-key")).toBe("unknown");
		expect(getClerkKeyMode(null)).toBe("missing");
	});

	it("classifies Clerk frontend API URLs by environment", () => {
		expect(
			getClerkFrontendApiMode("https://amused-cattle-61.clerk.accounts.dev"),
		).toBe("test");
		expect(getClerkFrontendApiMode("https://clerk.man-meets-ai.com")).toBe(
			"live",
		);
		expect(getClerkFrontendApiMode("not-a-url")).toBe("invalid");
		expect(getClerkFrontendApiMode(null)).toBe("missing");
	});

	it("passes when local Clerk config matches the hosted Convex issuer", () => {
		const report = buildClerkConvexDevAuthReport({
			convexUrl: "https://helpful-meadowlark-297.convex.cloud",
			deploymentName: "helpful-meadowlark-297",
			hostedFrontendApiUrl: "https://amused-cattle-61.clerk.accounts.dev",
			localFrontendApiUrl: "https://amused-cattle-61.clerk.accounts.dev",
			localPublishableKey: "pk_test_123",
			localSecretKey: "sk_test_123",
		});

		expect(report.hasFailure).toBe(false);
		expect(report.checks.every((check) => check.passed)).toBe(true);
	});

	it("fails when the hosted Convex issuer drifts away from local Clerk env", () => {
		const report = buildClerkConvexDevAuthReport({
			convexUrl: "https://helpful-meadowlark-297.convex.cloud",
			deploymentName: "helpful-meadowlark-297",
			hostedFrontendApiUrl: "https://clerk.man-meets-ai.com",
			localFrontendApiUrl: "https://amused-cattle-61.clerk.accounts.dev",
			localPublishableKey: "pk_test_123",
			localSecretKey: "sk_test_123",
		});

		expect(report.hasFailure).toBe(true);
		expect(
			report.checks.find(
				(check) => check.label === "Hosted Convex Clerk issuer",
			)?.passed,
		).toBe(false);
		expect(
			report.checks.find(
				(check) => check.label === "Hosted Convex issuer vs local key mode",
			)?.passed,
		).toBe(false);
	});
});
