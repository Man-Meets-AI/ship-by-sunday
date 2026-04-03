import React from "react";
import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@blueprint-compiler";

import type { BlueprintWorkspaceState } from "@/features/blueprint-flow/lib/blueprint-workspace-types";

const useConvexAuthMock = vi.fn();
const useQueryMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});
const pushMock = vi.fn();

vi.mock("@/features/course/shared/components/app-shell", () => ({
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
		blueprint: {
			getBlueprintWorkspaceState: "getBlueprintWorkspaceState",
			getBlueprintResumeDestination: "getBlueprintResumeDestination",
		},
		course: {
			getBonusMissionState: "getBonusMissionState",
		},
	},
}));

// This test covers review-page behavior; nav rendering is mocked on purpose.
vi.mock("@/features/blueprint-flow/components/blueprint-stage-nav", () => ({
	BlueprintStageNav: () => <div data-testid="blueprint-stage-nav" />,
}));

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="blueprint-review-video-player">
			{title ?? "Lesson video"}
		</div>
	),
}));

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

import { BlueprintReviewPage } from "@/features/blueprint-flow/components/blueprint-review-page";

function createWorkspaceState(
	options: {
		executeShipUnlockedAt?: number;
		factOverrides?: Record<string, unknown>;
	} = {},
): BlueprintWorkspaceState {
	const baseFacts = createCompleteProjectDefinition().facts;
	const facts = Object.fromEntries(
		Object.entries({
			...baseFacts,
			...options.factOverrides,
		}).filter(([, value]) => value !== undefined),
	);
	const projectDefinition = createCanonicalProjectDefinitionDraft({
		clerkUserId: "user_123",
		productKey: "ship-by-sunday",
		facts,
	});
	const stageStatus = deriveStageStatus(projectDefinition.facts);

	return {
		projectDefinition,
		workflowState: options.executeShipUnlockedAt
			? {
					clerkUserId: "user_123",
					productKey: "ship-by-sunday",
					executeShipUnlockedAt: options.executeShipUnlockedAt,
					createdAt: options.executeShipUnlockedAt,
					updatedAt: options.executeShipUnlockedAt,
				}
			: null,
		firstIncompleteStageId: stageStatus.firstIncompleteStageId,
		blueprintReadiness: stageStatus.blueprintReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as BlueprintWorkspaceState;
}

function createBonusMissionState() {
	return {
		exploredCount: 1,
		totalLessons: 4,
		blocks: [
			{
				id: "CEO" as const,
				order: 1,
				lessons: [],
			},
			{
				id: "DESIGN" as const,
				order: 2,
				lessons: [],
			},
			{
				id: "BUILD" as const,
				order: 3,
				lessons: [
					{
						lessonKey: "iterate-the-product-with-ai",
						routeSegment: "iterate-the-product-with-ai",
						id: "3.1",
						displayLabel: "3.1",
						title: "Iterate the product with AI",
						shortTitle: "Iterate",
						block: "BUILD" as const,
						order: 1,
						status: "opened" as const,
						isImplemented: true,
						artifactLabel: "Build notes",
					},
				],
			},
			{
				id: "SHIP" as const,
				order: 4,
				lessons: [],
			},
		],
	};
}

describe("BlueprintReviewPage", () => {
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

	it("renders the Ship Kit handoff and starter download CTA", () => {
		const readyWorkspaceState = createWorkspaceState();
		render(<BlueprintReviewPage initialWorkspaceState={readyWorkspaceState} />);

		expect(
			screen.getByRole("heading", { name: "Review & Download" }),
		).toBeTruthy();
		expect(screen.queryByTestId("local-nav")).toBeNull();
		const reviewVideo = screen.getByTestId("blueprint-review-video-player");
		expect(screen.getByText("Your Ship Kit is ready.")).toBeTruthy();
		expect(screen.getByText("Agent-Ready Packs")).toBeTruthy();
		expect(screen.getByText("Agent-First Starter Repo")).toBeTruthy();
		expect(screen.getByText("One bundle, one source of truth")).toBeTruthy();
		expect(
			screen.getByText(
				"Design, Marketing, Build, and Prompt Packs generated from your answers",
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				"A starter repo shaped for the AI age, with the docs, overrides, and handoff structure already in place",
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				"So design, marketing, code, and prompts all work from the same brief instead of drifting",
			),
		).toBeTruthy();
		expect(
			screen
				.getByRole("link", { name: "Download Ship Kit" })
				.getAttribute("href"),
		).toBe("/api/download/repo");
		expect(
			screen
				.getByRole("link", { name: "Download Ship Kit first" })
				.getAttribute("href"),
		).toBe("/api/download/repo");
		expect(screen.queryByText("QUEST")).toBeNull();
		expect(reviewVideo.textContent).toBe("Review Video");
	});

	it("lets the browser handle the Ship Kit download links directly", () => {
		render(
			<BlueprintReviewPage initialWorkspaceState={createWorkspaceState()} />,
		);

		const primaryDownloadLink = screen.getByRole("link", {
			name: "Download Ship Kit",
		});
		expect(primaryDownloadLink.getAttribute("download")).toBe("");
		const primaryClick = createEvent.click(primaryDownloadLink);
		fireEvent(primaryDownloadLink, primaryClick);
		expect(primaryClick.defaultPrevented).toBe(false);

		const secondaryDownloadLink = screen.getByRole("link", {
			name: "Download Ship Kit first",
		});
		expect(secondaryDownloadLink.getAttribute("download")).toBe("");
		const secondaryClick = createEvent.click(secondaryDownloadLink);
		fireEvent(secondaryDownloadLink, secondaryClick);
		expect(secondaryClick.defaultPrevented).toBe(false);
	});

	it("switches the primary CTA to Build Lessons when the live unlock marker is present", () => {
		useQueryMock.mockImplementation((query) => {
			if (query === undefined || query === "skip") {
				return undefined;
			}
			if (query === "getBlueprintWorkspaceState") {
				return createWorkspaceState({
					executeShipUnlockedAt: 456,
				});
			}
			if (query === "getBlueprintResumeDestination") {
				return {
					destination: "/lesson/iterate-the-product-with-ai",
					kind: "post_review",
					blueprintStageId: null,
					postReviewTargets: {
						reviewDestination: "/review",
						buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
						launchLessonsDestination: "/lesson/product-review",
						lessonMapDestination: "/review?showLessonMap=1",
						latestLessonDestination: "/lesson/iterate-the-product-with-ai",
					},
				};
			}
			if (query === "getBonusMissionState") {
				return createBonusMissionState();
			}
			return undefined;
		});
		render(
			<BlueprintReviewPage initialWorkspaceState={createWorkspaceState()} />,
		);

		const localNav = screen.getByTestId("local-nav");
		expect(localNav.getAttribute("data-local-nav-kind")).toBe("review");
		expect(
			screen.getByRole("link", { name: "Overview" }).getAttribute("href"),
		).toBe("#review-overview");
		expect(
			screen.getByRole("link", { name: "Downloads" }).getAttribute("href"),
		).toBe("#review-downloads");
		expect(
			screen.getByRole("link", { name: "Lesson Map" }).getAttribute("href"),
		).toBe("/review?showLessonMap=1#review-lesson-map");
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
		const lockedWorkspaceState = createWorkspaceState({
			factOverrides: {
				pricing: undefined,
				price_usd_cents: undefined,
			},
		});

		expect(() =>
			render(
				<BlueprintReviewPage initialWorkspaceState={lockedWorkspaceState} />,
			),
		).toThrowError("NEXT_REDIRECT:/build-plan");
		expect(redirectMock).toHaveBeenCalledWith("/build-plan");
	});
});
