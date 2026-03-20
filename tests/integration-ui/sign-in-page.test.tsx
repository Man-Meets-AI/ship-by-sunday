import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replaceMock = vi.fn();
const pushMock = vi.fn();
const useSearchParamsMock = vi.fn();
const useSignInMock = vi.fn();

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

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
		replace: replaceMock,
	}),
	useSearchParams: () => useSearchParamsMock(),
}));

vi.mock("@clerk/nextjs", () => ({
	useSignIn: () => useSignInMock(),
}));

import { SignInPage } from "@/features/auth/sign-in/sign-in-page";

function createSignInMock(overrides?: Partial<Record<string, unknown>>) {
	return {
		create: vi.fn().mockResolvedValue({ error: null }),
		errors: {
			fields: {
				code: null,
				identifier: null,
				password: null,
			},
			global: null,
			raw: null,
		},
		existingSession: undefined,
		fetchStatus: "idle",
		finalize: vi.fn().mockResolvedValue({ error: null }),
		mfa: {
			sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
			sendPhoneCode: vi.fn().mockResolvedValue({ error: null }),
			verifyBackupCode: vi.fn().mockResolvedValue({ error: null }),
			verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
			verifyPhoneCode: vi.fn().mockResolvedValue({ error: null }),
			verifyTOTP: vi.fn().mockResolvedValue({ error: null }),
		},
		password: vi.fn().mockResolvedValue({ error: null }),
		reset: vi.fn().mockResolvedValue({ error: null }),
		resetPasswordEmailCode: {
			sendCode: vi.fn().mockResolvedValue({ error: null }),
			submitPassword: vi.fn().mockResolvedValue({ error: null }),
			verifyCode: vi.fn().mockResolvedValue({ error: null }),
		},
		signIn: {
			mfa: {
				sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
				sendPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyBackupCode: vi.fn().mockResolvedValue({ error: null }),
				verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
				verifyPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyTOTP: vi.fn().mockResolvedValue({ error: null }),
			},
			password: vi.fn().mockResolvedValue({ error: null }),
			reset: vi.fn().mockResolvedValue({ error: null }),
			resetPasswordEmailCode: {
				sendCode: vi.fn().mockResolvedValue({ error: null }),
				submitPassword: vi.fn().mockResolvedValue({ error: null }),
				verifyCode: vi.fn().mockResolvedValue({ error: null }),
			},
			sso: vi.fn().mockResolvedValue({ error: null }),
			status: "needs_first_factor",
			supportedSecondFactors: [],
			finalize: vi.fn().mockResolvedValue({ error: null }),
			create: vi.fn().mockResolvedValue({ error: null }),
			...overrides,
		},
	};
}

