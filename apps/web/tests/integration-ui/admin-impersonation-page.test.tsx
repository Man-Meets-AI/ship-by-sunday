import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const setActiveMock = vi.fn();
const signInCreateMock = vi.fn();
const startActionMock = vi.fn();
const completeActionMock = vi.fn();
const failActionMock = vi.fn();
const searchActionMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		setActive: setActiveMock,
	}),
	useSignIn: () => ({
		signIn: { create: signInCreateMock },
	}),
}));

vi.mock("@/app/admin/impersonation/actions", () => ({
	startAdminImpersonationAction: (input: unknown) => startActionMock(input),
	completeAdminImpersonationHandoffAction: () => completeActionMock(),
	failAdminImpersonationHandoffAction: (sessionId: unknown) =>
		failActionMock(sessionId),
	searchAdminImpersonationCustomersAction: (query: string) =>
		searchActionMock(query),
}));

import { AdminImpersonationPageClient } from "@/app/admin/impersonation/_components/admin-impersonation-page-client";
import type { AdminImpersonationPageData } from "@/app/admin/impersonation/_server/admin-impersonation-server";

const pageData = {
	adminEmail: "me@parkerrex.com",
	initialCustomers: [
		{
			clerkUserId: "user_customer",
			email: "customer@example.com",
			name: "Customer",
			imageUrl: null,
			createdAt: 1_000,
		},
	],
	customerTotalCount: 1,
	history: [],
	status: {
		state: "normal",
		startEligible: true,
		stopEligible: false,
		customerEmail: null,
		reason: null,
		timeRemainingMs: null,
		integrityWarnings: [],
	},
} satisfies AdminImpersonationPageData;

describe("AdminImpersonationPageClient", () => {
	beforeEach(() => {
		pushMock.mockReset();
		setActiveMock.mockReset().mockResolvedValue(undefined);
		signInCreateMock
			.mockReset()
			.mockResolvedValue({ createdSessionId: "sess_impersonated" });
		startActionMock.mockReset().mockResolvedValue({
			ok: true,
			token: "ticket_123",
			sessionId: "session_1",
			destination: "/home",
		});
		completeActionMock.mockReset().mockResolvedValue({ ok: true });
		failActionMock.mockReset().mockResolvedValue({ ok: true });
		searchActionMock.mockReset().mockResolvedValue({
			ok: true,
			customers: pageData.initialCustomers,
			totalCount: 1,
			query: "",
		});
	});

	it("hands the actor-token ticket to Clerk and lands in the customer workspace", async () => {
		render(<AdminImpersonationPageClient data={pageData} />);

		await userEvent.click(screen.getByText("customer@example.com"));
		await userEvent.type(
			screen.getByLabelText("Reason for support access"),
			"Debugging checkout handoff",
		);
		const [startButton] = screen.getAllByRole("button", {
			name: "Start impersonating customer",
		});
		fireEvent.click(startButton);
		await screen.findByText("Start impersonating customer?");
		const confirmButtons = screen.getAllByRole("button", {
			name: "Start impersonating customer",
		});
		fireEvent.click(confirmButtons[confirmButtons.length - 1]);

		await waitFor(() => {
			expect(signInCreateMock).toHaveBeenCalledWith({
				strategy: "ticket",
				ticket: "ticket_123",
			});
		});
		expect(setActiveMock).toHaveBeenCalledWith({
			session: "sess_impersonated",
		});
		expect(completeActionMock).toHaveBeenCalled();
		expect(pushMock).toHaveBeenCalledWith("/home");
	});
});
