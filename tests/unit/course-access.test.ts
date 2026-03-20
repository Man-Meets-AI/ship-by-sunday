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
		course: {
			getResumeDestination: "getResumeDestination",
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

	it("keeps signed-out visitors on access-required instead of forcing a sign-in redirect", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: null,
			token: null,
		});

		const { redirectGrantedAccessRequiredVisitor } =
			await import("@/features/product-access/server/product-access");

		const access = await redirectGrantedAccessRequiredVisitor();

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

	it("still redirects granted visitors into mission", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			hasAccess: true,
			clerkUserId: "user_123",
			status: "granted",
		});

		const { redirectGrantedAccessRequiredVisitor } =
			await import("@/features/product-access/server/product-access");

		await redirectGrantedAccessRequiredVisitor();

		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
		expect(redirectMock).toHaveBeenCalledWith("/mission");
	});
});
