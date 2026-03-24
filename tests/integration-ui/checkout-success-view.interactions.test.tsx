import React from "react";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const replaceMock = vi.fn();

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
	}),
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useQuery: () => useQueryMock(),
}));

import { CheckoutSuccessView } from "@/features/checkout/components/checkout-success-view";

describe("CheckoutSuccessView interactions", () => {
	beforeEach(() => {
		useConvexAuthMock.mockReset();
		useQueryMock.mockReset();
		replaceMock.mockReset();
		vi.useRealTimers();
	});

	it("arms the mission redirect once access is ready", async () => {
		vi.useFakeTimers();
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
		});
		useQueryMock.mockReturnValue({
			hasAccess: true,
		});

		render(
			<CheckoutSuccessView
				checkoutSessionState={{
					kind: "validated",
					sessionId: "cs_validated",
				}}
			/>,
		);

		expect(replaceMock).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(700);
		});

		expect(replaceMock).toHaveBeenCalledWith("/mission");
	});

	it("rotates the validated status copy while access is still pending", async () => {
		vi.useFakeTimers();
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
		});
		useQueryMock.mockReturnValue({
			hasAccess: false,
		});

		render(
			<CheckoutSuccessView
				checkoutSessionState={{
					kind: "validated",
					sessionId: "cs_pending",
				}}
			/>,
		);

		expect(screen.getByText("Confirming your product access.")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_600);
		});
		expect(screen.getByText("Unlocking your workspace.")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_600);
		});
		expect(
			screen.getByText("Preparing your first workspace step."),
		).toBeTruthy();
	});
});
