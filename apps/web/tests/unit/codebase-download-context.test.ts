import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	createCanonicalProjectDefinitionMock,
	fetchQueryMock,
	getConvexServerSessionMock,
} = vi.hoisted(() => ({
	createCanonicalProjectDefinitionMock: vi.fn(
		(definition: Record<string, unknown>) => ({
			canonical: true,
			...definition,
		}),
	),
	fetchQueryMock: vi.fn(),
	getConvexServerSessionMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: fetchQueryMock,
}));

vi.mock("@shipbysunday/codebase-compiler", () => ({
	createCanonicalProjectDefinition: createCanonicalProjectDefinitionMock,
}));

vi.mock("@/platform/auth/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

async function importDownloadContextModule() {
	return import("@/app/api/download/repo/_server/downloads");
}

describe("getCodebaseDownloadContext", () => {
	beforeEach(() => {
		vi.resetModules();
		createCanonicalProjectDefinitionMock.mockReset();
		createCanonicalProjectDefinitionMock.mockImplementation(
			(definition: Record<string, unknown>) => ({
				canonical: true,
				...definition,
			}),
		);
		fetchQueryMock.mockReset();
		getConvexServerSessionMock.mockReset();
	});

	it("returns null before querying Convex when there is no auth token", async () => {
		getConvexServerSessionMock.mockResolvedValue({ token: null });
		const { getCodebaseDownloadContext } = await importDownloadContextModule();

		await expect(getCodebaseDownloadContext()).resolves.toBeNull();

		expect(fetchQueryMock).not.toHaveBeenCalled();
	});

	it("does not query codebase state for users without codebase generation access", async () => {
		getConvexServerSessionMock.mockResolvedValue({ token: "convex-token" });
		fetchQueryMock.mockResolvedValueOnce({
			hasAccess: true,
			capabilities: ["tutorials"],
		});
		const { getCodebaseDownloadContext } = await importDownloadContextModule();

		await expect(getCodebaseDownloadContext()).resolves.toBeNull();

		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
		expect(createCanonicalProjectDefinitionMock).not.toHaveBeenCalled();
	});

	it("loads codebase download state for users with codebase generation access", async () => {
		const projectDefinition = {
			clerkUserId: "user_123",
			productKey: "starter",
			facts: [],
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 2,
		};
		const workspaceState = {
			workspaceId: "workspace_123",
			updatedAt: 3,
		};
		getConvexServerSessionMock.mockResolvedValue({ token: "convex-token" });
		fetchQueryMock
			.mockResolvedValueOnce({
				hasAccess: true,
				capabilities: ["generate_codebase"],
			})
			.mockResolvedValueOnce(projectDefinition)
			.mockResolvedValueOnce(workspaceState);
		const { getCodebaseDownloadContext } = await importDownloadContextModule();

		const context = await getCodebaseDownloadContext();

		expect(fetchQueryMock).toHaveBeenCalledTimes(3);
		expect(context).toEqual({
			canonicalProjectDefinition: {
				canonical: true,
				...projectDefinition,
			},
			workspaceState,
			token: "convex-token",
		});
	});
});
