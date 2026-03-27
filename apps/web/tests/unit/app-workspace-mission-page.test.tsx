import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import type { BonusMissionState } from "@/features/execute-ship/lib/bonus-mission-types";

const fetchAuthenticatedQueryMock = vi.fn();

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

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
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
						lessonKey: "iterate-the-product-with-ai",
						routeSegment: "iterate-the-product-with-ai",
						id: "3.1",
						displayLabel: "3.1",
						title: "Iterate the product with AI",
						shortTitle: "Iterate",
						block: "BUILD",
						order: 1,
						status: "opened",
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

describe("workspace mission route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		vi.resetModules();
	});

	it("renders explicit unlock messaging before the bonus is available", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState();
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");

		const markup = renderToStaticMarkup(await MissionRoutePage());

		expect(markup).toContain("Mission unlocks after Review &amp; Download.");
		expect(markup).toContain('href="/review"');
	});

	it("keeps the restored route reachable after unlock without redirecting to start", async () => {
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

		const { default: MissionRoutePage } =
			await import("@/app/(workspace)/mission/page");

		const markup = renderToStaticMarkup(await MissionRoutePage());

		expect(markup).toContain("Packet ready. BUILD is the continuation path.");
		expect(markup).toContain("Product, Design, Build, Ship");
		expect(markup).toContain('href="/lesson/iterate-the-product-with-ai"');
		expect(markup).not.toContain("Completed earlier");
	});
});
