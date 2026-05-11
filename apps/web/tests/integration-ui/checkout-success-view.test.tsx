import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const signOutMock = vi.fn();
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

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		signOut: signOutMock,
	}),
}));

import { CheckoutSuccessView } from "@/app/checkout/success/_components/checkout-success-view";

function renderView(
	checkoutSessionState:
		| { kind: "missing_session_id" }
		| { kind: "invalid_session"; sessionId: string }
		| {
				kind: "sign_in_required";
				sessionId: string;
				checkoutEmail?: string;
				currentAccountEmail?: string;
		  }
		| {
				kind: "fulfillment_failed";
				sessionId: string;
				checkoutEmail?: string;
				message: string;
		  }
		| {
				kind: "wrong_account";
				sessionId: string;
				checkoutEmail?: string;
				currentAccountEmail?: string;
		  }
		| { kind: "payment_pending"; sessionId: string; paymentStatus: string }
		| {
				kind: "validated";
				sessionId: string;
				fulfillmentTrack:
					| "generated_codebase"
					| "existing_codebase_doctor"
					| "unspecified";
		  },
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
		signOutMock.mockReset();
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
			fulfillmentTrack: "generated_codebase",
		});

		expect(markup).toContain("Finalizing access");
		expect(markup).toContain("Polling access");
		expect(markup).toContain("Confirming your product access.");
		expect(markup).toContain("What happens next");
		expect(markup).toContain("Open home");
		expect(markup).toContain('href="/home?welcome=checkout"');
		expect(markup).not.toContain("Opening home");
		expect(markup).not.toContain("checkout-success-redirect-affordance");
		expect(markup).not.toContain("checkout-success-status-pulse-armed-ring");
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
			fulfillmentTrack: "generated_codebase",
		});

		expect(markup).toContain("Opening home");
		expect(markup).toContain("Access ready");
		expect(markup).toContain("Redirect armed");
		expect(markup).toContain("Access confirmed");
		expect(markup).toContain('href="/home?welcome=checkout"');
		expect(markup).toContain("Opening home");
		expect(markup).toContain(
			'data-testid="checkout-success-redirect-affordance"',
		);
		expect(markup).toContain('data-testid="checkout-success-cta-primary"');
		expect(markup).toContain('data-testid="checkout-success-cta-tertiary"');
		expect(markup).toContain('data-testid="checkout-success-heading"');
		expect(markup).toContain(
			'data-testid="checkout-success-status-pulse-armed-ring"',
		);
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
				fulfillmentTrack: "generated_codebase",
			},
			{ initialProductAccess: { hasAccess: true } },
		);

		expect(markup).toContain("Opening home");
		expect(markup).toContain("Access ready");
	});

	it("routes existing-codebase fulfillment through home", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue({
			hasAccess: true,
		});

		const markup = renderView({
			kind: "validated",
			sessionId: "cs_existing_123",
			fulfillmentTrack: "existing_codebase_doctor",
		});

		expect(markup).toContain("Opening home");
		expect(markup).toContain("Open home");
		expect(markup).toContain('href="/home?welcome=checkout"');
	});

	it("routes legacy missing intent through home", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReturnValue({
			hasAccess: true,
		});

		const markup = renderView({
			kind: "validated",
			sessionId: "cs_legacy_123",
			fulfillmentTrack: "unspecified",
		});

		expect(markup).toContain("Opening home");
		expect(markup).toContain("Open home");
		expect(markup).toContain('href="/home?welcome=checkout"');
	});

	it("renders the normal sign-in path for a paid checkout email", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);

		const markup = renderView({
			kind: "sign_in_required",
			sessionId: "cs_sign_in",
			checkoutEmail: "buyer@example.com",
		});

		expect(markup).toContain("Finish access handoff");
		expect(markup).toContain("Sign in required");
		expect(markup).toContain("Use the checkout account");
		expect(markup).toContain("Sign in with checkout email");
		expect(markup).toContain("Payment is confirmed for buyer@example.com");
		expect(markup).toContain("Do not buy again");
		expect(markup).toContain(
			'href="/sign-in?redirect_url=%2Fhome%3Fwelcome%3Dcheckout"',
		);
		expect(markup).not.toContain("Create account");
		expect(markup).not.toContain("/checkout/email-handoff");
	});

	it("renders fulfillment failure without asking for a second checkout", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);

		const markup = renderView({
			kind: "fulfillment_failed",
			sessionId: "cs_failed",
			checkoutEmail: "buyer@example.com",
			message: "Clerk API unavailable.",
		});

		expect(markup).toContain("Access needs support");
		expect(markup).toContain("Do not buy again");
		expect(markup).toContain("Clerk API unavailable.");
		expect(markup).toContain(
			'href="/sign-in?redirect_url=%2Fhome%3Fwelcome%3Dcheckout"',
		);
		expect(markup).not.toContain("/checkout/email-handoff");
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
			checkoutEmail: "buyer@example.com",
			currentAccountEmail: "other@example.com",
		});

		expect(markup).toContain("Wrong account for this checkout");
		expect(markup).toContain("Account mismatch");
		expect(markup).toContain("Use the checkout account");
		expect(markup).toContain(
			"Payment is tied to buyer@example.com, but this browser is signed in as other@example.com.",
		);
		expect(markup).toContain("Do not buy again");
		expect(markup).toContain("Switch accounts");
		expect(markup).toContain("use the email code sent to buyer@example.com");
		expect(markup).not.toContain("Create checkout account");
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
			expect(markup).toContain("Open home");
			expect(markup).toContain("Go home");
		},
	);
});
