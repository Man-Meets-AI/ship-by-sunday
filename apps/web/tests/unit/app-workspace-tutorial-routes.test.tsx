import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAuthenticatedQueryMock = vi.fn();
const fetchAuthenticatedMutationMock = vi.fn();
const notFoundMock = vi.fn(() => {
	throw new Error("NEXT_NOT_FOUND");
});
const redirectMock = vi.fn((destination: string) => {
	throw new Error(`redirect:${destination}`);
});
const loadWorkspacePageAccessMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedMutation: fetchAuthenticatedMutationMock,
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/app/(app)/_server/load-workspace-page-access", () => ({
	loadWorkspacePageAccess: loadWorkspacePageAccessMock,
}));

vi.mock("@/app/(app)/_components/access-required/access-required-page", () => ({
	AccessRequiredPage: () => <div>Access recovery</div>,
}));

vi.mock("next/navigation", () => ({
	notFound: () => notFoundMock(),
	redirect: redirectMock,
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

vi.mock("@/app/(app)/_components/app-shell", () => ({
	AppShell: ({
		children,
		showSkillRail,
	}: {
		children: React.ReactNode;
		showSkillRail?: boolean;
	}) => <div data-show-skill-rail={String(showSkillRail)}>{children}</div>,
}));

vi.mock(
	"@/app/(app)/_components/course/lesson/shells/lesson-shell-watch",
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
		loadWorkspacePageAccessMock.mockReset();
		loadWorkspacePageAccessMock.mockResolvedValue({
			access: {
				capabilities: ["generate_codebase", "tutorials", "worker"],
				hasAccess: true,
			},
			kind: "granted",
		});
		notFoundMock.mockClear();
		redirectMock.mockClear();
		vi.resetModules();
	});

	it("renders the Tutorial Videos index without Convex server calls", async () => {
		const { default: TutorialsPage } =
			await import("@/app/(app)/starter/lessons/page");

		const markup = renderToStaticMarkup(await TutorialsPage());

		expect(markup).toContain("Tutorial Videos");
		expect(markup).toContain("29 videos");
		expect(markup).toContain("/starter/lessons/build-kickoff");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});

	it("renders tutorial detail pages without generated-codebase progress chrome", async () => {
		const { default: TutorialVideoRoute } =
			await import("@/app/(app)/starter/lessons/[lessonKey]/page");

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

	it("returns access recovery for Starter lesson detail pages without a grant", async () => {
		loadWorkspacePageAccessMock.mockResolvedValue({
			access: {
				capabilities: [],
				hasAccess: false,
			},
			kind: "access_required",
		});
		const { default: TutorialVideoRoute } =
			await import("@/app/(app)/starter/lessons/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await TutorialVideoRoute({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
			}),
		);

		expect(markup).toContain("Access recovery");
		expect(markup).not.toContain("Build Kickoff");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});

	it("returns not found for unknown tutorial lesson segments", async () => {
		const { default: TutorialVideoRoute } =
			await import("@/app/(app)/starter/lessons/[lessonKey]/page");

		await expect(
			TutorialVideoRoute({
				params: Promise.resolve({ lessonKey: "not-a-real-lesson" }),
			}),
		).rejects.toThrowError("NEXT_NOT_FOUND");
		expect(fetchAuthenticatedQueryMock).not.toHaveBeenCalled();
		expect(fetchAuthenticatedMutationMock).not.toHaveBeenCalled();
	});

	it("redirects legacy tutorials routes to Starter lessons routes", async () => {
		const { default: LegacyTutorialsPage } =
			await import("@/app/(app)/tutorials/page");
		const { default: LegacyTutorialVideoRoute } =
			await import("@/app/(app)/tutorials/[lessonKey]/page");

		expect(() => LegacyTutorialsPage()).toThrow("redirect:/starter/lessons");
		await expect(
			LegacyTutorialVideoRoute({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
			}),
		).rejects.toThrow("redirect:/starter/lessons/build-kickoff");
	});
});
