import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const missionState = {
	progressCount: 9,
	totalLessons: 28,
	blocks: [
		{
			id: "CEO",
			label: "CEO",
			order: 1,
			completedCount: 2,
			totalLessons: 2,
			lessons: [
				{
					id: "1.1",
					title: "Start With the Problem",
					shortTitle: "Problem",
					status: "completed" as const,
					artifactLabel: "Problem set",
					isImplemented: true,
				},
				{
					id: "1.2",
					title: "Pick One User",
					shortTitle: "User",
					status: "completed" as const,
					artifactLabel: "User brief",
					isImplemented: true,
				},
			],
		},
		{
			id: "DESIGN",
			label: "DESIGN",
			order: 2,
			completedCount: 1,
			totalLessons: 3,
			lessons: [
				{
					id: "2.1",
					title: "Find References First",
					shortTitle: "References",
					status: "completed" as const,
					artifactLabel: "Reference set",
					isImplemented: true,
				},
				{
					id: "2.2",
					title: "Sketch Before Software",
					shortTitle: "Sketch",
					status: "in_progress" as const,
					artifactLabel: "Sketches",
					isImplemented: true,
				},
				{
					id: "2.3",
					title: "Storyboard the Journey",
					shortTitle: "Storyboard",
					status: "available" as const,
					artifactLabel: "Storyboard",
					isImplemented: true,
				},
			],
		},
		{
			id: "BUILD",
			label: "BUILD",
			order: 3,
			completedCount: 0,
			totalLessons: 2,
			lessons: [
				{
					id: "3.1",
					title: "Set Up the Repo",
					shortTitle: "Repo",
					status: "locked" as const,
					artifactLabel: "Repo setup",
					isImplemented: true,
				},
				{
					id: "3.2",
					title: "Prepare Local Environment",
					shortTitle: "Env",
					status: "locked" as const,
					artifactLabel: "Env setup",
					isImplemented: true,
				},
			],
		},
	],
};

let nonSkipQueryCallCount = 0;

const useQueryMock = vi.fn((_query: unknown, args: unknown) => {
	if (args === "skip") {
		return undefined;
	}

	nonSkipQueryCallCount += 1;
	return nonSkipQueryCallCount === 1
		? { hasAccess: true, status: "active" }
		: missionState;
});

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
		scroll?: boolean;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => "/artifacts",
}));

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isAuthenticated: true,
		isLoading: false,
	}),
	useQuery: (query: unknown, args: unknown) => useQueryMock(query, args),
}));

vi.mock("@clerk/nextjs", () => ({
	UserButton: () => <div data-user-button="true" />,
}));

globalThis.React = React;

import { ProductShell } from "@/features/course/shared/components/product-shell";

describe("ProductShell", () => {
	beforeEach(() => {
		useQueryMock.mockClear();
		nonSkipQueryCallCount = 0;
	});

	it("renders unlocked header blocks as links and keeps locked blocks inert", () => {
		const markup = renderToStaticMarkup(
			<ProductShell initialTheme="light" showSkillRail={false}>
				<div>Body</div>
			</ProductShell>,
		);

		expect(markup).toContain('aria-label="Open CEO"');
		expect(markup).toContain('href="/lesson/1.1"');
		expect(markup).toContain('aria-label="Open DESIGN"');
		expect(markup).toContain('href="/lesson/2.2"');
		expect(markup).toContain('aria-current="page"');
		expect(markup).not.toContain('aria-label="Open BUILD"');
		expect(markup).toContain('aria-disabled="true"');
	});

	it("lets app surfaces opt into page scrolling without the fixed viewport shell", () => {
		const markup = renderToStaticMarkup(
			<ProductShell
				initialTheme="light"
				showSkillRail={false}
				viewportMode="app"
				appScrollMode="page"
			>
				<div>Body</div>
			</ProductShell>,
		);

		expect(markup).toContain(
			'class="flex min-h-screen flex-col bg-product-bg text-product-text"',
		);
		expect(markup).not.toContain("xl:h-dvh");
		expect(markup).not.toContain("xl:overflow-hidden");
	});

	it("skips mission queries when mission data is explicitly disabled", () => {
		const markup = renderToStaticMarkup(
			<ProductShell
				initialTheme="light"
				showSkillRail={false}
				enableMissionQuery={false}
			>
				<div>Body</div>
			</ProductShell>,
		);

		expect(useQueryMock).toHaveBeenCalled();
		expect(useQueryMock.mock.calls.some((call) => call[1] === "skip")).toBe(
			true,
		);
		expect(markup).toContain("--/--");
		expect(markup).not.toContain('aria-label="Open CEO"');
	});
});
