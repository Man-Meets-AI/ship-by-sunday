import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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

type TestClerkError = { code?: string; message?: string } | null;

function createSignInState(overrides?: Partial<Record<string, unknown>>) {
	const signIn = {
		create: vi.fn().mockResolvedValue({
			error: null,
			status: "needs_first_factor",
		}),
		emailCode: {
			sendCode: vi.fn().mockResolvedValue({ error: null }),
			verifyCode: vi.fn().mockImplementation(async () => {
				signIn.status = "complete";
				return {
					error: null,
				};
			}),
		},
		existingSession: undefined,
		finalize: vi.fn().mockImplementation(async ({ navigate }) => {
			await navigate({
				decorateUrl: (url: string) => url,
				session: null,
			});
		}),
		isTransferable: false,
		reset: vi.fn().mockResolvedValue({ error: null }),
		status: "needs_first_factor",
		supportedFirstFactors: [
			{
				emailAddressId: "idn_sign_in_email",
				primary: true,
				safeIdentifier: "buyer@example.com",
				strategy: "email_code",
			},
		],
		...overrides,
	};
	const errors: {
		fields: {
			code: TestClerkError;
			identifier: TestClerkError;
		};
		global: Array<NonNullable<TestClerkError>> | null;
		raw: Array<NonNullable<TestClerkError>> | null;
	} = {
		fields: {
			code: null,
			identifier: null,
		},
		global: null,
		raw: null,
	};

	return {
		errors,
		fetchStatus: "idle",
		signIn,
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
			client: {
				sessions: [],
			},
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

	it("renders a passwordless sign-in UI without password, reset, sign-up, or legal copy", () => {
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);

		render(
			<IdentityLayout>
				<SignInPage />
			</IdentityLayout>,
		);

		expect(screen.getByRole("link", { name: "Ship by Sunday" })).toBeTruthy();
		expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
		expect(
			screen.getByText(
				"Enter the email tied to your purchase. We’ll send a one-time code.",
			),
		).toBeTruthy();
		expect(screen.getByLabelText("Email")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Send email code" }),
		).toBeTruthy();
		expect(screen.queryByLabelText("Password")).toBeNull();
		expect(screen.queryByText("Forgot your password?")).toBeNull();
		expect(screen.queryByRole("button", { name: /continue with/i })).toBeNull();
		expect(screen.queryByRole("link", { name: "See pricing" })).toBeNull();
		expect(screen.queryByText(/create account/i)).toBeNull();
		expect(screen.queryByText(/terms of service/i)).toBeNull();
	});

	it("does not render the support panel when sign-in is recovering a protected route", () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);

		render(<SignInPage />);

		expect(
			screen.getByText(
				"Enter the email tied to your purchase. We’ll send a one-time code.",
			),
		).toBeTruthy();
		expect(
			screen.queryByText("Sign in, then continue where you left off."),
		).toBeNull();
		expect(screen.queryByRole("link", { name: "See pricing" })).toBeNull();
	});

	it("starts a Clerk email-code sign-in attempt for the returned email factor", async () => {
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.create).toHaveBeenCalledWith({
			identifier: "buyer@example.com",
		});
		expect(signInState.signIn.emailCode.sendCode).toHaveBeenCalledWith({
			emailAddressId: "idn_sign_in_email",
		});
		expect(screen.getByLabelText("Email code")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Verify and continue" }),
		).toBeTruthy();
		expect(screen.queryByLabelText("Password")).toBeNull();
	});

	it("shows a generic inbox message for an email without an account", async () => {
		const signInState = createSignInState();
		const missingAccountError = {
			code: "form_identifier_not_found",
			message: "Couldn't find your account.",
		};
		signInState.signIn.create.mockImplementation(async () => {
			signInState.errors.fields.identifier = missingAccountError;
			signInState.errors.global = [missingAccountError];
			return {
				error: missingAccountError,
				status: null,
			};
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "missing@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.emailCode.sendCode).not.toHaveBeenCalled();
		expect(
			await screen.findByText(/If that email can sign in, we sent a code/),
		).toBeTruthy();
		expect(
			screen.queryByRole("link", { name: "Purchase a license" }),
		).toBeNull();
		expect(screen.queryByText("We couldn't sign you in.")).toBeNull();
		expect(screen.queryByText("Couldn't find your account.")).toBeNull();
	});

	it("moves to the code step when Clerk reports a transferable sign-in", async () => {
		const signInState = createSignInState({
			isTransferable: true,
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "missing@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.emailCode.sendCode).not.toHaveBeenCalled();
		expect(await screen.findByLabelText("Email code")).toBeTruthy();
		expect(
			screen.queryByRole("link", { name: "Purchase a license" }),
		).toBeNull();
		expect(screen.queryByText("We couldn't sign you in.")).toBeNull();
		expect(reportClientErrorMock).not.toHaveBeenCalled();
	});

	it("verifies the email code and returns to the preserved target", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(signInState.signIn.emailCode.verifyCode).toHaveBeenCalledWith({
			code: "123456",
		});
		expect(signInState.signIn.finalize).toHaveBeenCalled();
		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/settings");
		});
	});

	it("shows an invalid email-code error only on the code field", async () => {
		const signInState = createSignInState();
		const incorrectCodeError = {
			code: "form_code_incorrect",
			message: "is incorrect",
		};
		signInState.signIn.emailCode.verifyCode.mockImplementation(async () => {
			signInState.errors.fields.code = incorrectCodeError;
			signInState.errors.global = [incorrectCodeError];
			return {
				error: incorrectCodeError,
			};
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(
			await screen.findByText(
				"That code is incorrect. Use the latest email code or send a new one.",
			),
		).toBeTruthy();
		expect(screen.queryByText("We couldn't sign you in.")).toBeNull();
		expect(screen.queryByText("is incorrect")).toBeNull();
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("keeps generic code format errors field-level without rewriting the copy", async () => {
		const signInState = createSignInState();
		const formatError = {
			code: "form_param_format_invalid",
			message: "Code must contain only digits.",
		};
		signInState.signIn.emailCode.verifyCode.mockImplementation(async () => {
			signInState.errors.fields.code = formatError;
			signInState.errors.global = [formatError];
			return {
				error: formatError,
			};
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "abcdef");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(
			await screen.findByText("Code must contain only digits."),
		).toBeTruthy();
		expect(
			screen.queryByText(
				"That code is incorrect. Use the latest email code or send a new one.",
			),
		).toBeNull();
		expect(screen.queryByText("We couldn't sign you in.")).toBeNull();
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("activates the created session when email-code verification completes before the hook state updates", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signInState = createSignInState({
			emailCode: {
				sendCode: vi.fn().mockResolvedValue({ error: null }),
				verifyCode: vi.fn().mockImplementation(async () => {
					signInState.signIn.createdSessionId = "sess_123";
					signInState.signIn.status = "complete";
					return {
						error: null,
					};
				}),
			},
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(setActiveMock).toHaveBeenCalledTimes(1);
		expect(setActiveMock).toHaveBeenCalledWith({
			navigate: expect.any(Function),
			session: "sess_123",
		});
		expect(pushMock).toHaveBeenCalledWith("/settings");
	});

	it("routes completed passwordless sign-in into the pending Clerk task", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signInState = createSignInState({
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: { currentTask: { key: "reset-password" } },
				});
			}),
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(pushMock).toHaveBeenCalledWith(
			"/session-tasks/reset-password?redirect_url=%2Fsettings",
		);
	});

	it("signs out the pending session when Clerk returns an unknown task", async () => {
		useSearchParamsMock.mockReturnValue(
			new URLSearchParams("redirect_url=%2Fsettings"),
		);
		const signInState = createSignInState({
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: { currentTask: { key: "setup-mfa" } },
				});
			}),
		});
		useSignInMock.mockReturnValue(signInState);
		signOutMock.mockResolvedValue(undefined);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(signOutMock).toHaveBeenCalledWith({
			redirectUrl: "/sign-in?redirect_url=%2Fsettings",
		});
	});

	it("fails closed when Clerk requires MFA after the email code", async () => {
		const signInState = createSignInState({
			emailCode: {
				sendCode: vi.fn().mockResolvedValue({ error: null }),
				verifyCode: vi.fn().mockImplementation(async () => {
					signInState.signIn.status = "needs_second_factor";
					return {
						error: null,
					};
				}),
			},
			finalize: vi.fn().mockResolvedValue({
				error: new Error("needs_second_factor"),
			}),
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(signInState.signIn.finalize).toHaveBeenCalled();
		expect(setActiveMock).not.toHaveBeenCalled();
		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "clerk_passwordless_sign_in_unsupported_state",
				details: expect.objectContaining({
					status: "needs_second_factor",
				}),
			}),
		);
		expect(
			screen.getByText(/Clerk needs another account step before this email/),
		).toBeTruthy();
	});

	it("does not call Clerk email-code sending when the sign-in has no email-code factor", async () => {
		const signInState = createSignInState({
			supportedFirstFactors: [
				{
					strategy: "password",
				},
			],
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(<SignInPage />);

		await user.type(screen.getByLabelText("Email"), "buyer@example.com");
		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.emailCode.sendCode).not.toHaveBeenCalled();
		expect(
			screen.getByText(/passwordless_email_code_factor_missing/),
		).toBeTruthy();
		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "clerk_passwordless_sign_in_email_code_factor_missing",
				details: expect.objectContaining({
					supportedFirstFactors: ["password"],
				}),
			}),
		);
		expect(pushMock).not.toHaveBeenCalled();
	});
});