describe("SignInPage", () => {
	beforeEach(() => {
		pushMock.mockReset();
		replaceMock.mockReset();
		useSearchParamsMock.mockReset();
		useSignInMock.mockReset();
		useSearchParamsMock.mockReturnValue(new URLSearchParams(""));
	});

	it("renders the custom sign-in UI without sign-up copy or legal footer", () => {
		const signInState = createSignInMock();
		useSignInMock.mockReturnValue({
			errors: signInState.errors,
			fetchStatus: signInState.fetchStatus,
			signIn: signInState.signIn,
		});

		render(<SignInPage />);

		expect(
			screen.getByText("Use the account attached to your purchase to continue."),
		).toBeTruthy();
		expect(screen.getByLabelText("Email")).toBeTruthy();
		expect(screen.getByLabelText("Password")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Continue with Google" }),
		).toBeTruthy();
		expect(screen.queryByText(/create account/i)).toBeNull();
		expect(screen.queryByText(/terms of service/i)).toBeNull();
	});

	it("submits email and password through Clerk", async () => {
		const signIn = {
			create: vi.fn().mockResolvedValue({ error: null }),
			finalize: vi.fn().mockResolvedValue({ error: null }),
			mfa: {
				sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
				sendPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyBackupCode: vi.fn().mockResolvedValue({ error: null }),
				verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
				verifyPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyTOTP: vi.fn().mockResolvedValue({ error: null }),
			},
			password: vi.fn().mockResolvedValue({ error: null }),
			reset: vi.fn().mockResolvedValue({ error: null }),
			resetPasswordEmailCode: {
				sendCode: vi.fn().mockResolvedValue({ error: null }),
				submitPassword: vi.fn().mockResolvedValue({ error: null }),
				verifyCode: vi.fn().mockResolvedValue({ error: null }),
			},
			sso: vi.fn().mockResolvedValue({ error: null }),
			status: "needs_first_factor",
			supportedSecondFactors: [],
		};
		useSignInMock.mockReturnValue({
			errors: {
				fields: { code: null, identifier: null, password: null },
				global: null,
				raw: null,
			},
			fetchStatus: "idle",
			signIn,
		});

		const user = userEvent.setup();
		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.type(screen.getByLabelText("Password"), "supersecret");
		await user.click(screen.getByRole("button", { name: "Sign in" }));

		expect(signIn.password).toHaveBeenCalledWith({
			emailAddress: "buyer@example.com",
			password: "supersecret",
		});
	});

	it("starts Google sign-in with the preserved redirect target", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Faccess-required"),
		);
		const signIn = {
			create: vi.fn().mockResolvedValue({ error: null }),
			finalize: vi.fn().mockResolvedValue({ error: null }),
			mfa: {
				sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
				sendPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyBackupCode: vi.fn().mockResolvedValue({ error: null }),
				verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
				verifyPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyTOTP: vi.fn().mockResolvedValue({ error: null }),
			},
			password: vi.fn().mockResolvedValue({ error: null }),
			reset: vi.fn().mockResolvedValue({ error: null }),
			resetPasswordEmailCode: {
				sendCode: vi.fn().mockResolvedValue({ error: null }),
				submitPassword: vi.fn().mockResolvedValue({ error: null }),
				verifyCode: vi.fn().mockResolvedValue({ error: null }),
			},
			sso: vi.fn().mockResolvedValue({ error: null }),
			status: "needs_first_factor",
			supportedSecondFactors: [],
		};
		useSignInMock.mockReturnValue({
			errors: {
				fields: { code: null, identifier: null, password: null },
				global: null,
				raw: null,
			},
			fetchStatus: "idle",
			signIn,
		});

		const user = userEvent.setup();
		render(<SignInPage />);

		await user.click(screen.getByRole("button", { name: "Continue with Google" }));

		expect(signIn.sso).toHaveBeenCalledWith({
			redirectCallbackUrl: "/sso-callback?redirect_url=%2Faccess-required",
			redirectUrl: "/access-required",
			strategy: "oauth_google",
		});
	});

	it("moves into the password reset flow and sends a reset code", async () => {
		const signIn = {
			create: vi.fn().mockResolvedValue({ error: null }),
			finalize: vi.fn().mockResolvedValue({ error: null }),
			mfa: {
				sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
				sendPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyBackupCode: vi.fn().mockResolvedValue({ error: null }),
				verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
				verifyPhoneCode: vi.fn().mockResolvedValue({ error: null }),
				verifyTOTP: vi.fn().mockResolvedValue({ error: null }),
			},
			password: vi.fn().mockResolvedValue({ error: null }),
			reset: vi.fn().mockResolvedValue({ error: null }),
			resetPasswordEmailCode: {
				sendCode: vi.fn().mockResolvedValue({ error: null }),
				submitPassword: vi.fn().mockResolvedValue({ error: null }),
				verifyCode: vi.fn().mockResolvedValue({ error: null }),
			},
			sso: vi.fn().mockResolvedValue({ error: null }),
			status: "needs_first_factor",
			supportedSecondFactors: [],
		};
		useSignInMock.mockReturnValue({
			errors: {
				fields: { code: null, identifier: null, password: null },
				global: null,
				raw: null,
			},
			fetchStatus: "idle",
			signIn,
		});

		const user = userEvent.setup();
		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Forgot your password?" }));
		await user.click(screen.getByRole("button", { name: "Send reset code" }));

		expect(signIn.reset).toHaveBeenCalledTimes(2);
		expect(signIn.create).toHaveBeenCalledWith({ identifier: "buyer@example.com" });
		expect(signIn.resetPasswordEmailCode.sendCode).toHaveBeenCalledTimes(1);
	});

	it("shows the purchase-required banner when Google sign-in is blocked", () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("auth_error=purchase_required"),
		);
		const signInState = createSignInMock();
		useSignInMock.mockReturnValue({
			errors: signInState.errors,
			fetchStatus: signInState.fetchStatus,
			signIn: signInState.signIn,
		});

		render(<SignInPage />);

		expect(
			screen.getByText("Google sign-in is for purchased accounts."),
		).toBeTruthy();
		expect(screen.getByRole("link", { name: "See pricing" }).getAttribute("href")).toBe(
			"/#pricing",
		);
	});
});
