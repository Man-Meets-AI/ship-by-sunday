import React from "react";

const isStarterModuleEnabledMock = vi.fn();
const fetchAuthenticatedQueryMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			getMissionState: "getMissionState",
		},
	},
}));

vi.mock("next/navigation", () => ({
	redirect: redirectMock,
}));

describe("workspace mission route", () => {
	beforeEach(() => {
		isStarterModuleEnabledMock.mockReset();
		fetchAuthenticatedQueryMock.mockReset();
		redirectMock.mockReset();
	});

	it("redirects the legacy mission route to start", async () => {
		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");
		MissionRoutePage();

		expect(redirectMock).toHaveBeenCalledWith("/start");
	});
});
