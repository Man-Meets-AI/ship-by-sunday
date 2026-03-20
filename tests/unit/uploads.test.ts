import { describe, expect, it, vi } from "vitest";

import { generateUploadUrl } from "@/convex/uploads";

const clerkUserId = "user_upload_123";

function createUploadsCtx({
	identity = { subject: clerkUserId },
	productAccessGrant = {
		_id: "product_access_1",
		_creationTime: 1,
		clerkUserId,
		status: "granted",
		source: "manual",
		grantedAt: 1,
		updatedAt: 1,
	},
	generateUploadUrlMock = vi
		.fn()
		.mockResolvedValue("https://storage.example.com/upload"),
}: {
	identity?: { subject: string } | null;
	productAccessGrant?: Record<string, unknown> | null;
	generateUploadUrlMock?: ReturnType<typeof vi.fn>;
} = {}) {
	return {
		auth: {
			getUserIdentity: vi.fn().mockResolvedValue(identity),
		},
		db: {
			query: vi.fn((table: string) => {
				if (table !== "productAccessGrants") {
					throw new Error(`Unexpected table query: ${table}`);
				}

				return {
					withIndex: vi.fn(() => ({
						unique: vi.fn().mockResolvedValue(productAccessGrant),
					})),
				};
			}),
		},
		storage: {
			generateUploadUrl: generateUploadUrlMock,
		},
	};
}

describe("convex/uploads", () => {
	it("rejects signed-out callers", async () => {
		const ctx = createUploadsCtx({ identity: null });

		await expect(generateUploadUrl._handler(ctx as never)).rejects.toThrow(
			"Unauthorized",
		);
		expect(ctx.storage.generateUploadUrl).not.toHaveBeenCalled();
	});

	it("rejects signed-in callers without granted product access", async () => {
		const ctx = createUploadsCtx({ productAccessGrant: null });

		await expect(generateUploadUrl._handler(ctx as never)).rejects.toThrow(
			"Access required",
		);
		expect(ctx.storage.generateUploadUrl).not.toHaveBeenCalled();
	});

	it("issues upload URLs for granted viewers", async () => {
		const ctx = createUploadsCtx();

		await expect(generateUploadUrl._handler(ctx as never)).resolves.toBe(
			"https://storage.example.com/upload",
		);
		expect(ctx.storage.generateUploadUrl).toHaveBeenCalledTimes(1);
	});
});
