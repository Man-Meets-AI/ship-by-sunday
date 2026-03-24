import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const setActiveMock = vi.fn();
const signOutMock = vi.fn();
const reportClientErrorMock = vi.fn();
const useClerkMock = vi.fn();
const useSignInMock = vi.fn();
const useSignUpMock = vi.fn();

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

import { SsoCallbackPage } from "@/features/auth/sign-in/sso-callback-page";

function createSignInState(overrides?: Partial<Record<string, unknown>>) {
	return {
		create: vi.fn().mockResolvedValue(undefined),
		existingSession: undefined,
		finalize: vi.fn().mockResolvedValue(undefined),
		isTransferable: false,
		status: "needs_first_factor",
		...overrides,
	};
}

function createSignUpState(overrides?: Partial<Record<string, unknown>>) {
	return {
		existingSession: undefined,
		isTransferable: false,
		status: "missing_requirements",
		...overrides,
	};
}

describe("SsoCallbackPage", () => {
	beforeEach(() => {
		pushMock.mockReset();
		setActiveMock.mockReset();
		signOutMock.mockReset();
		reportClientErrorMock.mockReset();
		useClerkMock.mockReset();
		useSignInMock.mockReset();
		useSignUpMock.mockReset();
		useClerkMock.mockReturnValue({
			loaded: true,
			setActive: setActiveMock,
			signOut: signOutMock,
		});
	});

	it("finalizes a completed OAuth sign-in back to the preserved redirect target", async () => {
		const signIn = createSignInState({
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: null,
				});
			}),
			status: "complete",
		});
		useSignInMock.mockReturnValue({ signIn });
		useSignUpMock.mockReturnValue({ signUp: createSignUpState() });

		render(<SsoCallbackPage redirectPath="/settings" />);

		expect(screen.getByText("Completing Google sign-in")).toBeTruthy();
		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith("/settings");
		});
	});

	it("routes a completed OAuth sign-in into the pending Clerk task with the redirect target preserved", async () => {
		const signIn = createSignInState({
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: { currentTask: { key: "reset-password" } },
				});
			}),
			status: "complete",
		});
		useSignInMock.mockReturnValue({ signIn });
		useSignUpMock.mockReturnValue({ signUp: createSignUpState() });

		render(<SsoCallbackPage redirectPath="/settings" />);

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith(
				"/session-tasks/reset-password?redirect_url=%2Fsettings",
			);
		});
	});

	it("sends unmatched Google accounts back to sign-in with the purchase-required state", async () => {
		useSignInMock.mockReturnValue({
			signIn: createSignInState({
				isTransferable: true,
			}),
		});
		useSignUpMock.mockReturnValue({ signUp: createSignUpState() });

		render(<SsoCallbackPage redirectPath="/mission" />);

		await waitFor(() => {
			expect(pushMock).toHaveBeenCalledWith(
				"/sign-in?redirect_url=%2Fmission&auth_error=purchase_required",
			);
		});
	});

	it("signs out the pending session when Clerk returns an unknown task", async () => {
		const signIn = createSignInState({
			finalize: vi.fn().mockImplementation(async ({ navigate }) => {
				await navigate({
					decorateUrl: (url: string) => url,
					session: { currentTask: { key: "choose-organization" } },
				});
			}),
			status: "complete",
		});
		useSignInMock.mockReturnValue({ signIn });
		useSignUpMock.mockReturnValue({ signUp: createSignUpState() });
		signOutMock.mockResolvedValue(undefined);

		render(<SsoCallbackPage redirectPath="/settings" />);

		await waitFor(() => {
			expect(signOutMock).toHaveBeenCalledWith({
				redirectUrl: "/sign-in?redirect_url=%2Fsettings",
			});
		});
	});
});
