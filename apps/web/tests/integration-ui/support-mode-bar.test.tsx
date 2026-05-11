import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signOutMock = vi.fn();
const stopCurrentSessionMock = vi.fn();
const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useSessionMock = vi.fn();

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
	useSession: () => useSessionMock(),
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
		useSessionMock.mockReset().mockReturnValue({
			isLoaded: true,
			session: { id: "sess_actor", actor: { sub: "user_admin" } },
		});
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

	it("does not stop until Clerk has loaded the active session id", async () => {
		useSessionMock.mockReturnValue({
			isLoaded: false,
			session: undefined,
		});
		render(<SupportModeBar initialStatus={activeStatus()} />);

		const stopButton = screen.getByRole("button", { name: /stop/i });
		expect((stopButton as HTMLButtonElement).disabled).toBe(true);

		await userEvent.click(stopButton);

		expect(stopCurrentSessionMock).not.toHaveBeenCalled();
		expect(signOutMock).not.toHaveBeenCalled();
	});

	it("does not sign out a normal admin session for misconfigured status", async () => {
		useSessionMock.mockReturnValue({
			isLoaded: true,
			session: { id: "sess_admin", actor: null },
		});
		render(
			<SupportModeBar
				initialStatus={{
					state: "misconfigured",
					startEligible: false,
					stopEligible: false,
					customerEmail: null,
					reason: null,
					timeRemainingMs: null,
					integrityWarnings: [],
				}}
			/>,
		);

		const stopButton = screen.getByRole("button", { name: /stop/i });
		expect((stopButton as HTMLButtonElement).disabled).toBe(true);

		await userEvent.click(stopButton);

		expect(stopCurrentSessionMock).not.toHaveBeenCalled();
		expect(signOutMock).not.toHaveBeenCalled();
	});
});
