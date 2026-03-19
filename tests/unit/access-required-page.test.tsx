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
	useRouter: () => ({
		replace: replaceMock,
		refresh: refreshMock,
	}),
}));

vi.mock("convex/react", () => ({
	useQuery: (query: unknown) => useQueryMock(query),
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		children,
		title,
		subtitle,
	}: {
		children: React.ReactNode;
		title: string;
		subtitle: string;
	}) => (
		<div data-product-shell={title} data-subtitle={subtitle}>
			{children}
		</div>
	),
}));

vi.mock("@/features/checkout/components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<div data-checkout-button={label}>{label}</div>
	),
}));

globalThis.React = React;

import { AccessRequiredPage } from "@/features/course/access/components/access-required-page";

describe("AccessRequiredPage", () => {
	beforeEach(() => {
		useQueryMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
	});

	it("renders the purchase sync state while viewer access is loading", () => {
		useQueryMock.mockReturnValue(undefined);

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Checking access");
		expect(markup).toContain("Checking course access");
		expect(markup).toContain("Waiting on access");
		expect(markup).not.toContain("data-checkout-button");
	});

	it("renders the sign-in recovery path for signed-out viewers", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "signed_out",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Sign in to check your access");
		expect(markup).toContain("Sign in first");
		expect(markup).toContain("Continue to sign in");
		expect(markup).not.toContain("data-checkout-button");
	});

	it("renders retry and checkout paths when an entitled account is still missing access", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "none",
		});

		const markup = renderToStaticMarkup(<AccessRequiredPage />);

		expect(markup).toContain("Access not attached to this account");
		expect(markup).toContain("Retry access check");
		expect(markup).toContain("Choose next step");
		expect(markup).toContain('data-checkout-button="Buy access now"');
	});
});
