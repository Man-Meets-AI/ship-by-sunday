import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestStarterRepoAccessMock, toastSuccessMock } = vi.hoisted(() => ({
	requestStarterRepoAccessMock: vi.fn(),
	toastSuccessMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useMutation: () => requestStarterRepoAccessMock,
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
	},
}));

import { StarterRepoAccessForm } from "@/features/starter-repo/components/starter-repo-access-form";

describe("StarterRepoAccessForm interactions", () => {
	beforeEach(() => {
		requestStarterRepoAccessMock.mockReset();
		toastSuccessMock.mockReset();
	});

	it("shows a success toast after a mission starter repo request is saved", async () => {
		requestStarterRepoAccessMock.mockResolvedValue(undefined);
		const onSubmitted = vi.fn();
		const user = userEvent.setup();

		render(
			<StarterRepoAccessForm
				initialUsername=""
				onSubmitted={onSubmitted}
				surface="mission"
			/>,
		);

		await user.type(screen.getByLabelText("GitHub username"), "ShipBySunday");
		await user.click(
			screen.getByRole("button", { name: "Save GitHub username" }),
		);

		expect(requestStarterRepoAccessMock).toHaveBeenCalledWith({
			githubUsername: "ShipBySunday",
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Starter repo request saved. Watch for the GitHub invite.",
		);
		expect(onSubmitted).toHaveBeenCalled();
	});

	it("does not show the mission toast on settings", async () => {
		requestStarterRepoAccessMock.mockResolvedValue(undefined);
		const user = userEvent.setup();

		render(<StarterRepoAccessForm initialUsername="" surface="settings" />);

		await user.type(screen.getByLabelText("GitHub username"), "ShipBySunday");
		await user.click(
			screen.getByRole("button", { name: "Save GitHub username" }),
		);

		expect(toastSuccessMock).not.toHaveBeenCalled();
	});
});
