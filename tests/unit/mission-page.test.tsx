import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const missionState = {
	progressCount: 20,
	totalLessons: 31,
	blocks: [
		{
			id: "CEO",
			label: "CEO",
			order: 1,
			completedCount: 4,
			totalLessons: 7,
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
				{
					id: "1.3",
					title: "Define the Outcome",
					shortTitle: "Outcome",
					status: "completed" as const,
					artifactLabel: "Outcome statement",
					isImplemented: true,
				},
				{
					id: "1.4",
					title: "Do the Research",
					shortTitle: "Research",
					status: "completed" as const,
					artifactLabel: "Research table",
					isImplemented: true,
				},
				{
					id: "1.5",
					title: "Map the Core Flow",
					shortTitle: "Flow",
					status: "available" as const,
					artifactLabel: "Core flow map",
					isImplemented: true,
				},
				{
					id: "1.6",
					title: "Cut Scope",
					shortTitle: "Scope",
					status: "locked" as const,
					artifactLabel: "Scope cut",
					isImplemented: true,
				},
				{
					id: "1.7",
					title: "Build the Brief",
					shortTitle: "Brief",
					status: "locked" as const,
					artifactLabel: "Product brief",
					isImplemented: true,
				},
			],
		},
		{
			id: "DESIGN",
			label: "DESIGN",
			order: 2,
			completedCount: 6,
			totalLessons: 6,
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
					status: "completed" as const,
					artifactLabel: "Sketches",
					isImplemented: true,
				},
				{
					id: "2.3",
					title: "Storyboard the Journey",
					shortTitle: "Storyboard",
					status: "completed" as const,
					artifactLabel: "Storyboard",
					isImplemented: true,
				},
				{
					id: "2.4",
					title: "Layout Walkthrough",
					shortTitle: "Layout",
					status: "completed" as const,
					artifactLabel: "Layout notes",
					isImplemented: true,
				},
				{
					id: "2.5",
					title: "Interaction Pass",
					shortTitle: "Interaction",
					status: "completed" as const,
					artifactLabel: "Interaction notes",
					isImplemented: true,
				},
				{
					id: "2.6",
					title: "Visual Direction",
					shortTitle: "Direction",
					status: "completed" as const,
					artifactLabel: "Visual guide",
					isImplemented: true,
				},
			],
		},
		{
			id: "BUILD",
			label: "BUILD",
			order: 3,
			completedCount: 0,
			totalLessons: 10,
			lessons: [
				{
					id: "3.1",
					title: "Build Kickoff",
					shortTitle: "Kickoff",
					status: "locked" as const,
					artifactLabel: "Build kickoff ready",
					isImplemented: true,
				},
				{
					id: "3.2",
					title: "Map the Repo and Starter",
					shortTitle: "Repo",
					status: "locked" as const,
					artifactLabel: "Repo orientation notes",
					isImplemented: true,
				},
				{
					id: "3.3",
					title: "Install MCPs and Skills",
					shortTitle: "Tools",
					status: "locked" as const,
					artifactLabel: "Tooling stack ready",
					isImplemented: true,
				},
				{
					id: "3.4",
					title: "Wire DB, Auth, and Payments",
					shortTitle: "Integrations",
					status: "locked" as const,
					artifactLabel: "Integration setup complete",
					isImplemented: true,
				},
				{
					id: "3.5",
					title: "Switch to Sandbox and Boot Local",
					shortTitle: "Sandbox",
					status: "locked" as const,
					artifactLabel: "Working local environment",
					isImplemented: true,
				},
				{
					id: "3.6",
					title: "Read and Execute AI Plans",
					shortTitle: "Plan",
					status: "locked" as const,
					artifactLabel: "Execution plan review",
					isImplemented: true,
				},
				{
					id: "3.7",
					title: "Implement the First Slice",
					shortTitle: "First Slice",
					status: "locked" as const,
					artifactLabel: "First slice implemented",
					isImplemented: true,
				},
				{
					id: "3.8",
					title: "Build the Core UX End-to-End",
					shortTitle: "Core UX",
					status: "locked" as const,
					artifactLabel: "Core UX working locally",
					isImplemented: true,
				},
				{
					id: "3.9",
					title: "Debug and Stabilize Without Spiraling",
					shortTitle: "Debug",
					status: "locked" as const,
					artifactLabel: "Blocker log",
					isImplemented: true,
				},
				{
					id: "3.10",
					title: "Finalize Build Handoff and Unlock Ship",
					shortTitle: "Handoff",
					status: "locked" as const,
					artifactLabel: "Build summary",
					isImplemented: true,
				},
			],
		},
		{
			id: "SHIP",
			label: "SHIP",
			order: 4,
			completedCount: 0,
			totalLessons: 6,
			lessons: [
				{
					id: "4.1",
					title: "Prep the Launch",
					shortTitle: "Prep",
					status: "locked" as const,
					artifactLabel: "Launch checklist",
					isImplemented: true,
				},
				{
					id: "4.2",
					title: "Deploy the App",
					shortTitle: "Deploy",
					status: "locked" as const,
					artifactLabel: "Deployment",
					isImplemented: true,
				},
				{
					id: "4.3",
					title: "Smoke Test",
					shortTitle: "QA",
					status: "locked" as const,
					artifactLabel: "QA log",
					isImplemented: true,
				},
				{
					id: "4.4",
					title: "Feedback Loop",
					shortTitle: "Feedback",
					status: "locked" as const,
					artifactLabel: "Feedback log",
					isImplemented: true,
				},
				{
					id: "4.5",
					title: "Ship Follow-up",
					shortTitle: "Follow-up",
					status: "locked" as const,
					artifactLabel: "Follow-up plan",
					isImplemented: true,
				},
				{
					id: "4.6",
					title: "Mission Record",
					shortTitle: "Record",
					status: "locked" as const,
					artifactLabel: "Mission record",
					isImplemented: true,
				},
			],
		},
	],
};

