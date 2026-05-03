import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import IdentityLayout from "@/app/(identity)/layout";

const replaceMock = vi.fn();
const pushMock = vi.fn();
const setActiveMock = vi.fn();
const signOutMock = vi.fn();
const reportClientErrorMock = vi.fn();
const useClerkMock = vi.fn();
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
	useClerk: () => useClerkMock(),
	useSignIn: () => useSignInMock(),
}));

vi.mock("@/lib/observability/client-error-report", () => ({
	reportClientError: (...args: unknown[]) => reportClientErrorMock(...args),
}));

vi.mock("@/components/ui/input-otp", () => ({
	InputOTP: ({
		children,
		onChange,
		value,
		...props
	}: React.InputHTMLAttributes<HTMLInputElement> & {
		children: React.ReactNode;
		onChange?: (value: string) => void;
	}) => (
		<div>
			<input
				{...props}
				value={value}
				onChange={(event) => onChange?.(event.target.value)}
			/>
			{children}
		</div>
	),
	InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	InputOTPSlot: ({ index }: { index: number }) => (
		<span data-otp-slot={index} />
	),
}));

import { SignInPage } from "@/app/(identity)/_components/sign-in-page";

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
		setActiveMock.mockReset();
		signOutMock.mockReset();
		reportClientErrorMock.mockReset();
		useClerkMock.mockReset();
		useSearchParamsMock.mockReset();
		useSignInMock.mockReset();
		useClerkMock.mockReturnValue({
			setActive: setActiveMock.mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: null,
				});
			}),
			signOut: signOutMock,
		});
		useSearchParamsMock.mockReturnValue(new URLSearchParams(""));
	});

	it("renders the custom sign-in UI without sign-up copy or legal footer", () => {
		const signInState = createSignInMock();
		useSignInMock.mockReturnValue({
			errors: signInState.errors,
			fetchStatus: signInState.fetchStatus,
			signIn: signInState.signIn,
		});

		render(
			<IdentityLayout>
				<SignInPage />
			</IdentityLayout>,
		);

		expect(screen.getByRole("link", { name: "Ship by Sunday" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
		expect(
			screen.getByText(
				"Use the account attached to your purchase to continue.",
			),
		).toBeTruthy();
		expect(
			screen.queryByText("Reconnect the workspace tied to your checkout."),
		).toBeNull();
		expect(screen.getByLabelText("Email")).toBeTruthy();
		expect(screen.getByLabelText("Password")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Continue with Google" }),
		).toBeTruthy();
		expect(screen.queryByRole("link", { name: "See pricing" })).toBeNull();
		expect(screen.queryByText(/create account/i)).toBeNull();
		expect(screen.queryByText(/terms of service/i)).toBeNull();
	});

	it("does not render the support panel when sign-in is recovering a protected route", () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signInState = createSignInMock();
		useSignInMock.mockReturnValue({
			errors: signInState.errors,
			fetchStatus: signInState.fetchStatus,
			signIn: signInState.signIn,
		});

		render(<SignInPage />);

		expect(
			screen.getByText(
				"Use the account attached to your purchase to continue.",
			),
		).toBeTruthy();
		expect(
			screen.queryByText("Sign in, then continue where you left off."),
		).toBeNull();
		expect(screen.queryByRole("link", { name: "See pricing" })).toBeNull();
	});

	it("shows the post-checkout create-account path when recovery includes a paid checkout", () => {
		const signInState = createSignInMock();
		useSignInMock.mockReturnValue({
			errors: signInState.errors,
			fetchStatus: signInState.fetchStatus,
			signIn: signInState.signIn,
		});

		render(
			<SignInPage postCheckoutSignUpHref="/sign-up?session_id=cs_test_123&redirect_url=%2Fstart" />,
		);

		expect(
			screen
				.getByRole("link", { name: "Create the account for this checkout" })
				.getAttribute("href"),
		).toBe("/sign-up?session_id=cs_test_123&redirect_url=%2Fstart");
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
			identifier: "buyer@example.com",
			password: "supersecret",
		});
	});

	it("redirects a completed password sign-in back to the preserved target", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signIn = {
			create: vi.fn().mockResolvedValue({ error: null }),
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: null,
				});
				return { error: null };
			}),
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
			status: "complete",
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

		expect(pushMock).toHaveBeenCalledWith("/settings");
	});

	it("activates the created session when the password response completes before the hook state updates", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
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
			password: vi.fn().mockResolvedValue({
				createdSessionId: "sess_123",
				error: null,
				status: "complete",
			}),
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

		expect(setActiveMock).toHaveBeenCalledTimes(1);
		expect(setActiveMock).toHaveBeenCalledWith({
			navigate: expect.any(Function),
			session: "sess_123",
		});
		expect(pushMock).toHaveBeenCalledWith("/settings");
	});

	it("routes a completed password sign-in into the pending Clerk task", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signIn = {
			create: vi.fn().mockResolvedValue({ error: null }),
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: { currentTask: { key: "reset-password" } },
				});
				return { error: null };
			}),
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
			status: "complete",
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

		expect(pushMock).toHaveBeenCalledWith(
			"/session-tasks/reset-password?redirect_url=%2Fsettings",
		);
	});

	it("starts Google sign-in with the preserved redirect target", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fmission"),
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

		await user.click(
			screen.getByRole("button", { name: "Continue with Google" }),
		);

		expect(signIn.sso).toHaveBeenCalledWith({
			redirectCallbackUrl: "/sso-callback?redirect_url=%2Fmission",
			redirectUrl: "/mission",
			strategy: "oauth_google",
		});
	});

	it("signs out the pending session when Clerk returns an unknown task", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signIn = {
			create: vi.fn().mockResolvedValue({ error: null }),
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: { currentTask: { key: "setup-mfa" } },
				});
				return { error: null };
			}),
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
			status: "complete",
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
		signOutMock.mockResolvedValue(undefined);

		const user = userEvent.setup();
		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.type(screen.getByLabelText("Password"), "supersecret");
		await user.click(screen.getByRole("button", { name: "Sign in" }));

		expect(signOutMock).toHaveBeenCalledWith({
			redirectUrl: "/sign-in?redirect_url=%2Fsettings",
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
		await user.click(
			screen.getByRole("button", { name: "Forgot your password?" }),
		);
		await user.click(screen.getByRole("button", { name: "Send reset code" }));

		expect(signIn.reset).toHaveBeenCalledTimes(2);
		expect(signIn.create).toHaveBeenCalledWith({
			identifier: "buyer@example.com",
		});
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
		expect(
			screen.queryByText("Google did not match a paid account."),
		).toBeNull();
		expect(screen.queryByRole("link", { name: "See pricing" })).toBeNull();
	});
});
