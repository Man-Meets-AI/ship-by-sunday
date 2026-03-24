import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const isStarterModuleEnabledMock = vi.fn();
const fetchAuthenticatedQueryMock = vi.fn();

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			getMissionState: "getMissionState",
		},
	},
}));

vi.mock("@/platform/env/server", () => ({
	serverEnv: {
		ENABLE_OBSERVABILITY_TEST_TRIGGER: "0",
	},
}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/features/starter/lib/starter-selectors", () => ({
	isStarterModuleEnabled: isStarterModuleEnabledMock,
}));

vi.mock("@/features/course/mission/components/mission-page", () => ({
	MissionPage: () => <div data-page="mission">Mission page</div>,
}));

vi.mock("@/features/workspace-home/components/workspace-home-page", () => ({
	WorkspaceHomePage: () => <div data-page="workspace-home">Workspace home</div>,
}));

describe("workspace mission route", () => {
	beforeEach(() => {
		isStarterModuleEnabledMock.mockReset();
		fetchAuthenticatedQueryMock.mockReset();
	});

	it("renders the workspace home when the course module is disabled", async () => {
		isStarterModuleEnabledMock.mockReturnValue(false);

		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");
		const markup = renderToStaticMarkup(
			await MissionRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain('data-page="workspace-home"');
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
	});

	it("renders the mission page and preloads mission data when the course module is enabled", async () => {
		isStarterModuleEnabledMock.mockReturnValue(true);
		fetchAuthenticatedQueryMock.mockResolvedValue({ blocks: [] });

		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");
		const markup = renderToStaticMarkup(
			await MissionRoutePage({
				searchParams: Promise.resolve({}),
			}),
		);

		expect(markup).toContain('data-page="mission"');
		expect(fetchAuthenticatedQueryMock).toHaveBeenCalledTimes(1);
	});
});
