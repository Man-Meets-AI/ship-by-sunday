import { describe, expect, it } from "vitest";

import {
	buildDeploymentAliasAssignmentUrl,
	buildDeploymentAliasesUrl,
	buildDeploymentListUrl,
	deploymentMatchesTarget,
	extractInlineDeploymentAliases,
	findMatchingDeployments,
} from "../../../../qa/scripts/lib/vercel-deployments.mjs";

describe("vercel deployment helpers", () => {
	it("builds deployment list URLs with preview targets omitted", () => {
		const previewUrl = buildDeploymentListUrl({
			projectId: "prj_123",
			target: "preview",
			teamId: "team_123",
		});
		const productionUrl = buildDeploymentListUrl({
			projectId: "prj_123",
			target: "production",
			teamId: "team_123",
		});

		expect(previewUrl.searchParams.get("target")).toBeNull();
		expect(productionUrl.searchParams.get("target")).toBe("production");
	});

	it("builds alias URLs for reads and writes", () => {
		expect(
			buildDeploymentAliasesUrl({
				deploymentId: "dpl_123",
				teamId: "team_123",
			}).toString(),
		).toContain("/v2/deployments/dpl_123/aliases?teamId=team_123");
		expect(
			buildDeploymentAliasAssignmentUrl({
				deploymentId: "dpl_123",
				teamId: "team_123",
			}).toString(),
		).toContain("/v2/deployments/dpl_123/aliases?teamId=team_123");
	});

	it("matches preview targets only when deployment.target is null", () => {
		expect(
			deploymentMatchesTarget({
				deployment: { target: null },
				target: "preview",
			}),
		).toBe(true);
		expect(
			deploymentMatchesTarget({
				deployment: { target: "production" },
				target: "preview",
			}),
		).toBe(false);
	});

	it("filters matching ready deployments by commit and target", () => {
		const matches = findMatchingDeployments({
			commitSha: "abc123",
			deployments: [
				{ meta: { githubCommitSha: "abc123" }, state: "READY", target: null },
				{
					meta: { githubCommitSha: "abc123" },
					state: "BUILDING",
					target: null,
				},
				{
					meta: { githubCommitSha: "def456" },
					state: "READY",
					target: null,
				},
			],
			target: "preview",
		});

		expect(matches).toHaveLength(1);
	});

	it("extracts inline aliases safely", () => {
		expect(
			extractInlineDeploymentAliases({
				alias: ["dev.man-meets-ai.com", 123, null],
			}),
		).toEqual(["dev.man-meets-ai.com"]);
	});
});
