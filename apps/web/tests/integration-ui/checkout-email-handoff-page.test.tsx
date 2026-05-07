import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const setActiveMock = vi.fn();
const signOutMock = vi.fn();
const useClerkMock = vi.fn();
const useSignInMock = vi.fn();
const reportClientErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => useClerkMock(),
	useSignIn: () => useSignInMock(),
}));

vi.mock("@/lib/observability/client-error-report", () => ({
	reportClientError: (...args: unknown[]) => reportClientErrorMock(...args),
}));

import { CheckoutEmailHandoffPage } from "@/app/(identity)/_components/checkout-email-handoff/checkout-email-handoff-page";

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
		status: "needs_first_factor",
		supportedFirstFactors: [
			{
				emailAddressId: "idn_checkout_email",
				primary: true,
				safeIdentifier: "buyer@example.com",
				strategy: "email_code",
			},
		],
		...overrides,
	};

	return {
		errors: {
			fields: {
				code: null,
				identifier: null,
			},
			global: null,
			raw: null,
		},
		fetchStatus: "idle",
		signIn,
	};
}

describe("CheckoutEmailHandoffPage", () => {
	beforeEach(() => {
		pushMock.mockReset();
		setActiveMock.mockReset();
		signOutMock.mockReset();
		reportClientErrorMock.mockReset();
		useClerkMock.mockReset();
		useSignInMock.mockReset();
		useClerkMock.mockReturnValue({
			client: {
				sessions: [],
			},
			setActive: setActiveMock,
			signOut: signOutMock,
		});
	});

	it("renders a locked checkout email without password or Google options", () => {
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);

		render(
			<CheckoutEmailHandoffPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		const emailField = screen.getByLabelText(
			"Checkout email",
		) as HTMLInputElement;
		expect(emailField.value).toBe("buyer@example.com");
		expect(emailField.readOnly).toBe(true);
		expect(
			screen.getByRole("button", { name: "Send email code" }),
		).toBeTruthy();
		expect(screen.queryByLabelText("Create password")).toBeNull();
		expect(screen.queryByText(/continue with/i)).toBeNull();
		expect(screen.queryByText("Forgot your password?")).toBeNull();
	});

	it("starts a Clerk email-code sign-in attempt for the returned checkout email factor", async () => {
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(
			<CheckoutEmailHandoffPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.create).toHaveBeenCalledWith({
			identifier: "buyer@example.com",
		});
		expect(signInState.signIn.emailCode.sendCode).toHaveBeenCalledWith({
			emailAddressId: "idn_checkout_email",
		});
		expect(screen.getByLabelText("Email code")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Verify and continue" }),
		).toBeTruthy();
	});

	it("verifies the email code and returns to checkout success", async () => {
		const signInState = createSignInState();
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(
			<CheckoutEmailHandoffPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

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
			expect(pushMock).toHaveBeenCalledWith(
				"/checkout/success?session_id=cs_test_123",
			);
		});
	});

	it("fails closed when Clerk requires another factor after checkout email verification", async () => {
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

		render(
			<CheckoutEmailHandoffPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Send email code" }));
		await user.type(screen.getByLabelText("Email code"), "123456");
		await user.click(
			screen.getByRole("button", { name: "Verify and continue" }),
		);

		expect(signInState.signIn.finalize).toHaveBeenCalled();
		expect(pushMock).not.toHaveBeenCalled();
		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "clerk_checkout_email_handoff_unsupported_state",
				details: expect.objectContaining({
					status: "needs_second_factor",
				}),
			}),
		);
	});

	it("does not fall back to transfer sign-in or password setup when Clerk reports a transferable state", async () => {
		const signInState = createSignInState({
			isTransferable: true,
		});
		useSignInMock.mockReturnValue(signInState);
		const user = userEvent.setup();

		render(
			<CheckoutEmailHandoffPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.emailCode.sendCode).not.toHaveBeenCalled();
		expect(screen.getByText(/Clerk needs another account step/)).toBeTruthy();
		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "clerk_checkout_email_handoff_unsupported_state",
			}),
		);
		expect(pushMock).not.toHaveBeenCalled();
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

		render(
			<CheckoutEmailHandoffPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Send email code" }));

		expect(signInState.signIn.emailCode.sendCode).not.toHaveBeenCalled();
		expect(screen.getByText(/checkout_email_code_factor_missing/)).toBeTruthy();
		expect(reportClientErrorMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "clerk_checkout_email_handoff_email_code_factor_missing",
				details: expect.objectContaining({
					supportedFirstFactors: ["password"],
				}),
			}),
		);
		expect(pushMock).not.toHaveBeenCalled();
	});
});
