import { beforeEach, describe, expect, it, vi } from "vitest";

const createRouteMatcherMock = vi.fn(() => vi.fn(() => false));
const clerkMiddlewareMock = vi.fn(() => vi.fn());
const getClerkAuthorizedPartiesMock = vi.fn(() => []);
const shouldBypassClerkProtectionMock = vi.fn(() => false);

vi.mock("@clerk/nextjs/server", () => ({
	clerkMiddleware: clerkMiddlewareMock,
	createRouteMatcher: createRouteMatcherMock,
}));

vi.mock("@/platform/auth/clerk-authorized-parties", () => ({
	getClerkAuthorizedParties: getClerkAuthorizedPartiesMock,
}));

vi.mock("@/platform/auth/clerk-middleware-bypass", () => ({
	shouldBypassClerkProtection: shouldBypassClerkProtectionMock,
}));

vi.mock("@/features/observability/server/capture-server-error", () => ({
	captureServerError: vi.fn(),
}));

describe("proxy protected routes", () => {
	beforeEach(() => {
		createRouteMatcherMock.mockClear();
		clerkMiddlewareMock.mockClear();
		getClerkAuthorizedPartiesMock.mockClear();
		shouldBypassClerkProtectionMock.mockClear();
		vi.resetModules();
	});

	it("protects the canonical blueprint workspace routes", async () => {
		await import("@/proxy");

		expect(createRouteMatcherMock).toHaveBeenCalledWith(
			expect.arrayContaining([
				"/blueprint(.*)",
				"/review(.*)",
				"/execute(.*)",
				"/mission(.*)",
				"/lesson(.*)",
				"/artifacts(.*)",
				"/settings(.*)",
			]),
		);
	});

	it("pins protected-route auth redirects to the app-owned auth pages", async () => {
		await import("@/proxy");

		const optionsResolver = clerkMiddlewareMock.mock.calls[0]?.[1];
		expect(typeof optionsResolver).toBe("function");
		expect(optionsResolver()).toEqual({
			signInUrl: "/sign-in",
			signUpUrl: "/sign-up",
		});
	});
});
