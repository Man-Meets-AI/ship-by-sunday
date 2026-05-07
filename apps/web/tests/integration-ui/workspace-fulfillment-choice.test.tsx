import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceFulfillmentChoice } from "@/app/(workspace)/_components/workspace-fulfillment-choice";

const replaceMock = vi.fn();
const resolveFulfillmentTrackMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("convex/react", () => ({
	useMutation: () => resolveFulfillmentTrackMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		access: {
			resolveViewerFulfillmentTrack: "resolveViewerFulfillmentTrack",
		},
	},
}));

beforeEach(() => {
	resolveFulfillmentTrackMock.mockResolvedValue(undefined);
});

afterEach(() => {
	vi.restoreAllMocks();
	replaceMock.mockClear();
	resolveFulfillmentTrackMock.mockReset();
});

describe("WorkspaceFulfillmentChoice", () => {
	it("offers Tutorial Videos without committing a fulfillment track", async () => {
		const user = userEvent.setup();
		render(<WorkspaceFulfillmentChoice />);

		await user.click(screen.getByRole("button", { name: /watch tutorial/i }));

		expect(resolveFulfillmentTrackMock).not.toHaveBeenCalled();
		expect(replaceMock).toHaveBeenCalledWith("/tutorials");
	});

	it("keeps generated-codebase selection on the committing mutation path", async () => {
		const user = userEvent.setup();
		render(<WorkspaceFulfillmentChoice />);

		await user.click(
			screen.getByRole("button", { name: /generate a new codebase/i }),
		);

		expect(resolveFulfillmentTrackMock).toHaveBeenCalledWith({
			fulfillmentTrack: "generated_codebase",
		});
		expect(replaceMock).toHaveBeenCalledWith("/codebase");
	});

	it("shows the checkout welcome banner while cleaning the URL", () => {
		const replaceStateMock = vi
			.spyOn(window.history, "replaceState")
			.mockImplementation(() => undefined);

		render(
			<WorkspaceFulfillmentChoice
				showCheckoutWelcome
				accountEmail="buyer@example.com"
			/>,
		);

		expect(
			screen.getByText(/access is active for buyer@example.com/i),
		).toBeTruthy();
		expect(replaceStateMock).toHaveBeenCalledWith(
			null,
			"",
			"/workspace/choose",
		);
	});
});
