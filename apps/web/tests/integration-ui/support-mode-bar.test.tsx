import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signOutMock = vi.fn();
const stopCurrentSessionMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("@/convex/_generated/api", () => ({
	api: {
		impersonation: {
			getSupportModeStatus: "getSupportModeStatus",
			stopCurrentSession: "stopCurrentSession",
		},
	},
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({ signOut: signOutMock }),
	useSession: () => ({ session: { id: "sess_actor" } }),
}));

vi.mock("convex/react", () => ({
	useQuery: () => useQueryMock(),
	useMutation: () => useMutationMock(),
}));

import { SupportModeBar } from "@/app/_components/support-mode/support-mode-bar";

function activeStatus() {
	return {
		state: "active" as const,
		startEligible: false,
		stopEligible: true,
		customerEmail: "customer@example.com",
		reason: "Debugging checkout handoff",
		timeRemainingMs: 3_600_000,
		integrityWarnings: [],
	};
}

describe("SupportModeBar", () => {
	beforeEach(() => {
		signOutMock.mockReset();
		stopCurrentSessionMock.mockReset().mockResolvedValue(null);
		useQueryMock.mockReset().mockReturnValue(undefined);
		useMutationMock.mockReset().mockReturnValue(stopCurrentSessionMock);
	});

	it("renders active support context from the initial status", () => {
		render(<SupportModeBar initialStatus={activeStatus()} />);

		expect(screen.getByText("Support mode active")).toBeTruthy();
		expect(screen.getByText("customer@example.com")).toBeTruthy();
		expect(screen.getByText("Debugging checkout handoff")).toBeTruthy();
		expect(screen.getByText("1h 0m left")).toBeTruthy();
	});

	it("stops Convex support mode before signing out the actor session", async () => {
		render(<SupportModeBar initialStatus={activeStatus()} />);

		await userEvent.click(screen.getByRole("button", { name: /stop/i }));

		expect(stopCurrentSessionMock).toHaveBeenCalledWith({});
		expect(signOutMock).toHaveBeenCalledWith({
			sessionId: "sess_actor",
			redirectUrl: "/admin/impersonation",
		});
	});
});
