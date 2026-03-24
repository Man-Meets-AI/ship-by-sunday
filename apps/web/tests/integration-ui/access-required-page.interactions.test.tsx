import React from "react";
import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();
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

vi.mock("@/features/checkout/components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<button type="button">{label}</button>
	),
}));

import { AccessRequiredPage } from "@/features/product-access/components/access-required-page";

describe("AccessRequiredPage interactions", () => {
	beforeEach(() => {
		useQueryMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
		vi.useRealTimers();
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
});
