import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const useQueryMock = vi.fn();
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

vi.mock("@/features/checkout/components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<button data-testid="access-required-buy-access" type="button">
			{label}
		</button>
	),
}));

import { AccessRequiredPage } from "../../features/product-access/components/access-required-page";

describe("AccessRequiredPage", () => {
	beforeEach(() => {
		useQueryMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
	});

	it("renders the loading state while the product-access check is still pending", () => {
		useQueryMock.mockReturnValue(undefined);

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Checking product access");
		expect(markup).toContain("Product access check");
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

	it("renders the retry-and-buy paths when the signed-in account has no access", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "no_access",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Access not attached to this account");
		expect(markup).toContain("Retry access check");
		expect(markup).toContain("Already paid");
		expect(markup).toContain("Need to buy access");
		expect(markup).toContain('data-testid="access-required-buy-access"');
		expect(markup).toContain("Buy access now");
		expect(markup).toContain("See offer");
	});

	it("renders the token refresh state separately from signed out", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "token_missing",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Refresh your account session");
		expect(markup).toContain("Session refresh needed");
		expect(markup).toContain("Sign in again");
		expect(markup).not.toContain('data-testid="access-required-buy-access"');
	});
});
