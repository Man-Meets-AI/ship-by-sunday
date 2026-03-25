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

	it("protects the canonical packet workspace routes", async () => {
		await import("@/proxy");

		expect(createRouteMatcherMock).toHaveBeenCalledWith(
			expect.arrayContaining([
				"/start(.*)",
				"/product(.*)",
				"/design(.*)",
				"/marketing(.*)",
				"/build-plan(.*)",
				"/review(.*)",
				"/mission(.*)",
				"/artifacts(.*)",
				"/settings(.*)",
			]),
		);
	});
});
