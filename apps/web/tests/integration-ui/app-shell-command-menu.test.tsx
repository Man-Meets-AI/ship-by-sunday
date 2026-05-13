import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
	type Mock,
} from "vitest";

import { AppShellCommandMenu } from "@/app/(protected)/_components/app-shell/app-shell-command-menu";
import type { AppShellPrimaryNav } from "@/app/(protected)/_components/app-shell/app-shell-props";
import { resetAppShellPreferencesForTests } from "@/app/(protected)/_components/app-shell/app-shell-preferences-store";

const pushMock = vi.fn();
const setThemeMock = vi.fn();
const signOutMock = vi.fn();
const captureProductEventMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: pushMock }),
	usePathname: () => "/starter/generate-codebase",
}));

vi.mock("next-themes", () => ({
	useTheme: () => ({
		resolvedTheme: "light",
		setTheme: setThemeMock,
	}),
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		signOut: signOutMock,
	}),
}));

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (...args: unknown[]) =>
		captureProductEventMock(...(args as Parameters<Mock>)),
}));

const codebaseStageStatuses = [
	{
		stageId: "codebase" as const,
		isUnlocked: true,
		isComplete: false,
		currentStepIndex: 0,
		missingFactKeys: [],
	},
	{
		stageId: "review" as const,
		isUnlocked: true,
		isComplete: false,
		currentStepIndex: 0,
		missingFactKeys: [],
	},
];

const samplePrimaryNav: AppShellPrimaryNav = {
	kind: "combined",
	currentCodebaseStageId: "codebase",
	stageStatuses: codebaseStageStatuses,
	postReviewItems: [
		{
			kind: "link",
			id: "build",
			label: "Build Lessons",
			href: "/lesson/build-it",
			state: "available",
		},
		{
			kind: "menu",
			id: "bonus",
			label: "Bonus",
			state: "available",
			items: [
				{
					kind: "link",
					id: "bonus-product",
					label: "Product lessons",
					href: "/lesson/product",
					state: "available",
				},
				{
					kind: "action",
					id: "bonus-lesson-map",
					label: "Lesson Map",
					actionId: "showLessonMap",
					state: "available",
				},
			],
		},
	],
};

beforeEach(() => {
	resetAppShellPreferencesForTests();
	window.localStorage.clear();
});

afterEach(() => {
	pushMock.mockClear();
	setThemeMock.mockClear();
	signOutMock.mockClear();
	captureProductEventMock.mockClear();
	resetAppShellPreferencesForTests();
	window.localStorage.clear();
});

function renderMenu() {
	return render(<AppShellCommandMenu primaryNav={samplePrimaryNav} />);
}

describe("AppShellCommandMenu", () => {
	it("opens via the ⌘K shortcut and closes via Escape", async () => {
		const user = userEvent.setup();
		renderMenu();

		expect(screen.queryByPlaceholderText(/search actions/i)).toBeNull();

		fireEvent.keyDown(window, { key: "k", metaKey: true });

		const input = await screen.findByPlaceholderText(/search actions/i);
		expect(input).toBeTruthy();

		await user.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByPlaceholderText(/search actions/i)).toBeNull();
		});
	});

	it("opens via the trigger click and fires a click-source PostHog event", async () => {
		const user = userEvent.setup();
		renderMenu();

		await user.click(screen.getByTestId("app-shell-command-menu-trigger"));

		expect(await screen.findByPlaceholderText(/search actions/i)).toBeTruthy();
		expect(captureProductEventMock).toHaveBeenCalledWith(
			expect.objectContaining({
				event: "app_shell_command_menu_opened",
				properties: { source: "click" },
			}),
		);
	});

	it("fires a keyboard-source PostHog event on ⌘K open", () => {
		renderMenu();
		fireEvent.keyDown(window, { key: "k", metaKey: true });
		expect(captureProductEventMock).toHaveBeenCalledWith(
			expect.objectContaining({
				event: "app_shell_command_menu_opened",
				properties: { source: "keyboard" },
			}),
		);
	});

	it("navigates via the router when a codebase stage item is selected", async () => {
		const user = userEvent.setup();
		renderMenu();
		fireEvent.keyDown(window, { key: "k", metaKey: true });
		await screen.findByPlaceholderText(/search actions/i);

		await user.click(screen.getByRole("option", { name: /^Codebase$/i }));

		expect(pushMock).toHaveBeenCalled();
		expect(pushMock.mock.calls[0]?.[0]).toBe("/starter/generate-codebase");
	});

	it("navigates to Starter from the app command group", async () => {
		const user = userEvent.setup();
		renderMenu();
		fireEvent.keyDown(window, { key: "k", metaKey: true });
		await screen.findByPlaceholderText(/search actions/i);

		await user.click(screen.getByRole("option", { name: /^Starter$/i }));

		expect(pushMock).toHaveBeenCalledWith("/starter/home");
	});

	it("invokes setTheme when a theme item is selected", async () => {
		const user = userEvent.setup();
		renderMenu();
		fireEvent.keyDown(window, { key: "k", metaKey: true });
		await screen.findByPlaceholderText(/search actions/i);

		await user.click(screen.getByRole("option", { name: /^Dark$/i }));

		expect(setThemeMock).toHaveBeenCalledWith("dark");
	});

	it("invokes Clerk signOut when the Sign out item is selected", async () => {
		const user = userEvent.setup();
		renderMenu();
		fireEvent.keyDown(window, { key: "k", metaKey: true });
		await screen.findByPlaceholderText(/search actions/i);

		await user.click(screen.getByRole("option", { name: /sign out/i }));

		expect(signOutMock).toHaveBeenCalledTimes(1);
	});

	it("renders long compound lesson labels with a wrappable label span", async () => {
		const longChildLabel = `Extra long lesson title ${"x".repeat(80)}`;
		const navWithLongLesson: AppShellPrimaryNav = {
			...samplePrimaryNav,
			postReviewItems: [
				{
					kind: "menu",
					id: "bonus",
					label: "Bonus",
					state: "available",
					items: [
						{
							kind: "link",
							id: "bonus-long",
							label: longChildLabel,
							href: "/lesson/long",
							state: "available",
						},
					],
				},
			],
		};
		render(<AppShellCommandMenu primaryNav={navWithLongLesson} />);
		fireEvent.keyDown(window, { key: "k", metaKey: true });
		await screen.findByPlaceholderText(/search actions/i);

		const compoundLabel = `Bonus: ${longChildLabel}`;
		const option = screen.getByRole("option", { name: compoundLabel });
		expect(option).toBeTruthy();
		const labelSpan = option.querySelector("span.min-w-0.break-words");
		expect(labelSpan?.textContent).toBe(compoundLabel);
	});
});
