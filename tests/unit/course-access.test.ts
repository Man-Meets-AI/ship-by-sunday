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

vi.mock("@/lib/server/convex-auth", () => ({
	getConvexServerSession: getConvexServerSessionMock,
}));

vi.mock("@/convex/_generated/api", () => ({
	api: {
		course: {
			viewerAccess: "viewerAccess",
			getResumeDestination: "getResumeDestination",
		},
	},
}));

describe("course access server helpers", () => {
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

		const { redirectAuthorizedAccessRequiredVisitor } = await import(
			"@/lib/server/course-access"
		);

		const access = await redirectAuthorizedAccessRequiredVisitor();

		expect(access).toMatchObject({
			hasAccess: false,
			status: "signed_out",
		});
		expect(fetchQueryMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	it("still redirects entitled visitors into mission", async () => {
		getConvexServerSessionMock.mockResolvedValue({
			userId: "user_123",
			token: "token_123",
		});
		fetchQueryMock.mockResolvedValue({
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
			hasAccess: true,
			status: "active",
		});

		const { redirectAuthorizedAccessRequiredVisitor } = await import(
			"@/lib/server/course-access"
		);

		await redirectAuthorizedAccessRequiredVisitor();

		expect(fetchQueryMock).toHaveBeenCalledTimes(1);
		expect(redirectMock).toHaveBeenCalledWith("/mission");
	});
});
