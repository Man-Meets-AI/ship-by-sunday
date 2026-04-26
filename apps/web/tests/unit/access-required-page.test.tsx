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

vi.mock("@/features/checkout/components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<button data-testid="access-required-buy-access" type="button">
			{label}
		</button>
	),
}));

globalThis.React = React;

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";

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

	it("renders the product-access check state while access is loading", () => {
		useQueryMock.mockReturnValue(undefined);

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("SHIP BY SUNDAY");
		expect(markup).toContain("Access Required");
		expect(markup).toContain("Checking product access");
		expect(markup).toContain("Protected workspace");
		expect(markup).toContain("What to do next");
		expect(markup).not.toContain("Need help reconnecting access?");
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
	});

	it("renders the sign-in recovery path for signed-out viewers", () => {
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

	it("renders retry and checkout paths when a signed-in account has no access", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "no_access",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Access not attached to this account");
		expect(markup).toContain("Signed in as test-entitled@test.com");
		expect(markup).toContain("Retry access check");
		expect(markup).toContain("What to do next");
		expect(markup).toContain("Need to buy access");
		expect(markup).not.toContain("Recover access");
		expect(markup).toContain('data-testid="access-required-buy-access"');
		expect(markup).toContain("Buy access now");
		expect(markup).toContain("Review pricing");
	});

	it("renders the session refresh state when the Clerk token is missing", () => {
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
