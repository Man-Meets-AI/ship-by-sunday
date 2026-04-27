import React from "react";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signOutMock = vi.fn();
const useQueryMock = vi.fn();
const useUserMock = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();

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
	usePathname: () => "/mission",
	useRouter: () => ({
		replace: replaceMock,
		refresh: refreshMock,
	}),
	useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("convex/react", () => ({
	useQuery: () => useQueryMock(),
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		signOut: signOutMock,
	}),
	useUser: () => useUserMock(),
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<button type="button">{label}</button>
	),
}));

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";

describe("AccessRequiredPage interactions", () => {
	beforeEach(() => {
		signOutMock.mockReset();
		useQueryMock.mockReset();
		useUserMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
		vi.useRealTimers();
		useUserMock.mockReturnValue({
			isLoaded: true,
			user: {
				primaryEmailAddress: {
					emailAddress: "test-entitled@test.com",
				},
			},
		});
	});

	it("refreshes the current workspace route when access becomes ready", () => {
		useQueryMock.mockReturnValue({
			hasAccess: true,
			status: "granted",
		});

		render(<AccessRequiredPage />);

		expect(refreshMock).toHaveBeenCalledTimes(1);
	});

	it("keeps retrying the workspace refresh while the gate is still mounted", async () => {
		vi.useFakeTimers();
		useQueryMock.mockReturnValue({
			hasAccess: true,
			status: "granted",
		});

		render(
			<AccessRequiredPage
				initialAccess={{
					clerkUserId: "user_123",
					hasAccess: false,
					status: "no_access",
				}}
			/>,
		);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_200);
		});

		expect(refreshMock).toHaveBeenCalledTimes(2);
	});

	it("redirects signed-out viewers to sign-in with the current workspace path", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "signed_out",
		});

		render(<AccessRequiredPage />);

		expect(replaceMock).toHaveBeenCalledWith(
			"/sign-in?redirect_url=%2Fmission",
		);
	});

	it("refreshes access on retry and clears the busy state after the timeout", async () => {
		vi.useFakeTimers();
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "no_access",
		});

		render(<AccessRequiredPage />);

		const button = screen.getByRole("button", { name: "Retry access check" });
		fireEvent.click(button);

		expect(refreshMock).toHaveBeenCalledTimes(1);
		expect(button.textContent).toBe("Refreshing access...");
		expect(button.getAttribute("aria-busy")).toBe("true");
		expect(screen.getByText("Refreshing product access now.")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_200);
		});

		expect(button.textContent).toBe("Retry access check");
		expect(button.getAttribute("aria-busy")).toBe("false");
	});

	it("signs out before sending a token-missing viewer back through sign-in", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "token_missing",
		});

		render(<AccessRequiredPage />);

		fireEvent.click(
			screen.getByRole("button", { name: "Sign out and sign back in" }),
		);

		expect(signOutMock).toHaveBeenCalledWith({
			redirectUrl: "/sign-in?redirect_url=%2Fmission",
		});
	});

	it("shows the signed-in email in signed-in recovery states only", () => {
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "no_access",
		});

		const { rerender } = render(<AccessRequiredPage />);

		expect(
			screen.getByTestId("access-required-account-identity").textContent,
		).toContain("Signed in as test-entitled@test.com");

		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "signed_out",
		});

		rerender(<AccessRequiredPage />);

		expect(screen.queryByTestId("access-required-account-identity")).toBeNull();
	});
});
