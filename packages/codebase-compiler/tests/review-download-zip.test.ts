import JSZip from "jszip";
import { createCompleteProjectDefinition } from "../src";
import { isExcludedSnapshotPath } from "../src/repo-generation/repo-download-source-contract";
import { buildOperatingPackPaths } from "../src/repo-generation/render-starter-operating-pack";
import { buildReviewDownloadZip } from "../src/server";

describe("review download zip", () => {
	it("wraps the snapshot in the repo slug and excludes forbidden files", async () => {
		const projectDefinition = createCompleteProjectDefinition();
		const operatingPackPaths = buildOperatingPackPaths(projectDefinition);
		const allowedGeneratedPaths = new Set([
			"docs/programs/PROGRAMS.md",
			"docs/programs/active/index.md",
			"docs/programs/completed/index.md",
			operatingPackPaths.activeProgramPath,
			operatingPackPaths.planningBriefPath,
			operatingPackPaths.currentPlanningBriefPath,
			"docs/exec-plans/PLANS.md",
			"docs/exec-plans/active/index.md",
			"docs/exec-plans/completed/index.md",
			operatingPackPaths.activeExecPlanPath,
		]);
		const buffer = await buildReviewDownloadZip(projectDefinition);
		const zip = await JSZip.loadAsync(buffer);
		const entries = Object.keys(zip.files).sort();
		const forbiddenEntries = entries.filter((entry) => {
			if (entry.endsWith("/")) {
				return false;
			}
			const relativePath = entry.replace(/^ship-by-sunday-os\//, "");
			return isExcludedSnapshotPath(relativePath, allowedGeneratedPaths);
		});

		expect(entries).toEqual(
			expect.arrayContaining([
				"ship-by-sunday-os/",
				"ship-by-sunday-os/DESIGN.md",
				"ship-by-sunday-os/README.md",
				"ship-by-sunday-os/START-HERE.md",
				"ship-by-sunday-os/bootstrap.sh",
				"ship-by-sunday-os/scripts/install-codex-skills.sh",
				"ship-by-sunday-os/scripts/agentic/check-programs.mjs",
				"ship-by-sunday-os/scripts/agentic/check-exec-plans.mjs",
				"ship-by-sunday-os/.agents/skills/starter-auth-setup/SKILL.md",
				"ship-by-sunday-os/.agents/skills/starter-operating-pack/SKILL.md",
				"ship-by-sunday-os/.agents/skills/external-skills.json",
				"ship-by-sunday-os/apps/web/content/docs/index.mdx",
				"ship-by-sunday-os/apps/web/config/generated-design-system.ts",
				"ship-by-sunday-os/docs/index.md",
				"ship-by-sunday-os/docs/build/docs/prompt.md",
				"ship-by-sunday-os/docs/facts/design-system.json",
				"ship-by-sunday-os/apps/web/.env.production.example",
				"ship-by-sunday-os/docs/testing/README.md",
				"ship-by-sunday-os/docs/programs/PROGRAMS.md",
				`ship-by-sunday-os/${operatingPackPaths.activeProgramPath}`,
				"ship-by-sunday-os/docs/exec-plans/PLANS.md",
				`ship-by-sunday-os/${operatingPackPaths.activeExecPlanPath}`,
			]),
		);
		expect(entries).not.toEqual(
			expect.arrayContaining([
				"ship-by-sunday-os/docs/PLANS.md",
				"ship-by-sunday-os/docs/exec-plans/completed/2026-05-02-reconcile-customer-agentic-source-contract.md",
				"ship-by-sunday-os/docs/programs/active/2026-05-02-customer-agentic-operating-system/program.md",
				"ship-by-sunday-os/docs/programs/completed/2026-05-02-customer-agentic-operating-system/program.md",
			]),
		);
		expect(forbiddenEntries).toEqual([]);
	});
});
