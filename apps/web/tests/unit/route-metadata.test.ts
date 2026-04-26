import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
	TaskResetPassword: () => null,
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		access: {
			viewerProductAccess: "access.viewerProductAccess",
		},
	},
}));

vi.mock("@/app/checkout/success/_components/checkout-success-view", () => ({
	CheckoutSuccessView: () => null,
}));

vi.mock("@/features/checkout/server/checkout-session", () => ({
	getCheckoutSessionState: vi.fn(),
}));

vi.mock("@/features/checkout/server/checkout-session-recovery", () => ({
	getPendingCheckoutSessionIdFromCookie: vi.fn(),
}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: vi.fn(),
}));

import { metadata as checkoutSuccessMetadata } from "@/app/checkout/success/page";
import { metadata as resetPasswordMetadata } from "@/app/(identity)/session-tasks/reset-password/page";
import { metadata as signInMetadata } from "@/app/(identity)/sign-in/[[...sign-in]]/page";
import { metadata as ssoCallbackMetadata } from "@/app/(identity)/sso-callback/page";

function expectNoindexRobots(metadata: { robots?: unknown }) {
	expect(metadata.robots).toMatchObject({
		index: false,
		follow: false,
	});
}

describe("route metadata", () => {
	it("keeps identity and checkout recovery routes out of the public index", () => {
		expectNoindexRobots(signInMetadata);
		expectNoindexRobots(resetPasswordMetadata);
		expectNoindexRobots(ssoCallbackMetadata);
		expectNoindexRobots(checkoutSuccessMetadata);
	});
});
