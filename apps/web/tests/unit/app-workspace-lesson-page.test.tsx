import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";

const fetchAuthenticatedQueryMock = vi.fn();
const notFoundMock = vi.fn(() => {
	throw new Error("NEXT_NOT_FOUND");
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
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	notFound: () => notFoundMock(),
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/features/execute-ship/components/bonus-lesson-view-tracker", () => ({
	BonusLessonViewTracker: () => null,
}));

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		packet: {
			getPacketWorkspaceState: "getPacketWorkspaceState",
		},
		course: {
			getBonusRouteState: "getBonusRouteState",
			getBonusMissionState: "getBonusMissionState",
		},
	},
}));

function createWorkspaceState(
	executeShipUnlockedAt?: number,
): PacketWorkspaceState {
	return {
		projectDefinition: null,
		workflowState: executeShipUnlockedAt
			? {
					clerkUserId: "user_123",
					productKey: "ship-by-sunday",
					executeShipUnlockedAt,
					createdAt: executeShipUnlockedAt,
					updatedAt: executeShipUnlockedAt,
				}
			: null,
		firstIncompleteStageId: "review",
		packetReadiness: {} as PacketWorkspaceState["packetReadiness"],
		stageStatuses: [] as PacketWorkspaceState["stageStatuses"],
	};
}

function createBonusMissionState(): BonusMissionState {
	return {
		exploredCount: 1,
		totalLessons: 29,
		blocks: [
			{
				id: "CEO",
				order: 1,
				lessons: [],
			},
			{
				id: "DESIGN",
				order: 2,
				lessons: [],
			},
			{
				id: "BUILD",
				order: 3,
				lessons: [
					{
						lessonKey: "build-kickoff",
						routeSegment: "build-kickoff",
						id: "3.0",
						displayLabel: "3.0",
						title: "Build Kickoff",
						shortTitle: "Kickoff",
						block: "BUILD",
						order: 0,
						status: "opened",
						isImplemented: true,
						artifactLabel: "Build kickoff ready",
						durationLabel: "1m 29s",
					},
					{
						lessonKey: "iterate-the-product-with-ai",
						routeSegment: "iterate-the-product-with-ai",
						id: "3.1",
						displayLabel: "3.1",
						title: "Iterate the product with AI",
						shortTitle: "Iterate",
						block: "BUILD",
						order: 1,
						status: "available",
						isImplemented: true,
						artifactLabel: "Build notes",
						durationLabel: "3m 43s",
					},
				],
			},
			{
				id: "SHIP",
				order: 4,
				lessons: [],
			},
		],
	};
}

describe("workspace lesson route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		notFoundMock.mockClear();
		vi.resetModules();
	});

	it("renders explicit unlock messaging before the bonus lesson is available", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState();
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await LessonRoutePage({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
			}),
		);

		expect(markup).toContain(
			"Bonus lessons unlock after Review &amp; Download.",
		);
		expect(markup).toContain(
			"&quot;3.0 Build Kickoff&quot; will open after the bonus unlock is active.",
		);
	});

	it("keeps the restored lesson route reachable after unlock", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: false };
			}

			if (query === "getBonusMissionState") {
				return createBonusMissionState();
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		const markup = renderToStaticMarkup(
			await LessonRoutePage({
				params: Promise.resolve({ lessonKey: "build-kickoff" }),
			}),
		);

		expect(markup).toContain("This bonus lesson is video-first.");
		expect(markup).toContain("Build Kickoff");
		expect(markup).toContain('href="/mission"');
	});

	it("returns not found for an unknown lesson route segment", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: false };
			}

			if (query === "getBonusMissionState") {
				return createBonusMissionState();
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: LessonRoutePage } =
			await import("@/app/(workspace)/lesson/[lessonKey]/page");

		await expect(
			LessonRoutePage({
				params: Promise.resolve({ lessonKey: "not-a-real-lesson" }),
			}),
		).rejects.toThrowError("NEXT_NOT_FOUND");
	});
});
