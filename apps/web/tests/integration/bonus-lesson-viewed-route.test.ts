import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexError } from "convex/values";

vi.mock("server-only", () => ({}));

const { authMock, fetchMutationMock } = vi.hoisted(() => ({
	authMock: vi.fn(),
	fetchMutationMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: authMock,
}));

vi.mock("convex/nextjs", () => ({
	fetchMutation: fetchMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			markBonusLessonViewed: "course.markBonusLessonViewed",
		},
	},
}));

import { POST } from "@/app/api/course/bonus-lesson-viewed/route";

function createRequest(body: unknown) {
	return new Request("https://example.test/api/course/bonus-lesson-viewed", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
	});
}

describe("POST /api/course/bonus-lesson-viewed", () => {
	beforeEach(() => {
		authMock.mockReset();
		fetchMutationMock.mockReset();
	});

	it("rejects unauthenticated requests before writing", async () => {
		authMock.mockResolvedValue({ userId: null });

		const response = await POST(
			createRequest({ lessonKey: "iterate-the-product-with-ai" }),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(401);
		expect(body).toMatchObject({
			code: "UNAUTHORIZED",
		});
		expect(fetchMutationMock).not.toHaveBeenCalled();
	});

	it("rejects malformed lesson keys", async () => {
		authMock.mockResolvedValue({
			userId: "user_123",
			getToken: vi.fn().mockResolvedValue("token_123"),
		});

		const response = await POST(createRequest({ lessonKey: "" }));
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(400);
		expect(body).toMatchObject({
			code: "BAD_REQUEST",
		});
		expect(fetchMutationMock).not.toHaveBeenCalled();
	});

	it("marks the lesson viewed with the authenticated Convex token", async () => {
		const getToken = vi.fn().mockResolvedValue("token_123");
		authMock.mockResolvedValue({
			userId: "user_123",
			getToken,
		});
		fetchMutationMock.mockResolvedValue({
			viewedAt: 123,
			created: true,
		});

		const response = await POST(
			createRequest({ lessonKey: "iterate-the-product-with-ai" }),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(200);
		expect(body).toMatchObject({
			viewedAt: 123,
			created: true,
		});
		expect(getToken).toHaveBeenCalledWith({ template: "convex" });
		expect(fetchMutationMock).toHaveBeenCalledWith(
			"course.markBonusLessonViewed",
			{ lessonKey: "iterate-the-product-with-ai" },
			{ token: "token_123" },
		);
	});

	it("maps locked bonus access to forbidden", async () => {
		authMock.mockResolvedValue({
			userId: "user_123",
			getToken: vi.fn().mockResolvedValue("token_123"),
		});
		fetchMutationMock.mockRejectedValue(
			new ConvexError("Execute / Ship is still locked"),
		);

		const response = await POST(
			createRequest({ lessonKey: "iterate-the-product-with-ai" }),
		);
		const body = (await response.json()) as Record<string, unknown>;

		expect(response.status).toBe(403);
		expect(body).toMatchObject({
			code: "FORBIDDEN",
		});
	});
});
