import { describe, expect, it } from "vitest";

import { withConvexDeploymentEnv } from "../e2e/global-setup";

describe("withConvexDeploymentEnv", () => {
	it("derives a hosted staging deployment for non-local QA targets", () => {
		const env = withConvexDeploymentEnv({
			NEXT_PUBLIC_CONVEX_URL: "https://helpful-meadowlark-297.convex.cloud",
			PLAYWRIGHT_BASE_URL: "https://dev.man-meets-ai.com",
		});

		expect(env.CONVEX_DEPLOYMENT).toBe("prod:helpful-meadowlark-297");
	});

	it("keeps local QA targets unchanged", () => {
		const env = withConvexDeploymentEnv({
			NEXT_PUBLIC_CONVEX_URL: "https://helpful-meadowlark-297.convex.cloud",
			PLAYWRIGHT_BASE_URL: "http://localhost:3000",
		});

		expect(env.CONVEX_DEPLOYMENT).toBeUndefined();
	});

	it("preserves explicit deployment names", () => {
		const env = withConvexDeploymentEnv({
			CONVEX_DEPLOYMENT: "prod:existing",
			NEXT_PUBLIC_CONVEX_URL: "https://helpful-meadowlark-297.convex.cloud",
			PLAYWRIGHT_BASE_URL: "https://dev.man-meets-ai.com",
		});

		expect(env.CONVEX_DEPLOYMENT).toBe("prod:existing");
	});
});
