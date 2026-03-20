import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const authenticateWithRedirectCallbackMock = vi.fn(
	(_props?: Record<string, unknown>) => <div data-testid="auth-callback" />,
);

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@clerk/nextjs", () => ({
	AuthenticateWithRedirectCallback: (props: Record<string, unknown>) =>
		authenticateWithRedirectCallbackMock(props),
}));

import { SsoCallbackPage } from "@/features/auth/sign-in/sso-callback-page";

describe("SsoCallbackPage", () => {
	it("passes the purchase-gated callback configuration to Clerk", () => {
		render(<SsoCallbackPage redirectPath="/access-required" />);

		expect(screen.getByText("Completing Google sign-in")).toBeTruthy();
		expect(screen.getByTestId("auth-callback")).toBeTruthy();
		expect(authenticateWithRedirectCallbackMock).toHaveBeenCalledWith(
			expect.objectContaining({
				continueSignUpUrl:
					"/sign-in?redirect_url=%2Faccess-required&auth_error=purchase_required",
				firstFactorUrl: "/sign-in?redirect_url=%2Faccess-required",
				resetPasswordUrl: "/sign-in?redirect_url=%2Faccess-required",
				secondFactorUrl: "/sign-in?redirect_url=%2Faccess-required",
				signInFallbackRedirectUrl: "/access-required",
				signInUrl:
					"/sign-in?redirect_url=%2Faccess-required&auth_error=purchase_required",
				signUpFallbackRedirectUrl:
					"/sign-in?redirect_url=%2Faccess-required&auth_error=purchase_required",
				signUpUrl:
					"/sign-in?redirect_url=%2Faccess-required&auth_error=purchase_required",
				transferable: false,
			}),
		);
	});
});
