import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const signOutMock = vi.fn();
const useClerkMock = vi.fn();
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
	useSignUp: () => useSignUpMock(),
}));

vi.mock("@/features/observability/lib/client-error-report", () => ({
	reportClientError: (...args: unknown[]) => reportClientErrorMock(...args),
}));

import { PostCheckoutSignUpPage } from "@/features/auth/sign-up/post-checkout-sign-up-page";

function createSignUpState(overrides?: Partial<Record<string, unknown>>) {
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
		signUp: {
			password: vi.fn().mockResolvedValue({ error: null }),
			verifications: {
				sendEmailCode: vi.fn().mockResolvedValue({ error: null }),
				verifyEmailCode: vi.fn().mockResolvedValue({ error: null }),
			},
			finalize: vi.fn().mockResolvedValue({ error: null }),
			status: "missing_requirements",
			unverifiedFields: [],
			missingFields: ["email_address", "password"],
			...overrides,
		},
	};
}

describe("PostCheckoutSignUpPage", () => {
	beforeEach(() => {
		pushMock.mockReset();
		signOutMock.mockReset();
		reportClientErrorMock.mockReset();
		useClerkMock.mockReset();
		useSignUpMock.mockReset();
		useClerkMock.mockReturnValue({
			signOut: signOutMock,
		});
	});

	it("renders a locked checkout email and creates the account with that email", async () => {
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

		expect(signUpState.signUp.password).toHaveBeenCalledWith({
			emailAddress: "buyer@example.com",
			password: "supersecret",
		});
		expect(signUpState.signUp.verifications.sendEmailCode).toHaveBeenCalled();
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
