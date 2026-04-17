import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const signOutMock = vi.fn();
const useClerkMock = vi.fn();
const useSignInMock = vi.fn();
const useSignUpMock = vi.fn();
const reportClientErrorMock = vi.fn();

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
	}),
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => useClerkMock(),
	useSignIn: () => useSignInMock(),
	useSignUp: () => useSignUpMock(),
}));

vi.mock("@/features/observability/lib/client-error-report", () => ({
	reportClientError: (...args: unknown[]) => reportClientErrorMock(...args),
}));

import { PostCheckoutSignUpPage } from "@/features/auth/sign-up/post-checkout-sign-up-page";

function createSignUpState(overrides?: Partial<Record<string, unknown>>) {
	const signUp = {
		create: vi.fn().mockImplementation(async () => {
			return { error: null };
		}),
		password: vi.fn().mockImplementation(async () => {
			signUp.status = "missing_requirements";
			signUp.unverifiedFields = ["email_address"];
			signUp.missingFields = [];
			return { error: null };
		}),
		verifications: {
			sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
			verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
		},
		finalize: vi.fn().mockResolvedValue({ error: null }),
		status: "missing_requirements",
		unverifiedFields: [] as string[],
		missingFields: ["email_address", "password"] as string[],
		isTransferable: false,
		...overrides,
	};

	return {
		errors: {
			fields: {
				code: null,
				emailAddress: null,
				password: null,
			},
			global: null,
			raw: null,
		},
		fetchStatus: "idle",
		signUp,
	};
}

describe("PostCheckoutSignUpPage", () => {
	beforeEach(() => {
		pushMock.mockReset();
		signOutMock.mockReset();
		reportClientErrorMock.mockReset();
		useClerkMock.mockReset();
		useSignInMock.mockReset();
		useSignUpMock.mockReset();
		useClerkMock.mockReturnValue({
			signOut: signOutMock,
		});
		useSignInMock.mockReturnValue({
			signIn: {
				create: vi.fn().mockResolvedValue({ error: null }),
				finalize: vi.fn().mockResolvedValue({ error: null }),
				status: "needs_first_factor",
			},
		});
	});

	it("renders a locked checkout email and creates the Clerk sign-up attempt", async () => {
		const signUpState = createSignUpState();
		useSignUpMock.mockReturnValue(signUpState);

		const user = userEvent.setup();
		render(
			<PostCheckoutSignUpPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		const emailField = screen.getByLabelText(
			"Checkout email",
		) as HTMLInputElement;
		expect(emailField.value).toBe("buyer@example.com");
		expect(emailField.readOnly).toBe(true);

		await user.type(screen.getByLabelText("Create password"), "supersecret");
		await user.click(screen.getByRole("button", { name: "Create account" }));

		expect(signUpState.signUp.create).toHaveBeenCalledWith({
			emailAddress: "buyer@example.com",
		});
		expect(signUpState.signUp.password).toHaveBeenCalledWith({
			emailAddress: "buyer@example.com",
			password: "supersecret",
		});
		expect(signUpState.signUp.verifications.sendEmailCode).toHaveBeenCalled();
	});

	it("redirects buyers with an existing Clerk account to sign in", async () => {
		const signInCreateMock = vi.fn().mockResolvedValue({ error: null });
		useSignInMock.mockReturnValue({
			signIn: {
				create: signInCreateMock,
				finalize: vi.fn().mockResolvedValue({ error: null }),
				status: "needs_first_factor",
			},
		});
		const signUpState = createSignUpState({
			password: vi.fn().mockImplementation(async () => {
				signUpState.signUp.isTransferable = true;
				return { error: null };
			}),
		});
		useSignUpMock.mockReturnValue(signUpState);

		const user = userEvent.setup();
		render(
			<PostCheckoutSignUpPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		await user.type(screen.getByLabelText("Create password"), "supersecret");
		await user.click(screen.getByRole("button", { name: "Create account" }));

		expect(signInCreateMock).toHaveBeenCalledWith({ transfer: true });
		expect(pushMock).toHaveBeenCalledWith(
			"/sign-in?redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_test_123",
		);
	});

	it("falls back to sign in when Clerk marks the checkout email as transferable during sign up", async () => {
		const signInCreateMock = vi.fn().mockResolvedValue({ error: null });
		useSignInMock.mockReturnValue({
			signIn: {
				create: signInCreateMock,
				finalize: vi.fn().mockResolvedValue({ error: null }),
				status: "needs_first_factor",
			},
		});
		const signUpState = createSignUpState({
			password: vi.fn().mockImplementation(async () => {
				signUpState.signUp.isTransferable = true;
				return { error: { errors: [] } };
			}),
		});
		useSignUpMock.mockReturnValue(signUpState);

		const user = userEvent.setup();
		render(
			<PostCheckoutSignUpPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		await user.type(screen.getByLabelText("Create password"), "supersecret");
		await user.click(screen.getByRole("button", { name: "Create account" }));

		expect(signInCreateMock).toHaveBeenCalledWith({ transfer: true });
		expect(pushMock).toHaveBeenCalledWith(
			"/sign-in?redirect_url=%2Fcheckout%2Fsuccess%3Fsession_id%3Dcs_test_123",
		);
	});

	it("switches into verification mode when only email verification remains", () => {
		const signUpState = createSignUpState({
			status: "missing_requirements",
			unverifiedFields: ["email_address"],
			missingFields: [],
		});
		useSignUpMock.mockReturnValue(signUpState);

		render(
			<PostCheckoutSignUpPage
				checkoutEmail="buyer@example.com"
				redirectPath="/checkout/success?session_id=cs_test_123"
			/>,
		);

		expect(screen.getByLabelText("Verification code")).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Verify and continue" }),
		).toBeTruthy();
	});
});