let missionQueryResult: typeof missionState | undefined = missionState;

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

vi.mock(
	"@/features/course/mission/components/mission/mission-extras-row",
	() => ({
		MissionExtrasRow: () => (
			<div data-extras-row="true">
				<div data-starter-repo-card="mission">Starter Repo</div>
				<div>Product Management for Beginners</div>
			</div>
		),
	}),
);

vi.mock("convex/react", () => ({
	useConvexAuth: () => ({
		isAuthenticated: true,
		isLoading: false,
	}),
	useQuery: () => missionQueryResult,
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		children,
		viewportMode,
		appScrollMode,
	}: {
		children: React.ReactNode;
		viewportMode?: "document" | "app";
		appScrollMode?: "viewport" | "page";
	}) => (
		<div
			data-shell="true"
			data-viewport-mode={viewportMode}
			data-app-scroll-mode={appScrollMode}
		>
			{children}
		</div>
	),
}));

globalThis.React = React;

import { MissionPage } from "@/features/course/mission/components/mission-page";

describe("MissionPage", () => {
	beforeEach(() => {
		missionQueryResult = missionState;
	});

	it("prioritizes the current task and demotes the rest of the route", () => {
		const markup = renderToStaticMarkup(<MissionPage />);

		expect(markup).toContain('data-viewport-mode="app"');
		expect(markup).toContain('data-app-scroll-mode="page"');
		expect(markup).toContain('data-starter-repo-card="mission"');
		expect(markup).toContain("Your weekend roadmap");
		expect(markup).toContain("20 of 31 lessons complete");
		expect(markup).toContain("Start 1.5");
		expect(markup).toContain("All four blocks");
		expect(markup).toContain('data-slot="card"');
		expect(markup).toContain('data-slot="badge"');
		expect(markup).toContain('data-slot="progress"');
		expect(markup).toContain("Product Management for Beginners");
		expect(markup).not.toContain("Mission map");
		expect(markup).not.toContain("Unlock path");
		expect(markup).not.toContain("Current block challenges");
		expect(markup).not.toContain("Cleared");
	});

	it("renders a primitive loading state while mission data is unavailable", () => {
		missionQueryResult = undefined;

		const markup = renderToStaticMarkup(<MissionPage />);

		expect(markup).toContain("Loading");
		expect(markup).toContain('data-slot="card"');
		expect(markup).toContain('data-slot="skeleton"');
	});
});
