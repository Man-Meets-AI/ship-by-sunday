import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const useConvexAuthMock = vi.fn();
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
	useConvexAuth: () => useConvexAuthMock(),
	useQuery: (query: unknown, args: unknown) => useQueryMock(query, args),
}));

import { CheckoutSuccessView } from "../../features/checkout/components/checkout-success-view";

function renderView(
	checkoutSessionState:
		| { kind: "missing_session_id" }
		| { kind: "invalid_session"; sessionId: string }
		| { kind: "sign_in_required"; sessionId: string }
		| { kind: "wrong_account"; sessionId: string }
		| { kind: "payment_pending"; sessionId: string; paymentStatus: string }
		| { kind: "validated"; sessionId: string },
	options: {
		initialProductAccess?: unknown;
	} = {},
) {
	return renderToStaticMarkup(
		<CheckoutSuccessView
			checkoutSessionState={checkoutSessionState as never}
			initialProductAccess={options.initialProductAccess as never}
		/>,
	);
}

describe("CheckoutSuccessView", () => {
	beforeEach(() => {
		useConvexAuthMock.mockReset();
		useQueryMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
	});

	it("shows the post-purchase handoff state while access is still catching up", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue({
			hasAccess: false,
		});

		const markup = renderView({
			kind: "validated",
			sessionId: "cs_test_123",
		});

		expect(markup).toContain("Finalizing access");
		expect(markup).toContain("Polling access");
		expect(markup).toContain("Confirming your product access.");
		expect(markup).toContain("What happens next");
		expect(markup).toContain("Open mission");
		expect(markup).toContain('href="/mission"');
		expect(markup).toContain('href="/access-required"');
	});

	it("shows the automatic redirect state once access is live", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue({
			hasAccess: true,
		});

		const markup = renderView({
			kind: "validated",
			sessionId: "cs_live_123",
		});

		expect(markup).toContain("Opening mission");
		expect(markup).toContain("Access ready");
		expect(markup).toContain("Redirect armed");
		expect(markup).toContain("Access confirmed");
		expect(markup).toContain('href="/mission"');
		expect(markup).toContain('href="/access-required"');
	});

	it("renders the ready state from preloaded product access without the live query", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);

		const markup = renderView(
			{
				kind: "validated",
				sessionId: "cs_preloaded_123",
			},
			{ initialProductAccess: { hasAccess: true } },
		);

		expect(markup).toContain("Opening mission");
		expect(markup).toContain("Access ready");
	});

	it("renders the sign-in recovery path for a missing authenticated session", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);

		const markup = renderView({
			kind: "sign_in_required",
			sessionId: "cs_sign_in",
		});

		expect(markup).toContain("Finish access handoff");
		expect(markup).toContain("Sign in required");
		expect(markup).toContain("Use the checkout account");
		expect(markup).toContain("Sign in to continue");
		expect(markup).toContain(
			'href="/sign-in?redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_sign_in"',
		);
	});

	it("renders the account-mismatch recovery copy", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue({
			hasAccess: false,
		});

		const markup = renderView({
			kind: "wrong_account",
			sessionId: "cs_wrong_account",
		});

		expect(markup).toContain("Wrong account for this checkout");
		expect(markup).toContain("Account mismatch");
		expect(markup).toContain("Use the checkout account");
		expect(markup).toContain(
			"The checkout session belongs to a different Clerk account.",
		);
	});

	it.each([
		[
			"missing_session_id",
			{
				kind: "missing_session_id",
			},
			"Missing checkout session",
		],
		[
			"invalid_session",
			{
				kind: "invalid_session",
				sessionId: "cs_invalid",
			},
			"Session invalid",
		],
	] as const)(
		"renders the recovery surface for %s",
		(_label, checkoutSessionState, expectedStatusLabel) => {
			useConvexAuthMock.mockReturnValue({
				isAuthenticated: false,
				isLoading: false,
			});
			useQueryMock.mockReturnValue(undefined);

			const markup = renderView(checkoutSessionState);

			expect(markup).toContain(expectedStatusLabel);
			expect(markup).toContain("Open mission");
			expect(markup).toContain("Check access");
			expect(markup).toContain("Go home");
		},
	);
});
