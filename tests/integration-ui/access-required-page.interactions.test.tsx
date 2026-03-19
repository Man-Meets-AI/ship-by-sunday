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
	useRouter: () => ({
		replace: replaceMock,
		refresh: refreshMock,
	}),
}));

vi.mock("convex/react", () => ({
	useQuery: () => useQueryMock(),
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/features/checkout/components/checkout-button", () => ({
	CheckoutButton: ({ label }: { label: string }) => (
		<button type="button">{label}</button>
	),
}));

import { AccessRequiredPage } from "@/features/course/access/components/access-required-page";

describe("AccessRequiredPage interactions", () => {
	beforeEach(() => {
		useQueryMock.mockReset();
		replaceMock.mockReset();
		refreshMock.mockReset();
		vi.useRealTimers();
	});

	it("redirects into mission when access becomes ready", () => {
		useQueryMock.mockReturnValue({
			hasAccess: true,
			status: "active",
		});

		render(<AccessRequiredPage />);

		expect(replaceMock).toHaveBeenCalledWith("/mission");
	});

	it("refreshes access on retry and clears the busy state after the timeout", async () => {
		vi.useFakeTimers();
		useQueryMock.mockReturnValue({
			hasAccess: false,
			status: "none",
		});

		render(<AccessRequiredPage />);

		const button = screen.getByRole("button", { name: "Retry access check" });
		fireEvent.click(button);

		expect(refreshMock).toHaveBeenCalledTimes(1);
		expect(button.textContent).toBe("Refreshing access...");
		expect(button.getAttribute("aria-busy")).toBe("true");
		expect(screen.getByText("Refreshing entitlement status now.")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_200);
		});

		expect(button.textContent).toBe("Retry access check");
		expect(button.getAttribute("aria-busy")).toBe("false");
	});
});
