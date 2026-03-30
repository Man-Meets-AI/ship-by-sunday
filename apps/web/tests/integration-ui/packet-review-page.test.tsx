import React from "react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCanonicalProjectDefinitionDraft,
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@packet-compiler";

import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

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
	}: {
		title: string;
		subtitle?: string;
		children: ReactNode;
	}) => (
		<div>
			<h1>{title}</h1>
			{subtitle ? <p>{subtitle}</p> : null}
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
		packet: {
			getPacketWorkspaceState: "getPacketWorkspaceState",
			getPacketResumeDestination: "getPacketResumeDestination",
		},
		course: {
			getBonusMissionState: "getBonusMissionState",
		},
	},
}));

// This test covers review-page behavior; nav rendering is mocked on purpose.
vi.mock("@/features/packet-flow/components/packet-stage-nav", () => ({
	PacketStageNav: () => <div data-testid="packet-stage-nav" />,
}));

vi.mock("@/features/course/lesson/components/lesson-video-player", () => ({
	LessonVideoPlayer: ({ title }: { title?: string }) => (
		<div data-testid="packet-review-video-player">
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

import { PacketReviewPage } from "@/features/packet-flow/components/packet-review-page";

function createWorkspaceState(
	options: {
		executeShipUnlockedAt?: number;
		factOverrides?: Record<string, unknown>;
	} = {},
): PacketWorkspaceState {
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
		packetReadiness: stageStatus.packetReadiness,
		stageStatuses: stageStatus.stageStatuses,
	} as PacketWorkspaceState;
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

describe("PacketReviewPage", () => {
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
		render(<PacketReviewPage initialWorkspaceState={readyWorkspaceState} />);

		expect(
			screen.getByRole("heading", { name: "Review & Download" }),
		).toBeTruthy();
		const reviewVideo = screen.getByTestId("packet-review-video-player");
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

	it("switches the primary CTA to Build Lessons when the live unlock marker is present", () => {
		useQueryMock.mockImplementation((query) => {
			if (query === undefined || query === "skip") {
				return undefined;
			}
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState({
					executeShipUnlockedAt: 456,
				});
			}
			if (query === "getPacketResumeDestination") {
				return {
					destination: "/lesson/iterate-the-product-with-ai",
					kind: "post_review",
					packetStageId: null,
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
		render(<PacketReviewPage initialWorkspaceState={createWorkspaceState()} />);

		expect(
			screen
				.getByRole("link", { name: "Continue to Build Lessons" })
				.getAttribute("href"),
		).toBe("/lesson/iterate-the-product-with-ai");
	});

	it("redirects back to the first incomplete stage when review is still locked", () => {
		const lockedWorkspaceState = createWorkspaceState({
			factOverrides: {
				objective: undefined,
			},
		});

		expect(() =>
			render(<PacketReviewPage initialWorkspaceState={lockedWorkspaceState} />),
		).toThrowError("NEXT_REDIRECT:/build-plan");
		expect(redirectMock).toHaveBeenCalledWith("/build-plan");
	});
});
