import React from "react";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const replaceMock = vi.fn();
const signOutMock = vi.fn();
const useReducedMotionMock = vi.fn<() => boolean | null>(() => false);

vi.mock("motion/react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("motion/react")>();
	return {
		...actual,
		useReducedMotion: () => useReducedMotionMock(),
	};
});

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

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		signOut: signOutMock,
	}),
}));

import { CheckoutSuccessView } from "@/app/checkout/success/_components/checkout-success-view";

describe("CheckoutSuccessView interactions", () => {
	beforeEach(() => {
		useConvexAuthMock.mockReset();
		useQueryMock.mockReset();
		replaceMock.mockReset();
		signOutMock.mockReset();
		useReducedMotionMock.mockReset();
		useReducedMotionMock.mockReturnValue(false);
		vi.useRealTimers();
	});

	it("arms the home redirect once access is ready", async () => {
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
					fulfillmentTrack: "generated_codebase",
				}}
			/>,
		);

		expect(replaceMock).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(699);
		});

		expect(replaceMock).not.toHaveBeenCalled();
		expect(
			screen.getByTestId("checkout-success-redirect-affordance"),
		).toBeTruthy();
		expect(screen.getByText("Opening home…")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1);
		});

		expect(replaceMock).toHaveBeenCalledWith("/home?welcome=checkout");
	});

	it("routes existing-codebase fulfillment through the home redirect", async () => {
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
					sessionId: "cs_existing",
					fulfillmentTrack: "existing_codebase_doctor",
				}}
			/>,
		);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(700);
		});

		expect(replaceMock).toHaveBeenCalledWith("/home?welcome=checkout");
	});

	it("does not render the redirect affordance while access is still pending", () => {
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
					fulfillmentTrack: "generated_codebase",
				}}
			/>,
		);

		expect(
			screen.queryByTestId("checkout-success-redirect-affordance"),
		).toBeNull();
		expect(screen.queryByText("Opening home…")).toBeNull();
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
					fulfillmentTrack: "generated_codebase",
				}}
			/>,
		);

		expect(screen.getByText("Confirming your product access.")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_600);
		});
		expect(screen.getByText("Unlocking your product access.")).toBeTruthy();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1_600);
		});
		expect(screen.getByText("Preparing your first home path.")).toBeTruthy();
	});

	it("renders the armed-ring expansion in the access-ready state", () => {
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
					sessionId: "cs_armed",
					fulfillmentTrack: "generated_codebase",
				}}
			/>,
		);

		expect(
			screen.getByTestId("checkout-success-status-pulse-armed-ring"),
		).toBeTruthy();
	});

	it("suppresses the armed-ring expansion under prefers-reduced-motion", () => {
		useReducedMotionMock.mockReturnValue(true);
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
					sessionId: "cs_reduced_motion",
					fulfillmentTrack: "generated_codebase",
				}}
			/>,
		);

		expect(
			screen.queryByTestId("checkout-success-status-pulse-armed-ring"),
		).toBeNull();
	});

	it("signs out before account switching for a wrong-account paid checkout", async () => {
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
		});
		useQueryMock.mockReturnValue({
			hasAccess: false,
		});

		render(
			<CheckoutSuccessView
				checkoutSessionState={{
					kind: "wrong_account",
					sessionId: "cs_wrong_account",
					checkoutEmail: "buyer@example.com",
					currentAccountEmail: "other@example.com",
				}}
			/>,
		);

		await userEvent.click(screen.getByTestId("checkout-success-cta-primary"));

		expect(signOutMock).toHaveBeenCalledWith({
			redirectUrl: "/sign-in?redirect_url=%2Fhome%3Fwelcome%3Dcheckout",
		});
	});
});
