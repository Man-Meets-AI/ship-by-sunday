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
				kind: "checkout_email_handoff_required";
				sessionId: string;
				checkoutEmail: string;
		  }
		| {
				kind: "wrong_account";
				sessionId: string;
				checkoutEmail?: string;
				currentAccountEmail?: string;
		  }
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
		});

		expect(markup).toContain("Finalizing access");
		expect(markup).toContain("Polling access");
		expect(markup).toContain("Confirming your product access.");
		expect(markup).toContain("What happens next");
		expect(markup).toContain("Open workspace");
		expect(markup).toContain('href="/codebase"');
		expect(markup).not.toContain("Opening your workspace");
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
		});

		expect(markup).toContain("Opening workspace");
		expect(markup).toContain("Access ready");
		expect(markup).toContain("Redirect armed");
		expect(markup).toContain("Access confirmed");
		expect(markup).toContain('href="/codebase"');
		expect(markup).toContain("Opening your workspace");
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
			},
			{ initialProductAccess: { hasAccess: true } },
		);

		expect(markup).toContain("Opening workspace");
		expect(markup).toContain("Access ready");
	});

	it("renders the email-handoff recovery path for a paid checkout email", () => {
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
		expect(markup).toContain("Prove checkout email");
		expect(markup).toContain("Payment is confirmed for buyer@example.com");
		expect(markup).toContain("Do not buy again");
		expect(markup).toContain(
			'href="/checkout/email-handoff?session_id=cs_sign_in&amp;redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_sign_in"',
		);
		expect(markup).not.toContain("Create account");
	});

	it("renders the narrow email-code handoff after signed-out fulfillment", () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
		});
		useQueryMock.mockReturnValue(undefined);

		const markup = renderView({
			kind: "checkout_email_handoff_required",
			sessionId: "cs_handoff",
			checkoutEmail: "buyer@example.com",
		});

		expect(markup).toContain("Email proof required");
		expect(markup).toContain("Prove checkout email");
		expect(markup).toContain(
			"Access is waiting for the Clerk user tied to buyer@example.com",
		);
		expect(markup).toContain(
			'href="/checkout/email-handoff?session_id=cs_handoff&amp;redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_handoff"',
		);
		expect(markup).not.toContain("Continue with Google");
		expect(markup).not.toContain("Create account");
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
			expect(markup).toContain("Open workspace");
			expect(markup).toContain("Go home");
		},
	);
});
