import React from "react";
import {
	createEvent,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCodebaseBonusMissionState,
	createCodebasePostReviewTargets,
	createCodebaseWorkspaceState,
} from "./codebase-test-fixtures";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});
const pushMock = vi.fn();

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({
		title,
		subtitle,
		children,
		localNav,
	}: {
		title: string;
		subtitle?: string;
		children: ReactNode;
		localNav?: { kind: string; desktop: ReactNode };
	}) => (
		<div>
			<h1>{title}</h1>
			{subtitle ? <p>{subtitle}</p> : null}
			{localNav ? (
				<div data-testid="local-nav" data-local-nav-kind={localNav.kind}>
					{localNav.desktop}
				</div>
			) : null}
			{children}
		</div>
	),
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

vi.mock("@/convex/_generated/api", () => ({
	api: {
		codebase: {
			getCodebaseWorkspaceState: "getCodebaseWorkspaceState",
			getCodebaseResumeDestination: "getCodebaseResumeDestination",
		},
		course: {
			getBonusMissionState: "getBonusMissionState",
		},
	},
}));

vi.mock(
	"@/app/(workspace)/_components/course/lesson/components/lesson-video-player",
	() => ({
		LessonVideoPlayer: ({ title }: { title?: string }) => (
			<div data-testid="codebase-review-video-player">
				{title ?? "Lesson video"}
			</div>
		),
	}),
);

vi.mock("convex/react", () => ({
	useConvexAuth: () => useConvexAuthMock(),
	useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
	useRouter: () => ({
		push: pushMock,
	}),
}));

import { CodebaseReviewPage } from "@/app/(workspace)/generate-codebase/review/_components/codebase-review-page";

describe("CodebaseReviewPage", () => {
	beforeEach(() => {
		redirectMock.mockClear();
		pushMock.mockReset();
		useConvexAuthMock.mockReset();
		useConvexAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
		});
		useQueryMock.mockReset();
		useQueryMock.mockReturnValue(undefined);
	});

	it("renders the lighter review handoff with the fallback download link", () => {
		render(
			<CodebaseReviewPage
				initialBonusMissionState={createCodebaseBonusMissionState()}
				initialPostReviewTargets={createCodebasePostReviewTargets()}
				initialWorkspaceState={createCodebaseWorkspaceState({
					executeShipUnlockedAt: 456,
				})}
			/>,
		);

		expect(
			screen.getByRole("heading", { level: 1, name: "Review" }),
		).toBeTruthy();
		expect(
			screen.getByText("What you just got and where to go next"),
		).toBeTruthy();
		expect(
			screen.getByText("Your Ship by Sunday Codebase is ready."),
		).toBeTruthy();
		expect(
			screen.getByText(
				"You now have the codebase itself plus the generated Design, Marketing, Build, and Prompt Packs, so the work can keep moving from one source of truth instead of drifting between tools.",
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				"Keep this handoff close while you move into Build Lessons. It is the fastest path from the codebase into execution.",
			),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Continue to Build Lessons" })
				.getAttribute("href"),
		).toBe("/lesson/iterate-the-product-with-ai");
		expect(
			screen
				.getByRole("link", {
					name: "Need the Ship by Sunday Codebase again? Download it here.",
				})
				.getAttribute("href"),
		).toBe("/api/download/repo");
		expect(screen.queryByText("Keep going")).toBeNull();
		expect(
			screen.queryByRole("link", { name: "Download Ship by Sunday Codebase" }),
		).toBeNull();
		expect(screen.queryByText("QUEST")).toBeNull();
		expect(screen.getByTestId("codebase-review-video-player").textContent).toBe(
			"Review Video",
		);
	});

	it("lets the browser handle the fallback download link directly", () => {
		render(
			<CodebaseReviewPage
				initialBonusMissionState={createCodebaseBonusMissionState()}
				initialPostReviewTargets={createCodebasePostReviewTargets()}
				initialWorkspaceState={createCodebaseWorkspaceState({
					executeShipUnlockedAt: 456,
				})}
			/>,
		);

		const fallbackDownloadLink = screen.getByRole("link", {
			name: "Need the Ship by Sunday Codebase again? Download it here.",
		});
		expect(fallbackDownloadLink.getAttribute("download")).toBe("");
		const fallbackClick = createEvent.click(fallbackDownloadLink);
		fireEvent(fallbackDownloadLink, fallbackClick);
		expect(fallbackClick.defaultPrevented).toBe(false);
	});

	it("attempts the one-time auto-download handoff only when requested", async () => {
		const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click");

		try {
			render(
				<CodebaseReviewPage
					initialAutoDownload
					initialBonusMissionState={createCodebaseBonusMissionState()}
					initialPostReviewTargets={createCodebasePostReviewTargets()}
					initialWorkspaceState={createCodebaseWorkspaceState({
						executeShipUnlockedAt: 456,
					})}
				/>,
			);

			await waitFor(() => {
				expect(clickSpy).toHaveBeenCalledTimes(1);
			});
		} finally {
			clickSpy.mockRestore();
		}
	});

	it("shows the handoff nav and Build Lessons CTA when post-review is unlocked", () => {
		render(
			<CodebaseReviewPage
				initialBonusMissionState={createCodebaseBonusMissionState()}
				initialPostReviewTargets={createCodebasePostReviewTargets()}
				initialWorkspaceState={createCodebaseWorkspaceState({
					executeShipUnlockedAt: 456,
				})}
			/>,
		);

		const localNav = screen.getByTestId("local-nav");
		expect(localNav.getAttribute("data-local-nav-kind")).toBe("review");
		expect(
			screen.getByRole("link", { name: "Overview" }).getAttribute("href"),
		).toBe("#review-overview");
		expect(
			screen.getByRole("link", { name: "Handoff" }).getAttribute("href"),
		).toBe("#review-handoff");
		expect(
			screen.getByRole("link", { name: "Lesson Map" }).getAttribute("href"),
		).toBe("/generate-codebase/review?showLessonMap=1#review-lesson-map");
		expect(
			screen.getByRole("link", { name: "Build Lessons" }).getAttribute("href"),
		).toBe("/lesson/iterate-the-product-with-ai");
		expect(
			screen.getByRole("link", { name: "Launch Lessons" }).getAttribute("href"),
		).toBe("/lesson/product-review");
		expect(
			screen
				.getByRole("link", { name: "Continue to Build Lessons" })
				.getAttribute("href"),
		).toBe("/lesson/iterate-the-product-with-ai");
	});

	it("redirects back to the first incomplete stage when review is still locked", () => {
		const lockedWorkspaceState = createCodebaseWorkspaceState({
			factOverrides: {
				pricing: undefined,
				price_usd_cents: undefined,
			},
		});

		expect(() =>
			render(
				<CodebaseReviewPage initialWorkspaceState={lockedWorkspaceState} />,
			),
		).toThrowError("NEXT_REDIRECT:/starter/generate-codebase");
		expect(redirectMock).toHaveBeenCalledWith("/starter/generate-codebase");
	});
});
