import {
	APPS_WEB_DIRECTORY,
	buildGrantProductAccessCommand,
	CONVEX_BIN_PATH,
	grantConvexProductAccess,
} from "@/scripts/lib/convex-product-access-grant.mjs";

describe("convex product access grant helper", () => {
	it("builds the direct Convex CLI command from apps/web", () => {
		const command = buildGrantProductAccessCommand({
			clerkUserId: "user_123",
		});

		expect(command).toEqual({
			command: process.execPath,
			args: [
				CONVEX_BIN_PATH,
				"run",
				"entitlements:grantProductAccess",
				'{"clerkUserId":"user_123","source":"manual","capabilities":["generate_codebase","tutorials"]}',
			],
		});
	});

	it("runs the shared helper from apps/web and preserves QA_COURSE_SLUG", async () => {
		const runCommand = vi.fn().mockResolvedValue({
			code: 0,
			stdout: '{"granted":"patched"}',
			stderr: "",
		});

		await grantConvexProductAccess({
			clerkUserId: "user_123",
			courseSlug: "ship-by-sunday",
			env: { EXISTING_FLAG: "1" },
			runCommand,
		});

		expect(runCommand).toHaveBeenCalledWith(
			process.execPath,
			[
				CONVEX_BIN_PATH,
				"run",
				"entitlements:grantProductAccess",
				'{"clerkUserId":"user_123","source":"manual","capabilities":["generate_codebase","tutorials"]}',
			],
			{
				cwd: APPS_WEB_DIRECTORY,
				env: {
					EXISTING_FLAG: "1",
					QA_COURSE_SLUG: "ship-by-sunday",
				},
			},
		);
	});
});
