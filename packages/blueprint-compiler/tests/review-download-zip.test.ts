import JSZip from "jszip";
import { createCompleteProjectDefinition } from "../src";
import { isExcludedSnapshotPath } from "../src/repo-generation/repo-download-source-contract";
import { buildReviewDownloadZip } from "../src/server";

describe("review download zip", () => {
	it("wraps the snapshot in the repo slug and excludes forbidden files", async () => {
		const buffer = await buildReviewDownloadZip(
			createCompleteProjectDefinition(),
		);
		const zip = await JSZip.loadAsync(buffer);
		const entries = Object.keys(zip.files).sort();
		const forbiddenEntries = entries.filter((entry) => {
			if (entry.endsWith("/")) {
				return false;
			}
			const relativePath = entry.replace(/^ship-by-sunday-os\//, "");
			return isExcludedSnapshotPath(relativePath);
		});

		expect(entries).toEqual(
			expect.arrayContaining([
				"ship-by-sunday-os/",
				"ship-by-sunday-os/DESIGN.md",
				"ship-by-sunday-os/README.md",
				"ship-by-sunday-os/START-HERE.md",
				"ship-by-sunday-os/bootstrap.sh",
				"ship-by-sunday-os/scripts/install-codex-skills.sh",
				"ship-by-sunday-os/.agents/skills/shared/exec-plan-writer/SKILL.md",
				"ship-by-sunday-os/.agents/skills/shared/land/SKILL.md",
				"ship-by-sunday-os/.agents/skills/starter-auth-setup/SKILL.md",
				"ship-by-sunday-os/.agents/skills/external-skills.json",
				"ship-by-sunday-os/apps/web/content/docs/index.mdx",
				"ship-by-sunday-os/apps/web/config/generated-design-system.ts",
				"ship-by-sunday-os/docs/index.md",
				"ship-by-sunday-os/docs/build/docs/prompt.md",
				"ship-by-sunday-os/docs/facts/design-system.json",
				"ship-by-sunday-os/docs/PLANS.md",
				"ship-by-sunday-os/docs/exec-plans/PLANS.md",
				"ship-by-sunday-os/apps/web/.env.production.example",
				"ship-by-sunday-os/qa/README.md",
			]),
		);
		expect(forbiddenEntries).toEqual([]);
	});
});
