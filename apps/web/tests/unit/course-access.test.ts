import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const fetchQueryMock = vi.fn();
const getConvexServerSessionMock = vi.fn();

vi.mock("server-only", () => ({}));

vi.mock("next/navigation", () => ({
	redirect: redirectMock,
}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: fetchQueryMock,
}));

vi.mock("@/platform/auth/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		access: {
			viewerProductAccess: "viewerProductAccess",
		},
		packet: {
			getPacketResumeDestination: "getPacketResumeDestination",
		},
	},
}));

describe("product access server helpers", () => {
	beforeEach(() => {
		redirectMock.mockReset();
		fetchQueryMock.mockReset();
		getConvexServerSessionMock.mockReset();
		vi.resetModules();
	});

	it("returns signed_out when no Clerk session is present", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: null,
			token: null,
		});

		const { getServerProductAccess } =
			await import("@/features/product-access/server/product-access");

		const access = await getServerProductAccess();

		expect(access).toMatchObject({
			hasAccess: false,
			status: "signed_out",
		});
		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("keeps signed-in users with a missing Convex token on the recovery surface", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: null,
		});

		const { getServerProductAccess } =
			await import("@/features/product-access/server/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			clerkUserId: "user_123",
			hasAccess: false,
			status: "token_missing",
		});
	});

	it("returns granted access when Convex confirms the purchase", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		const { getServerProductAccess } =
			await import("@/features/product-access/server/product-access");

		await expect(getServerProductAccess()).resolves.toEqual({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
	});

	it("redirects home visitors to their saved resume destination when allowed", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: true,
				clerkUserId: "user_123",
				status: "granted",
			})
			.mockResolvedValueOnce({
				destination: "/design",
				kind: "packet_stage",
				packetStageId: "design",
				postReviewTargets: null,
			});

		const { redirectGrantedHomeVisitor } =
			await import("@/features/product-access/server/product-access");

		await redirectGrantedHomeVisitor({ allowMarketing: false });

		expect(redirectMock).toHaveBeenCalledWith("/design");
	});

	it("does nothing when the home page explicitly allows marketing mode", async () => {
		const { redirectGrantedHomeVisitor } =
			await import("@/features/product-access/server/product-access");

		await redirectGrantedHomeVisitor({ allowMarketing: true });

		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("returns null when a granted viewer cannot mint a Convex token for resume data", async () => {
		getConvexServerSessionMock
			.mockResolvedValueOnce({
				userId: "user_123",
				token: "token_123",
			})
			.mockResolvedValueOnce({
				userId: "user_123",
				token: null,
			});
		fetchQueryMock.mockResolvedValue({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		const { getServerResumeDestination } =
			await import("@/features/product-access/server/product-access");

		await expect(getServerResumeDestination()).resolves.toBeNull();
	});

	it("relays the centralized post-review resume destination for granted viewers", async () => {
		getConvexServerSessionMock
			.mockResolvedValueOnce({
				userId: "user_123",
				token: "token_123",
			})
			.mockResolvedValueOnce({
				userId: "user_123",
				token: "token_123",
			});
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: true,
				clerkUserId: "user_123",
				status: "granted",
			})
			.mockResolvedValueOnce({
				destination: "/lesson/product-review",
				kind: "post_review",
				packetStageId: null,
				postReviewTargets: {
					reviewDestination: "/review",
					buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
					launchLessonsDestination: "/lesson/product-review",
					lessonMapDestination: "/review?showLessonMap=1",
					latestLessonDestination: "/lesson/product-review",
				},
			});

		const { getServerResumeDestination } =
			await import("@/features/product-access/server/product-access");

		await expect(getServerResumeDestination()).resolves.toEqual({
			destination: "/lesson/product-review",
			kind: "post_review",
			packetStageId: null,
			postReviewTargets: {
				reviewDestination: "/review",
				buildLessonsDestination: "/lesson/iterate-the-product-with-ai",
				launchLessonsDestination: "/lesson/product-review",
				lessonMapDestination: "/review?showLessonMap=1",
				latestLessonDestination: "/lesson/product-review",
			},
		});
	});
});
