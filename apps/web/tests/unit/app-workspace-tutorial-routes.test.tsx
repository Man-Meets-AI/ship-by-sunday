import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const fetchAuthenticatedMutationMock = vi.fn();
const notFoundMock = vi.fn(() => {
	throw new Error("NEXT_NOT_FOUND");
});

vi.mock("server-only", () => ({}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedMutation: fetchAuthenticatedMutationMock,
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("next/navigation", () => ({
	notFound: () => notFoundMock(),
}));

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		children,
		showSkillRail,
	}: {
		children: React.ReactNode;
		showSkillRail?: boolean;
	}) => <div data-show-skill-rail={String(showSkillRail)}>{children}</div>,
}));

vi.mock(
	"@/app/(workspace)/_components/course/lesson/shells/lesson-shell-watch",
	() => ({
		LessonShellWatch: ({
			lesson,
			footer,
			pinnedArtifacts,
		}: {
			lesson: { title: string };
			footer: React.ReactNode;
			pinnedArtifacts: unknown[];
		}) => (
			<div>
				<h1>{lesson.title}</h1>
				<div data-testid="pinned-artifact-count">{pinnedArtifacts.length}</div>
				{footer}
			</div>
		),
	}),
);

describe("workspace tutorial routes", () => {
	beforeEach(() => {
		fetchAuthenticatedMutationMock.mockReset();
		fetchAuthenticatedQueryMock.mockReset();
		notFoundMock.mockClear();
		vi.resetModules();
	});

	it("renders the Tutorial Videos index without Convex server calls", async () => {
		const { default: TutorialsPage } =
			await import("@/app/(workspace)/tutorials/page");

		const markup = renderToStaticMarkup(await TutorialsPage());

		expect(markup).toContain("Tutorial Videos");
		expect(markup).toContain("29 videos");
		expect(markup).toContain("/tutorials/build-kickoff");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});

	it("renders tutorial detail pages without generated-codebase progress chrome", async () => {
		const { default: TutorialVideoRoute } =
			await import("@/app/(workspace)/tutorials/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await TutorialVideoRoute({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
			}),
		);

		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain("Tutorial Videos");
		expect(markup).toContain("Next video");
		expect(markup).toContain('data-testid="pinned-artifact-count">0');
		expect(markup).not.toContain("Lesson Map");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});

	it("returns not found for unknown tutorial lesson segments", async () => {
		const { default: TutorialVideoRoute } =
			await import("@/app/(workspace)/tutorials/[lessonKey]/page");

		await expect(
			TutorialVideoRoute({
				params: Promise.resolve({ lessonKey: "not-a-real-lesson" }),
			}),
		).rejects.toThrowError("NEXT_NOT_FOUND");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});
});
