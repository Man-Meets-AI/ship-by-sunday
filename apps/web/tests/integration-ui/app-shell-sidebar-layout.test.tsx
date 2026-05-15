import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Link from "next/link";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppShellPrimaryNav } from "@/app/(app)/_components/app-shell/app-shell-props";
import { resetAppShellPreferencesForTests } from "@/app/(app)/_components/app-shell/app-shell-preferences-store";

const pathnameMock = vi.fn(() => "/workers/setup");
const captureProductEventMock = vi.fn();
const openUserProfileMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		onNavigate: _onNavigate,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
		onNavigate?: (event: { preventDefault: () => void }) => void;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => pathnameMock(),
}));

vi.mock("next-themes", () => ({
	useTheme: () => ({
		resolvedTheme: "light",
		setTheme: vi.fn(),
	}),
}));

vi.mock("motion/react", () => ({
	useReducedMotion: () => false,
}));

vi.mock("@clerk/nextjs", () => ({
	useClerk: () => ({
		openUserProfile: openUserProfileMock,
		signOut: signOutMock,
	}),
	useSession: () => ({
		isLoaded: true,
		session: { id: "session_1", actor: null },
	}),
	useUser: () => ({
		isLoaded: true,
		user: {
			firstName: "Ada",
			lastName: "Lovelace",
			fullName: "Ada Lovelace",
			imageUrl: "",
			primaryEmailAddress: { emailAddress: "ada@example.com" },
		},
	}),
}));

vi.mock("convex/react", () => ({
	useMutation: () => vi.fn(),
	useQuery: () => null,
}));

vi.mock("@/lib/observability/posthog-client", () => ({
	capturePostHogProductEvent: (...args: unknown[]) =>
		captureProductEventMock(...args),
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

const primaryNav: AppShellPrimaryNav = {
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
	pathnameMock.mockReturnValue("/workers/setup");
	captureProductEventMock.mockClear();
	openUserProfileMock.mockClear();
	signOutMock.mockClear();
});

import { AppShell } from "@/app/(app)/_components/app-shell";

describe("AppShell sidebar layout", () => {
	it("renders protected app viewport through the T3-style Sidebar shell", () => {
		const onNavigate = vi.fn();
		const onAction = vi.fn();

		render(
			<AppShell
				viewportMode="app"
				appScrollMode="page"
				primaryNav={{
					...primaryNav,
					onAction,
					onNavigate,
				}}
				localNav={{
					kind: "workspace",
					desktop: (
						<div>
							<Link href="/workers/setup">Setup local nav</Link>
						</div>
					),
				}}
				progressSummary={{
					progressCount: 2,
					totalLessons: 5,
					progressLabel: "lessons done",
				}}
				billingAttention={{
					title: "Payment needs attention",
					message: "Update billing to keep workers running.",
					statusLabel: "past due",
				}}
			>
				<section>Protected page content</section>
			</AppShell>,
		);

		const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
		const sidebar = document.querySelector('[data-slot="sidebar"]');
		const inset = document.querySelector('[data-slot="sidebar-inset"]');
		const content = document.querySelector('[data-slot="sidebar-content"]');

		expect(wrapper).toBeTruthy();
		expect(sidebar).toBeTruthy();
		expect(inset).toBeTruthy();
		expect(content?.className).toContain("gap-2");
		expect(screen.getByText("Protected page content")).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: /Workers/i })
				.getAttribute("aria-current"),
		).toBe("page");
		expect(screen.getByRole("link", { name: /^Codebase$/i })).toBeTruthy();
		expect(screen.getByRole("link", { name: /^Review$/i })).toBeTruthy();
		expect(screen.getByRole("link", { name: /^Build Lessons$/i })).toBeTruthy();
		expect(screen.getByRole("button", { name: /^Bonus$/i })).toBeTruthy();
		expect(screen.getByRole("button", { name: /^Lesson Map$/i })).toBeTruthy();
		expect(screen.getByText("Setup local nav")).toBeTruthy();
		expect(screen.getByText("2/5")).toBeTruthy();
		expect(screen.getByText("Payment needs attention")).toBeTruthy();
		expect(
			screen.getAllByTestId("app-shell-command-menu-trigger").length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByRole("button", { name: "Toggle theme" }).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByRole("button", { name: "Open account menu" }).length,
		).toBeGreaterThan(0);
		expect(
			screen.getByRole("button", { name: "Open app sidebar" }),
		).toBeTruthy();

		fireEvent.click(screen.getByRole("link", { name: /^Review$/i }));
		expect(onNavigate).toHaveBeenCalledWith(
			"/starter/generate-codebase/review",
		);

		fireEvent.click(screen.getByRole("button", { name: /^Lesson Map$/i }));
		expect(onAction).toHaveBeenCalledWith("showLessonMap");
	});

	it("keeps document mode on the old header/local-nav path", () => {
		render(
			<AppShell
				viewportMode="document"
				localNav={{
					kind: "workspace",
					desktop: <div>Document local nav</div>,
				}}
			>
				<section>Document mode content</section>
			</AppShell>,
		);

		expect(document.querySelector('[data-slot="sidebar-wrapper"]')).toBeNull();
		expect(screen.getByText("Document mode content")).toBeTruthy();
		expect(screen.getAllByText("Document local nav").length).toBeGreaterThan(0);
	});

	it("collapses and restores route-local navigation through the sidebar group action", () => {
		render(
			<AppShell
				viewportMode="app"
				localNav={{
					kind: "workspace",
					desktop: <div>Worker route local nav</div>,
				}}
			>
				<section>Protected content</section>
			</AppShell>,
		);

		const sidebarGroup = screen
			.getByRole("button", {
				name: "Collapse local navigation",
			})
			.closest('[data-slot="sidebar-group"]');
		expect(sidebarGroup).toBeTruthy();
		expect(
			within(sidebarGroup as HTMLElement).getByText("Worker route local nav"),
		).toBeTruthy();

		fireEvent.click(
			within(sidebarGroup as HTMLElement).getByRole("button", {
				name: "Collapse local navigation",
			}),
		);
		expect(
			within(sidebarGroup as HTMLElement).queryByText("Worker route local nav"),
		).toBeNull();

		fireEvent.click(
			within(sidebarGroup as HTMLElement).getByRole("button", {
				name: "Expand local navigation",
			}),
		);
		expect(
			within(sidebarGroup as HTMLElement).getByText("Worker route local nav"),
		).toBeTruthy();
	});
});
