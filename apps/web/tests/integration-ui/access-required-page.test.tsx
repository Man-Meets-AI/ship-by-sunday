import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();
const useUserMock = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
		scroll?: boolean;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => "/mission",
	useRouter: () => ({
		replace: replaceMock,
		refresh: refreshMock,
	}),
	useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("convex/react", () => ({
	useQuery: (query: unknown) => useQueryMock(query),
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		signOut: vi.fn(),
	}),
	useUser: () => useUserMock(),
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<button data-testid="access-required-buy-access" type="button">
			{label}
		</button>
	),
}));

import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";

describe("AccessRequiredPage", () => {
	beforeEach(() => {
		useQueryMock.mockReset();
		useUserMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
		useUserMock.mockReturnValue({
			isLoaded: true,
			user: {
				primaryEmailAddress: {
					emailAddress: "test-entitled@test.com",
				},
			},
		});
	});

	it("renders the loading state while the product-access check is still pending", () => {
		useQueryMock.mockReturnValue(undefined);

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("SHIP BY SUNDAY");
		expect(markup).toContain("Access Required");
		expect(markup).toContain("Checking product access");
		expect(markup).toContain("Protected app");
		expect(markup).toContain("What to do next");
		expect(markup).not.toContain("Need help reconnecting access?");
		expect(markup).toContain(
			"Keep this page open while we verify whether product access is ready.",
		);
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
	});

	it("renders the sign-in recovery path for a signed-out viewer", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "signed_out",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Sign in to check your product access");
		expect(markup).toContain("Sign in first");
		expect(markup).toContain("Sign in");
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
	});

	it("renders normal recovery copy for signed-out paid checkout recovery", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "signed_out",
		});

		const markup = renderToStaticMarkup(
			<AccessRequiredPage
				initialAccess={{
					clerkUserId: null,
					hasAccess: false,
					status: "signed_out",
					pendingCheckoutRecovery: {
						kind: "sign_in_required",
						sessionId: "cs_paid_signed_out",
						checkoutEmail: "buyer@example.com",
					},
				}}
			/>,
		);

		expect(markup).toContain("Paid checkout needs the right account");
		expect(markup).toContain("buyer@example.com");
		expect(markup).toContain("Do not buy again");
		expect(markup).not.toContain("/checkout/email-handoff");
		expect(markup).not.toContain("Prove checkout email");
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
	});

	it("renders the retry-and-buy paths when the signed-in account has no access", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "no_access",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Access not attached to this account");
		expect(markup).toContain("Retry access check");
		expect(markup).toContain("Already paid");
		expect(markup).toContain("What to do next");
		expect(markup).toContain("Need to buy access");
		expect(markup).not.toContain("Recover access");
		expect(markup).toContain("Signed in as test-entitled@test.com");
		expect(markup).toContain('data-testid="access-required-buy-access"');
		expect(markup).toContain("Buy access now");
		expect(markup).toContain("Review offer");
		expect(markup).toContain('href="/starter"');
	});

	it("renders paid checkout recovery before purchase actions when a pending claim is known", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "no_access",
		});

		const markup = renderToStaticMarkup(
			<AccessRequiredPage
				initialAccess={{
					clerkUserId: "user_other",
					hasAccess: false,
					status: "no_access",
					pendingCheckoutRecovery: {
						kind: "wrong_account",
						sessionId: "cs_paid_wrong",
						checkoutEmail: "buyer@example.com",
						currentAccountEmail: "other@example.com",
					},
				}}
			/>,
		);

		expect(markup).toContain("Paid checkout needs the right account");
		expect(markup).toContain(
			"Payment is tied to buyer@example.com, but this browser is signed in as other@example.com.",
		);
		expect(markup).toContain("Do not buy again");
		expect(markup).toContain("Recover paid checkout");
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
		expect(markup).not.toContain("Buy access now");
	});

	it("renders the token refresh state separately from signed out", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "token_missing",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Refresh your account session");
		expect(markup).toContain("Session refresh needed");
		expect(markup).toContain("Signed in as test-entitled@test.com");
		expect(markup).toContain("Sign out and sign back in");
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
	});
});
