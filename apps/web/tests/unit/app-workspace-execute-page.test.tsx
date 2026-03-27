import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";

const fetchAuthenticatedQueryMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
	throw new Error(`NEXT_REDIRECT:${href}`);
});

vi.mock("@/convex/_generated/api", () => ({
	api: {
		packet: {
			getPacketWorkspaceState: "getPacketWorkspaceState",
		},
		course: {
			getBonusRouteState: "getBonusRouteState",
		},
	},
}));

vi.mock("next/navigation", () => ({
	redirect: (href: string) => redirectMock(href),
}));

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

vi.mock("@/platform/convex/server-preload", () => ({
	fetchAuthenticatedQuery: fetchAuthenticatedQueryMock,
}));

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/features/packet-flow/components/video/packet-video-card", () => ({
	PacketVideoCard: ({
		content,
	}: {
		content:
			| {
					kind: "video";
					description: string;
					title: string;
					video: { videoId: string };
			  }
			| { kind: "orientation"; description: string; title: string };
	}) => (
		<div>
			<p>{content.title}</p>
			{content.kind === "video" ? <p>{content.video.videoId}</p> : null}
			{content.kind === "orientation" ? <p>{content.description}</p> : null}
		</div>
	),
}));

function createWorkspaceState(
	executeShipUnlockedAt?: number,
): PacketWorkspaceState {
	return {
		projectDefinition: {
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			schemaVersion: 1,
			facts: {
				product_name: "Ship by Sunday OS",
			},
			placeholdersInUse: false,
			createdAt: 1,
			updatedAt: 1,
		},
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

describe("workspace execute route", () => {
	beforeEach(() => {
		fetchAuthenticatedQueryMock.mockReset();
		redirectMock.mockClear();
		vi.resetModules();
	});

	it("redirects locked visitors back to review", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState();
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ExecuteRoutePage } =
			await import("@/app/(workspace)/execute/page");

		await expect(ExecuteRoutePage()).rejects.toThrowError(
			"NEXT_REDIRECT:/review",
		);
		expect(redirectMock).toHaveBeenCalledWith("/review");
	});

	it("renders the bridge for a newly unlocked visitor", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: false };
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ExecuteRoutePage } =
			await import("@/app/(workspace)/execute/page");

		const markup = renderToStaticMarkup(await ExecuteRoutePage());

		expect(markup).toContain(
			"Ship by Sunday OS has its packet. Now ship the first slice.",
		);
		expect(markup).toContain("Continue in Build");
		expect(markup).toContain("Start from the beginning");
		expect(markup).toContain("Execute / Ship orientation");
		expect(markup).toContain(
			"Watch this first so the Execute / Ship handoff stays anchored to the packet-first flow before you continue in BUILD.",
		);
		expect(markup).toContain("3382315c-5cec-4d1c-aa37-611f8b52e6cf");
		expect(markup).toContain(`href="${getLessonHref("1.1")}"`);
		expect(markup).toContain(`href="${getLessonHref("3.1")}"`);
		expect(markup).not.toContain("Browse the bonus library");
	});

	it("redirects repeat visitors from the route entry into mission", async () => {
		fetchAuthenticatedQueryMock.mockImplementation(async (query) => {
			if (query === "getPacketWorkspaceState") {
				return createWorkspaceState(123);
			}

			if (query === "getBonusRouteState") {
				return { hasStartedBonusLesson: true };
			}

			throw new Error(`Unexpected query: ${String(query)}`);
		});

		const { default: ExecuteRoutePage } =
			await import("@/app/(workspace)/execute/page");

		const page = await ExecuteRoutePage();

		expect(() => renderToStaticMarkup(page)).toThrowError(
			"NEXT_REDIRECT:/mission",
		);
		expect(redirectMock).toHaveBeenCalledWith("/mission");
	});
});
